// import db from "./database";
// import { QuestGame } from "../models/QuestGame";
// import seedData from "../seed_data.json";
// import platforms from "../platforms.json";

// const createTables = async () => {
//     // Base tables that don't depend on games
//     await db.execAsync(`
//         CREATE TABLE IF NOT EXISTS companies (
//             id INTEGER PRIMARY KEY,
//             name TEXT NOT NULL
//         );
//     `);

//     await db.execAsync(`
//         CREATE TABLE IF NOT EXISTS genres (
//             id INTEGER PRIMARY KEY,
//             name TEXT NOT NULL
//         );
//     `);

//     await db.execAsync(`
//         CREATE TABLE IF NOT EXISTS platforms (
//             id INTEGER PRIMARY KEY,
//             name TEXT NOT NULL
//         );
//     `);

//     await db.execAsync(`
//         CREATE TABLE IF NOT EXISTS game_modes (
//             id INTEGER PRIMARY KEY,
//             name TEXT NOT NULL
//         );
//     `);

//     await db.execAsync(`
//         CREATE TABLE IF NOT EXISTS player_perspectives (
//             id INTEGER PRIMARY KEY,
//             name TEXT NOT NULL
//         );
//     `);

//     await db.execAsync(`
//         CREATE TABLE IF NOT EXISTS themes (
//             id INTEGER PRIMARY KEY,
//             name TEXT NOT NULL
//         );
//     `);

//     await db.execAsync(`
//         CREATE TABLE IF NOT EXISTS franchises (
//             id INTEGER PRIMARY KEY,
//             name TEXT NOT NULL
//         );
//     `);

//     // Main games table
//     await db.execAsync(`
//         CREATE TABLE IF NOT EXISTS games (
//             id INTEGER PRIMARY KEY,
//             name TEXT NOT NULL,
//             summary TEXT,
//             storyline TEXT,
//             rating REAL,
//             aggregated_rating REAL
//         );
//     `);

//     // Game-related tables
//     await db.execAsync(`
//         CREATE TABLE IF NOT EXISTS covers (
//             id INTEGER PRIMARY KEY,
//             game_id INTEGER NOT NULL,
//             url TEXT NOT NULL,
//             FOREIGN KEY(game_id) REFERENCES games(id)
//         );
//     `);

//     await db.execAsync(`
//         CREATE TABLE IF NOT EXISTS screenshots (
//             id INTEGER PRIMARY KEY,
//             game_id INTEGER NOT NULL,
//             url TEXT NOT NULL,
//             FOREIGN KEY(game_id) REFERENCES games(id)
//         );
//     `);

//     await db.execAsync(`
//         CREATE TABLE IF NOT EXISTS alternative_names (
//             id INTEGER PRIMARY KEY,
//             game_id INTEGER NOT NULL,
//             name TEXT NOT NULL,
//             FOREIGN KEY(game_id) REFERENCES games(id)
//         );
//     `);

//     await db.execAsync(`
//         CREATE TABLE IF NOT EXISTS involved_companies (
//             id INTEGER PRIMARY KEY,
//             game_id INTEGER NOT NULL,
//             company_id INTEGER NOT NULL,
//             developer BOOLEAN NOT NULL,
//             publisher BOOLEAN NOT NULL,
//             FOREIGN KEY(game_id) REFERENCES games(id),
//             FOREIGN KEY(company_id) REFERENCES companies(id)
//         );
//     `);

//     await db.execAsync(`
//         CREATE TABLE IF NOT EXISTS release_dates (
//             id INTEGER PRIMARY KEY,
//             game_id INTEGER NOT NULL,
//             date INTEGER NOT NULL,
//             human TEXT NOT NULL,
//             platform_id INTEGER NOT NULL,
//             FOREIGN KEY(game_id) REFERENCES games(id),
//             FOREIGN KEY(platform_id) REFERENCES platforms(id)
//         );
//     `);

