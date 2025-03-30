/**
 * Represents detailed information about a game from the IGDB database.
 * This interface contains all the core game information that can be displayed
 * in the application, including basic details and extended metadata.
 */
export interface GameDetails {
    id: number; // Unique identifier for the game in the IGDB database
    name: string; // Official title of the game
    cover: {
        id: number; // Unique identifier for the cover image
        url: string; // URL to the game's cover art
    };
    genres: {
        id: number; // Unique identifier for the genre
        name: string; // Name of the genre (e.g., "Action", "RPG")
    }[];
    release_dates: {
        id: number; // Unique identifier for the release date entry
        platform?: number; // Platform ID this release date applies to
        human?: string; // Human-readable release date (e.g., "2024-03-20")
        date: number; // Unix timestamp of the release date
    }[];
    rating: number | null; // User rating from IGDB (0-100 scale)
    aggregated_rating?: number; // Combined rating from multiple sources
    age_rating?: string; // Official age rating (e.g., "ESRB", "PEGI")
    platforms: {
        id: number; // Platform ID from IGDB
        name: string; // Platform name (e.g., "PlayStation", "PC")
    }[]; // List of platforms the game is available on
    summary?: string; // Brief description or summary of the game
    screenshots?: string[]; // URLs to game screenshots
    videos?: {
        name: string; // Title or description of the video
        url: string; // URL to the video content
    }[];
    involved_companies?: {
        name: string; // Name of the company (developer/publisher)
        role: string; // Role of the company (e.g., "Developer", "Publisher")
    }[];
    storyline?: string; // Detailed storyline or background information
}








