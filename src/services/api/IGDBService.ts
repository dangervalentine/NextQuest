import { TWITCH_CLIENT_ID } from "@env";
import TwitchAuthService from "./TwitchAuthService";
import { QuestGame } from "src/data/models/QuestGame";
import {
    getQuestGameById,
    getQuestGameStatusesForIds,
    QuestGameStatus,
} from "src/data/repositories/questGames";
import { MinimalQuestGame } from "src/data/models/MinimalQuestGame";
import { IGDBGameResponse } from "src/data/models/IGDBGameResponse";
import { GameStatus } from "src/constants/config/gameStatus";
import RAWRService from "./RAWRService";
import { sortGamesByReleaseDate } from "src/utils/sortingUtils";
import popularityTypes from "src/data/igdb_popularity_types.json";

class IGDBService {
    private static API_URL = "https://api.igdb.com/v4";
    private static SUPPORTED_PLATFORMS =
        "(3,4,5,6,7,8,9,11,12,14,18,19,20,21,22,24,33,34,37,38,39,41,46,48,49,130,167,169,170,211,282,283)";

    // Dictionary for transforming search queries to improve IGDB API results
    private static SEARCH_QUERY_TRANSFORMATIONS: Record<string, string> = {
        // Pokemon series - needs accent
        "pokemon": "pokémon",

        // Common abbreviations and alternate spellings
        "cod": "call of duty",
        "gta": "grand theft auto",
        "bf": "battlefield",
        "wow": "world of warcraft",
        "loz": "legend of zelda",
        "mario bros": "super mario",
        "ff": "final fantasy",

        // Common misspellings
        "assassins creed": "assassin's creed",
    };

    private static transformSearchQuery(query: string): string {
        const lowerQuery = query.toLowerCase().trim();

        // Check for exact matches first
        if (this.SEARCH_QUERY_TRANSFORMATIONS[lowerQuery]) {
            return this.SEARCH_QUERY_TRANSFORMATIONS[lowerQuery];
        }

        // Check for partial matches (useful for series names)
        for (const [key, value] of Object.entries(this.SEARCH_QUERY_TRANSFORMATIONS)) {
            if (lowerQuery.includes(key)) {
                return query.toLowerCase().replace(key, value);
            }
        }

        return query; // Return original if no transformation needed
    }

