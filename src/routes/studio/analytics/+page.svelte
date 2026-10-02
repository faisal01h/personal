<script lang="ts">
	import { href } from '$lib/href';
	import { getLocale } from '$lib/paraglide/runtime';
	import { m } from '$lib/paraglide/messages.js';
	import type { PageServerData } from './$types';

	let { data }: { data: PageServerData } = $props();

	const ranges = [
		{ id: '7', label: m.analytics_range_7() },
		{ id: '30', label: m.analytics_range_30() },
		{ id: 'all', label: m.analytics_range_all() }
	];

	const names = $derived(new Intl.DisplayNames([getLocale()], { type: 'region' }));

	function countryName(code: string | null) {
		if (!code) return m.analytics_unknown();
		try {
			return names.of(code) ?? code;
		} catch {
			return code;
		}
	}

	function placeName(city: string | null, region: string | null, country: string | null) {
		const parts = [city, region, country ? countryName(country) : null].filter(Boolean);
		return parts.length ? parts.join(', ') : m.analytics_unknown();
	}

	function duration(ms: number) {
		if (!ms) return m.analytics_none();
		const total = Math.round(ms / 1000);
		const hours = Math.floor(total / 3600);
		const minutes = Math.floor((total % 3600) / 60);
		const seconds = total % 60;
		if (hours) return m.analytics_hours({ hours, minutes });
		if (minutes) return m.analytics_minutes({ minutes, seconds });
		return m.analytics_seconds({ seconds });
	}

	function interestLabel(label: string) {
		if (label === 'github') return m.analytics_click_github();
		if (label === 'linkedin') return m.analytics_click_linkedin();
		if (label === 'email') return m.analytics_click_email();
		return label;
	}

	const interestClicks = $derived(data.report.interest.reduce((sum, item) => sum + item.clicks, 0));
	const countryMax = $derived(Math.max(1, ...data.report.countries.map((item) => item.visitors)));
	const cityMax = $derived(Math.max(1, ...data.report.cities.map((item) => item.visitors)));
	const hasVisits = $derived(
		data.report.uniqueVisitors > 0 || data.report.impressions > 0 || interestClicks > 0
	);
</script>

<div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
	<div>
		<p class="kicker">{m.studio_kicker()}</p>
		<h1 class="mt-2 font-serif text-4xl tracking-tight md:text-5xl">{m.analytics_title()}</h1>
		<p class="mt-2 max-w-2xl text-muted">{m.analytics_lede()}</p>
	</div>
	<div class="flex flex-wrap gap-2" role="group" aria-label={m.analytics_title()}>
		{#each ranges as range (range.id)}
			<a
				class="rounded-full border px-3 py-1.5 text-sm {data.range === range.id
					? 'border-ink bg-ink text-paper'
					: 'border-line hover:border-ink'}"
				href={href(range.id === '30' ? '/studio/analytics' : `/studio/analytics?range=${range.id}`)}
			>
				{range.label}
			</a>
		{/each}
	</div>
</div>

<div class="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
	<article class="card p-5">
		<p class="text-sm text-muted">{m.analytics_impressions()}</p>
		<p class="mt-2 font-serif text-4xl">{data.report.impressions}</p>
		<p class="mt-2 text-sm text-muted">{m.analytics_impressions_hint()}</p>
	</article>
	<article class="card p-5">
		<p class="text-sm text-muted">{m.analytics_unique()}</p>
		<p class="mt-2 font-serif text-4xl">{data.report.uniqueVisitors}</p>
		<p class="mt-2 text-sm text-muted">{m.analytics_unique_hint()}</p>
	</article>
	<article class="card p-5">
		<p class="text-sm text-muted">{m.analytics_read_total()}</p>
		<p class="mt-2 font-serif text-4xl">{duration(data.report.readMs)}</p>
		<p class="mt-2 text-sm text-muted">{m.analytics_read_hint()}</p>
	</article>
	<article class="card p-5">
		<p class="text-sm text-muted">{m.analytics_read_avg()}</p>
		<p class="mt-2 font-serif text-4xl">{duration(data.report.averageReadMs)}</p>
	</article>
	<article class="card p-5">
		<p class="text-sm text-muted">{m.analytics_video()}</p>
		<p class="mt-2 font-serif text-4xl">{duration(data.report.videoMs)}</p>
	</article>
	<article class="card p-5">
		<p class="text-sm text-muted">{m.analytics_interest()}</p>
		<p class="mt-2 font-serif text-4xl">{interestClicks}</p>
		<p class="mt-2 text-sm text-muted">{m.analytics_interest_hint()}</p>
	</article>
</div>

