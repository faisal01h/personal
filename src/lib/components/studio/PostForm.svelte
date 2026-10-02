<script lang="ts">
	import { enhance } from '$app/forms';
	import { m } from '$lib/paraglide/messages.js';
	import { formErrorMessage } from '$lib/notices';
	import { countWords, plainText, slugify } from '$lib/text';
	import type { PostRecord } from '$lib/server/posts';
	import RichEditor from '$lib/components/editor/RichEditor.svelte';
	import { untrack } from 'svelte';
	import { toast } from '$lib/toast.svelte';

	let { post }: { post: PostRecord | null } = $props();
	const initial = untrack(() => post);

	let title = $state(initial?.title ?? '');
	let slug = $state(initial?.slug ?? '');
	let excerpt = $state(initial?.excerpt ?? '');
	let json = $state(initial?.contentJson ?? '');
	let html = $state(initial?.contentHtml ?? '');
	let words = $state(initial?.wordCount ?? countWords(plainText(initial?.contentHtml ?? '')));
	let slugManual = $state(Boolean(initial));
	let pending = $state(false);

	const published = $derived(post?.status === 'published');

	$effect(() => {
		if (slugManual) return;
		slug = title ? slugify(title) : '';
	});
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
			<p class="kicker">{m.studio_kicker()}</p>
			<h1 class="mt-2 font-serif text-4xl tracking-tight md:text-5xl">
				{post ? m.editor_edit_title() : m.editor_new_title()}
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
				maxlength="160"
			/>
		</label>
		<label class="block md:col-span-2">
			<span class="mb-2 block text-sm font-medium">{m.field_slug()}</span>
			<input
				class="field"
				name="slug"
				bind:value={slug}
				oninput={() => (slugManual = true)}
				maxlength="80"
				autocapitalize="off"
				spellcheck="false"
			/>
		</label>
		<label class="block md:col-span-2">
			<span class="mb-2 block text-sm font-medium">{m.field_excerpt()}</span>
			<textarea class="field min-h-24" name="excerpt" bind:value={excerpt} maxlength="280"
			></textarea>
			<span class="mt-2 block text-sm text-muted">{m.field_excerpt_hint()}</span>
		</label>
	</div>

	<div>
		<p class="mb-2 text-sm font-medium">{m.field_body()}</p>
		<RichEditor bind:json bind:html bind:words placeholder={m.editor_placeholder()} />
		<input type="hidden" name="contentJson" value={json} />
		<input type="hidden" name="contentHtml" value={html} />
		<p class="mt-2 text-sm text-muted">{m.editor_hint()}</p>
	</div>

	<div
		class="fixed inset-x-0 bottom-0 z-30 flex gap-2 border-t border-line bg-paper/95 p-3 backdrop-blur md:hidden"
		style="padding-bottom: max(0.75rem, env(safe-area-inset-bottom))"
	>
		{@render actions()}
	</div>
</form>
