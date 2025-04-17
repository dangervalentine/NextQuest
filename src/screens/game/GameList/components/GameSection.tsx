import React, { useCallback, useState, useMemo } from "react";
import {
    ImageBackground,
    StyleSheet,
    View,
    ActivityIndicator,
} from "react-native";
import GameItem from "./GameItem";
import DragList, { DragListRenderItemInfo } from "react-native-draglist";
import Text from "../../../../components/common/Text";
import { GameStatus } from "src/constants/config/gameStatus";
import { MinimalQuestGame } from "src/data/models/MinimalQuestGame";
import { colorSwatch } from "src/utils/colorConstants";
import GameSearchInput from "./GameSearchInput";

interface GameSectionProps {
    gameStatus: GameStatus;
    games: MinimalQuestGame[];
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
    const [searchQuery, setSearchQuery] = useState("");

    // Memoize filtered games to prevent unnecessary recalculations
    const filteredGames = useMemo(
        () =>
            games.filter((game) =>
                game.name.toLowerCase().includes(searchQuery.toLowerCase())
            ),
        [games, searchQuery]
    );

    const renderItem = useCallback(
        ({
            item,
            onDragStart,
            isActive,
            index,
        }: DragListRenderItemInfo<MinimalQuestGame>) => {
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
                source={require("../../../../assets/next_quest.png")}
                style={styles.pageContainer}
                resizeMode="contain"
            >
                <View style={styles.overlay} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator
                        size="large"
                        color={colorSwatch.accent.green}
                    />
                </View>
            </ImageBackground>
        );
    }

    return games.length === 0 ? (
        <ImageBackground
            source={require("../../../../assets/next_quest.png")}
            style={styles.pageContainer}
            resizeMode="contain"
        >
            <View style={styles.overlay} />
            <View style={styles.loadingContainer}>
                <Text variant="subtitle" style={styles.emptyText}>
                    No games found in this category
                </Text>
            </View>
        </ImageBackground>
    ) : (
        <ImageBackground
            source={require("../../../../assets/next_quest.png")}
            style={styles.pageContainer}
            resizeMode="contain"
        >
            <View style={styles.overlay} />
            <View style={styles.contentContainer}>
                <GameSearchInput
                    gameStatus={gameStatus}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    onClear={() => setSearchQuery("")}
                />
                <View style={styles.listWrapper}>
                    <DragList
                        data={filteredGames}
                        onReordered={(fromIndex, toIndex) =>
                            onReorder(fromIndex, toIndex, gameStatus)
                        }
                        keyExtractor={(item) => item?.id?.toString() || ""}
                        renderItem={renderItem}
                        contentContainerStyle={styles.listContainer}
                        removeClippedSubviews={true}
                    />
                </View>
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    pageContainer: {
        flex: 1,
    },
    contentContainer: {
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
    listWrapper: {
        flex: 1,
    },
    listContainer: {},
});

export default React.memo(GameSection);
