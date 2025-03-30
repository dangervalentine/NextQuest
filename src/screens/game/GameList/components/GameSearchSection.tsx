import React, { useCallback, useState, useMemo } from "react";
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
        <View style={styles.itemContainer}>
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

    // Memoize filtered games to prevent unnecessary recalculations
    const filteredGames = useMemo(
        () =>
            games.filter((game) =>
                game.name.toLowerCase().includes(searchQuery.toLowerCase())
            ),
        [games, searchQuery]
    );

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
                        color={colorSwatch.accent.cyan}
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
                                    size={32}
                                    color={colorSwatch.text.secondary}
                                />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
                {filteredGames.length === 0 ? (
                    <View style={styles.loadingContainer}>
                        <Text variant="subtitle" style={styles.emptyText}>
                            {searchQuery
                                ? "No games found matching your search"
                                : "No games available"}
                        </Text>
                    </View>
                ) : (
                    <ScrollView
                        style={styles.scrollContainer}
                        contentContainerStyle={styles.listContainer}
                        removeClippedSubviews={true}
                    >
                        {filteredGames.map((game, index) =>
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
        justifyContent: "space-between",
        paddingVertical: 8,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: colorSwatch.background.darker,
        opacity: 0.99,
    },
    searchContainer: {
        paddingVertical: 8,
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
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colorSwatch.accent.cyan,
    },
    searchInput: {
        flex: 1,
        padding: 12,
        color: colorSwatch.text.primary,
        fontSize: 24,
    },
    clearButton: {
        padding: 8,
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
});

export default GameSearchSection;
