<script lang="ts">
	import { get } from 'svelte/store';
	import { useDocChange, useEditor } from 'prosekit/svelte';

	let { onchange }: { onchange: (json: string, html: string) => void } = $props();
	const editor = useEditor();

	useDocChange(() => {
		const current = get(editor);
		onchange(JSON.stringify(current.getDocJSON()), current.getDocHTML());
	});
</script>
