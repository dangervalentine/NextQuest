import db from "../config/database";
import { Video } from "../models/IGDBGameResponse";

export const getVideoById = async (id: number) => {
    try {
        const query =
            "SELECT id, game_id, video_id FROM videos WHERE id = " + id;
        const [video] = await db.getAllAsync<Video>(query);
        return video;
    } catch (error) {
        console.error("Error getting video by id:", error);
        throw error;
    }
};

export const getVideosForGame = async (gameId: number) => {
    try {
        const query =
            "SELECT id, game_id, video_id FROM videos WHERE game_id = " +
            gameId;
        return await db.getAllAsync<Video>(query);
    } catch (error) {
        console.error("Error getting videos for game:", error);
        throw error;
    }
};

export const createVideo = async (video: Omit<Video, "id">) => {
    try {
        const query = `INSERT INTO videos (game_id, video_id) VALUES (${video.game_id}, '${video.video_id}')`;
        await db.execAsync(query);
        const [result] = await db.getAllAsync<{ id: number }>(
            "SELECT last_insert_rowid() as id"
        );
        return result.id;
    } catch (error) {
        console.error("Error creating video:", error);
        throw error;
    }
};

export const updateVideo = async (video: Video) => {
    try {
        const query = `UPDATE videos SET video_id = '${video.video_id}' WHERE id = ${video.id}`;
        await db.execAsync(query);
    } catch (error) {
        console.error("Error updating video:", error);
        throw error;
    }
};

export const deleteVideo = async (id: number) => {
    try {
        const query = `DELETE FROM videos WHERE id = ${id}`;
        await db.execAsync(query);
    } catch (error) {
        console.error("Error deleting video:", error);
        throw error;
    }
};

export const deleteVideosForGame = async (gameId: number) => {
    try {
        const query = `DELETE FROM videos WHERE game_id = ${gameId}`;
        await db.execAsync(query);
    } catch (error) {
        console.error("Error deleting videos for game:", error);
        throw error;
    }
};

export const getOrCreateVideo = async (video: Video) => {
    try {
        let existingVideo = await getVideoById(video.id);
        if (!existingVideo) {
            const query = `INSERT OR IGNORE INTO videos (id, game_id, video_id) VALUES (${video.id}, ${video.game_id}, '${video.video_id}')`;
            await db.execAsync(query);
            existingVideo = video;
        }
        return existingVideo;
    } catch (error) {
        console.error("Error getting or creating video:", error);
        throw error;
    }
};
