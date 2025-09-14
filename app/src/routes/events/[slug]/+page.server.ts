import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { eventQuery } from '$lib/sanity/queries';
import { urlFor } from '$lib/sanity/image';
import type { Image } from '@sanity/types';
import groq from 'groq';
import { isAdmin } from '$lib/config/admin.server';
import type { PortableTextBlock } from '@portabletext/types';

interface SanityEvent {
	_id: string;
	title: string;
	tag: string;
	subtitle: string;
	description: string;
	date: string;
	location: string;
	image: Image;
	schedule?: {
		_id: string;
		isSecret?: boolean;
		days: Array<{
			date: string;
			stages: Array<{
				name: string;
				description: string;
				schedule: Array<{
					time: string;
					title: string;
					description?: string;
					instructor?: {
						name: string;
						role: string;
						image?: Image;
					};
					instructors?: Array<{
						name: string;
						role: string;
						image?: Image;
					}>;
					instructorDisplayMode?: string;
					icon?: string;
					allowRegistration?: boolean;
					registrationStartTime?: string;
					maxRegistrations?: number;
					registrationRequired?: boolean;
					isOpenTable?: boolean;
					openTableSettings?: {
						autoAcceptRegistrations?: boolean;
						showRemainingSlots?: boolean;
						waitlistEnabled?: boolean;
						description?: string;
					};
				}>;
			}>;
		}>;
	};
	highlights: Array<{
		title: string;
		description: string;
		icon: string;
	}>;
	features?: string[];
	gallery?: Image[];
	locationDetails?: {
		name: string;
		description: string;
		image: Image;
		website?: string;
		instagram?: string;
		facebook?: string;
		whatsapp?: string;
		externalLinks?: {
			title: string;
			links: Array<{ title: string; url: string; description?: string }>;
		};
	};
	hasOpenStage?: boolean;
	isOpenStageSecret?: boolean;
	isLocationSecret?: boolean;
	isArtistsSecret?: boolean;
	artists?: Array<{
		_id: string;
		name: string;
		role: string;
		description: string;
		image: Image;
		socials: {
			instagram?: string;
			soundcloud?: string;
		};
		isRevealed: boolean;
		order: number;
	}>;
	faqSection?: {
		title: PortableTextBlock[];
		description?: string;
		showCategories?: boolean;
		selectedFaqs?: Array<{
			_id: string;
			question: string;
			answer: PortableTextBlock[];
			category: string;
		}>;
	};
	seo?: {
		metaTitle?: string;
		metaDescription?: string;
		ogImage?: string;
	};
}

export const load: PageServerLoad = async ({ params, locals, setHeaders }) => {
	const { loadQuery, supabase, getUser } = locals as any;

	// Set cache headers for performance
	setHeaders({
		'cache-control': 'private, max-age=0, s-maxage=300' // 5 min server cache
	});

	try {
		// Start all data fetching in parallel for maximum performance
		const [
			userResult,
			eventResult
		] = await Promise.allSettled([
			getUser?.(),
			loadQuery(eventQuery, { slug: params.slug })
		]);

		// Process user data
		const user = userResult.status === 'fulfilled' ? userResult.value : null;
		const isUserAdmin = user ? isAdmin(user.email) : false;

		// Process event data
		if (eventResult.status === 'rejected' || !eventResult.value?.data) {
			throw error(404, 'Event not found');
		}

		const event = eventResult.value as { data: SanityEvent };

		// Parallel fetch for profile and time slots
		const [profileResult, timeSlotsResult] = await Promise.allSettled([
			// Get user profile if logged in
			user ? supabase
				.from('profiles')
				.select('*')
				.eq('id', user.id)
				.single() : Promise.resolve(null),

			// Load time slots for OpenStage if enabled
			event.data.hasOpenStage ? loadQuery(groq`*[_type == "timeSlot" && event._ref == $eventId] | order(startTime asc) {
				_id,
				startTime,
				duration,
				isBlocked,
				isOpenTable,
				maxParticipants,
				openTableSettings,
				bookings
			}`, { eventId: event.data._id }) : Promise.resolve({ data: [] })
		]);

		const userProfile = profileResult.status === 'fulfilled' ? profileResult.value?.data : null;
		const timeSlots = timeSlotsResult.status === 'fulfilled' ? timeSlotsResult.value?.data || [] : [];

		// Transform event data with optimized structure
		const transformedEvent = {
			...event.data,
			// Keep images as-is for lazy loading
			image: event.data.image,
			gallery: event.data.gallery,
			locationDetails: event.data.locationDetails && {
				...event.data.locationDetails,
				image: event.data.locationDetails.image
			},
			// Transform artists
			artists: event.data.artists?.map((artist: any) => ({
				...artist,
				image: artist.image
			})),
			// Ensure FAQ section is properly structured
			faqSection: event.data.faqSection ? {
				...event.data.faqSection,
				title: event.data.faqSection.title || 'Häufig gestellte Fragen',
				description: event.data.faqSection.description || '',
				showCategories: event.data.faqSection.showCategories ?? true,
				selectedFaqs: event.data.faqSection.selectedFaqs || []
			} : undefined,
			// Transform schedule with optimized date handling
			schedule: event.data.schedule ? {
				isSecret: event.data.schedule.isSecret || false,
				days: (event.data.schedule.days || []).map((day: any) => ({
					date: new Date(day.date || new Date()).toISOString(),
					stages: (day.stages || []).map((stage: any) => ({
						name: stage.name || '',
						description: stage.description || '',
						schedule: (stage.schedule || []).map((item: any) => ({
							time: item.time || '',
							title: item.title || '',
							description: item.description || '',
							icon: item.icon || '',
							instructor: item.instructor ? {
								name: item.instructor.name || '',
								role: item.instructor.role || '',
								image: item.instructor.image ? urlFor(item.instructor.image).url() : undefined
							} : undefined,
							instructors: item.instructors?.map((inst: any) => ({
								name: inst.name || '',
								role: inst.role || '',
								image: inst.image ? urlFor(inst.image).url() : undefined
							})) || [],
							instructorDisplayMode: item.instructorDisplayMode || 'all',
							allowRegistration: item.allowRegistration || false,
							registrationStartTime: item.registrationStartTime || null,
							maxRegistrations: item.maxRegistrations || null,
							registrationRequired: item.registrationRequired || false,
							isOpenTable: item.isOpenTable || false,
							openTableSettings: item.openTableSettings ? {
								autoAcceptRegistrations: item.openTableSettings.autoAcceptRegistrations ?? true,
								showRemainingSlots: item.openTableSettings.showRemainingSlots ?? true,
								waitlistEnabled: item.openTableSettings.waitlistEnabled ?? false,
								description: item.openTableSettings.description || ''
							} : undefined
						}))
					}))
				})).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
			} : undefined
		};

		return {
			event: transformedEvent,
			timeSlots,
			isAdmin: isUserAdmin,
			user: user ? { id: user.id, email: user.email } : null,
			userProfile
		};
	} catch (err) {
		console.error('Error loading event:', err);
		if (err instanceof Error && 'status' in err) {
			throw err;
		}
		throw error(500, 'Could not load event');
	}
};