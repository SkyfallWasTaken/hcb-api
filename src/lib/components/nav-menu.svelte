<script lang="ts">
	import ThemeSwitcher from '$lib/components/theme-switcher.svelte';
	import DynamicBreadcrumb from '$lib/components/dynamic-breadcrumb.svelte';
	import { Button } from '$lib/components/ui/button';
	import { enhance } from '$app/forms';

	interface App {
		id: string;
		name: string;
	}

	let { apps = [], isAuthenticated = false }: { apps?: App[]; isAuthenticated?: boolean } =
		$props();
</script>

<div>
	<div class="flex items-center justify-between px-6 pt-4">
		<DynamicBreadcrumb {apps} />
		<div class="flex items-center gap-2">
			<ThemeSwitcher />
			{#if isAuthenticated}
				<form method="POST" action="/logout" use:enhance>
					<Button type="submit" variant="outline" size="sm">Logout</Button>
				</form>
			{/if}
		</div>
	</div>
</div>
