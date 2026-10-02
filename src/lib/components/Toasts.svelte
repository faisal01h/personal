<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';
	import { toast } from '$lib/toast.svelte';
	import CircleCheck from '@lucide/svelte/icons/circle-check';
	import CircleAlert from '@lucide/svelte/icons/circle-alert';
	import Info from '@lucide/svelte/icons/info';
	import X from '@lucide/svelte/icons/x';
</script>

<div
	class="pointer-events-none fixed inset-x-0 top-4 z-[80] flex flex-col items-center gap-2 px-4"
	aria-live="polite"
>
	{#each toast.items as item (item.id)}
		<div
			class="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border px-4 py-3 shadow-[0_16px_40px_-24px_rgba(28,22,20,0.7)]
				{item.kind === 'error'
				? 'border-rose/30 bg-rose text-white'
				: item.kind === 'success'
					? 'border-ink bg-ink text-paper'
					: 'border-line bg-raised text-ink'}"
			role="status"
		>
			{#if item.kind === 'success'}
				<CircleCheck size={18} class="mt-0.5 shrink-0" />
			{:else if item.kind === 'error'}
				<CircleAlert size={18} class="mt-0.5 shrink-0" />
			{:else}
				<Info size={18} class="mt-0.5 shrink-0" />
			{/if}
			<p class="flex-1 text-sm leading-5">{item.message}</p>
			<button
				type="button"
				class="rounded-full p-1 opacity-70 hover:opacity-100"
				aria-label={m.nav_close()}
				onclick={() => toast.dismiss(item.id)}
			>
				<X size={14} />
			</button>
		</div>
	{/each}
</div>
