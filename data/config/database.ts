import * as SQLite from "expo-sqlite";

export const db = SQLite.openDatabaseSync("QuestLogger.db");

export default db;
