import { RAWG_API_KEY } from "@env";

class RAWRService {
    private static API_URL = "https://api.rawg.io/api/";

    public static async getMetacriticScore(query: string) {
        const encodedQuery = encodeURIComponent(query);

        try {
            const url = `${this.API_URL}games?key=${RAWG_API_KEY}&search_exact=true&search=${encodedQuery}`;

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(
                    `Error fetching game details: ${response.statusText}`
                );
            }

            const data = await response.json();

            if (
                !data ||
                !Array.isArray(data.results) ||
                data.results.length === 0
            ) {
                console.error("Invalid or empty data received from API.");
                return null;
            }

            const match = data.results.find(
                (game: any) => game.name.toLowerCase() === query.toLowerCase()
            );

            if (!match || !match.id || !match.name) {
                console.error(
                    "No matching game found or missing required fields:",
                    match
                );
                return null;
            }

            return match.metacritic;
        } catch (error) {
            console.error(
                "[getGameDetails] Error fetching game details:",
                error
            );
            throw error;
        }
    }
}

export default RAWRService;
