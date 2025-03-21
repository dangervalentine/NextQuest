import SQLite from "react-native-sqlite-storage";

const db = SQLite.openDatabase(
    {
        name: "QuestLogger.db",
        location: "default",
    },
    () => {
        console.log("Database opened successfully");
    },
    (error) => {
        console.error("Error opening database:", error);
    }
);

export const initializeDatabase = () => {
    db.transaction((tx) => {
        tx.executeSql(
            `CREATE TABLE IF NOT EXISTS games (
                id INTEGER PRIMARY KEY,
                name TEXT,
                platform TEXT,
                rating REAL,
                dateAdded TEXT,
                genres TEXT
            );`
        );
    });
};

export default db;
