<script lang="ts">
	import type { Pathname } from '$app/types';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { locales, localizeHref } from '$lib/paraglide/runtime';
	import { m } from '$lib/paraglide/messages.js';
	import Notices from '$lib/components/Notices.svelte';
	import Toasts from '$lib/components/Toasts.svelte';
	import favicon from '$lib/assets/favicon.svg';
	import '@fontsource-variable/outfit';
	import '@fontsource-variable/fraunces';
	import '@fontsource-variable/fraunces/standard-italic.css';
	import './layout.css';

	let { children } = $props();
	const title = $derived(page.data.metaTitle ?? m.meta_home_title());
	const description = $derived(page.data.metaDescription ?? m.meta_default_description());
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:type" content="website" />
	<link rel="icon" href={favicon} />
</svelte:head>

<Toasts />
<Notices />
{@render children()}

<div style="display:none">
	{#each locales as locale (locale)}
		<a href={resolve(localizeHref(page.url.pathname, { locale }) as Pathname)}>{locale}</a>
	{/each}
</div>
