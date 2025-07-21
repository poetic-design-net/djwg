import { json, error } from '@sveltejs/kit';
import { stripe, getPricingPlans } from '$lib/stripe/server';
import { supabaseAdmin } from '$lib/supabase/admin';
import type { RequestHandler } from './$types';
import Stripe from 'stripe';

export const POST: RequestHandler = async ({ request, locals, url }) => {
	try {
		const { plan: planKey, successUrl, cancelUrl } = await request.json();

		if (!locals.user) {
			return error(401, 'Nicht authentifiziert');
		}

		if (!planKey) {
			return error(400, 'Ungültiger Preisplan');
		}

		// Pläne aus Sanity holen
		const allPlans = await getPricingPlans();
		const planConfig = allPlans.find((p) => p.key === planKey);

		if (!planConfig) {
			return error(400, 'Preisplan nicht gefunden');
		}

		const userId = locals.user.id;

		// E-Mail-Adresse aus der Supabase auth.users Tabelle abrufen
		const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);

		if (userError || !userData.user?.email) {
			return error(400, 'Benutzer-E-Mail-Adresse nicht gefunden');
		}

		const userEmail = userData.user.email;

		// Prüfen ob bereits ein aktives Abonnement existiert
		const { data: existingSub } = await supabaseAdmin
			.from('nextlevel_subscriptions')
			.select('*')
			.eq('user_id', userId)
			.in('status', ['active', 'trialing'])
			.single();

		if (existingSub) {
			return error(400, 'Bereits ein aktives Abonnement vorhanden');
		}

		// Stripe Customer erstellen oder abrufen
		let customerId: string;

		const existingCustomers = await stripe.customers.list({
			email: userEmail,
			limit: 1
		});

		if (existingCustomers.data.length > 0) {
			customerId = existingCustomers.data[0].id;
		} else {
			const customer = await stripe.customers.create({
				email: userEmail,
				metadata: {
					userId: userId
				}
			});
			customerId = customer.id;
		}

		// Eindeutige ID für das Stripe-Produkt, basierend auf dem Sanity-Plan-Key
		const productId = `nextlevel-dj-${planConfig.key}`;

		// Stripe Product und Price erstellen/abrufen
		let priceId: string;

		try {
			let product;
			try {
				product = await stripe.products.retrieve(productId);
			} catch (e) {
				if (e instanceof Stripe.errors.StripeInvalidRequestError && e.code === 'resource_missing') {
					product = await stripe.products.create({
						id: productId,
						name: `NextLevel DJs Academy - ${planConfig.name}`,
						description: planConfig.description,
						metadata: {
							planKey: planConfig.key
						}
					});
				} else {
					throw e;
				}
			}

			const prices = await stripe.prices.list({
				product: product.id,
				limit: 1
			});

			if (prices.data.length > 0 && prices.data[0].unit_amount === planConfig.price) {
				priceId = prices.data[0].id;
			} else {
				// Archivieren alter Preise, falls sich der Preis geändert hat
				for (const oldPrice of prices.data) {
					if (oldPrice.active) {
						await stripe.prices.update(oldPrice.id, { active: false });
					}
				}

				const price = await stripe.prices.create({
					product: product.id,
					unit_amount: planConfig.price,
					currency: 'eur',
					recurring: {
						interval: planConfig.interval,
						interval_count: planConfig.intervalCount
					},
					metadata: {
						planKey: planConfig.key,
						...(planConfig.originalPrice && {
							originalPrice: planConfig.originalPrice.toString()
						})
					}
				});
				priceId = price.id;
			}
		} catch (stripeError) {
			console.error('Stripe product/price error:', stripeError);
			return error(500, 'Fehler bei der Preiserstellung');
		}

		// Checkout Session erstellen
		const session = await stripe.checkout.sessions.create({
			customer: customerId,
			payment_method_types: ['card', 'sepa_debit', 'giropay'],
			line_items: [
				{
					price: priceId,
					quantity: 1
				}
			],
			mode: 'subscription',
			success_url: successUrl || `${url.origin}/nextlevel-djs/success?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: cancelUrl || `${url.origin}/nextlevel-djs?canceled=true`,
			metadata: {
				userId: userId,
				planKey: planConfig.key
			},
			subscription_data: {
				metadata: {
					userId: userId,
					planKey: planConfig.key
				}
			},
			allow_promotion_codes: true,
			billing_address_collection: 'required',
			customer_update: {
				address: 'auto',
				name: 'auto'
			}
		});

		return json({
			url: session.url
		});
	} catch (err) {
		console.error('Checkout session error:', err);
		if (err instanceof Error) {
			return error(500, err.message);
		}
		return error(500, 'Fehler beim Erstellen der Checkout-Session');
	}
};