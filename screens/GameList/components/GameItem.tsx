import React, { memo, useMemo } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { SimpleLineIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { colorSwatch } from "../../../utils/colorConstants";
import { formatReleaseDate } from "../../../utils/dateFormatters";
import { ScreenNavigationProp } from "../../../utils/navigationTypes";
import { GameStatus } from "../../../constants/gameStatus";
import FullHeightImage from "../../shared/FullHeightImage";
import { QuestGame } from "../../../data/models/QuestGame";

interface GameItemProps {
    questGame: QuestGame;
    reorder?: () => void;
}

const GameItem: React.FC<GameItemProps> = memo(
    ({ questGame: QuestGame, reorder }) => {
        const navigation = useNavigation<ScreenNavigationProp>();

        const platformReleaseDate = useMemo(
            () =>
                QuestGame.release_dates.find((date) => {
                    if (!date.platform) {
                        return false;
                    }

                    const platformKey = date.platform.toString();
                    try {
                        return (
                            platformKey === QuestGame.platform?.id.toString()
                        );
                    } catch (error) {
                        console.error("Error accessing platform:", error);
                        return false;
                    }
                }),
            [QuestGame.release_dates, QuestGame.platform?.id]
        );

        const handlePress = useMemo(
            () => () =>
                navigation.navigate("QuestGameDetailPage", {
                    id: QuestGame.id,
                    name: QuestGame.name,
                }),
            [navigation, QuestGame.id, QuestGame.name]
        );

        const genresText = useMemo(
            () => QuestGame.genres?.map((genre) => genre.name).join(", "),
            [QuestGame.genres]
        );

        const getStatusStyles = (status: GameStatus | undefined) => {
            switch (status) {
                case "completed":
                    return {
                        borderWidth: 3,
                        borderLeftColor: colorSwatch.accent.yellow,
                        borderBottomColor: colorSwatch.accent.pink,
                        borderTopColor: colorSwatch.accent.green,
                        borderRightColor: colorSwatch.accent.purple,
                    };

                default:
                    return;
            }
        };

        return (
            <View style={styles.gameContainer}>
                {typeof QuestGame.priority === "number" &&
                    QuestGame.priority > 0 && (
                        <Pressable
                            onTouchStart={reorder}
                            style={styles.dragHandle}
                        >
                            <View style={styles.dragHandleContent}>
                                <Text
                                    style={styles.priorityText}
                                    numberOfLines={1}
                                >
                                    {QuestGame.priority}
                                </Text>
                                <SimpleLineIcons
                                    name="menu"
                                    size={20}
                                    color={colorSwatch.primary.dark}
                                />
                            </View>
                        </Pressable>
                    )}
                <Pressable
                    onPress={handlePress}
                    style={({ pressed }) => [
                        styles.pressableNavigation,
                        pressed && styles.pressed,
                    ]}
                >
                    {QuestGame.cover && QuestGame.cover.url ? (
                        <FullHeightImage
                            source={QuestGame.cover.url}
                            style={getStatusStyles(QuestGame.gameStatus)}
                        />
                    ) : (
                        <View style={styles.cover} />
                    )}

                    <View style={styles.contentContainer}>
                        <Text style={styles.title}>{QuestGame.name}</Text>
                        {QuestGame.gameStatus === "completed" &&
                            QuestGame.rating !== undefined && (
                                <Text style={styles.rating}>
                                    {" "}
                                    {"⭐".repeat(QuestGame.personalRating ?? 0)}
                                    {"☆".repeat(
                                        10 - (QuestGame.personalRating ?? 0)
                                    )}{" "}
                                    ({QuestGame.personalRating ?? 0}/10)
                                </Text>
                            )}
                        <View style={styles.detailsContainer}>
                            <Text style={styles.textSecondary}>
                                Platform: {QuestGame.platform?.name}
                            </Text>
                            {QuestGame.notes && (
                                <View style={styles.quoteContainer}>
                                    <Text style={styles.quote}>
                                        {QuestGame.notes}
                                    </Text>
                                </View>
                            )}
                            {platformReleaseDate && (
                                <Text style={styles.textSecondary}>
                                    Release Date:{" "}
                                    {formatReleaseDate(
                                        platformReleaseDate.date
                                    )}
                                </Text>
                            )}
                            <Text style={styles.textSecondary}>
                                Genres: {genresText}
                            </Text>
                            <Text style={styles.textSecondary}>
                                Date Added: {QuestGame.dateAdded}
                            </Text>
                        </View>
                    </View>
                </Pressable>
            </View>
        );
    },
    (prevProps, nextProps) => {
        return prevProps.questGame.priority === nextProps.questGame.priority;
    }
);

const styles = StyleSheet.create({
    gameContainer: {
        flexDirection: "row",
        flex: 1,
    },
    dragHandle: {
        justifyContent: "center",
        alignItems: "center",
        width: 40,
        paddingHorizontal: 8,
    },
    dragHandleContent: {
        alignItems: "center",
    },
    priorityText: {
        color: colorSwatch.primary.dark,
        fontSize: 12,
        fontWeight: "bold",
        marginBottom: 2,
    },
    title: {
        fontSize: 16,
        marginBottom: 5,
        color: colorSwatch.accent.green,
        flexWrap: "wrap",
        maxWidth: "100%",
    },
    pressableNavigation: {
        flexDirection: "row",
        flex: 1,
        paddingVertical: 10,
        alignItems: "center",
    },
    rating: {
        fontSize: 10,
        marginBottom: 5,
        color: colorSwatch.accent.purple,
    },
    cover: {
        width: 75,
        height: 100,
        marginLeft: 12,
        marginRight: 12,
        padding: 3,
        resizeMode: "cover",
        backgroundColor: colorSwatch.neutral.gray,
        borderRadius: 4,
    },
    contentContainer: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
    },
    detailsContainer: {
        flex: 1,
        marginTop: 5,
    },
    textSecondary: {
        fontSize: 14,
        color: colorSwatch.text.secondary,
    },
    quoteContainer: {
        marginVertical: 5,
    },
    quote: {
        fontStyle: "italic",
        color: colorSwatch.secondary.main,
        fontSize: 14,
        flexWrap: "wrap",
    },
    pressed: {
        opacity: 0.75,
    },
});

export default GameItem;
