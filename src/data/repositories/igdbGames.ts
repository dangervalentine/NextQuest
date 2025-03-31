import {
    IGDBGameResponse,
    Cover,
    Genre,
    Platform,
    GameMode,
    PlayerPerspective,
    Theme,
    InvolvedCompany,
    Screenshot,
    AlternativeName,
    ReleaseDate,
    Video,
    Website,
    AgeRating,
    DLC,
    MultiplayerMode,
} from "../models/IGDBGameResponse";
import db from "../config/database";
import * as screenshotRepo from "./screenshots";
import * as altNameRepo from "./alternativeNames";
import * as releaseDateRepo from "./releaseDates";
import * as videoRepo from "./videos";
import * as websiteRepo from "./websites";
import * as ageRatingRepo from "./ageRatings";
import * as dlcRepo from "./dlcs";
import * as multiplayerRepo from "./multiplayerModes";
import * as genreRepo from "./genres";
import * as platformRepo from "./platforms";
import * as gameModeRepo from "./gameModes";
import * as perspectiveRepo from "./playerPerspectives";
import * as themeRepo from "./themes";
import * as coverRepo from "./covers";
import * as companyRepo from "./companies";
import { QuestGame } from "../models/QuestGame";
import { GameStatus } from "src/constants/config/gameStatus";

// Database row type
interface IGDBGameRow {
    id: number;
    name: string;
    summary: string | null;
    storyline: string | null;
    rating: number | null;
    aggregated_rating: number | null;
    cover_id: number | null;
    cover_url: string | null;
    genres: string | null;
    platforms: string | null;
    game_modes: string | null;
    player_perspectives: string | null;
    themes: string | null;
    involved_companies: string | null;
    franchises: string | null;
    game_status: string | null;
    personal_rating: number | null;
    completion_date: string | null;
    notes: string | null;
    date_added: string | null;
    priority: number | null;
    selected_platform_id: number | null;
}

// Minimal database row type for list view
interface MinimalIGDBGameRow {
    id: number;
    name: string;
    cover_id: number | null;
    cover_url: string | null;
    genres: string | null;
    release_dates: string | null;
}

