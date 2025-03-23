import db from "../config/database";
import { GameMode } from "../models/IGDBGameResponse";

export const getAllGameModes = async () => {
    try {
        return await db.getAllAsync<GameMode>(
            "SELECT id, name FROM game_modes ORDER BY name ASC"
        );
    } catch (error) {
        console.error("Error getting game modes:", error);
        throw error;
    }
};

export const getGameModeById = async (id: number) => {
    try {
        const query = "SELECT id, name FROM game_modes WHERE id = " + id;
        const [gameMode] = await db.getAllAsync<GameMode>(query);
        return gameMode;
    } catch (error) {
        console.error("Error getting game mode by id:", error);
        throw error;
    }
};

export const createGameMode = async (gameMode: Omit<GameMode, "id">) => {
    try {
        const query = `INSERT OR IGNORE INTO game_modes (name) VALUES ('${gameMode.name}')`;
        await db.execAsync(query);
        const [result] = await db.getAllAsync<{ id: number }>(
            "SELECT last_insert_rowid() as id"
        );
        return result.id;
    } catch (error) {
        console.error("Error creating game mode:", error);
        throw error;
    }
};

export const updateGameMode = async (gameMode: GameMode) => {
    try {
        const query = `UPDATE game_modes SET name = '${gameMode.name}' WHERE id = ${gameMode.id}`;
        await db.execAsync(query);
    } catch (error) {
        console.error("Error updating game mode:", error);
        throw error;
    }
};

export const deleteGameMode = async (id: number) => {
    try {
        const query = `DELETE FROM game_modes WHERE id = ${id}`;
        await db.execAsync(query);
    } catch (error) {
        console.error("Error deleting game mode:", error);
        throw error;
    }
};

export const getOrCreateGameMode = async (gameMode: GameMode) => {
    try {
        let existingGameMode = await getGameModeById(gameMode.id);
        if (!existingGameMode) {
            const query = `INSERT OR IGNORE INTO game_modes (id, name) VALUES (${gameMode.id}, '${gameMode.name}')`;
            await db.execAsync(query);
            existingGameMode = gameMode;
        }
        return existingGameMode;
    } catch (error) {
        console.error("Error getting or creating game mode:", error);
        throw error;
    }
};

export const getGameModesForGame = async (gameId: number) => {
    try {
        const query = `
            SELECT gm.id, gm.name 
            FROM game_modes gm
            INNER JOIN game_modes_map gmm ON gm.id = gmm.game_mode_id
            WHERE gmm.game_id = ${gameId}
            ORDER BY gm.name ASC
        `;
        return await db.getAllAsync<GameMode>(query);
    } catch (error) {
        console.error("Error getting game modes for game:", error);
        throw error;
    }
};

export const addGameModeToGame = async (gameId: number, gameModeId: number) => {
    try {
        const query = `INSERT OR IGNORE INTO game_modes_map (game_id, game_mode_id) VALUES (${gameId}, ${gameModeId})`;
        await db.execAsync(query);
    } catch (error) {
        console.error("Error adding game mode to game:", error);
        throw error;
    }
};

export const removeGameModeFromGame = async (
    gameId: number,
    gameModeId: number
) => {
    try {
        const query = `DELETE FROM game_modes_map WHERE game_id = ${gameId} AND game_mode_id = ${gameModeId}`;
        await db.execAsync(query);
    } catch (error) {
        console.error("Error removing game mode from game:", error);
        throw error;
    }
};
