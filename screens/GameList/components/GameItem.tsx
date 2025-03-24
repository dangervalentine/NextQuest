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
                QuestGame.release_dates?.find((date) => {
                    if (!date.platform_id) {
                        return false;
                    }

                    return date.platform_id === QuestGame.selectedPlatform?.id;
                }),
            [QuestGame.release_dates, QuestGame.selectedPlatform?.id]
        );

        const handlePress = useMemo(
            () => () =>
                navigation.navigate("QuestGameDetailPage", {
                    id: QuestGame.id,
                    name: QuestGame.name || "",
                }),
            [navigation, QuestGame.id, QuestGame.name]
        );

        const genresText = useMemo(
            () => QuestGame.genres?.map((genre) => genre.name).join(", ") || "",
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
                        borderRadius: 3,
                    };
                case "active":
                    return {
                        // borderWidth: 2,
                        // borderColor: colorSwatch.accent.yellow,
                    };
                case "on_hold":
                    return {
                        // borderWidth: 2,
                        // borderColor: colorSwatch.accent.purple,
                    };
                case "dropped":
                    return {
                        // borderWidth: 2,
                        // borderColor: colorSwatch.accent.pink,
                    };
                default:
                    return {
                        // borderWidth: 2,
                        // borderColor: colorSwatch.neutral.darkGray,
                    };
            }
        };

        return (
            <View style={styles.gameContainer}>
                {typeof QuestGame.priority === "number" &&
                    QuestGame.priority > 0 &&
                    QuestGame.gameStatus === "inactive" && (
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
                        <FullHeightImage
                            source={require("../../../assets/placeholder.png")}
                            style={getStatusStyles(QuestGame.gameStatus)}
                        />
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
                                Platform: {QuestGame.selectedPlatform?.name}
                            </Text>
                            {QuestGame.notes && (
                                <View style={styles.quoteContainer}>
                                    <Text style={styles.quote}>
                                        "{QuestGame.notes}"
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
                                Date Added:{" "}
                                {new Date(
                                    QuestGame.dateAdded
                                ).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "2-digit",
                                })}
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
        backgroundColor: colorSwatch.background.darkest,
        overflow: "hidden",
    },
    dragHandle: {
        justifyContent: "center",
        alignItems: "center",
        width: 48,
        backgroundColor: colorSwatch.background.darker,
        borderRightWidth: 1,
        borderRightColor: colorSwatch.neutral.darkGray,
    },
    dragHandleContent: {
        alignItems: "center",
        gap: 4,
    },
    priorityText: {
        color: colorSwatch.accent.cyan,
        fontSize: 14,
        fontWeight: "600",
    },
    title: {
        fontSize: 18,
        marginBottom: 8,
        color: colorSwatch.accent.purple,
        fontWeight: "600",
        flexWrap: "wrap",
        maxWidth: "100%",
        lineHeight: 24,
    },
    pressableNavigation: {
        flexDirection: "row",
        flex: 1,
        padding: 12,
        alignItems: "flex-start",
        gap: 12,
    },
    pressed: {
        opacity: 0.8,
        backgroundColor: colorSwatch.background.darker,
    },
    rating: {
        fontSize: 12,
        marginBottom: 8,
        color: colorSwatch.accent.yellow,
        letterSpacing: 1,
    },
    contentContainer: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "flex-start",
    },
    detailsContainer: {
        flex: 1,
        gap: 8,
    },
    textSecondary: {
        fontSize: 14,
        color: colorSwatch.text.secondary,
        lineHeight: 20,
    },
    quoteContainer: {
        backgroundColor: colorSwatch.background.darker,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderLeftWidth: 3,
        borderLeftColor: colorSwatch.accent.cyan,
    },
    quote: {
        fontStyle: "italic",
        color: colorSwatch.secondary.main,
        fontSize: 14,
        flexWrap: "wrap",
        lineHeight: 20,
    },
});

export default GameItem;
