import React, { useEffect, useRef, useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    View,
    ActivityIndicator,
    Animated,
    ImageBackground,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { QuestGameDetailRouteProp } from "../utils/navigationTypes";
import { getGameStatus } from "../utils/dataMappers";
import ImageCarousel from "./GameDetail/components/ImageCarousel";
import { colorSwatch } from "../utils/colorConstants";
import IGDBService from "../services/IGDBService";
import FullWidthImage from "./shared/FullWidthImage";
import { GameStatus } from "../constants/gameStatus";
import { QuestGame } from "../data/models/QuestGame";

const QuestGameDetailPage: React.FC = () => {
    const route = useRoute<QuestGameDetailRouteProp>();
    const { id } = route.params;
    const [game, setGameDetails] = useState<QuestGame | null>(null);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const loadGameDetails = async () => {
            const game: QuestGame | null = await IGDBService.fetchGameDetails(
                id
            );

            setGameDetails(game);

            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }).start();
        };
        loadGameDetails();
    }, [id]);

    if (!game) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator
                    size="large"
                    color={colorSwatch.accent.green}
                />
            </View>
        );
    }

    const HeaderSection: React.FC = () => (
        <View style={styles.headerSection}>
            {game.cover && (
                <FullWidthImage
                    source={`https:${game.cover.url.replace(
                        "t_thumb",
                        "t_720p"
                    )}`}
                    style={styles.coverImage}
                />
            )}
            <View style={styles.headerInfo}>
                <Text style={styles.gameTitle}>{game.name}</Text>
                <Text style={styles.releaseDate}>
                    {game.release_dates?.[0]?.human || "Release date unknown"}
                </Text>
            </View>
        </View>
    );

    const MetadataGrid: React.FC = () => {
        const getStatusStyles = (status: GameStatus | undefined) => {
            switch (status) {
                case "completed":
                    return {
                        color: colorSwatch.accent.green,
                        fontWeight: "bold" as "bold",
                        fontStyle: "normal" as "normal",
                    };
                case "active":
                    return {
                        color: colorSwatch.accent.yellow,
                        fontWeight: "normal" as "normal",
                        fontStyle: "italic" as "italic",
                    };
                default:
                    return {
                        color: colorSwatch.accent.pink,
                        fontWeight: "normal" as "normal",
                        fontStyle: "normal" as "normal",
                    };
            }
        };
        return (
            <View style={styles.metadataGrid}>
                <View style={styles.metadataItem}>
                    <Text style={styles.metadataLabel}>Status</Text>
                    <Text
                        style={[
                            styles.metadataValue,
                            getStatusStyles(game.gameStatus),
                        ]}
                    >
                        {game.gameStatus
                            ? getGameStatus(game.gameStatus)
                            : "Not set"}
                    </Text>
                </View>
                {game.gameStatus === "completed" && game.completionDate && (
                    <View style={styles.metadataItem}>
                        <Text style={styles.metadataLabel}>Completed On</Text>
                        <Text
                            style={[
                                styles.metadataValue,
                                { color: colorSwatch.accent.green },
                            ]}
                        >
                            {new Date(game.completionDate).toLocaleDateString()}
                        </Text>
                    </View>
                )}
                <View style={styles.metadataItem}>
                    <Text style={styles.metadataLabel}>Age Rating</Text>
                    <Text style={styles.metadataValue}>
                        {game.age_ratings?.[0]?.rating || "N/A"}
                    </Text>
                </View>
                <View style={styles.metadataItem}>
                    <Text style={styles.metadataLabel}>Date Added</Text>
                    <Text style={styles.metadataValue}>
                        {game.dateAdded?.split("T")[0]}
                    </Text>
                </View>
                <View style={styles.metadataItem}>
                    <Text style={styles.metadataLabel}>Platform</Text>
                    <Text style={styles.metadataValue}>
                        {game.selectedPlatform?.name || "Not set"}
                    </Text>
                </View>
            </View>
        );
    };

    const PersonalReviewSection: React.FC = () => {
        if (!game.notes && !game.personalRating) return null;

        return (
            <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Personal Review</Text>
                {game.personalRating && (
                    <View style={styles.ratingContainer}>
                        <Text style={styles.ratingLabel}>My Rating</Text>
                        <Text style={styles.ratingValue}>
                            {game.personalRating.toFixed(1)}/10
                        </Text>
                        <View style={styles.ratingBar}>
                            <View
                                style={[
                                    styles.ratingFill,
                                    {
                                        width: `${
                                            (game.personalRating / 10) * 100
                                        }%`,
                                    },
                                ]}
                            />
                        </View>
                    </View>
                )}
                {game.notes && (
                    <View style={styles.noteContainer}>
                        <Text style={styles.noteText}>{game.notes}</Text>
                    </View>
                )}
            </View>
        );
    };

    const NotesSection: React.FC = () => (
        <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Personal Notes</Text>
            <View style={styles.noteContainer}>
                <Text style={styles.noteText}>"{game.notes}"</Text>
            </View>
        </View>
    );

    const GenresSection: React.FC = () => (
        <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Genres</Text>
            <View style={styles.genresContainer}>
                {game.genres?.map((genre: { name: string }, index: number) => (
                    <Text key={index} style={styles.genreText}>
                        {genre.name}
                    </Text>
                ))}
            </View>
        </View>
    );

    const PlatformsSection: React.FC = () => (
        <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Platforms</Text>
            <View style={styles.platformsContainer}>
                {game.platforms
                    ?.map((platform) => {
                        const releaseDate = game.release_dates?.find(
                            (rd) => rd.platform_id === platform.id
                        );
                        return {
                            date: releaseDate?.date || Infinity,
                            name: platform.name,
                            human: releaseDate?.human || "",
                        };
                    })
                    .sort((a, b) => a.date - b.date)
                    .map((platform, index) => (
                        <Text key={index} style={styles.platformText}>
                            {platform.name} ({platform.human?.split("T")[0]})
                        </Text>
                    ))}
            </View>
        </View>
    );

    const CompaniesSection: React.FC = () => (
        <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Companies</Text>
            {game.involved_companies?.map((company, index) => (
                <View key={index} style={styles.companyItem}>
                    <Text style={styles.companyRole}>
                        {company.developer
                            ? "Developer"
                            : company.publisher
                            ? "Publisher"
                            : "Other"}
                    </Text>
                    <Text style={styles.companyName}>
                        {company.company.name}
                    </Text>
                </View>
            ))}
        </View>
    );

    const StorylineSection: React.FC = () => (
        <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Storyline</Text>
            <Text style={styles.storylineText}>
                {game.storyline || game.summary}
            </Text>
        </View>
    );

    const ScreenshotsSection: React.FC = () => (
        <View style={styles.screenshotsSection}>
            <Text style={styles.screenshotsTitle}>Screenshots</Text>
            <ImageCarousel
                images={
                    game.screenshots?.map((s) =>
                        s.url.replace("t_thumb", "t_720p")
                    ) ?? []
                }
            />
        </View>
    );

    const GameModesSection: React.FC = () => {
        if (!game.game_modes?.length) return null;
        return (
            <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Game Modes</Text>
                <View style={styles.tagsContainer}>
                    {game.game_modes.map((mode, index) => (
                        <View key={index} style={styles.tagItem}>
                            <Text style={styles.tagText}>{mode.name}</Text>
                        </View>
                    ))}
                </View>
            </View>
        );
    };

    const PerspectivesSection: React.FC = () => {
        if (!game.player_perspectives?.length) return null;
        return (
            <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Player Perspectives</Text>
                <View style={styles.tagsContainer}>
                    {game.player_perspectives.map((perspective, index) => (
                        <View key={index} style={styles.tagItem}>
                            <Text style={styles.tagText}>
                                {perspective.name}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>
        );
    };

    const ThemesSection: React.FC = () => {
        if (!game.themes?.length) return null;
        return (
            <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Themes</Text>
                <View style={styles.tagsContainer}>
                    {game.themes.map((theme, index) => (
                        <View key={index} style={styles.tagItem}>
                            <Text style={styles.tagText}>{theme.name}</Text>
                        </View>
                    ))}
                </View>
            </View>
        );
    };

    const WebsitesSection: React.FC = () => {
        if (!game.websites?.length) return null;

        const getWebsiteType = (category: number) => {
            const types = {
                1: "Official",
                2: "Wikia",
                3: "Wikipedia",
                4: "Facebook",
                5: "Twitter",
                6: "Twitch",
                8: "Instagram",
                9: "YouTube",
                13: "Steam",
                14: "Reddit",
                15: "Discord",
                16: "Google Play",
                17: "App Store",
            };
            return types[category as keyof typeof types] || "Other";
        };

        return (
            <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Websites</Text>
                <View style={styles.websitesContainer}>
                    {game.websites.map((website, index) => (
                        <View key={index} style={styles.websiteItem}>
                            <Text style={styles.websiteType}>
                                {getWebsiteType(website.category)}
                            </Text>
                            <Text style={styles.websiteUrl} numberOfLines={1}>
                                {website.url}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>
        );
    };

    return (
        <ImageBackground
            source={require("../assets/quest-logger.png")}
            style={styles.container}
            resizeMode="contain"
        >
            <View style={styles.overlay} />
            <ScrollView style={{ flex: 1 }}>
                <HeaderSection />
                <MetadataGrid />
                <PersonalReviewSection />
                {game.screenshots && game.screenshots.length > 0 && (
                    <ScreenshotsSection />
                )}
                {game.genres && game.genres.length > 0 && <GenresSection />}
                <GameModesSection />
                <PerspectivesSection />
                <ThemesSection />
                {game.platforms && game.platforms.length > 0 && (
                    <PlatformsSection />
                )}
                {(game.storyline || game.summary) && <StorylineSection />}
                {game.involved_companies &&
                    game.involved_companies.length > 0 && <CompaniesSection />}
                <WebsitesSection />
                <View style={styles.bottomClearance}></View>
            </ScrollView>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colorSwatch.background.dark,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: colorSwatch.background.dark,
        opacity: 0.98,
    },
    headerSection: {
        backgroundColor: colorSwatch.background.dark,
        borderRadius: 6,
    },
    coverImage: {
        width: "100%",
        backgroundColor: colorSwatch.background.dark,
        resizeMode: "contain",
    },
    headerInfo: {
        backgroundColor: colorSwatch.background.dark,
        margin: 12,
        alignItems: "center",
    },
    gameTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: colorSwatch.text.primary,
        marginBottom: 4,
    },
    releaseDate: {
        fontSize: 14,
        color: colorSwatch.text.secondary,
    },
    metadataGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginHorizontal: 4,
        marginTop: 16,
        backgroundColor: colorSwatch.background.medium,
        borderRadius: 12,
        padding: 8,
    },
    metadataItem: {
        width: "50%",
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    metadataLabel: {
        fontSize: 12,
        color: colorSwatch.text.secondary,
        marginBottom: 4,
    },
    metadataValue: {
        fontSize: 16,
        color: colorSwatch.text.primary,
        fontWeight: "600",
    },
    sectionContainer: {
        marginTop: 16,
        marginHorizontal: 4,
        backgroundColor: colorSwatch.background.medium,
        borderRadius: 12,
        padding: 16,
        elevation: 4,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: colorSwatch.accent.green,
        marginBottom: 12,
    },
    genresContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: 4,
    },
    genreText: {
        color: colorSwatch.text.primary,
        backgroundColor: colorSwatch.background.dark,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginRight: 8,
        marginBottom: 8,
        fontSize: 14,
        justifyContent: "center",
        alignItems: "center",
    },
    platformsContainer: {
        marginTop: 4,
    },
    platformText: {
        color: colorSwatch.text.primary,
        fontSize: 14,
        marginBottom: 8,
    },
    companyItem: {
        fontSize: 16,
        color: colorSwatch.text.primary,
        backgroundColor: colorSwatch.background.medium,
        borderRadius: 8,
        marginBottom: 8,
    },
    companyRole: {
        fontSize: 12,
        color: colorSwatch.text.secondary,
        marginBottom: 2,
    },
    companyName: {
        fontSize: 16,
        color: colorSwatch.text.primary,
    },
    storylineText: {
        fontSize: 16,
        lineHeight: 24,
        color: colorSwatch.text.primary,
    },
    screenshotsSection: {
        marginTop: 16,
        marginHorizontal: 4,
        backgroundColor: colorSwatch.background.medium,
        borderRadius: 12,
        padding: 16,
        overflow: "hidden",
        paddingBottom: 30,
        resizeMode: "cover",
    },
    screenshotsTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: colorSwatch.accent.purple,
        marginBottom: 12,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colorSwatch.background.dark,
    },
    ratingContainer: {
        marginBottom: 16,
        backgroundColor: colorSwatch.background.dark,
        padding: 12,
        borderRadius: 8,
    },
    ratingLabel: {
        fontSize: 14,
        color: colorSwatch.text.secondary,
        marginBottom: 4,
    },
    ratingValue: {
        fontSize: 24,
        fontWeight: "bold",
        color: colorSwatch.accent.yellow,
        marginBottom: 8,
    },
    ratingBar: {
        height: 8,
        backgroundColor: colorSwatch.background.medium,
        borderRadius: 4,
        overflow: "hidden",
    },
    ratingFill: {
        height: "100%",
        backgroundColor: colorSwatch.accent.yellow,
        borderRadius: 4,
    },
    noteContainer: {
        backgroundColor: colorSwatch.background.dark,
        padding: 16,
        borderRadius: 8,
    },
    noteText: {
        color: colorSwatch.text.primary,
        fontSize: 16,
        lineHeight: 24,
        fontStyle: "italic",
    },
    bottomClearance: {
        height: 60,
        width: "80%",
        borderBottomColor: colorSwatch.primary.dark,
        borderBottomWidth: 1,
        alignSelf: "center",
        marginBottom: 20,
    },
    tagsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: 8,
        gap: 8,
    },
    tagItem: {
        backgroundColor: colorSwatch.background.dark,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    tagText: {
        color: colorSwatch.text.primary,
        fontSize: 14,
    },
    websitesContainer: {
        gap: 12,
    },
    websiteItem: {
        backgroundColor: colorSwatch.background.dark,
        padding: 12,
        borderRadius: 8,
    },
    websiteType: {
        color: colorSwatch.accent.purple,
        fontSize: 14,
        fontWeight: "bold",
        marginBottom: 4,
    },
    websiteUrl: {
        color: colorSwatch.text.primary,
        fontSize: 14,
    },
});

export default QuestGameDetailPage;
