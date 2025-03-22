export { initializeDatabase } from "./seed/databaseSeeder";
export {
    getAllQuestGames,
    getQuestGamesByStatus,
    updateQuestGame,
    deleteQuestGame,
    updateGamePriorities,
    type GamePriorityUpdate,
} from "./repositories/questGames";
export {
    getAllPlatforms,
    getPlatformById,
    getPlatformByName,
} from "./repositories/platforms";

export { default as db } from "./config/database";
