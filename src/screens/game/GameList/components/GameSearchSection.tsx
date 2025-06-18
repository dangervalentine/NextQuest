import React, { useCallback, useState, useEffect, useRef } from "react";
import {
    ScrollView,
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
    handleDiscover: (game: MinimalQuestGame, newStatus: GameStatus) => void;
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
    handleDiscover,
}) => {
    const route = useRoute<SearchTabRouteProp>();
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<MinimalQuestGame[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [searchContext, setSearchContext] = useState<string>("popular");
    const initialLoadRef = useRef(true);

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
        }, 300); // Add 300ms debounce

        return () => clearTimeout(timeoutId);
    }, [searchQuery, executeSearch]);

    const handleSearchChange = (text: string) => {
        setSearchQuery(text);
    };

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
                <ScrollView
                    style={styles.scrollContainer}
                    contentContainerStyle={styles.listContainer}
                >
                    {searchResults.map((game, index) =>
                        renderItem(game, index)
                    )}
                </ScrollView>
            )}
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
    scrollContainer: {
        flex: 1,
        width: "100%",
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
