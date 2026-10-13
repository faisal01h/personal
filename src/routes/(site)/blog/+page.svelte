<script lang="ts">
	import { href } from '$lib/href';
	import { formatDate, isoDate } from '$lib/format';
	import { readingMinutes } from '$lib/text';
	import { m } from '$lib/paraglide/messages.js';
	import NotebookPen from '@lucide/svelte/icons/notebook-pen';
	import type { PageServerData } from './$types';

	let { data }: { data: PageServerData } = $props();
	const featured = $derived(data.posts[0]);
	const rest = $derived(data.posts.slice(1));
</script>

<div class="mx-auto max-w-3xl px-5 py-14 md:px-8 md:py-20">
	<header class="max-w-[42rem]">
		<p class="kicker">{m.blog_kicker()}</p>
		<h1 class="mt-3 font-serif text-5xl tracking-tight text-balance md:text-6xl">
			{m.blog_title()}
		</h1>
		<p class="mt-4 text-lg leading-relaxed text-quiet">{m.blog_lede()}</p>
	</header>

	{#if featured}
		<ol class="mt-12 divide-y divide-line border-y border-line">
			<li>
				<a class="group block py-8 md:py-10" href={href(`/blog/${featured.slug}`)}>
					<p class="text-sm text-quiet">
						<span class="font-medium text-rose">{m.blog_latest()}</span>
						·
						<time datetime={isoDate(featured.publishedAt)}>{formatDate(featured.publishedAt)}</time>
						·
						{m.reading_time({ minutes: readingMinutes(featured.wordCount) })}
					</p>
					<h2
						class="mt-3 font-serif text-4xl leading-tight tracking-tight text-balance group-hover:text-rose md:text-5xl"
					>
						{featured.title}
					</h2>
					{#if featured.excerpt}
						<p class="mt-4 max-w-[42rem] text-lg leading-relaxed text-quiet">{featured.excerpt}</p>
					{/if}
				</a>
			</li>
			{#each rest as post (post.id)}
				<li>
					<a class="group block py-7" href={href(`/blog/${post.slug}`)}>
						<p class="text-sm text-quiet">
							<time datetime={isoDate(post.publishedAt)}>{formatDate(post.publishedAt)}</time>
							·
							{m.reading_time({ minutes: readingMinutes(post.wordCount) })}
						</p>
						<h2
							class="mt-2 font-serif text-2xl leading-snug tracking-tight text-balance group-hover:text-rose md:text-3xl"
						>
							{post.title}
						</h2>
						{#if post.excerpt}
							<p class="mt-2 max-w-[42rem] leading-relaxed text-quiet">{post.excerpt}</p>
						{/if}
					</a>
				</li>
			{/each}
		</ol>
	{:else}
		<div class="mt-12 flex flex-col items-start gap-3 border-y border-line py-10">
			<NotebookPen size={22} class="text-rose" />
			<h2 class="font-serif text-3xl">{m.blog_empty_title()}</h2>
			<p class="max-w-md leading-relaxed text-quiet">{m.blog_empty_body()}</p>
		</div>
	{/if}
</div>
