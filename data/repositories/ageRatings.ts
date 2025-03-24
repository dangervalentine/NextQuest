import db from "../config/database";
import { AgeRating } from "../models/IGDBGameResponse";

export const getAgeRatingById = async (id: number) => {
    try {
        const query =
            "SELECT id, game_id, category, rating FROM age_ratings WHERE id = " +
            id;
        const [ageRating] = await db.getAllAsync<AgeRating>(query);
        return ageRating;
    } catch (error) {
        console.error("Error getting age rating by id:", error);
        throw error;
    }
};

export const getAgeRatingsForGame = async (gameId: number) => {
    try {
        const query = `SELECT id, game_id, category, rating FROM age_ratings WHERE game_id = ${gameId}`;
        return await db.getAllAsync<AgeRating>(query);
    } catch (error) {
        console.error("Error getting age ratings for game:", error);
        throw error;
    }
};

export const getAgeRatingsByCategory = async (
    gameId: number,
    category: number
) => {
    try {
        const query = `SELECT id, game_id, category, rating FROM age_ratings WHERE game_id = ${gameId} AND category = ${category}`;
        return await db.getAllAsync<AgeRating>(query);
    } catch (error) {
        console.error("Error getting age ratings by category:", error);
        throw error;
    }
};

export const createAgeRating = async (ageRating: Omit<AgeRating, "id">) => {
    try {
        const query = `INSERT INTO age_ratings (game_id, category, rating) VALUES (${ageRating.game_id}, ${ageRating.category}, ${ageRating.rating})`;
        await db.execAsync(query);
        const [result] = await db.getAllAsync<{ id: number }>(
            "SELECT last_insert_rowid() as id"
        );
        return result.id;
    } catch (error) {
        console.error("Error creating age rating:", error);
        throw error;
    }
};

export const updateAgeRating = async (ageRating: AgeRating) => {
    try {
        const query = `UPDATE age_ratings SET category = ${ageRating.category}, rating = ${ageRating.rating} WHERE id = ${ageRating.id}`;
        await db.execAsync(query);
    } catch (error) {
        console.error("Error updating age rating:", error);
        throw error;
    }
};

export const deleteAgeRating = async (id: number) => {
    try {
        const query = `DELETE FROM age_ratings WHERE id = ${id}`;
        await db.execAsync(query);
    } catch (error) {
        console.error("Error deleting age rating:", error);
        throw error;
    }
};

export const deleteAgeRatingsForGame = async (gameId: number) => {
    try {
        const query = `DELETE FROM age_ratings WHERE game_id = ${gameId}`;
        await db.execAsync(query);
    } catch (error) {
        console.error("Error deleting age ratings for game:", error);
        throw error;
    }
};

export const getOrCreateAgeRating = async (ageRating: AgeRating) => {
    try {
        let existingAgeRating = await getAgeRatingById(ageRating.id);
        if (!existingAgeRating) {
            const query = `INSERT OR IGNORE INTO age_ratings (id, game_id, category, rating) VALUES (${ageRating.id}, ${ageRating.game_id}, ${ageRating.category}, ${ageRating.rating})`;
            await db.execAsync(query);
            existingAgeRating = ageRating;
        }
        return existingAgeRating;
    } catch (error) {
        console.error("Error getting or creating age rating:", error);
        throw error;
    }
};
