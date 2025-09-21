<script lang="ts">
	import { page } from '$app/state';
	import PageHeader from '$lib/components/page-header.svelte';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import CodeBlock from '$lib/components/code-block.svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';

	const { app, logs } = page.data;

	function formatTimestamp(timestamp: string) {
		return new Date(timestamp).toLocaleString();
	}

	function getStatusColor(status: number) {
		if (status >= 200 && status < 300) return 'bg-green-100 text-green-800 border-green-300';
		if (status >= 300 && status < 400) return 'bg-blue-100 text-blue-800 border-blue-300';
		if (status >= 400 && status < 500) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
		return 'bg-red-100 text-red-800 border-red-300';
	}

	function getMethodColor(method: string) {
		switch (method) {
			case 'GET': return 'bg-blue-100 text-blue-800 border-blue-300';
			case 'POST': return 'bg-green-100 text-green-800 border-green-300';
			case 'PUT': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
			case 'PATCH': return 'bg-orange-100 text-orange-800 border-orange-300';
			case 'DELETE': return 'bg-red-100 text-red-800 border-red-300';
			default: return 'bg-gray-100 text-gray-800 border-gray-300';
		}
	}
</script>

<PageHeader>
	<svelte:fragment slot="title">Audit Logs - {app.name}</svelte:fragment>

	<div slot="actions">
		<Button variant="outline" href="/apps/{app.id}">
			<ArrowLeft class="h-4 w-4 mr-2" />
			Back to App
		</Button>
	</div>
</PageHeader>

<div class="px-6 pb-8">
	{#if logs.length === 0}
		<Card>
			<CardContent class="pt-6">
				<p class="text-center text-muted-foreground">No API requests logged yet.</p>
			</CardContent>
		</Card>
	{:else}
		<div class="space-y-6">
			{#each logs as log}
				<Card>
					<CardHeader class="pb-3">
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-2">
								<Badge class={getMethodColor(log.method)}>{log.method}</Badge>
								<code class="text-sm font-mono bg-muted px-2 py-1 rounded">{log.path}</code>
							</div>
							<div class="flex items-center gap-2">
								<Badge class={getStatusColor(log.responseStatus)}>{log.responseStatus}</Badge>
								<span class="text-sm text-muted-foreground">{formatTimestamp(log.timestamp)}</span>
							</div>
						</div>
						<div class="text-sm text-muted-foreground">
							IP: <code>{log.userIp}</code>
						</div>
					</CardHeader>
					<CardContent class="space-y-4">
						<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
							<div>
								<h4 class="text-sm font-semibold mb-2">Request Headers</h4>
								<CodeBlock code={JSON.stringify(log.requestHeaders)} />
							</div>
							<div>
								<h4 class="text-sm font-semibold mb-2">Response Headers</h4>
								<CodeBlock code={JSON.stringify(log.responseHeaders)} />
							</div>
						</div>

						{#if log.requestBody}
							<div>
								<h4 class="text-sm font-semibold mb-2">Request Body</h4>
								<CodeBlock code={log.requestBody} />
							</div>
						{/if}

						{#if log.responseBody}
							<div>
								<h4 class="text-sm font-semibold mb-2">Response Body</h4>
								<CodeBlock code={log.responseBody} />
							</div>
						{/if}
					</CardContent>
				</Card>
			{/each}
		</div>
	{/if}
</div>