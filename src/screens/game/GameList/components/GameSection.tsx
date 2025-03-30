import React, { useCallback, useState, useMemo } from "react";
import {
    ImageBackground,
    StyleSheet,
    View,
    ActivityIndicator,
    TextInput,
    TouchableOpacity,
} from "react-native";
import GameItem from "./GameItem";
import DragList, { DragListRenderItemInfo } from "react-native-draglist";
import Text from "../../../../components/common/Text";
import { GameStatus } from "src/constants/config/gameStatus";
import { MinimalQuestGame } from "src/data/models/MinimalQuestGame";
import { colorSwatch } from "src/utils/colorConstants";
import QuestIcon from "../../shared/GameIcon";
import { getStatusStyles } from "src/utils/gameStatusUtils";

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
                        color={colorSwatch.accent.cyan}
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
                <View style={styles.searchContainer}>
                    <View
                        style={[
                            styles.searchInputContainer,
                            getStatusStyles(gameStatus),
                        ]}
                    >
                        <TextInput
                            style={[styles.searchInput]}
                            placeholder="Search games..."
                            placeholderTextColor={colorSwatch.text.secondary}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity
                                style={styles.clearButton}
                                onPress={() => setSearchQuery("")}
                            >
                                <QuestIcon
                                    name="close-circle"
                                    size={24}
                                    color={getStatusStyles(gameStatus).color}
                                />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
                <DragList
                    data={filteredGames}
                    onReordered={(fromIndex, toIndex) =>
                        onReorder(fromIndex, toIndex, gameStatus)
                    }
                    keyExtractor={(item) => item?.id?.toString() || ""}
                    renderItem={renderItem}
                    ListEmptyComponent={() => (
                        <View style={styles.loadingContainer}>
                            <Text variant="subtitle" style={styles.emptyText}>
                                {searchQuery
                                    ? "No games found matching your search"
                                    : "No games available"}
                            </Text>
                        </View>
                    )}
                    contentContainerStyle={styles.listContainer}
                    removeClippedSubviews={true}
                />
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
        width: "100%",
        justifyContent: "flex-start",
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
        borderWidth: 0,
    },
    listContainer: {
        paddingVertical: 8,
    },
    searchContainer: {
        width: "100%",
        backgroundColor: colorSwatch.background.darker,
        borderBottomWidth: 1,
        borderBottomColor: colorSwatch.neutral.darkGray,
        zIndex: 1,
    },
    searchInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colorSwatch.background.dark,
    },
    searchInput: {
        flex: 1,
        paddingHorizontal: 12,
        color: colorSwatch.text.primary,
        fontSize: 24,
    },
    clearButton: {
        padding: 8,
        paddingHorizontal: 12,
        borderWidth: 0,
        borderRadius: 0,
    },
});

export default React.memo(GameSection);
