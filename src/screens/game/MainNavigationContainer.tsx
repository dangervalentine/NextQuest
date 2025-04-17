import React, { useState, useCallback, useEffect, useRef } from "react";
import {
    createStackNavigator,
    StackNavigationOptions,
} from "@react-navigation/stack";
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
import { colorSwatch } from "src/utils/colorConstants";
import { headerStyle } from "./GameList/components/GameTabNavigator";
import { createIGDBGame } from "src/data/repositories/igdbGames";
import { PlatformSelectionModal } from "../../components/common/PlatformSelectionModal";
import Toast from "react-native-toast-message";
import GameTabs from "./GameTabs";
import { RootStackParamList } from "src/utils/navigationTypes";
import { getStatusColor } from "src/utils/colors";
import { Ionicons } from "@expo/vector-icons";
import { Pressable } from "react-native";
import Text from "src/components/common/Text";
import { StackScreenProps } from "@react-navigation/stack";
const Stack = createStackNavigator<RootStackParamList>();

const MainNavigationContainer: React.FC = () => {
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
        getStatusColor("ongoing")
    );

    // Add this state for the modal
    const [isPlatformModalVisible, setIsPlatformModalVisible] = useState(false);
    const [platformModalPlatforms, setPlatformModalPlatforms] = useState<
        Array<{ id: number; name: string }>
    >([]);
    const platformModalResolveRef = useRef<
        ((platform: { id: number; name: string } | null) => void) | null
    >(null);

    const sortGames = (games: MinimalQuestGame[], status: GameStatus) => {
        return [...games].sort((a, b) => {
            const priorityA = a.priority || Infinity;
            const priorityB = b.priority || Infinity;
            return priorityA - priorityB;
        });
    };

    const loadGamesForStatus = useCallback(async (status: GameStatus) => {
        try {
            setIsLoading((prev) => ({ ...prev, [status]: true }));

            const games = await getQuestGamesByStatus(status);

            const sortedGames = sortGames(games, status);

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

    const handleTabChange = (tabName: string) => {
        setActiveTabColor(getStatusColor(tabName.toLowerCase() as GameStatus));
    };

    useEffect(() => {
        const loadInitialData = async () => {
            const statuses: GameStatus[] = ["ongoing", "backlog", "completed"];
            for (const status of statuses) {
                await loadGamesForStatus(status);
            }
        };
        loadInitialData();
    }, []);

    const getUpdateData = async (
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
    };

    const handleDiscover = async (
        game: MinimalQuestGame,
        newStatus: GameStatus
    ) => {
        try {
            const dbQuestGame = await doesGameExist(game.id);
            // Get current games count for priority calculation
            const currentGames = await getQuestGamesByStatus(newStatus);
            const currentPriority =
                newStatus !== "undiscovered"
                    ? currentGames.length + 1
                    : undefined;

            if (dbQuestGame) {
                let selectedPlatform = game.platforms?.[0];

                // Game exists, show platform selection with current platform pre-selected
                if (game.platforms?.length > 1) {
                    selectedPlatform =
                        (await showPlatformSelectionModal(
                            game.platforms || []
                        )) || selectedPlatform;
                }

                if (selectedPlatform?.id === dbQuestGame.selectedPlatform?.id) {
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
                            selected_platform_id: selectedPlatform?.id || null,
                            priority: currentPriority,
                        });
                        Toast.show({
                            type: "success",
                            text1: "Game Updated",
                            text2: `${game.name} added to ${getStatusLabel(
                                newStatus
                            )} for ${selectedPlatform?.name}`,
                            position: "bottom",
                            visibilityTime: 2000,
                        });
                    } catch (error) {
                        throw error;
                    }
                }
            } else {
                // Game doesn't exist, create new IGDB game and quest game
                const fetchedIGDBGame = await IGDBService.getIGDBGameById(
                    game.id
                );
                if (!fetchedIGDBGame) {
                    throw new Error(
                        `Failed to fetch game details for ID: ${game.id}`
                    );
                }

                let selectedPlatform = game.platforms?.[0];

                // Show platform selection for new game
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
                } catch (error) {
                    throw error;
                }
            }

            // Refresh the game list after all changes are complete
            await loadGamesForStatus(newStatus);
        } catch (error) {
            console.error("[handleDiscover] Error:", error);
        }
    };

    const getStatusLabel = (status: GameStatus) => {
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
    };

    const showPlatformSelectionModal = (
        platforms: Array<{ id: number; name: string }>
    ): Promise<{ id: number; name: string } | null> => {
        return new Promise((resolve) => {
            setPlatformModalPlatforms(platforms);
            platformModalResolveRef.current = resolve;
            setIsPlatformModalVisible(true);
        });
    };

    const handlePlatformSelect = (platform: { id: number; name: string }) => {
        if (platformModalResolveRef.current) {
            platformModalResolveRef.current(platform);
            platformModalResolveRef.current = null;
            setIsPlatformModalVisible(false);
        } else {
            console.warn(
                "[handlePlatformSelect] No resolve function available"
            );
        }
    };

    const handlePlatformModalClose = () => {
        if (platformModalResolveRef.current) {
            platformModalResolveRef.current(null);
            platformModalResolveRef.current = null;
        }
        setIsPlatformModalVisible(false);
    };

    const handleStatusChange = async (
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
                              })),
                              currentStatus
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

                const updatedTargetGames = sortGames(
                    [...prev[newStatus], movedGame],
                    newStatus
                );

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
                            await updateGamePriorities(sourcePriorityUpdates);
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
            await loadGamesForStatus(currentStatus);
            await loadGamesForStatus(newStatus);
        }
    };

    const handleRemoveItem = async (itemId: number, status: GameStatus) => {
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
                const updatedGames = prev[status].filter(
                    (game) => game.id !== itemId
                );

                // Calculate which items need priority updates
                const gamesWithUpdatedPriorities = updatedGames.map(
                    (game, index) => {
                        const newPriority = index + 1;
                        // Only update priority if it has changed
                        return game.priority !== newPriority
                            ? { ...game, priority: newPriority }
                            : game;
                    }
                );

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
                    .filter((item) => item.oldPriority !== item.newPriority);

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
            // Reload the status to ensure UI is in sync with database
            await loadGamesForStatus(status);
        }
    };

    const handleReorder = async (
        fromIndex: number,
        toIndex: number,
        status: GameStatus
    ) => {
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
                    })),
                    status
                ),
            }));
        } catch (error) {
            console.error("Failed to update priorities:", error);
            await loadGamesForStatus(status);
        }
    };

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
                <Stack.Screen name="GameTabs" options={{ headerShown: false }}>
                    {() => (
                        <>
                            <GameTabs
                                gameData={gameData}
                                isLoading={isLoading}
                                handleStatusChange={handleStatusChange}
                                handleRemoveItem={handleRemoveItem}
                                handleReorder={handleReorder}
                                handleDiscover={handleDiscover}
                                onTabChange={handleTabChange}
                            />
                            <PlatformSelectionModal
                                visible={isPlatformModalVisible}
                                onClose={handlePlatformModalClose}
                                onSelect={handlePlatformSelect}
                                platforms={platformModalPlatforms}
                            />
                        </>
                    )}
                </Stack.Screen>
                <Stack.Screen
                    name="QuestGameDetailPage"
                    component={QuestGameDetailPage}
                    options={({ route, navigation }) => ({
                        headerTransparent: true,
                        headerTintColor: activeTabColor,
                        headerLeft: () => (
                            <Pressable
                                onPress={() => navigation.goBack()}
                                style={({ pressed }) => ({
                                    flexDirection: "row",
                                    alignItems: "center",
                                    paddingRight: 16,
                                    paddingVertical: 8,
                                    paddingLeft: 8,
                                    width: "100%",
                                    opacity: pressed ? 0.8 : 1,
                                })}
                            >
                                <Ionicons
                                    name="arrow-back"
                                    size={24}
                                    color={activeTabColor}
                                />
                                <Text
                                    variant="title"
                                    style={{
                                        fontSize: 24,
                                        lineHeight: 32,
                                        color: activeTabColor,
                                        marginLeft: 4,
                                    }}
                                    numberOfLines={1}
                                >
                                    {route.params.name}
                                </Text>
                            </Pressable>
                        ),
                        headerTitle: "",
                        headerBackgroundContainerStyle: {
                            backgroundColor: colorSwatch.background.darkest,
                        },
                        animation: "slide_from_right",
                    })}
                />
            </Stack.Navigator>
        </>
    );
};

export default MainNavigationContainer;
