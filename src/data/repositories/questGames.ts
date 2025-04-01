import db from "../config/database";
import { QuestGame } from "../models/QuestGame";
import { MinimalQuestGame } from "../models/MinimalQuestGame";
import * as igdbRepo from "./igdbGames";
import { getMinimalIGDBGameById } from "./igdbGames";
import { GameStatus } from "src/constants/config/gameStatus";

export const createQuestGameData = async (
    gameId: number,
    questData: {
        game_status?: GameStatus;
        personal_rating?: number | null;
        completion_date?: string | null;
        notes?: string | null;
        date_added?: string;
        priority?: number;
        selected_platform_id?: number | null;
    }
) => {
    await db.execAsync("BEGIN TRANSACTION");

    try {
        // Get the status id from the status name
        const [status] = await db.getAllAsync<{ id: number }>(
            `SELECT id FROM quest_game_status WHERE name = '${
                questData.game_status || "undiscovered"
            }'`
        );

        if (!status) {
            throw new Error(`Could not find status in quest_game_status table`);
        }

        // Insert quest game data
        const query = `
            INSERT OR REPLACE INTO quest_games (
                game_id,
                status_id,
                personal_rating,
                completion_date,
                notes,
                date_added,
                priority,
                selected_platform_id
            ) VALUES (
                ${gameId},
                ${status.id},
                ${
                    questData.personal_rating !== undefined
                        ? questData.personal_rating
                        : "NULL"
                },
                ${
                    questData.completion_date
                        ? `'${questData.completion_date}'`
                        : "NULL"
                },
                ${
                    questData.notes
                        ? `'${questData.notes.replace(/'/g, "''")}'`
                        : "NULL"
                },
                '${questData.date_added || new Date().toISOString()}',
                ${questData.priority || 0},
                ${questData.selected_platform_id || "NULL"}
            )
        `;

        await db.execAsync(query);

        await db.execAsync("COMMIT");
    } catch (error) {
        await db.execAsync("ROLLBACK");
        console.error(
            "[createQuestGameData] Error creating quest game data:",
            error
        );
        throw error;
    }
};

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
        platforms: questGameRow.platform_name
            ? [
                  {
                      id: questGameRow.selected_platform_id,
                      name: questGameRow.platform_name,
                  },
              ]
            : [],
        selectedPlatform: questGameRow.platform_name
            ? {
                  id: questGameRow.selected_platform_id,
                  name: questGameRow.platform_name,
              }
            : undefined,
        genres: questGameRow.genres
            ? questGameRow.genres.split(",").map((x: string) => ({ name: x }))
            : [],
        release_dates: igdbGame.release_dates,
    };
};

export const getQuestGamesByStatus = async (
    status: GameStatus
): Promise<MinimalQuestGame[]> => {
    try {
        const query = `
            SELECT 
                qg.game_id, 
                qg.personal_rating, 
                qg.completion_date, 
                qg.notes, 
                qg.date_added, 
                qg.priority, 
                qg.selected_platform_id,
                qg.createdAt, 
                qg.updatedAt,
                qs.name as game_status,
                p.name as platform_name,
                (
                    SELECT GROUP_CONCAT(g.name)
                    FROM game_genres gg 
                    JOIN genres g ON gg.genre_id = g.id
                    WHERE gg.game_id = qg.game_id
                ) as genres
            FROM quest_games qg
            JOIN quest_game_status qs ON qg.status_id = qs.id
            LEFT JOIN platforms p ON qg.selected_platform_id = p.id
            WHERE qs.name = '${status}'
            ORDER BY qg.priority DESC NULLS LAST, qg.updatedAt DESC
        `;

        const games = await db.getAllAsync(query);

        return Promise.all(games.map(parseMinimalQuestGame));
    } catch (error) {
        console.error("[getQuestGamesByStatus] Error:", error);
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
        if (updates.length === 0) return;

        await db.execAsync("BEGIN TRANSACTION");

        if (updates.length === 1) {
            // Simple single update
            const update = updates[0];
            await db.execAsync(`
                UPDATE quest_games
                SET priority = ${update.priority}
                WHERE game_id = ${update.id}
            `);
        } else {
            // Multiple updates using CASE
            const priorityCases = updates
                .map(
                    (update) =>
                        `WHEN game_id = ${update.id} THEN ${update.priority}`
                )
                .join("\n                ");

            const gameIds = updates.map((update) => update.id).join(", ");

            await db.execAsync(`
                UPDATE quest_games
                SET priority = CASE
                    ${priorityCases}
                END
                WHERE game_id IN (${gameIds})
            `);
        }

        await db.execAsync("COMMIT");
    } catch (error) {
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

export const doesGameExist = async (id: number): Promise<QuestGame | null> => {
    try {
        // First check if the game exists in the games table
        const [gameExists] = await db.getAllAsync(
            `SELECT 1 FROM games WHERE id = ${id} LIMIT 1`
        );

        if (!gameExists) {
            return null;
        }

        // Then check if it exists in quest_games and get the full quest game data
        return await getQuestGameById(id);
    } catch (error) {
        console.error(
            "[doesGameExistInBothTables] Error checking game existence:",
            error
        );
        throw error;
    }
};
