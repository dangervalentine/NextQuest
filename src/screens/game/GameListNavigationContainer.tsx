import React, { useState, useCallback, useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import GameSection from "./GameList/components/GameSection";
import QuestGameDetailPage from "./QuestGameDetailPage";
import HeaderWithIcon from "./shared/HeaderWithIcon";
import { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";
import { View } from "react-native";
import QuestIcon from "./shared/GameIcon";
import { GameStatus } from "src/constants/config/gameStatus";
import { MinimalQuestGame } from "src/data/models/MinimalQuestGame";
import {
    getQuestGamesByStatus,
    updateGamePriorities,
    updateQuestGame,
} from "src/data/repositories/questGames";
import { colorSwatch } from "src/utils/colorConstants";
import GameSearchSection from "./GameList/components/GameSearchSection";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator<RootStackParamList>();

interface TabNavigatorProps {
    gameData: Record<GameStatus, MinimalQuestGame[]>;
    isLoading: Record<GameStatus, boolean>;
    handleStatusChange: (
        id: number,
        newStatus: GameStatus,
        currentStatus: GameStatus
    ) => void;
    handleRemoveItem: (itemId: number, status: GameStatus) => void;
    handleReorder: (
        fromIndex: number,
        toIndex: number,
        status: GameStatus
    ) => void;
}

// Add getStatusColor function at the top level
const getStatusColor = (status: GameStatus): string => {
    switch (status) {
        case "ongoing":
            return colorSwatch.accent.yellow;
        case "completed":
            return colorSwatch.accent.green;
        case "backlog":
            return colorSwatch.accent.purple;
        case "undiscovered":
            return colorSwatch.accent.cyan;
        default:
            return colorSwatch.accent.cyan;
    }
};

const TabNavigator: React.FC<TabNavigatorProps> = ({
    gameData,
    isLoading,
    handleStatusChange,
    handleRemoveItem,
    handleReorder,
}) => {
    const tabScreens = [
        {
            name: "Ongoing",
            iconName: "gamepad-variant" as const,
            title: "Ongoing Quests",
            gameStatus: "ongoing" as GameStatus,
        },
        {
            name: "Backlog",
            iconName: "scroll" as const,
            title: "Backlog",
            gameStatus: "backlog" as GameStatus,
        },
        {
            name: "Trophies",
            iconName: "medal" as const,
            title: "Trophy Room",
            gameStatus: "completed" as GameStatus,
        },
    ];

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                ...screenOptions,
                tabBarStyle: {
                    ...tabBarStyle,
                },
                tabBarActiveTintColor:
                    route.name === "Discover"
                        ? getStatusColor("undiscovered")
                        : getStatusColor(
                              tabScreens.find(
                                  (screen) => screen.name === route.name
                              )?.gameStatus || "ongoing"
                          ),
                tabBarInactiveTintColor: colorSwatch.text.muted,
            })}
        >
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
                                color={getStatusColor(screen.gameStatus)}
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
            <Tab.Screen
                key={"Discover"}
                name={"Discover"}
                options={{
                    tabBarLabel: "Discover",
                    tabBarIcon: ({ color, size }) => (
                        <QuestIcon
                            name={"telescope"}
                            size={size}
                            color={color}
                        />
                    ),
                    headerTitle: () => (
                        <HeaderWithIcon
                            iconName={"telescope"}
                            title={"Discover"}
                            color={getStatusColor("undiscovered")}
                        />
                    ),
                }}
            >
                {() => (
                    <GameSearchSection
                        gameStatus={"undiscovered"}
                        games={gameData["undiscovered"]}
                        onStatusChange={handleStatusChange}
                    />
                )}
            </Tab.Screen>
        </Tab.Navigator>
    );
};

type RootStackParamList = {
    GameTabs: undefined;
    QuestGameDetailPage: {
        id: number;
        name: string;
    };
};

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
            const statuses: GameStatus[] = [
                "ongoing",
                "backlog",
                "completed",
                "undiscovered",
            ];
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
            const updateData = await getUpdateData(itemId, "dropped", status);
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
            <Stack.Screen name="GameTabs" options={{ headerShown: false }}>
                {() => (
                    <TabNavigator
                        gameData={gameData}
                        isLoading={isLoading}
                        handleStatusChange={handleStatusChange}
                        handleRemoveItem={handleRemoveItem}
                        handleReorder={handleReorder}
                    />
                )}
            </Stack.Screen>
            <Stack.Screen
                name="QuestGameDetailPage"
                component={QuestGameDetailPage}
                options={({ route }) => ({
                    headerTransparent: true,
                    headerTintColor: colorSwatch.accent.purple,
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
    tabBarInactiveTintColor: colorSwatch.text.muted,
    tabBarLabelStyle: {
        fontSize: 12,
        fontFamily: "FiraCode-Regular",
    },
    headerStyle,
    headerTitleStyle: {
        fontFamily: "FiraCode-Regular",
    },
    tabBarBackground: () => (
        <View
            style={{ backgroundColor: colorSwatch.background.darkest, flex: 1 }}
        />
    ),
};

export default MainNavigationContainer;
