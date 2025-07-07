import React, {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
    useRef,
} from "react";
import { GameStatus } from "../constants/config/gameStatus";
import { MinimalQuestGame } from "../data/models/MinimalQuestGame";
import { QuestGame } from "../data/models/QuestGame";
import {
    createQuestGameData,
    doesGameExist,
    getQuestGamesByStatus,
    updateGamePriorities,
    updateQuestGame,
    updateGameRating,
} from "../data/repositories/questGames";
import { createIGDBGame } from "../data/repositories/igdbGames";
import IGDBService from "../services/api/IGDBService";
import { showToast } from "../components/common/QuestToast";
import { getStatusColor } from "../utils/colorsUtils";
import { getStatusLabel } from "../utils/gameStatusUtils";
import { HapticFeedback } from "../utils/hapticUtils";
import Toast from "react-native-toast-message";
import { RatingModal } from "../components/common/RatingModal";

interface GamesContextType {
    gameData: Record<GameStatus, MinimalQuestGame[]>;
    isLoading: Record<GameStatus, boolean>;
    loadGamesForStatus: (status: GameStatus) => Promise<void>;
    handleStatusChange: (
        id: number,
        newStatus: GameStatus,
        currentStatus: GameStatus
    ) => Promise<void>;
    handleRemoveItem: (itemId: number, status: GameStatus) => Promise<void>;
    handleDiscover: (
        game: MinimalQuestGame,
        newStatus: GameStatus
    ) => Promise<void>;
    handleReorder: (
        fromIndex: number,
        toIndex: number,
        status: GameStatus
    ) => Promise<void>;
    handleNavigateAndScroll?: (status: GameStatus) => void;
    showPlatformSelectionModal: (
        platforms: Array<{ id: number; name: string }>
    ) => Promise<{ id: number; name: string } | null>;
    // Rating modal state
    isRatingModalVisible: boolean;
    ratingModalGameName: string;
    ratingModalGameId: number | null;
    showRatingModal: (gameId: number, gameName: string) => void;
    hideRatingModal: () => void;
}

interface GamesProviderProps {
    children: React.ReactNode;
    onNavigateToStatus?: (status: GameStatus) => void;
    platformModalComponent: (
        isVisible: boolean,
        platforms: Array<{ id: number; name: string }>,
        onSelect: (platform: { id: number; name: string }) => void,
        onClose: () => void
    ) => React.ReactNode;
}

const GamesContext = createContext<GamesContextType | null>(null);

