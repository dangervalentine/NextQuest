import React, { useEffect, useRef, useState } from "react";
import {
    ScrollView,
    StyleSheet,
    View,
    Animated,
    ImageBackground,
    SafeAreaView,
    Easing,
    TouchableOpacity,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { QuestGameDetailRouteProp } from "src/navigation/navigationTypes";
import ImageCarousel from "./GameDetail/components/ImageCarousel";
import { colorSwatch } from "src/constants/theme/colorConstants";
import IGDBService from "src/services/api/IGDBService";
import { QuestGame } from "src/data/models/QuestGame";
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
import { getStatusColor } from "src/utils/colorsUtils";
import WebsitesSection from "./GameDetail/components/WebsitesSection";
import { theme } from "src/constants/theme/styles";
import { GameStatus } from "src/constants/config/gameStatus";
import { getStatusIcon, getStatusLabel } from "src/utils/gameStatusUtils";
import { useGames } from "src/contexts/GamesContext";
import { HapticFeedback } from "src/utils/hapticUtils";
import { showToast } from "src/components/common/QuestToast";
import { useGameStatus } from "src/contexts/GameStatusContext";
import QuestIcon from "./shared/GameIcon";

const QuestGameDetailPage: React.FC = () => {
    const route = useRoute<QuestGameDetailRouteProp>();
    const { id, gameStatus } = route.params;
    const [game, setGame] = useState<QuestGame | null>(null);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const headerHeight = useHeaderHeight();
    const { handleStatusChange } = useGames();
    const { activeStatus, setActiveStatus } = useGameStatus();

    // FAB state
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuAnimation = useRef(new Animated.Value(0)).current;
    const fabRotation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const loadGameDetails = async () => {
            const igdbGame: QuestGame | null = await IGDBService.fetchGameDetails(
                id
            );

            fadeAnim.setValue(0);

            setGame(igdbGame);

            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
                easing: Easing.out(Easing.quad),
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
                    <View style={styles.loadingMessageContainer}>
                        <LoadingText text="Loading..." delay={1} />
                    </View>
                </ImageBackground>
            </SafeAreaView>
        );
    }

    // Get status color for all section titles
    const statusColor = getStatusColor(game.gameStatus);

    // Get available statuses (excluding current)
    const getAvailableStatuses = (currentStatus: GameStatus): GameStatus[] => {
        const allStatuses: GameStatus[] = [
            "ongoing",
            "backlog",
            "completed",
            "undiscovered",
        ];
        return allStatuses.filter((status) => status !== currentStatus);
    };

    // Toggle FAB menu
    const toggleMenu = () => {
        HapticFeedback.selection();
        const toValue = isMenuOpen ? 0 : 1;
        HapticFeedback.selection();

        Animated.spring(menuAnimation, {
            toValue,
            useNativeDriver: true,
            bounciness: 0,
            speed: 100,
        }).start();

        setIsMenuOpen(!isMenuOpen);
    };

    // Handle status change
    const handleStatusPress = async (newStatus: GameStatus) => {
        if (!game) return;

        try {
            HapticFeedback.selection();
            toggleMenu(); // Close menu first

            await handleStatusChange(game.id, newStatus, game.gameStatus);

            // Update local state
            setGame(prev => prev ? { ...prev, gameStatus: newStatus } : null);
            setActiveStatus(newStatus);

            showToast({
                type: "success",
                text1: "Status Updated",
                text2: `${game.name} moved to ${getStatusLabel(newStatus)}`,
                position: "bottom",
                color: getStatusColor(newStatus),
                visibilityTime: 2000,
            });
        } catch (error) {
            console.error("Failed to update status:", error);
            showToast({
                type: "error",
                text1: "Update Failed",
                text2: "Failed to update game status. Please try again.",
                position: "bottom",
                visibilityTime: 3000,
            });
        }
    };

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

            {/* FAB and Menu */}
            {game && (
                <>
                    {/* Background Overlay */}
                    {isMenuOpen && (
                        <Animated.View
                            style={[
                                styles.menuOverlay,
                                {
                                    opacity: menuAnimation.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0, 0.3],
                                    }),
                                },
                            ]}
                        >
                            <TouchableOpacity
                                style={styles.overlayTouchable}
                                onPress={toggleMenu}
                                activeOpacity={1}
                            />
                        </Animated.View>
                    )}

                    {/* Status Menu Items */}
                    {getAvailableStatuses(game.gameStatus).map((status, index) => {
                        const translateY = menuAnimation.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, -(72 + index * 64)],
                        });

                        const scale = menuAnimation.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 1],
                        });

                        return (
                            <Animated.View
                                key={status}
                                style={[
                                    styles.menuItem,
                                    {
                                        transform: [{ translateY }, { scale }],
                                        backgroundColor: getStatusColor(status),
                                    },
                                ]}
                            >
                                <TouchableOpacity
                                    onPress={() => handleStatusPress(status)}
                                    style={styles.menuItemTouchable}
                                    activeOpacity={0.8}
                                >
                                    <View style={styles.menuItemTextContainer}>
                                        <Text
                                            variant="body"
                                            style={styles.menuItemText}
                                            numberOfLines={1}
                                        >
                                            {getStatusLabel(status)}
                                        </Text>
                                        <QuestIcon color={colorSwatch.text.inverse} name={getStatusIcon(status)} size={24} />
                                    </View>
                                </TouchableOpacity>
                            </Animated.View>
                        );
                    })}

                    {/* Main FAB */}
                    <Animated.View
                        style={[
                            styles.fab,
                            {
                                backgroundColor: isMenuOpen ? statusColor : "transparent",
                                borderColor: isMenuOpen ? "transparent" : statusColor,
                            },
                        ]}
                    >
                        <TouchableOpacity
                            onPress={toggleMenu}
                            style={styles.fabTouchable}
                            activeOpacity={0.8}
                        >
                            <QuestIcon color={isMenuOpen ? colorSwatch.text.inverse : statusColor} name={getStatusIcon(game.gameStatus)} size={24} />
                        </TouchableOpacity>
                    </Animated.View>
                </>
            )}
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: "100%",
        backgroundColor: colorSwatch.background.darkest,
        position: "relative",
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: colorSwatch.background.darkest,
        opacity: 0.95,
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
        borderRadius: theme.borderRadius,
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
        borderRadius: theme.borderRadius,
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
        borderRadius: theme.borderRadius,
    },
    bottomClearance: {
        height: 120,
        width: "80%",
        borderBottomColor: colorSwatch.primary.dark,
        borderBottomWidth: 1,
        alignSelf: "center",
        marginBottom: 20,
    },
    loadingMessageContainer: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: "center",
        alignItems: "center",
    },
    fab: {
        position: "absolute",
        bottom: 40,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: theme.borderRadius,
        elevation: 8,
        borderWidth: 2,
        zIndex: 1000,
    },
    fabTouchable: {
        width: "100%",
        height: "100%",
        borderRadius: theme.borderRadius,
        justifyContent: "center",
        alignItems: "center",
    },
    fabIcon: {
        fontSize: 24,
        color: colorSwatch.text.inverse,
        fontWeight: "bold",
    },
    menuItem: {
        position: "absolute",
        bottom: 30,
        right: 20,
        width: 160,
        height: 60,
        borderRadius: theme.borderRadius,
        elevation: 6,
        zIndex: 999,
    },
    menuItemTouchable: {
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
    menuItemTextContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        width: "100%",
    },
    menuItemText: {
        fontSize: 14,
        fontWeight: "600",
        color: colorSwatch.text.inverse,
        textAlign: "left",
        flex: 1,
    },
    menuOverlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 998,
    },
    overlayTouchable: {
        flex: 1,
        width: "100%",
        height: "100%",
    },
});

export default QuestGameDetailPage;
