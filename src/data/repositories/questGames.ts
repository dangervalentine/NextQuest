import db from "../config/database";
import { QuestGame } from "../models/QuestGame";
import { MinimalQuestGame } from "../models/MinimalQuestGame";
import * as igdbRepo from "./igdbGames";
import { getMinimalIGDBGameById } from "./igdbGames";
import { GameStatus } from "src/constants/config/gameStatus";

const parseQuestGame = async (row: any): Promise<QuestGame> => {
    // Get the base IGDB game data
    const igdbGame = await igdbRepo.getIGDBGameById(row.game_id);
    if (!igdbGame) {
        throw new Error(`IGDB game data not found for id: ${row.game_id}`);
    }

    // Parse the GROUP_CONCAT results into arrays of objects
    const game_modes = row.game_modes
        ? row.game_modes
              .split(",")
              .map((name: string) => ({ name: name.trim() }))
        : [];
    const player_perspectives = row.player_perspectives
        ? row.player_perspectives
              .split(",")
              .map((name: string) => ({ name: name.trim() }))
        : [];
    const themes = row.themes
        ? row.themes.split(",").map((name: string) => ({ name: name.trim() }))
        : [];

    // Combine IGDB data with quest-specific data
    return {
        ...igdbGame,
        gameStatus: row.game_status as GameStatus,
        personalRating: row.personal_rating,
        completionDate: row.completion_date,
        notes: row.notes,
        dateAdded: row.date_added,
        priority: row.priority,
        selectedPlatform: {
            id: row.selected_platform_id || 0,
            name: row.platform_name || "",
        },
        game_modes,
        player_perspectives,
        themes,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
    };
};

export const getAllQuestGames = async () => {
    try {
        const games = await db.getAllAsync(
            "SELECT * FROM quest_games ORDER BY name ASC"
        );
        return Promise.all(games.map(parseQuestGame));
    } catch (error) {
        console.error("Error getting all quest games:", error);
        throw error;
    }
};

export const parseMinimalQuestGame = async (
    questGameRow: any
): Promise<MinimalQuestGame> => {
    const igdbGame = await getMinimalIGDBGameById(questGameRow.game_id);

    if (!igdbGame) {
        throw new Error(`No IGDB game found for id: ${questGameRow.game_id}`);
    }

    return {
        id: questGameRow.game_id,
        name: igdbGame.name,
        gameStatus: questGameRow.game_status as GameStatus,
        updatedAt: questGameRow.updatedAt,
        createdAt: questGameRow.createdAt,
        priority: questGameRow.priority,
        personalRating: questGameRow.personal_rating,
        notes: questGameRow.notes,
        dateAdded: questGameRow.date_added,
        cover: igdbGame.cover,
        selectedPlatform: questGameRow.platform_name
            ? {
                  id: questGameRow.selected_platform_id,
                  name: questGameRow.platform_name,
              }
            : undefined,
        genres: igdbGame.genres,
        release_dates: igdbGame.release_dates,
    };
};

export const getQuestGamesByStatus = async (
    status: GameStatus
): Promise<MinimalQuestGame[]> => {
    try {
        const query = `
            SELECT qg.game_id, qg.personal_rating, qg.completion_date, 
                   qg.notes, qg.date_added, qg.priority, qg.selected_platform_id,
                   qg.createdAt, qg.updatedAt,
                   qs.name as game_status,
                   p.name as platform_name
            FROM quest_games qg
            JOIN quest_game_status qs ON qg.status_id = qs.id
            LEFT JOIN platforms p ON qg.selected_platform_id = p.id
            WHERE qs.name = '${status}'
            ORDER BY qg.priority DESC NULLS LAST, qg.updatedAt DESC
        `;
        const games = await db.getAllAsync(query);
        return Promise.all(games.map(parseMinimalQuestGame));
    } catch (error) {
        console.error("Error getting quest games by status:", error);
        throw error;
    }
};

