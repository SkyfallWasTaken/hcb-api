<script lang="ts">
	import ThemeSwitcher from '$lib/components/theme-switcher.svelte';
	import DynamicBreadcrumb from '$lib/components/dynamic-breadcrumb.svelte';

	interface App {
		id: string;
		name: string;
	}

	let { apps = [] }: { apps?: App[] } = $props();
</script>

<div>
	<div class="flex items-center justify-between px-6 pt-4">
		<DynamicBreadcrumb {apps} />
		<ThemeSwitcher />
	</div>


</div>
