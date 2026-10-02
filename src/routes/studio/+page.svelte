<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { href } from '$lib/href';
	import { formatDate } from '$lib/format';
	import { m } from '$lib/paraglide/messages.js';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import Plus from '@lucide/svelte/icons/plus';
	import Search from '@lucide/svelte/icons/search';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Eye from '@lucide/svelte/icons/eye';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import FileText from '@lucide/svelte/icons/file-text';
	import type { PageServerData } from './$types';

	let { data }: { data: PageServerData } = $props();
	let dialog = $state<HTMLDialogElement | null>(null);
	let pendingId = $state('');

	function filterHref(patch: Record<string, string>) {
		const params = new SvelteURLSearchParams();
		const next = { ...data.filters, ...patch };
		if (next.q) params.set('q', next.q);
		if (next.status && next.status !== 'all') params.set('status', next.status);
		const query = params.toString();
		return href(query ? `/studio?${query}` : '/studio');
	}

	const statuses = [
		{ id: 'all', label: m.filter_all() },
		{ id: 'published', label: m.filter_published() },
		{ id: 'draft', label: m.filter_drafts() }
	];
</script>

<div class="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
	<div>
		<p class="kicker">{m.studio_kicker()}</p>
		<h1 class="mt-2 font-serif text-4xl tracking-tight md:text-5xl">
			{m.studio_greeting({ name: page.data.user?.name ?? '' })}
		</h1>
		<p class="mt-2 text-muted">{m.studio_lede()}</p>
	</div>
	<a class="btn btn-rose w-fit" href={href('/studio/posts/new')}>
		<Plus size={16} />
		{m.studio_new()}
	</a>
</div>

<div class="mt-8 grid gap-3 sm:grid-cols-3">
	<div class="card p-5">
		<p class="text-sm text-muted">{m.stat_published()}</p>
		<p class="mt-2 font-serif text-4xl">{data.stats.published}</p>
	</div>
	<div class="card p-5">
		<p class="text-sm text-muted">{m.stat_drafts()}</p>
		<p class="mt-2 font-serif text-4xl">{data.stats.drafts}</p>
	</div>
	<div class="card p-5">
		<p class="text-sm text-muted">{m.stat_total()}</p>
		<p class="mt-2 font-serif text-4xl">{data.stats.total}</p>
	</div>
</div>

<form
	class="mt-8 flex flex-col gap-3 lg:flex-row lg:items-center"
	method="GET"
	action={href('/studio')}
>
	<label class="relative block flex-1">
		<span class="sr-only">{m.search_label()}</span>
		<Search
			class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted"
			size={16}
		/>
		<input
			class="field pl-10"
			name="q"
			value={data.filters.q}
			placeholder={m.search_placeholder()}
		/>
	</label>
	{#if data.filters.status !== 'all'}
		<input type="hidden" name="status" value={data.filters.status} />
	{/if}
	<button class="btn btn-ghost" type="submit">{m.search_submit()}</button>
</form>

<div class="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
	<div class="flex flex-wrap gap-2" role="group" aria-label={m.filter_all()}>
		{#each statuses as status (status.id)}
			<a
				class="rounded-full border px-3 py-1.5 text-sm {data.filters.status === status.id
					? 'border-ink bg-ink text-paper'
					: 'border-line hover:border-ink'}"
				href={filterHref({ status: status.id })}
			>
				{status.label}
			</a>
		{/each}
	</div>
</div>

{#if data.posts.length}
	<div class="mt-6 grid gap-3">
		{#each data.posts as post (post.id)}
			<article class="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
				<div class="min-w-0">
					<div class="flex flex-wrap items-center gap-2 text-xs">
						<span
							class="rounded-full px-2 py-1 {post.status === 'published'
								? 'bg-rose-soft text-rose'
								: 'bg-paper text-muted'}"
						>
							{post.status === 'published' ? m.status_published() : m.status_draft()}
						</span>
						<span class="text-muted">{formatDate(post.updatedAt)}</span>
					</div>
					<h2 class="mt-2 truncate font-serif text-2xl">{post.title}</h2>
					<p class="mt-1 line-clamp-2 text-sm text-muted">{post.excerpt}</p>
				</div>
				<div class="flex shrink-0 gap-2">
					<a
						class="btn btn-ghost px-3 py-2"
						href={href(`/studio/posts/${post.id}`)}
						aria-label={m.action_edit()}
					>
						<Pencil size={16} />
						<span class="hidden sm:inline">{m.action_edit()}</span>
					</a>
					{#if post.status === 'published'}
						<a
							class="btn btn-ghost px-3 py-2"
							href={href(`/blog/${post.slug}`)}
							aria-label={m.action_view()}
						>
							<Eye size={16} />
							<span class="hidden sm:inline">{m.action_view()}</span>
						</a>
					{/if}
					<button
						class="btn btn-danger px-3 py-2"
						type="button"
						aria-label={m.action_delete()}
						onclick={() => {
							pendingId = post.id;
							dialog?.showModal();
						}}
					>
						<Trash2 size={16} />
					</button>
				</div>
			</article>
		{/each}
	</div>
{:else}
	<div class="card mt-6 flex flex-col items-start gap-3 p-8">
		<FileText class="text-rose" size={22} />
		<h2 class="font-serif text-3xl">{m.empty_studio_title()}</h2>
		<p class="text-muted">{m.empty_studio_body()}</p>
	</div>
{/if}

<dialog class="sheet" bind:this={dialog}>
	<form method="POST" action="?/remove" class="card p-6" use:enhance>
		<h2 class="font-serif text-3xl">{m.delete_title()}</h2>
		<p class="mt-3 text-muted">{m.delete_body()}</p>
		<input type="hidden" name="id" value={pendingId} />
		<div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
			<button class="btn btn-ghost" type="button" onclick={() => dialog?.close()}>
				{m.delete_cancel()}
			</button>
			<button class="btn btn-danger" type="submit">{m.delete_confirm()}</button>
		</div>
	</form>
</dialog>
