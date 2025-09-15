<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import type { SupabaseClient } from '@supabase/supabase-js';
	import type { User, Profile } from '$lib/types/profile';
	import { goto } from '$app/navigation';
	import { invalidate, invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import { fade, fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

	// Components
	import ProfileSection from '$lib/components/dashboard/ProfileSection.svelte';
	import OnlineTalkSection from '$lib/components/dashboard/OnlineTalkSection.svelte';
	import NewsletterSection from '$lib/components/dashboard/NewsletterSection.svelte';
	import UsefulLinksSection from '$lib/components/dashboard/UsefulLinksSection.svelte';
	import BadgeDisplay from '$lib/components/badges/BadgeDisplay.svelte';
	import ProfileEdit from '$lib/components/ProfileEdit.svelte';
	import MediaUploader from '$lib/components/dashboard/MediaUploader.svelte';
	import MyFiles from '$lib/components/dashboard/MyFiles.svelte';
	import WebMaster from '$lib/components/dashboard/WebMaster.svelte';
	import VideosSection from '$lib/components/dashboard/VideosSection.svelte';
	import Support from '$lib/components/dashboard/Support.svelte';
	import InfoIcon from '$lib/components/InfoIcon.svelte';
	import TooltipPortal from '$lib/components/TooltipPortal.svelte';
	import SocialFeed from '$lib/components/dashboard/SocialFeed.svelte';
	import Award from '$lib/components/dashboard/Award.svelte';
	import DjHoliday from '$lib/components/dashboard/DjHoliday.svelte';
	import Notifications from '$lib/components/dashboard/Notifications.svelte';
	import PartnerDisplay from '$lib/components/partners/PartnerDisplay.svelte';
	import BadgeCard from '$lib/components/badges/BadgeCard.svelte';
	import EventRegistrations from '$lib/components/dashboard/EventRegistrations.svelte';
	import EventRegistrationsPreview from '$lib/components/dashboard/EventRegistrationsPreview.svelte';
	import AwardNotifications from '$lib/components/dashboard/AwardNotifications.svelte';
	import WorkshopSchedule from '$lib/components/dashboard/WorkshopSchedule.svelte';

	// Skeleton Components
	import DashboardSkeleton from '$lib/components/skeleton/DashboardSkeleton.svelte';
	import SkeletonCard from '$lib/components/skeleton/SkeletonCard.svelte';
	import SkeletonBadge from '$lib/components/skeleton/SkeletonBadge.svelte';
	import SkeletonNav from '$lib/components/skeleton/SkeletonNav.svelte';

	// Stores
	import { badgeStore } from '$lib/stores/badges';
	import { loadSanityBadges } from '$lib/services/sanity-badge-service';

	interface OnlineTalk {
		_id: string;
		title: string;
		date: string;
		link: string;
		password: string;
		visibleFromHours: number;
	}

	interface DashboardData {
		processInfo: any[];
		surveyUrl: string;
		submissionStart: string;
		submissionEnd: string;
		isActive: boolean;
	}

	interface Badge {
		badge_id: string;
	}

	interface PageData {
		user: User & {
			badges?: Badge[];
		};
		profile: Profile;
		onlineTalks: OnlineTalk[];
		isAdmin: boolean;
		videos: Record<string, any>;
		award: { dashboard: DashboardData } | null;
		streaming?: {
			videos: Promise<any>;
			badges: Promise<any>;
			events: Promise<any>;
		};
	}

	const AWARD_BADGE_ID = 'fc005104-5c29-44bc-b05f-1f5e5ef817a1';
	const DJ_URLAUB_BADGE_ID = '551d9015-aa13-4117-8776-b59f1aaade9b';
	const PARTNER_BADGE_ID = 'b83547a4-fdbf-4ff8-8bec-0ea5666a0ac5';

	export let data: PageData;

	// State
	let isLoading = true;
	let dataReady = false;
	let navReady = false;
	let loading = false;
	let showEditProfile = false;
	let videosComponent: VideosSection;
	let activeTab = 'overview';
	let showMobileTabs = false;
	let availableBadges: any[] = [];

	// Immediate display
	const supabase = getContext<SupabaseClient>('supabase');
	$: user = data.user;
	$: profile = data.profile;
	$: onlineTalks = data.onlineTalks || [];
	$: isAdmin = data.isAdmin || false;
	$: videos = data.videos || {};
	$: award = data.award;

	// Badge Helper Functions
	const hasAwardBadge = (user: PageData['user']) => {
		return user?.badges?.some((badge: Badge) => badge.badge_id === AWARD_BADGE_ID) || false;
	};

	const hasPartnerBadge = (user: PageData['user']) => {
		return user?.badges?.some((badge: Badge) => badge.badge_id === PARTNER_BADGE_ID) || false;
	};

	function canShowAward(user: PageData['user'], award: PageData['award']): boolean {
		return hasAwardBadge(user) && award !== null && award.dashboard && award.dashboard.isActive;
	}

	// Tab management
	$: {
		const tabParam = $page.url.searchParams.get('tab');
		if (tabParam && tabs.some(t => t.id === tabParam)) {
			activeTab = tabParam;
		}
	}

	function updateTabInUrl(tabId: string) {
		const url = new URL($page.url);
		url.searchParams.set('tab', tabId);
		goto(url.toString(), { replaceState: true, noScroll: true });
	}

	// Tab definitions
	$: tabs = [
		{ id: 'overview', label: 'Profil', icon: '🏠' },
		{ id: 'event-registrations', label: 'Meine Events', icon: '📅' },
		{ id: 'badges', label: 'Badges', icon: '🏆' },
		{ id: 'videos', label: 'Videos', icon: '📺' },
		{ id: 'partner', label: 'Partner', icon: '🤝' },
		...(canShowAward(user, award) ? [{ id: 'award', label: 'DJ Award', icon: '🏅' }] : []),
		{ id: 'online-talks', label: 'Online Talks', icon: '🎤' },
		{ id: 'uploads', label: 'Uploads', icon: '📁' },
		{ id: 'links', label: 'Links', icon: '🔗' },
		{ id: 'newsletter', label: 'Newsletter', icon: '📧' },
		{ id: 'webmaster', label: 'Du brauchst eine Website?', icon: '🛠️' },
	];

	// Computed Badges
	$: userBadgesWithData = user?.badges?.map(ub => {
		return availableBadges.find(b => b.supabaseId === ub.badge_id);
	}).filter(badge => {
		if (!badge) return false;
		const badgeName = badge.name?.toLowerCase() || '';
		return !badgeName.includes('urlaub');
	}) || [];

	// Badge Sorting Function
	function sortBadges(badges: any[]) {
		const order = [
			'welcome',
			'profil',
			'newsletter',
			'supporter',
			'workshop',
			'partner',
			'coming soon',
		];

		return badges.sort((a, b) => {
			const aName = a.name?.toLowerCase() || '';
			const bName = b.name?.toLowerCase() || '';

			let aIndex = order.findIndex(o => aName.includes(o));
			let bIndex = order.findIndex(o => bName.includes(o));

			if (aIndex === -1) aIndex = order.length;
			if (bIndex === -1) bIndex = order.length;

			return aIndex - bIndex;
		});
	}

	// Lifecycle
	onMount(async () => {
		// Progressive loading - navigation first, then content
		setTimeout(() => {
			navReady = true;
		}, 150);

		setTimeout(() => {
			isLoading = false;
			dataReady = true;
		}, 300);

		// Load badges from Sanity
		try {
			const sanityBadges = await loadSanityBadges();
			if (sanityBadges) {
				availableBadges = sanityBadges;
				badgeStore.setAvailableBadges(sanityBadges);
			}

			// Load user badges
			if (user?.badges) {
				user.badges.forEach((ub: { badge_id: string }) => {
					const badge = sanityBadges?.find((b: any) => b.supabaseId === ub.badge_id);
					if (badge) {
						badgeStore.addUserBadge(badge, user.id);
					}
				});
			}
		} catch (error) {
			console.error('Error loading badges:', error);
		}

		// Stream additional data if available
		if (data.streaming) {
			// Load videos asynchronously
			if (data.streaming.videos) {
				data.streaming.videos.then(videosData => {
					if (videosData) {
						videos = videosData;
					}
				});
			}
		}
	});

	// Event Handlers
	const handleLogout = async () => {
		if (loading) return;
		loading = true;
		try {
			const { error } = await supabase.auth.signOut();
			if (error) {
				console.error('Error signing out:', error);
				return;
			}

			await invalidate('supabase:auth');
			await invalidateAll();

			goto('/auth');
		} catch (error) {
			console.error('Error signing out:', error);
		} finally {
			loading = false;
		}
	};

	function handleOpenVideos() {
		if (videosComponent) {
			videosComponent.openAndScrollTo();
		}
		activeTab = 'videos';
	}

	function setActiveTab(tabId: string) {
		activeTab = tabId;
		showMobileTabs = false;
		updateTabInUrl(tabId);
	}
</script>

{#if isLoading && !user}
	<DashboardSkeleton />
{:else}
	<div
		class="min-h-screen bg-black py-6 px-4 sm:px-6 lg:px-8"
		in:fade={{ duration: 300, delay: 100 }}
	>
		<div class="container px-6 mx-auto">
			<!-- Header -->
			<div
				class="mb-6 flex flex-col sm:flex-row justify-between gap-3 sm:items-center"
				in:fly={{ y: -20, duration: 400, delay: 200, easing: cubicOut }}
			>
				<div>
					<h1 class="text-3xl sm:text-4xl font-medium text-white mb-2">Dashboard</h1>
					<p class="text-gray-400">Dein Bereich zum Lernen und Verwalten</p>
				</div>

				<div class="flex flex-wrap justify-end items-center gap-2 sm:gap-3">
					<a
						href="https://buymeacoffee.com/djworkshopgermany"
						target="_blank"
						class="relative text-center justify-center flex flex-1 sm:flex-none px-4 sm:px-6 py-2 text-sm font-medium text-black bg-green-500 hover:bg-green-400 rounded-full transition duration-300 items-center gap-2"
					>
						<span>☕</span>
						<span>Support</span>
						<InfoIcon
							variant="light"
							size="sm"
							text="Mit dem Preis einer Tasse Kaffee (2,50€) unterstützt du uns dabei, noch mehr coole Features und Workshops für die DJ-Community anzubieten! 🙌"
							position="bottom"
						/>
					</a>

					{#if isAdmin}
						<a
							href="/admin"
							class="flex-1 sm:flex-none text-center px-4 sm:px-6 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-full transition duration-300"
						>
							<span>Admin</span>
						</a>
					{/if}

					{#if isAdmin}
						<AwardNotifications {user} {isAdmin} />
					{/if}

					<button
						on:click={handleLogout}
						disabled={loading}
						class="flex-1 sm:flex-none text-center px-4 sm:px-6 py-2 text-sm font-medium text-white bg-gray-600 hover:bg-red-700 rounded-full transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{loading ? 'Abmelden...' : 'Logout'}
					</button>
				</div>
			</div>

			<!-- Main Dashboard Layout -->
			<div class="flex flex-col lg:flex-row gap-6">
				<!-- Mobile Tab Selector -->
				<div class="lg:hidden" in:fly={{ x: -20, duration: 400, delay: 300, easing: cubicOut }}>
					<button
						on:click={() => showMobileTabs = !showMobileTabs}
						class="w-full flex items-center justify-between px-4 py-3 bg-gray-800 rounded-lg border border-gray-700 text-white"
					>
						<span class="flex items-center gap-2">
							<span>{tabs.find(tab => tab.id === activeTab)?.icon}</span>
							<span>{tabs.find(tab => tab.id === activeTab)?.label}</span>
						</span>
						<svg
							class="w-5 h-5 transform transition-transform {showMobileTabs ? 'rotate-180' : ''}"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
						</svg>
					</button>

					{#if showMobileTabs}
						<div
							class="mt-2 bg-gray-800 rounded-lg border border-gray-700 overflow-hidden"
							in:fly={{ y: -10, duration: 200 }}
						>
							{#each tabs as tab}
								<button
									on:click={() => setActiveTab(tab.id)}
									class="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-700 transition-colors {activeTab === tab.id
										? 'bg-gray-700 text-white'
										: 'text-gray-300'}"
								>
									<span class="text-lg">{tab.icon}</span>
									<span>{tab.label}</span>
								</button>
							{/each}
						</div>
					{/if}
				</div>

				<!-- Desktop Sidebar -->
				{#if !navReady}
					<div class="hidden lg:block w-64 flex-shrink-0">
						<SkeletonNav items={tabs.length} />
					</div>
				{:else}
					<div
						class="hidden lg:block w-64 flex-shrink-0"
						in:fly={{ x: -20, duration: 400, delay: 100, easing: cubicOut }}
					>
						<div class="bg-black rounded-xl border border-gray-800 overflow-hidden sticky top-6">
							<div class="p-4 border-b border-gray-800">
								<h3 class="text-lg font-medium text-white">Navigation</h3>
							</div>
							<nav class="p-2">
								{#each tabs as tab, i}
									<button
										on:click={() => setActiveTab(tab.id)}
										class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all duration-200 {activeTab === tab.id
											? 'bg-gray-700 text-white transform scale-[1.02]'
											: 'text-gray-300 hover:bg-gray-800 hover:text-white'}"
										style="animation-delay: {50 + i * 30}ms"
									>
										<span class="text-lg nav-icon-fade">{tab.icon}</span>
										<span class="font-medium nav-text-fade">{tab.label}</span>
									</button>
								{/each}
							</nav>
						</div>
					</div>
				{/if}

				<!-- Main Content Area -->
				<div class="flex-1 min-w-0">
					{#if activeTab === 'overview'}
						<!-- Overview Tab -->
						<div class="space-y-6">
							<!-- Mini-Badges Section -->
							{#if !dataReady}
								<div class="bg-black rounded-xl border border-gray-800 p-6">
									<div class="h-6 bg-gray-700 rounded w-32 mb-4 animate-pulse" />
									<div class="flex flex-wrap gap-4">
										{#each Array(5) as _}
											<SkeletonBadge />
										{/each}
									</div>
								</div>
							{:else if userBadgesWithData.length > 0}
								<div
									class="bg-black rounded-xl border border-gray-800 p-6"
									in:fly={{ y: 20, duration: 400, delay: 400, easing: cubicOut }}
								>
									<h3 class="text-lg font-medium text-white mb-4">Deine Badges</h3>
									<div class="flex flex-wrap gap-4">
										{#each sortBadges(userBadgesWithData) as badge, i}
											<div in:fly={{ y: 20, duration: 300, delay: 450 + i * 50 }}>
												<BadgeCard
													{badge}
													variant="mini"
													on:click={() => setActiveTab('badges')}
												/>
											</div>
										{/each}
									</div>
									<button
										on:click={() => setActiveTab('badges')}
										class="mt-4 text-sm text-blue-400 hover:text-blue-300 transition-colors"
									>
										Alle Badges anzeigen →
									</button>
								</div>
							{/if}

							<!-- Event Registrations Preview -->
							{#if !dataReady}
								<SkeletonCard lines={2} />
							{:else}
								<div in:fly={{ y: 20, duration: 400, delay: 500, easing: cubicOut }}>
									<EventRegistrationsPreview
										userId={user?.id}
										onShowAll={() => {
											setActiveTab('event-registrations');
											const url = new URL($page.url);
											url.searchParams.set('eventTab', 'all-events');
											goto(url.toString(), { replaceState: true, noScroll: true });
										}}
									/>
								</div>
							{/if}

							<!-- Profile Section -->
							{#if !dataReady}
								<div class="bg-black rounded-xl border border-gray-800 p-6">
									<div class="h-8 bg-gray-700 rounded w-48 mb-4 animate-pulse" />
									<SkeletonCard lines={4} showAvatar={true} animate={false} />
								</div>
							{:else}
								<div
									class="bg-black rounded-xl border border-gray-800 p-6"
									in:fly={{ y: 20, duration: 400, delay: 600, easing: cubicOut }}
								>
									<h2 class="text-2xl font-medium text-white mb-4">Profil Übersicht</h2>
									<ProfileSection
										{user}
										{profile}
										onEdit={() => (showEditProfile = true)}
									/>
								</div>
							{/if}
						</div>
					{:else if activeTab === 'event-registrations'}
						{@const eventSubTab = $page.url.searchParams.get('eventTab') || 'my-registrations'}
						<div class="bg-black rounded-xl border border-gray-800 p-6">
							<h2 class="text-2xl font-medium text-white mb-6">Events</h2>

							<!-- Event Sub-Tabs -->
							<div class="flex gap-2 mb-6 border-b border-gray-700">
								<button
									on:click={() => {
										const url = new URL($page.url);
										url.searchParams.set('eventTab', 'my-registrations');
										goto(url.toString(), { replaceState: true, noScroll: true });
									}}
									class="px-4 py-2 text-sm font-medium transition-all duration-200 {eventSubTab === 'my-registrations' ? 'text-green-400 border-b-2 border-green-400' : 'text-gray-400 hover:text-white'}"
								>
									Meine Anmeldungen
								</button>
								<button
									on:click={() => {
										const url = new URL($page.url);
										url.searchParams.set('eventTab', 'all-events');
										goto(url.toString(), { replaceState: true, noScroll: true });
									}}
									class="px-4 py-2 text-sm font-medium transition-all duration-200 {eventSubTab === 'all-events' ? 'text-green-400 border-b-2 border-green-400' : 'text-gray-400 hover:text-white'}"
								>
									Event Schedule
								</button>
							</div>

							<!-- Sub-Tab Content -->
							{#if eventSubTab === 'my-registrations'}
								<EventRegistrations userId={user?.id} />
							{:else if eventSubTab === 'all-events'}
								<WorkshopSchedule userId={user?.id} userProfile={profile} />
							{/if}
						</div>
					{:else if activeTab === 'badges'}
						<div
							class="relative rounded-xl p-6 border border-gray-800 bg-black overflow-hidden"
						>
							<div class="absolute inset-0 mix-blend-overlay noise-filter" />
							<div class="relative">
								<h2 class="text-2xl font-medium text-white mb-4">Deine Badges</h2>
								<BadgeDisplay {user} on:openVideos={handleOpenVideos} />
							</div>
						</div>
					{:else if activeTab === 'videos'}
						<div class="bg-black rounded-xl border border-gray-800 p-6">
							<h2 class="text-2xl font-medium text-white mb-4">DJ Learning Hub</h2>
							<VideosSection {videos} {user} bind:this={videosComponent} />
						</div>
					{:else if activeTab === 'partner'}
						<div class="bg-black rounded-xl border border-gray-800 p-6">
							<h2 class="text-2xl font-medium text-white mb-4">Partner</h2>
							<PartnerDisplay {user} />
						</div>
					{:else if activeTab === 'award' && canShowAward(user, award)}
						<div class="bg-black rounded-xl border border-gray-800 p-6">
							<h2 class="text-2xl font-medium text-white mb-4">DJ Award</h2>
							{#if award}
								<Award {user} {award} />
							{/if}
						</div>
					{:else if activeTab === 'dj-holiday'}
						<div class="bg-black rounded-xl border border-gray-800 p-6">
							<h2 class="text-2xl font-medium text-white mb-4">DJ Urlaub</h2>
							<DjHoliday {user} />
						</div>
					{:else if activeTab === 'community'}
						<div class="bg-black rounded-xl border border-gray-800 p-6">
							<h2 class="text-2xl font-medium text-white mb-4">Community Feed</h2>
							{#if isAdmin}
								<SocialFeed {user} {profile} />
							{:else}
								<div class="text-center py-6 space-y-3">
									<div class="bg-gray-800/70 rounded-lg p-4 border border-gray-700/50">
										<h3 class="text-lg font-medium text-white mb-2">Coming Soon!</h3>
										<p class="text-sm text-gray-400">
											Der Community Feed befindet sich derzeit in der Beta-Phase und wird bald für alle Mitglieder verfügbar sein.
										</p>
										<div class="mt-3 flex justify-center">
											<InfoIcon
												variant="light"
												text="Werde Teil der Beta und erhalte frühzeitigen Zugang zu neuen Features! Kontaktiere uns für mehr Informationen."
												position="bottom"
											/>
										</div>
									</div>
								</div>
							{/if}
						</div>
					{:else if activeTab === 'online-talks'}
						<div class="bg-black rounded-xl border border-gray-800 p-6">
							<h2 class="text-2xl font-medium text-white mb-4">Online Talks</h2>
							<OnlineTalkSection {onlineTalks} />
						</div>
					{:else if activeTab === 'uploads'}
						<div class="bg-black rounded-xl border border-gray-800 p-6">
							<h2 class="text-2xl font-medium text-white mb-4">Meine Uploads</h2>
							<MyFiles {user} let:handleUploadComplete>
								<MediaUploader {user} on:uploadComplete={handleUploadComplete} />
							</MyFiles>
						</div>
					{:else if activeTab === 'links'}
						<div class="bg-black rounded-xl border border-gray-800 p-6">
							<h2 class="text-2xl font-medium text-white mb-4">Links & Ressourcen</h2>
							<UsefulLinksSection {isAdmin} />
						</div>
					{:else if activeTab === 'newsletter'}
						<div class="bg-black rounded-xl border border-gray-800 p-6">
							<h2 class="text-2xl font-medium text-white mb-4">Newsletter & WhatsApp Channel</h2>
							<NewsletterSection
								email={user?.email}
								firstName={user?.raw_user_meta_data?.first_name || user?.user_metadata?.first_name || ''}
								lastName={user?.raw_user_meta_data?.last_name || user?.user_metadata?.last_name || ''}
							/>
						</div>
					{:else if activeTab === 'webmaster'}
						<div class="bg-black rounded-xl border border-gray-800 p-6">
							<h2 class="text-2xl font-medium text-white mb-4">Webmaster</h2>
							<WebMaster />
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
{/if}

{#if showEditProfile}
	<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999] overflow-y-auto">
		<div class="my-8 bg-gray-900 rounded-3xl p-8 max-w-5xl w-full relative border border-gray-800 max-h-[90vh] overflow-y-auto">
			<button
				on:click={() => (showEditProfile = false)}
				class="absolute top-4 right-4 text-gray-400 hover:text-white"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-6 w-6"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
			<h2 class="text-2xl font-medium text-white mb-6">Profil bearbeiten</h2>
			<ProfileEdit
				{user}
				{profile}
				on:close={async () => {
					showEditProfile = false;
					await invalidate('app:profile');
				}}
			/>
		</div>
	</div>
{/if}

<TooltipPortal />

<style>
	@keyframes shimmer {
		0% {
			background-position: -200% 0;
		}
		100% {
			background-position: 200% 0;
		}
	}

	.animate-pulse {
		background: linear-gradient(
			90deg,
			rgb(55 65 81) 0%,
			rgb(75 85 99) 50%,
			rgb(55 65 81) 100%
		);
		background-size: 200% 100%;
		animation: shimmer 2s infinite;
	}

	.noise-filter {
		opacity: 0.02;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E");
	}

	.nav-icon-fade {
		animation: fadeInScale 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
		opacity: 0;
	}

	.nav-text-fade {
		animation: fadeInSlide 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
		opacity: 0;
	}

	@keyframes fadeInScale {
		from {
			opacity: 0;
			transform: scale(0.8);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	@keyframes fadeInSlide {
		from {
			opacity: 0;
			transform: translateX(-10px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}
</style>