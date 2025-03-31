import React, { useEffect, useRef, useState } from "react";
import {
    ScrollView,
    StyleSheet,
    View,
    ActivityIndicator,
    Text as RNText,
    Animated,
    ImageBackground,
    SafeAreaView,
    Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRoute } from "@react-navigation/native";
import { QuestGameDetailRouteProp } from "src/utils/navigationTypes";
import { getGameStatus } from "src/utils/dataMappers";
import ImageCarousel from "./GameDetail/components/ImageCarousel";
import { colorSwatch } from "src/utils/colorConstants";
import IGDBService from "src/services/api/IGDBService";
import FullWidthImage from "./shared/FullWidthImage";
import { GameStatus } from "src/constants/config/gameStatus";
import { QuestGame } from "src/data/models/QuestGame";
import { getAgeRating } from "src/utils/getAgeRating";
import WebsitesSection from "src/app/components/WebsitesSection";
import StorylineSection from "./GameDetail/components/StorylineSection";
import Text from "src/components/common/Text";
import { AgeRatingBadge } from "src/components/common/AgeRatingBadge";
import { getStatusStyles } from "src/utils/gameStatusUtils";

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
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator
                    size="large"
                    color={colorSwatch.accent.green}
                />
            </SafeAreaView>
        );
    }

    const HeaderSection: React.FC = () => (
        <View style={styles.headerSection}>
            {game.cover && (
                <View>
                    <FullWidthImage
                        source={`https:${game.cover.url
                            .replace("t_cover_big", "t_720p")
                            .replace("t_thumb", "t_720p")}`}
                        style={{
                            width: "100%",
                            backgroundColor: colorSwatch.background.dark,
                        }}
                    />
                    <AgeRatingBadge game={game} />
                </View>
            )}
            <View style={styles.headerInfo}>
                <Text variant="title" style={styles.gameTitle}>
                    {game.name}
                </Text>
                <Text variant="subtitle" style={styles.releaseDate}>
                    {game.release_dates?.[0]?.human || "Release date unknown"}
                </Text>
            </View>
        </View>
    );

    const MetadataGrid: React.FC = () => {
        const handleFranchisePress = (franchiseId: number) => {
            // TODO: Implement franchise navigation
            console.log(`Navigate to franchise: ${franchiseId}`);
        };

        return (
            <View style={styles.metadataGrid}>
                <View style={styles.metadataItem}>
                    <Text variant="subtitle" style={styles.metadataLabel}>
                        Status
                    </Text>
                    <Text
                        variant="body"
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
                        <Text variant="subtitle" style={styles.metadataLabel}>
                            Completed On
                        </Text>
                        <Text
                            variant="body"
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
                    <Text variant="subtitle" style={styles.metadataLabel}>
                        Age Rating
                    </Text>
                    <Text variant="body" style={styles.metadataValue}>
                        {getAgeRating(game) || "N/A"}
                    </Text>
                </View>
                <View style={styles.metadataItem}>
                    <Text variant="subtitle" style={styles.metadataLabel}>
                        Date Added
                    </Text>
                    <Text variant="body" style={styles.metadataValue}>
                        {new Date(
                            game.dateAdded?.split("T")[0]
                        ).toLocaleDateString()}
                    </Text>
                </View>
                {game.selectedPlatform && game.selectedPlatform.id !== 0 && (
                    <View style={styles.metadataItem}>
                        <Text variant="subtitle" style={styles.metadataLabel}>
                            Platform
                        </Text>
                        <Text variant="body" style={styles.metadataValue}>
                            {game.selectedPlatform?.name || "Not set"}
                        </Text>
                    </View>
                )}
                {game.franchises && game.franchises.length > 0 && (
                    <View style={[styles.metadataItem]}>
                        <Text variant="subtitle" style={styles.metadataLabel}>
                            Franchises
                        </Text>
                        <View style={styles.franchiseLinks}>
                            {game.franchises.map((franchise) => (
                                <Text
                                    key={franchise.id}
                                    variant="body"
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
                <Text variant="title" style={styles.sectionTitle}>
                    Personal Review
                </Text>
                {game.personalRating && (
                    <View style={styles.ratingContainer}>
                        <Text variant="subtitle" style={styles.ratingLabel}>
                            My Rating
                        </Text>
                        <Text
                            variant="body"
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
                        <Text variant="caption" style={styles.noteText}>
                            "{game.notes}"
                        </Text>
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
                        <Text variant="body" style={styles.platformName}>
                            {platform.name}
                        </Text>
                        <Text variant="body" style={styles.platformDate}>
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
                <Text variant="title" style={styles.characteristicTitle}>
                    Genres
                </Text>
                <View style={styles.tagsFlow}>
                    {game.genres?.map(
                        (genre: { name: string }, index: number) => (
                            <View key={index} style={styles.tagItem}>
                                <Text variant="body" style={styles.tagText}>
                                    {genre.name}
                                </Text>
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
                <Text variant="title" style={styles.characteristicTitle}>
                    Themes
                </Text>
                <View style={styles.tagsFlow}>
                    {game.themes.map((theme, index) => (
                        <View key={index} style={styles.tagItem}>
                            <Text variant="body" style={styles.tagText}>
                                {theme.name}
                            </Text>
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
                <Text variant="title" style={styles.characteristicTitle}>
                    Game Modes
                </Text>
                <View style={styles.tagsFlow}>
                    {game.game_modes.map((mode, index) => (
                        <View key={index} style={styles.tagItem}>
                            <Text variant="body" style={styles.tagText}>
                                {mode.name}
                            </Text>
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
                <Text variant="title" style={styles.characteristicTitle}>
                    Player Perspectives
                </Text>
                <View style={styles.tagsFlow}>
                    {game.player_perspectives.map((perspective, index) => (
                        <View key={index} style={styles.tagItem}>
                            <Text variant="body" style={styles.tagText}>
                                {perspective.name}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>
        );
    };

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

        const allCompanies = [
            ...groupedCompanies.developers.map((name) => ({
                name,
                role: "Developer",
            })),
            ...groupedCompanies.publishers.map((name) => ({
                name,
                role: "Publisher",
            })),
            ...groupedCompanies.others.map((name) => ({ name, role: "Other" })),
        ];

        return (
            <View style={styles.companiesList}>
                {allCompanies.map((company, index) => (
                    <View key={index} style={styles.platformItem}>
                        <Text variant="body" style={styles.platformName}>
                            {company.name}
                        </Text>
                        <Text variant="body" style={styles.platformDate}>
                            {company.role}
                        </Text>
                    </View>
                ))}
            </View>
        );
    };

    return (
        <ImageBackground
            source={require("../../assets/next_quest.png")}
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

                {/* Core Game Information */}
                {(game.storyline || game.summary) && (
                    <View style={styles.sectionContainer}>
                        <Text variant="title" style={styles.mainSectionTitle}>
                            About the Game
                        </Text>
                        <StorylineSection
                            storyline={game.storyline}
                            summary={game.summary}
                        />
                    </View>
                )}

                {/* Visual Showcase */}
                {game.screenshots && game.screenshots.length > 0 && (
                    <View style={styles.sectionContainer}>
                        <Text variant="title" style={styles.mainSectionTitle}>
                            Screenshots
                        </Text>
                        <ImageCarousel
                            images={
                                game.screenshots?.map((s) =>
                                    s.url.replace("t_thumb", "t_720p")
                                ) ?? []
                            }
                        />
                    </View>
                )}

                {/* Essential Game Categories */}
                <View style={styles.sectionContainer}>
                    <Text variant="title" style={styles.mainSectionTitle}>
                        Information
                    </Text>
                    {/* Core Categories */}
                    <View style={styles.characteristicsContainer}>
                        <GenresSection />
                        <ThemesSection />
                        <GameModesSection />
                        <PerspectivesSection />
                    </View>
                </View>

                {/* Additional Game Details */}
                <View style={styles.sectionContainer}>
                    <Text variant="title" style={styles.mainSectionTitle}>
                        Additional Details
                    </Text>

                    {/* Platforms */}
                    {game.platforms && game.platforms.length > 0 && (
                        <View style={styles.platformSection}>
                            <Text
                                variant="subtitle"
                                style={styles.platformTitle}
                            >
                                Platforms
                            </Text>
                            <PlatformsSection />
                        </View>
                    )}

                    {/* Development Info */}
                    {game.involved_companies &&
                        game.involved_companies.length > 0 && (
                            <View style={styles.infoSection}>
                                <Text
                                    variant="subtitle"
                                    style={styles.subSectionTitle}
                                >
                                    Development
                                </Text>
                                <CompaniesSection />
                            </View>
                        )}
                    {/* External Links */}
                    <WebsitesSection websites={game.websites || []} />
                </View>

                <View style={styles.bottomClearance} />
            </ScrollView>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colorSwatch.background.darkest,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: colorSwatch.background.dark,
        opacity: 0.99,
    },
    scrollView: {
        flex: 1,
    },
    scrollViewContent: {
        paddingTop: Platform.OS === "ios" ? 0 : 60, // Add padding for Android
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colorSwatch.background.dark,
    },
    headerSection: {
        marginTop: 130,
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
        color: colorSwatch.neutral.lightGray,
        marginBottom: 4,
        marginTop: 12,
        fontSize: 24,
        lineHeight: 32,
        flex: 1,
        textAlign: "center",
        maxWidth: "80%",
        flexWrap: "wrap",
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
        marginHorizontal: 16,
        padding: 0,
    },
    characteristicsContainer: {
        marginTop: 16,
        gap: 16,
    },
    platformSection: {},
    platformTitle: {
        marginBottom: 8,
        color: colorSwatch.text.primary,
    },
    infoSection: {
        marginTop: 16,
        borderRadius: 8,
    },
    screenshotsSection: {
        paddingBottom: 30,
    },
    mainSectionTitle: {
        color: colorSwatch.accent.purple,
        marginBottom: 20,
    },
    subSectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: colorSwatch.text.primary,
        marginBottom: 12,
    },
    storylineText: {
        fontSize: 16,
        lineHeight: 24,
        color: colorSwatch.neutral.lightGray,
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
    companiesList: {
        gap: 8,
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
    storylineContainer: {
        marginTop: 16,
    },
    seeMoreText: {
        color: colorSwatch.accent.cyan,
        fontWeight: "600",
        marginTop: 16,
        textDecorationLine: "underline",
    },
});

export default QuestGameDetailPage;
