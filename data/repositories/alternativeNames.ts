import db from "../config/database";
import { AlternativeName } from "../models/IGDBGameResponse";

export const getAlternativeNameById = async (id: number) => {
    try {
        const query =
            "SELECT id, game_id, name FROM alternative_names WHERE id = " + id;
        const [altName] = await db.getAllAsync<AlternativeName>(query);
        return altName;
    } catch (error) {
        console.error("Error getting alternative name by id:", error);
        throw error;
    }
};

export const getAlternativeNamesForGame = async (gameId: number) => {
    try {
        const query =
            "SELECT id, game_id, name FROM alternative_names WHERE game_id = " +
            gameId;
        return await db.getAllAsync<AlternativeName>(query);
    } catch (error) {
        console.error("Error getting alternative names for game:", error);
        throw error;
    }
};

export const createAlternativeName = async (
    altName: Omit<AlternativeName, "id">
) => {
    try {
        const query = `INSERT INTO alternative_names (game_id, name) VALUES (${altName.game_id}, '${altName.name}')`;
        await db.execAsync(query);
        const [result] = await db.getAllAsync<{ id: number }>(
            "SELECT last_insert_rowid() as id"
        );
        return result.id;
    } catch (error) {
        console.error("Error creating alternative name:", error);
        throw error;
    }
};

export const updateAlternativeName = async (altName: AlternativeName) => {
    try {
        const query = `UPDATE alternative_names SET name = '${altName.name}' WHERE id = ${altName.id}`;
        await db.execAsync(query);
    } catch (error) {
        console.error("Error updating alternative name:", error);
        throw error;
    }
};

export const deleteAlternativeName = async (id: number) => {
    try {
        const query = `DELETE FROM alternative_names WHERE id = ${id}`;
        await db.execAsync(query);
    } catch (error) {
        console.error("Error deleting alternative name:", error);
        throw error;
    }
};

export const deleteAlternativeNamesForGame = async (gameId: number) => {
    try {
        const query = `DELETE FROM alternative_names WHERE game_id = ${gameId}`;
        await db.execAsync(query);
    } catch (error) {
        console.error("Error deleting alternative names for game:", error);
        throw error;
    }
};

export const getOrCreateAlternativeName = async (altName: AlternativeName) => {
    try {
        let existingAltName = await getAlternativeNameById(altName.id);
        if (!existingAltName) {
            const query = `INSERT OR IGNORE INTO alternative_names (id, game_id, name) VALUES (${altName.id}, ${altName.game_id}, '${altName.name}')`;
            await db.execAsync(query);
            existingAltName = altName;
        }
        return existingAltName;
    } catch (error) {
        console.error("Error getting or creating alternative name:", error);
        throw error;
    }
};
