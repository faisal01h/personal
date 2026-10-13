<script lang="ts">
	import { href } from '$lib/href';
	import { formatDate } from '$lib/format';
	import { readingMinutes } from '$lib/text';
	import { reveal } from '$lib/actions/reveal';
	import { m } from '$lib/paraglide/messages.js';
	import Mail from '@lucide/svelte/icons/mail';
	import GithubIcon from '$lib/components/site/GithubIcon.svelte';
	import LinkedinIcon from '$lib/components/site/LinkedinIcon.svelte';
	import ProjectShowcase from '$lib/components/site/ProjectShowcase.svelte';
	import type { PageServerData } from './$types';

	let { data }: { data: PageServerData } = $props();

	let hero = $state<HTMLElement | null>(null);
	let mx = $state(72);
	let my = $state(28);

	$effect(() => {
		const node = hero;
		if (!node) return;
		const follow = (event: PointerEvent) => {
			if (event.pointerType === 'touch') return;
			const rect = node.getBoundingClientRect();
			mx = ((event.clientX - rect.left) / rect.width) * 100;
			my = ((event.clientY - rect.top) / rect.height) * 100;
		};
		node.addEventListener('pointermove', follow);
		return () => node.removeEventListener('pointermove', follow);
	});
</script>

<section class="relative overflow-hidden" bind:this={hero} style="--mx: {mx}%; --my: {my}%">
	<div class="hero-grid pointer-events-none absolute inset-0" aria-hidden="true"></div>
	<div class="hero-glow pointer-events-none absolute inset-0" aria-hidden="true"></div>
	<svg
		class="hero-stroke pointer-events-none absolute inset-x-0 bottom-0 h-48 w-full md:h-64"
		viewBox="0 0 800 240"
		preserveAspectRatio="none"
		aria-hidden="true"
	>
		<path d="M-10 180 C 140 40, 260 40, 380 140 S 620 220, 820 40" />
	</svg>
	<div class="relative mx-auto max-w-6xl px-5 pt-16 pb-16 md:px-8 md:pt-24 md:pb-20">
		<div>
			<p class="kicker rise" style="animation-delay: 40ms">{m.hero_kicker()}</p>
			<h1
				class="rise mt-4 max-w-4xl font-serif text-[clamp(3.4rem,9vw,6.6rem)] leading-[0.9] tracking-tight"
				style="animation-delay: 120ms"
			>
				Faisal<br />Hanif
			</h1>
			<p
				class="rise mt-5 font-serif text-2xl tracking-tight text-ink md:text-3xl"
				style="animation-delay: 220ms"
			>
				{m.hero_role()}
			</p>
			<p
				class="rise mt-4 max-w-xl text-lg leading-relaxed text-quiet md:text-xl"
				style="animation-delay: 300ms"
			>
				{m.hero_lede()}
			</p>
			<div class="rise mt-8 flex flex-col gap-3 sm:flex-row" style="animation-delay: 380ms">
				<a class="btn btn-primary" href={href('/#work')}>{m.hero_projects()}</a>
				<a class="btn btn-ghost" href={href('/blog')}>{m.hero_writing()}</a>
			</div>
			<ul
				class="rise mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium"
				style="animation-delay: 460ms"
			>
				<li>
					<a
						class="inline-flex items-center gap-2 hover:text-rose"
						href="https://github.com/faisal01h"
						target="_blank"
						rel="noopener noreferrer"
					>
						<GithubIcon size={16} />
						GitHub
						<span class="sr-only">{m.open_external()}</span>
					</a>
				</li>
				<li>
					<a
						class="inline-flex items-center gap-2 hover:text-rose"
						href="https://www.linkedin.com/in/faisal-hanif"
						target="_blank"
						rel="noopener noreferrer"
					>
						<LinkedinIcon size={16} />
						LinkedIn
						<span class="sr-only">{m.open_external()}</span>
					</a>
				</li>
				<li>
					<a
						class="inline-flex items-center gap-2 hover:text-rose"
						href="mailto:faisal01h@gmail.com"
					>
						<Mail size={16} />
						{m.contact_email()}
					</a>
				</li>
			</ul>
		</div>
	</div>
</section>

<ProjectShowcase projects={data.projects} />

<section id="writing" class="border-t border-line">
	<div class="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
		<div class="flex items-end justify-between gap-4" use:reveal>
			<div>
				<p class="kicker">{m.writing_kicker()}</p>
				<h2 class="mt-3 font-serif text-4xl tracking-tight md:text-5xl">{m.writing_title()}</h2>
			</div>
			<a class="hidden text-sm font-medium text-rose sm:inline" href={href('/blog')}
				>{m.writing_all()}</a
			>
		</div>
		{#if data.posts.length}
			<div class="mt-10 grid gap-4 md:grid-cols-3">
				{#each data.posts as post, index (post.id)}
					<a
						class="card flex h-full flex-col p-5 transition hover:-translate-y-0.5"
						href={href(`/blog/${post.slug}`)}
						use:reveal={index * 70}
					>
						<p class="text-sm text-quiet">
							{formatDate(post.publishedAt)} · {m.reading_time({
								minutes: readingMinutes(post.wordCount)
							})}
						</p>
						<h3 class="mt-6 font-serif text-2xl leading-tight">{post.title}</h3>
						<p class="mt-3 text-sm leading-relaxed text-quiet">{post.excerpt}</p>
					</a>
				{/each}
			</div>
		{:else}
			<p class="card mt-10 p-8 text-quiet">{m.writing_empty()}</p>
		{/if}
		<a class="btn btn-ghost mt-6 sm:hidden" href={href('/blog')}>{m.writing_all()}</a>
	</div>
</section>

<section id="contact" class="bg-ink text-paper">
	<div
		class="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-16 md:flex-row md:items-end md:justify-between md:px-8 md:py-24"
	>
		<div class="max-w-xl">
			<p class="text-xs font-semibold tracking-[0.16em] text-rose-soft uppercase">
				{m.contact_kicker()}
			</p>
			<h2 class="mt-3 font-serif text-5xl tracking-tight md:text-6xl">{m.contact_title()}</h2>
			<p class="mt-4 text-lg leading-relaxed text-paper/80">{m.contact_body()}</p>
		</div>
		<div class="flex flex-col gap-3 sm:flex-row">
			<a class="btn bg-paper text-ink hover:bg-rose-soft" href="mailto:faisal01h@gmail.com">
				<Mail size={16} />
				{m.contact_email()}
			</a>
			<a
				class="btn border border-white/25 text-paper hover:bg-white/10"
				href="https://www.linkedin.com/in/faisal-hanif"
				target="_blank"
				rel="noopener noreferrer"
			>
				<LinkedinIcon size={16} />
				LinkedIn
				<span class="sr-only">{m.open_external()}</span>
			</a>
			<a
				class="btn border border-white/25 text-paper hover:bg-white/10"
				href="https://github.com/faisal01h"
				target="_blank"
				rel="noopener noreferrer"
			>
				<GithubIcon size={16} />
				GitHub
				<span class="sr-only">{m.open_external()}</span>
			</a>
		</div>
	</div>
</section>
