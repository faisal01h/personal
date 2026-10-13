<script lang="ts">
	import { enhance } from '$app/forms';
	import ProjectForm from '$lib/components/studio/ProjectForm.svelte';
	import { m } from '$lib/paraglide/messages.js';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import type { PageServerData } from './$types';

	let { data }: { data: PageServerData } = $props();
	let dialog = $state<HTMLDialogElement | null>(null);
</script>

{#key `${data.project?.id ?? 'new'}-${data.project?.updatedAt ?? ''}`}
	<ProjectForm project={data.project} />
{/key}

{#if data.project}
	<div class="mt-10 border-t border-line pt-6">
		<button class="btn btn-danger" type="button" onclick={() => dialog?.showModal()}>
			<Trash2 size={16} />
			{m.action_delete()}
		</button>
	</div>
	<dialog class="sheet" bind:this={dialog}>
		<form method="POST" action="?/remove" class="card p-6" use:enhance>
			<h2 class="font-serif text-3xl">{m.project_delete_title()}</h2>
			<p class="mt-3 text-quiet">{m.project_delete_body()}</p>
			<div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
				<button class="btn btn-ghost" type="button" onclick={() => dialog?.close()}
					>{m.delete_cancel()}</button
				>
				<button class="btn btn-danger" type="submit">{m.project_delete_confirm()}</button>
			</div>
		</form>
	</dialog>
{/if}
