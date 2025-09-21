<script lang="ts">
	import ThemeSwitcher from '$lib/components/theme-switcher.svelte';
	import DynamicBreadcrumb from '$lib/components/dynamic-breadcrumb.svelte';
	import { Button } from '$lib/components/ui/button';
</script>

<div>
	<div class="flex items-center justify-between px-6 pt-4">
		<DynamicBreadcrumb
			apps={[
				{ id: 'app-123', name: 'My App' },
				{ id: 'app-456', name: 'Another App' }
			]}
		/>

		<ThemeSwitcher />
	</div>


</div>
