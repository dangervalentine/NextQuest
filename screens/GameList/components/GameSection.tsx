import React, { useState, useCallback, useEffect } from "react";
import {
    ImageBackground,
    StyleSheet,
    View,
    ActivityIndicator,
    Text,
} from "react-native";
import GameItem from "./GameItem";
import DragList, { DragListRenderItemInfo } from "react-native-draglist";

import { GameStatus } from "../../../constants/gameStatus";
import { colorSwatch } from "../../../utils/colorConstants";
import { QuestGame } from "../../../data/models/QuestGame";
import {
    getQuestGamesByStatus,
    updateGamePriorities,
    updateQuestGame,
} from "../../../data/repositories/questGames";

interface GameSectionProps {
    gameStatus: GameStatus;
    onStatusChange?: (newStatus: GameStatus) => void;
}

const GameSection: React.FC<GameSectionProps> = ({
    gameStatus,
    onStatusChange,
}) => {
    const [data, setData] = useState<QuestGame[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadGames();
    }, [gameStatus]);

    const loadGames = async () => {
        try {
            setIsLoading(true);
            const games = await getQuestGamesByStatus(gameStatus);

            const sortedGames = [...games].sort(
                (a, b) => (a.priority || Infinity) - (b.priority || Infinity)
            );

            setData(sortedGames);
        } catch (error) {
            console.error("[GameSection] Error loading games:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const removeItem = async (itemId: number, status: GameStatus) => {
        const updateData = await getUpdateData(itemId, status, gameStatus);
        await updateQuestGame(updateData);
        setData((currentData) =>
            currentData.filter((game) => game.id !== itemId)
        );
    };

    const getUpdateData = async (
        id: number,
        newStatus: GameStatus,
        currentStatus: GameStatus
    ) => {
        let updateData: any = { id, gameStatus: newStatus };

        if (newStatus === "backlog") {
            const backlogGames = await getQuestGamesByStatus("backlog");
            const highestPriority = backlogGames.reduce(
                (max, game) => Math.max(max, game.priority || 0),
                0
            );
            const newPriority = highestPriority + 1;

            updateData = {
                ...updateData,
                priority: newPriority,
                notes: undefined,
            };
        } else {
            updateData = {
                ...updateData,
                priority: undefined,
            };

            // If moving out of backlog status, reorder remaining backlog games
            if (currentStatus === "backlog") {
                // Get current data and update it immediately with new priorities
                setData((currentData) => {
                    const remainingGames = currentData.filter(
                        (game) => game.id !== id
                    );
                    // Update priorities immediately in the UI
                    return remainingGames.map((game, index) => ({
                        ...game,
                        priority: index + 1,
                    }));
                });

                // Handle priority reordering in the background
                (async () => {
                    try {
                        const backlogGames = await getQuestGamesByStatus(
                            "backlog"
                        );
                        const remainingGames = backlogGames.filter(
                            (game) => game.id !== id
                        );

                        // Sort remaining games by priority
                        const sortedGames = remainingGames.sort(
                            (a, b) =>
                                (a.priority || Infinity) -
                                (b.priority || Infinity)
                        );

                        // Update priorities sequentially
                        const priorityUpdates = sortedGames.map(
                            (game, index) => ({
                                id: game.id,
                                priority: index + 1,
                            })
                        );

                        // Batch update priorities
                        await updateGamePriorities(priorityUpdates);
                    } catch (error) {
                        console.error(
                            "[GameSection] Failed to update backlog game priorities:",
                            error
                        );
                        await loadGames();
                    }
                })();
            }
        }

        return updateData;
    };

    const onReordered = useCallback(
        async (fromIndex: number, toIndex: number) => {
            if (!data.length) return;

            const updatedData = [...data];
            const [removed] = updatedData.splice(fromIndex, 1);
            updatedData.splice(toIndex, 0, removed);

            const priorityUpdates = updatedData.map((item, index) => ({
                id: item.id,
                priority: index + 1,
            }));

            try {
                await updateGamePriorities(priorityUpdates);
                const dataWithNewPriorities = updatedData.map(
                    (item, index) => ({
                        ...item,
                        priority: index + 1,
                    })
                );
                setData(dataWithNewPriorities);
            } catch (error) {
                console.error("Failed to update priorities:", error);
                await loadGames();
            }
        },
        [data]
    );

    const handleStatusChange = async (
        id: number,
        newStatus: GameStatus,
        currentStatus: GameStatus
    ) => {
        try {
            const updateData = await getUpdateData(
                id,
                newStatus,
                currentStatus
            );
            await updateQuestGame(updateData);

            // Remove from current section's data
            setData((currentData) =>
                currentData.filter((game) => game.id !== id)
            );

            // Notify parent to refresh only the target tab
            if (onStatusChange) {
                onStatusChange(newStatus);
            }
        } catch (error) {
            console.error("[GameSection] Failed to update game status:", error);
            await loadGames();
        }
    };

    const renderItem = useCallback(
        ({
            item,
            onDragStart,
            isActive,
            index,
        }: DragListRenderItemInfo<QuestGame>) => {
            if (!item) return null;

            return (
                <View
                    style={[
                        styles.itemContainer,
                        isActive && styles.activeItem,
                    ]}
                >
                    <GameItem
                        questGame={item}
                        reorder={onDragStart}
                        removeItem={removeItem}
                        isFirstItem={index === 0}
                        onStatusChange={(newStatus, currentStatus) =>
                            handleStatusChange(
                                item.id,
                                newStatus,
                                currentStatus
                            )
                        }
                    />
                </View>
            );
        },
        []
    );

    if (isLoading) {
        return (
            <ImageBackground
                source={require("../../../assets/dygat.png")}
                style={styles.pageContainer}
                resizeMode="contain"
            >
                <View style={styles.overlay} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator
                        size="large"
                        color={colorSwatch.accent.cyan}
                    />
                </View>
            </ImageBackground>
        );
    }

    return data.length === 0 ? (
        <ImageBackground
            source={require("../../../assets/dygat.png")}
            style={styles.pageContainer}
            resizeMode="contain"
        >
            <View style={styles.overlay} />
            <View style={styles.loadingContainer}>
                <Text style={styles.emptyText}>
                    No games found in this category
                </Text>
            </View>
        </ImageBackground>
    ) : (
        <ImageBackground
            source={require("../../../assets/dygat.png")}
            style={styles.pageContainer}
            resizeMode="contain"
        >
            <View style={styles.overlay} />
            <DragList
                data={data}
                onReordered={onReordered}
                keyExtractor={(item) => {
                    if (!item || !item.id) {
                        console.warn("Invalid item in keyExtractor:", item);
                        return "";
                    }
                    return item.id.toString();
                }}
                renderItem={(props) => {
                    if (!props.item) {
                        console.warn("Invalid item in renderItem:", props);
                        return null;
                    }
                    return renderItem(props);
                }}
                ListEmptyComponent={() => (
                    <View style={styles.loadingContainer}>
                        <Text style={styles.emptyText}>No games available</Text>
                    </View>
                )}
                contentContainerStyle={styles.listContainer}
                removeClippedSubviews={true}
            />
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    pageContainer: {
        flex: 1,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: colorSwatch.background.darker,
        opacity: 0.99,
    },
    itemContainer: {
        // Keeping only styles that might be needed for active state
    },
    activeItem: {
        opacity: 0.7,
        backgroundColor: colorSwatch.background.darker,
        borderWidth: 2,
        borderColor: colorSwatch.accent.cyan,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    emptyText: {
        color: colorSwatch.text.secondary,
        fontSize: 16,
        textAlign: "center",
        fontStyle: "italic",
        lineHeight: 24,
    },
    listContainer: {
        paddingVertical: 8,
    },
});

export default React.memo(GameSection);
