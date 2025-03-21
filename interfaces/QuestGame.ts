import { GameStatus } from "../data/types";
import { GameDetails } from "./GameDetails";

/**
 * Represents a game in the user's quest log, extending the base game details
 * with user-specific information and tracking data.
 * This interface combines the game information from IGDB with personal
 * tracking and rating information.
 */
export interface QuestGame extends GameDetails {
    // User-specific tracking fields
    gameStatus?: GameStatus; // Current status of the game in user's quest log
    personalRating?: number; // User's personal rating of the game
    completionDate?: string; // Date when the user completed the game
    notes?: string; // Personal notes or thoughts about the game
    dateAdded?: string; // Date when the game was added to the quest log
    priority?: number; // User's priority level for playing this game
    platform: { id: number; name: string };
}
