import { TWITCH_CLIENT_ID } from "@env";
import TwitchAuthService from "./TwitchAuthService";
import { QuestGame } from "src/data/models/QuestGame";
import { getQuestGameById } from "src/data/repositories/questGames";
import { MinimalQuestGame } from "src/data/models/MinimalQuestGame";

class IGDBService {
    private static API_URL = "https://api.igdb.com/v4";

    public static async searchGames(
        query: string
    ): Promise<MinimalQuestGame[]> {
        const token = await TwitchAuthService.getValidToken();

        const bodyQuery = `
  fields id, name, 
        cover.id, cover.url,
        genres.id, genres.name,
        release_dates.id, release_dates.date,
        platforms.id, platforms.name, platforms.platform_family,
        rating;
where name ~ *"${query}"*;
sort release_dates.date asc;
            `;

        const fixedQuery = bodyQuery.replace(/['']/g, "'");

        const response = await fetch(this.API_URL + "/games", {
            method: "POST",
            headers: {
                "Client-ID": TWITCH_CLIENT_ID,
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
            body: fixedQuery,
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (!data || !Array.isArray(data) || data.length === 0) {
            console.error("Invalid or empty data received from API.");
        }
        if (!token) {
            throw new Error("No access token found.");
        }
        const gameData: MinimalQuestGame[] = data.map((game: any) => {
            const mappedPlatforms = Array.isArray(game.platforms)
                ? game.platforms.map((platform: any) => ({
                      id: platform.id,
                      name: platform.name,
                  }))
                : [];

            if (game.cover && game.cover.url) {
                game.cover.url = game.cover.url.replace(
                    "t_thumb",
                    "t_cover_big"
                );
            } else {
                game.cover = {};
            }

            return {
                ...game,
                gameStatus: "undiscovered",
                dateAdded: new Date().toISOString(),
                priority: 0,
                genres: Array.isArray(game.genres) ? game.genres : [],
                platforms: mappedPlatforms,
                selectedPlatform: mappedPlatforms[0] || {
                    id: 0,
                    name: "Unknown Platform",
                },
                personalRating: undefined,
                completionDate: undefined,
                notes: undefined,
            };
        });

        return gameData;
    }

    public static async fetchGameDetails(
        id: number
    ): Promise<QuestGame | null> {
        try {
            // Try to get the game from the database first
            const savedGame = await getQuestGameById(id);
            if (savedGame) {
                return {
                    ...savedGame,
                    alternative_names: savedGame.alternative_names || [],
                    game_modes: savedGame.game_modes || [],
                    player_perspectives: savedGame.player_perspectives || [],
                    themes: savedGame.themes || [],
                    selectedPlatform: savedGame.selectedPlatform || {
                        id: 0,
                        name: "",
                    },
                    dateAdded: savedGame.dateAdded || new Date().toISOString(),
                    gameStatus: savedGame.gameStatus || "undiscovered",
                    personalRating: savedGame.personalRating,
                    notes: savedGame.notes,
                };
            }

            // If not in database, fetch from API
            const token = await TwitchAuthService.getValidToken();
            if (!token) {
                throw new Error("No access token found.");
            }

            const query = `
fields id, name, summary, 
       genres.id, genres.name, 
       platforms.id, platforms.name, 
       release_dates.id, release_dates.human, release_dates.platform, release_dates.date,
       cover.id, cover.url, 
       age_ratings.id, age_ratings.rating, age_ratings.category, 
       involved_companies.company.id, involved_companies.company.name, 
       involved_companies.developer, involved_companies.publisher, 
       screenshots.id, screenshots.url, 
       videos.id, videos.video_id,
       game_modes.id, game_modes.name,
       player_perspectives.id, player_perspectives.name,
       themes.id, themes.name,
       rating, aggregated_rating, storyline;
where id = ${id};
sort release_dates.date asc;
            `;

            const fixedQuery = query.replace(/['']/g, "'");

            const response = await fetch(this.API_URL + "/games", {
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

            // Return new game with default quest properties
            return {
                ...gameData,
                alternative_names: gameData.alternative_names || [],
                game_modes: gameData.game_modes || [],
                player_perspectives: gameData.player_perspectives || [],
                themes: gameData.themes || [],
                gameStatus: "undiscovered",
                dateAdded: new Date().toISOString(),
                priority: 0,
                selectedPlatform: { id: 0, name: "" },
                personalRating: undefined,
                completionDate: undefined,
                notes: undefined,
            };
        } catch (error) {
            console.error("Error fetching game details:", error);
            return null;
        }
    }
}

export default IGDBService;
