import db from "../config/database";
import { GameStatus } from "../../constants/gameStatus";
import { QuestGame } from "../models/QuestGame";

const parseQuestGame = (row: any): QuestGame => {
    return {
        id: row.id,
        name: row.name,
        cover:
            row.cover_id && row.cover_url
                ? {
                      id: row.cover_id,
                      url: row.cover_url,
                  }
                : { id: 0, url: "" },
        genres: JSON.parse(row.genres || "[]"),
        release_dates: JSON.parse(row.release_dates || "[]"),
        rating: row.rating,
        aggregated_rating: row.aggregated_rating,
        age_rating: row.age_rating,
        platforms: JSON.parse(row.platforms || "[]"),
        summary: row.summary,
        screenshots: JSON.parse(row.screenshots || "[]"),
        videos: JSON.parse(row.videos || "[]"),
        involved_companies: JSON.parse(row.involved_companies || "[]"),
        storyline: row.storyline,
        gameStatus: row.game_status as GameStatus,
        personalRating: row.personal_rating,
        completionDate: row.completion_date,
        notes: row.notes,
        dateAdded: row.date_added,
        priority: row.priority,
        platform: {
            id: row.platform_id || 0,
            name: row.platform_name || "",
        },
    };
};

export const getAllQuestGames = async () => {
    try {
        const games = await db.getAllAsync(
            "SELECT * FROM quest_games ORDER BY name ASC"
        );
        return games.map(parseQuestGame);
    } catch (error) {
        console.error("Error getting all quest games:", error);
        throw error;
    }
};

export const getQuestGamesByStatus = async (status: GameStatus) => {
    try {
        const query = `SELECT * FROM quest_games WHERE game_status = '${status}' ORDER BY priority DESC, name ASC`;
        const games = await db.getAllAsync(query);
        return games.map(parseQuestGame);
    } catch (error) {
        console.error("Error getting quest games by status:", error);
        throw error;
    }
};

export const updateQuestGame = async (
    game: Partial<QuestGame> & { id: number }
) => {
    try {
        const updates = [];
        const values = [];

        if (game.name !== undefined) {
            updates.push(`name = '${game.name.replace(/'/g, "''")}'`);
        }
        if (game.gameStatus !== undefined) {
            updates.push(`game_status = '${game.gameStatus}'`);
        }
        if (game.personalRating !== undefined) {
            updates.push(`personal_rating = ${game.personalRating}`);
        }
        if (game.completionDate !== undefined) {
            updates.push(`completion_date = '${game.completionDate}'`);
        }
        if (game.notes !== undefined) {
            updates.push(`notes = '${game.notes.replace(/'/g, "''")}'`);
        }
        if (game.priority !== undefined) {
            updates.push(`priority = ${game.priority}`);
        }
        if (game.platform !== undefined) {
            updates.push(
                `platform_id = ${
                    game.platform.id
                }, platform_name = '${game.platform.name.replace(/'/g, "''")}'`
            );
        }

        if (updates.length > 0) {
            const query = `UPDATE quest_games SET ${updates.join(
                ", "
            )} WHERE id = ${game.id}`;
            await db.execAsync(query);
        }
    } catch (error) {
        console.error("Error updating quest game:", error);
        throw error;
    }
};

export const deleteQuestGame = async (id: number) => {
    try {
        await db.execAsync(`DELETE FROM quest_games WHERE id = ${id}`);
    } catch (error) {
        console.error("Error deleting quest game:", error);
        throw error;
    }
};

export interface GamePriorityUpdate {
    id: number;
    priority: number;
}

export const updateGamePriorities = async (updates: GamePriorityUpdate[]) => {
    try {
        const cases = updates
            .map((update) => `WHEN id = ${update.id} THEN ${update.priority}`)
            .join(" ");
        const ids = updates.map((update) => update.id).join(",");

        const query = `
            UPDATE quest_games 
            SET priority = CASE ${cases} END 
            WHERE id IN (${ids})
        `;

        await db.execAsync(query);
    } catch (error) {
        console.error("Error updating game priorities:", error);
        throw error;
    }
};
