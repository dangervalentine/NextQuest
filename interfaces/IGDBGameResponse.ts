/**
 * Interface representing the exact structure of a game response from the IGDB API
 */
export interface IGDBGameResponse {
    id: number;
    age_ratings: {
        id: number;
        category: number;
        rating: number;
    }[];
    cover: {
        id: number;
        url: string;
    };
    genres: {
        id: number;
        name: string;
    }[];
    involved_companies: {
        id: number;
        company: {
            id: number;
            name: string;
        };
        developer: boolean;
        publisher: boolean;
    }[];
    name: string;
    platforms: {
        id: number;
        name: string;
    }[];
    rating: number;
    release_dates: {
        id: number;
        date: number;
        human: string;
        platform: number;
    }[];
    screenshots: {
        id: number;
        url: string;
    }[];
    storyline: string;
    summary: string;
    videos: {
        id: number;
        video_id: string;
    }[];
}
