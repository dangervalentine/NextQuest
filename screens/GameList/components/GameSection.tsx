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
import {
    getQuestGamesByStatus,
    updateGamePriorities,
    updateQuestGame,
} from "../../../data/db";
import { GameStatus } from "../../../constants/gameStatus";
import { colorSwatch } from "../../../utils/colorConstants";
import { QuestGame } from "../../../data/models/QuestGame";

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

    const getUpdateData = async (
        id: number,
        newStatus: GameStatus,
        currentStatus: GameStatus
    ) => {
        let updateData: any = { id, gameStatus: newStatus };

        if (newStatus === "inactive") {
            const inactiveGames = await getQuestGamesByStatus("inactive");
            const highestPriority = inactiveGames.reduce(
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

            // If moving out of inactive status, reorder remaining inactive games
            if (currentStatus === "inactive") {
                const inactiveGames = await getQuestGamesByStatus("inactive");
                const remainingGames = inactiveGames.filter(
                    (game) => game.id !== id
                );

                // Sort remaining games by priority
                const sortedGames = [...remainingGames].sort(
                    (a, b) =>
                        (a.priority || Infinity) - (b.priority || Infinity)
                );

                // Update priorities sequentially
                const priorityUpdates = sortedGames.map((game, index) => ({
                    id: game.id,
                    priority: index + 1,
                }));

                try {
                    await updateGamePriorities(priorityUpdates);
                    const dataWithNewPriorities = sortedGames.map(
                        (item, index) => ({
                            ...item,
                            priority: index + 1,
                        })
                    );
                    setData(dataWithNewPriorities);
                } catch (error) {
                    console.error(
                        "[GameSection] Failed to update inactive game priorities:",
                        error
                    );
                    await loadGames();
                }
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
                source={require("../../../assets/quest-logger.png")}
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
            source={require("../../../assets/quest-logger.png")}
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
            source={require("../../../assets/quest-logger.png")}
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
                ItemSeparatorComponent={() => <View style={styles.separator} />}
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
        borderRadius: 12,
        marginHorizontal: 4,
        shadowColor: colorSwatch.background.dark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 4,
        borderWidth: 1,
        borderColor: colorSwatch.neutral.darkGray,
        marginVertical: 8,
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
    separator: {},
    listContainer: {
        paddingVertical: 8,
    },
});

export default React.memo(GameSection);
