<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { deLocalizeUrl } from '$lib/paraglide/runtime';
	import { href } from '$lib/href';
	import { m } from '$lib/paraglide/messages.js';
	import LocaleSwitch from '$lib/components/site/LocaleSwitch.svelte';
	import ChartColumn from '@lucide/svelte/icons/chart-column';
	import FolderGit2 from '@lucide/svelte/icons/folder-git-2';
	import Library from '@lucide/svelte/icons/library';
	import Plus from '@lucide/svelte/icons/plus';
	import LogOut from '@lucide/svelte/icons/log-out';
	import Menu from '@lucide/svelte/icons/menu';
	import X from '@lucide/svelte/icons/x';
	import type { LayoutServerData } from './$types';

	let { data, children }: { data: LayoutServerData; children: import('svelte').Snippet } = $props();
	let open = $state(false);
	const path = $derived(deLocalizeUrl(page.url).pathname);

	$effect(() => {
		void path;
		open = false;
	});
</script>

<div class="min-h-dvh md:grid md:grid-cols-[16rem_1fr]">
	<aside
		class="fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-line bg-paper p-5 transition md:static md:w-auto md:translate-x-0 {open
			? 'translate-x-0'
			: '-translate-x-full'}"
	>
		<a href={href('/')} class="font-serif text-2xl tracking-tight">Faisal Hanif</a>
		<p class="mt-1 text-sm text-muted">{m.studio_kicker()}</p>
		<nav class="mt-8 flex flex-col gap-1 text-sm" aria-label="Studio">
			<a
				class="flex items-center gap-2 rounded-xl px-3 py-2 {path === '/studio'
					? 'bg-ink text-paper'
					: 'hover:bg-raised'}"
				href={href('/studio')}
			>
				<Library size={16} />
				{m.studio_overview()}
			</a>
			<a
				class="flex items-center gap-2 rounded-xl px-3 py-2 {path.startsWith('/studio/posts')
					? 'bg-ink text-paper'
					: 'hover:bg-raised'}"
				href={href('/studio/posts/new')}
			>
				<Plus size={16} />
				{m.studio_new()}
			</a>
			<a
				class="flex items-center gap-2 rounded-xl px-3 py-2 {path.startsWith('/studio/projects')
					? 'bg-ink text-paper'
					: 'hover:bg-raised'}"
				href={href('/studio/projects')}
			>
				<FolderGit2 size={16} />
				{m.studio_projects()}
			</a>
			<a
				class="flex items-center gap-2 rounded-xl px-3 py-2 {path.startsWith('/studio/analytics')
					? 'bg-ink text-paper'
					: 'hover:bg-raised'}"
				href={href('/studio/analytics')}
			>
				<ChartColumn size={16} />
				{m.studio_analytics()}
			</a>
		</nav>
		<div class="mt-auto space-y-4">
			<LocaleSwitch />
			<p class="truncate text-sm text-muted">{data.user.name}</p>
			<form method="POST" action="{href('/studio')}?/signOut" use:enhance>
				<button class="btn btn-ghost w-full" type="submit">
					<LogOut size={16} />
					{m.studio_sign_out()}
				</button>
			</form>
		</div>
	</aside>

	{#if open}
		<button
			type="button"
			class="fixed inset-0 z-30 bg-ink/40 md:hidden"
			aria-label={m.nav_close()}
			onclick={() => (open = false)}
		></button>
	{/if}

	<div class="min-w-0">
		<div class="flex items-center justify-between border-b border-line px-4 py-3 md:hidden">
			<a href={href('/')} class="font-serif text-lg">Studio</a>
			<button
				type="button"
				class="inline-flex size-10 items-center justify-center rounded-full border border-line"
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
		<div class="px-4 py-6 pb-28 sm:px-6 md:px-10 md:py-10 md:pb-10">
			{@render children()}
		</div>
	</div>
</div>
