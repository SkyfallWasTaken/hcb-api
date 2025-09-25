<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button/index';
	import { Input } from '$lib/components/ui/input/index';
	import { Label } from '$lib/components/ui/label/index';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card/index';

	export let data;
	export let form;

	let loading = false;

	const authUrl = `https://hcb.hackclub.com/api/v4/oauth/authorize?client_id=${data.clientId}&redirect_uri=hcb%3A%2F%2F&response_type=code&scope=read%20write`;
</script>

<svelte:head>
	<title>OAuth Setup – HCB-API</title>
</svelte:head>

<div class="container mx-auto max-w-4xl py-8">
	<div class="mb-6">
		<h1 class="mb-2 text-3xl font-bold text-foreground">HCB OAuth Setup Wizard</h1>
		<a href="/" class="text-sm text-primary hover:text-primary/80">← Back to Dashboard</a>
	</div>

	{#if form?.error}
		<div
			class="mb-6 rounded-md border border-destructive/20 bg-destructive/10 p-4 text-destructive"
		>
			{form.error}
		</div>
	{/if}

	<div class="grid gap-6 md:grid-cols-1">
		<!-- Step 1: Authorize HCB Access -->
		<Card>
			<CardHeader>
				<div class="flex items-center gap-2">
					<CardTitle>Authorize HCB access</CardTitle>
				</div>
				<CardDescription>
					First, you need to authorize this application to access your HCB account.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Button class="w-full md:w-auto" href={authUrl} target="_blank"
					>Open HCB authorization page →</Button
				>
			</CardContent>
		</Card>

		<!-- Step 2: Get Authorization Code -->
		<Card>
			<CardHeader>
				<div class="flex items-center gap-2">
					<CardTitle>Get authorization code</CardTitle>
				</div>
				<CardDescription>
					After clicking "Authorize" on the HCB page, you'll need to extract the authorization code:
				</CardDescription>
			</CardHeader>
			<CardContent class="space-y-4">
				<div class="grid gap-4 md:grid-cols-2">
					<div class="space-y-2">
						<div class="flex items-center gap-2">
							<div
								class="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground"
							>
								a
							</div>
							<h4 class="font-medium">Open DevTools</h4>
						</div>
						<p class="ml-8 text-sm text-muted-foreground">
							Press <code class="rounded bg-muted px-1">Ctrl+Shift+I</code> (or
							<code class="rounded bg-muted px-1">Cmd+Shift+I</code> on Mac)
						</p>
					</div>

					<div class="space-y-2">
						<div class="flex items-center gap-2">
							<div
								class="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground"
							>
								b
							</div>
							<h4 class="font-medium">Go to Network tab</h4>
						</div>
						<p class="ml-8 text-sm text-muted-foreground">
							Click on the "Network" tab in the developer tools
						</p>
					</div>

					<div class="space-y-2">
						<div class="flex items-center gap-2">
							<div
								class="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground"
							>
								c
							</div>
							<h4 class="font-medium">Click "Authorize" on HCB</h4>
						</div>
						<p class="ml-8 text-sm text-muted-foreground">This will trigger a network request</p>
					</div>

					<div class="space-y-2">
						<div class="flex items-center gap-2">
							<div
								class="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground"
							>
								d
							</div>
							<h4 class="font-medium">Find the authorization code</h4>
						</div>
						<p class="ml-8 text-sm text-muted-foreground">
							Look for an "authorize" request → Response Headers → Location header
						</p>
						<p class="ml-8 text-sm text-muted-foreground">
							It should look like: <code class="rounded bg-muted px-1"
								>hcb://?code=YOUR_CODE_HERE</code
							>
						</p>
					</div>
				</div>
			</CardContent>
		</Card>

		<!-- Step 3: Exchange Authorization Code -->
		<Card>
			<CardHeader>
				<div class="flex items-center gap-2">
					<CardTitle>Exchange authorization code</CardTitle>
				</div>
				<CardDescription>
					Copy the code from the URL (everything after <code class="rounded bg-muted px-1"
						>code=</code
					>) and paste it below:
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form
					method="POST"
					action="?/setup"
					use:enhance={() => {
						loading = true;
						return async ({ update }) => {
							loading = false;
							await update();
						};
					}}
					class="space-y-4"
				>
					<div class="space-y-2">
						<Label for="code">Authorization Code</Label>
						<Input
							id="code"
							name="code"
							type="text"
							placeholder="Paste your authorization code here..."
							required
							class="font-mono"
						/>
					</div>

					<Button type="submit" disabled={loading} class="w-full md:w-auto">
						{#if loading}
							Setting up OAuth...
						{:else}
							Complete OAuth Setup
						{/if}
					</Button>
				</form>
			</CardContent>
		</Card>
	</div>
</div>

<style>
	code {
		font-size: 0.875em;
	}
</style>
