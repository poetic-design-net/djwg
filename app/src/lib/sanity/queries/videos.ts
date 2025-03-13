import type { SanityDocument } from '@sanity/client';

export interface VideoAsset {
    url: string;
}

export interface VideoFile {
    asset: VideoAsset;
}

export interface Badge {
    _id: string;
    supabaseId: string;
    slug: {
        current: string;
    };
    name: string;
    description?: string;
}

export interface VideoCategory {
    _id: string;
    title: string;
    slug: {
        current: string;
    };
    description?: string;
    sortOrder: number;
    icon?: {
        asset: {
            url: string;
        };
    };
}

export interface Video extends SanityDocument {
    title: string;
    description?: string;
    videoFile: VideoFile;
    thumbnail?: {
        asset: {
            url: string;
        };
    };
    category: VideoCategory;
    requiredBadges: Badge[];
}

export type VideoResponse = {
    data: Video;
};

export const videoByIdQuery = (id: string) => `
    *[_type == "video" && _id == "${id}"][0] {
        _id,
        title,
        videoFile {
            asset-> {
                url
            }
        },
        category->,
        "requiredBadges": requiredBadges[]-> {
            _id,
            slug,
            supabaseId,
            name,
            description
        }
    }
`;

export const videosQuery = `
    *[_type == "video"] | order(category->sortOrder asc, sortOrder asc) {
        _id,
        title,
        description,
        videoFile {
            asset-> {
                url
            }
        },
        thumbnail {
            asset-> {
                url
            }
        },
        category-> {
            _id,
            title,
            "slug": slug.current,
            description,
            sortOrder,
            icon {
                asset-> {
                    url
                }
            }
        },
        "requiredBadges": requiredBadges[]-> {
            _id,
            "slug": slug.current,
            supabaseId,
            name,
            description
        }
    }
`;