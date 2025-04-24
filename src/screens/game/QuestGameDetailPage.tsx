import React, { useEffect, useRef, useState } from "react";
import {
    ScrollView,
    StyleSheet,
    View,
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
import FranchiseSection from "./GameDetail/components/MetadataGrid";
import { useHeaderHeight } from "@react-navigation/elements";
import { getBackgroundImage } from "../../utils/imageUtils";
import { LoadingText } from "src/components/common/LoadingText";
import { getStatusColor } from "src/utils/colors";

const QuestGameDetailPage: React.FC = () => {
    const route = useRoute<QuestGameDetailRouteProp>();
    const { id, gameStatus } = route.params;
    const [game, setGame] = useState<QuestGame | null>(null);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const headerHeight = useHeaderHeight();
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
                    source={getBackgroundImage(gameStatus)}
                    style={styles.container}
                    resizeMode="contain"
                >
                    <View style={styles.overlay} />
                    <View style={[styles.skeleton]}>
                        <LoadingText text="Loading..." delay={1} />
                    </View>
                </ImageBackground>
            </SafeAreaView>
        );
    }

    // Get status color for all section titles
    const statusColor = getStatusColor(game.gameStatus);

    return (
        <ImageBackground
            source={getBackgroundImage(game.gameStatus)}
            style={[styles.container, { marginTop: headerHeight }]}
            resizeMode="contain"
        >
            <View style={styles.overlay} />
            <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
                <ScrollView style={{ flex: 1 }}>
                    {/* Hero Section */}
                    <HeaderSection game={game} />

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
                            <Text
                                variant="title"
                                style={[
                                    styles.mainSectionTitle,
                                    { color: statusColor },
                                ]}
                            >
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
                            <Text
                                variant="title"
                                style={[
                                    styles.mainSectionTitle,
                                    { color: statusColor },
                                ]}
                            >
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
                        <Text
                            variant="title"
                            style={[
                                styles.mainSectionTitle,
                                { color: statusColor },
                            ]}
                        >
                            Information
                        </Text>
                        {/* Core Categories */}
                        <View style={styles.characteristicsContainer}>
                            {game.franchises && game.franchises.length > 0 && (
                                <FranchiseSection game={game} />
                            )}
                            <GenresSection game={game} />
                            <ThemesSection game={game} />
                            <GameModesSection game={game} />
                            <PerspectivesSection game={game} />
                        </View>
                    </View>

                    {/* Additional Game Details */}
                    <View style={styles.sectionContainer}>
                        <Text
                            variant="title"
                            style={[
                                styles.mainSectionTitle,
                                { color: statusColor },
                            ]}
                        >
                            Additional Details
                        </Text>

                        {/* Platforms */}
                        {game.platforms && game.platforms.length > 0 && (
                            <View>
                                <Text
                                    variant="title"
                                    style={[
                                        styles.platformTitle,
                                        { color: statusColor },
                                    ]}
                                >
                                    Platforms
                                </Text>
                                <PlatformsSection game={game} />
                            </View>
                        )}

                        {/* External Links */}
                        <WebsitesSection
                            websites={game.websites || []}
                            tintColor={statusColor}
                        />
                    </View>

                    <View style={styles.bottomClearance} />
                </ScrollView>
            </Animated.View>
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
        backgroundColor: colorSwatch.background.darkest,
        opacity: 0.95,
    },
    skeleton: {
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colorSwatch.background.darker,
        width: "100%",
        height: 580,
    },
    loadingContainer: {
        flex: 1,
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colorSwatch.background.darkest,
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
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 12,
    },
    infoSection: {
        marginTop: 16,
        borderRadius: 8,
    },
    mainSectionTitle: {
        marginBottom: 20,
    },
    subSectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: colorSwatch.primary.dark,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "600",
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