//     await db.execAsync(`
//         CREATE TABLE IF NOT EXISTS videos (
//             id INTEGER PRIMARY KEY,
//             game_id INTEGER NOT NULL,
//             video_id TEXT NOT NULL,
//             FOREIGN KEY(game_id) REFERENCES games(id)
//         );
//     `);

//     await db.execAsync(`
//         CREATE TABLE IF NOT EXISTS websites (
//             id INTEGER PRIMARY KEY,
//             game_id INTEGER NOT NULL,
//             category INTEGER NOT NULL,
//             url TEXT NOT NULL,
//             FOREIGN KEY(game_id) REFERENCES games(id)
//         );
//     `);

//     await db.execAsync(`
//         CREATE TABLE IF NOT EXISTS age_ratings (
//             id INTEGER PRIMARY KEY,
//             game_id INTEGER NOT NULL,
//             category INTEGER NOT NULL,
//             rating INTEGER NOT NULL,
//             FOREIGN KEY(game_id) REFERENCES games(id)
//         );
//     `);

//     await db.execAsync(`
//         CREATE TABLE IF NOT EXISTS dlcs (
//             id INTEGER PRIMARY KEY,
//             game_id INTEGER NOT NULL,
//             name TEXT NOT NULL,
//             FOREIGN KEY(game_id) REFERENCES games(id)
//         );
//     `);

//     await db.execAsync(`
//         CREATE TABLE IF NOT EXISTS multiplayer_modes (
//             id INTEGER PRIMARY KEY,
//             game_id INTEGER NOT NULL,
//             campaigncoop BOOLEAN NOT NULL,
//             lancoop BOOLEAN NOT NULL,
//             onlinecoop BOOLEAN NOT NULL,
//             splitscreen BOOLEAN NOT NULL,
//             FOREIGN KEY(game_id) REFERENCES games(id)
//         );
//     `);

//     // Many-to-many relationship tables
//     await db.execAsync(`
//         CREATE TABLE IF NOT EXISTS game_genres (
//             game_id INTEGER NOT NULL,
//             genre_id INTEGER NOT NULL,
//             PRIMARY KEY(game_id, genre_id),
//             FOREIGN KEY(game_id) REFERENCES games(id),
//             FOREIGN KEY(genre_id) REFERENCES genres(id)
//         );
//     `);

//     await db.execAsync(`
//         CREATE TABLE IF NOT EXISTS game_platforms (
//             game_id INTEGER NOT NULL,
//             platform_id INTEGER NOT NULL,
//             PRIMARY KEY(game_id, platform_id),
//             FOREIGN KEY(game_id) REFERENCES games(id),
//             FOREIGN KEY(platform_id) REFERENCES platforms(id)
//         );
//     `);

//     await db.execAsync(`
//         CREATE TABLE IF NOT EXISTS game_modes_map (
//             game_id INTEGER NOT NULL,
//             game_mode_id INTEGER NOT NULL,
//             PRIMARY KEY(game_id, game_mode_id),
//             FOREIGN KEY(game_id) REFERENCES games(id),
//             FOREIGN KEY(game_mode_id) REFERENCES game_modes(id)
//         );
//     `);

//     await db.execAsync(`
//         CREATE TABLE IF NOT EXISTS game_perspectives (
//             game_id INTEGER NOT NULL,
//             perspective_id INTEGER NOT NULL,
//             PRIMARY KEY(game_id, perspective_id),
//             FOREIGN KEY(game_id) REFERENCES games(id),
//             FOREIGN KEY(perspective_id) REFERENCES player_perspectives(id)
//         );
//     `);

//     await db.execAsync(`
//         CREATE TABLE IF NOT EXISTS game_themes (
//             game_id INTEGER NOT NULL,
//             theme_id INTEGER NOT NULL,
//             PRIMARY KEY(game_id, theme_id),
//             FOREIGN KEY(game_id) REFERENCES games(id),
//             FOREIGN KEY(theme_id) REFERENCES themes(id)
//         );
//     `);

