import { GameDetails } from "../interfaces/GameDetails";

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
            ? `${release.platform}`
            : "Unknown Platform";
        return `${date} (${platform})`;
    });
}

export const formatReleaseDate = (timestamp: number): string => {
    const date = new Date(timestamp * 1000); // Convert Unix timestamp to milliseconds
    const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
    ];
    const month = months[date.getMonth()];
    const day = date.getDate().toString().padStart(2, "0");
    const year = date.getFullYear();

    return `${month} ${day}, ${year}`;
};
