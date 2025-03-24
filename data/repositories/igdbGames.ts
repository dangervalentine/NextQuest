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

export const getIGDBGameById = async (
    id: number
): Promise<IGDBGameResponse | null> => {
    try {
        console.log(`[getIGDBGameById] Fetching game with ID: ${id}`);
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
            console.log(`[getIGDBGameById] No game found with ID: ${id}`);
            return null;
        }

        console.log(`[getIGDBGameById] Found game: ${game.name}`);
        console.log(`[getIGDBGameById] Cover URL: ${game.cover_url}`);

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
            console.log(
                `[getIGDBGameById] Found ${screenshots.length} screenshots`
            );
        } catch (error) {
            console.error(
                `[getIGDBGameById] Error getting screenshots:`,
                error
            );
        }

        try {
            alternativeNames = await altNameRepo.getAlternativeNamesForGame(id);
            console.log(
                `[getIGDBGameById] Found ${alternativeNames.length} alternative names`
            );
        } catch (error) {
            console.error(
                `[getIGDBGameById] Error getting alternative names:`,
                error
            );
        }

        try {
            releaseDates = await releaseDateRepo.getReleaseDatesForGame(id);
            console.log(
                `[getIGDBGameById] Found ${releaseDates.length} release dates`
            );
        } catch (error) {
            console.error(
                `[getIGDBGameById] Error getting release dates:`,
                error
            );
        }

        try {
            videos = await videoRepo.getVideosForGame(id);
            console.log(`[getIGDBGameById] Found ${videos.length} videos`);
        } catch (error) {
            console.error(`[getIGDBGameById] Error getting videos:`, error);
        }

        try {
            websites = await websiteRepo.getWebsitesForGame(id);
            console.log(`[getIGDBGameById] Found ${websites.length} websites`);
        } catch (error) {
            console.error(`[getIGDBGameById] Error getting websites:`, error);
        }

        try {
            ageRatings = await ageRatingRepo.getAgeRatingsForGame(id);
            console.log(
                `[getIGDBGameById] Found ${ageRatings.length} age ratings`
            );
        } catch (error) {
            console.error(
                `[getIGDBGameById] Error getting age ratings:`,
                error
            );
        }

        try {
            dlcs = await dlcRepo.getDLCsForGame(id);
            console.log(`[getIGDBGameById] Found ${dlcs.length} DLCs`);
        } catch (error) {
            console.error(`[getIGDBGameById] Error getting DLCs:`, error);
        }

        try {
            multiplayerModes = await multiplayerRepo.getMultiplayerModesForGame(
                id
            );
            console.log(`[getIGDBGameById] Found multiplayer modes`);
        } catch (error) {
            console.error(
                `[getIGDBGameById] Error getting multiplayer modes:`,
                error
            );
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
                console.log(`[getIGDBGameById] Parsed ${genres.length} genres`);
            }
        } catch (error) {
            console.error(`[getIGDBGameById] Error parsing genres:`, error);
        }

        try {
            if (game.platforms) {
                const parsedPlatforms = JSON.parse(game.platforms);
                platforms = Array.isArray(parsedPlatforms)
                    ? parsedPlatforms.filter((p) => p && p.id && p.name)
                    : [];
                console.log(
                    `[getIGDBGameById] Parsed ${platforms.length} platforms`
                );
            }
        } catch (error) {
            console.error(`[getIGDBGameById] Error parsing platforms:`, error);
        }

        try {
            if (game.game_modes) {
                const parsedModes = JSON.parse(game.game_modes);
                gameModes = Array.isArray(parsedModes)
                    ? parsedModes.filter((m) => m && m.id && m.name)
                    : [];
                console.log(
                    `[getIGDBGameById] Parsed ${gameModes.length} game modes`
                );
            }
        } catch (error) {
            console.error(`[getIGDBGameById] Error parsing game modes:`, error);
        }

        try {
            if (game.player_perspectives) {
                const parsedPerspectives = JSON.parse(game.player_perspectives);
                playerPerspectives = Array.isArray(parsedPerspectives)
                    ? parsedPerspectives.filter((p) => p && p.id && p.name)
                    : [];
                console.log(
                    `[getIGDBGameById] Parsed ${playerPerspectives.length} player perspectives`
                );
            }
        } catch (error) {
            console.error(
                `[getIGDBGameById] Error parsing player perspectives:`,
                error
            );
        }

        try {
            if (game.themes) {
                const parsedThemes = JSON.parse(game.themes);
                themes = Array.isArray(parsedThemes)
                    ? parsedThemes.filter((t) => t && t.id && t.name)
                    : [];
                console.log(`[getIGDBGameById] Parsed ${themes.length} themes`);
            }
        } catch (error) {
            console.error(`[getIGDBGameById] Error parsing themes:`, error);
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
                console.log(
                    `[getIGDBGameById] Parsed ${involvedCompanies.length} involved companies`
                );
            }
        } catch (error) {
            console.error(
                `[getIGDBGameById] Error parsing involved companies:`,
                error
            );
        }

        try {
            if (game.franchises) {
                const parsedFranchises = JSON.parse(game.franchises);
                franchises = Array.isArray(parsedFranchises)
                    ? parsedFranchises.filter((f) => f && f.id && f.name)
                    : [];
                console.log(
                    `[getIGDBGameById] Parsed ${franchises.length} franchises`
                );
            }
        } catch (error) {
            console.error(`[getIGDBGameById] Error parsing franchises:`, error);
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

        console.log(
            `[getIGDBGameById] Successfully constructed response object`
        );
        return response;
    } catch (error) {
        console.error(`[getIGDBGameById] Error:`, error);
        throw error;
    }
};

export const createIGDBGame = async (gameData: IGDBGameResponse) => {
    try {
        // Start a transaction
        await db.execAsync("BEGIN TRANSACTION");

        try {
            // Create base game record
            const gameQuery = `
                INSERT INTO games (
                    id, name, summary, storyline, rating, aggregated_rating
                ) VALUES (
                    ${gameData.id},
                    '${gameData.name.replace(/'/g, "''")}',
                    '${(gameData.summary || "").replace(/'/g, "''")}',
                    '${(gameData.storyline || "").replace(/'/g, "''")}',
                    ${gameData.rating || 0},
                    ${gameData.aggregated_rating || 0}
                )
            `;
            await db.execAsync(gameQuery);

            // Create or update related entities
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
                            ${involvedCompany.company_id}, 
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

            // Commit the transaction
            await db.execAsync("COMMIT");

            return await getIGDBGameById(gameData.id);
        } catch (error) {
            // Rollback the transaction on error
            await db.execAsync("ROLLBACK");
            throw error;
        }
    } catch (error) {
        console.error("Error creating IGDB game:", error);
        throw error;
    }
};
