import db from "../config/database";
import { PlayerPerspective } from "../models/IGDBGameResponse";

export const getAllPlayerPerspectives = async () => {
    try {
        return await db.getAllAsync<PlayerPerspective>(
            "SELECT id, name FROM player_perspectives ORDER BY name ASC"
        );
    } catch (error) {
        console.error("Error getting player perspectives:", error);
        throw error;
    }
};

export const getPlayerPerspectiveById = async (id: number) => {
    try {
        const query =
            "SELECT id, name FROM player_perspectives WHERE id = " + id;
        const [perspective] = await db.getAllAsync<PlayerPerspective>(query);
        return perspective;
    } catch (error) {
        console.error("Error getting player perspective by id:", error);
        throw error;
    }
};

export const createPlayerPerspective = async (
    perspective: Omit<PlayerPerspective, "id">
) => {
    try {
        const query = `INSERT OR IGNORE INTO player_perspectives (name) VALUES ('${perspective.name}')`;
        await db.execAsync(query);
        const [result] = await db.getAllAsync<{ id: number }>(
            "SELECT last_insert_rowid() as id"
        );
        return result.id;
    } catch (error) {
        console.error("Error creating player perspective:", error);
        throw error;
    }
};

export const updatePlayerPerspective = async (
    perspective: PlayerPerspective
) => {
    try {
        const query = `UPDATE player_perspectives SET name = '${perspective.name}' WHERE id = ${perspective.id}`;
        await db.execAsync(query);
    } catch (error) {
        console.error("Error updating player perspective:", error);
        throw error;
    }
};

export const deletePlayerPerspective = async (id: number) => {
    try {
        const query = `DELETE FROM player_perspectives WHERE id = ${id}`;
        await db.execAsync(query);
    } catch (error) {
        console.error("Error deleting player perspective:", error);
        throw error;
    }
};

export const getOrCreatePlayerPerspective = async (
    perspective: PlayerPerspective
) => {
    try {
        let existingPerspective = await getPlayerPerspectiveById(
            perspective.id
        );
        if (!existingPerspective) {
            const query = `INSERT OR IGNORE INTO player_perspectives (id, name) VALUES (${perspective.id}, '${perspective.name}')`;
            await db.execAsync(query);
            existingPerspective = perspective;
        }
        return existingPerspective;
    } catch (error) {
        console.error("Error getting or creating player perspective:", error);
        throw error;
    }
};

export const getPlayerPerspectivesForGame = async (gameId: number) => {
    try {
        const query = `
            SELECT pp.id, pp.name 
            FROM player_perspectives pp
            INNER JOIN game_perspectives gp ON pp.id = gp.perspective_id
            WHERE gp.game_id = ${gameId}
            ORDER BY pp.name ASC
        `;
        return await db.getAllAsync<PlayerPerspective>(query);
    } catch (error) {
        console.error("Error getting player perspectives for game:", error);
        throw error;
    }
};

export const addPlayerPerspectiveToGame = async (
    gameId: number,
    perspectiveId: number
) => {
    try {
        const query = `INSERT OR IGNORE INTO game_perspectives (game_id, perspective_id) VALUES (${gameId}, ${perspectiveId})`;
        await db.execAsync(query);
    } catch (error) {
        console.error("Error adding player perspective to game:", error);
        throw error;
    }
};

export const removePlayerPerspectiveFromGame = async (
    gameId: number,
    perspectiveId: number
) => {
    try {
        const query = `DELETE FROM game_perspectives WHERE game_id = ${gameId} AND perspective_id = ${perspectiveId}`;
        await db.execAsync(query);
    } catch (error) {
        console.error("Error removing player perspective from game:", error);
        throw error;
    }
};








