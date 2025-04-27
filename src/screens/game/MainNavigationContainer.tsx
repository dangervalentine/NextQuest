import React, {
    useState,
    useCallback,
    useEffect,
    useRef,
    useMemo,
} from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { Image, View, StyleSheet, Animated, Pressable } from "react-native";
import QuestGameDetailPage from "./QuestGameDetailPage";
import { GameStatus } from "src/constants/config/gameStatus";
import { MinimalQuestGame } from "src/data/models/MinimalQuestGame";
import { QuestGame } from "src/data/models/QuestGame";
import {
    createQuestGameData,
    doesGameExist,
    getQuestGamesByStatus,
    updateGamePriorities,
    updateQuestGame,
} from "src/data/repositories/questGames";
import IGDBService from "src/services/api/IGDBService";
import { colorSwatch } from "src/constants/theme/colorConstants";
import { headerStyle } from "./GameList/components/GameTabNavigator";
import { createIGDBGame } from "src/data/repositories/igdbGames";
import { PlatformSelectionModal } from "../../components/common/PlatformSelectionModal";
import { QuestToast, showToast } from "src/components/common/QuestToast";
import GameTabs from "./GameTabs";
import {
    RootStackParamList,
    TabParamList,
} from "src/navigation/navigationTypes";
import { getStatusColor } from "src/utils/colorsUtils";
import { Ionicons } from "@expo/vector-icons";
import Text from "src/components/common/Text";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { triggerHapticFeedback } from "src/utils/systemUtils";
import { useGameStatus } from "src/contexts/GameStatusContext";
import { GameTabNavigatorRef } from "./GameList/components/GameTabNavigator";
import AnimatedBackButton from "./shared/AnimatedBackButton";
const Stack = createStackNavigator<RootStackParamList>();

type MainNavigationProp = NavigationProp<RootStackParamList>;

