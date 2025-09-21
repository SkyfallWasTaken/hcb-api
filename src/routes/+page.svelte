<script lang="ts">
	import PageHeader from '$lib/components/page-header.svelte';
	import NewProjectDialog from '$lib/components/home/new-project-dialog.svelte';

	let { data } = $props();
</script>

<PageHeader>
	<svelte:fragment slot="title">Dashboard</svelte:fragment>

	<svelte:fragment slot="description">
		View, create and manage applications, and check instance analytics.
	</svelte:fragment>

	<div slot="actions">
		<NewProjectDialog {data} />
	</div>
</PageHeader>
