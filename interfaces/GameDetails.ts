export interface GameDetails {
    id: number; // Unique ID of the game
    name: string; // Game title
    cover_url: string; // URL for the game cover image
    age_rating: string;
    platforms: string[]; // Platforms the game is available on
    release_date: string; // Release date (could also be a Date object if needed)
    aggregated_rating: number;
    rating: number; // Game rating (could be decimal)
    genres: string[]; // Genres of the game
    summary: string; // A brief summary or description of the game
    screenshots: string[]; // Array of URLs to screenshots
    videos: string[]; // Array of video IDs or URLs
    involved_companies: {
        name: string; // Company name (could be developer, publisher, etc.)
        role: string; // Role of the company (e.g., "Developer", "Publisher")
    }[]; // Companies involved in the game's development/publishing
    storyline: string; // Detailed storyline or background information of the game
}
