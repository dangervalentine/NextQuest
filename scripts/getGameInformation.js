const {
    existsSync,
    readdirSync,
    writeFileSync,
    mkdirSync,
    readFileSync,
} = require("fs");
const fetch = require("node-fetch");
const { setTimeout } = require("timers/promises");
const _chalk = import("chalk").then((m) => m.default);

require("dotenv").config();

// Validate environment variables
const requiredEnvVars = ["TWITCH_CLIENT_ID", "TWITCH_CLIENT_SECRET"];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.error(`Error: Missing required environment variable ${envVar}`);
        process.exit(1);
    }
}

// Validate command line arguments
let process_arguments = process.argv;
process_arguments.shift();
process_arguments.shift();

if (process_arguments.length !== 1) {
    console.error("Error: Improper Argument Length");
    console.log("Usage: node . <folder/file>");
    process.exit(1);
}

const location = __dirname + "/" + process_arguments[0];
let files = [];

// Validate and read input files
try {
    if (location.endsWith(".json") && existsSync(location)) {
        const fileContent = readFileSync(location, "utf-8");
        const parsedContent = JSON.parse(fileContent);

        if (!Array.isArray(parsedContent)) {
            throw new Error(`${location} is not an array of game objects`);
        }

        files = parsedContent;
    } else {
        if (!existsSync(location)) {
            throw new Error(
                `${location} could not be found or is not a valid directory/file`
            );
        }

        for (const file of readdirSync(location)) {
            if (file.endsWith(".json")) {
                const fileContent = readFileSync(
                    location + "/" + file,
                    "utf-8"
                );
                const parsedContent = JSON.parse(fileContent);

                if (!Array.isArray(parsedContent)) {
                    throw new Error(`Data format in ${file} is improper`);
                }

                files.push(...parsedContent);
            }
        }
    }

    if (files.length === 0) {
        throw new Error("No valid game data found in the input files");
    }
} catch (error) {
    console.error("Error reading input files:", error.message);
    process.exit(1);
}

