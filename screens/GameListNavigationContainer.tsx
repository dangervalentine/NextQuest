import React, { useState, useCallback, useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import GameSection from "./GameList/components/GameSection";
import {
    FontAwesome5,
    MaterialCommunityIcons,
    SimpleLineIcons,
} from "@expo/vector-icons";
import HeaderWithIcon from "./shared/HeaderWithIcon";
import { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";
import { GameStatus } from "../constants/gameStatus";
import { colorSwatch } from "../utils/colorConstants";
import { View } from "react-native";
import QuestIcon from "./shared/GameIcon";
import { MinimalQuestGame } from "../data/models/MinimalQuestGame";
import {
    getQuestGamesByStatus,
    updateGamePriorities,
    updateQuestGame,
} from "../data/repositories/questGames";

const Tab = createBottomTabNavigator();

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
        undiscovered: true,
        on_hold: true,
        dropped: true,
    });

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
            const priorityUpdates = remainingGames.map((game, index) => ({
                id: game.id,
                priority: index + 1, // Reassign priorities based on new order
            }));
            // Execute the priority updates for the remaining games
            await updateGamePriorities(priorityUpdates);
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
            const updateData = await getUpdateData(
                itemId,
                "undiscovered",
                status
            );
            await updateQuestGame(updateData);

            setGameData((prev) => ({
                ...prev,
                [status]: prev[status].filter((game) => game.id !== itemId),
            }));

            if (status === "backlog") {
                const remainingGames = gameData.backlog.filter(
                    (game) => game.id !== itemId
                );
                const priorityUpdates = remainingGames.map((game, index) => ({
                    id: game.id,
                    priority: index + 1,
                }));

                try {
                    await updateGamePriorities(priorityUpdates);
                    setGameData((prev) => ({
                        ...prev,
                        backlog: remainingGames.map((game, index) => ({
                            ...game,
                            priority: index + 1,
                        })),
                    }));
                } catch (error) {
                    console.error(
                        "[GameListNavigationContainer] Failed to update backlog priorities:",
                        error
                    );
                    await loadGamesForStatus("backlog");
                }
            }
        } catch (error) {
            console.error(
                "[GameListNavigationContainer] Failed to remove item:",
                error
            );
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

        const priorityUpdates = updatedData.map((item, index) => ({
            id: item.id,
            priority: index + 1,
        }));

        try {
            await updateGamePriorities(priorityUpdates);
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

    const tabScreens: {
        name: string;
        iconName:
            | keyof typeof MaterialCommunityIcons.glyphMap
            | keyof typeof SimpleLineIcons.glyphMap
            | keyof typeof FontAwesome5.glyphMap;
        title: string;
        gameStatus: GameStatus;
    }[] = [
        {
            name: "Ongoing",
            iconName: "gamepad-variant", // MaterialCommunityIcons
            title: "Ongoing Quests",
            gameStatus: "ongoing",
        },
        {
            name: "Backlog",
            iconName: "scroll", // FontAwesome5
            title: "Backlog",
            gameStatus: "backlog",
        },
        {
            name: "Trophies",
            iconName: "medal", // FontAwesome5
            title: "Trophy Room",
            gameStatus: "completed",
        },
    ];

    return (
        <Tab.Navigator screenOptions={screenOptions}>
            {tabScreens.map((screen) => (
                <Tab.Screen
                    key={screen.name}
                    name={screen.name}
                    options={{
                        tabBarLabel: screen.name,
                        tabBarIcon: ({ color, size }) => (
                            <QuestIcon
                                name={screen.iconName}
                                size={size}
                                color={color}
                            />
                        ),
                        headerTitle: () => (
                            <HeaderWithIcon
                                iconName={screen.iconName}
                                title={screen.title}
                            />
                        ),
                    }}
                >
                    {() => (
                        <GameSection
                            gameStatus={screen.gameStatus}
                            games={gameData[screen.gameStatus]}
                            isLoading={isLoading[screen.gameStatus]}
                            onStatusChange={handleStatusChange}
                            onRemoveItem={handleRemoveItem}
                            onReorder={handleReorder}
                        />
                    )}
                </Tab.Screen>
            ))}
        </Tab.Navigator>
    );
};

const tabBarStyle = {
    backgroundColor: colorSwatch.background.darkest,
    borderColor: colorSwatch.neutral.darkGray,
    borderTopWidth: 1,
    height: 60,
    paddingBottom: 8,
};

const headerStyle = {
    backgroundColor: colorSwatch.background.darkest,
    borderBottomWidth: 1,
    borderColor: colorSwatch.neutral.darkGray,
    shadowOffset: {
        width: 0,
        height: 4,
    },
    shadowColor: colorSwatch.background.darker,
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
};

const screenOptions: BottomTabNavigationOptions = {
    tabBarStyle,
    tabBarActiveTintColor: colorSwatch.accent.cyan,
    tabBarInactiveTintColor: colorSwatch.text.secondary,
    tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: "500",
    },
    headerStyle,
    tabBarBackground: () => (
        <View
            style={{ backgroundColor: colorSwatch.background.darkest, flex: 1 }}
        />
    ),
};

export default MainNavigationContainer;
