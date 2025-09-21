<script lang="ts">
	import PageHeader from '$lib/components/page-header.svelte';
	import { Button } from '$lib/components/ui/button';
  import Plus from '@lucide/svelte/icons/plus';
  import NewProjectDialog from '$lib/components/home/new-project-dialog.svelte';
</script>

<PageHeader>
	<svelte:fragment slot="title">Dashboard</svelte:fragment>

	<svelte:fragment slot="description">
		View, create and manage applications, and check instance analytics.
	</svelte:fragment>

	<div slot="actions">
		<NewProjectDialog />
	</div>
</PageHeader>
