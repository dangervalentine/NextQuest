import { GameDetails } from "./GameDetails";

export interface QuestGame extends GameDetails {
    gameStatus: GameStatus;
    personalRating?: number;
    completionDate?: string;
    notes?: string;
    dateAdded: string;
}
