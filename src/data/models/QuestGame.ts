import { GameStatus } from "src/constants/config/gameStatus";
import { IGDBGameResponse } from "./IGDBGameResponse";

/**
 * Represents a game in the user's quest log, extending the base game details
 * with user-specific information and tracking data.
 */
export interface QuestGame extends IGDBGameResponse {
    // User-specific tracking fields
    gameStatus: GameStatus; // Current status of the game in user's quest log
    personalRating?: number; // User's personal rating of the game
    completionDate?: string; // Date when the user completed the game
    notes?: string; // Personal notes or thoughts about the game
    dateAdded: string; // Date when the game was added to the quest log
    priority?: number; // User's priority level for playing this game
    selectedPlatform: { id: number; name: string }; // The platform the user chose to play the game on
    franchises: { id: number; name: string }[];
    updatedAt: string; // Date when the game was last updated
    createdAt: string; // Date when the game was added to the quest log
}