export const getIGDBGameById = async (
    id: number
): Promise<IGDBGameResponse | null> => {
    try {
        const [game] = await db.getAllAsync<IGDBGameRow>(
            `
            SELECT 
                g.*,
                qg.personal_rating,
                qg.completion_date,
                qg.notes,
                qg.date_added,
                qg.priority,
                qg.selected_platform_id,
                qs.name as game_status,
                cov.id as cover_id,
                cov.url as cover_url,
                json_group_array(DISTINCT json_object('id', gmod.id, 'name', gmod.name)) as game_modes,
                json_group_array(DISTINCT json_object('id', pp.id, 'name', pp.name)) as player_perspectives,
                json_group_array(DISTINCT json_object('id', th.id, 'name', th.name)) as themes,
                json_group_array(DISTINCT json_object(
                    'id', fr.id,
                    'name', fr.name
                )) as franchises,
                json_group_array(DISTINCT json_object('id', gen.id, 'name', gen.name)) as genres,
                json_group_array(DISTINCT json_object('id', plat.id, 'name', plat.name)) as platforms,
                json_group_array(DISTINCT json_object(
                    'id', ic.id,
                    'company_id', comp.id,
                    'developer', ic.developer,
                    'publisher', ic.publisher,
                    'company', json_object('id', comp.id, 'name', comp.name)
                )) as involved_companies,
                json_group_array(DISTINCT json_object(
                    'id', w.id,
                    'category', w.category,
                    'url', w.url
                )) as websites
            FROM games g
            LEFT JOIN quest_games qg ON g.id = qg.game_id
            LEFT JOIN quest_game_status qs ON qg.status_id = qs.id
            LEFT JOIN covers cov ON g.id = cov.game_id
            LEFT JOIN game_genres gg ON g.id = gg.game_id
            LEFT JOIN genres gen ON gg.genre_id = gen.id
            LEFT JOIN game_platforms gpl ON g.id = gpl.game_id
            LEFT JOIN platforms plat ON gpl.platform_id = plat.id
            LEFT JOIN game_modes_map gmm ON g.id = gmm.game_id
            LEFT JOIN game_modes gmod ON gmm.game_mode_id = gmod.id
            LEFT JOIN game_perspectives gpersp ON g.id = gpersp.game_id
            LEFT JOIN player_perspectives pp ON gpersp.perspective_id = pp.id
            LEFT JOIN game_themes gth ON g.id = gth.game_id
            LEFT JOIN themes th ON gth.theme_id = th.id
            LEFT JOIN game_franchises gf ON g.id = gf.game_id
            LEFT JOIN franchises fr ON gf.franchise_id = fr.id
            LEFT JOIN involved_companies ic ON g.id = ic.game_id
            LEFT JOIN companies comp ON ic.company_id = comp.id
            LEFT JOIN websites w ON g.id = w.game_id
            WHERE g.id = ${id}
            GROUP BY g.id
            `
        );

        if (!game) {
            console.error(`No game found with ID: ${id}`);
            return null;
        }

        // Initialize arrays for related data
        let screenshots: Screenshot[] = [];
        let alternativeNames: AlternativeName[] = [];
        let releaseDates: ReleaseDate[] = [];
        let videos: Video[] = [];
        let websites: Website[] = [];
        let ageRatings: AgeRating[] = [];
        let dlcs: DLC[] = [];
        let multiplayerModes: MultiplayerMode[] | null = null;

        // Get related data
        try {
            screenshots = await screenshotRepo.getScreenshotsForGame(id);
        } catch (error) {
            console.error(`Error getting screenshots:`, error);
        }

        try {
            alternativeNames = await altNameRepo.getAlternativeNamesForGame(id);
        } catch (error) {
            console.error(`Error getting alternative names:`, error);
        }

        try {
            releaseDates = await releaseDateRepo.getReleaseDatesForGame(id);
        } catch (error) {
            console.error(`Error getting release dates:`, error);
        }

        try {
            videos = await videoRepo.getVideosForGame(id);
        } catch (error) {
            console.error(`Error getting videos:`, error);
        }

        try {
            websites = await websiteRepo.getWebsitesForGame(id);
        } catch (error) {
            console.error(`Error getting websites:`, error);
        }

        try {
            ageRatings = await ageRatingRepo.getAgeRatingsForGame(id);
        } catch (error) {
            console.error(`Error getting age ratings:`, error);
        }

        try {
            dlcs = await dlcRepo.getDLCsForGame(id);
        } catch (error) {
            console.error(`Error getting DLCs:`, error);
        }

        try {
            multiplayerModes = await multiplayerRepo.getMultiplayerModesForGame(
                id
            );
        } catch (error) {
            console.error(`Error getting multiplayer modes:`, error);
        }

        // Parse JSON arrays
        let genres: Genre[] = [];
        let platforms: Platform[] = [];
        let gameModes: GameMode[] = [];
        let playerPerspectives: PlayerPerspective[] = [];
        let themes: Theme[] = [];
        let involvedCompanies: InvolvedCompany[] = [];
        let franchises: { id: number; name: string }[] = [];

        try {
            if (game.genres) {
                const parsedGenres = JSON.parse(game.genres);
                genres = Array.isArray(parsedGenres)
                    ? parsedGenres.filter((g) => g && g.id && g.name)
                    : [];
            }
        } catch (error) {
            console.error(`Error parsing genres:`, error);
        }

        try {
            if (game.platforms) {
                const parsedPlatforms = JSON.parse(game.platforms);
                platforms = Array.isArray(parsedPlatforms)
                    ? parsedPlatforms.filter((p) => p && p.id && p.name)
                    : [];
            }
        } catch (error) {
            console.error(`Error parsing platforms:`, error);
        }

        try {
            if (game.game_modes) {
                const parsedModes = JSON.parse(game.game_modes);
                gameModes = Array.isArray(parsedModes)
                    ? parsedModes.filter((m) => m && m.id && m.name)
                    : [];
            }
        } catch (error) {
            console.error(`Error parsing game modes:`, error);
        }

        try {
            if (game.player_perspectives) {
                const parsedPerspectives = JSON.parse(game.player_perspectives);
                playerPerspectives = Array.isArray(parsedPerspectives)
                    ? parsedPerspectives.filter((p) => p && p.id && p.name)
                    : [];
            }
        } catch (error) {
            console.error(`Error parsing player perspectives:`, error);
        }

        try {
            if (game.themes) {
                const parsedThemes = JSON.parse(game.themes);
                themes = Array.isArray(parsedThemes)
                    ? parsedThemes.filter((t) => t && t.id && t.name)
                    : [];
            }
        } catch (error) {
            console.error(`Error parsing themes:`, error);
        }

        try {
            if (game.involved_companies) {
                const parsedCompanies = JSON.parse(game.involved_companies);
                involvedCompanies = Array.isArray(parsedCompanies)
                    ? parsedCompanies.filter(
                          (ic) =>
                              ic &&
                              ic.id &&
                              ic.company_id &&
                              ic.company &&
                              ic.company.id &&
                              ic.company.name
                      )
                    : [];
            }
        } catch (error) {
            console.error(`Error parsing involved companies:`, error);
        }

        try {
            if (game.franchises) {
                const parsedFranchises = JSON.parse(game.franchises);
                franchises = Array.isArray(parsedFranchises)
                    ? parsedFranchises.filter((f) => f && f.id && f.name)
                    : [];
            }
        } catch (error) {
            console.error(`Error parsing franchises:`, error);
        }

        // Construct the response object with null checks
        const response: IGDBGameResponse = {
            id: game.id,
            name: game.name || "",
            summary: game.summary || "",
            storyline: game.storyline || "",
            rating: game.rating || 0,
            aggregated_rating: game.aggregated_rating || 0,
            cover:
                game.cover_id && game.cover_url
                    ? {
                          id: game.cover_id,
                          url: game.cover_url,
                      }
                    : null,
            genres: genres || [],
            platforms: platforms || [],
            game_modes: gameModes || [],
            player_perspectives: playerPerspectives || [],
            themes: themes || [],
            involved_companies: involvedCompanies || [],
            screenshots: screenshots || [],
            release_dates: releaseDates || [],
            videos: videos || [],
            age_ratings: ageRatings || [],
            alternative_names: alternativeNames || [],
            websites: websites || [],
            dlcs: dlcs || [],
            multiplayer_modes: multiplayerModes || undefined,
            franchises: franchises || [],
        };

        return response;
    } catch (error) {
        console.error(`Error fetching game:`, error);
        throw error;
    }
};

