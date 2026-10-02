<script lang="ts">
	import { enhance } from '$app/forms';
	import PostForm from '$lib/components/studio/PostForm.svelte';
	import { m } from '$lib/paraglide/messages.js';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import type { PageServerData } from './$types';

	let { data }: { data: PageServerData } = $props();
	let dialog = $state<HTMLDialogElement | null>(null);
</script>

{#key `${data.post?.id ?? 'new'}-${data.post?.updatedAt ?? ''}`}
	<PostForm post={data.post} />
{/key}

{#if data.post}
	<div class="mt-10 border-t border-line pt-6">
		<button class="btn btn-danger" type="button" onclick={() => dialog?.showModal()}>
			<Trash2 size={16} />
			{m.action_delete()}
		</button>
	</div>
	<dialog class="sheet" bind:this={dialog}>
		<form method="POST" action="?/remove" class="card p-6" use:enhance>
			<h2 class="font-serif text-3xl">{m.delete_title()}</h2>
			<p class="mt-3 text-muted">{m.delete_body()}</p>
			<div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
				<button class="btn btn-ghost" type="button" onclick={() => dialog?.close()}>
					{m.delete_cancel()}
				</button>
				<button class="btn btn-danger" type="submit">{m.delete_confirm()}</button>
			</div>
		</form>
	</dialog>
{/if}
