<script lang="ts">
	import PageHeader from '$lib/components/page-header.svelte';
	import NewProjectDialog from '$lib/components/home/new-project-dialog.svelte';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';

	let { data } = $props();
</script>

<PageHeader>
	<svelte:fragment slot="title">Dashboard</svelte:fragment>

	<svelte:fragment slot="description">
		View, create and manage applications, and check instance analytics.
	</svelte:fragment>

	<div slot="actions">
		{#if data.apps.length > 0}
			<NewProjectDialog {data} />
		{/if}
	</div>
</PageHeader>

<div class="container px-6 py-6">
	{#if data.apps && data.apps.length > 0}
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
			{#each data.apps as app}
				<a href="/apps/{app.id}" class="block transition-transform hover:scale-105">
					<Card class="h-full cursor-pointer hover:shadow-lg">
						<CardHeader>
							<CardTitle>{app.name}</CardTitle>
							<CardDescription>
								Application ID: {app.id}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<p class="text-sm text-muted-foreground">
								Click to view application details and manage settings.
							</p>
						</CardContent>
					</Card>
				</a>
			{/each}
		</div>
	{:else}
		<div class="py-12 text-center">
			<h3 class="mb-2 text-lg font-semibold">No applications yet</h3>
			<p class="mb-4 text-muted-foreground">Create your first application to get started.</p>
			<NewProjectDialog {data} />
		</div>
	{/if}
</div>
