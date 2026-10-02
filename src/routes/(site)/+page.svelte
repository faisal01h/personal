<script lang="ts">
	import { href } from '$lib/href';
	import { formatDate } from '$lib/format';
	import { readingMinutes } from '$lib/text';
	import { m } from '$lib/paraglide/messages.js';
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import Mail from '@lucide/svelte/icons/mail';
	import GithubIcon from '$lib/components/site/GithubIcon.svelte';
	import LinkedinIcon from '$lib/components/site/LinkedinIcon.svelte';
	import type { PageServerData } from './$types';

	let { data }: { data: PageServerData } = $props();

	const points = [
		{ title: m.about_point_1_title(), body: m.about_point_1_body() },
		{ title: m.about_point_2_title(), body: m.about_point_2_body() },
		{ title: m.about_point_3_title(), body: m.about_point_3_body() }
	];
</script>

<section class="relative overflow-hidden">
	<div class="hero-grid pointer-events-none absolute inset-0" aria-hidden="true"></div>
	<div
		class="relative mx-auto grid max-w-6xl gap-10 px-5 pt-16 pb-20 md:px-8 md:pt-28 md:pb-28 lg:grid-cols-[1.4fr_0.6fr] lg:items-end"
	>
		<div>
			<p class="kicker">{m.hero_kicker()}</p>
			<h1
				class="mt-4 max-w-4xl font-serif text-[clamp(3.4rem,9vw,7rem)] leading-[0.92] tracking-tight"
			>
				Faisal<br />Hanif
			</h1>
			<p class="mt-6 max-w-xl text-lg leading-relaxed text-muted md:text-xl">{m.hero_lede()}</p>
			<div class="mt-8 flex flex-col gap-3 sm:flex-row">
				<a class="btn btn-primary" href={href('/blog')}>{m.hero_writing()}</a>
				<a class="btn btn-ghost" href={href('/#contact')}>{m.hero_contact()}</a>
			</div>
		</div>
		<div class="card p-5 text-sm leading-relaxed text-muted">
			<p class="font-serif text-3xl text-ink">FH</p>
			<p class="mt-4">{m.about_body()}</p>
		</div>
	</div>
</section>

