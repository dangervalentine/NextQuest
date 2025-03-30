import db from "../config/database";
import { Cover } from "../models/IGDBGameResponse";

export const getCoverById = async (id: number) => {
    try {
        const query = "SELECT id, game_id, url FROM covers WHERE id = " + id;
        const [cover] = await db.getAllAsync<Cover>(query);
        return cover;
    } catch (error) {
        console.error("Error getting cover by id:", error);
        throw error;
    }
};

export const getCoverForGame = async (gameId: number) => {
    try {
        const query =
            "SELECT id, game_id, url FROM covers WHERE game_id = " + gameId;
        const [cover] = await db.getAllAsync<Cover>(query);
        return cover;
    } catch (error) {
        console.error("Error getting cover for game:", error);
        throw error;
    }
};

export const createCover = async (cover: Omit<Cover, "id">) => {
    try {
        const query = `INSERT OR REPLACE INTO covers (game_id, url) VALUES (${cover.game_id}, '${cover.url}')`;
        await db.execAsync(query);
        const [result] = await db.getAllAsync<{ id: number }>(
            "SELECT last_insert_rowid() as id"
        );
        return result.id;
    } catch (error) {
        console.error("Error creating cover:", error);
        throw error;
    }
};

export const updateCover = async (cover: Cover) => {
    try {
        const query = `UPDATE covers SET url = '${cover.url}' WHERE id = ${cover.id}`;
        await db.execAsync(query);
    } catch (error) {
        console.error("Error updating cover:", error);
        throw error;
    }
};

export const deleteCover = async (id: number) => {
    try {
        const query = `DELETE FROM covers WHERE id = ${id}`;
        await db.execAsync(query);
    } catch (error) {
        console.error("Error deleting cover:", error);
        throw error;
    }
};

export const getOrCreateCover = async (cover: Cover) => {
    try {
        let existingCover = await getCoverById(cover.id);
        if (!existingCover) {
            const query = `INSERT OR IGNORE INTO covers (id, game_id, url) VALUES (${cover.id}, ${cover.game_id}, '${cover.url}')`;
            await db.execAsync(query);
            existingCover = cover;
        }
        return existingCover;
    } catch (error) {
        console.error("Error getting or creating cover:", error);
        throw error;
    }
};








