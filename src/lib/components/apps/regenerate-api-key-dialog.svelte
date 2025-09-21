<script lang="ts">
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { superForm } from 'sveltekit-superforms';

	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import RotateCcw from '@lucide/svelte/icons/rotate-ccw';

	import { regenerateApiKeySchema } from '$lib/home';
	import { arktype } from 'sveltekit-superforms/adapters';

	const { app, data } = $props();

	let dialogOpen = $state(false);

	let { form, enhance, constraints, validateForm, allErrors } = superForm(data.regenerateForm, {
		validators: arktype(regenerateApiKeySchema),
		onUpdate: ({ form }) => {
			if (form.valid) {
				location.reload();
			}
		}
	});

	$effect(() => void validateForm({ update: true }));
	const isValid = $derived(!$allErrors.length);
</script>

<Dialog.Root bind:open={dialogOpen}>
	<Dialog.Trigger
		class="{buttonVariants({ variant: 'outline' })} text-destructive hover:text-destructive/90"
	>
		<RotateCcw class="h-4 w-4" /> Regenerate API key
	</Dialog.Trigger>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Regenerate API Key</Dialog.Title>
			<Dialog.Description>
				This action will create a new API key for "{app.name}". The current API key will immediately
				stop working and cannot be recovered.
			</Dialog.Description>
		</Dialog.Header>
		<form method="POST" action="?/regenerateApiKey">
			<div class="grid gap-4 py-4">
				<div class="flex w-full max-w-sm flex-col gap-3">
					<Label for="confirm">Type "REGENERATE" to confirm</Label>
					<Input
						type="text"
						name="confirm"
						id="confirm"
						placeholder="REGENERATE"
						bind:value={$form.confirm}
						{...$constraints.confirm}
					/>
				</div>
			</div>
			<Dialog.Footer>
				<Button variant="outline" type="button" onclick={() => (dialogOpen = false)}>Cancel</Button>
				<Button type="submit" variant="destructive" disabled={!isValid}>Regenerate key</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