//     await db.execAsync(`
//         CREATE TABLE IF NOT EXISTS game_franchises (
//             game_id INTEGER NOT NULL,
//             franchise_id INTEGER NOT NULL,
//             PRIMARY KEY(game_id, franchise_id),
//             FOREIGN KEY(game_id) REFERENCES games(id),
//             FOREIGN KEY(franchise_id) REFERENCES franchises(id)
//         );
//     `);

//     // Quest-specific tables
//     await db.execAsync(`
//         CREATE TABLE IF NOT EXISTS quest_game_status (
//             id INTEGER PRIMARY KEY AUTOINCREMENT,
//             name TEXT NOT NULL UNIQUE,
//             description TEXT
//         );
//     `);

//     // Quest-specific table with status FK
//     await db.execAsync(`
//         CREATE TABLE IF NOT EXISTS quest_games (
//             game_id INTEGER PRIMARY KEY,
//             status_id INTEGER NOT NULL,
//             personal_rating REAL,
//             completion_date TEXT,
//             notes TEXT,
//             date_added TEXT NOT NULL,
//             priority INTEGER DEFAULT NULL,
//             selected_platform_id INTEGER,
//             createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
//             updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
//             FOREIGN KEY(game_id) REFERENCES games(id),
//             FOREIGN KEY(status_id) REFERENCES quest_game_status(id),
//             FOREIGN KEY(selected_platform_id) REFERENCES platforms(id)
//         );
//     `);

//     // Insert default status values
//     await db.execAsync(`
//         INSERT OR IGNORE INTO quest_game_status (name, description) VALUES
//         ('ongoing', 'Game is currently being played'),
//         ('backlog', 'Game is not actively being played'),
//         ('completed', 'Game has been completed'),
//         ('on_hold', 'Game is on hold'),
//         ('undiscovered', 'Game has been removed from the list'),
//         ('dropped', 'Game has been dropped');
//     `);
// };

// export const seedOneGame = async (game: QuestGame | any) => {
//     try {
//         // Insert base game data
//         await db.execAsync(
//             `INSERT OR REPLACE INTO games (id, name, summary, storyline, rating, aggregated_rating)
//             VALUES (
//                 ${game.id},
//                 '${(game.name || "").replace(/'/g, "''")}',
//                 ${game.summary
//                 ? `'${game.summary.replace(/'/g, "''")}'`
//                 : "NULL"
//             },
//                 ${game.storyline
//                 ? `'${game.storyline.replace(/'/g, "''")}'`
//                 : "NULL"
//             },
//                 ${game.rating || "NULL"},
//                 ${game.aggregated_rating || "NULL"}
//             )`
//         );

//         // Insert platforms if they don't exist
//         if (game.platforms && Array.isArray(game.platforms)) {
//             for (const platform of game.platforms) {
//                 if (platform && platform.id && platform.name) {
//                     await db.execAsync(
//                         `INSERT OR IGNORE INTO platforms (id, name) VALUES (${platform.id
//                         }, '${platform.name.replace(/'/g, "''")}')`
//                     );

//                     // Insert game-platform relationships
//                     await db.execAsync(
//                         `INSERT OR REPLACE INTO game_platforms (game_id, platform_id) VALUES (${game.id}, ${platform.id})`
//                     );
//                 }
//             }
//         }

//         // Insert cover if exists
//         if (game.cover && game.cover.id && game.cover.url) {
//             await db.execAsync(
//                 `INSERT OR REPLACE INTO covers (id, game_id, url) VALUES (${game.cover.id
//                 }, ${game.id}, '${game.cover.url.replace(/'/g, "''")}')`
//             );
//         }

//         // Insert screenshots if they exist
//         if (game.screenshots && Array.isArray(game.screenshots)) {
//             for (const screenshot of game.screenshots) {
//                 if (screenshot && screenshot.id && screenshot.url) {
//                     await db.execAsync(
//                         `INSERT OR REPLACE INTO screenshots (id, game_id, url) VALUES (${screenshot.id
//                         }, ${game.id}, '${screenshot.url.replace(/'/g, "''")}')`
//                     );
//                 }
//             }
//         }

