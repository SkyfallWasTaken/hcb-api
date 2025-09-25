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
	import { Button } from '$lib/components/ui/button';

	let { data } = $props();
</script>

<svelte:head>
	<title>Dashboard – HCB-API</title>
</svelte:head>

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

{#if !data.hasOAuthTokens}
	<div class="w-full px-6 py-4">
		<div
			class="rounded-md border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-950"
		>
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-3">
					<div
						class="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900"
					>
						<svg
							class="h-5 w-5 text-yellow-600 dark:text-yellow-400"
							fill="currentColor"
							viewBox="0 0 20 20"
						>
							<path
								fill-rule="evenodd"
								d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
								clip-rule="evenodd"
							/>
						</svg>
					</div>
					<div>
						<h3 class="font-medium text-yellow-800 dark:text-yellow-200">OAuth Setup Required</h3>
						<p class="text-sm text-yellow-700 dark:text-yellow-300">
							You need to set up OAuth tokens to use HCB API features.
						</p>
					</div>
				</div>
				<Button href="/wizard" variant="outline" size="sm">Set up OAuth</Button>
			</div>
		</div>
	</div>
{/if}

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
