import React, { useEffect, useRef, useState } from "react";
import {
    ScrollView,
    StyleSheet,
    View,
    ActivityIndicator,
    Animated,
    ImageBackground,
    SafeAreaView,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { QuestGameDetailRouteProp } from "src/utils/navigationTypes";
import ImageCarousel from "./GameDetail/components/ImageCarousel";
import { colorSwatch } from "src/utils/colorConstants";
import IGDBService from "src/services/api/IGDBService";
import { QuestGame } from "src/data/models/QuestGame";
import WebsitesSection from "src/app/components/WebsitesSection";
import StorylineSection from "./GameDetail/components/StorylineSection";
import Text from "src/components/common/Text";
import { PersonalRatingSection } from "./GameDetail/components/PersonalRatingSection";
import { GenresSection } from "./GameDetail/components/GenresSection";
import { ThemesSection } from "./GameDetail/components/ThemesSection";
import { GameModesSection } from "./GameDetail/components/GameModesSection";
import { PerspectivesSection } from "./GameDetail/components/PerspectivesSection";
import { PlatformsSection } from "./GameDetail/components/PlatformsSection";
import { HeaderSection } from "./GameDetail/components/HeaderSection";
import MetadataGrid from "./GameDetail/components/MetadataGrid";
import CompaniesSection from "./GameDetail/components/CompaniesSection";

const QuestGameDetailPage: React.FC = () => {
    const route = useRoute<QuestGameDetailRouteProp>();
    const { id } = route.params;
    const [game, setGame] = useState<QuestGame | null>(null);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const loadGameDetails = async () => {
            const igdbGame: QuestGame | null = await IGDBService.fetchGameDetails(
                id
            );

            setGame(igdbGame);

            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        };
        loadGameDetails();
    }, [id]);

    if (!game) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ImageBackground
                    source={require("../../assets/next_quest.png")}
                    style={styles.container}
                    resizeMode="contain"
                >
                    <View style={styles.overlay} />
                    <View style={[styles.skeleton]}>
                        <ActivityIndicator
                            size="large"
                            color={colorSwatch.accent.green}
                        />
                    </View>
                </ImageBackground>
            </SafeAreaView>
        );
    }

    return (
        <ImageBackground
            source={require("../../assets/next_quest.png")}
            style={styles.container}
            resizeMode="contain"
        >
            <View style={styles.overlay} />
            <ScrollView style={{ flex: 1 }}>
                {/* Hero Section */}
                <HeaderSection game={game} />

                {/* Progress Tracking */}
                <View style={styles.sectionContainer}>
                    <MetadataGrid game={game} />
                </View>

                {/* Personal Review Section */}
                {game.gameStatus === "completed" && (
                    <PersonalRatingSection
                        gameId={game.id}
                        initialRating={game.personalRating ?? null}
                        notes={game.notes}
                    />
                )}

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
                        <GenresSection game={game} />
                        <ThemesSection game={game} />
                        <GameModesSection game={game} />
                        <PerspectivesSection game={game} />
                    </View>
                </View>

                {/* Additional Game Details */}
                <View style={styles.sectionContainer}>
                    <Text variant="title" style={styles.mainSectionTitle}>
                        Additional Details
                    </Text>

                    {/* Platforms */}
                    {game.platforms && game.platforms.length > 0 && (
                        <View>
                            <Text
                                variant="subtitle"
                                style={styles.platformTitle}
                            >
                                Platforms
                            </Text>
                            <PlatformsSection game={game} />
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
                                <CompaniesSection game={game} />
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
        width: "100%",
        backgroundColor: colorSwatch.background.darkest,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: colorSwatch.background.dark,
        opacity: 0.99,
    },
    skeleton: {
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colorSwatch.background.medium,
        width: "100%",
        height: 580,
    },
    loadingContainer: {
        flex: 1,
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colorSwatch.background.dark,
        paddingTop: 130,
    },
    sectionContainer: {
        marginHorizontal: 12,
        marginTop: 16,
        backgroundColor: colorSwatch.background.darkest,
        borderRadius: 12,
        padding: 16,
        elevation: 4,
    },
    characteristicsContainer: {
        marginTop: 16,
        gap: 16,
    },
    platformTitle: {
        marginBottom: 8,
        color: colorSwatch.text.primary,
    },
    infoSection: {
        marginTop: 16,
        borderRadius: 8,
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
    sectionTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: colorSwatch.accent.green,
        marginBottom: 12,
    },
    noteContainer: {
        backgroundColor: colorSwatch.background.dark,
        padding: 16,
        borderRadius: 8,
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