export const getMinimalIGDBGameById = async (id: number) => {
    try {
        const [game] = await db.getAllAsync<MinimalIGDBGameRow>(
            `
            SELECT 
                g.id,
                g.name,
                cov.id as cover_id,
                cov.url as cover_url,
                json_group_array(DISTINCT json_object('id', gen.id, 'name', gen.name)) as genres,
                json_group_array(DISTINCT json_object(
                    'id', rd.id,
                    'date', rd.date,
                    'platform_id', rd.platform_id
                )) as release_dates
            FROM games g
            LEFT JOIN covers cov ON g.id = cov.game_id
            LEFT JOIN game_genres gg ON g.id = gg.game_id
            LEFT JOIN genres gen ON gg.genre_id = gen.id
            LEFT JOIN release_dates rd ON g.id = rd.game_id
            WHERE g.id = ${id}
            GROUP BY g.id
            `
        );

        if (!game) {
            console.error(`No game found with ID: ${id}`);
            return null;
        }

        // Parse JSON arrays
        let genres: Genre[] = [];
        let release_dates: ReleaseDate[] = [];

        try {
            if (game.genres) {
                const parsedGenres = JSON.parse(game.genres);
                genres = Array.isArray(parsedGenres)
                    ? parsedGenres.filter((g) => g && g.id && g.name)
                    : [];
            }
        } catch (error) {
            console.error(`Error parsing genres:`, error);
        }

        try {
            if (game.release_dates) {
                const parsedDates = JSON.parse(game.release_dates);
                release_dates = Array.isArray(parsedDates)
                    ? parsedDates.filter((d) => d && d.id && d.date)
                    : [];
            }
        } catch (error) {
            console.error(`Error parsing release dates:`, error);
        }

        return {
            id: game.id,
            name: game.name || "",
            cover:
                game.cover_id && game.cover_url
                    ? {
                          id: game.cover_id,
                          url: game.cover_url,
                      }
                    : null,
            genres,
            release_dates,
        };
    } catch (error) {
        console.error(`Error fetching minimal game data:`, error);
        throw error;
    }
};

