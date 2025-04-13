import React, { useState, useCallback, useEffect, useRef } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import QuestGameDetailPage from "./QuestGameDetailPage";
import { GameStatus } from "src/constants/config/gameStatus";
import { MinimalQuestGame } from "src/data/models/MinimalQuestGame";
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
            if (status === "backlog") {
                // For backlog, priority is the primary sort (lowest first)
                const priorityA = a.priority || Infinity;
                const priorityB = b.priority || Infinity;
                if (priorityA !== priorityB) {
                    return priorityA - priorityB;
                }
            }
            // For non-backlog or equal priorities, sort by updatedAt in ascending order
            // This will make newest items appear at the bottom, which will be rendered last (top) in the list
            return (
                new Date(a.updatedAt).getTime() -
                new Date(b.updatedAt).getTime()
            );
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
        // Initialize the update data object with the game ID and new status
        let updateData: any = { id, gameStatus: newStatus };

        // If the game is being moved to the backlog
        if (newStatus === "backlog") {
            // Get the current backlog games to determine the highest priority
            const backlogGames = gameData.backlog;
            const highestPriority = backlogGames.reduce(
                (max, game) => Math.max(max, game.priority || 0),
                0
            );
            // Set the new priority to be one higher than the current highest
            updateData = {
                ...updateData,
                priority: highestPriority + 1,
                notes: undefined, // Clear notes when moving to backlog
            };
        }
        // If the game is being moved from the backlog
        else if (currentStatus === "backlog") {
            // Set the moved game's priority to undefined
            updateData = {
                ...updateData,
                priority: undefined,
            };

            // Update the priorities of the remaining backlog games
            const remainingGames = gameData.backlog.filter(
                (game) => game.id !== id
            );

            // Calculate which items need priority updates
            const priorityUpdates = remainingGames
                .map((game, index) => ({
                    id: game.id,
                    oldPriority: game.priority || index + 1,
                    newPriority: index + 1,
                }))
                .filter((item) => item.oldPriority !== item.newPriority);

            if (priorityUpdates.length > 0) {
                // Execute the priority updates for the remaining games
                await updateGamePriorities(
                    priorityUpdates.map(({ id, newPriority }) => ({
                        id,
                        priority: newPriority,
                    }))
                );
            }
        }
        // For any other status change
        else {
            // Set the moved game's priority to undefined
            updateData = {
                ...updateData,
                priority: undefined,
            };
        }
        // Return the constructed update data object
        return updateData;
    };

    const handleDiscover = async (
        game: MinimalQuestGame,
        newStatus: GameStatus
    ) => {
        try {
            const dbQuestGame = await doesGameExist(game.id);

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
                        Toast.show({
                            type: "success",
                            text1: "Game Status Updated",
                            text2: `${game.name} moved to ${getStatusLabel(
                                newStatus
                            )}`,
                            position: "bottom",
                            visibilityTime: 2000,
                        });
                    }
                } else {
                    // Different platform selected, update both platform and status
                    try {
                        await createQuestGameData(game.id, {
                            game_status: newStatus,
                            selected_platform_id: selectedPlatform?.id || null,
                            priority:
                                newStatus === "backlog"
                                    ? gameData.backlog.length + 1
                                    : 0,
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
                    Toast.show({
                        type: "error",
                        text1: "Error Adding Game",
                        text2: `Failed to fetch game details for ${game.name}`,
                        position: "bottom",
                        visibilityTime: 3000,
                    });
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
                        priority:
                            newStatus === "backlog"
                                ? gameData.backlog.length + 1
                                : 0,
                        selected_platform_id: selectedPlatform?.id || null,
                    });
                    Toast.show({
                        type: "success",
                        text1: "Game Added",
                        text2: `${game.name} added to ${getStatusLabel(
                            newStatus
                        )}`,
                        position: "bottom",
                        visibilityTime: 2000,
                    });
                } catch (error) {
                    throw error;
                }
            }

            // Refresh the game list after any changes
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

                const updatedBacklogGames =
                    currentStatus === "backlog"
                        ? sortGames(
                              updatedCurrentGames.map((game, index) => ({
                                  ...game,
                                  priority: index + 1,
                              })),
                              "backlog"
                          )
                        : prev.backlog;

                const movedGame = {
                    ...gameToMove,
                    gameStatus: newStatus,
                    priority:
                        newStatus === "backlog"
                            ? prev.backlog.length + 1
                            : undefined,
                    updatedAt: new Date().toISOString(),
                };

                const updatedTargetGames = sortGames(
                    newStatus === "backlog"
                        ? [...prev.backlog, movedGame]
                        : [...prev[newStatus], movedGame],
                    newStatus
                );

                return {
                    ...prev,
                    [currentStatus]:
                        currentStatus === "backlog"
                            ? updatedBacklogGames
                            : sortGames(updatedCurrentGames, currentStatus),
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

                    if (currentStatus === "backlog") {
                        const remainingGames = gameData.backlog.filter(
                            (game) => game.id !== id
                        );
                        const priorityUpdates = remainingGames.map(
                            (game, index) => ({
                                id: game.id,
                                priority: index + 1,
                            })
                        );
                        await updateGamePriorities(priorityUpdates);
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

                if (status === "backlog") {
                    return {
                        ...prev,
                        [status]: updatedGames.map((game, index) => ({
                            ...game,
                            priority: index + 1,
                        })),
                    };
                }

                return {
                    ...prev,
                    [status]: updatedGames,
                };
            });
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
                    options={({ route }) => ({
                        headerTransparent: true,
                        headerTintColor: activeTabColor,
                        headerTitle: route.params.name,
                        headerTitleStyle: {
                            fontFamily: "Inter-Regular",
                            fontSize: 24,
                            lineHeight: 32,
                            fontWeight: "600",
                        },
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
