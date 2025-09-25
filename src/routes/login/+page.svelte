<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { arktype } from 'sveltekit-superforms/adapters';
	import { loginSchema } from '$lib/schemas';
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
		validators: arktype(loginSchema)
	});
</script>

<svelte:head>
	<title>Login – HCB-API</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center bg-background">
	<Card class="w-full max-w-md">
		<CardHeader class="text-center">
			<CardTitle class="text-2xl">Login</CardTitle>
			<CardDescription>Enter your master password to access the application</CardDescription>
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
						autofocus
					/>
					{#if $errors.password}
						<div class="text-sm text-destructive">
							{$errors.password}
						</div>
					{/if}
				</div>

				<Button type="submit" class="w-full">Login</Button>
			</form>
		</CardContent>
	</Card>
</div>
