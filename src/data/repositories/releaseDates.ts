import db from "../config/database";
import { Platform } from "../models/IGDBGameResponse";

export interface ReleaseDate {
    id: number;
    game_id: number;
    date: number;
    human: string;
    platform_id: number;
    platform?: Platform;
}

export const getReleaseDateById = async (
    id: number
): Promise<ReleaseDate | null> => {
    try {
        const [releaseDate] = await db.getAllAsync<ReleaseDate>(
            `SELECT * FROM release_dates WHERE id = ${id}`
        );
        return releaseDate
            ? {
                  ...releaseDate,
                  platform_id: releaseDate.platform_id || 0,
              }
            : null;
    } catch (error) {
        console.error("Error getting release date by id:", error);
        throw error;
    }
};

export const getReleaseDatesForGame = async (
    gameId: number
): Promise<ReleaseDate[]> => {
    try {
        const dates = await db.getAllAsync<ReleaseDate>(
            `SELECT * FROM release_dates WHERE game_id = ${gameId} ORDER BY date ASC`
        );
        return dates.map((date) => ({
            ...date,
            platform_id: date.platform_id || 0,
        }));
    } catch (error) {
        console.error("Error getting release dates for game:", error);
        throw error;
    }
};

export const getOrCreateReleaseDate = async (
    releaseDate: ReleaseDate
): Promise<ReleaseDate> => {
    try {
        const existingReleaseDate = await getReleaseDateById(releaseDate.id);
        if (existingReleaseDate) {
            return existingReleaseDate;
        }

        await db.execAsync(`
            INSERT INTO release_dates (
                id, game_id, date, human, platform_id
            ) VALUES (
                ${releaseDate.id},
                ${releaseDate.game_id},
                ${releaseDate.date || "NULL"},
                '${releaseDate.human.replace(/'/g, "''")}',
                ${releaseDate.platform_id}
            )
        `);
        return releaseDate;
    } catch (error) {
        console.error("Error creating release date:", error);
        throw error;
    }
};

export const deleteReleaseDatesForGame = async (
    gameId: number
): Promise<void> => {
    try {
        await db.execAsync(
            `DELETE FROM release_dates WHERE game_id = ${gameId}`
        );
    } catch (error) {
        console.error("Error deleting release dates for game:", error);
        throw error;
    }
};
