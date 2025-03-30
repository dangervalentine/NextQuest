import React, {
    useCallback,
    useState,
    useMemo,
    useEffect,
    useRef,
} from "react";
import {
    ImageBackground,
    StyleSheet,
    View,
    ActivityIndicator,
    TextInput,
    ScrollView,
    TouchableOpacity,
} from "react-native";
import GameItem from "./GameItem";
import Text from "../../../../components/common/Text";
import { GameStatus } from "src/constants/config/gameStatus";
import { MinimalQuestGame } from "src/data/models/MinimalQuestGame";
import { colorSwatch } from "src/utils/colorConstants";
import QuestIcon from "../../shared/GameIcon";
import { getStatusStyles } from "src/utils/gameStatusUtils";
import IGDBService from "src/services/api/IGDBService";

interface GameSearchSectionProps {
    gameStatus: GameStatus;
    games: MinimalQuestGame[];
    onStatusChange: (
        id: number,
        newStatus: GameStatus,
        currentStatus: GameStatus
    ) => void;
}

// Memoize the individual game item wrapper
const GameItemWrapper = React.memo(
    ({
        game,
        index,
        onStatusChange,
    }: {
        game: MinimalQuestGame;
        index: number;
        onStatusChange: (
            id: number,
            newStatus: GameStatus,
            currentStatus: GameStatus
        ) => void;
    }) => (
        <View style={styles.itemContainer} key={game.id + index}>
            <GameItem
                questGame={game}
                isFirstItem={index === 0}
                onStatusChange={(newStatus, currentStatus) =>
                    onStatusChange(game.id, newStatus, currentStatus)
                }
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
    games,
    onStatusChange,
}) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [searchResults, setSearchResults] = useState<MinimalQuestGame[]>([]);
    const [error, setError] = useState<string | null>(null);
    const debounceTimeoutRef = useRef<NodeJS.Timeout>();

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, []);

    // Debounced search function
    const debouncedSearch = useCallback(async (query: string) => {
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const results = await IGDBService.searchGames(query);
            setSearchResults(results);
        } catch (err) {
            setError("Failed to search games. Please try again.");
            console.error("Search error:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Handle search input changes with debounce
    const handleSearchChange = (text: string) => {
        setSearchQuery(text);

        // Clear any existing timeout
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        // Set new timeout
        debounceTimeoutRef.current = setTimeout(() => {
            debouncedSearch(text);
        }, 1000); // 400ms debounce
    };

    // Memoize the render function
    const renderItem = useCallback(
        (item: MinimalQuestGame, index: number) => {
            if (!item) {
                return null;
            }

            return (
                <GameItemWrapper
                    key={item.id + Math.floor(Math.random() * 1000000)}
                    game={item}
                    index={index}
                    onStatusChange={onStatusChange}
                />
            );
        },
        [onStatusChange]
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
                        color={getStatusStyles(gameStatus).color}
                    />
                </View>
            </ImageBackground>
        );
    }

    return (
        <ImageBackground
            source={require("../../../../assets/next_quest.png")}
            style={styles.pageContainer}
            resizeMode="contain"
        >
            <View style={styles.overlay} />
            <View style={styles.contentContainer}>
                <View style={styles.searchContainer}>
                    <View style={styles.searchInputContainer}>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Type 2+ characters to search games..."
                            placeholderTextColor={colorSwatch.text.secondary}
                            value={searchQuery}
                            onChangeText={handleSearchChange}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity
                                style={styles.clearButton}
                                onPress={() => {
                                    setSearchQuery("");
                                    setSearchResults([]);
                                }}
                            >
                                <QuestIcon
                                    name="close-circle"
                                    size={32}
                                    color={colorSwatch.accent.cyan}
                                />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
                {searchQuery.length < 2 ? (
                    <View style={styles.loadingContainer}>
                        <Text variant="subtitle" style={styles.emptyText}>
                            Type 2 or more characters to search
                        </Text>
                    </View>
                ) : isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator
                            size="large"
                            color={colorSwatch.accent.cyan}
                        />
                    </View>
                ) : error ? (
                    <View style={styles.loadingContainer}>
                        <Text variant="subtitle" style={styles.errorText}>
                            {error}
                        </Text>
                    </View>
                ) : searchResults.length === 0 ? (
                    <View style={styles.loadingContainer}>
                        <Text variant="subtitle" style={styles.emptyText}>
                            No games found matching your search
                        </Text>
                    </View>
                ) : (
                    <ScrollView
                        style={styles.scrollContainer}
                        contentContainerStyle={styles.listContainer}
                        removeClippedSubviews={true}
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
        borderWidth: 0,
        borderColor: colorSwatch.accent.cyan,
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
