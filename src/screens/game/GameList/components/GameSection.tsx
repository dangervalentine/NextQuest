import React, {
    useCallback,
    useState,
    useMemo,
    useRef,
    useImperativeHandle,
    forwardRef,
} from "react";
import { StyleSheet, View, FlatList, Dimensions } from "react-native";
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
import { useGames } from "src/contexts/GamesContext";
import ScrollProgressTrack, { useAnimatedScrollPosition } from "../../../../components/common/ScrollProgressTrack";

interface GameSectionProps {
    gameStatus: GameStatus;
    games: MinimalQuestGame[];
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
            sort,
            onSortChange,
            isMenuVisible,
            setMenuVisible,
        },
        ref
    ) => {
        const { handleReorder, isLoading } = useGames();
        const [searchQuery, setSearchQuery] = useState("");
        const dragListRef = useRef<any>(null);

        // Smooth animated scroll tracking
        const { createScrollHandler, getNormalizedScrollPosition, rawScrollValue, setScrollValue } = useAnimatedScrollPosition();

        // Scroll tracking state
        const [containerHeight, setContainerHeight] = useState(0);
        const [contentHeight, setContentHeight] = useState(0);
        const [isScrollTrackVisible, setIsScrollTrackVisible] = useState(false);
        const scrollOffsetRef = useRef(0);

        // Auto-hide functionality
        const [isTrackAutoHidden, setIsTrackAutoHidden] = useState(true);
        const autoHideTimer = useRef<NodeJS.Timeout | null>(null);

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

        // Check if drag functionality is needed
        const canReorder = sort.field === "priority" && sort.direction === "asc";

        // Auto-hide timer functions
        const startAutoHideTimer = useCallback(() => {
            // Clear existing timer
            if (autoHideTimer.current) {
                clearTimeout(autoHideTimer.current);
            }

            // Show track if hidden
            if (isTrackAutoHidden) {
                setIsTrackAutoHidden(false);
            }

            // Start new timer (2 seconds)
            autoHideTimer.current = setTimeout(() => {
                setIsTrackAutoHidden(true);
            }, 2000);
        }, [isTrackAutoHidden]);

        const clearAutoHideTimer = useCallback(() => {
            if (autoHideTimer.current) {
                clearTimeout(autoHideTimer.current);
                autoHideTimer.current = null;
            }
        }, []);

        // Initialize scroll position when games change
        React.useEffect(() => {
            scrollOffsetRef.current = 0;
            setIsScrollTrackVisible(false);
            setIsTrackAutoHidden(true); // Keep track hidden when new games load
            clearAutoHideTimer();
        }, [sortedGames, clearAutoHideTimer]);

        // Cleanup timer on unmount
        React.useEffect(() => {
            return () => {
                if (autoHideTimer.current) {
                    clearTimeout(autoHideTimer.current);
                }
            };
        }, []);

        // Computed visibility: both conditions must be true
        const isTrackCurrentlyVisible = isScrollTrackVisible && !isTrackAutoHidden;

        // Create smooth animated scroll handler
        const animatedScrollHandler = useMemo(() => {
            return createScrollHandler(contentHeight, containerHeight);
        }, [createScrollHandler, contentHeight, containerHeight]);

        // Scroll tracking handlers for visibility and layout
        const handleScrollForVisibility = useCallback((event: any) => {
            if (!event?.nativeEvent) return;

            const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
            const currentOffset = Math.max(0, contentOffset?.y || 0);
            const containerHeight = layoutMeasurement?.height || 0;
            const totalContentHeight = contentSize?.height || 0;
            const maxOffset = Math.max(0, totalContentHeight - containerHeight);

            scrollOffsetRef.current = currentOffset;
            setContentHeight(totalContentHeight);
            setContainerHeight(containerHeight);

            // Show track when content is scrollable
            const shouldShowTrack = maxOffset > 20;
            setIsScrollTrackVisible(shouldShowTrack);

            // Start auto-hide timer when scrolling
            if (shouldShowTrack) {
                startAutoHideTimer();
            } else {
                clearAutoHideTimer();
                setIsTrackAutoHidden(false);
            }
        }, [startAutoHideTimer, clearAutoHideTimer]);

        // Combined scroll handler
        const handleScroll = useCallback((event: any) => {
            animatedScrollHandler(event);
            handleScrollForVisibility(event);
        }, [animatedScrollHandler, handleScrollForVisibility]);

        const handleScrollToPosition = useCallback((position: number) => {
            if (!dragListRef.current) return;

            // Reset auto-hide timer on user interaction
            startAutoHideTimer();

            // Calculate the offset based on position
            const maxOffset = Math.max(0, contentHeight - containerHeight);
            const targetOffset = position * maxOffset;

            // Sync the animated value immediately to prevent double-tap issue
            setScrollValue(targetOffset);

            // Try different scroll methods based on component type
            if (canReorder) {
                // DragList - try multiple methods
                if (dragListRef.current.scrollToOffset) {
                    dragListRef.current.scrollToOffset({
                        offset: targetOffset,
                        animated: true,
                    });
                } else if (dragListRef.current.getScrollResponder) {
                    const scrollResponder = dragListRef.current.getScrollResponder();
                    if (scrollResponder?.scrollTo) {
                        scrollResponder.scrollTo({
                            y: targetOffset,
                            animated: true,
                        });
                    }
                } else if (dragListRef.current._listRef?.scrollToOffset) {
                    // Try accessing underlying FlatList
                    dragListRef.current._listRef.scrollToOffset({
                        offset: targetOffset,
                        animated: true,
                    });
                }
            } else {
                // FlatList - standard method
                if (dragListRef.current.scrollToOffset) {
                    dragListRef.current.scrollToOffset({
                        offset: targetOffset,
                        animated: true,
                    });
                }
            }
        }, [contentHeight, containerHeight, canReorder, startAutoHideTimer, setScrollValue]);

        const handleContainerLayout = useCallback((event: any) => {
            const { height } = event.nativeEvent.layout;
            setContainerHeight(height);

            // Check if we need to show the scroll track
            if (contentHeight > 0 && height > 0) {
                const maxOffset = Math.max(0, contentHeight - height);
                setIsScrollTrackVisible(maxOffset > 20);
            }
        }, [contentHeight]);

        const handleContentSizeChange = useCallback((width: number, height: number) => {
            setContentHeight(height);

            // Check if we need to show the scroll track
            if (containerHeight > 0 && height > 0) {
                const maxOffset = Math.max(0, height - containerHeight);
                setIsScrollTrackVisible(maxOffset > 20);
            }
        }, [containerHeight]);

        const handleMoveToTop = useCallback(
            (id: number, status: GameStatus) => {
                if (filteredGames.length <= 1) return;
                const currentIndex = filteredGames.findIndex(
                    (game) => game.id === id
                );
                if (currentIndex > 0) {
                    handleReorder(currentIndex, 0, status);
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
            [filteredGames, handleReorder, dragListRef]
        );

        const handleMoveToBottom = useCallback(
            (id: number, status: GameStatus) => {
                if (filteredGames.length <= 1) return;
                const currentIndex = filteredGames.findIndex(
                    (game) => game.id === id
                );
                if (currentIndex < filteredGames.length - 1) {
                    handleReorder(currentIndex, filteredGames.length - 1, status);
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
            [filteredGames, handleReorder, dragListRef]
        );

        const renderDragItem = useCallback(
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
                        isFirstItem={index === 0}
                        moveToTop={(id, status) => handleMoveToTop(id, status)}
                        moveToBottom={(id, status) =>
                            handleMoveToBottom(id, status)
                        }
                        isActive={isActive}
                        canReorder={canReorder}
                    />
                );
            },
            [
                gameStatus,
                handleMoveToTop,
                handleMoveToBottom,
                canReorder,
            ]
        );

        const renderFlatListItem = useCallback(
            ({ item, index }: { item: MinimalQuestGame; index: number }) => {
                if (!item) return null;

                return (
                    <GameItem
                        questGame={item}
                        reorder={() => { }} // No-op for FlatList
                        isFirstItem={index === 0}
                        moveToTop={(id, status) => handleMoveToTop(id, status)}
                        moveToBottom={(id, status) =>
                            handleMoveToBottom(id, status)
                        }
                        isActive={false}
                        canReorder={false}
                    />
                );
            },
            [
                gameStatus,
                handleMoveToTop,
                handleMoveToBottom,
            ]
        );

        if (isLoading[gameStatus]) {
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
                    <View style={styles.listWrapper} onLayout={handleContainerLayout}>
                        {canReorder ? (
                            <DragList
                                ref={dragListRef}
                                data={sortedGames}
                                onReordered={(fromIndex, toIndex) =>
                                    handleReorder(fromIndex, toIndex, gameStatus)
                                }
                                keyExtractor={(item) => item?.id?.toString() || ""}
                                renderItem={renderDragItem}
                                contentContainerStyle={styles.listContainer}
                                removeClippedSubviews={true}
                                getItemLayout={(data, index) => ({
                                    length: 128,
                                    offset: 128 * index,
                                    index,
                                })}
                                onScroll={handleScroll}
                                scrollEventThrottle={8} // 120fps for ultra-smooth tracking
                                showsVerticalScrollIndicator={false}
                                onContentSizeChange={handleContentSizeChange}
                                onScrollToIndexFailed={(info) => {
                                    console.warn('ScrollToIndex failed:', info);
                                    const wait = new Promise(resolve => setTimeout(resolve, 500));
                                    wait.then(() => {
                                        if (dragListRef.current) {
                                            dragListRef.current.scrollToIndex({
                                                index: Math.min(info.index, info.highestMeasuredFrameIndex),
                                                animated: true,
                                            });
                                        }
                                    });
                                }}
                            />
                        ) : (
                            <FlatList
                                ref={dragListRef}
                                data={sortedGames}
                                keyExtractor={(item) => item?.id?.toString() || ""}
                                renderItem={renderFlatListItem}
                                contentContainerStyle={styles.listContainer}
                                removeClippedSubviews={true}
                                getItemLayout={(data, index) => ({
                                    length: 128,
                                    offset: 128 * index,
                                    index,
                                })}
                                onScroll={handleScroll}
                                scrollEventThrottle={8} // 120fps for ultra-smooth tracking
                                showsVerticalScrollIndicator={false}
                                onContentSizeChange={handleContentSizeChange}
                                onScrollToIndexFailed={(info) => {
                                    console.warn('ScrollToIndex failed:', info);
                                    const wait = new Promise(resolve => setTimeout(resolve, 500));
                                    wait.then(() => {
                                        if (dragListRef.current) {
                                            dragListRef.current.scrollToIndex({
                                                index: Math.min(info.index, info.highestMeasuredFrameIndex),
                                                animated: true,
                                            });
                                        }
                                    });
                                }}
                            />
                        )}
                    </View>

                    {/* Scroll Progress Track */}
                    <ScrollProgressTrack
                        scrollPosition={0} // Fallback for non-animated usage
                        onScrollToPosition={handleScrollToPosition}
                        contentHeight={contentHeight}
                        containerHeight={containerHeight}
                        visible={isTrackCurrentlyVisible}
                        animatedScrollPosition={rawScrollValue}
                    />
                </View>
                <GameSearchInput
                    gameStatus={gameStatus}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    onClear={() => setSearchQuery("")}
                    onMenuPress={() => setMenuVisible(true)}
                />
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
        marginTop: 4,
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
