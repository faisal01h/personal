<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { safeNext } from '$lib/href';
	import { formErrorMessage } from '$lib/notices';
	import { m } from '$lib/paraglide/messages.js';
	import { toast } from '$lib/toast.svelte';
	import LockKeyhole from '@lucide/svelte/icons/lock-keyhole';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
	let pending = $state(false);
	const next = $derived(safeNext(page.url.searchParams.get('next')));
</script>

<div class="mx-auto flex min-h-[calc(100dvh-8rem)] max-w-6xl items-center px-5 py-12 md:px-8">
	<div class="grid w-full gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
		<div class="hidden lg:block">
			<p class="kicker">{m.login_kicker()}</p>
			<h1 class="mt-4 font-serif text-6xl tracking-tight">{m.login_title()}</h1>
			<p class="mt-4 max-w-sm text-lg text-muted">{m.login_lede()}</p>
		</div>
		<div class="card mx-auto w-full max-w-md p-6 sm:p-8">
			<div class="mb-6 flex size-11 items-center justify-center rounded-2xl bg-rose-soft text-rose">
				<LockKeyhole size={20} />
			</div>
			<h1 class="font-serif text-4xl lg:hidden">{m.login_title()}</h1>
			<p class="mt-2 text-sm text-muted lg:hidden">{m.login_lede()}</p>
			<form
				class="mt-6 space-y-4"
				method="POST"
				use:enhance={() => {
					pending = true;
					return async ({ result, update }) => {
						pending = false;
						await update();
						if (result.type === 'failure') {
							const code = (result.data as { error?: string } | undefined)?.error;
							toast.error(formErrorMessage(code));
						}
					};
				}}
			>
				<input type="hidden" name="next" value={next} />
				<label class="block">
					<span class="mb-2 block text-sm font-medium">{m.login_email()}</span>
					<input class="field" type="email" name="email" autocomplete="username" required />
				</label>
				<label class="block">
					<span class="mb-2 block text-sm font-medium">{m.login_password()}</span>
					<input
						class="field"
						type="password"
						name="password"
						autocomplete="current-password"
						required
					/>
				</label>
				{#if form?.error}
					<p class="text-sm text-rose">{formErrorMessage(form.error)}</p>
				{/if}
				<button class="btn btn-primary w-full" type="submit" disabled={pending}>
					{pending ? m.login_pending() : m.login_submit()}
				</button>
			</form>
		</div>
	</div>
</div>