//         // Insert age ratings if they exist
//         if (game.age_ratings && Array.isArray(game.age_ratings)) {
//             for (const rating of game.age_ratings) {
//                 if (
//                     rating &&
//                     rating.id &&
//                     rating.category !== undefined &&
//                     rating.rating !== undefined
//                 ) {
//                     await db.execAsync(
//                         `INSERT OR REPLACE INTO age_ratings (id, game_id, category, rating) VALUES (${rating.id}, ${game.id}, ${rating.category}, ${rating.rating})`
//                     );
//                 }
//             }
//         }

//         // Insert release dates if they exist
//         if (game.release_dates && Array.isArray(game.release_dates)) {
//             for (const date of game.release_dates) {
//                 if (
//                     date &&
//                     date.id &&
//                     date.date &&
//                     date.human &&
//                     date.platform_id
//                 ) {
//                     await db.execAsync(
//                         `INSERT OR REPLACE INTO release_dates (id, game_id, date, human, platform_id) VALUES (${date.id
//                         }, ${game.id}, ${date.date}, '${date.human.replace(
//                             /'/g,
//                             "''"
//                         )}', ${date.platform_id})`
//                     );
//                 }
//             }
//         }

//         // Insert involved companies and companies if they exist
//         if (game.involved_companies && Array.isArray(game.involved_companies)) {
//             for (const ic of game.involved_companies) {
//                 if (ic && ic.company && ic.company.id && ic.company.name) {
//                     // Insert company if it doesn't exist
//                     await db.execAsync(
//                         `INSERT OR IGNORE INTO companies (id, name) VALUES (${ic.company.id
//                         }, '${ic.company.name.replace(/'/g, "''")}')`
//                     );

//                     // Insert involved company relationship
//                     await db.execAsync(
//                         `INSERT OR REPLACE INTO involved_companies (game_id, company_id, developer, publisher) VALUES (${game.id
//                         }, ${ic.company.id}, ${ic.developer ? 1 : 0}, ${ic.publisher ? 1 : 0
//                         })`
//                     );
//                 }
//             }
//         }

//         // Insert genres if they exist
//         if (game.genres && Array.isArray(game.genres)) {
//             for (const genre of game.genres) {
//                 if (genre && genre.id && genre.name) {
//                     // Insert genre if it doesn't exist
//                     await db.execAsync(
//                         `INSERT OR IGNORE INTO genres (id, name) VALUES (${genre.id
//                         }, '${genre.name.replace(/'/g, "''")}')`
//                     );

//                     // Insert game-genre relationship
//                     await db.execAsync(
//                         `INSERT OR REPLACE INTO game_genres (game_id, genre_id) VALUES (${game.id}, ${genre.id})`
//                     );
//                 }
//             }
//         }

//         // Insert game modes if they exist
//         if (game.game_modes && Array.isArray(game.game_modes)) {
//             for (const mode of game.game_modes) {
//                 if (mode && mode.id && mode.name) {
//                     // Insert game mode if it doesn't exist
//                     await db.execAsync(
//                         `INSERT OR IGNORE INTO game_modes (id, name) VALUES (${mode.id
//                         }, '${mode.name.replace(/'/g, "''")}')`
//                     );

//                     // Insert game-mode relationship
//                     await db.execAsync(
//                         `INSERT OR REPLACE INTO game_modes_map (game_id, game_mode_id) VALUES (${game.id}, ${mode.id})`
//                     );
//                 }
//             }
//         }

//         // Insert player perspectives if they exist
//         if (
//             game.player_perspectives &&
//             Array.isArray(game.player_perspectives)
//         ) {
//             for (const perspective of game.player_perspectives) {
//                 if (perspective && perspective.id && perspective.name) {
//                     // Insert perspective if it doesn't exist
//                     await db.execAsync(
//                         `INSERT OR IGNORE INTO player_perspectives (id, name) VALUES (${perspective.id
//                         }, '${perspective.name.replace(/'/g, "''")}')`
//                     );

//                     // Insert game-perspective relationship
//                     await db.execAsync(
//                         `INSERT OR REPLACE INTO game_perspectives (game_id, perspective_id) VALUES (${game.id}, ${perspective.id})`
//                     );
//                 }
//             }
//         }

