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
    games: QuestGame[];
    isLoading: boolean;
    onStatusChange: (
        id: number,
        newStatus: GameStatus,
        currentStatus: GameStatus
    ) => void;
    onRemoveItem: (id: number, status: GameStatus) => void;
    onReorder: (fromIndex: number, toIndex: number, status: GameStatus) => void;
}

const GameSection: React.FC<GameSectionProps> = ({
    gameStatus,
    games,
    isLoading,
    onStatusChange,
    onRemoveItem,
    onReorder,
}) => {
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
                        removeItem={(id) => onRemoveItem(id, gameStatus)}
                        isFirstItem={index === 0}
                        onStatusChange={(newStatus, currentStatus) =>
                            onStatusChange(item.id, newStatus, currentStatus)
                        }
                    />
                </View>
            );
        },
        [gameStatus, onRemoveItem, onStatusChange]
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

    return games.length === 0 ? (
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
                data={games}
                onReordered={(fromIndex, toIndex) =>
                    onReorder(fromIndex, toIndex, gameStatus)
                }
                keyExtractor={(item) => item?.id?.toString() || ""}
                renderItem={renderItem}
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
