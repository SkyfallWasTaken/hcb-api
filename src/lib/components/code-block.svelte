<script lang="ts">
	import { onMount } from 'svelte';
	import { codeToHtml } from 'shiki';

	export let code: string;
	export let language: string = 'json';
	export let theme: string = 'catppuccin-mocha';

	let highlightedCode = '';

	onMount(async () => {
		try {
			if (code) {
				const formatted = language === 'json' ? JSON.stringify(JSON.parse(code), null, 2) : code;
				highlightedCode = await codeToHtml(formatted, {
					lang: language,
					theme: theme
				});
			}
		} catch (e) {
			highlightedCode = `<pre><code>${code}</code></pre>`;
		}
	});
</script>

<div class="overflow-hidden rounded-md border bg-card">
	{#if highlightedCode}
		{@html highlightedCode}
	{:else}
		<pre class="overflow-x-auto p-4 text-sm"><code>{code}</code></pre>
	{/if}
</div>

<style>
	:global(.shiki) {
		padding: 1rem;
		overflow-x: auto;
		font-size: 0.875rem;
		line-height: 1.5;
	}
</style>
