import React, { useEffect, useRef, useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    View,
    ActivityIndicator,
    Animated,
    ImageBackground,
    ViewStyle,
    TextStyle,
    ImageStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRoute } from "@react-navigation/native";
import { QuestGameDetailRouteProp } from "../utils/navigationTypes";
import { getGameStatus } from "../utils/dataMappers";
import ImageCarousel from "./GameDetail/components/ImageCarousel";
import { colorSwatch } from "../utils/colorConstants";
import IGDBService from "../services/IGDBService";
import FullWidthImage from "./shared/FullWidthImage";
import { GameStatus } from "../constants/gameStatus";
import { QuestGame } from "../data/models/QuestGame";
import { getAgeRating } from "../utils/getAgeRating";
import WebsitesSection from "../app/components/WebsitesSection";

type Styles = {
    container: ViewStyle;
    overlay: ViewStyle;
    headerSection: ViewStyle;
    coverImage: ImageStyle;
    headerInfo: ViewStyle;
    gameTitle: TextStyle;
    releaseDate: TextStyle;
    sectionContainer: ViewStyle;
    screenshotsContainer: ViewStyle;
    characteristicsContainer: ViewStyle;
    platformSection: ViewStyle;
    platformTitle: TextStyle;
    infoSection: ViewStyle;
    screenshotsSection: ViewStyle;
    mainSectionTitle: TextStyle;
    subSectionTitle: TextStyle;
    storylineText: TextStyle;
    loadingContainer: ViewStyle;
    metadataGrid: ViewStyle;
    metadataItem: ViewStyle;
    metadataLabel: TextStyle;
    metadataValue: TextStyle;
    ratingContainer: ViewStyle;
    ratingLabel: TextStyle;
    ratingValue: TextStyle;
    ratingBar: ViewStyle;
    ratingFill: ViewStyle;
    noteContainer: ViewStyle;
    noteText: TextStyle;
    platformsList: ViewStyle;
    platformItem: ViewStyle;
    platformName: TextStyle;
    platformDate: TextStyle;
    bottomClearance: ViewStyle;
    tagsFlow: ViewStyle;
    tagItem: ViewStyle;
    tagText: TextStyle;
    section: ViewStyle;
    tagsContainer: ViewStyle;
    tag: ViewStyle;
    characteristicSection: ViewStyle;
    characteristicTitle: TextStyle;
    companiesGrid: ViewStyle;
    companyCard: ViewStyle;
    companyRole: TextStyle;
    companyName: TextStyle;
    screenshotsTitle: TextStyle;
    sectionTitle: TextStyle;
    franchiseLinks: ViewStyle;
    franchiseLink: TextStyle;
};

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
                        "t_cover_big",
                        "t_720p"
                    )}`}
                    style={{
                        width: "100%",
                        backgroundColor: colorSwatch.background.dark,
                    }}
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

        const handleFranchisePress = (franchiseId: number) => {
            // TODO: Implement franchise navigation
            console.log(`Navigate to franchise: ${franchiseId}`);
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
                        {getAgeRating(game) || "N/A"}
                    </Text>
                </View>
                <View style={styles.metadataItem}>
                    <Text style={styles.metadataLabel}>Date Added</Text>
                    <Text style={styles.metadataValue}>
                        {new Date(
                            game.dateAdded?.split("T")[0]
                        ).toLocaleDateString()}
                    </Text>
                </View>
                <View style={styles.metadataItem}>
                    <Text style={styles.metadataLabel}>Platform</Text>
                    <Text style={styles.metadataValue}>
                        {game.selectedPlatform?.name || "Not set"}
                    </Text>
                </View>
                {game.franchises && game.franchises.length > 0 && (
                    <View style={[styles.metadataItem]}>
                        <Text style={styles.metadataLabel}>Franchises</Text>
                        <View style={styles.franchiseLinks}>
                            {game.franchises.map((franchise) => (
                                <Text
                                    key={franchise.id}
                                    style={styles.franchiseLink}
                                    onPress={() =>
                                        handleFranchisePress(franchise.id)
                                    }
                                >
                                    {franchise.name}
                                    {franchise.id !==
                                    game.franchises[game.franchises.length - 1]
                                        .id
                                        ? ", "
                                        : ""}
                                </Text>
                            ))}
                        </View>
                    </View>
                )}
            </View>
        );
    };

    const getRatingColor = (rating: number) => {
        // Normal rating color logic for non-10 ratings
        const normalizedRating = rating / 10;

        if (normalizedRating <= 0.4) {
            // Pink to Yellow gradient (0-4)
            const t = normalizedRating * 2.5; // 0-1 for 0-0.4 range
            const pinkRGB = hexToRGB(colorSwatch.accent.pink);
            const yellowRGB = hexToRGB(colorSwatch.accent.yellow);
            return interpolateColors(t, pinkRGB, yellowRGB);
        } else if (normalizedRating <= 0.7) {
            // Pure yellow (4-7)
            return colorSwatch.accent.yellow;
        } else if (rating < 10) {
            // Yellow to Green gradient (7-10)
            const t = (normalizedRating - 0.7) * (1 / 0.3); // 0-1 for 0.7-1.0 range
            const yellowRGB = hexToRGB(colorSwatch.accent.yellow);
            const greenRGB = hexToRGB(colorSwatch.accent.green);
            return interpolateColors(t, yellowRGB, greenRGB);
        }
        // Rating 10 case is handled separately with LinearGradient
        return colorSwatch.accent.yellow;
    };

    // Helper function to convert hex to RGB
    const hexToRGB = (hex: string) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return { r, g, b };
    };

    // Helper function to interpolate between two RGB colors
    const interpolateColors = (
        t: number,
        color1: { r: number; g: number; b: number },
        color2: { r: number; g: number; b: number }
    ) => {
        const r = Math.round(color1.r + (color2.r - color1.r) * t);
        const g = Math.round(color1.g + (color2.g - color1.g) * t);
        const b = Math.round(color1.b + (color2.b - color1.b) * t);
        return `rgb(${r}, ${g}, ${b})`;
    };

    const PersonalReviewSection: React.FC = () => {
        if (!game.notes && !game.personalRating) return null;

        return (
            <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Personal Review</Text>
                {game.personalRating && (
                    <View style={styles.ratingContainer}>
                        <Text style={styles.ratingLabel}>My Rating</Text>
                        <Text
                            style={[
                                styles.ratingValue,
                                {
                                    color:
                                        game.personalRating === 10
                                            ? colorSwatch.text.primary
                                            : getRatingColor(
                                                  game.personalRating
                                              ),
                                },
                            ]}
                        >
                            {game.personalRating.toFixed()}/10
                        </Text>
                        <View style={styles.ratingBar}>
                            {game.personalRating >= 10 ? (
                                <LinearGradient
                                    colors={[
                                        colorSwatch.accent.pink,
                                        colorSwatch.accent.yellow,
                                        colorSwatch.accent.green,
                                        colorSwatch.accent.cyan,
                                    ]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={[
                                        styles.ratingFill,
                                        { width: "100%" },
                                    ]}
                                />
                            ) : (
                                <View
                                    style={[
                                        styles.ratingFill,
                                        {
                                            width: `${
                                                (game.personalRating / 10) * 100
                                            }%`,
                                            backgroundColor: getRatingColor(
                                                game.personalRating
                                            ),
                                        },
                                    ]}
                                />
                            )}
                        </View>
                    </View>
                )}
                {game.notes && (
                    <View style={styles.noteContainer}>
                        <Text style={styles.noteText}>"{game.notes}"</Text>
                    </View>
                )}
            </View>
        );
    };

    const PlatformsSection: React.FC = () => (
        <View style={styles.platformsList}>
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
                    <View key={index} style={styles.platformItem}>
                        <Text style={styles.platformName}>{platform.name}</Text>
                        <Text style={styles.platformDate}>
                            {platform.human?.split("T")[0]}
                        </Text>
                    </View>
                ))}
        </View>
    );

    const GenresSection: React.FC = () => {
        if (!game.genres?.length) return null;
        return (
            <View style={styles.characteristicSection}>
                <Text style={styles.characteristicTitle}>Genres</Text>
                <View style={styles.tagsFlow}>
                    {game.genres?.map(
                        (genre: { name: string }, index: number) => (
                            <View key={index} style={styles.tagItem}>
                                <Text style={styles.tagText}>{genre.name}</Text>
                            </View>
                        )
                    )}
                </View>
            </View>
        );
    };

    const ThemesSection: React.FC = () => {
        if (!game.themes?.length) return null;
        return (
            <View style={styles.characteristicSection}>
                <Text style={styles.characteristicTitle}>Themes</Text>
                <View style={styles.tagsFlow}>
                    {game.themes.map((theme, index) => (
                        <View key={index} style={styles.tagItem}>
                            <Text style={styles.tagText}>{theme.name}</Text>
                        </View>
                    ))}
                </View>
            </View>
        );
    };

    const GameModesSection: React.FC = () => {
        if (!game.game_modes?.length) return null;
        return (
            <View style={styles.characteristicSection}>
                <Text style={styles.characteristicTitle}>Game Modes</Text>
                <View style={styles.tagsFlow}>
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
            <View style={styles.characteristicSection}>
                <Text style={styles.characteristicTitle}>
                    Player Perspectives
                </Text>
                <View style={styles.tagsFlow}>
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

    const StorylineSection: React.FC = () => (
        <Text style={styles.storylineText}>
            {game.storyline || game.summary}
        </Text>
    );

    const CompaniesSection: React.FC = () => {
        // Group companies by role
        const groupedCompanies = {
            developers:
                game.involved_companies
                    ?.filter((c) => c.developer)
                    .map((c) => c.company?.name || "")
                    .filter(Boolean) || [],
            publishers:
                game.involved_companies
                    ?.filter((c) => c.publisher)
                    .map((c) => c.company?.name || "")
                    .filter(Boolean) || [],
            others:
                game.involved_companies
                    ?.filter((c) => !c.developer && !c.publisher)
                    .map((c) => c.company?.name || "")
                    .filter(Boolean) || [],
        };

        if (
            !groupedCompanies.developers.length &&
            !groupedCompanies.publishers.length &&
            !groupedCompanies.others.length
        ) {
            return null;
        }

        return (
            <View style={styles.companiesGrid}>
                {groupedCompanies.developers.length > 0 && (
                    <View style={styles.companyCard}>
                        <Text style={styles.companyRole}>Developer</Text>
                        <Text style={styles.companyName}>
                            {groupedCompanies.developers.join(", ")}
                        </Text>
                    </View>
                )}
                {groupedCompanies.publishers.length > 0 && (
                    <View style={styles.companyCard}>
                        <Text style={styles.companyRole}>Publisher</Text>
                        <Text style={styles.companyName}>
                            {groupedCompanies.publishers.join(", ")}
                        </Text>
                    </View>
                )}
                {groupedCompanies.others.length > 0 && (
                    <View style={styles.companyCard}>
                        <Text style={styles.companyRole}>Other</Text>
                        <Text style={styles.companyName}>
                            {groupedCompanies.others.join(", ")}
                        </Text>
                    </View>
                )}
            </View>
        );
    };

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

    return (
        <ImageBackground
            source={require("../assets/dygat.png")}
            style={styles.container}
            resizeMode="contain"
        >
            <View style={styles.overlay} />
            <ScrollView style={{ flex: 1 }}>
                {/* Hero Section */}
                <HeaderSection />

                {/* Progress Tracking */}
                <View style={styles.sectionContainer}>
                    <MetadataGrid />
                </View>

                {/* Personal Review Section */}
                {game.gameStatus === "completed" && <PersonalReviewSection />}

                {/* Visual Showcase */}
                {game.screenshots && game.screenshots.length > 0 && (
                    <View style={styles.screenshotsContainer}>
                        <ScreenshotsSection />
                    </View>
                )}

                {/* Core Game Information */}
                {(game.storyline || game.summary) && (
                    <View style={styles.sectionContainer}>
                        <Text style={styles.mainSectionTitle}>
                            About the Game
                        </Text>
                        <StorylineSection />
                    </View>
                )}

                {/* Essential Game Categories */}
                <View style={styles.sectionContainer}>
                    {/* Platforms */}
                    {game.platforms && game.platforms.length > 0 && (
                        <View style={styles.platformSection}>
                            <Text style={styles.platformTitle}>Platforms</Text>
                            <PlatformsSection />
                        </View>
                    )}

                    {/* Core Categories */}
                    <View style={styles.characteristicsContainer}>
                        <GenresSection />
                        <ThemesSection />
                    </View>
                </View>

                {/* Additional Game Details */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.mainSectionTitle}>
                        Additional Details
                    </Text>

                    {/* External Links */}
                    <WebsitesSection websites={game.websites || []} />

                    {/* Gameplay Specifics */}
                    <View style={styles.characteristicsContainer}>
                        <GameModesSection />
                        <PerspectivesSection />
                    </View>

                    {/* Development Info */}
                    {game.involved_companies &&
                        game.involved_companies.length > 0 && (
                            <View style={styles.infoSection}>
                                <Text style={styles.subSectionTitle}>
                                    Development
                                </Text>
                                <CompaniesSection />
                            </View>
                        )}
                </View>

                <View style={styles.bottomClearance} />
            </ScrollView>
        </ImageBackground>
    );
};

const styles = StyleSheet.create<Styles>({
    container: {
        flex: 1,
        backgroundColor: colorSwatch.background.dark,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: colorSwatch.background.dark,
        opacity: 0.99,
    },
    headerSection: {
        borderRadius: 6,
    },
    coverImage: {
        width: "100%",
        backgroundColor: colorSwatch.background.dark,
        resizeMode: "contain",
    },
    headerInfo: {
        alignItems: "center",
    },
    gameTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: colorSwatch.neutral.lightGray,
        marginBottom: 4,
        marginTop: 12,
    },
    releaseDate: {
        fontSize: 14,
        color: colorSwatch.text.secondary,
    },
    sectionContainer: {
        marginHorizontal: 16,
        marginTop: 24,
        backgroundColor: colorSwatch.background.darkest,
        borderRadius: 12,
        padding: 16,
        elevation: 4,
    },
    screenshotsContainer: {
        marginTop: 24,
        backgroundColor: colorSwatch.background.darkest,
        borderRadius: 12,
        padding: 0,
    },
    characteristicsContainer: {
        marginTop: 16,
        gap: 16,
    },
    platformSection: {
        backgroundColor: colorSwatch.background.darker,
        padding: 16,
        borderRadius: 12,
    },
    platformTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: colorSwatch.accent.purple,
        marginBottom: 8,
    },
    infoSection: {
        marginTop: 16,
        backgroundColor: colorSwatch.background.dark,
        borderRadius: 8,
        padding: 16,
    },
    screenshotsSection: {
        paddingBottom: 30,
    },
    mainSectionTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: colorSwatch.accent.purple,
        marginBottom: 20,
    },
    subSectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: colorSwatch.accent.cyan,
        marginBottom: 12,
    },
    storylineText: {
        fontSize: 16,
        lineHeight: 24,
        color: colorSwatch.neutral.lightGray,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colorSwatch.background.dark,
    },
    metadataGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginHorizontal: 4,
        marginTop: 16,
        backgroundColor: colorSwatch.background.darker,
        borderRadius: 12,
        padding: 12,
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
        color: colorSwatch.neutral.lightGray,
        fontWeight: "600",
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: colorSwatch.accent.green,
        marginBottom: 12,
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
        fontSize: 16,
        lineHeight: 24,
        fontStyle: "italic",
        color: colorSwatch.secondary.main,
    },
    platformsList: {
        gap: 8,
    },
    platformItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: colorSwatch.background.darkest,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colorSwatch.neutral.darkGray,
    },
    platformName: {
        color: colorSwatch.neutral.lightGray,
        fontSize: 14,
        fontWeight: "500",
    },
    platformDate: {
        color: colorSwatch.text.secondary,
        fontSize: 12,
    },
    bottomClearance: {
        height: 60,
        width: "80%",
        borderBottomColor: colorSwatch.primary.dark,
        borderBottomWidth: 1,
        alignSelf: "center",
        marginBottom: 20,
    },
    tagsFlow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    tagItem: {
        backgroundColor: colorSwatch.background.darkest,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colorSwatch.neutral.darkGray,
    },
    tagText: {
        color: colorSwatch.neutral.lightGray,
        fontSize: 14,
    },
    section: {
        marginTop: 16,
        backgroundColor: colorSwatch.background.dark,
        padding: 16,
        borderRadius: 8,
    },
    tagsContainer: {
        gap: 8,
    },
    tag: {
        backgroundColor: colorSwatch.background.medium,
        padding: 12,
        borderRadius: 16,
    },
    characteristicSection: {
        backgroundColor: colorSwatch.background.darker,
        padding: 16,
        borderRadius: 12,
    },
    characteristicTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: colorSwatch.accent.purple,
        marginBottom: 12,
    },
    companiesGrid: {
        gap: 12,
    },
    companyCard: {
        backgroundColor: colorSwatch.background.darkest,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colorSwatch.neutral.darkGray,
    },
    companyRole: {
        fontSize: 12,
        color: colorSwatch.accent.purple,
        marginBottom: 4,
    },
    companyName: {
        fontSize: 16,
        color: colorSwatch.neutral.lightGray,
        fontWeight: "500",
        flexWrap: "wrap",
    },
    screenshotsTitle: {
        fontSize: 20,
        fontWeight: "600",
        padding: 16,
        paddingBottom: 0,
        color: colorSwatch.accent.purple,
        marginBottom: 12,
    },
    franchiseLinks: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 4,
    },
    franchiseLink: {
        fontSize: 16,
        color: colorSwatch.accent.cyan,
        textDecorationLine: "underline",
        fontWeight: "600",
    },
});

export default QuestGameDetailPage;
