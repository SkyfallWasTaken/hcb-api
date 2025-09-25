<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { arktype } from 'sveltekit-superforms/adapters';
	import { setupSchema } from '$lib/schemas';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';

	export let data;

	const { form, errors, enhance } = superForm(data.form, {
		validators: arktype(setupSchema)
	});
</script>

<svelte:head>
	<title>Initial Setup – HCB-API</title>
</svelte:head>

<div class="mt-16 flex items-center justify-center bg-background">
	<Card class="w-full max-w-md">
		<CardHeader class="text-center">
			<CardTitle class="text-2xl"
				>Welcome to <span class="text-red-600 dark:text-red-400">HCB-API</span></CardTitle
			>
			<CardDescription
				>Set up your master password to secure the application. You'll use this when signing into
				the dashboard.</CardDescription
			>
		</CardHeader>
		<CardContent>
			<form method="POST" use:enhance class="space-y-4">
				<div class="space-y-2">
					<Label for="password">Master Password</Label>
					<Input
						id="password"
						name="password"
						type="password"
						placeholder="Enter your master password"
						bind:value={$form.password}
						aria-invalid={$errors.password ? 'true' : undefined}
						class="w-full"
					/>
					{#if $errors.password}
						<div class="text-sm text-destructive">
							{$errors.password}
						</div>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="confirmPassword">Confirm Password</Label>
					<Input
						id="confirmPassword"
						name="confirmPassword"
						type="password"
						placeholder="Confirm your master password"
						bind:value={$form.confirmPassword}
						aria-invalid={$errors.confirmPassword ? 'true' : undefined}
						class="w-full"
					/>
					{#if $errors.confirmPassword}
						<div class="text-sm text-destructive">
							{$errors.confirmPassword}
						</div>
					{/if}
				</div>

				<Button type="submit" class="w-full">Complete setup</Button>
			</form>
		</CardContent>
	</Card>
</div>
