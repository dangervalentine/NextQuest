import { TWITCH_CLIENT_ID } from "@env";
import TwitchAuthService from "./TwitchAuthService";
class IGDBService {
    private static API_URL = "https://api.igdb.com/v4/games";

    public static async fetchGameDetails(name: string): Promise<any> {
        try {
            const token = await TwitchAuthService.getValidToken();
            if (!token) {
                throw new Error("No access token found.");
            }

            console.log(name);
            const query = `
fields id, name, summary, genres.id, genres.name, platforms.id, platforms.name, 
       release_dates.id, release_dates.human, release_dates.platform, release_dates.date,
       cover.id, cover.url, 
       age_ratings.id, age_ratings.rating, age_ratings.category, 
       involved_companies.company.id, involved_companies.company.name, 
       involved_companies.developer, involved_companies.publisher, 
       screenshots.id, screenshots.url, 
       videos.id, videos.video_id, 
       rating, aggregated_rating, storyline;
where name ~ *"${name}"* & category = (0, 8, 9, 11);
sort release_dates.date asc;
      `;

            const fixedQuery = query.replace(/[‘’]/g, "'");

            const response = await fetch(this.API_URL, {
                method: "POST",
                headers: {
                    "Client-ID": TWITCH_CLIENT_ID,
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
                body: fixedQuery,
            });

            if (!response.ok) {
                throw new Error(
                    `Error: ${response.status} ${response.statusText}`
                );
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Error fetching game details:", error);
            return null;
        }
    }
}

export default IGDBService;
