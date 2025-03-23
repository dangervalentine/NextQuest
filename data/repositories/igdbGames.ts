import db from "../config/database";
import {
    IGDBGameResponse,
    Cover,
    Genre,
    Platform,
    GameMode,
    PlayerPerspective,
    Theme,
    InvolvedCompany,
} from "../models/IGDBGameResponse";
import * as genreRepo from "./genres";
import * as platformRepo from "./platforms";
import * as gameModeRepo from "./gameModes";
import * as perspectiveRepo from "./playerPerspectives";
import * as themeRepo from "./themes";
import * as coverRepo from "./covers";
import * as screenshotRepo from "./screenshots";
import * as altNameRepo from "./alternativeNames";
import * as companyRepo from "./companies";
import * as releaseDateRepo from "./releaseDates";
import * as videoRepo from "./videos";
import * as websiteRepo from "./websites";
import * as ageRatingRepo from "./ageRatings";
import * as dlcRepo from "./dlcs";
import * as multiplayerRepo from "./multiplayerModes";

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
}

export const getIGDBGameById = async (
    id: number
): Promise<IGDBGameResponse | null> => {
    try {
        const [game] = await db.getAllAsync<IGDBGameRow>(
            `
            SELECT 
                g.id, g.name, g.summary, g.storyline, g.rating, g.aggregated_rating,
                c.id as cover_id, c.url as cover_url,
                GROUP_CONCAT(DISTINCT json_object('id', gn.id, 'name', gn.name)) as genres,
                GROUP_CONCAT(DISTINCT json_object('id', p.id, 'name', p.name)) as platforms,
                GROUP_CONCAT(DISTINCT json_object('id', gm.id, 'name', gm.name)) as game_modes,
                GROUP_CONCAT(DISTINCT json_object('id', pp.id, 'name', pp.name)) as player_perspectives,
                GROUP_CONCAT(DISTINCT json_object('id', t.id, 'name', t.name)) as themes,
                GROUP_CONCAT(DISTINCT json_object(
                    'id', ic.id, 
                    'game_id', ic.game_id, 
                    'company_id', ic.company_id,
                    'developer', ic.developer,
                    'publisher', ic.publisher,
                    'company', json_object('id', co.id, 'name', co.name)
                )) as involved_companies
            FROM games g
            LEFT JOIN covers c ON g.id = c.game_id
            LEFT JOIN game_genres gg ON g.id = gg.game_id
            LEFT JOIN genres gn ON gg.genre_id = gn.id
            LEFT JOIN game_platforms gp ON g.id = gp.game_id
            LEFT JOIN platforms p ON gp.platform_id = p.id
            LEFT JOIN game_modes_map gmm ON g.id = gmm.game_id
            LEFT JOIN game_modes gm ON gmm.game_mode_id = gm.id
            LEFT JOIN game_perspectives gpp ON g.id = gpp.game_id
            LEFT JOIN player_perspectives pp ON gpp.perspective_id = pp.id
            LEFT JOIN game_themes gt ON g.id = gt.game_id
            LEFT JOIN themes t ON gt.theme_id = t.id
            LEFT JOIN involved_companies ic ON g.id = ic.game_id
            LEFT JOIN companies co ON ic.company_id = co.id
            WHERE g.id = ${id}
            GROUP BY g.id
        `
        );

        if (!game) return null;

        // Get related data
        const screenshots = await screenshotRepo.getScreenshotsForGame(id);
        const alternativeNames = await altNameRepo.getAlternativeNamesForGame(
            id
        );
        const releaseDates = await releaseDateRepo.getReleaseDatesForGame(id);
        const videos = await videoRepo.getVideosForGame(id);
        const websites = await websiteRepo.getWebsitesForGame(id);
        const ageRatings = await ageRatingRepo.getAgeRatingsForGame(id);
        const dlcs = await dlcRepo.getDLCsForGame(id);
        const multiplayerModes = await multiplayerRepo.getMultiplayerModesForGame(
            id
        );

        // Create the cover object if we have both id and url
        const cover: Cover =
            game.cover_id && game.cover_url
                ? { id: game.cover_id, game_id: id, url: game.cover_url }
                : { id: 0, game_id: id, url: "" }; // Default cover if none exists

        // Parse JSON arrays with type safety
        const genres: Genre[] = game.genres
            ? JSON.parse(`[${game.genres}]`.replace(/\\/g, ""))
            : [];
        const platforms: Platform[] = game.platforms
            ? JSON.parse(`[${game.platforms}]`.replace(/\\/g, ""))
            : [];
        const gameModes: GameMode[] = game.game_modes
            ? JSON.parse(`[${game.game_modes}]`.replace(/\\/g, ""))
            : [];
        const playerPerspectives: PlayerPerspective[] = game.player_perspectives
            ? JSON.parse(`[${game.player_perspectives}]`.replace(/\\/g, ""))
            : [];
        const themes: Theme[] = game.themes
            ? JSON.parse(`[${game.themes}]`.replace(/\\/g, ""))
            : [];
        const involvedCompanies: InvolvedCompany[] = game.involved_companies
            ? JSON.parse(`[${game.involved_companies}]`.replace(/\\/g, ""))
            : [];

        return {
            id: game.id,
            name: game.name,
            summary: game.summary || "",
            storyline: game.storyline || "",
            rating: game.rating || 0,
            aggregated_rating: game.aggregated_rating || 0,
            cover,
            genres,
            platforms,
            game_modes: gameModes,
            player_perspectives: playerPerspectives,
            themes,
            involved_companies: involvedCompanies,
            alternative_names: alternativeNames,
            screenshots,
            release_dates: releaseDates,
            videos,
            websites,
            age_ratings: ageRatings,
            dlcs,
            multiplayer_modes: multiplayerModes,
        };
    } catch (error) {
        console.error("Error getting IGDB game by id:", error);
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
