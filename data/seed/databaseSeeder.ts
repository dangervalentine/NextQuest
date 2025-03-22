import db from "../config/database";
import seedData from "../seed_data.json";
import { QuestGame } from "../../interfaces/QuestGame";

const createTables = async () => {
    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS quest_games (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            cover_id INTEGER,
            cover_url TEXT,
            genres TEXT,                    -- Stored as JSON array
            release_dates TEXT,             -- Stored as JSON array
            rating REAL,
            aggregated_rating REAL,
            age_rating TEXT,
            platforms TEXT,                 -- Stored as JSON array
            summary TEXT,
            screenshots TEXT,               -- Stored as JSON array
            videos TEXT,                    -- Stored as JSON array
            involved_companies TEXT,        -- Stored as JSON array
            storyline TEXT,
            game_status TEXT,
            personal_rating REAL,
            completion_date TEXT,
            notes TEXT,
            date_added TEXT,
            priority INTEGER,
            platform_id INTEGER,
            platform_name TEXT
        );
    `);

    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS platforms (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL
        );
    `);
};

const seedQuestGames = async () => {
    for (const game of seedData as QuestGame[]) {
        const values = [
            game.id,
            game.name,
            game.cover?.id || null,
            game.cover?.url || null,
            JSON.stringify(game.genres || []),
            JSON.stringify(game.release_dates || []),
            game.rating || null,
            game.aggregated_rating || null,
            game.age_rating || null,
            JSON.stringify(game.platforms || []),
            game.summary || null,
            JSON.stringify(game.screenshots || []),
            JSON.stringify(game.videos || []),
            JSON.stringify(game.involved_companies || []),
            game.storyline || null,
            game.gameStatus || "preperation",
            game.personalRating || null,
            game.completionDate || null,
            game.notes || null,
            game.dateAdded || new Date().toISOString(),
            game.priority || 0,
            game.platform?.id || null,
            game.platform?.name || null,
        ].map((value) =>
            value === null
                ? "NULL"
                : typeof value === "string"
                ? `'${value.replace(/'/g, "''")}'`
                : value
        );

        await db.execAsync(`
            INSERT INTO quest_games (
                id, name, cover_id, cover_url, genres, release_dates,
                rating, aggregated_rating, age_rating, platforms,
                summary, screenshots, videos, involved_companies,
                storyline, game_status, personal_rating, completion_date,
                notes, date_added, priority, platform_id, platform_name
            ) VALUES (${values.join(", ")})
        `);
    }
};

export const initializeDatabase = async () => {
    try {
        await createTables();

        // Check if database needs seeding
        const result = await db.getAllAsync<{ count: number }>(
            "SELECT COUNT(*) as count FROM quest_games"
        );

        if (result[0].count === 0) {
            console.log("Seeding initial data...");
            await seedQuestGames();
            console.log(`Database seeded with ${seedData.length} games`);
        }

        return true;
    } catch (error) {
        console.error("Database initialization error:", error);
        throw error;
    }
};
