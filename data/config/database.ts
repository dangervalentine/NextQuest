import * as SQLite from "expo-sqlite";

export const db = SQLite.openDatabaseSync("Dygat.db");

export default db;
