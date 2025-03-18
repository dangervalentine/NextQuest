export interface GameListItem {
    id: number; // Unique ID of the game
    name: string; // Game title
    cover: { id: number; url: string }; // URL for the game cover image
    genres: { id: number; name: string }[]; // Platforms the game is available on
    release_dates: {
        id: number;
        platform?: number;
        human?: string;
        date: number;
    }[]; // Release date (could also be a Date object if needed)
    rating: number | null; // Game rating (could be decimal)
}