export const createQuestGame = async (
    igdbGameId: number,
    platformId: number,
    platformName: string
) => {
    try {
        // First, ensure the IGDB game exists in our database
        const igdbGame = await igdbRepo.getIGDBGameById(igdbGameId);
        if (!igdbGame) {
            throw new Error(`IGDB game not found with id: ${igdbGameId}`);
        }

        // Create the quest game entry
        const query = `
            INSERT INTO quest_games (
                game_id, status_id, selected_platform_id,
                createdAt, updatedAt
            ) VALUES (
                ${igdbGameId},
                (SELECT id FROM quest_game_status WHERE name = 'backlog'),
                ${platformId},
                CURRENT_TIMESTAMP,
                CURRENT_TIMESTAMP
            )
        `;
        await db.execAsync(query);

        return await getQuestGameById(igdbGameId);
    } catch (error) {
        console.error("Error creating quest game:", error);
        throw error;
    }
};

export const updateQuestGame = async (
    game: Partial<QuestGame> & { id: number }
) => {
    try {
        const updates = ["updatedAt = CURRENT_TIMESTAMP"];

        if (game.gameStatus !== undefined) {
            updates.push(
                `status_id = (SELECT id FROM quest_game_status WHERE name = '${game.gameStatus}')`
            );
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
        if (game.selectedPlatform !== undefined) {
            updates.push(`selected_platform_id = ${game.selectedPlatform.id}`);
        }

        if (updates.length > 0) {
            const query = `UPDATE quest_games SET ${updates.join(
                ", "
            )} WHERE game_id = ${game.id}`;
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
    id: number; // This is the game_id
    priority: number;
}

export const updateGamePriorities = async (updates: GamePriorityUpdate[]) => {
    try {
        // Start transaction
        await db.execAsync("BEGIN TRANSACTION");

        // Create a CASE statement for each game_id to set its new priority
        const priorityCases = updates
            .map(
                (update) =>
                    `WHEN game_id = ${update.id} THEN ${update.priority}`
            )
            .join("\n                ");

        // Create the list of game_ids that are being updated
        const gameIds = updates.map((update) => update.id).join(", ");

        // Single query to update all priorities
        const query = `
            UPDATE quest_games
            SET priority = CASE
                ${priorityCases}
            END
            WHERE game_id IN (${gameIds})
        `;

        await db.execAsync(query);

        // Commit transaction
        await db.execAsync("COMMIT");
    } catch (error) {
        // Rollback on error
        await db.execAsync("ROLLBACK");
        console.error("Error updating game priorities:", error);
        throw error;
    }
};

export const getQuestGameById = async (
    id: number
): Promise<QuestGame | null> => {
    try {
        // First get the main game data
        const [game] = await db.getAllAsync(
            `
            SELECT qg.game_id, qg.personal_rating, qg.completion_date, 
                   qg.notes, qg.date_added, qg.priority, qg.selected_platform_id,
                   qg.createdAt, qg.updatedAt,
                   qs.name as game_status,
                   p.name as platform_name,
                   GROUP_CONCAT(DISTINCT gm.name) as game_modes,
                   GROUP_CONCAT(DISTINCT pp.name) as player_perspectives,
                   GROUP_CONCAT(DISTINCT t.name) as themes
            FROM quest_games qg
            JOIN quest_game_status qs ON qg.status_id = qs.id
            LEFT JOIN platforms p ON qg.selected_platform_id = p.id
            LEFT JOIN game_modes_map gmm ON qg.game_id = gmm.game_id
            LEFT JOIN game_modes gm ON gmm.game_mode_id = gm.id
            LEFT JOIN game_perspectives gp ON qg.game_id = gp.game_id
            LEFT JOIN player_perspectives pp ON gp.perspective_id = pp.id
            LEFT JOIN game_themes gt ON qg.game_id = gt.game_id
            LEFT JOIN themes t ON gt.theme_id = t.id
            WHERE qg.game_id = ${id}
            GROUP BY qg.game_id
        `
        );
        return game ? await parseQuestGame(game) : null;
    } catch (error) {
        console.error("Error getting quest game by id:", error);
        throw error;
    }
};
