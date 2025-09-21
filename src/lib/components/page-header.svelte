<div class="px-6 py-8">
	<div class="flex items-start justify-between">
		<div class="space-y-2">
			<h1 class="text-2xl font-bold tracking-tight md:text-3xl">
				<slot name="title" />
			</h1>
			<p class="text-sm text-muted-foreground lg:text-base">
				<slot name="description" />
			</p>
		</div>

		<div class="flex items-center space-x-3">
			<slot name="actions" />
		</div>
	</div>
</div>
