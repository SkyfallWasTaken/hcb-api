<script lang="ts">
	import * as Breadcrumb from "$lib/components/ui/breadcrumb";
	import { page } from "$app/state";
	import { goto } from "$app/navigation";

	interface App {
		id: string;
		name: string;
	}

	interface BreadcrumbItem {
		label: string;
		href: string;
		isPage: boolean;
	}

	const routeLabels: Record<string, string> = {
		'': 'Home',
		'audit-logs': 'Audit Logs',
		'settings': 'Settings',
		'dashboard': 'Dashboard'
	};

	let { apps = [] }: { apps?: App[] } = $props();

	function getAppName(appId: string): string {
		const app = apps.find((a: App) => a.id === appId);
		return app ? app.name : appId;
	}

	function isAppId(segment: string): boolean {
		return apps.some((app: App) => app.id === segment);
	}

	const segments = $derived(page.url.pathname.split('/').filter(Boolean));
	const breadcrumbs = $derived(buildBreadcrumbs(segments));

	function buildBreadcrumbs(segments: string[]): BreadcrumbItem[] {
		const crumbs: BreadcrumbItem[] = [
			{ label: 'Home', href: '/', isPage: false }
		];

		let currentPath = '';

		segments.forEach((segment: string, index: number) => {
			currentPath += `/${segment}`;
			const isLast = index === segments.length - 1;

			let label: string;
			let href = currentPath;

			if (isAppId(segment)) {
				label = getAppName(segment);
			} else if (routeLabels[segment]) {
				label = routeLabels[segment];
			} else {
				label = segment.split('-').map((word: string) =>
					word.charAt(0).toUpperCase() + word.slice(1)
				).join(' ');
			}

			// Redirect /apps to / instead
			if (currentPath === '/apps') {
				href = '/';
			}

			crumbs.push({
				label,
				href,
				isPage: isLast
			});
		});

		return crumbs;
	}
</script>

<Breadcrumb.Root>
	<Breadcrumb.List>
		{#each breadcrumbs as crumb, index}
			<Breadcrumb.Item>
				{#if crumb.isPage}
					<Breadcrumb.Page>{crumb.label}</Breadcrumb.Page>
				{:else}
					<Breadcrumb.Link
						href={crumb.href}
					>
						{crumb.label}
					</Breadcrumb.Link>
				{/if}
			</Breadcrumb.Item>
			{#if index < breadcrumbs.length - 1}
				<Breadcrumb.Separator />
			{/if}
		{/each}
	</Breadcrumb.List>
</Breadcrumb.Root>