{#if !hasVisits}
	<p class="card mt-6 p-8 text-muted">{m.analytics_empty()}</p>
{:else}
	<div class="mt-6 grid gap-4 lg:grid-cols-2">
		<section class="card p-5">
			<h2 class="font-serif text-2xl">{m.analytics_countries()}</h2>
			<ul class="mt-4 space-y-3">
				{#each data.report.countries as row (`${row.country}`)}
					<li>
						<div class="mb-1 flex items-baseline justify-between gap-3 text-sm">
							<span>{countryName(row.country)}</span>
							<span class="text-muted">{m.analytics_visitors({ count: row.visitors })}</span>
						</div>
						<div class="h-2 overflow-hidden rounded-full bg-paper">
							<div
								class="h-full rounded-full bg-rose"
								style:width="{(row.visitors / countryMax) * 100}%"
							></div>
						</div>
					</li>
				{:else}
					<li class="text-sm text-muted">{m.analytics_empty()}</li>
				{/each}
			</ul>
		</section>
		<section class="card p-5">
			<h2 class="font-serif text-2xl">{m.analytics_cities()}</h2>
			<ul class="mt-4 space-y-3">
				{#each data.report.cities as row (`${row.city}-${row.region}-${row.country}`)}
					<li>
						<div class="mb-1 flex items-baseline justify-between gap-3 text-sm">
							<span>{placeName(row.city, row.region, row.country)}</span>
							<span class="text-muted">{m.analytics_visitors({ count: row.visitors })}</span>
						</div>
						<div class="h-2 overflow-hidden rounded-full bg-paper">
							<div
								class="h-full rounded-full bg-ink"
								style:width="{(row.visitors / cityMax) * 100}%"
							></div>
						</div>
					</li>
				{:else}
					<li class="text-sm text-muted">{m.analytics_empty()}</li>
				{/each}
			</ul>
		</section>
	</div>

	<div class="mt-4 grid gap-4 lg:grid-cols-2">
		<section class="card p-5">
			<h2 class="font-serif text-2xl">{m.analytics_interest()}</h2>
			<ul class="mt-4 divide-y divide-line">
				{#each data.report.interest as row (row.label)}
					<li class="flex items-center justify-between py-3 text-sm">
						<span>{interestLabel(row.label)}</span>
						<span class="text-muted">{m.analytics_clicks({ count: row.clicks })}</span>
					</li>
				{:else}
					<li class="py-3 text-sm text-muted">{m.analytics_empty()}</li>
				{/each}
			</ul>
		</section>
		<section class="card p-5">
			<h2 class="font-serif text-2xl">{m.analytics_links()}</h2>
			<ul class="mt-4 divide-y divide-line">
				{#each data.report.articleLinks as row (row.target)}
					<li class="flex items-start justify-between gap-4 py-3 text-sm">
						<span class="min-w-0 break-all">{row.target}</span>
						<span class="shrink-0 text-muted">{m.analytics_clicks({ count: row.clicks })}</span>
					</li>
				{:else}
					<li class="py-3 text-sm text-muted">{m.analytics_empty()}</li>
				{/each}
			</ul>
		</section>
	</div>

	<section class="card mt-4 overflow-x-auto p-5">
		<h2 class="font-serif text-2xl">{m.analytics_posts()}</h2>
		<table class="mt-4 w-full min-w-[40rem] text-left text-sm">
			<thead class="text-muted">
				<tr>
					<th class="py-2 pr-3 font-medium">{m.analytics_col_post()}</th>
					<th class="py-2 pr-3 font-medium">{m.analytics_col_impressions()}</th>
					<th class="py-2 pr-3 font-medium">{m.analytics_col_read()}</th>
					<th class="py-2 pr-3 font-medium">{m.analytics_col_average()}</th>
					<th class="py-2 pr-3 font-medium">{m.analytics_col_video()}</th>
					<th class="py-2 font-medium">{m.analytics_col_links()}</th>
				</tr>
			</thead>
			<tbody>
				{#each data.report.posts as row (row.slug)}
					<tr class="border-t border-line">
						<td class="py-3 pr-3">
							<a class="font-medium hover:text-rose" href={href(`/blog/${row.slug}`)}>{row.title}</a
							>
						</td>
						<td class="py-3 pr-3">{row.impressions}</td>
						<td class="py-3 pr-3">{duration(row.readMs)}</td>
						<td class="py-3 pr-3">{duration(row.averageReadMs)}</td>
						<td class="py-3 pr-3">{duration(row.videoMs)}</td>
						<td class="py-3">{row.linkClicks}</td>
					</tr>
				{:else}
					<tr>
						<td class="py-3 text-muted" colspan="6">{m.analytics_empty()}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</section>
{/if}
