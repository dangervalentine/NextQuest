import React, { useCallback, useState, useEffect } from "react";
import {
    ImageBackground,
    StyleSheet,
    View,
    ScrollView,
    ActivityIndicator,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import GameItem from "./GameItem";
import Text from "../../../../components/common/Text";
import { GameStatus } from "src/constants/config/gameStatus";
import { MinimalQuestGame } from "src/data/models/MinimalQuestGame";
import { colorSwatch } from "src/utils/colorConstants";
import IGDBService from "src/services/api/IGDBService";
import GameSearchInput from "./GameSearchInput";
import { SearchTabRouteProp } from "src/utils/navigationTypes";

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

    const searchGames = useCallback(
        async (query: string, franchiseId?: number) => {
            if (query.length < 2 && !franchiseId) {
                setSearchResults([]);
                return;
            }

            setError(null);
            setIsSearching(true);
            try {
                let results: MinimalQuestGame[];
                if (franchiseId) {
                    results = await IGDBService.searchGamesByFranchise(
                        franchiseId
                    );
                } else {
                    results = await IGDBService.searchGames(query);
                }
                setSearchResults(results);
            } catch (err) {
                setError("Failed to search games. Please try again.");
                console.error("Search error:", err);
            } finally {
                setIsSearching(false);
            }
        },
        []
    );

    useEffect(() => {
        const params = route.params as { franchiseId?: number };
        if (params?.franchiseId) {
            searchGames("", params.franchiseId);
        }
    }, [route.params, searchGames]);

    const handleSearchChange = (text: string) => {
        setSearchQuery(text);
        searchGames(text);
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
                    onSearchChange={handleSearchChange}
                    placeholder="Search to discover new games..."
                />

                {error ? (
                    <View style={styles.loadingContainer}>
                        <Text variant="subtitle" style={styles.errorText}>
                            {error}
                        </Text>
                    </View>
                ) : isSearching ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator
                            size="large"
                            color={colorSwatch.accent.cyan}
                        />
                        <Text
                            variant="subtitle"
                            style={[styles.emptyText, { marginTop: 16 }]}
                        >
                            Searching for games...
                        </Text>
                    </View>
                ) : searchResults.length === 0 ? (
                    <View style={styles.loadingContainer}>
                        <Text variant="subtitle" style={styles.emptyText}>
                            {searchQuery.length > 0
                                ? "No games found matching your search"
                                : "Type 2+ characters to search"}
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
