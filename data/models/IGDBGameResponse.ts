/**
 * Interface representing the exact structure of a game response from the IGDB API
 */

// Base entities that don't depend on games
interface Company {
    id: number;
    name: string;
}

interface Genre {
    id: number;
    name: string;
}

interface Platform {
    id: number;
    name: string;
}

interface GameMode {
    id: number;
    name: string;
}

interface PlayerPerspective {
    id: number;
    name: string;
}

interface Theme {
    id: number;
    name: string;
}

// Entities that belong to a specific game
interface Cover {
    id: number;
    game_id: number; // Foreign key to Game
    url: string;
}

interface Screenshot {
    id: number;
    game_id: number; // Foreign key to Game
    url: string;
}

interface AlternativeName {
    id: number;
    game_id: number; // Foreign key to Game
    name: string;
}

interface InvolvedCompany {
    id: number;
    game_id: number; // Foreign key to Game
    company_id: number; // Foreign key to Company
    company: Company;
    developer: boolean;
    publisher: boolean;
}

interface ReleaseDate {
    id: number;
    game_id: number; // Foreign key to Game
    date: number;
    human: string;
    platform_id: number; // Foreign key to Platform
    platform?: Platform;
}

interface Video {
    id: number;
    game_id: number; // Foreign key to Game
    video_id: string;
}

interface Website {
    id: number;
    game_id: number; // Foreign key to Game
    category: number;
    url: string;
}

interface AgeRating {
    id: number;
    game_id: number; // Foreign key to Game
    category: number;
    rating: number;
}

interface DLC {
    id: number;
    game_id: number; // Foreign key to Game
    name: string;
}

interface MultiplayerMode {
    id: number;
    game_id: number; // Foreign key to Game
    campaigncoop: boolean;
    lancoop: boolean;
    onlinecoop: boolean;
    splitscreen: boolean;
}

// Main game interface
interface Game {
    id: number;
    name: string;
    summary: string;
    storyline: string;
    rating: number;
    aggregated_rating: number;
}

// Main interface that represents the API response
export interface IGDBGameResponse extends Game {
    cover?: Omit<Cover, "game_id"> | null;
    platforms?: Platform[];
    release_dates?: Omit<ReleaseDate, "game_id" | "platform">[];
    screenshots?: Omit<Screenshot, "game_id">[];
    videos?: Omit<Video, "game_id">[];
    age_ratings?: Omit<AgeRating, "game_id">[];
    involved_companies?: Omit<InvolvedCompany, "game_id" | "id">[];
    genres?: Genre[];
    game_modes?: GameMode[];
    player_perspectives?: PlayerPerspective[];
    themes?: Theme[];
    alternative_names?: Omit<AlternativeName, "game_id">[];
    websites?: Omit<Website, "game_id">[];
    dlcs?: Omit<DLC, "game_id">[];
    multiplayer_modes?: Omit<MultiplayerMode, "game_id">[];
}

// Export individual interfaces for reuse
export type {
    Game,
    Company,
    Genre,
    Platform,
    GameMode,
    PlayerPerspective,
    Theme,
    Cover,
    Screenshot,
    AlternativeName,
    InvolvedCompany,
    ReleaseDate,
    Video,
    Website,
    AgeRating,
    MultiplayerMode,
    DLC,
};
