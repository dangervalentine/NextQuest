import React, { useCallback, useState, useEffect, useRef } from "react";
import {
    FlatList,
    View,
    StyleSheet,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import GameItem from "./GameItem";
import { GameStatus } from "src/constants/config/gameStatus";
import { MinimalQuestGame } from "src/data/models/MinimalQuestGame";
import IGDBService from "src/services/api/IGDBService";
import { SearchTabRouteProp } from "src/navigation/navigationTypes";
import { colorSwatch } from "src/constants/theme/colorConstants";
import GameSearchInput from "./GameSearchInput";
import Text from "src/components/common/Text";
import { LoadingText } from "src/components/common/LoadingText";
import { useGames } from "src/contexts/GamesContext";
import ScrollProgressTrack from "../../../../components/common/ScrollProgressTrack";

interface SearchParams {
    searchQuery?: string;
    franchiseId?: number;
    platformId?: number;
    genreId?: number;
    themeId?: number;
    companyId?: number;
}

interface GameSearchSectionProps {
    gameStatus: GameStatus;
    games: MinimalQuestGame[];
}

// Memoize the individual game item wrapper
const GameItemWrapper = React.memo(
    ({
        game,
        index,
        handleDiscover,
    }: {
        game: MinimalQuestGame;
        index: number;
        handleDiscover: (
            game: MinimalQuestGame,
            gameStatus: GameStatus
        ) => void;
    }) => (
        <View style={styles.itemContainer}>
            <GameItem
                questGame={game}
                isFirstItem={index === 0}
                onStatusChange={(newStatus) => handleDiscover(game, newStatus)}
            />
        </View>
    ),
    (prev, next) => {
        return (
            prev.game.id === next.game.id &&
            prev.game.gameStatus === next.game.gameStatus &&
            prev.index === next.index
        );
    }
);

const GameSearchSection: React.FC<GameSearchSectionProps> = ({
    gameStatus,
}) => {
    const { handleDiscover } = useGames();
    const route = useRoute<SearchTabRouteProp>();
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<MinimalQuestGame[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [searchContext, setSearchContext] = useState<string>("popular");
    const initialLoadRef = useRef(true);
    const flatListRef = useRef<FlatList>(null);

    // Scroll tracking state
    const [scrollPosition, setScrollPosition] = useState(0);
    const [containerHeight, setContainerHeight] = useState(0);
    const [contentHeight, setContentHeight] = useState(0);
    const [isScrollTrackVisible, setIsScrollTrackVisible] = useState(false);
    const scrollOffsetRef = useRef(0);

    // Auto-hide functionality
    const [isTrackAutoHidden, setIsTrackAutoHidden] = useState(false);
    const autoHideTimer = useRef<NodeJS.Timeout | null>(null);

    const executeSearch = useCallback(
        async (params: SearchParams | undefined, query: string = "") => {
            setError(null);
            setIsSearching(true);
            setSearchResults([]);

            try {
                let results: MinimalQuestGame[] = [];
                const isActiveSearch = query.length > 0;

                // Handle initial load differently from subsequent searches
                if (initialLoadRef.current) {
                    if (params?.franchiseId) {
                        setSearchContext("franchise");
                        results = await IGDBService.searchGamesByFranchise(
                            params.franchiseId
                        );
                    } else if (params?.platformId) {
                        setSearchContext("platform");
                        results = await IGDBService.searchGamesByPlatform(
                            params.platformId
                        );
                    } else if (params?.genreId) {
                        setSearchContext("genre");
                        results = await IGDBService.searchGamesByGenre(
                            params.genreId
                        );
                    } else if (params?.themeId) {
                        setSearchContext("theme");
                        results = await IGDBService.searchGamesByTheme(
                            params.themeId
                        );
                    } else if (params?.companyId) {
                        setSearchContext("company");
                        results = await IGDBService.searchGamesByCompany(
                            params.companyId
                        );
                    } else {
                        setSearchContext("popular");
                        results = await IGDBService.getPopularGames();
                    }
                    initialLoadRef.current = false;
                } else {
                    // For all subsequent searches, only use search or popular context
                    if (isActiveSearch) {
                        setSearchContext("search");
                        results = await IGDBService.searchGames(query);
                    } else {
                        setSearchContext("popular");
                        results = await IGDBService.getPopularGames();
                    }
                }

                setSearchResults(results);
            } catch (err) {
                const errorMsg = `Failed to load ${searchContext} games. Please try again.`;
                console.error(
                    `[Search] Error during ${searchContext} search:`,
                    err
                );
                setError(errorMsg);
            } finally {
                setIsSearching(false);
            }
        },
        [] // Remove searchContext from dependencies as it's only used for error messages
    );

    // Handle route parameter changes
    useEffect(() => {
        initialLoadRef.current = true;
        const params = route.params as SearchParams;
        executeSearch(params, "");
    }, [route.params, executeSearch]); // Remove searchQuery dependency

    // Handle search query changes with debounce
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (!initialLoadRef.current) {
                executeSearch(undefined, searchQuery);
            }
        }, 800); // Add 300ms debounce

        return () => clearTimeout(timeoutId);
    }, [searchQuery, executeSearch]);

    const handleSearchChange = (text: string) => {
        setSearchQuery(text);
    };

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
        }, 1500);
    }, [isTrackAutoHidden]);

    const clearAutoHideTimer = useCallback(() => {
        if (autoHideTimer.current) {
            clearTimeout(autoHideTimer.current);
            autoHideTimer.current = null;
        }
    }, []);

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (autoHideTimer.current) {
                clearTimeout(autoHideTimer.current);
            }
        };
    }, []);

    // Computed visibility: both conditions must be true
    const isTrackCurrentlyVisible = isScrollTrackVisible && !isTrackAutoHidden;

    // Scroll tracking handlers
    const handleScroll = useCallback((event: any) => {
        if (!event?.nativeEvent) return;

        const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
        const currentOffset = Math.max(0, contentOffset?.y || 0);
        const containerHeight = layoutMeasurement?.height || 0;
        const totalContentHeight = contentSize?.height || 0;
        const maxOffset = Math.max(0, totalContentHeight - containerHeight);

        scrollOffsetRef.current = currentOffset;
        setContentHeight(totalContentHeight);
        setContainerHeight(containerHeight);

        // Calculate scroll position (0 to 1)
        let position = 0;
        if (maxOffset > 0) {
            position = currentOffset / maxOffset;
        }
        const clampedPosition = Math.max(0, Math.min(1, position));

        setScrollPosition(clampedPosition);

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

    const handleScrollToPosition = useCallback((position: number) => {
        if (!flatListRef.current) return;

        // Reset auto-hide timer on user interaction
        startAutoHideTimer();

        // Calculate the offset based on position
        const maxOffset = Math.max(0, contentHeight - containerHeight);
        const targetOffset = position * maxOffset;

        // FlatList scroll method
        flatListRef.current.scrollToOffset({
            offset: targetOffset,
            animated: true,
        });
    }, [contentHeight, containerHeight, startAutoHideTimer]);

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

    // Initialize scroll position when search results change
    useEffect(() => {
        setScrollPosition(0);
        scrollOffsetRef.current = 0;
        setIsScrollTrackVisible(false);
        setIsTrackAutoHidden(false);
        clearAutoHideTimer();
    }, [searchResults, clearAutoHideTimer]);

    const getLoadingMessage = () => {
        switch (searchContext) {
            case "franchise":
                return "Loading franchise games...";
            case "platform":
                return "Loading platform games...";
            case "genre":
                return "Loading genre games...";
            case "theme":
                return "Loading games by theme...";
            case "company":
                return "Loading games by company...";
            case "search":
                return `Searching for "${searchQuery}"...`;
            default:
                return "Loading popular games...";
        }
    };

    const getEmptyMessage = () => {
        switch (searchContext) {
            case "franchise":
                return "No games found in this franchise";
            case "platform":
                return "No games found for this platform";
            case "genre":
                return "No games found in this genre";
            case "theme":
                return "No games found with this theme";
            case "company":
                return "No games found from this company";
            case "search":
                return "No games found matching your search";
            default:
                return "No popular games found";
        }
    };

    // Memoize the render function
    const renderItem = useCallback(
        (item: MinimalQuestGame, index: number) => {
            if (!item) {
                return null;
            }

            return (
                <GameItemWrapper
                    key={item.id}
                    game={item}
                    index={index}
                    handleDiscover={handleDiscover}
                />
            );
        },
        [handleDiscover]
    );

    return (
        <View style={styles.contentContainer}>
            <View style={styles.scrollWrapper} onLayout={handleContainerLayout}>
                {error ? (
                    <View style={styles.loadingContainer}>
                        <Text variant="subtitle" style={styles.errorText}>
                            {error}
                        </Text>
                    </View>
                ) : isSearching ? (
                    <View style={styles.loadingContainer}>
                        <LoadingText text={getLoadingMessage()} />
                    </View>
                ) : searchResults.length === 0 ? (
                    <View style={styles.loadingContainer}>
                        <Text variant="subtitle" style={styles.emptyText}>
                            {getEmptyMessage()}
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        ref={flatListRef}
                        data={searchResults}
                        style={[
                            styles.scrollContainer,
                            isTrackCurrentlyVisible ? { marginRight: 16 } : {}
                        ]}
                        contentContainerStyle={styles.listContainer}
                        keyExtractor={(item) => item?.id?.toString() || ""}
                        renderItem={({ item, index }) => renderItem(item, index)}
                        onScroll={handleScroll}
                        // scrollEventThrottle={16}
                        showsVerticalScrollIndicator={false}
                        onContentSizeChange={handleContentSizeChange}
                        removeClippedSubviews={true}
                        getItemLayout={(data, index) => ({
                            length: 128, // Same as GameSection
                            offset: 128 * index,
                            index,
                        })}
                        onScrollToIndexFailed={(info) => {
                            console.warn('ScrollToIndex failed:', info);
                            const wait = new Promise(resolve => setTimeout(resolve, 500));
                            wait.then(() => {
                                if (flatListRef.current) {
                                    flatListRef.current.scrollToIndex({
                                        index: Math.min(info.index, info.highestMeasuredFrameIndex),
                                        animated: true,
                                    });
                                }
                            });
                        }}
                    />
                )}

                {/* Scroll Progress Track */}
                <ScrollProgressTrack
                    scrollPosition={scrollPosition}
                    onScrollToPosition={handleScrollToPosition}
                    contentHeight={contentHeight}
                    containerHeight={containerHeight}
                    visible={isTrackCurrentlyVisible}
                />
            </View>
            <GameSearchInput
                gameStatus={gameStatus}
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
                onClear={() => setSearchQuery("")}
                placeholder="Discover new games..."
                onMenuPress={() => console.log("Menu pressed")}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    pageContainer: {
        flex: 1,
    },
    contentContainer: {
        flex: 1,
        width: "100%",
        marginTop: 4,
        justifyContent: "flex-start",
    },
    scrollWrapper: {
        flex: 1,
    },
    scrollContainer: {
        flex: 1,
    },
    listContainer: {
        paddingBottom: 0,
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
    itemContainer: {},
    errorText: {
        color: colorSwatch.text.secondary,
        fontSize: 16,
        textAlign: "center",
        fontStyle: "italic",
        lineHeight: 24,
    },
});

export default GameSearchSection;
