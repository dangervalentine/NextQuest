import { QuestGame } from "./../interfaces/QuestGame";
import { TWITCH_CLIENT_ID } from "@env";
import TwitchAuthService from "./TwitchAuthService";
import { mapToGameDetails } from "../helpers/dataMappers";
import { GameDetails } from "../interfaces/GameDetails";
const questGames = require("../data/seedData.json");
class IGDBService {
    private static API_URL = "https://api.igdb.com/v4/games";

    public static async fetchGameDetails(
        id: number
    ): Promise<QuestGame | null> {
        try {
            const token = await TwitchAuthService.getValidToken();
            if (!token) {
                throw new Error("No access token found.");
            }

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
where id = ${id};
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

            if (!data || !Array.isArray(data) || data.length === 0) {
                console.error("Invalid or empty data received from API.");
                return null;
            }

            const gameData = data[0];
            if (!gameData.id || !gameData.name) {
                console.error(
                    "Missing required fields in game data:",
                    gameData
                );
                return null;
            }

            const gameDetails: GameDetails = mapToGameDetails(gameData);
            const savedData = questGames.find((x) => x.id === gameDetails.id);

            const questGame: QuestGame = {
                ...gameDetails,
                priority: savedData?.priority,
                platform: savedData?.platform,
                dateAdded: savedData?.dateAdded,
                gameStatus: savedData?.gameStatus,
                personalRating: savedData?.personalRating,
                notes: savedData?.notes,
            };

            return questGame;
        } catch (error) {
            console.error("Error fetching game details:", error);
            return null;
        }
    }
}

export default IGDBService;