export const createIGDBGame = async (
    gameData: IGDBGameResponse
): Promise<IGDBGameResponse | null> => {
    try {
        await db.execAsync("BEGIN TRANSACTION");

        try {
            const gameQuery = `
    INSERT INTO games (
        id, name, summary, storyline, rating, aggregated_rating
    ) VALUES (
        ${gameData.id},
        '${gameData.name.replace(/'/g, "''")}',
        ${
            gameData.summary
                ? `'${gameData.summary.replace(/'/g, "''")}'`
                : "NULL"
        },
        ${
            gameData.storyline
                ? `'${gameData.storyline.replace(/'/g, "''")}'`
                : "NULL"
        },
        ${gameData.rating !== undefined ? gameData.rating : "NULL"},
        ${
            gameData.aggregated_rating !== undefined
                ? gameData.aggregated_rating
                : "NULL"
        }
    )
`;
            await db.execAsync(gameQuery);

            if (gameData.cover) {
                await coverRepo.getOrCreateCover({
                    ...gameData.cover,
                    game_id: gameData.id,
                });
            }

            if (gameData.screenshots) {
                for (const screenshot of gameData.screenshots) {
                    await screenshotRepo.getOrCreateScreenshot({
                        ...screenshot,
                        game_id: gameData.id,
                    });
                }
            }

            if (gameData.genres) {
                for (const genre of gameData.genres) {
                    await genreRepo.getOrCreateGenre(genre);
                    await genreRepo.addGenreToGame(genre.id, gameData.id);
                }
            }

            if (gameData.platforms) {
                for (const platform of gameData.platforms) {
                    const createdPlatform =
                        (await platformRepo.getPlatformById(platform.id)) ||
                        (await platformRepo.getPlatformByName(platform.name));
                    if (createdPlatform) {
                        await db.execAsync(
                            `INSERT OR IGNORE INTO game_platforms (game_id, platform_id) VALUES (${gameData.id}, ${createdPlatform.id})`
                        );
                    }
                }
            }

            if (gameData.game_modes) {
                for (const mode of gameData.game_modes) {
                    await gameModeRepo.getOrCreateGameMode(mode);
                    await gameModeRepo.addGameModeToGame(mode.id, gameData.id);
                }
            }

            if (gameData.player_perspectives) {
                for (const perspective of gameData.player_perspectives) {
                    await perspectiveRepo.getOrCreatePlayerPerspective(
                        perspective
                    );
                    await perspectiveRepo.addPlayerPerspectiveToGame(
                        perspective.id,
                        gameData.id
                    );
                }
            }

            if (gameData.themes) {
                for (const theme of gameData.themes) {
                    await themeRepo.getOrCreateTheme(theme);
                    await themeRepo.addThemeToGame(theme.id, gameData.id);
                }
            }

            if (gameData.alternative_names) {
                for (const altName of gameData.alternative_names) {
                    await altNameRepo.getOrCreateAlternativeName({
                        ...altName,
                        game_id: gameData.id,
                    });
                }
            }

            if (gameData.involved_companies) {
                for (const involvedCompany of gameData.involved_companies) {
                    await companyRepo.getOrCreateCompany(
                        involvedCompany.company
                    );
                    await db.execAsync(`
                        INSERT OR IGNORE INTO involved_companies (
                            game_id, company_id, developer, publisher
                        ) VALUES (
                            ${gameData.id}, 
                            ${involvedCompany.company.id}, 
                            ${involvedCompany.developer ? 1 : 0}, 
                            ${involvedCompany.publisher ? 1 : 0}
                        )
                    `);
                }
            }

            if (gameData.release_dates) {
                for (const releaseDate of gameData.release_dates) {
                    await releaseDateRepo.getOrCreateReleaseDate({
                        id: releaseDate.id,
                        game_id: gameData.id,
                        date: releaseDate.date,
                        human: releaseDate.human,
                        platform_id: releaseDate.platform_id || 0,
                    });
                }
            }

            if (gameData.videos) {
                for (const video of gameData.videos) {
                    await videoRepo.getOrCreateVideo({
                        ...video,
                        game_id: gameData.id,
                    });
                }
            }

            if (gameData.websites) {
                for (const website of gameData.websites) {
                    await websiteRepo.getOrCreateWebsite({
                        ...website,
                        game_id: gameData.id,
                    });
                }
            }

            if (gameData.age_ratings) {
                for (const ageRating of gameData.age_ratings) {
                    await ageRatingRepo.getOrCreateAgeRating({
                        ...ageRating,
                        game_id: gameData.id,
                    });
                }
            }

            if (gameData.dlcs) {
                for (const dlc of gameData.dlcs) {
                    await dlcRepo.getOrCreateDLC({
                        ...dlc,
                        game_id: gameData.id,
                    });
                }
            }

            if (gameData.multiplayer_modes) {
                for (const mode of gameData.multiplayer_modes) {
                    await multiplayerRepo.getOrCreateMultiplayerMode({
                        ...mode,
                        game_id: gameData.id,
                        dropin: false,
                        offlinecoop: false,
                        splitscreenonline: false,
                    });
                }
            }

            await db.execAsync("COMMIT");

            return await getIGDBGameById(gameData.id);
        } catch (error) {
            await db.execAsync("ROLLBACK");
            throw error;
        }
    } catch (error) {
        console.error("Error creating IGDB game:", error);
        throw error;
    }
};

export const createGame = async (
    game: QuestGame | any,
    gameStatus: GameStatus = "backlog"
) => {
    try {
        // Insert base game data
        await db.execAsync(
            `INSERT OR REPLACE INTO games (id, name, summary, storyline, rating, aggregated_rating)
            VALUES (
                ${game.id},
                '${(game.name || "").replace(/'/g, "''")}',
                ${
                    game.summary
                        ? `'${game.summary.replace(/'/g, "''")}'`
                        : "NULL"
                },
                ${
                    game.storyline
                        ? `'${game.storyline.replace(/'/g, "''")}'`
                        : "NULL"
                },
                ${game.rating || "NULL"},
                ${game.aggregated_rating || "NULL"}
            )`
        );

        // Insert platforms if they don't exist
        if (game.platforms && Array.isArray(game.platforms)) {
            for (const platform of game.platforms) {
                if (platform && platform.id && platform.name) {
                    await db.execAsync(
                        `INSERT OR IGNORE INTO platforms (id, name) VALUES (${
                            platform.id
                        }, '${platform.name.replace(/'/g, "''")}')`
                    );

                    // Insert game-platform relationships
                    await db.execAsync(
                        `INSERT OR REPLACE INTO game_platforms (game_id, platform_id) VALUES (${game.id}, ${platform.id})`
                    );
                }
            }
        }

        // Insert cover if exists
        if (game.cover && game.cover.id && game.cover.url) {
            await db.execAsync(
                `INSERT OR REPLACE INTO covers (id, game_id, url) VALUES (${
                    game.cover.id
                }, ${game.id}, '${game.cover.url.replace(/'/g, "''")}')`
            );
        }

        // Insert screenshots if they exist
        if (game.screenshots && Array.isArray(game.screenshots)) {
            for (const screenshot of game.screenshots) {
                if (screenshot && screenshot.id && screenshot.url) {
                    await db.execAsync(
                        `INSERT OR REPLACE INTO screenshots (id, game_id, url) VALUES (${
                            screenshot.id
                        }, ${game.id}, '${screenshot.url.replace(/'/g, "''")}')`
                    );
                }
            }
        }

        // Insert age ratings if they exist
        if (game.age_ratings && Array.isArray(game.age_ratings)) {
            for (const rating of game.age_ratings) {
                if (
                    rating &&
                    rating.id &&
                    rating.category !== undefined &&
                    rating.rating !== undefined
                ) {
                    await db.execAsync(
                        `INSERT OR REPLACE INTO age_ratings (id, game_id, category, rating) VALUES (${rating.id}, ${game.id}, ${rating.category}, ${rating.rating})`
                    );
                }
            }
        }

        // Insert release dates if they exist
        if (game.release_dates && Array.isArray(game.release_dates)) {
            for (const date of game.release_dates) {
                if (
                    date &&
                    date.id &&
                    date.date &&
                    date.human &&
                    date.platform_id
                ) {
                    await db.execAsync(
                        `INSERT OR REPLACE INTO release_dates (id, game_id, date, human, platform_id) VALUES (${
                            date.id
                        }, ${game.id}, ${date.date}, '${date.human.replace(
                            /'/g,
                            "''"
                        )}', ${date.platform_id})`
                    );
                }
            }
        }

        // Insert involved companies and companies if they exist
        if (game.involved_companies && Array.isArray(game.involved_companies)) {
            for (const ic of game.involved_companies) {
                if (ic && ic.company && ic.company.id && ic.company.name) {
                    // Insert company if it doesn't exist
                    await db.execAsync(
                        `INSERT OR IGNORE INTO companies (id, name) VALUES (${
                            ic.company.id
                        }, '${ic.company.name.replace(/'/g, "''")}')`
                    );

                    // Insert involved company relationship
                    await db.execAsync(
                        `INSERT OR REPLACE INTO involved_companies (game_id, company_id, developer, publisher) VALUES (${
                            game.id
                        }, ${ic.company.id}, ${ic.developer ? 1 : 0}, ${
                            ic.publisher ? 1 : 0
                        })`
                    );
                }
            }
        }

        // Insert genres if they exist
        if (game.genres && Array.isArray(game.genres)) {
            for (const genre of game.genres) {
                if (genre && genre.id && genre.name) {
                    // Insert genre if it doesn't exist
                    await db.execAsync(
                        `INSERT OR IGNORE INTO genres (id, name) VALUES (${
                            genre.id
                        }, '${genre.name.replace(/'/g, "''")}')`
                    );

                    // Insert game-genre relationship
                    await db.execAsync(
                        `INSERT OR REPLACE INTO game_genres (game_id, genre_id) VALUES (${game.id}, ${genre.id})`
                    );
                }
            }
        }

        // Insert game modes if they exist
        if (game.game_modes && Array.isArray(game.game_modes)) {
            for (const mode of game.game_modes) {
                if (mode && mode.id && mode.name) {
                    // Insert game mode if it doesn't exist
                    await db.execAsync(
                        `INSERT OR IGNORE INTO game_modes (id, name) VALUES (${
                            mode.id
                        }, '${mode.name.replace(/'/g, "''")}')`
                    );

                    // Insert game-mode relationship
                    await db.execAsync(
                        `INSERT OR REPLACE INTO game_modes_map (game_id, game_mode_id) VALUES (${game.id}, ${mode.id})`
                    );
                }
            }
        }

        // Insert player perspectives if they exist
        if (
            game.player_perspectives &&
            Array.isArray(game.player_perspectives)
        ) {
            for (const perspective of game.player_perspectives) {
                if (perspective && perspective.id && perspective.name) {
                    // Insert perspective if it doesn't exist
                    await db.execAsync(
                        `INSERT OR IGNORE INTO player_perspectives (id, name) VALUES (${
                            perspective.id
                        }, '${perspective.name.replace(/'/g, "''")}')`
                    );

                    // Insert game-perspective relationship
                    await db.execAsync(
                        `INSERT OR REPLACE INTO game_perspectives (game_id, perspective_id) VALUES (${game.id}, ${perspective.id})`
                    );
                }
            }
        }

        // Insert themes if they exist
        if (game.themes && Array.isArray(game.themes)) {
            for (const theme of game.themes) {
                if (theme && theme.id && theme.name) {
                    // Insert theme if it doesn't exist
                    await db.execAsync(
                        `INSERT OR IGNORE INTO themes (id, name) VALUES (${
                            theme.id
                        }, '${theme.name.replace(/'/g, "''")}')`
                    );

                    // Insert game-theme relationship
                    await db.execAsync(
                        `INSERT OR REPLACE INTO game_themes (game_id, theme_id) VALUES (${game.id}, ${theme.id})`
                    );
                }
            }
        }

        // Insert franchises if they exist
        if (game.franchises && Array.isArray(game.franchises)) {
            for (const franchise of game.franchises) {
                if (franchise && franchise.id && franchise.name) {
                    // Insert franchise if it doesn't exist
                    await db.execAsync(
                        `INSERT OR IGNORE INTO franchises (id, name) VALUES (${
                            franchise.id
                        }, '${franchise.name.replace(/'/g, "''")}')`
                    );

                    // Insert game-franchise relationship
                    await db.execAsync(
                        `INSERT OR REPLACE INTO game_franchises (game_id, franchise_id) VALUES (${game.id}, ${franchise.id})`
                    );
                }
            }
        }

        // Insert websites if they exist
        if (game.websites && Array.isArray(game.websites)) {
            for (const website of game.websites) {
                if (
                    website &&
                    website.id &&
                    website.url &&
                    website.category !== undefined
                ) {
                    await db.execAsync(
                        `INSERT OR REPLACE INTO websites (id, game_id, category, url) VALUES (${
                            website.id
                        }, ${game.id}, ${
                            website.category
                        }, '${website.url.replace(/'/g, "''")}')`
                    );
                }
            }
        }

        // Get the status id
        const [status] = await db.getAllAsync<{ id: number }>(`
            SELECT id FROM quest_game_status WHERE name = '${gameStatus}'
        `);

        if (!status) {
            throw new Error(
                `Could not find '${gameStatus}' status in quest_game_status table`
            );
        }

        // Insert quest game data with status_id
        const questData = game.quest_data || {};
        await db.execAsync(
            `INSERT OR REPLACE INTO quest_games (
                game_id, status_id, personal_rating, completion_date,
                notes, date_added, priority, selected_platform_id
            ) VALUES (
                ${game.id},
                ${status.id},
                ${
                    questData.personal_rating !== undefined
                        ? questData.personal_rating
                        : "NULL"
                },
                ${
                    questData.completion_date
                        ? `'${questData.completion_date}'`
                        : "NULL"
                },
                ${
                    questData.notes
                        ? `'${questData.notes.replace(/'/g, "''")}'`
                        : "NULL"
                },
                '${questData.date_added || new Date().toISOString()}',
                ${questData.priority || 0},
                ${questData.selected_platform_id || "NULL"}
            )`
        );
    } catch (error) {
        console.error("Error seeding game:", error);
        throw error;
    }
};
