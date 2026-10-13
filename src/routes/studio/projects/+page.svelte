<script lang="ts">
	import { enhance } from '$app/forms';
	import { href } from '$lib/href';
	import { m } from '$lib/paraglide/messages.js';
	import Plus from '@lucide/svelte/icons/plus';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import FolderGit2 from '@lucide/svelte/icons/folder-git-2';
	import type { PageServerData } from './$types';

	let { data }: { data: PageServerData } = $props();
	let dialog = $state<HTMLDialogElement | null>(null);
	let pendingId = $state('');
</script>

<div class="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
	<div>
		<p class="kicker">{m.studio_projects()}</p>
		<h1 class="mt-2 font-serif text-4xl tracking-tight md:text-5xl">{m.studio_projects()}</h1>
		<p class="mt-2 max-w-xl text-quiet">{m.studio_projects_lede()}</p>
	</div>
	<a class="btn btn-rose w-fit" href={href('/studio/projects/new')}>
		<Plus size={16} />
		{m.studio_project_new()}
	</a>
</div>

<div class="mt-8 grid gap-3 sm:grid-cols-3">
	<div class="card p-5">
		<p class="text-sm text-quiet">{m.stat_published()}</p>
		<p class="mt-2 font-serif text-4xl">{data.stats.published}</p>
	</div>
	<div class="card p-5">
		<p class="text-sm text-quiet">{m.stat_drafts()}</p>
		<p class="mt-2 font-serif text-4xl">{data.stats.drafts}</p>
	</div>
	<div class="card p-5">
		<p class="text-sm text-quiet">{m.stat_all()}</p>
		<p class="mt-2 font-serif text-4xl">{data.stats.total}</p>
	</div>
</div>

{#if data.projects.length}
	<div class="mt-6 grid gap-3">
		{#each data.projects as project (project.id)}
			<article class="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
				<div class="min-w-0">
					<div class="flex flex-wrap items-center gap-2 text-xs">
						<span
							class="rounded-full px-2 py-1 {project.status === 'published'
								? 'bg-rose-soft text-rose'
								: 'bg-paper text-quiet'}"
						>
							{project.status === 'published' ? m.status_published() : m.status_draft()}
						</span>
						{#if project.language}
							<span class="text-quiet">{project.language}</span>
						{/if}
						<span class="font-mono text-quiet"
							>{project.owner && project.repo
								? `${project.owner}/${project.repo}`
								: project.repoUrl}</span
						>
					</div>
					<h2 class="mt-2 truncate font-serif text-2xl">{project.title}</h2>
					<p class="mt-1 line-clamp-2 text-sm text-quiet">{project.summary}</p>
				</div>
				<div class="flex shrink-0 gap-2">
					<a
						class="btn btn-ghost px-3 py-2"
						href={href(`/studio/projects/${project.id}`)}
						aria-label={m.action_edit()}
					>
						<Pencil size={16} />
						<span class="hidden sm:inline">{m.action_edit()}</span>
					</a>
					<button
						class="btn btn-danger px-3 py-2"
						type="button"
						aria-label={m.action_delete()}
						onclick={() => {
							pendingId = project.id;
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
		<FolderGit2 class="text-rose" size={22} />
		<h2 class="font-serif text-3xl">{m.project_empty_title()}</h2>
		<p class="text-quiet">{m.studio_projects_lede()}</p>
	</div>
{/if}

<dialog class="sheet" bind:this={dialog}>
	<form method="POST" action="?/remove" class="card p-6" use:enhance>
		<h2 class="font-serif text-3xl">{m.project_delete_title()}</h2>
		<p class="mt-3 text-quiet">{m.project_delete_body()}</p>
		<input type="hidden" name="id" value={pendingId} />
		<div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
			<button class="btn btn-ghost" type="button" onclick={() => dialog?.close()}
				>{m.delete_cancel()}</button
			>
			<button class="btn btn-danger" type="submit">{m.project_delete_confirm()}</button>
		</div>
	</form>
</dialog>
