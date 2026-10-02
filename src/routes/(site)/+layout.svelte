<script lang="ts">
	import AnalyticsBeacon from '$lib/components/AnalyticsBeacon.svelte';
	import SiteFooter from '$lib/components/site/SiteFooter.svelte';
	import SiteHeader from '$lib/components/site/SiteHeader.svelte';

	let { children } = $props();
</script>

<AnalyticsBeacon />
<SiteHeader />
<main id="content">
	{@render children()}
</main>
<SiteFooter />
