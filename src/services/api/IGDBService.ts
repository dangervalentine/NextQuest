import { TWITCH_CLIENT_ID } from "@env";
import TwitchAuthService from "./TwitchAuthService";
import { QuestGame } from "src/data/models/QuestGame";
import { getQuestGameById } from "src/data/repositories/questGames";
import { MinimalQuestGame } from "src/data/models/MinimalQuestGame";
import { IGDBGameResponse } from "src/data/models/IGDBGameResponse";

class IGDBService {
    private static API_URL = "https://api.igdb.com/v4";

    public static async searchGames(
        query: string
    ): Promise<MinimalQuestGame[]> {
        const token = await TwitchAuthService.getValidToken();

        const bodyQuery = `fields id, name, 
       cover.id, cover.url,
       genres.id, genres.name,
       release_dates.id, release_dates.date,
       platforms.id, platforms.name, platforms.platform_family;
where name ~ *"${query}"*
      & category = (0,8)
      & version_parent = null
      & category != 16
      & platforms.id = (3,4,5,6,7,8,9,11,12,14,
                        18,19,20,21,22,24,33,34,37,38,39,
                        41,46,48,49,130,167,169,170,211,
                        282,283);
sort release_dates.date desc;
limit 100;`;

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
            return [];
        }

        if (!token) {
            throw new Error("No access token found.");
        }

        const gameMap = new Map<number, MinimalQuestGame>();

        data.forEach((game: any) => {
            if (!gameMap.has(game.id)) {
                gameMap.set(game.id, {
                    id: game.id,
                    name: game.name,
                    cover: game.cover
                        ? {
                              id: game.cover.id,
                              url: game.cover.url.replace(
                                  "t_thumb",
                                  "t_cover_big"
                              ),
                          }
                        : null,
                    genres: Array.isArray(game.genres) ? game.genres : [],
                    platforms: [],
                    selectedPlatform: { id: 0, name: "Unknown Platform" }, // Default placeholder
                    rating: game.rating || null,
                    gameStatus: "undiscovered",
                    dateAdded: new Date().toISOString(),
                    priority: 0,
                    personalRating: undefined,
                    notes: undefined,
                    updatedAt: new Date().toISOString(),
                    createdAt: new Date().toISOString(),
                    release_dates: Array.isArray(game.release_dates)
                        ? game.release_dates
                        : [],
                });
            }

            const existingGame = gameMap.get(game.id);
            if (existingGame && game.platforms) {
                const newPlatforms = game.platforms.map((platform: any) => ({
                    id: platform.id,
                    name: platform.name,
                }));

                existingGame.platforms = [
                    ...existingGame.platforms,
                    ...newPlatforms.filter(
                        (p: { id: number }) =>
                            !existingGame.platforms.some((ep) => ep.id === p.id)
                    ),
                ];

                if (
                    existingGame.platforms &&
                    existingGame.platforms.length > 0
                ) {
                    existingGame.selectedPlatform =
                        existingGame.platforms.length === 1
                            ? existingGame.platforms[0]
                            : {
                                  id: 0,
                                  name: `${existingGame.platforms
                                      .map((p) => p.name)
                                      .join(", ")}`,
                              };
                }
            }
        });

        return Array.from(gameMap.values()); // Convert Map back to an array
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
                notes: undefined,
            };
        } catch (error) {
            console.error("Error fetching game details:", error);
            return null;
        }
    }

    public static async getIGDBGameById(
        id: number
    ): Promise<IGDBGameResponse | null> {
        try {
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
       rating, aggregated_rating, storyline,
       websites.category, websites.url,
       franchises.id, franchises.name;
where id = ${id};
sort release_dates.date asc;
        `;

            const fixedQuery = query.replace(/['']/g, "'");

            const response = await fetch("https://api.igdb.com/v4/games", {
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

            // Return the IGDB game response with default empty arrays for optional fields
            return {
                ...gameData,
                alternative_names: gameData.alternative_names || [],
                game_modes: gameData.game_modes || [],
                player_perspectives: gameData.player_perspectives || [],
                themes: gameData.themes || [],
                platforms: gameData.platforms || [],
                release_dates: gameData.release_dates || [],
                screenshots: gameData.screenshots || [],
                videos: gameData.videos || [],
                age_ratings: gameData.age_ratings || [],
                involved_companies: gameData.involved_companies || [],
                genres: gameData.genres || [],
                websites: gameData.websites || [],
                franchises: gameData.franchises || [],
                cover: gameData.cover || null,
            };
        } catch (error) {
            console.error("Error fetching game details:", error);
            return null;
        }
    }
}

export default IGDBService;