//         // Insert themes if they exist
//         if (game.themes && Array.isArray(game.themes)) {
//             for (const theme of game.themes) {
//                 if (theme && theme.id && theme.name) {
//                     // Insert theme if it doesn't exist
//                     await db.execAsync(
//                         `INSERT OR IGNORE INTO themes (id, name) VALUES (${theme.id
//                         }, '${theme.name.replace(/'/g, "''")}')`
//                     );

//                     // Insert game-theme relationship
//                     await db.execAsync(
//                         `INSERT OR REPLACE INTO game_themes (game_id, theme_id) VALUES (${game.id}, ${theme.id})`
//                     );
//                 }
//             }
//         }

//         // Insert franchises if they exist
//         if (game.franchises && Array.isArray(game.franchises)) {
//             for (const franchise of game.franchises) {
//                 if (franchise && franchise.id && franchise.name) {
//                     // Insert franchise if it doesn't exist
//                     await db.execAsync(
//                         `INSERT OR IGNORE INTO franchises (id, name) VALUES (${franchise.id
//                         }, '${franchise.name.replace(/'/g, "''")}')`
//                     );

//                     // Insert game-franchise relationship
//                     await db.execAsync(
//                         `INSERT OR REPLACE INTO game_franchises (game_id, franchise_id) VALUES (${game.id}, ${franchise.id})`
//                     );
//                 }
//             }
//         }

//         // Insert websites if they exist
//         if (game.websites && Array.isArray(game.websites)) {
//             for (const website of game.websites) {
//                 if (
//                     website &&
//                     website.id &&
//                     website.url &&
//                     website.category !== undefined
//                 ) {
//                     await db.execAsync(
//                         `INSERT OR REPLACE INTO websites (id, game_id, category, url) VALUES (${website.id
//                         }, ${game.id}, ${website.category
//                         }, '${website.url.replace(/'/g, "''")}')`
//                     );
//                 }
//             }
//         }

//         // Get the status id
//         const [status] = await db.getAllAsync<{ id: number }>(`
//             SELECT id FROM quest_game_status WHERE name = 'backlog'
//         `);

//         if (!status) {
//             throw new Error(
//                 `Could not find 'backlog' status in quest_game_status table`
//             );
//         }

//         // Insert quest game data with status_id
//         const questData = game.quest_data || {};
//         await db.execAsync(
//             `INSERT OR REPLACE INTO quest_games (
//                 game_id, status_id, personal_rating, completion_date,
//                 notes, date_added, priority, selected_platform_id
//             ) VALUES (
//                 ${game.id},
//                 ${status.id},
//                 ${questData.personal_rating !== undefined
//                 ? questData.personal_rating
//                 : "NULL"
//             },
//                 ${questData.completion_date
//                 ? `'${questData.completion_date}'`
//                 : "NULL"
//             },
//                 ${questData.notes
//                 ? `'${questData.notes.replace(/'/g, "''")}'`
//                 : "NULL"
//             },
//                 '${questData.date_added || new Date().toISOString()}',
//                 ${questData.priority || 0},
//                 ${questData.selected_platform_id || "NULL"}
//             )`
//         );
//     } catch (error) {
//         console.error("Error seeding game:", error);
//         throw error;
//     }
// };

// const exportDatabase = async () => {
//     // try {
//     //     const dbPath = FileSystem.documentDirectory + "SQLite/NextQuest.db";
//     //     // Use the downloads directory which is publicly accessible
//     //     const exportPath = FileSystem.bundleDirectory + "NextQuest.db";
//     //     await FileSystem.copyAsync({
//     //         from: dbPath,
//     //         to: exportPath,
//     //     });
//     //     console.log("Database exported to:", exportPath);
//     //     return exportPath;
//     // } catch (error) {
//     //     console.error("Error exporting database:", error);
//     //     return null;
//     // }
// };

