<script lang="ts">
	import { href } from '$lib/href';
	import { formatDate } from '$lib/format';
	import { readingMinutes } from '$lib/text';
	import { m } from '$lib/paraglide/messages.js';
	import NotebookPen from '@lucide/svelte/icons/notebook-pen';
	import type { PageServerData } from './$types';

	let { data }: { data: PageServerData } = $props();
</script>

<div class="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-20">
	<p class="kicker">{m.blog_kicker()}</p>
	<h1 class="mt-3 font-serif text-5xl tracking-tight md:text-6xl">{m.blog_title()}</h1>
	<p class="mt-4 max-w-2xl text-lg text-muted">{m.blog_lede()}</p>

	{#if data.posts.length}
		<div class="mt-12 grid gap-4 md:grid-cols-2">
			{#each data.posts as post (post.id)}
				<a
					class="card flex flex-col p-6 transition hover:-translate-y-0.5"
					href={href(`/blog/${post.slug}`)}
				>
					<p class="text-sm text-muted">
						{formatDate(post.publishedAt)} · {m.reading_time({
							minutes: readingMinutes(post.wordCount)
						})}
					</p>
					<h2 class="mt-5 font-serif text-3xl leading-tight">{post.title}</h2>
					<p class="mt-3 leading-relaxed text-muted">{post.excerpt}</p>
				</a>
			{/each}
		</div>
	{:else}
		<div class="card mt-12 flex flex-col items-start gap-3 p-8">
			<NotebookPen size={22} class="text-rose" />
			<h2 class="font-serif text-3xl">{m.blog_empty_title()}</h2>
			<p class="max-w-md text-muted">{m.blog_empty_body()}</p>
		</div>
	{/if}
</div>
