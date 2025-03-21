import React, { memo, useMemo } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { QuestGame } from "../interfaces/QuestGame";
import Icon from "react-native-vector-icons/SimpleLineIcons";
import { useNavigation } from "@react-navigation/native";
import { Image } from "expo-image";
import colorSwatch from "../utils/colors";
import { ScreenNavigationProp } from "../utils/navigationTypes";
import { formatReleaseDate } from "../utils/dateFormatters";
import platforms from "../data/platforms.json";

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

        return (
            <View style={styles.gameContainer}>
                <Pressable
                    onPress={handlePress}
                    style={styles.pressableNavigation}
                    android_ripple={{ color: colorSwatch.primary.dark }}
                >
                    {QuestGame.cover && QuestGame.cover.url ? (
                        <Image
                            source={`https:${QuestGame.cover.url}`}
                            style={styles.cover}
                            contentFit="cover"
                            placeholder={require("../assets/placeholder.webp")}
                            onError={() =>
                                console.error("Failed to load image")
                            }
                        />
                    ) : (
                        <View style={styles.cover} />
                    )}

                    <View>
                        <View>
                            <Text style={styles.title}>{QuestGame.name}</Text>
                            {QuestGame.gameStatus === "completed" &&
                                QuestGame.rating !== undefined && (
                                    <Text style={styles.rating}>
                                        {" "}
                                        {"⭐".repeat(
                                            QuestGame.personalRating ?? 0
                                        )}
                                        {"☆".repeat(
                                            10 - (QuestGame.personalRating ?? 0)
                                        )}{" "}
                                        ({QuestGame.personalRating ?? 0}/10)
                                    </Text>
                                )}
                        </View>
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
                {QuestGame.priority && (
                    <Pressable onTouchStart={reorder} style={styles.dragHandle}>
                        <Text style={{ color: colorSwatch.primary.dark }}>
                            {QuestGame.priority}
                        </Text>
                        <Icon
                            name="menu"
                            size={24}
                            color={colorSwatch.primary.dark}
                        />
                    </Pressable>
                )}
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
        borderBottomWidth: 1,
        borderColor: colorSwatch.primary.dark,
        flex: 1,
    },
    priority: {
        fontSize: 12,
        color: colorSwatch.accent.green,
        alignSelf: "center",
        marginHorizontal: 10,
    },
    dragHandle: {
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 10,
        backgroundColor: colorSwatch.background.dark,
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
    },
    rating: {
        fontSize: 10,
        marginBottom: 5,
        color: colorSwatch.accent.purple,
    },
    cover: {
        minWidth: 75,
        minHeight: 100,
        marginRight: 10,
        resizeMode: "cover",
        backgroundColor: colorSwatch.neutral.gray,
    },
    textSecondary: {
        fontSize: 12,
        color: colorSwatch.text.secondary,
    },
    detailsContainer: {
        flexDirection: "column",
        alignSelf: "flex-start",
        flex: 1,
    },
    quoteContainer: {
        marginTop: 5,
    },
    quote: {
        fontStyle: "italic",
        color: colorSwatch.secondary.light,
    },
    buttonInnerContainer: {
        backgroundColor: colorSwatch.background.dark,
        paddingVertical: 8,
        elevation: 4,
        flexDirection: "row",
    },
    pressed: {
        opacity: 0.75,
    },
});

export default GameItem;
