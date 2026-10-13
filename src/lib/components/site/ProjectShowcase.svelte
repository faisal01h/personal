<script lang="ts">
	import { reveal } from '$lib/actions/reveal';
	import { m } from '$lib/paraglide/messages.js';
	import type { PublicProject } from '$lib/server/projects';
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import Star from '@lucide/svelte/icons/star';
	import GithubIcon from './GithubIcon.svelte';

	let { projects }: { projects: PublicProject[] } = $props();

	const stars = new Intl.NumberFormat(undefined, { notation: 'compact' });
</script>

<section id="work" class="border-t border-line">
	<div class="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
		<div use:reveal>
			<p class="kicker">{m.work_kicker()}</p>
			<div class="mt-3 flex flex-col justify-between gap-4 md:flex-row md:items-end">
				<h2 class="max-w-xl font-serif text-4xl tracking-tight md:text-5xl">{m.work_title()}</h2>
				<p class="max-w-md text-quiet">{m.work_body()}</p>
			</div>
		</div>

		{#if projects.length}
			<div class="mt-10 grid gap-4">
				{#each projects as project, index (project.id)}
					<article class="project-card card p-6 md:p-8" use:reveal={index * 70}>
						<div class="flex flex-wrap items-center gap-2 text-sm text-quiet">
							{#if project.owner && project.repo}
								<p class="font-mono text-xs">{project.owner}/{project.repo}</p>
							{/if}
							{#if project.language}
								<span class="rounded-full bg-rose-soft px-2 py-0.5 text-xs font-medium text-rose">
									{project.language}
								</span>
							{/if}
							{#if project.stars > 0}
								<span class="inline-flex items-center gap-1">
									<Star size={13} aria-hidden="true" />
									{m.project_stars({ count: stars.format(project.stars) })}
								</span>
							{/if}
						</div>
						<h3 class="mt-5 font-serif text-3xl tracking-tight md:text-4xl">{project.title}</h3>
						{#if project.summary}
							<p class="mt-3 max-w-2xl leading-relaxed text-quiet">{project.summary}</p>
						{/if}
						{#if project.topics.length}
							<ul class="mt-5 flex flex-wrap gap-2">
								{#each project.topics as topic (topic)}
									<li class="rounded-full border border-line px-2.5 py-1 text-xs text-quiet">
										{topic}
									</li>
								{/each}
							</ul>
						{/if}
						<div class="mt-6 flex flex-wrap gap-4 text-sm font-medium">
							<a
								class="inline-flex items-center gap-1.5 text-rose"
								href={project.repoUrl}
								target="_blank"
								rel="external noopener noreferrer"
							>
								{m.project_repo()}
								<ArrowUpRight size={15} aria-hidden="true" />
								<span class="sr-only">: {project.title}. {m.open_external()}</span>
							</a>
							{#if project.siteUrl}
								<a
									class="inline-flex items-center gap-1.5"
									href={project.siteUrl}
									target="_blank"
									rel="external noopener noreferrer"
								>
									{m.project_live()}
									<ArrowUpRight size={15} aria-hidden="true" />
									<span class="sr-only">: {project.title}. {m.open_external()}</span>
								</a>
							{/if}
						</div>
					</article>
				{/each}
			</div>
		{:else}
			<div class="card mt-10 flex flex-col items-start gap-3 p-8" use:reveal>
				<GithubIcon size={22} />
				<h3 class="font-serif text-3xl">{m.project_empty_title()}</h3>
				<p class="max-w-md text-quiet">{m.project_empty_body()}</p>
			</div>
		{/if}

		<a
			class="mt-6 inline-flex items-center gap-2 text-sm font-medium"
			href="https://github.com/faisal01h"
			target="_blank"
			rel="noopener noreferrer"
		>
			<GithubIcon size={16} />
			{m.project_github_all()}
			<span class="sr-only">{m.open_external()}</span>
		</a>
	</div>
</section>