<section id="about" class="border-t border-line">
	<div class="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:px-8 md:py-24 lg:grid-cols-[0.8fr_1.2fr]">
		<div>
			<p class="kicker">{m.about_kicker()}</p>
			<h2 class="mt-3 max-w-sm font-serif text-4xl leading-tight tracking-tight md:text-5xl">
				{m.about_title()}
			</h2>
		</div>
		<div class="grid gap-4 sm:grid-cols-3">
			{#each points as point, index (point.title)}
				<article class="card p-5">
					<p class="text-sm text-rose">0{index + 1}</p>
					<h3 class="mt-6 font-serif text-2xl">{point.title}</h3>
					<p class="mt-3 text-sm leading-relaxed text-muted">{point.body}</p>
				</article>
			{/each}
		</div>
	</div>
</section>

<section id="work" class="border-t border-line">
	<div class="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
		<p class="kicker">{m.work_kicker()}</p>
		<div class="mt-3 flex flex-col justify-between gap-4 md:flex-row md:items-end">
			<h2 class="max-w-xl font-serif text-4xl tracking-tight md:text-5xl">{m.work_title()}</h2>
			<p class="max-w-md text-muted">{m.work_body()}</p>
		</div>
		<div class="mt-10 grid gap-4 lg:grid-cols-5">
			<article class="card flex flex-col justify-between p-6 lg:col-span-3 lg:min-h-72">
				<div>
					<p class="text-sm text-muted">{m.work_site_meta()}</p>
					<h3 class="mt-8 font-serif text-4xl">{m.work_site_title()}</h3>
					<p class="mt-4 max-w-md text-muted">{m.work_site_body()}</p>
				</div>
				<a class="mt-8 inline-flex items-center gap-2 font-medium text-rose" href={href('/blog')}>
					{m.nav_blog()}
					<ArrowUpRight size={16} />
				</a>
			</article>
			<div class="grid gap-4 lg:col-span-2">
				<a
					class="card group flex h-full flex-col justify-between p-6 transition hover:-translate-y-0.5"
					href="https://github.com/faisal01h"
					target="_blank"
					rel="noopener noreferrer"
				>
					<GithubIcon size={22} />
					<div class="mt-10">
						<h3 class="flex items-center gap-2 font-serif text-3xl">
							{m.work_github_title()}
							<ArrowUpRight size={18} class="opacity-0 transition group-hover:opacity-100" />
						</h3>
						<p class="mt-2 text-sm text-muted">{m.work_github_body()}</p>
					</div>
					<span class="sr-only">{m.open_external()}</span>
				</a>
				<a
					class="card group flex h-full flex-col justify-between p-6 transition hover:-translate-y-0.5"
					href="https://www.linkedin.com/in/faisal-hanif"
					target="_blank"
					rel="noopener noreferrer"
				>
					<LinkedinIcon size={22} />
					<div class="mt-10">
						<h3 class="flex items-center gap-2 font-serif text-3xl">
							{m.work_linkedin_title()}
							<ArrowUpRight size={18} class="opacity-0 transition group-hover:opacity-100" />
						</h3>
						<p class="mt-2 text-sm text-muted">{m.work_linkedin_body()}</p>
					</div>
					<span class="sr-only">{m.open_external()}</span>
				</a>
			</div>
		</div>
	</div>
</section>

<section id="writing" class="border-t border-line">
	<div class="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
		<div class="flex items-end justify-between gap-4">
			<div>
				<p class="kicker">{m.writing_kicker()}</p>
				<h2 class="mt-3 font-serif text-4xl tracking-tight md:text-5xl">{m.writing_title()}</h2>
			</div>
			<a class="hidden text-sm font-medium text-rose sm:inline" href={href('/blog')}
				>{m.writing_all()}</a
			>
		</div>
		{#if data.posts.length}
			<div class="mt-10 grid gap-4 md:grid-cols-3">
				{#each data.posts as post (post.id)}
					<a
						class="card flex h-full flex-col p-5 transition hover:-translate-y-0.5"
						href={href(`/blog/${post.slug}`)}
					>
						<p class="text-sm text-muted">
							{formatDate(post.publishedAt)} · {m.reading_time({
								minutes: readingMinutes(post.wordCount)
							})}
						</p>
						<h3 class="mt-6 font-serif text-2xl leading-tight">{post.title}</h3>
						<p class="mt-3 text-sm leading-relaxed text-muted">{post.excerpt}</p>
					</a>
				{/each}
			</div>
		{:else}
			<p class="card mt-10 p-8 text-muted">{m.writing_empty()}</p>
		{/if}
		<a class="btn btn-ghost mt-6 sm:hidden" href={href('/blog')}>{m.writing_all()}</a>
	</div>
</section>

<section id="contact" class="bg-ink text-paper">
	<div
		class="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-16 md:flex-row md:items-end md:justify-between md:px-8 md:py-24"
	>
		<div class="max-w-xl">
			<p class="text-xs font-semibold tracking-[0.16em] text-rose-soft uppercase">
				{m.contact_kicker()}
			</p>
			<h2 class="mt-3 font-serif text-5xl tracking-tight md:text-6xl">{m.contact_title()}</h2>
			<p class="mt-4 text-lg text-paper/75">{m.contact_body()}</p>
		</div>
		<div class="flex flex-col gap-3 sm:flex-row">
			<a class="btn bg-paper text-ink hover:bg-rose-soft" href="mailto:faisal01h@gmail.com">
				<Mail size={16} />
				{m.contact_email()}
			</a>
			<a
				class="btn border border-white/20 text-paper hover:bg-white/10"
				href="https://www.linkedin.com/in/faisal-hanif"
				target="_blank"
				rel="noopener noreferrer"
			>
				<LinkedinIcon size={16} />
				LinkedIn
				<span class="sr-only">{m.open_external()}</span>
			</a>
		</div>
	</div>
</section>
