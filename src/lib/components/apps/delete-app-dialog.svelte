<script lang="ts">
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { superForm } from 'sveltekit-superforms';

	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import Trash from '@lucide/svelte/icons/trash';

	import { deleteAppSchema } from '$lib/home';
	import { arktype } from 'sveltekit-superforms/adapters';

	const { app, data } = $props();

	let dialogOpen = $state(false);

	let { form, enhance, constraints, validateForm, allErrors } = superForm(data.deleteForm, {
		validators: arktype(deleteAppSchema),
	});

	$effect(() => void validateForm({ update: true }));
	const isValid = $derived(!$allErrors.length);
</script>

<Dialog.Root bind:open={dialogOpen}>
	<Dialog.Trigger class="{buttonVariants({ variant: 'outline' })} text-destructive hover:text-destructive/90">
		<Trash /> Delete app
	</Dialog.Trigger>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Delete application</Dialog.Title>
			<Dialog.Description>
				This action cannot be undone. This will permanently delete the application "{app.name}" and all associated data.
			</Dialog.Description>
		</Dialog.Header>
		<form method="POST" action="?/delete" use:enhance>
			<div class="grid gap-4 py-4">
				<div class="flex w-full max-w-sm flex-col gap-3">
					<Label for="confirm">Type "DELETE" to confirm</Label>
					<Input
						type="text"
						name="confirm"
						id="confirm"
						placeholder="DELETE"
						bind:value={$form.confirm}
						{...$constraints.confirm}
					/>
				</div>
			</div>
			<Dialog.Footer>
				<Button variant="outline" type="button" onclick={() => dialogOpen = false}>Cancel</Button>
				<Button type="submit" variant="destructive" disabled={!isValid}>Delete app</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>