import db from "../config/database";

export const getAllPlatforms = async () => {
    try {
        return await db.getAllAsync<{ id: number; name: string }>(
            "SELECT id, name FROM platforms ORDER BY name ASC"
        );
    } catch (error) {
        console.error("Error getting platforms:", error);
        throw error;
    }
};

export const getPlatformById = async (id: number) => {
    try {
        const result = await db.getAllAsync<{ id: number; name: string }>(
            "SELECT id, name FROM platforms WHERE id = ?",
            [id]
        );
        return result[0];
    } catch (error) {
        console.error("Error getting platform by id:", error);
        throw error;
    }
};

export const getPlatformByName = async (name: string) => {
    try {
        const result = await db.getAllAsync<{ id: number; name: string }>(
            "SELECT id, name FROM platforms WHERE name = ?",
            [name]
        );
        return result[0];
    } catch (error) {
        console.error("Error getting platform by name:", error);
        throw error;
    }
};








