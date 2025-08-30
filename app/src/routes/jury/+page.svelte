<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import JuryDashboard from '$lib/components/jury/JuryDashboard.svelte';
	
	export let data;
	
	const AWARD_BADGE_ID = 'fc005104-5c29-44bc-b05f-1f5e5ef817a1';
	
	let hasAccess = false;
	let loading = true;
	
	onMount(async () => {
		// Check if user is authenticated
		if (!data.user) {
			goto('/login?redirect=/jury');
			return;
		}
		
		// Check if user has the award badge OR is admin
		const badges = data.userBadges || [];
		hasAccess = badges.some((badge: any) => badge.badge_id === AWARD_BADGE_ID) || data.isAdmin;
		
		if (!hasAccess) {
			// Redirect to dashboard with message
			goto('/dashboard?message=jury-access-required');
		}
		
		loading = false;
	});
</script>

<svelte:head>
	<title>Jury Dashboard | DJ World Globe Awards</title>
	<meta name="description" content="Rate and review award submissions as a jury member" />
</svelte:head>

{#if loading}
	<div class="min-h-screen flex items-center justify-center bg-gray-900">
		<div class="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
	</div>
{:else if hasAccess}
	<JuryDashboard user={data.user} />
{:else}
	<div class="min-h-screen flex items-center justify-center bg-gray-900">
		<div class="text-center p-8">
			<h1 class="text-3xl font-medium text-white mb-4">Access Denied</h1>
			<p class="text-gray-400 mb-6">You need the Award Badge to access the Jury Dashboard.</p>
			<a 
				href="/dashboard" 
				class="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
			>
				Return to Dashboard
			</a>
		</div>
	</div>
{/if}