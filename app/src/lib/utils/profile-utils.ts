interface ProfileField {
    name: string;
    value: any;
    category: string;
    required: boolean;
}

export function getProfileFields(profile: any, firstName: string, lastName: string, socialLinks: {
    instagram?: string;
    facebook?: string;
    soundcloud?: string;
}): { [key: string]: ProfileField[] } {
    return {
            'Basis-Informationen': [
                { name: 'Vorname', value: firstName, category: 'basis', required: true },
                { name: 'Nachname', value: lastName, category: 'basis', required: true },
                { name: 'Username', value: profile?.username, category: 'basis', required: true },
                { name: 'Profilbild', value: profile?.avatar_url, category: 'basis', required: false },
                { name: 'Biografie', value: profile?.bio, category: 'basis', required: false }
            ],
            'Kontaktdaten': [
                { name: 'Telefon', value: profile?.phone, category: 'kontakt', required: false },
                { name: 'Straße', value: profile?.address_street, category: 'kontakt', required: false },
                { name: 'Stadt', value: profile?.address_city, category: 'kontakt', required: false },
                { name: 'PLZ', value: profile?.address_zip, category: 'kontakt', required: false },
                { name: 'Land', value: profile?.address_country, category: 'kontakt', required: false }
            ],
            'Social Media': [
                { name: 'Instagram', value: socialLinks?.instagram, category: 'social', required: false },
                { name: 'Facebook', value: socialLinks?.facebook, category: 'social', required: false },
                { name: 'Soundcloud', value: socialLinks?.soundcloud, category: 'social', required: false }
            ]
         };
}
export function calculateProfileCompletion(profile: any, firstName: string, lastName: string, socialLinks: {
    instagram?: string;
    facebook?: string;
    soundcloud?: string;
}) {
    const fields = [
        firstName,
        lastName,
        profile?.username,
        profile?.avatar_url,
        profile?.bio,
        profile?.phone,
        profile?.address_street,
        profile?.address_city,
        profile?.address_zip,
        profile?.address_country
    ];

    const socialFields = [
        socialLinks?.instagram,
        socialLinks?.facebook,
        socialLinks?.soundcloud
    ];

    // Basis-Felder (80% des Gesamtprozentsatzes)
    const filledFields = fields.filter(field => !!field).length;
    const basePercentage = (filledFields / fields.length) * 80;

    // Social Media als Bonus (20% des Gesamtprozentsatzes)
    const filledSocialFields = socialFields.filter(field => !!field).length;
    const socialPercentage = (filledSocialFields / socialFields.length) * 20;

    return Math.min(100, Math.round(basePercentage + socialPercentage));
}

export function calculateCategoryCompletion(fields: ProfileField[]): number {
    const requiredFields = fields.filter(field => field.required);
    if (requiredFields.length === 0) {
        const filledFields = fields.filter(field => !!field.value).length;
        return Math.round((filledFields / fields.length) * 100);
    }
    
    const filledRequiredFields = requiredFields.filter(field => !!field.value).length;
    return Math.round((filledRequiredFields / requiredFields.length) * 100);
}

export function getNextRequiredField(profileFields: { [key: string]: ProfileField[] }): string | null {
    for (const [category, fields] of Object.entries(profileFields)) {
        for (const field of fields) {
            if (field.required && !field.value) {
                return `${category}: ${field.name}`;
            }
        }
    }
    return null;
}