// const updateGameStatusesAndPriorities = async () => {
//     try {
//         // Get all game IDs
//         const games = await db.getAllAsync<{ game_id: number }>(
//             "SELECT game_id FROM quest_games"
//         );
//         if (!games.length) return;

//         // Shuffle the array to randomly select games
//         const shuffledGames = [...games].sort(() => Math.random() - 0.5);

//         // Get status IDs
//         const [ongoingStatus] = await db.getAllAsync<{ id: number }>(
//             "SELECT id FROM quest_game_status WHERE name = 'ongoing'"
//         );
//         const [completedStatus] = await db.getAllAsync<{ id: number }>(
//             "SELECT id FROM quest_game_status WHERE name = 'completed'"
//         );
//         const [backlogStatus] = await db.getAllAsync<{ id: number }>(
//             "SELECT id FROM quest_game_status WHERE name = 'backlog'"
//         );
//         const [undiscoveredStatus] = await db.getAllAsync<{ id: number }>(
//             "SELECT id FROM quest_game_status WHERE name = 'undiscovered'"
//         );

//         // Take 5 games for ongoing status
//         const ongoingGames = shuffledGames.slice(0, 3);
//         // Take 3 games for completed status
//         const completedGames = shuffledGames.slice(3, 9);
//         // The rest will be backlog
//         const backlogGames = shuffledGames.slice(9, 16);

//         // Start transaction
//         await db.execAsync("BEGIN TRANSACTION");

//         // Update ongoing games with priority
//         for (let i = 0; i < ongoingGames.length; i++) {
//             await db.execAsync(`
//                 UPDATE quest_games
//                 SET status_id = ${ongoingStatus.id}, priority = ${i + 1}
//                 WHERE game_id = ${ongoingGames[i].game_id}
//             `);
//         }

//         // Update completed games with priority and other metadata
//         for (let i = 0; i < completedGames.length; i++) {
//             const reviews = [
//                 "An absolute masterpiece that kept me engaged from start to finish. The story and gameplay mechanics blend perfectly, creating an unforgettable experience.",
//                 "While the game has some minor flaws, the overall experience is fantastic. The character development and world-building are particularly impressive.",
//                 "A solid game that delivers exactly what it promises. The combat system is well-designed, though the story could have been more compelling.",
//                 "Despite a slow start, the game really picks up in the second half. The ending was particularly satisfying and made the journey worthwhile.",
//                 "An innovative take on the genre with stunning visuals. The gameplay loop is addictive, though some late-game sections feel a bit repetitive.",
//                 "The attention to detail in this game is remarkable. Every area feels carefully crafted, and the soundtrack perfectly complements the atmosphere.",
//                 "A unique gaming experience that takes risks and mostly succeeds. The experimental mechanics add a fresh perspective to familiar gameplay elements.",
//             ];

//             const randomIndex = Math.floor(Math.random() * reviews.length);

//             await db.execAsync(`
//                 UPDATE quest_games
//                 SET status_id = ${completedStatus.id},
//                     priority = ${i + 1},
//                     personal_rating = ${Math.floor(Math.random() * 10 + 1)},
//                     notes = '${reviews[randomIndex].replace(/'/g, "''")}',
//                     completion_date = date('now', '-' || abs(random() % 90) || ' days')
//                 WHERE game_id = ${completedGames[i].game_id}
//             `);
//         }

//         // Update backlog games with priority
//         for (let i = 0; i < backlogGames.length; i++) {
//             await db.execAsync(`
//                 UPDATE quest_games
//                 SET status_id = ${backlogStatus.id}, priority = ${i + 1}
//                 WHERE game_id = ${backlogGames[i].game_id}
//             `);
//         }

//         // Update undiscovered games (no priority)
//         const undiscoveredGames = shuffledGames.slice(16);
//         for (const game of undiscoveredGames) {
//             await db.execAsync(`
//                 UPDATE quest_games
//                 SET status_id = ${undiscoveredStatus.id}, priority = NULL
//                 WHERE game_id = ${game.game_id}
//             `);
//         }