export const GamesProvider: React.FC<GamesProviderProps> = ({
    children,
    onNavigateToStatus,
    platformModalComponent,
}) => {
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

    // Platform modal state
    const [isPlatformModalVisible, setIsPlatformModalVisible] = useState(false);
    const [platformModalPlatforms, setPlatformModalPlatforms] = useState<
        Array<{ id: number; name: string }>
    >([]);
    const platformModalResolveRef = React.useRef<
        ((platform: { id: number; name: string } | null) => void) | null
    >(null);

    // Rating modal state
    const [isRatingModalVisible, setIsRatingModalVisible] = useState(false);
    const [ratingModalGameName, setRatingModalGameName] = useState("");
    const [ratingModalGameId, setRatingModalGameId] = useState<number | null>(null);
    const pendingStatusChangeRef = useRef<{
        id: number;
        newStatus: GameStatus;
        currentStatus: GameStatus;
    } | null>(null);

    // Memoize sortGames to prevent recreation on every render
    const sortGames = useCallback((games: MinimalQuestGame[]) => {
        return [...games].sort((a, b) => {
            const priorityA = a.priority || Infinity;
            const priorityB = b.priority || Infinity;
            return priorityA - priorityB;
        });
    }, []);

    const loadGamesForStatus = useCallback(
        async (status: GameStatus) => {
            try {
                setIsLoading((prev) => ({ ...prev, [status]: true }));
                const games = await getQuestGamesByStatus(status);
                const sortedGames = sortGames(games);

                setGameData((prev) => ({ ...prev, [status]: sortedGames }));
            } catch (error) {
                console.error(
                    `[GamesContext] Error loading ${status} games:`,
                    error
                );
            } finally {
                setIsLoading((prev) => ({ ...prev, [status]: false }));
            }
        },
        [sortGames]
    );

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
        [gameData]
    );

    const handleNavigateAndScroll = useCallback(
        (status: GameStatus) => {
            if (onNavigateToStatus) {
                onNavigateToStatus(status);
            }
        },
        [onNavigateToStatus]
    );

    // Platform selection modal functions
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
                console.error("[GamesContext] Failed to remove item:", error);
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
        [gameData, getUpdateData, getStatusColor, loadGamesForStatus]
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
        [gameData, sortGames, loadGamesForStatus]
    );

    // Rating modal functions
    const showRatingModal = useCallback((gameId: number, gameName: string) => {
        setRatingModalGameId(gameId);
        setRatingModalGameName(gameName);
        setIsRatingModalVisible(true);
    }, []);

    const hideRatingModal = useCallback(() => {
        setIsRatingModalVisible(false);
        setRatingModalGameId(null);
        setRatingModalGameName("");
        pendingStatusChangeRef.current = null;
    }, []);

    const handleRatingConfirm = useCallback(async (rating: number) => {
        if (!pendingStatusChangeRef.current || !ratingModalGameId) {
            hideRatingModal();
            return;
        }

        const { id, newStatus, currentStatus } = pendingStatusChangeRef.current;

        try {
            await updateGameRating(ratingModalGameId, rating || 0);

            // Now proceed with the status change, passing the rating
            await performStatusChange(id, newStatus, currentStatus, rating || undefined);
        } catch (error) {
            console.error("[GamesContext] Error in rating confirmation:", error);
            showToast({
                type: "error",
                text1: "Update Failed",
                text2: "Failed to update game status. Please try again.",
                position: "bottom",
                visibilityTime: 3000,
            });
        } finally {
            hideRatingModal();
        }
    }, [ratingModalGameId, hideRatingModal]);

    // Extract the actual status change logic to a separate function
    const performStatusChange = useCallback(
        async (
            id: number,
            newStatus: GameStatus,
            currentStatus: GameStatus,
            newRating?: number
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
                        // Update the rating if provided
                        ...(newRating !== undefined && { personalRating: newRating }),
                    };

                    const updatedTargetGames = sortGames([
                        ...prev[newStatus],
                        movedGame,
                    ]);

                    // Show success toast
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
                            HapticFeedback.selection();
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
                            "[GamesContext] Background update failed:",
                            error
                        );
                        await loadGamesForStatus(currentStatus);
                        await loadGamesForStatus(newStatus);
                    }
                })();
            } catch (error) {
                console.error(
                    "[GamesContext] Failed to update game status:",
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
            getUpdateData,
            loadGamesForStatus,
            sortGames,
            handleNavigateAndScroll,
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
                        const selectedPlatformResult = await showPlatformSelectionModal(
                            game.platforms || []
                        );
                        if (selectedPlatformResult === null) {
                            // User cancelled platform selection
                            return;
                        }
                        selectedPlatform = selectedPlatformResult;
                    }

                    if (
                        selectedPlatform?.id ===
                        dbQuestGame.selectedPlatform?.id
                    ) {
                        // Same platform selected, only update status if needed

                        if (dbQuestGame.gameStatus !== newStatus) {
                            await performStatusChange(
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
                                    HapticFeedback.selection();
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
                        const selectedPlatformResult = await showPlatformSelectionModal(
                            game.platforms || []
                        );
                        if (selectedPlatformResult === null) {
                            // User cancelled platform selection
                            return;
                        }
                        selectedPlatform = selectedPlatformResult;
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
                                HapticFeedback.selection();
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
                console.error("[GamesContext] Error:", error);
                showToast({
                    type: "error",
                    text1: "Operation Failed",
                    text2: error instanceof Error ? error.message : "Unknown error",
                    position: "bottom",
                    visibilityTime: 3000,
                });
            }
        },
        [
            gameData,
            performStatusChange,
            showPlatformSelectionModal,
            loadGamesForStatus,
            handleNavigateAndScroll,
        ]
    );

    // Game operations
    const handleStatusChange = useCallback(
        async (
            id: number,
            newStatus: GameStatus,
            currentStatus: GameStatus
        ) => {
            // If moving to completed status, show rating modal first
            if (newStatus === "completed") {
                const gameToMove = gameData[currentStatus].find(
                    (game) => game.id === id
                );
                if (gameToMove) {
                    // Store the pending status change
                    pendingStatusChangeRef.current = {
                        id,
                        newStatus,
                        currentStatus,
                    };
                    showRatingModal(id, gameToMove.name);
                    return;
                }
            }

            // For all other status changes, proceed normally
            await performStatusChange(id, newStatus, currentStatus);
        },
        [
            gameData,
            performStatusChange,
            showRatingModal,
        ]
    );

    // Load initial data for main game statuses
    useEffect(() => {
        const loadInitialData = async () => {
            const statuses: GameStatus[] = ["ongoing", "backlog", "completed"];
            for (const status of statuses) {
                await loadGamesForStatus(status);
            }
        };
        loadInitialData();
    }, [loadGamesForStatus]);

    return (
        <>
            <GamesContext.Provider
                value={{
                    gameData,
                    isLoading,
                    loadGamesForStatus,
                    handleStatusChange,
                    handleRemoveItem,
                    handleDiscover,
                    handleReorder,
                    handleNavigateAndScroll,
                    showPlatformSelectionModal,
                    // Rating modal state
                    isRatingModalVisible,
                    ratingModalGameName,
                    ratingModalGameId,
                    showRatingModal,
                    hideRatingModal,
                }}
            >
                {children}
            </GamesContext.Provider>
            {platformModalComponent(
                isPlatformModalVisible,
                platformModalPlatforms,
                handlePlatformSelect,
                handlePlatformModalClose
            )}
            <RatingModal
                visible={isRatingModalVisible}
                onClose={hideRatingModal}
                onConfirm={handleRatingConfirm}
                gameName={ratingModalGameName}
            />
        </>
    );
};

export const useGames = () => {
    const context = useContext(GamesContext);
    if (context === null) {
        throw new Error("useGames must be used within a GamesProvider");
    }
    return context;
};
