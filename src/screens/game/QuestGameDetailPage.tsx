import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
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
import { MinimalQuestGame } from "src/data/models/MinimalQuestGame";
import ScrollProgressTrack, { useAnimatedScrollPosition } from "src/components/common/ScrollProgressTrack";

const QuestGameDetailPage: React.FC = () => {
    const route = useRoute<QuestGameDetailRouteProp>();
    const { id, gameStatus } = route.params;
    const [game, setGame] = useState<QuestGame | null>(null);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const headerHeight = useHeaderHeight();
    const { handleStatusChange, handleDiscover, handleRemoveItem } = useGames();
    const { activeStatus, setActiveStatus } = useGameStatus();

    // FAB state
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isRemoveConfirmation, setIsRemoveConfirmation] = useState(false);
    const menuAnimation = useRef(new Animated.Value(0)).current;

    // Scroll tracking for ScrollProgressTrack
    const scrollViewRef = useRef<ScrollView>(null);
    const { createScrollHandler, rawScrollValue, setScrollValue } = useAnimatedScrollPosition();
    const [containerHeight, setContainerHeight] = useState(0);
    const [contentHeight, setContentHeight] = useState(0);
    const [isScrollTrackVisible, setIsScrollTrackVisible] = useState(false);
    const [isTrackAutoHidden, setIsTrackAutoHidden] = useState(true);
    const autoHideTimer = useRef<NodeJS.Timeout | null>(null);

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
    }, [id, activeStatus]);

    // Auto-hide timer functions for scroll track
    const startAutoHideTimer = useCallback(() => {
        if (autoHideTimer.current) {
            clearTimeout(autoHideTimer.current);
        }
        if (isTrackAutoHidden) {
            setIsTrackAutoHidden(false);
        }
        autoHideTimer.current = setTimeout(() => {
            setIsTrackAutoHidden(true);
        }, 1500);
    }, [isTrackAutoHidden]);

    const clearAutoHideTimer = useCallback(() => {
        if (autoHideTimer.current) {
            clearTimeout(autoHideTimer.current);
            autoHideTimer.current = null;
        }
    }, []);

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (autoHideTimer.current) {
                clearTimeout(autoHideTimer.current);
            }
        };
    }, []);

    // Create smooth animated scroll handler
    const animatedScrollHandler = useMemo(() => {
        return createScrollHandler(contentHeight, containerHeight);
    }, [createScrollHandler, contentHeight, containerHeight]);

    // Scroll tracking handlers for visibility and layout
    const handleScrollForVisibility = useCallback((event: any) => {
        if (!event?.nativeEvent) return;

        const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
        const currentOffset = Math.max(0, contentOffset?.y || 0);
        const containerHeight = layoutMeasurement?.height || 0;
        const totalContentHeight = contentSize?.height || 0;
        const maxOffset = Math.max(0, totalContentHeight - containerHeight);

        setContentHeight(totalContentHeight);
        setContainerHeight(containerHeight);

        // Show track when content is scrollable
        const shouldShowTrack = maxOffset > 20;
        setIsScrollTrackVisible(shouldShowTrack);

        // Start auto-hide timer when scrolling
        if (shouldShowTrack) {
            startAutoHideTimer();
        } else {
            clearAutoHideTimer();
            setIsTrackAutoHidden(false);
        }
    }, [startAutoHideTimer, clearAutoHideTimer]);

    // Combined scroll handler
    const handleScroll = useCallback((event: any) => {
        animatedScrollHandler(event);
        handleScrollForVisibility(event);
    }, [animatedScrollHandler, handleScrollForVisibility]);

    // Handle scroll track taps
    const handleScrollToPosition = useCallback((position: number) => {
        if (!scrollViewRef.current) return;

        startAutoHideTimer();

        const maxOffset = Math.max(0, contentHeight - containerHeight);
        const targetOffset = position * maxOffset;

        // Sync the animated value immediately to prevent double-tap issue
        setScrollValue(targetOffset);

        scrollViewRef.current.scrollTo({
            y: targetOffset,
            animated: true,
        });
    }, [contentHeight, containerHeight, startAutoHideTimer, setScrollValue]);

    // Handle container layout
    const handleContainerLayout = useCallback((event: any) => {
        const { height } = event.nativeEvent.layout;
        setContainerHeight(height);

        if (contentHeight > 0 && height > 0) {
            const maxOffset = Math.max(0, contentHeight - height);
            setIsScrollTrackVisible(maxOffset > 20);
        }
    }, [contentHeight]);

    // Handle content size changes
    const handleContentSizeChange = useCallback((width: number, height: number) => {
        setContentHeight(height);

        if (containerHeight > 0 && height > 0) {
            const maxOffset = Math.max(0, height - containerHeight);
            setIsScrollTrackVisible(maxOffset > 20);
        }
    }, [containerHeight]);

    // Computed visibility
    const isTrackCurrentlyVisible = isScrollTrackVisible && !isTrackAutoHidden;

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
        ];
        return allStatuses.filter((status) => status !== currentStatus);
    };

    // Get menu options (statuses + remove option)
    type MenuOption =
        | { type: 'status', value: GameStatus, label: string, icon: string, color: string }
        | { type: 'remove', value: 'remove', label: string, icon: string, color: string, isConfirmation?: boolean };

    const getMenuOptions = (currentStatus: GameStatus): MenuOption[] => {
        let statusOptions: MenuOption[] = [];

        // Add remove option if not undiscovered
        if (currentStatus !== "undiscovered") {
            statusOptions.push({
                type: 'remove' as const,
                value: 'remove' as const,
                label: isRemoveConfirmation ? 'Confirm' : 'Remove',
                icon: 'trash',
                color: colorSwatch.accent.pink,
                isConfirmation: isRemoveConfirmation
            });
        }

        getAvailableStatuses(currentStatus).forEach(status => statusOptions.push({
            type: 'status' as const,
            value: status,
            label: getStatusLabel(status),
            icon: getStatusIcon(status),
            color: getStatusColor(status)
        }));


        return statusOptions;
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

        // Reset confirmation state when menu closes
        if (isMenuOpen) {
            setIsRemoveConfirmation(false);
        }
    };

    // Handle status change
    const handleStatusPress = async (newStatus: GameStatus) => {
        if (!game) return;

        try {
            HapticFeedback.selection();
            toggleMenu(); // Close menu first

            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
                easing: Easing.out(Easing.quad),
            }).start();

            // Check if current status is undiscovered and use appropriate handler
            if (game.gameStatus === "undiscovered") {
                // Transform QuestGame to MinimalQuestGame format for handleDiscover
                const minimalGame: MinimalQuestGame = {
                    ...game,
                    platforms: game.platforms || [],
                    genres: game.genres || [],
                    release_dates: game.release_dates || [],
                };
                await handleDiscover(minimalGame, newStatus);
            } else {
                await handleStatusChange(game.id, newStatus, game.gameStatus);
            }

            // Update local state
            setGame(prev => prev ? { ...prev, gameStatus: newStatus } : null);

            setActiveStatus(newStatus);

            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
                easing: Easing.out(Easing.quad),
            }).start(() => {
                showToast({
                    type: "success",
                    text1: "Status Updated",
                    text2: `${game.name} moved to ${getStatusLabel(newStatus)}`,
                    position: "bottom",
                    color: getStatusColor(newStatus),
                    visibilityTime: 2000,
                });
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

    // Handle remove game
    const handleRemovePress = async () => {
        if (!game) return;

        // If not in confirmation mode, enter confirmation mode
        if (!isRemoveConfirmation) {
            HapticFeedback.selection();
            setIsRemoveConfirmation(true);
            return;
        }

        // If in confirmation mode, actually remove the game
        try {
            HapticFeedback.selection();
            setIsRemoveConfirmation(false);
            toggleMenu(); // Close menu first

            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
                easing: Easing.out(Easing.quad),
            }).start();

            await handleRemoveItem(game.id, game.gameStatus);

            // Update local state to undiscovered
            setGame(prev => prev ? { ...prev, gameStatus: "undiscovered" } : null);
            setActiveStatus("undiscovered");

            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
                easing: Easing.out(Easing.quad),
            }).start(() => {
                showToast({
                    type: "success",
                    text1: "Game Removed",
                    text2: `${game.name} removed from ${getStatusLabel(game.gameStatus)}`,
                    position: "bottom",
                    color: colorSwatch.accent.pink,
                    visibilityTime: 2000,
                });
            });

        } catch (error) {
            console.error("Failed to remove game:", error);
            showToast({
                type: "error",
                text1: "Remove Failed",
                text2: "Failed to remove game. Please try again.",
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
                <View style={styles.scrollContainer} onLayout={handleContainerLayout}>
                    <ScrollView
                        ref={scrollViewRef}
                        style={{ flex: 1 }}
                        onScroll={handleScroll}
                        scrollEventThrottle={8}
                        showsVerticalScrollIndicator={false}
                        onContentSizeChange={handleContentSizeChange}
                    >
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

                    {/* Scroll Progress Track */}
                    <ScrollProgressTrack
                        scrollPosition={0} // Fallback for non-animated usage
                        onScrollToPosition={handleScrollToPosition}
                        contentHeight={contentHeight}
                        containerHeight={containerHeight}
                        visible={isTrackCurrentlyVisible}
                        animatedScrollPosition={rawScrollValue}
                    />
                </View>
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

                    {/* Menu Items */}
                    {getMenuOptions(game.gameStatus).map((option, index) => {
                        const translateY = menuAnimation.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, -(72 + index * 64)],
                        });

                        const scale = menuAnimation.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 1],
                        });

                        const handlePress = () => {
                            if (option.type === 'status') {
                                handleStatusPress(option.value);
                            } else {
                                handleRemovePress();
                            }
                        };

                        const isConfirmationMode = option.type === 'remove' && option.isConfirmation;
                        const backgroundColor = isConfirmationMode ? option.color : colorSwatch.background.darkest;
                        const borderColor = isConfirmationMode ? "transparent" : option.color;
                        const textColor = isConfirmationMode ? colorSwatch.background.darkest : option.color;
                        const iconColor = isConfirmationMode ? colorSwatch.background.darkest : option.color;

                        return (
                            <Animated.View
                                key={option.type === 'status' ? option.value : 'remove'}
                                style={[
                                    styles.menuItem,
                                    {
                                        transform: [{ translateY }, { scale }],
                                        borderColor: borderColor,
                                        borderWidth: 2,
                                        backgroundColor: backgroundColor,
                                    },
                                ]}
                            >
                                <TouchableOpacity
                                    onPress={handlePress}
                                    style={styles.menuItemTouchable}
                                    activeOpacity={0.8}
                                >
                                    <View style={styles.menuItemTextContainer}>
                                        <Text
                                            variant="body"
                                            style={[styles.menuItemText, { color: textColor }]}
                                            numberOfLines={1}
                                        >
                                            {option.label}
                                        </Text>
                                        <QuestIcon color={iconColor} name={option.icon} size={24} />
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
                                backgroundColor: isMenuOpen ? colorSwatch.text.inverse : statusColor,
                                borderColor: isMenuOpen ? statusColor : "transparent",
                            },
                        ]}
                    >
                        <TouchableOpacity
                            onPress={toggleMenu}
                            style={styles.fabTouchable}
                            activeOpacity={0.8}
                        >
                            <QuestIcon color={isMenuOpen ? statusColor : colorSwatch.text.inverse} name={getStatusIcon(game.gameStatus)} size={24} />
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
    scrollContainer: {
        flex: 1,
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
