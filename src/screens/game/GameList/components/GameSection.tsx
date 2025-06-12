import React, {
    useCallback,
    useState,
    useMemo,
    useRef,
    useImperativeHandle,
    forwardRef,
} from "react";
import { StyleSheet, View } from "react-native";
import GameItem from "./GameItem";
import DragList, { DragListRenderItemInfo } from "react-native-draglist";
import Text from "../../../../components/common/Text";
import { GameStatus } from "src/constants/config/gameStatus";
import { MinimalQuestGame } from "src/data/models/MinimalQuestGame";
import { colorSwatch } from "src/constants/theme/colorConstants";
import GameSearchInput from "./GameSearchInput";
import { LoadingText } from "src/components/common/LoadingText";
import GameSortFilterMenu from "./GameSortFilterMenu";
import { SortField } from "src/types/sortTypes";

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
    sort: { field: SortField; direction: "asc" | "desc" };
    onSortChange: (sort: {
        field: SortField;
        direction: "asc" | "desc";
    }) => void;
    isMenuVisible: boolean;
    setMenuVisible: (visible: boolean) => void;
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
            sort,
            onSortChange,
            isMenuVisible,
            setMenuVisible,
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

        // Sort the filtered games
        const getReleaseYear = (game: MinimalQuestGame) => {
            if (!game.release_dates || game.release_dates.length === 0)
                return 0;
            // Use the earliest release date
            const minDate = Math.min(
                ...game.release_dates.map((rd) => rd.date)
            );
            if (!minDate || isNaN(minDate)) return 0;
            return new Date(minDate * 1000).getFullYear();
        };
        const sortedGames = useMemo(() => {
            const sorted = [...filteredGames];
            sorted.sort((a, b) => {
                let aValue: any;
                let bValue: any;
                switch (sort.field) {
                    case "priority":
                        aValue = a.priority ?? 0;
                        bValue = b.priority ?? 0;
                        break;
                    case "name":
                        aValue = a.name?.toLowerCase() || "";
                        bValue = b.name?.toLowerCase() || "";
                        break;
                    case "dateAdded":
                        aValue = a.createdAt || "";
                        bValue = b.createdAt || "";
                        break;
                    case "rating":
                        aValue = a.personalRating || 0;
                        bValue = b.personalRating || 0;
                        break;
                    case "releaseYear":
                        aValue = getReleaseYear(a);
                        bValue = getReleaseYear(b);
                        break;
                    default:
                        aValue = a.name?.toLowerCase() || "";
                        bValue = b.name?.toLowerCase() || "";
                        break;
                }
                if (aValue < bValue) return sort.direction === "asc" ? -1 : 1;
                if (aValue > bValue) return sort.direction === "asc" ? 1 : -1;
                return 0;
            });
            return sorted;
        }, [filteredGames, sort]);

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
                    <GameItem
                        questGame={item}
                        reorder={onDragStart}
                        removeItem={(id) => onRemoveItem(id, gameStatus)}
                        isFirstItem={index === 0}
                        onStatusChange={(newStatus, currentStatus) =>
                            onStatusChange(item.id, newStatus, currentStatus)
                        }
                        moveToTop={(id, status) => handleMoveToTop(id, status)}
                        moveToBottom={(id, status) =>
                            handleMoveToBottom(id, status)
                        }
                        isActive={isActive}
                        canReorder={
                            sort.field === "priority" &&
                            sort.direction === "asc"
                        }
                    />
                );
            },
            [
                gameStatus,
                onRemoveItem,
                onStatusChange,
                handleMoveToTop,
                handleMoveToBottom,
                sort,
            ]
        );

        if (isLoading) {
            return (
                <View style={styles.loadingContainer}>
                    <LoadingText text="Loading games..." />
                </View>
            );
        }

        return games.length === 0 ? (
            <View style={styles.loadingContainer}>
                <Text variant="subtitle" style={styles.emptyText}>
                    No games found.
                </Text>
            </View>
        ) : (
            <>
                <View style={styles.contentContainer}>
                    <GameSearchInput
                        gameStatus={gameStatus}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        onClear={() => setSearchQuery("")}
                        onMenuPress={() => setMenuVisible(true)}
                    />
                    <View style={styles.listWrapper}>
                        <DragList
                            ref={dragListRef}
                            data={sortedGames}
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
                <GameSortFilterMenu
                    visible={isMenuVisible}
                    onClose={() => setMenuVisible(false)}
                    sort={sort}
                    onSortChange={onSortChange}
                />
            </>
        );
    }
);

const styles = StyleSheet.create({
    pageContainer: {
        flex: 1,
    },
    contentContainer: {
        flex: 1,
        marginTop: 60,
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
