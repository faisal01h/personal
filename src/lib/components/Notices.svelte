<script lang="ts">
	import { afterNavigate, replaceState } from '$app/navigation';
	import { page } from '$app/state';
	import { href } from '$lib/href';
	import { noticeMessage } from '$lib/notices';
	import { toast } from '$lib/toast.svelte';

	afterNavigate(() => {
		const code = page.url.searchParams.get('notice');
		if (!code) return;
		const message = noticeMessage(code);
		if (message) {
			if (code === 'signed-out') toast.message(message);
			else toast.success(message);
		}
		const next = new URL(page.url);
		next.searchParams.delete('notice');
		const url = href(`${next.pathname}${next.search}${next.hash}`);
		setTimeout(() => replaceState(url, page.state));
	});
</script>
