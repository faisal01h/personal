<script lang="ts">
	import { page } from '$app/state';
	import { deLocalizeUrl } from '$lib/paraglide/runtime';
	import { href } from '$lib/href';
	import { m } from '$lib/paraglide/messages.js';
	import LocaleSwitch from './LocaleSwitch.svelte';
	import Menu from '@lucide/svelte/icons/menu';
	import X from '@lucide/svelte/icons/x';
	import PenLine from '@lucide/svelte/icons/pen-line';

	let open = $state(false);
	const path = $derived(deLocalizeUrl(page.url).pathname);
	const user = $derived(page.data.user);

	const links = $derived([
		{ path: '/#work', label: m.nav_work(), id: 'work' },
		{ path: '/blog', label: m.nav_blog(), id: 'blog' },
		{ path: '/#contact', label: m.nav_contact(), id: 'contact' }
	]);

	function current(id: string) {
		if (id === 'blog') return path === '/blog' || path.startsWith('/blog/');
		return false;
	}

	$effect(() => {
		void path;
		open = false;
	});

	$effect(() => {
		document.body.style.overflow = open ? 'hidden' : '';
		return () => {
			document.body.style.overflow = '';
		};
	});
</script>

<a
	href="#content"
	class="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
>
	{m.skip_to_content()}
</a>

<header class="sticky top-0 z-40 border-b border-line/80 bg-paper/85 backdrop-blur-md">
	<div class="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-5 md:px-8">
		<a href={href('/')} class="font-serif text-xl tracking-tight">Faisal Hanif</a>
		<nav class="hidden items-center gap-7 text-sm text-muted md:flex" aria-label="Primary">
			{#each links as link (link.id)}
				<a
					href={href(link.path)}
					aria-current={current(link.id) ? 'page' : undefined}
					class="transition hover:text-ink {current(link.id) ? 'text-ink' : ''}"
				>
					{link.label}
				</a>
			{/each}
		</nav>
		<div class="flex items-center gap-2">
			<div class="hidden sm:block">
				<LocaleSwitch compact />
			</div>
			{#if user}
				<a href={href('/studio')} class="btn btn-primary hidden px-3 py-2 text-sm sm:inline-flex">
					<PenLine size={16} />
					{m.nav_studio()}
				</a>
			{/if}
			<button
				type="button"
				class="inline-flex size-10 items-center justify-center rounded-full border border-line md:hidden"
				aria-expanded={open}
				aria-label={open ? m.nav_close() : m.nav_menu()}
				onclick={() => (open = !open)}
			>
				{#if open}
					<X size={18} />
				{:else}
					<Menu size={18} />
				{/if}
			</button>
		</div>
	</div>
</header>

{#if open}
	<div class="fixed inset-0 z-30 bg-paper px-5 pt-20 md:hidden">
		<nav class="flex flex-col gap-2 font-serif text-2xl" aria-label="Mobile">
			{#each links as link (link.id)}
				<a href={href(link.path)} class="border-b border-line py-3">{link.label}</a>
			{/each}
			{#if user}
				<a href={href('/studio')} class="border-b border-line py-3">{m.nav_studio()}</a>
			{/if}
		</nav>
		<div class="mt-8">
			<LocaleSwitch />
		</div>
	</div>
{/if}
