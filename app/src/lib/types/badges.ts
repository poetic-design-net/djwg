export interface SanityImage {
    asset: {
        _type: string;
        _ref: string;
    };
}

export interface SanityBadge {
    _id: string;
    supabaseId: string;
    name: string;
    description?: string;
    slug: {
        current: string;
    };
    icon?: SanityImage;
    style?: {
        customColor?: {
            hex: string;
        };
        borderStyle?: 'solid' | 'dashed' | 'double';
        variant?: 'gold' | 'silver' | 'bronze' | 'custom' | 'premium';
    };
    permissions?: Array<{
        resource: string;
        action: string;
    }>;
}

export interface DisplayBadge {
    _id: string;
    name: string;
    description?: string;
    unlockCondition?: string;
    unlockReward?: string;
    icon?: SanityImage;
    style?: {
        customColor?: {
            hex: string;
        };
        borderStyle?: string;
        variant?: string;
    };
    isUnlocked: boolean;
}

export interface BadgeUnlockInfo {
    condition: string;
    reward: string;
}

export const BADGE_UNLOCK_CONDITIONS: Record<string, BadgeUnlockInfo> = {
    'premium': {
        condition: 'Werde ein Premium-Mitglied der Community',
        reward: 'Zugang zu exklusiven Events und Inhalten'
    },
    'dj-level-1': {
        condition: 'Vervollständige dein Profil zu 100%',
        reward: 'Freischaltung der DJ-Features Level 1'
    }
};