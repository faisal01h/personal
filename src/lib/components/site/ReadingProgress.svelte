<script lang="ts">
	let { article }: { article: HTMLElement | null } = $props();
	let progress = $state(0);

	$effect(() => {
		const node = article;
		if (!node) return;
		const measure = () => {
			const start = node.getBoundingClientRect().top + window.scrollY;
			const distance = node.offsetHeight - window.innerHeight + 96;
			const traveled = window.scrollY + window.innerHeight - start - 96;
			progress = distance < 120 ? 0 : Math.min(1, Math.max(0, traveled / distance));
		};
		measure();
		window.addEventListener('scroll', measure, { passive: true });
		window.addEventListener('resize', measure);
		return () => {
			window.removeEventListener('scroll', measure);
			window.removeEventListener('resize', measure);
		};
	});
</script>

<div class="reading-progress" aria-hidden="true">
	<span style="transform: scaleX({progress})"></span>
</div>