// Main async function
(async () => {
    try {
        const { red, green, yellow } = await _chalk;

        // Get Twitch Auth
        console.log("Requesting Twitch access token...");
        const auth_res = await fetch(
            `https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&grant_type=client_credentials`,
            {
                method: "POST",
            }
        );

        if (!auth_res.ok) {
            throw new Error(
                `Failed to get Twitch auth token: ${auth_res.statusText}`
            );
        }

        const { access_token } = await auth_res.json();
        console.log("Access token received successfully");

        // Create output directory if it doesn't exist
        if (!existsSync("output")) {
            mkdirSync("output");
        }

        let results = [];
        let successCount = 0;
        let failureCount = 0;

        for (const id in files) {
            try {
                const { title, platform } = files[id];

                if (!title || !platform) {
                    console.log(
                        yellow(
                            `[${parseInt(id) + 1}/${
                                files.length
                            }] Skipping entry: Missing title or platform`
                        )
                    );
                    failureCount++;
                    continue;
                }

                const response = await fetch("https://api.igdb.com/v4/games/", {
                    method: "POST",
                    headers: {
                        "Client-ID": process.env.TWITCH_CLIENT_ID,
                        Authorization: `Bearer ${access_token}`,
                        Accept: "application/json",
                    },
                    body: `fields id, name, summary, 
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
                    collections.id, collections.name,
                    franchises.id, franchises.name;
                    where name ~ *"${title}"* & platforms.name ~ *"${platform}"*;`,
                });

                if (!response.ok) {
                    throw new Error(
                        `API request failed: ${response.statusText}`
                    );
                }

                const json = await response.json();

                if (json.length > 0 && json[0].id) {
                    console.log(
                        green(
                            `[${parseInt(id) + 1}/${
                                files.length
                            }] Located data for ${title} on ${platform}`
                        )
                    );

                    const game = json[0];
                    const transformedGame = {
                        id: game.id,
                        name: game.name,
                        summary: game.summary || null,
                        storyline: game.storyline || null,
                        rating: game.rating || null,
                        aggregated_rating: game.aggregated_rating || null,
                        cover: game.cover
                            ? {
                                  id: game.cover.id,
                                  game_id: game.id,
                                  url: game.cover.url.replace(
                                      "t_thumb",
                                      "t_cover_big"
                                  ),
                              }
                            : null,
                        screenshots: game.screenshots
                            ? game.screenshots.map((screenshot) => ({
                                  id: screenshot.id,
                                  game_id: game.id,
                                  url: screenshot.url.replace(
                                      "t_thumb",
                                      "t_screenshot_big"
                                  ),
                              }))
                            : [],
                        platforms: game.platforms
                            ? game.platforms.map((platform) => ({
                                  id: platform.id,
                                  name: platform.name,
                              }))
                            : [],
                        release_dates: game.release_dates
                            ? game.release_dates.map((date) => ({
                                  id: date.id,
                                  game_id: game.id,
                                  date: date.date,
                                  human: date.human,
                                  platform_id: date.platform,
                              }))
                            : [],
                        involved_companies: game.involved_companies
                            ? game.involved_companies.map((company) => ({
                                  game_id: game.id,
                                  company_id: company.company.id,
                                  developer: company.developer,
                                  publisher: company.publisher,
                                  company: {
                                      id: company.company.id,
                                      name: company.company.name,
                                  },
                              }))
                            : [],
                        genres: game.genres
                            ? game.genres.map((genre) => ({
                                  id: genre.id,
                                  name: genre.name,
                              }))
                            : [],
                        game_modes: game.game_modes
                            ? game.game_modes.map((mode) => ({
                                  id: mode.id,
                                  name: mode.name,
                              }))
                            : [],
                        player_perspectives: game.player_perspectives
                            ? game.player_perspectives.map((perspective) => ({
                                  id: perspective.id,
                                  name: perspective.name,
                              }))
                            : [],
                        themes: game.themes
                            ? game.themes.map((theme) => ({
                                  id: theme.id,
                                  name: theme.name,
                              }))
                            : [],
                        videos: game.videos
                            ? game.videos.map((video) => ({
                                  id: video.id,
                                  game_id: game.id,
                                  video_id: video.video_id,
                              }))
                            : [],
                        age_ratings: game.age_ratings
                            ? game.age_ratings.map((rating) => ({
                                  id: rating.id,
                                  game_id: game.id,
                                  category: rating.category,
                                  rating: rating.rating,
                              }))
                            : [],
                        websites: game.websites
                            ? game.websites.map((website) => ({
                                  id: website.id,
                                  game_id: game.id,
                                  category: website.category,
                                  url: website.url,
                              }))
                            : [],
                        franchises: game.franchises
                            ? game.franchises.map((franchise) => ({
                                  id: franchise.id,
                                  name: franchise.name,
                              }))
                            : [],
                        quest_data: {
                            game_id: game.id,
                            game_status: "undiscovered",
                            personal_rating: null,
                            completion_date: null,
                            notes: null,
                            date_added: new Date().toISOString(),
                            priority: 0,
                            selected_platform_id:
                                game.platforms?.[0]?.id || null,
                        },
                    };

                    results.push(transformedGame);
                    successCount++;
                } else {
                    console.log(
                        red(
                            `[${parseInt(id) + 1}/${
                                files.length
                            }] Failed to locate data for ${title} on ${platform}`
                        )
                    );
                    failureCount++;
                }

                await setTimeout(400); // Rate limiting
            } catch (error) {
                console.error(
                    red(
                        `[${parseInt(id) + 1}/${
                            files.length
                        }] Error processing game: ${error.message}`
                    )
                );
                failureCount++;
            }
        }

        // Write results
        try {
            writeFileSync(
                "data/seed_data.json",
                JSON.stringify(results, null, 2)
            );
            console.log("\nProcessing complete:");
            console.log(green(`Successfully processed: ${successCount} games`));
            console.log(red(`Failed to process: ${failureCount} games`));
            console.log(green("Data written to data/seed_data.json"));
        } catch (error) {
            throw new Error(`Failed to write output file: ${error.message}`);
        }
    } catch (error) {
        console.error("Fatal error:", error.message);
        process.exit(1);
    }
})();
