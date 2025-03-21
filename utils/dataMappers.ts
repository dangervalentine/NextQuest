import { GameStatus } from "../data/types";
import { ESRB_RATINGS } from "../data/types";
import { GameDetails } from "../interfaces/GameDetails";

function getAgeRatingForESRB(
    ageRatings?: { category: number; rating: number }[]
): string {
    if (!Array.isArray(ageRatings)) {
        console.warn("ageRatings is not an array:", ageRatings);
        return "Unknown";
    }

    const ratingEntry = ageRatings.find((rating) => rating.category === 1);

    if (!ratingEntry) {
        console.warn("No ESRB rating found in:", ageRatings);
        return "Unknown";
    }

    const esrbRating = ESRB_RATINGS[ratingEntry.rating];

    if (!esrbRating) {
        console.warn("Unknown ESRB rating code:", ratingEntry.rating);
    }

    return esrbRating ?? "Unknown";
}

/**
 * Maps an IGDB API response to our application's GameDetails format
 * @param data The raw game data from IGDB API
 * @returns GameDetails object in our application's format
 */
export const mapToGameDetails = (data: any): GameDetails => {
    const gameDetails: GameDetails = {
        id: data.id,
        name: data.name,
        cover: data.cover?.url?.replace("t_thumb", "t_720p") || "",
        platforms:
            data.platforms?.map((platform: any) => ({
                id: platform.id,
                name: platform.name,
            })) || [],
        release_dates: data.release_dates || [],
        rating: data.rating || 0,
        aggregated_rating: data.aggregated_rating,
        genres:
            data.genres?.map((genre: any) => ({
                id: genre.id,
                name: genre.name,
            })) || [],
        summary: data.summary || "",
        screenshots:
            data.screenshots?.map((screenshot: any) => screenshot.url) || [],
        videos:
            data.videos?.map((video: any) => ({
                name: video.name,
                url: `https://www.youtube.com/watch?v=${video.video_id}`,
            })) || [],
        involved_companies:
            data.involved_companies?.map((company: any) => ({
                name: company.company?.name || "",
                role: company.developer
                    ? "Developer"
                    : company.publisher
                    ? "Publisher"
                    : "Other",
            })) || [],
        storyline: data.storyline || "",
        age_rating: getAgeRatingForESRB(data.age_ratings),
    };
    gameDetails.screenshots =
        gameDetails.screenshots?.map((screenshot) =>
            screenshot.replace("t_thumb", "t_original")
        ) || [];

    return gameDetails;
};

/**
 * Formats release dates in chronological order with platform information
 * @param game The game details containing release dates
 * @returns Array of formatted release date strings in the format "date (platform)"
 */
export function formatReleaseDates(game: GameDetails): string[] {
    if (!game.release_dates || game.release_dates.length === 0) {
        return [];
    }

    // Sort release dates by date in ascending order
    const sortedDates = [...game.release_dates].sort((a, b) => a.date - b.date);

    return sortedDates.map((release) => {
        const date =
            release.human ||
            new Date(release.date * 1000).toISOString().split("T")[0];
        const platform = release.platform
            ? `Platform ${release.platform}`
            : "Unknown Platform";
        return `${date} (${platform})`;
    });
}

/**
 * Converts a GameStatus enum value to a human-readable string
 * @param gameStatus The game status to convert
 * @returns Human-readable status string
 */
export function getGameStatus(gameStatus: GameStatus): string {
    switch (gameStatus) {
        case "completed":
            return "Completed";
        case "in_progress":
            return "In Progress";
        case "preperation":
            return "Not Started";
    }
}
