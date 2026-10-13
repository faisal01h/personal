<script lang="ts">
	import { enhance } from '$app/forms';
	import { m } from '$lib/paraglide/messages.js';
	import { formErrorMessage } from '$lib/notices';
	import type { ProjectRecord } from '$lib/server/projects';
	import { toast } from '$lib/toast.svelte';
	import { untrack } from 'svelte';

	let { project }: { project: ProjectRecord | null } = $props();
	const initial = untrack(() => project);

	let title = $state(initial?.title ?? '');
	let summary = $state(initial?.summary ?? '');
	let repoUrl = $state(initial?.repoUrl ?? '');
	let siteUrl = $state(initial?.siteUrl ?? '');
	let language = $state(initial?.language ?? '');
	let topics = $state(initial?.topics.join(', ') ?? '');
	let sortOrder = $state(initial?.sortOrder ?? 0);
	let pending = $state(false);

	const published = $derived(project?.status === 'published');
</script>

{#snippet actions()}
	{#if published}
		<button
			class="btn btn-ghost flex-1 md:flex-none"
			type="submit"
			name="intent"
			value="update"
			disabled={pending}
		>
			{pending ? m.action_saving() : m.action_update()}
		</button>
		<button
			class="btn btn-primary flex-1 md:flex-none"
			type="submit"
			name="intent"
			value="unpublish"
			disabled={pending}
		>
			{m.action_unpublish()}
		</button>
	{:else}
		<button
			class="btn btn-ghost flex-1 md:flex-none"
			type="submit"
			name="intent"
			value="draft"
			disabled={pending}
		>
			{pending ? m.action_saving() : m.action_save_draft()}
		</button>
		<button
			class="btn btn-rose flex-1 md:flex-none"
			type="submit"
			name="intent"
			value="publish"
			disabled={pending}
		>
			{m.action_publish()}
		</button>
	{/if}
{/snippet}

<form
	method="POST"
	action="?/save"
	class="space-y-6"
	use:enhance={() => {
		pending = true;
		return async ({ result, update }) => {
			pending = false;
			await update({ reset: false });
			if (result.type === 'failure') {
				const code = (result.data as { error?: string } | undefined)?.error;
				toast.error(formErrorMessage(code));
			}
		};
	}}
>
	<div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
		<div>
			<p class="kicker">{m.studio_projects()}</p>
			<h1 class="mt-2 font-serif text-4xl tracking-tight md:text-5xl">
				{project ? m.project_editor_edit() : m.project_editor_new()}
			</h1>
		</div>
		<div class="hidden gap-2 md:flex">
			{@render actions()}
		</div>
	</div>

	<div class="grid gap-4 md:grid-cols-2">
		<label class="block md:col-span-2">
			<span class="mb-2 block text-sm font-medium">{m.field_title()}</span>
			<input
				class="field font-serif text-xl"
				name="title"
				bind:value={title}
				required
				maxlength="120"
			/>
		</label>
		<label class="block md:col-span-2">
			<span class="mb-2 block text-sm font-medium">{m.project_field_summary()}</span>
			<textarea class="field min-h-28" name="summary" bind:value={summary} maxlength="600"
			></textarea>
		</label>
		<label class="block md:col-span-2">
			<span class="mb-2 block text-sm font-medium">{m.project_field_repo()}</span>
			<input
				class="field font-mono text-sm"
				name="repoUrl"
				type="url"
				inputmode="url"
				autocomplete="url"
				bind:value={repoUrl}
				required
				placeholder="https://github.com/owner/repo"
				spellcheck="false"
			/>
			<span class="mt-2 block text-sm text-quiet">{m.project_field_repo_hint()}</span>
		</label>
		<label class="block">
			<span class="mb-2 block text-sm font-medium">{m.project_field_site()}</span>
			<input
				class="field"
				name="siteUrl"
				type="url"
				inputmode="url"
				autocomplete="url"
				bind:value={siteUrl}
				placeholder="https://"
				spellcheck="false"
			/>
		</label>
		<label class="block">
			<span class="mb-2 block text-sm font-medium">{m.project_field_language()}</span>
			<input class="field" name="language" bind:value={language} maxlength="40" />
		</label>
		<label class="block md:col-span-2">
			<span class="mb-2 block text-sm font-medium">{m.project_field_topics()}</span>
			<input class="field" name="topics" bind:value={topics} />
			<span class="mt-2 block text-sm text-quiet">{m.project_field_topics_hint()}</span>
		</label>
		<label class="block md:max-w-xs">
			<span class="mb-2 block text-sm font-medium">{m.project_field_order()}</span>
			<input
				class="field"
				name="sortOrder"
				type="number"
				min="0"
				max="999"
				bind:value={sortOrder}
			/>
			<span class="mt-2 block text-sm text-quiet">{m.project_field_order_hint()}</span>
		</label>
	</div>

	<div
		class="fixed inset-x-0 bottom-0 z-30 flex gap-2 border-t border-line bg-paper/95 p-3 backdrop-blur md:hidden"
		style="padding-bottom: max(0.75rem, env(safe-area-inset-bottom))"
	>
		{@render actions()}
	</div>
</form>