    private static async executeQuery(
        endpoint: string,
        query: string
    ): Promise<any[]> {
        const token = await TwitchAuthService.getValidToken();

        const response = await fetch(this.API_URL + endpoint, {
            method: "POST",
            headers: {
                "Client-ID": TWITCH_CLIENT_ID,
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
            body: query,
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (!data || !Array.isArray(data)) {
            return [];
        }

        return data;
    }

    private static mapToMinimalQuestGame(game: any): MinimalQuestGame {
        const now = new Date().toISOString();
        return {
            id: game.id,
            name: game.name,
            gameStatus: "undiscovered" as GameStatus,
            updatedAt: now,
            createdAt: now,
            dateAdded: now,
            cover: game.cover
                ? {
                    id: game.cover.id,
                    url: game.cover.url.replace("t_thumb", "t_cover_big"),
                }
                : null,
            platforms:
                game.platforms?.map((platform: any) => ({
                    id: platform.id,
                    name: platform.name,
                })) || [],
            genres:
                game.genres?.map((genre: any) => ({
                    id: genre.id,
                    name: genre.name,
                })) || [],
            release_dates: (
                game.release_dates?.map((release: any) => ({
                    id: release.id,
                    date: release.date,
                    platform_id: release.platform,
                })) || []
            ).sort(
                (a: { date: number }, b: { date: number }) => a.date - b.date
            ),
        };
    }

    private static getBaseGameFields(): string {
        return `fields id, name,
       cover.id, cover.url,
       genres.id, genres.name,
       release_dates.id, release_dates.date,
       platforms.id, platforms.name, platforms.platform_family,
       status, hypes, summary;`;
    }

    private static async searchGamesBy(
        whereClause: string,
        includePlatformFilter: boolean = true
    ): Promise<MinimalQuestGame[]> {
        const platformFilter = includePlatformFilter
            ? `& platforms.id = ${this.SUPPORTED_PLATFORMS}`
            : "";

        const query = `${this.getBaseGameFields()}
where ${whereClause}
      & category = (0,8)
      ${platformFilter}
      & (status = null | status = 0);
sort release_dates.date desc;
limit 100;`;

        const data = await this.executeQuery("/games", query);

        // Map the games first
        const mappedGames = data.map((game) =>
            this.mapToMinimalQuestGame(game)
        );

        // Get all game IDs
        const gameIds = mappedGames.map((game) => game.id);

        // Fetch quest game statuses for these IDs
        const questGameStatuses = await getQuestGameStatusesForIds(gameIds);
        // Merge the quest game statuses with the mapped games
        const gamesWithStatus = mappedGames.map((game) => {
            const questGame = questGameStatuses.find(
                (qg: QuestGameStatus) => qg.game_id === game.id
            );
            if (questGame) {
                return {
                    ...game,
                    gameStatus: questGame.game_status,
                };
            }
            return game;
        });

        return sortGamesByReleaseDate(gamesWithStatus);
    }

    public static async searchGames(
        query: string
    ): Promise<MinimalQuestGame[]> {
        // Transform the query to handle special cases
        const transformedQuery = this.transformSearchQuery(query);

        const games = await this.searchGamesBy(`name ~ *"${transformedQuery}"*`);
        const lowerQuery = transformedQuery.toLowerCase().trim();

        // Sort games so exact matches appear first
        return games
            .sort((a, b) => {
                const aNameLower = a.name.toLowerCase();
                const bNameLower = b.name.toLowerCase();

                if (aNameLower === lowerQuery && bNameLower !== lowerQuery) return -1;
                if (bNameLower === lowerQuery && aNameLower !== lowerQuery) return 1;

                return 0;
            });
    }

    public static async searchGamesByPlatform(
        platformId: number
    ): Promise<MinimalQuestGame[]> {
        return this.searchGamesBy(`platforms = ${platformId}`, false);
    }

    public static async searchGamesByGenre(
        genreId: number
    ): Promise<MinimalQuestGame[]> {
        return this.searchGamesBy(`genres = ${genreId}`);
    }

    public static async searchGamesByTheme(
        themeId: number
    ): Promise<MinimalQuestGame[]> {
        return this.searchGamesBy(`themes = ${themeId}`);
    }

    public static async searchGamesByCompany(
        companyId: number
    ): Promise<MinimalQuestGame[]> {
        return this.searchGamesBy(`involved_companies.company = ${companyId}`);
    }

    public static async searchGamesByFranchise(
        franchiseId: number
    ): Promise<MinimalQuestGame[]> {
        return this.searchGamesBy(`franchises = ${franchiseId}`);
    }

    public static async getPopularGames(): Promise<MinimalQuestGame[]> {
        const chosenPopularityType =
            popularityTypes[Math.floor(Math.random() * 8)];

        if (!chosenPopularityType) {
            throw new Error("IGDB Popular popularity type not found");
        }
        // First get popular game IDs
        const popularityQuery = `fields game_id,value,popularity_type;
sort value desc;
limit 10;
offset ${Math.floor(Math.random() * 100)};
where popularity_type = ${chosenPopularityType.id};`;

        const popularGames = await this.executeQuery(
            "/popularity_primitives",
            popularityQuery
        );
        if (popularGames.length === 0) return [];

        const gameIds = popularGames.map((item) => item.game_id);
        return this.searchGamesBy(`id = (${gameIds.join(",")})`);
    }

    public static async fetchGameDetails(
        id: number
    ): Promise<QuestGame | null> {
        try {
            // Try to get the game from the database first
            const savedGame = await getQuestGameById(id);

            if (savedGame) {
                const savedGameMetacriticScore = await RAWRService.getMetacriticScore(
                    savedGame.name,
                    savedGame.selectedPlatform?.name
                );
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
                    metacriticScore: savedGameMetacriticScore?.score,
                    metacriticUrl: savedGameMetacriticScore?.url,
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
       rating, aggregated_rating, storyline,
       websites.category, websites.url,
       franchises.id, franchises.name;
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

            const metacriticScore = await RAWRService.getMetacriticScore(
                gameData.name
            );

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
                franchises: gameData.franchises || [],
                selectedPlatform: { id: 0, name: "" },
                personalRating: undefined,
                notes: undefined,
                metacriticScore: metacriticScore?.score,
                metacriticUrl: metacriticScore?.url,
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
            throw error;
        }
    }
}

export default IGDBService;