const MainNavigationContainer: React.FC = () => {
    const navigation = useNavigation<MainNavigationProp>();
    const gameTabsRef = useRef<GameTabNavigatorRef>(null);
    const { activeStatus, setActiveStatus } = useGameStatus();
    const [gameData, setGameData] = useState<
        Record<GameStatus, MinimalQuestGame[]>
    >({
        ongoing: [],
        backlog: [],
        completed: [],
        undiscovered: [],
        on_hold: [],
        dropped: [],
    });
    const [isLoading, setIsLoading] = useState<Record<GameStatus, boolean>>({
        ongoing: true,
        backlog: true,
        completed: true,
        undiscovered: false,
        on_hold: false,
        dropped: false,
    });
    const [activeTabColor, setActiveTabColor] = useState<string>(
        colorSwatch.neutral.white
    );

    // Add this state for the modal
    const [isPlatformModalVisible, setIsPlatformModalVisible] = useState(false);
    const [platformModalPlatforms, setPlatformModalPlatforms] = useState<
        Array<{ id: number; name: string }>
    >([]);
    const platformModalResolveRef = useRef<
        ((platform: { id: number; name: string } | null) => void) | null
    >(null);

    // Memoize sortGames to prevent recreation on every render
    const sortGames = useCallback((games: MinimalQuestGame[]) => {
        return [...games].sort((a, b) => {
            const priorityA = a.priority || Infinity;
            const priorityB = b.priority || Infinity;
            return priorityA - priorityB;
        });
    }, []);

    const loadGamesForStatus = useCallback(async (status: GameStatus) => {
        try {
            setIsLoading((prev) => ({ ...prev, [status]: true }));
            const games = await getQuestGamesByStatus(status);
            const sortedGames = sortGames(games);

            setGameData((prev) => ({ ...prev, [status]: sortedGames }));
        } catch (error) {
            console.error(
                `[GameListNavigationContainer] Error loading ${status} games:`,
                error
            );
        } finally {
            setIsLoading((prev) => ({ ...prev, [status]: false }));
        }
    }, []);

    const handleTabChange = useCallback(
        (tabName: string) => {
            const status = tabName.toLowerCase() as GameStatus;
            setActiveTabColor(getStatusColor(status));
            setActiveStatus(status);
        },
        [setActiveStatus, setActiveTabColor]
    );

    useEffect(() => {
        const loadInitialData = async () => {
            const statuses: GameStatus[] = ["ongoing", "backlog", "completed"];
            for (const status of statuses) {
                await loadGamesForStatus(status);
            }
            // Set initial tab to ongoing only after data is loaded
            setActiveTabColor(getStatusColor("ongoing"));
        };
        loadInitialData();
    }, [loadGamesForStatus, setActiveTabColor]);

    const getUpdateData = useCallback(
        async (
            id: number,
            newStatus: GameStatus,
            currentStatus: GameStatus
        ) => {
            let updateData: Partial<QuestGame> & { id: number } = {
                id,
                gameStatus: newStatus,
            };

            // If moving to undiscovered, remove priority
            if (newStatus === "undiscovered") {
                updateData = {
                    ...updateData,
                    priority: undefined,
                };
            }
            // If moving from one status to another (except undiscovered)
            else if (currentStatus !== "undiscovered") {
                // Get the games in the target status
                const targetStatusGames = gameData[newStatus].filter(
                    (game) => game.id !== id
                );

                // Set the priority to be at the end of the list
                updateData = {
                    ...updateData,
                    priority: targetStatusGames.length + 1,
                };

                // No need to update priorities of existing games in target status since we're adding to the end

                // Update priorities of remaining games in the current status
                const remainingGames = gameData[currentStatus].filter(
                    (game) => game.id !== id
                );
                const currentStatusUpdates = remainingGames
                    .map((game, index) => ({
                        id: game.id,
                        oldPriority: game.priority || index + 1,
                        newPriority: index + 1,
                    }))
                    .filter((item) => item.oldPriority !== item.newPriority);

                if (currentStatusUpdates.length > 0) {
                    await updateGamePriorities(
                        currentStatusUpdates.map(({ id, newPriority }) => ({
                            id,
                            priority: newPriority,
                        }))
                    );
                }
            }
            // If moving from undiscovered to another status
            else {
                // Set priority to be at the end of the target status list
                const targetStatusGames = gameData[newStatus];
                updateData = {
                    ...updateData,
                    priority: targetStatusGames.length + 1,
                };
            }

            return updateData;
        },
        [gameData, updateGamePriorities]
    );

    const getStatusLabel = useCallback((status: GameStatus): string => {
        switch (status) {
            case "ongoing":
                return "Ongoing";
            case "backlog":
                return "Backlog";
            case "completed":
                return "Completed";
            case "undiscovered":
                return "Undiscovered";
            case "on_hold":
                return "On Hold";
            case "dropped":
                return "Dropped";
        }
    }, []);

    const getStatusTab = useCallback(
        (status: GameStatus): keyof TabParamList => {
            switch (status) {
                case "ongoing":
                    return "Ongoing";
                case "backlog":
                    return "Backlog";
                case "completed":
                    return "Completed";
                case "undiscovered":
                    return "Search";
                default:
                    return "Ongoing";
            }
        },
        []
    );

    const showPlatformSelectionModal = useCallback(
        (
            platforms: Array<{ id: number; name: string }>
        ): Promise<{ id: number; name: string } | null> => {
            return new Promise((resolve) => {
                setPlatformModalPlatforms(platforms);
                platformModalResolveRef.current = resolve;
                setIsPlatformModalVisible(true);
            });
        },
        []
    );

    const handlePlatformSelect = useCallback(
        (platform: { id: number; name: string }) => {
            if (platformModalResolveRef.current) {
                platformModalResolveRef.current(platform);
                platformModalResolveRef.current = null;
                setIsPlatformModalVisible(false);
            } else {
                console.warn(
                    "[handlePlatformSelect] No resolve function available"
                );
            }
        },
        []
    );

    const handlePlatformModalClose = useCallback(() => {
        if (platformModalResolveRef.current) {
            platformModalResolveRef.current(null);
            platformModalResolveRef.current = null;
        }
        setIsPlatformModalVisible(false);
    }, []);

    const handleNavigateAndScroll = useCallback(
        (status: GameStatus) => {
            // First navigate to the tab
            navigation.navigate("GameTabs", {
                screen: getStatusTab(status),
            });

            // Then scroll to the bottom after a short delay to ensure navigation is complete
            setTimeout(() => {
                gameTabsRef.current?.scrollToBottom(status);
            }, 500);
        },
        [navigation, getStatusTab]
    );

    const handleStatusChange = useCallback(
        async (
            id: number,
            newStatus: GameStatus,
            currentStatus: GameStatus
        ) => {
            try {
                // Update UI immediately
                setGameData((prev) => {
                    const gameToMove = prev[currentStatus].find(
                        (game) => game.id === id
                    );
                    if (!gameToMove) return prev;

                    const updatedCurrentGames = prev[currentStatus].filter(
                        (game) => game.id !== id
                    );

                    // Update priorities for current status games if not undiscovered
                    const updatedCurrentGamesWithPriorities =
                        currentStatus !== "undiscovered"
                            ? sortGames(
                                  updatedCurrentGames.map((game, index) => ({
                                      ...game,
                                      priority: index + 1,
                                  }))
                              )
                            : updatedCurrentGames;

                    const movedGame = {
                        ...gameToMove,
                        gameStatus: newStatus,
                        priority:
                            newStatus !== "undiscovered"
                                ? prev[newStatus].length + 1
                                : undefined,
                        updatedAt: new Date().toISOString(),
                    };

                    const updatedTargetGames = sortGames([
                        ...prev[newStatus],
                        movedGame,
                    ]);

                    // Show success toast here where we have access to gameToMove
                    showToast({
                        type: "success",
                        text1: "Game Updated",
                        text2: `${gameToMove.name} moved to ${getStatusLabel(
                            newStatus
                        )}`,
                        position: "bottom",
                        visibilityTime: 2000,
                        color: getStatusColor(newStatus),
                        onPress: () => {
                            triggerHapticFeedback("light");
                            Toast.hide();
                            handleNavigateAndScroll(newStatus);
                        },
                    });

                    return {
                        ...prev,
                        [currentStatus]: updatedCurrentGamesWithPriorities,
                        [newStatus]: updatedTargetGames,
                    };
                });

                // Run DB operations in background
                (async () => {
                    try {
                        const updateData = await getUpdateData(
                            id,
                            newStatus,
                            currentStatus
                        );
                        await updateQuestGame(updateData);

                        if (
                            currentStatus !== "undiscovered" &&
                            newStatus !== "undiscovered"
                        ) {
                            // Update source list priorities
                            const sourceGames = gameData[currentStatus].filter(
                                (game) => game.id !== id
                            );
                            const sourcePriorityUpdates = sourceGames.map(
                                (game, index) => ({
                                    id: game.id,
                                    priority: index + 1,
                                })
                            );
                            if (sourcePriorityUpdates.length > 0) {
                                await updateGamePriorities(
                                    sourcePriorityUpdates
                                );
                            }
                        }
                    } catch (error) {
                        console.error(
                            "[GameListNavigationContainer] Background update failed:",
                            error
                        );
                        await loadGamesForStatus(currentStatus);
                        await loadGamesForStatus(newStatus);
                    }
                })();
            } catch (error) {
                console.error(
                    "[GameListNavigationContainer] Failed to update game status:",
                    error
                );
                showToast({
                    type: "error",
                    text1: "Update Failed",
                    text2: "Failed to update game status. Please try again.",
                    position: "bottom",
                    visibilityTime: 3000,
                });
                await loadGamesForStatus(currentStatus);
                await loadGamesForStatus(newStatus);
            }
        },
        [
            gameData,
            navigation,
            getUpdateData,
            getStatusLabel,
            getStatusTab,
            getStatusColor,
            loadGamesForStatus,
            updateGamePriorities,
            handleNavigateAndScroll,
        ]
    );

    const handleRemoveItem = useCallback(
        async (itemId: number, status: GameStatus) => {
            try {
                // First perform all database operations
                const updateData = await getUpdateData(
                    itemId,
                    "undiscovered",
                    status
                );
                await updateQuestGame(updateData);

                // Update UI state after successful database operations
                setGameData((prev) => {
                    const gameToRemove = prev[status].find(
                        (game) => game.id === itemId
                    );
                    if (!gameToRemove) return prev;

                    const updatedGames = prev[status].filter(
                        (game) => game.id !== itemId
                    );

                    // Calculate which items need priority updates
                    const gamesWithUpdatedPriorities = updatedGames.map(
                        (game, index) => {
                            const newPriority = index + 1;
                            return game.priority !== newPriority
                                ? { ...game, priority: newPriority }
                                : game;
                        }
                    );

                    // Show success toast
                    showToast({
                        type: "success",
                        text1: "Game Removed",
                        text2: `${gameToRemove.name} removed`,
                        position: "bottom",
                        color: getStatusColor(status),
                        visibilityTime: 2000,
                    });

                    return {
                        ...prev,
                        [status]: gamesWithUpdatedPriorities,
                    };
                });

                // Update priorities in the database for non-undiscovered statuses
                if (status !== "undiscovered") {
                    const priorityUpdates = gameData[status]
                        .filter((game) => game.id !== itemId)
                        .map((game, index) => ({
                            id: game.id,
                            oldPriority: game.priority || index + 1,
                            newPriority: index + 1,
                        }))
                        .filter(
                            (item) => item.oldPriority !== item.newPriority
                        );

                    if (priorityUpdates.length > 0) {
                        await updateGamePriorities(
                            priorityUpdates.map(({ id, newPriority }) => ({
                                id,
                                priority: newPriority,
                            }))
                        );
                    }
                }
            } catch (error) {
                console.error(
                    "[GameListNavigationContainer] Failed to remove item:",
                    error
                );
                showToast({
                    type: "error",
                    text1: "Remove Failed",
                    text2: "Failed to remove game. Please try again.",
                    position: "bottom",
                    visibilityTime: 3000,
                });
                await loadGamesForStatus(status);
            }
        },
        [
            gameData,
            getUpdateData,
            getStatusColor,
            updateGamePriorities,
            loadGamesForStatus,
        ]
    );

    const handleDiscover = useCallback(
        async (game: MinimalQuestGame, newStatus: GameStatus) => {
            try {
                const dbQuestGame = await doesGameExist(game.id);

                const currentGames = await getQuestGamesByStatus(newStatus);

                const currentPriority =
                    newStatus !== "undiscovered"
                        ? currentGames.length + 1
                        : undefined;

                if (dbQuestGame) {
                    // Game exists, show platform selection with current platform pre-selected
                    let selectedPlatform = game.platforms?.[0];

                    if (game.platforms?.length > 1) {
                        selectedPlatform =
                            (await showPlatformSelectionModal(
                                game.platforms || []
                            )) || selectedPlatform;
                    }

                    if (
                        selectedPlatform?.id ===
                        dbQuestGame.selectedPlatform?.id
                    ) {
                        // Same platform selected, only update status if needed

                        if (dbQuestGame.gameStatus !== newStatus) {
                            await handleStatusChange(
                                dbQuestGame.id,
                                newStatus,
                                dbQuestGame.gameStatus
                            );
                        }
                    } else {
                        // Different platform selected, update both platform and status

                        try {
                            await createQuestGameData(game.id, {
                                game_status: newStatus,
                                selected_platform_id:
                                    selectedPlatform?.id || null,
                                priority: currentPriority,
                            });
                            showToast({
                                type: "success",
                                text1: "Game Added",
                                text2: `${game.name} added to ${getStatusLabel(
                                    newStatus
                                )} for ${selectedPlatform?.name}`,
                                color: getStatusColor(newStatus),
                                position: "bottom",
                                visibilityTime: 3000,
                                onPress: () => {
                                    triggerHapticFeedback("light");
                                    Toast.hide();
                                    handleNavigateAndScroll(newStatus);
                                },
                            });
                        } catch (error) {
                            showToast({
                                type: "error",
                                text1: "Update Failed",
                                text2:
                                    "Failed to update game platform. Please try again.",
                                position: "bottom",
                                visibilityTime: 3000,
                            });
                            throw error;
                        }
                    }
                } else {
                    // Game doesn't exist, create new IGDB game and quest game

                    const fetchedIGDBGame = await IGDBService.getIGDBGameById(
                        game.id
                    );

                    if (!fetchedIGDBGame) {
                        showToast({
                            type: "error",
                            text1: "Game Not Found",
                            text2: "Failed to fetch game details from IGDB.",
                            position: "bottom",
                            visibilityTime: 3000,
                        });
                        throw new Error(
                            `Failed to fetch game details for ID: ${game.id}`
                        );
                    }

                    let selectedPlatform = game.platforms?.[0]; // Show platform selection for new game

                    if (game.platforms?.length > 1) {
                        selectedPlatform =
                            (await showPlatformSelectionModal(
                                game.platforms || []
                            )) || selectedPlatform;
                    }

                    try {
                        await createIGDBGame(fetchedIGDBGame);

                        await createQuestGameData(game.id, {
                            game_status: newStatus,
                            date_added: new Date().toISOString(),
                            priority: currentPriority,
                            selected_platform_id: selectedPlatform?.id || null,
                        });
                        showToast({
                            type: "success",
                            text1: "Game Added",
                            text2: `${game.name} added to ${getStatusLabel(
                                newStatus
                            )}`,
                            color: getStatusColor(newStatus),
                            position: "bottom",
                            visibilityTime: 2000,
                            onPress: () => {
                                triggerHapticFeedback("light");
                                Toast.hide();
                                handleNavigateAndScroll(newStatus);
                            },
                        });
                    } catch (error) {
                        showToast({
                            type: "error",
                            text1: "Add Failed",
                            text2:
                                "Failed to add game to your collection. Please try again.",
                            position: "bottom",
                            visibilityTime: 3000,
                        });
                        throw error;
                    }
                } // Refresh the game list after all changes are complete

                await loadGamesForStatus(newStatus);
            } catch (error) {
                console.error("[handleDiscover] Error:", error);
                showToast({
                    type: "error",
                    text1: "Operation Failed",
                    text2: "An unexpected error occurred. Please try again.",
                    position: "bottom",
                    visibilityTime: 3000,
                });
            }
        },
        [
            navigation,
            gameData,
            getStatusLabel,
            getStatusTab,
            getStatusColor,
            loadGamesForStatus,
            handleStatusChange,
            showPlatformSelectionModal,
            handleNavigateAndScroll,
        ]
    );

    const handleReorder = useCallback(
        async (fromIndex: number, toIndex: number, status: GameStatus) => {
            if (!gameData[status].length) return;

            const updatedData = [...gameData[status]];
            const [removed] = updatedData.splice(fromIndex, 1);
            updatedData.splice(toIndex, 0, removed);

            // Calculate which items need priority updates
            const priorityUpdates = updatedData
                .map((item, index) => ({
                    id: item.id,
                    oldPriority: item.priority || index + 1,
                    newPriority: index + 1,
                }))
                .filter((item) => item.oldPriority !== item.newPriority);

            if (priorityUpdates.length === 0) return;

            try {
                await updateGamePriorities(
                    priorityUpdates.map(({ id, newPriority }) => ({
                        id,
                        priority: newPriority,
                    }))
                );

                setGameData((prev) => ({
                    ...prev,
                    [status]: sortGames(
                        updatedData.map((item, index) => ({
                            ...item,
                            priority: index + 1,
                        }))
                    ),
                }));
            } catch (error) {
                console.error("Failed to update priorities:", error);
                await loadGamesForStatus(status);
            }
        },
        [gameData, updateGamePriorities, sortGames, loadGamesForStatus]
    );

    // Memoize the component's UI for stable props
    const gameTabs = useMemo(
        () => (
            <GameTabs
                ref={gameTabsRef}
                gameData={gameData}
                isLoading={isLoading}
                handleStatusChange={handleStatusChange}
                handleRemoveItem={handleRemoveItem}
                handleReorder={handleReorder}
                handleDiscover={handleDiscover}
                onTabChange={handleTabChange}
            />
        ),
        [
            gameData,
            isLoading,
            handleStatusChange,
            handleRemoveItem,
            handleReorder,
            handleDiscover,
            handleTabChange,
        ]
    );

    const platformSelectionModal = useMemo(
        () => (
            <PlatformSelectionModal
                visible={isPlatformModalVisible}
                onClose={handlePlatformModalClose}
                onSelect={handlePlatformSelect}
                platforms={platformModalPlatforms}
            />
        ),
        [
            isPlatformModalVisible,
            handlePlatformModalClose,
            handlePlatformSelect,
            platformModalPlatforms,
        ]
    );

    return (
        <>
            <Stack.Navigator
                screenOptions={{
                    headerStyle,
                    headerTitleStyle: {
                        color: colorSwatch.accent.cyan,
                        fontFamily: "Inter-Regular",
                    },
                    headerTintColor: colorSwatch.accent.cyan,
                }}
            >
                {/* <Stack.Screen
                    name="Home"
                    component={Home}
                    options={{ headerShown: false }}
                /> */}
                <Stack.Screen
                    name="GameTabs"
                    options={{
                        headerShown: false,
                    }}
                >
                    {() => (
                        <View style={styles.container}>
                            <Image
                                source={require("../../assets/next-quest-icons/next_quest_white.png")}
                                style={styles.backgroundImage}
                                resizeMode="contain"
                                tintColor={getStatusColor(activeStatus)}
                            />
                            <View style={styles.contentContainer}>
                                {gameTabs}
                                {platformSelectionModal}
                            </View>
                        </View>
                    )}
                </Stack.Screen>
                <Stack.Screen
                    name="QuestGameDetailPage"
                    component={QuestGameDetailPage}
                    options={({ route, navigation }) => ({
                        headerTransparent: true,
                        headerTintColor: activeTabColor,
                        headerLeft: () => (
                            <AnimatedBackButton
                                onPress={() => navigation.goBack()}
                                color={activeTabColor}
                                title={route.params.name}
                            />
                        ),
                        headerTitle: "",
                        headerBackgroundContainerStyle: {},
                        animation: "slide_from_right",
                    })}
                />
            </Stack.Navigator>
            <QuestToast />
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backgroundImage: {
        ...StyleSheet.absoluteFillObject,
        width: "100%",
        height: "100%",
        opacity: 0.2,
        zIndex: -1,
    },
    contentContainer: {
        flex: 1,
        backgroundColor: "transparent",
        zIndex: 1,
    },
});

export default React.memo(MainNavigationContainer);
