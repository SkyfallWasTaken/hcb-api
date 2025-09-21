<script lang="ts">
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import Plus from '@lucide/svelte/icons/plus';

  const id = $props.id()
</script>

<Dialog.Root>
	<Dialog.Trigger><Button><Plus /> New application</Button></Dialog.Trigger>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Create new application</Dialog.Title>
			<Dialog.Description>
				Your application will have its own unique API key to authenticate requests.
			</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			<div class="flex w-full max-w-sm flex-col gap-3">
				<Label for="app-{id}">App name</Label>
				<Input type="text" id="app-{id}" placeholder="Foobar Watcher" />
			</div>
		</div>
		<Dialog.Footer>
			<Button type="submit" class="w-full">Create app</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
