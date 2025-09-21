<script lang="ts">
	import PageHeader from '$lib/components/page-header.svelte';
	import NewProjectDialog from '$lib/components/home/new-project-dialog.svelte';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';

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

<div class="container mx-auto py-6">
	{#if data.apps && data.apps.length > 0}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
		<div class="text-center py-12">
			<h3 class="text-lg font-semibold mb-2">No applications yet</h3>
			<p class="text-muted-foreground mb-4">
				Create your first application to get started.
			</p>
			<NewProjectDialog {data} />
		</div>
	{/if}
</div>
