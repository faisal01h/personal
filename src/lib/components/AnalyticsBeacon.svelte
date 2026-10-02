<script lang="ts">
	import { page } from '$app/state';
	import { deLocalizeUrl } from '$lib/paraglide/runtime';
	import { onMount } from 'svelte';

	const VISITOR_KEY = 'fh_visitor';

	let currentPath = '/';
	let currentSlug: string | null = null;
	let identity: { visitorId: string; fingerprint: string } | null = null;
	let visibleSince = 0;
	let pendingRead = 0;
	let flushTimer = 0;

	function visitorId() {
		const existing = localStorage.getItem(VISITOR_KEY);
		if (existing) return existing;
		const created = crypto.randomUUID();
		localStorage.setItem(VISITOR_KEY, created);
		return created;
	}

	async function fingerprint() {
		const source = [
			navigator.userAgent,
			navigator.language,
			Intl.DateTimeFormat().resolvedOptions().timeZone,
			screen.width,
			screen.height,
			screen.colorDepth,
			navigator.platform,
			navigator.hardwareConcurrency ?? '',
			navigator.maxTouchPoints ?? ''
		].join('|');
		const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(source));
		return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
	}

	async function who() {
		if (!identity) identity = { visitorId: visitorId(), fingerprint: await fingerprint() };
		return identity;
	}

	function slugFrom(path: string) {
		const match = path.match(/^\/blog\/([a-z0-9-]{1,96})$/);
		return match?.[1] ?? null;
	}

	async function send(partial: {
		kind: 'impression' | 'read' | 'click' | 'video';
		path?: string;
		slug?: string | null;
		label?: string | null;
		target?: string | null;
		durationMs?: number;
	}) {
		if (page.data.user) return;
		const person = await who();
		const body = JSON.stringify({
			...partial,
			path: partial.path ?? currentPath,
			slug: partial.slug === undefined ? currentSlug : partial.slug,
			visitorId: person.visitorId,
			fingerprint: person.fingerprint
		});
		const blob = new Blob([body], { type: 'application/json' });
		if (!navigator.sendBeacon('/api/analytics', blob)) {
			void fetch('/api/analytics', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body,
				keepalive: true
			});
		}
	}

	function accumulateRead() {
		if (!currentSlug || document.visibilityState !== 'visible' || !visibleSince) return;
		pendingRead += performance.now() - visibleSince;
		visibleSince = performance.now();
	}

	function flushRead() {
		accumulateRead();
		if (pendingRead < 500 || !currentSlug) return;
		const durationMs = Math.min(120_000, Math.round(pendingRead));
		pendingRead = 0;
		void send({ kind: 'read', durationMs, slug: currentSlug });
	}

	function interestLabel(url: URL) {
		if (url.protocol === 'mailto:') return 'email';
		const host = url.hostname.replace(/^www\./, '');
		if (host === 'github.com') return 'github';
		if (host.endsWith('linkedin.com')) return 'linkedin';
		return null;
	}

	function onClick(event: MouseEvent) {
		const anchor = (event.target as Element | null)?.closest?.('a[href]');
		if (!(anchor instanceof HTMLAnchorElement)) return;
		let url: URL;
		try {
			url = new URL(anchor.href);
		} catch {
			return;
		}
		const interest = interestLabel(url);
		if (currentPath === '/' && interest) {
			void send({ kind: 'click', label: interest, target: anchor.href, slug: null });
			return;
		}
		if (currentSlug && anchor.closest('.reading')) {
			void send({ kind: 'click', label: 'article', target: anchor.href, slug: currentSlug });
		}
	}

	function bindVideo(video: HTMLVideoElement) {
		if (video.dataset.analytics === '1') return;
		video.dataset.analytics = '1';
		let last = video.currentTime;
		let pending = 0;
		const sample = () => {
			const now = video.currentTime;
			const delta = now - last;
			if (!video.paused && delta > 0 && delta < 2) pending += delta * 1000;
			last = now;
		};
		const flush = () => {
			sample();
			if (pending < 500) return;
			const durationMs = Math.min(120_000, Math.round(pending));
			pending = 0;
			void send({ kind: 'video', durationMs, slug: currentSlug });
		};
		video.addEventListener('timeupdate', sample);
		video.addEventListener('seeked', () => {
			last = video.currentTime;
		});
		video.addEventListener('pause', flush);
		video.addEventListener('ended', flush);
	}

	function watchVideos() {
		document.querySelectorAll('video').forEach((video) => bindVideo(video));
	}

	$effect(() => {
		if (typeof document === 'undefined') return;
		const path = deLocalizeUrl(page.url).pathname;
		if (page.data.user) return;
		currentPath = path;
		currentSlug = slugFrom(path);
		pendingRead = 0;
		visibleSince = document.visibilityState === 'visible' ? performance.now() : 0;
		if (currentSlug) void send({ kind: 'impression', path, slug: currentSlug, durationMs: 0 });
		return () => flushRead();
	});

	onMount(() => {
		document.addEventListener('click', onClick, true);
		document.addEventListener('visibilitychange', () => {
			if (document.visibilityState === 'hidden') {
				flushRead();
				visibleSince = 0;
				return;
			}
			visibleSince = performance.now();
		});
		window.addEventListener('pagehide', flushRead);
		flushTimer = window.setInterval(() => {
			flushRead();
			watchVideos();
		}, 15_000);
		watchVideos();
		const observer = new MutationObserver(watchVideos);
		observer.observe(document.body, { childList: true, subtree: true });
		return () => {
			document.removeEventListener('click', onClick, true);
			window.removeEventListener('pagehide', flushRead);
			window.clearInterval(flushTimer);
			observer.disconnect();
		};
	});
</script>
