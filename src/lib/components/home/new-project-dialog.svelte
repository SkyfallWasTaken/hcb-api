<script lang="ts">
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import SuperDebug from 'sveltekit-superforms';
	import { superForm } from 'sveltekit-superforms';

	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import Plus from '@lucide/svelte/icons/plus';

	import { newAppSchema } from '$lib/home';
	import { arktype } from 'sveltekit-superforms/adapters';

	const id = $props.id();
	const { data } = $props();

	let dialogOpen = $state(false);

	let { form, enhance, constraints, validateForm, allErrors } = superForm(data.form, {
		validators: arktype(newAppSchema),
	});

	$effect(() => void validateForm({ update: true }));
	const isValid = $derived(!$allErrors.length);
</script>

<Dialog.Root bind:open={dialogOpen}>
	<Dialog.Trigger class={buttonVariants()}><Plus /> New application</Dialog.Trigger>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Create new application</Dialog.Title>
			<Dialog.Description>
				Your application will have its own unique API key to authenticate requests.
			</Dialog.Description>
		</Dialog.Header>
		<form method="POST" use:enhance>
			<div class="grid gap-4 py-4">
				<div class="flex w-full max-w-sm flex-col gap-3">
					<Label for="app-{id}">App name</Label>
					<Input
						type="text"
						name="name"
						id="app-{id}"
						placeholder="Foobar Watcher"
						bind:value={$form.name}
						{...$constraints.name}
					/>
				</div>
				<SuperDebug data={form} />
			</div>
			<Dialog.Footer>
				<Button type="submit" class="w-full" disabled={!isValid}>Create app</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
