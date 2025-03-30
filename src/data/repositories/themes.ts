import db from "../config/database";
import { Theme } from "../models/IGDBGameResponse";

export const getAllThemes = async () => {
    try {
        return await db.getAllAsync<Theme>(
            "SELECT id, name FROM themes ORDER BY name ASC"
        );
    } catch (error) {
        console.error("Error getting themes:", error);
        throw error;
    }
};

export const getThemeById = async (id: number) => {
    try {
        const query = "SELECT id, name FROM themes WHERE id = " + id;
        const [theme] = await db.getAllAsync<Theme>(query);
        return theme;
    } catch (error) {
        console.error("Error getting theme by id:", error);
        throw error;
    }
};

export const createTheme = async (theme: Omit<Theme, "id">) => {
    try {
        const query = `INSERT OR IGNORE INTO themes (name) VALUES ('${theme.name}')`;
        await db.execAsync(query);
        const [result] = await db.getAllAsync<{ id: number }>(
            "SELECT last_insert_rowid() as id"
        );
        return result.id;
    } catch (error) {
        console.error("Error creating theme:", error);
        throw error;
    }
};

export const updateTheme = async (theme: Theme) => {
    try {
        const query = `UPDATE themes SET name = '${theme.name}' WHERE id = ${theme.id}`;
        await db.execAsync(query);
    } catch (error) {
        console.error("Error updating theme:", error);
        throw error;
    }
};

export const deleteTheme = async (id: number) => {
    try {
        const query = `DELETE FROM themes WHERE id = ${id}`;
        await db.execAsync(query);
    } catch (error) {
        console.error("Error deleting theme:", error);
        throw error;
    }
};

export const getOrCreateTheme = async (theme: Theme) => {
    try {
        let existingTheme = await getThemeById(theme.id);
        if (!existingTheme) {
            const query = `INSERT OR IGNORE INTO themes (id, name) VALUES (${theme.id}, '${theme.name}')`;
            await db.execAsync(query);
            existingTheme = theme;
        }
        return existingTheme;
    } catch (error) {
        console.error("Error getting or creating theme:", error);
        throw error;
    }
};

export const getThemesForGame = async (gameId: number) => {
    try {
        const query = `
            SELECT t.id, t.name 
            FROM themes t
            INNER JOIN game_themes gt ON t.id = gt.theme_id
            WHERE gt.game_id = ${gameId}
            ORDER BY t.name ASC
        `;
        return await db.getAllAsync<Theme>(query);
    } catch (error) {
        console.error("Error getting themes for game:", error);
        throw error;
    }
};

export const addThemeToGame = async (gameId: number, themeId: number) => {
    try {
        const query = `INSERT OR IGNORE INTO game_themes (game_id, theme_id) VALUES (${gameId}, ${themeId})`;
        await db.execAsync(query);
    } catch (error) {
        console.error("Error adding theme to game:", error);
        throw error;
    }
};

export const removeThemeFromGame = async (gameId: number, themeId: number) => {
    try {
        const query = `DELETE FROM game_themes WHERE game_id = ${gameId} AND theme_id = ${themeId}`;
        await db.execAsync(query);
    } catch (error) {
        console.error("Error removing theme from game:", error);
        throw error;
    }
};








