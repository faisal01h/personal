<script lang="ts">
	import { href } from '$lib/href';
	import { formatDate, isoDate } from '$lib/format';
	import { readingMinutes } from '$lib/text';
	import { m } from '$lib/paraglide/messages.js';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import ReadingProgress from '$lib/components/site/ReadingProgress.svelte';
	import type { PageServerData } from './$types';

	let { data }: { data: PageServerData } = $props();
	let article = $state<HTMLElement | null>(null);
	const language = $derived(data.post.locale === 'id' ? m.lang_id() : m.lang_en());
</script>

<ReadingProgress {article} />

<article class="mx-auto w-full max-w-[44rem] px-5 py-12 md:px-8 md:py-16" bind:this={article}>
	<a
		class="inline-flex items-center gap-2 text-sm font-medium text-quiet hover:text-ink"
		href={href('/blog')}
	>
		<ArrowLeft size={16} aria-hidden="true" />
		{m.back_blog()}
	</a>
	<header class="mt-8">
		<p class="kicker">{m.blog_kicker()}</p>
		<h1
			class="mt-3 font-serif text-[clamp(2.4rem,6vw,4rem)] leading-[1.08] tracking-tight text-balance"
		>
			{data.post.title}
		</h1>
		<p class="mt-5 flex flex-wrap gap-x-2 gap-y-1 text-sm text-quiet">
			<time datetime={isoDate(data.post.publishedAt)}>{formatDate(data.post.publishedAt)}</time>
			·
			<span>{m.reading_time({ minutes: readingMinutes(data.post.wordCount) })}</span>
			·
			<span>{m.post_language({ language })}</span>
		</p>
		{#if data.post.excerpt}
			<p class="mt-8 text-xl leading-relaxed text-quiet">{data.post.excerpt}</p>
		{/if}
	</header>
	<div class="reading mt-10 border-t border-line pt-8">
		<!-- eslint-disable-next-line svelte/no-at-html-tags -- HTML is sanitized when the post is saved -->
		{@html data.post.contentHtml}
	</div>
</article>