//         // Commit transaction
//         await db.execAsync("COMMIT");
//         console.log("Successfully updated game statuses and priorities");
//     } catch (error) {
//         await db.execAsync("ROLLBACK");
//         console.error("Error updating game statuses and priorities:", error);
//         throw error;
//     }
// };

// const seedQuestGameStatus = async () => {
//     const statuses = [
//         { name: "Backlog", description: "Game has not been started yet" },
//         { name: "Ongoing", description: "Game is currently being played" },
//         { name: "Completed", description: "Game has been completed" },
//         {
//             name: "Undiscovered",
//             description: "Game has not been discovered yet",
//         },
//     ];

//     for (const status of statuses) {
//         await db.execAsync(`
//             INSERT INTO quest_game_status (name, description)
//             VALUES ('${status.name}', '${status.description}')
//         `);
//     }
// };

// const seedPlatforms = async () => {
//     try {
//         await db.execAsync("BEGIN TRANSACTION");

//         for (const platform of platforms) {
//             await db.execAsync(`
//                 INSERT OR IGNORE INTO platforms (id, name)
//                 VALUES (${platform.id}, '${platform.name.replace(/'/g, "''")}')
//             `);
//         }

//         await db.execAsync("COMMIT");
//         console.log("Platforms seeded successfully");
//     } catch (error) {
//         await db.execAsync("ROLLBACK");
//         console.error("Error seeding platforms:", error);
//         throw error;
//     }
// };

// export const initializeDatabase = async () => {
//     const [dbExists] = await db.getAllAsync(`SELECT 1 FROM games`);

//     if (dbExists) {
//         console.log("Database already exists");
//         return null;
//     }

//     try {
//         // Drop existing tables in correct order
//         for (const table of [
//             "quest_games",
//             "quest_game_status",
//             "game_themes",
//             "game_perspectives",
//             "game_modes_map",
//             "game_platforms",
//             "game_genres",
//             "multiplayer_modes",
//             "dlcs",
//             "age_ratings",
//             "websites",
//             "videos",
//             "release_dates",
//             "involved_companies",
//             "alternative_names",
//             "screenshots",
//             "covers",
//             "games",
//             "themes",
//             "player_perspectives",
//             "game_modes",
//             "platforms",
//             "genres",
//             "companies",
//             "franchises",
//         ]) {
//             await db.execAsync(`DROP TABLE IF EXISTS ${table}`);
//         }
//         console.log("Existing tables dropped successfully");

//         // Create new tables
//         await createTables();
//         console.log("New tables created successfully");

//         // Seed platforms
//         await seedPlatforms();

//         // Seed quest game status table
//         await seedQuestGameStatus();
//         console.log("Quest game status table seeded successfully");

//         // Seed games in batches to avoid overwhelming the connection
//         const batchSize = 5;

//         // Randomly select 40 games from the seedData array
//         const randomGames = seedData.sort(() => Math.random() - 0.5);

//         for (let i = 0; i < randomGames.length; i += batchSize) {
//             const batch = randomGames.slice(i, i + batchSize);
//             await db.execAsync("BEGIN TRANSACTION");
//             try {
//                 for (const game of batch) {
//                     try {
//                         await seedOneGame(game);
//                     } catch (error) {
//                         console.error(
//                             `Failed to seed game ${game.name || game.id
//                             }: ${error}`
//                         );
//                     }
//                 }
//                 await db.execAsync("COMMIT");
//             } catch (error) {
//                 await db.execAsync("ROLLBACK");
//                 console.error("Batch seeding error:", error);
//             }
//         }
//         console.log("All games seeded successfully");

//         // Update game statuses and priorities
//         // await updateGameStatusesAndPriorities();
//         // console.log("Game statuses and priorities updated successfully");

//         // Verify seeding
//         const [result] = await db.getAllAsync<{ count: number }>(
//             "SELECT COUNT(*) as count FROM games"
//         );
//         console.log(
//             "[Database] Games in database after seeding:",
//             result?.count || 0
//         );

//         await exportDatabase();

//         return true;
//     } catch (error) {
//         console.error("Database initialization error:", error);
//         throw error;
//     }
// };
