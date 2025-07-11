import { RAWG_API_KEY } from "@env";
import { rawgPlatformIds } from "src/constants/api/rawgPlatformIds";

class RAWRService {
    private static API_URL = "https://api.rawg.io/api/";

    public static async getMetacriticScore(
        name: string,
        platform?: string | undefined
    ): Promise<{ score: number; url: string } | null> {
        const encodedName = encodeURIComponent(name);

        try {
            let url = `${this.API_URL}games?key=${RAWG_API_KEY}&search=${encodedName}`;

            if (platform) {
                const platformId =
                    rawgPlatformIds[platform as keyof typeof rawgPlatformIds];
                if (platformId) {
                    url += `&platforms=${platformId}`;
                }
            }
            const response = await fetch(url);

            if (!response.ok) {
                return null;
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

            let match = data.results.find(
                (game: any) => game.name.toLowerCase() === name.toLowerCase()
            );

            if (!match || !match.id || !match.name) {
                match = data.results[0];
            }

            return {
                score: match.metacritic,
                url: match.metacritic_url,
            };
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
