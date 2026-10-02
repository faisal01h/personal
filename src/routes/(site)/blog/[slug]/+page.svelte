<script lang="ts">
	import { href } from '$lib/href';
	import { formatDate } from '$lib/format';
	import { readingMinutes } from '$lib/text';
	import { m } from '$lib/paraglide/messages.js';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import type { PageServerData } from './$types';

	let { data }: { data: PageServerData } = $props();
</script>

<article class="mx-auto max-w-3xl px-5 py-12 md:px-8 md:py-16">
	<a
		class="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-ink"
		href={href('/blog')}
	>
		<ArrowLeft size={16} />
		{m.back_blog()}
	</a>
	<p class="kicker mt-8">{m.blog_kicker()}</p>
	<h1 class="mt-3 font-serif text-[clamp(2.6rem,6vw,4.5rem)] leading-[1.02] tracking-tight">
		{data.post.title}
	</h1>
	<p class="mt-5 text-sm text-muted">
		{formatDate(data.post.publishedAt)} · {m.reading_time({
			minutes: readingMinutes(data.post.wordCount)
		})}
	</p>
	{#if data.post.excerpt}
		<p class="mt-8 text-xl leading-relaxed text-muted">{data.post.excerpt}</p>
	{/if}
	<div class="reading mt-10 border-t border-line pt-8">
		<!-- eslint-disable-next-line svelte/no-at-html-tags -- HTML is sanitized when the post is saved -->
		{@html data.post.contentHtml}
	</div>
</article>
