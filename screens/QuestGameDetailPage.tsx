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
                    source={`https:${game.cover}`}
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
                        fontStyle: "normal" as "normal", // Default to normal
                    };
                case "active":
                    return {
                        color: colorSwatch.accent.yellow,
                        fontWeight: "normal" as "normal",
                        fontStyle: "italic" as "italic", // Set to italic for in_progress
                    };
                default:
                    return {
                        color: colorSwatch.accent.pink,
                        fontWeight: "normal" as "normal",
                        fontStyle: "normal" as "normal", // Default to normal
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
                <View style={styles.metadataItem}>
                    <Text style={styles.metadataLabel}>Age Rating</Text>
                    <Text style={styles.metadataValue}>
                        {game.age_rating || "N/A"}
                    </Text>
                </View>
                <View style={styles.metadataItem}>
                    <Text style={styles.metadataLabel}>Date Added</Text>
                    <Text style={styles.metadataValue}>
                        {game.dateAdded?.split("T")[0]}
                    </Text>
                </View>
                {game.personalRating && (
                    <View style={styles.metadataItem}>
                        <Text style={styles.metadataLabel}>
                            Personal Rating
                        </Text>
                        <Text style={styles.metadataValue}>
                            {game.personalRating}/10
                        </Text>
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
                    ?.map(
                        (platform: {
                            id: number;
                            name: string;
                            release_date?: string;
                        }) => {
                            const releaseDate = game.release_dates.find(
                                (rd) => rd.platform === platform.id
                            );
                            return {
                                date: releaseDate?.date || Infinity,
                                name: platform.name,
                                human: releaseDate?.human || "",
                            };
                        }
                    )
                    .sort((a, b) => a.date - b.date)
                    .map((platform, index) => (
                        <Text key={index} style={styles.platformText}>
                            {platform.name} ({platform.human?.split("T")[0]})
                        </Text>
                    ))}
            </View>
        </View>
    );

    const CompaniesSection: React.FC = () => {
        const groupedCompanies: { [key: string]: string[] } = {};

        game.involved_companies?.forEach((company) => {
            if (groupedCompanies[company.role]) {
                groupedCompanies[company.role].push(company.name);
            } else {
                groupedCompanies[company.role] = [company.name];
            }
        });

        return (
            <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Companies</Text>
                {Object.entries(groupedCompanies).map(
                    ([role, names], index) => (
                        <View key={index} style={styles.companyItem}>
                            <Text style={styles.companyRole}>{role}</Text>
                            <Text style={styles.companyName}>
                                {names.join(", ")}
                            </Text>
                        </View>
                    )
                )}
            </View>
        );
    };

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
            <ImageCarousel images={game.screenshots ?? []} />
        </View>
    );

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
                {game.notes && <NotesSection />}
                {game.screenshots && game.screenshots.length > 0 && (
                    <ScreenshotsSection />
                )}
                {game.genres && game.genres.length > 0 && <GenresSection />}
                {game.platforms && game.platforms.length > 0 && (
                    <PlatformsSection />
                )}
                {(game.storyline || game.summary) && <StorylineSection />}
                {game.involved_companies &&
                    game.involved_companies.length > 0 && <CompaniesSection />}
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
    noteText: {
        color: colorSwatch.secondary.main,
        fontStyle: "italic",
        fontWeight: "600",
        fontSize: 16,
        lineHeight: 24,
    },
    noteContainer: {
        borderRadius: 12,
        backgroundColor: colorSwatch.background.medium,
    },
    bottomClearance: {
        height: 60,
        width: "80%",
        borderBottomColor: colorSwatch.primary.dark,
        borderBottomWidth: 1,
        alignSelf: "center",
        marginBottom: 20,
    },
});

export default QuestGameDetailPage;
