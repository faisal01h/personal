<script lang="ts">
	import { getLocale, locales, setLocale } from '$lib/paraglide/runtime';
	import { m } from '$lib/paraglide/messages.js';

	const labels: Record<string, () => string> = {
		en: () => m.lang_en(),
		id: () => m.lang_id()
	};

	let { compact = false }: { compact?: boolean } = $props();
</script>

<div class="flex items-center gap-1" role="group" aria-label={m.language_label()}>
	{#each locales as locale (locale)}
		<button
			type="button"
			onclick={() => setLocale(locale)}
			aria-pressed={locale === getLocale()}
			class="rounded-full border px-2.5 py-1 text-xs font-semibold tracking-wide transition
				{locale === getLocale()
				? 'border-ink bg-ink text-paper'
				: 'border-line text-muted hover:border-ink hover:text-ink'}
				{compact ? 'uppercase' : ''}"
		>
			{compact ? locale : (labels[locale]?.() ?? locale)}
		</button>
	{/each}
</div>
