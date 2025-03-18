import { GameListItem } from "./GameListItem";

export interface QuestGameListItem extends GameListItem {
    gameStatus: GameStatus;
    personalRating?: number;
    completionDate?: string;
    notes?: string;
    dateAdded: string;
    platform: string;
    priority?: number;
}
