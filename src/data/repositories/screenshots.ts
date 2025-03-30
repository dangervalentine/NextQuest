import db from "../config/database";
import { Screenshot } from "../models/IGDBGameResponse";

export const getScreenshotById = async (id: number) => {
    try {
        const query =
            "SELECT id, game_id, url FROM screenshots WHERE id = " + id;
        const [screenshot] = await db.getAllAsync<Screenshot>(query);
        return screenshot;
    } catch (error) {
        console.error("Error getting screenshot by id:", error);
        throw error;
    }
};

export const getScreenshotsForGame = async (gameId: number) => {
    try {
        const query =
            "SELECT id, game_id, url FROM screenshots WHERE game_id = " +
            gameId;
        return await db.getAllAsync<Screenshot>(query);
    } catch (error) {
        console.error("Error getting screenshots for game:", error);
        throw error;
    }
};

export const createScreenshot = async (screenshot: Omit<Screenshot, "id">) => {
    try {
        const query = `INSERT INTO screenshots (game_id, url) VALUES (${screenshot.game_id}, '${screenshot.url}')`;
        await db.execAsync(query);
        const [result] = await db.getAllAsync<{ id: number }>(
            "SELECT last_insert_rowid() as id"
        );
        return result.id;
    } catch (error) {
        console.error("Error creating screenshot:", error);
        throw error;
    }
};

export const updateScreenshot = async (screenshot: Screenshot) => {
    try {
        const query = `UPDATE screenshots SET url = '${screenshot.url}' WHERE id = ${screenshot.id}`;
        await db.execAsync(query);
    } catch (error) {
        console.error("Error updating screenshot:", error);
        throw error;
    }
};

export const deleteScreenshot = async (id: number) => {
    try {
        const query = `DELETE FROM screenshots WHERE id = ${id}`;
        await db.execAsync(query);
    } catch (error) {
        console.error("Error deleting screenshot:", error);
        throw error;
    }
};

export const deleteScreenshotsForGame = async (gameId: number) => {
    try {
        const query = `DELETE FROM screenshots WHERE game_id = ${gameId}`;
        await db.execAsync(query);
    } catch (error) {
        console.error("Error deleting screenshots for game:", error);
        throw error;
    }
};

export const getOrCreateScreenshot = async (screenshot: Screenshot) => {
    try {
        let existingScreenshot = await getScreenshotById(screenshot.id);
        if (!existingScreenshot) {
            const query = `INSERT OR IGNORE INTO screenshots (id, game_id, url) VALUES (${screenshot.id}, ${screenshot.game_id}, '${screenshot.url}')`;
            await db.execAsync(query);
            existingScreenshot = screenshot;
        }
        return existingScreenshot;
    } catch (error) {
        console.error("Error getting or creating screenshot:", error);
        throw error;
    }
};








