<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { ModeWatcher } from 'mode-watcher';
	import NavMenu from '$lib/components/nav-menu.svelte';

	let { children, data } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<ModeWatcher />
<div class="min-h-screen">
	{#if data.hasPassword && data.isAuthenticated}
		<NavMenu apps={data.apps} isAuthenticated={data.isAuthenticated} />
	{:else}
		<NavMenu apps={[]} isAuthenticated={false} />
	{/if}
	{@render children?.()}
</div>
