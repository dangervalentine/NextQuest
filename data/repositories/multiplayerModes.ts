import db from "../config/database";

export interface MultiplayerMode {
    id: number;
    game_id: number;
    campaigncoop: boolean;
    dropin: boolean;
    lancoop: boolean;
    offlinecoop: boolean;
    offlinecoopmax?: number;
    offlinemax?: number;
    onlinecoop: boolean;
    onlinecoopmax?: number;
    onlinemax?: number;
    splitscreen: boolean;
    splitscreenonline: boolean;
}

const defaultBooleanFields = {
    campaigncoop: false,
    dropin: false,
    lancoop: false,
    offlinecoop: false,
    onlinecoop: false,
    splitscreen: false,
    splitscreenonline: false,
};

export const getMultiplayerModeById = async (
    id: number
): Promise<MultiplayerMode | null> => {
    try {
        const [mode] = await db.getAllAsync<MultiplayerMode>(
            `SELECT * FROM multiplayer_modes WHERE id = ${id}`
        );
        return mode
            ? {
                  ...defaultBooleanFields,
                  ...mode,
                  campaigncoop: Boolean(mode.campaigncoop),
                  dropin: Boolean(mode.dropin),
                  lancoop: Boolean(mode.lancoop),
                  offlinecoop: Boolean(mode.offlinecoop),
                  onlinecoop: Boolean(mode.onlinecoop),
                  splitscreen: Boolean(mode.splitscreen),
                  splitscreenonline: Boolean(mode.splitscreenonline),
              }
            : null;
    } catch (error) {
        console.error("Error getting multiplayer mode by id:", error);
        throw error;
    }
};

export const getMultiplayerModesForGame = async (
    gameId: number
): Promise<MultiplayerMode[]> => {
    try {
        const modes = await db.getAllAsync<MultiplayerMode>(
            `SELECT * FROM multiplayer_modes WHERE game_id = ${gameId}`
        );
        return modes.map((mode) => ({
            ...defaultBooleanFields,
            ...mode,
            campaigncoop: Boolean(mode.campaigncoop),
            dropin: Boolean(mode.dropin),
            lancoop: Boolean(mode.lancoop),
            offlinecoop: Boolean(mode.offlinecoop),
            onlinecoop: Boolean(mode.onlinecoop),
            splitscreen: Boolean(mode.splitscreen),
            splitscreenonline: Boolean(mode.splitscreenonline),
        }));
    } catch (error) {
        console.error("Error getting multiplayer modes for game:", error);
        throw error;
    }
};

export const getOrCreateMultiplayerMode = async (
    mode: MultiplayerMode
): Promise<MultiplayerMode> => {
    try {
        const existingMode = await getMultiplayerModeById(mode.id);
        if (existingMode) {
            return existingMode;
        }

        await db.execAsync(`
            INSERT INTO multiplayer_modes (
                id, game_id, campaigncoop, dropin, lancoop,
                offlinecoop, offlinecoopmax, offlinemax,
                onlinecoop, onlinecoopmax, onlinemax,
                splitscreen, splitscreenonline
            ) VALUES (
                ${mode.id},
                ${mode.game_id},
                ${mode.campaigncoop ? 1 : 0},
                ${mode.dropin ? 1 : 0},
                ${mode.lancoop ? 1 : 0},
                ${mode.offlinecoop ? 1 : 0},
                ${mode.offlinecoopmax || "NULL"},
                ${mode.offlinemax || "NULL"},
                ${mode.onlinecoop ? 1 : 0},
                ${mode.onlinecoopmax || "NULL"},
                ${mode.onlinemax || "NULL"},
                ${mode.splitscreen ? 1 : 0},
                ${mode.splitscreenonline ? 1 : 0}
            )
        `);
        return {
            ...defaultBooleanFields,
            ...mode,
        };
    } catch (error) {
        console.error("Error creating multiplayer mode:", error);
        throw error;
    }
};

export const deleteMultiplayerModesForGame = async (
    gameId: number
): Promise<void> => {
    try {
        await db.execAsync(
            `DELETE FROM multiplayer_modes WHERE game_id = ${gameId}`
        );
    } catch (error) {
        console.error("Error deleting multiplayer modes for game:", error);
        throw error;
    }
};
