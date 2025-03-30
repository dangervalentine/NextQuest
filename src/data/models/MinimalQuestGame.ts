import { GameStatus } from "src/constants/config/gameStatus";

export interface MinimalQuestGame {
    id: number;
    name: string;
    gameStatus: GameStatus;
    updatedAt: string;
    createdAt: string;
    priority?: number;
    personalRating?: number;
    rating?: number;
    notes?: string;
    dateAdded: string;
    cover?: {
        id: number;
        url: string;
    } | null;
    selectedPlatform?: {
        id: number;
        name: string;
    };
    platforms: Array<{
        id: number;
        name: string;
    }>;
    genres: Array<{
        id: number;
        name: string;
    }>;
    release_dates: Array<{
        id: number;
        date: number;
        platform_id: number;
    }>;
}
