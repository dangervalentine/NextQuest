import React, {
    useCallback,
    useState,
    useMemo,
    useRef,
    useImperativeHandle,
    forwardRef,
} from "react";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import GameItem from "./GameItem";
import DragList, { DragListRenderItemInfo } from "react-native-draglist";
import Text from "../../../../components/common/Text";
import { GameStatus } from "src/constants/config/gameStatus";
import { MinimalQuestGame } from "src/data/models/MinimalQuestGame";
import { colorSwatch } from "src/utils/colorConstants";
import GameSearchInput from "./GameSearchInput";
import { getStatusColor } from "src/utils/colors";

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

export interface GameSectionRef {
    scrollToBottom: () => void;
    scrollToTop: () => void;
}

const GameSection = forwardRef<GameSectionRef, GameSectionProps>(
    (
        {
            gameStatus,
            games,
            isLoading,
            onStatusChange,
            onRemoveItem,
            onReorder,
        },
        ref
    ) => {
        const [searchQuery, setSearchQuery] = useState("");
        const dragListRef = useRef<any>(null);

        // Expose methods to parent components
        useImperativeHandle(ref, () => ({
            scrollToBottom: () => {
                if (dragListRef.current && filteredGames.length > 0) {
                    // Use setTimeout to ensure navigation is complete
                    setTimeout(() => {
                        // Safely access scrollToIndex with proper error handling
                        if (
                            typeof dragListRef.current.scrollToIndex ===
                            "function"
                        ) {
                            dragListRef.current.scrollToIndex({
                                index: filteredGames.length - 1,
                                animated: true,
                            });
                        }
                    }, 300);
                }
            },
            scrollToTop: () => {
                if (dragListRef.current && filteredGames.length > 0) {
                    setTimeout(() => {
                        // Safely access scrollToIndex with proper error handling
                        if (
                            typeof dragListRef.current.scrollToIndex ===
                            "function"
                        ) {
                            dragListRef.current.scrollToIndex({
                                index: 0,
                                animated: true,
                            });
                        }
                    }, 300);
                }
            },
        }));

        // Memoize filtered games to prevent unnecessary recalculations
        const filteredGames = useMemo(
            () =>
                games.filter((game) =>
                    game.name.toLowerCase().includes(searchQuery.toLowerCase())
                ),
            [games, searchQuery]
        );

        const handleMoveToTop = useCallback(
            (id: number, status: GameStatus) => {
                if (filteredGames.length <= 1) return;
                const currentIndex = filteredGames.findIndex(
                    (game) => game.id === id
                );
                if (currentIndex > 0) {
                    onReorder(currentIndex, 0, status);
                    // Scroll to top after reordering
                    setTimeout(() => {
                        if (
                            typeof dragListRef.current?.scrollToIndex ===
                            "function"
                        ) {
                            dragListRef.current.scrollToIndex({
                                index: 0,
                                animated: true,
                            });
                        }
                    }, 300);
                }
            },
            [filteredGames, onReorder, dragListRef]
        );

        const handleMoveToBottom = useCallback(
            (id: number, status: GameStatus) => {
                if (filteredGames.length <= 1) return;
                const currentIndex = filteredGames.findIndex(
                    (game) => game.id === id
                );
                if (currentIndex < filteredGames.length - 1) {
                    onReorder(currentIndex, filteredGames.length - 1, status);
                    // Scroll to bottom after reordering
                    setTimeout(() => {
                        if (
                            typeof dragListRef.current?.scrollToIndex ===
                            "function"
                        ) {
                            dragListRef.current.scrollToIndex({
                                index: filteredGames.length - 1,
                                animated: true,
                            });
                        }
                    }, 300);
                }
            },
            [filteredGames, onReorder, dragListRef]
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
                            isActive && styles.activeItem,
                            {
                                borderColor: getStatusColor(item.gameStatus),
                            },
                        ]}
                    >
                        <GameItem
                            questGame={item}
                            reorder={onDragStart}
                            removeItem={(id) => onRemoveItem(id, gameStatus)}
                            isFirstItem={index === 0}
                            onStatusChange={(newStatus, currentStatus) =>
                                onStatusChange(
                                    item.id,
                                    newStatus,
                                    currentStatus
                                )
                            }
                            moveToTop={(id, status) =>
                                handleMoveToTop(id, status)
                            }
                            moveToBottom={(id, status) =>
                                handleMoveToBottom(id, status)
                            }
                        />
                    </View>
                );
            },
            [
                gameStatus,
                onRemoveItem,
                onStatusChange,
                handleMoveToTop,
                handleMoveToBottom,
            ]
        );

        if (isLoading) {
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator
                        size="large"
                        color={getStatusColor(gameStatus)}
                    />
                </View>
            );
        }

        return games.length === 0 ? (
            <View style={styles.loadingContainer}>
                <Text variant="subtitle" style={styles.emptyText}>
                    No games found in this category
                </Text>
            </View>
        ) : (
            <View style={styles.contentContainer}>
                <GameSearchInput
                    gameStatus={gameStatus}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    onClear={() => setSearchQuery("")}
                />
                <View style={styles.listWrapper}>
                    <DragList
                        ref={dragListRef}
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
        );
    }
);

const styles = StyleSheet.create({
    pageContainer: {
        flex: 1,
    },
    contentContainer: {
        flex: 1,
    },
    activeItem: {
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colorSwatch.neutral.gray,
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
        backgroundColor: "transparent",
    },
    listContainer: {},
});

export default React.memo(GameSection);
