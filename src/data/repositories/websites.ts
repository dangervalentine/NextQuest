import db from "../config/database";
import { Website } from "../models/IGDBGameResponse";

export const getWebsiteById = async (id: number) => {
    try {
        const query =
            "SELECT id, game_id, category, url FROM websites WHERE id = " + id;
        const [website] = await db.getAllAsync<Website>(query);
        return website;
    } catch (error) {
        console.error("Error getting website by id:", error);
        throw error;
    }
};

export const getWebsitesForGame = async (gameId: number) => {
    try {
        const query =
            "SELECT id, game_id, category, url FROM websites WHERE game_id = " +
            gameId;
        return await db.getAllAsync<Website>(query);
    } catch (error) {
        console.error("Error getting websites for game:", error);
        throw error;
    }
};

export const getWebsitesByCategory = async (
    gameId: number,
    category: number
) => {
    try {
        const query = `SELECT id, game_id, category, url FROM websites WHERE game_id = ${gameId} AND category = ${category}`;
        return await db.getAllAsync<Website>(query);
    } catch (error) {
        console.error("Error getting websites by category:", error);
        throw error;
    }
};

export const createWebsite = async (website: Omit<Website, "id">) => {
    try {
        const query = `INSERT INTO websites (game_id, category, url) VALUES (${website.game_id}, ${website.category}, '${website.url}')`;
        await db.execAsync(query);
        const [result] = await db.getAllAsync<{ id: number }>(
            "SELECT last_insert_rowid() as id"
        );
        return result.id;
    } catch (error) {
        console.error("Error creating website:", error);
        throw error;
    }
};

export const updateWebsite = async (website: Website) => {
    try {
        const query = `UPDATE websites SET category = ${website.category}, url = '${website.url}' WHERE id = ${website.id}`;
        await db.execAsync(query);
    } catch (error) {
        console.error("Error updating website:", error);
        throw error;
    }
};

export const deleteWebsite = async (id: number) => {
    try {
        const query = `DELETE FROM websites WHERE id = ${id}`;
        await db.execAsync(query);
    } catch (error) {
        console.error("Error deleting website:", error);
        throw error;
    }
};

export const deleteWebsitesForGame = async (gameId: number) => {
    try {
        const query = `DELETE FROM websites WHERE game_id = ${gameId}`;
        await db.execAsync(query);
    } catch (error) {
        console.error("Error deleting websites for game:", error);
        throw error;
    }
};

export const getOrCreateWebsite = async (website: Website) => {
    try {
        let existingWebsite = await getWebsiteById(website.id);
        if (!existingWebsite) {
            const query = `
                INSERT OR IGNORE INTO websites (id, game_id, category, url) 
                VALUES (
                    ${website.id}, 
                    ${website.game_id}, 
                    ${website.category}, 
                    '${website.url.replace(/'/g, "''")}'
                )`;
            await db.execAsync(query);
            existingWebsite = website;
        }
        return existingWebsite;
    } catch (error) {
        console.error("Error getting or creating website:", error, {
            websiteData: website,
        });
        throw error;
    }
};
