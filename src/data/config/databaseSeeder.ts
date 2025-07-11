// import * as FileSystem from 'expo-file-system';

// export const initializeDatabase = async () => {
//     try {
//         const dbPath = FileSystem.documentDirectory + "SQLite/NextQuest.db";

//         // Check if database already exists
//         const dbExists = await FileSystem.getInfoAsync(dbPath);
//         if (dbExists.exists) {
//             console.log("Database already exists");
//             return null;
//         }

//         // Ensure the SQLite directory exists
//         const sqliteDir = FileSystem.documentDirectory + "SQLite";
//         const dirInfo = await FileSystem.getInfoAsync(sqliteDir);
//         if (!dirInfo.exists) {
//             await FileSystem.makeDirectoryAsync(sqliteDir, { intermediates: true });
//         }

//         // Copy the template database from the app bundle
//         // The template.db file should be in your assets folder
//         const templateDbPath = require('../../assets/NextQuest.db');
//         await FileSystem.copyAsync({
//             from: templateDbPath,
//             to: dbPath
//         });

//         console.log("Database initialized from template successfully");
//         return true;
//     } catch (error) {
//         console.error("Database initialization error:", error);
//         throw error;
//     }
// };
