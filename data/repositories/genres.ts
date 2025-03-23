import db from "../config/database";
import { Genre } from "../models/IGDBGameResponse";

export const getAllGenres = async () => {
    try {
        return await db.getAllAsync<Genre>(
            "SELECT id, name FROM genres ORDER BY name ASC"
        );
    } catch (error) {
        console.error("Error getting genres:", error);
        throw error;
    }
};

export const getGenreById = async (id: number) => {
    try {
        const query = "SELECT id, name FROM genres WHERE id = " + id;
        const [genre] = await db.getAllAsync<Genre>(query);
        return genre;
    } catch (error) {
        console.error("Error getting genre by id:", error);
        throw error;
    }
};

export const createGenre = async (genre: Omit<Genre, "id">) => {
    try {
        const query = `INSERT OR IGNORE INTO genres (name) VALUES ('${genre.name}')`;
        await db.execAsync(query);
        const [result] = await db.getAllAsync<{ id: number }>(
            "SELECT last_insert_rowid() as id"
        );
        return result.id;
    } catch (error) {
        console.error("Error creating genre:", error);
        throw error;
    }
};

export const updateGenre = async (genre: Genre) => {
    try {
        const query = `UPDATE genres SET name = '${genre.name}' WHERE id = ${genre.id}`;
        await db.execAsync(query);
    } catch (error) {
        console.error("Error updating genre:", error);
        throw error;
    }
};

export const deleteGenre = async (id: number) => {
    try {
        const query = `DELETE FROM genres WHERE id = ${id}`;
        await db.execAsync(query);
    } catch (error) {
        console.error("Error deleting genre:", error);
        throw error;
    }
};

export const getOrCreateGenre = async (genre: Genre) => {
    try {
        let existingGenre = await getGenreById(genre.id);
        if (!existingGenre) {
            const query = `INSERT OR IGNORE INTO genres (id, name) VALUES (${genre.id}, '${genre.name}')`;
            await db.execAsync(query);
            existingGenre = genre;
        }
        return existingGenre;
    } catch (error) {
        console.error("Error getting or creating genre:", error);
        throw error;
    }
};

export const getGenresForGame = async (gameId: number) => {
    try {
        const query = `
            SELECT g.id, g.name 
            FROM genres g
            INNER JOIN game_genres gg ON g.id = gg.genre_id
            WHERE gg.game_id = ${gameId}
            ORDER BY g.name ASC
        `;
        return await db.getAllAsync<Genre>(query);
    } catch (error) {
        console.error("Error getting genres for game:", error);
        throw error;
    }
};

export const addGenreToGame = async (gameId: number, genreId: number) => {
    try {
        const query = `INSERT OR IGNORE INTO game_genres (game_id, genre_id) VALUES (${gameId}, ${genreId})`;
        await db.execAsync(query);
    } catch (error) {
        console.error("Error adding genre to game:", error);
        throw error;
    }
};

export const removeGenreFromGame = async (gameId: number, genreId: number) => {
    try {
        const query = `DELETE FROM game_genres WHERE game_id = ${gameId} AND genre_id = ${genreId}`;
        await db.execAsync(query);
    } catch (error) {
        console.error("Error removing genre from game:", error);
        throw error;
    }
};
