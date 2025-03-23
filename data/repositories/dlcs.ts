import db from "../config/database";

export interface DLC {
    id: number;
    game_id: number;
    name: string;
    summary?: string;
}

export const getDLCById = async (id: number): Promise<DLC | null> => {
    try {
        const [dlc] = await db.getAllAsync<DLC>(
            `SELECT * FROM dlcs WHERE id = ${id}`
        );
        return dlc || null;
    } catch (error) {
        console.error("Error getting DLC by id:", error);
        throw error;
    }
};

export const getDLCsForGame = async (gameId: number): Promise<DLC[]> => {
    try {
        return await db.getAllAsync<DLC>(
            `SELECT * FROM dlcs WHERE game_id = ${gameId} ORDER BY name ASC`
        );
    } catch (error) {
        console.error("Error getting DLCs for game:", error);
        throw error;
    }
};

export const getOrCreateDLC = async (dlc: DLC): Promise<DLC> => {
    try {
        const existingDLC = await getDLCById(dlc.id);
        if (existingDLC) {
            return existingDLC;
        }

        await db.execAsync(`
            INSERT INTO dlcs (
                id, game_id, name, summary
            ) VALUES (
                ${dlc.id},
                ${dlc.game_id},
                '${dlc.name.replace(/'/g, "''")}',
                ${dlc.summary ? `'${dlc.summary.replace(/'/g, "''")}'` : "NULL"}
            )
        `);
        return dlc;
    } catch (error) {
        console.error("Error creating DLC:", error);
        throw error;
    }
};

export const deleteDLCsForGame = async (gameId: number): Promise<void> => {
    try {
        await db.execAsync(`DELETE FROM dlcs WHERE game_id = ${gameId}`);
    } catch (error) {
        console.error("Error deleting DLCs for game:", error);
        throw error;
    }
};
