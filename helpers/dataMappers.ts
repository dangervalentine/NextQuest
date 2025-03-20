import { GameStatus } from "./../data/types";
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

export const mapToGameDetails = (data: any): GameDetails => {
    const gameDetails: GameDetails = {
        id: data.id,
        name: data.name,
        cover_url: data.cover?.url?.replace("t_thumb", "t_720p") || "",
        platforms: data.platforms?.map((platform: any) => platform.name) || [],
        release_date: data.release_dates?.[0]?.human || "",
        rating: data.rating || 0,
        aggregated_rating: data.aggregated_rating,
        genres: data.genres?.map((genre: any) => genre.name) || [],
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

    for (let i: number = 0; i < gameDetails.screenshots.length; i++) {
        gameDetails.screenshots[i] = gameDetails.screenshots[i].replace(
            "t_thumb",
            "t_original"
        );
    }

    return gameDetails;
};

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
