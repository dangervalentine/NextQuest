import React, { memo, useMemo, useRef, useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Animated,
    PanResponder,
    Dimensions,
} from "react-native";
import { SimpleLineIcons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { colorSwatch } from "../../../utils/colorConstants";
import { formatReleaseDate } from "../../../utils/dateFormatters";
import { ScreenNavigationProp } from "../../../utils/navigationTypes";
import { GameStatus } from "../../../constants/gameStatus";
import FullHeightImage from "../../shared/FullHeightImage";
import { QuestGame } from "../../../data/models/QuestGame";

// Shared state to track if hint has been shown in this session
let hasShownHintInSession = false;

interface GameItemProps {
    questGame: QuestGame;
    reorder?: () => void;
    onStatusChange?: (newStatus: GameStatus) => void;
    isFirstItem?: boolean;
}

const SWIPE_THRESHOLD = -50; // How far to swipe before revealing menu
const SCREEN_WIDTH = Dimensions.get("window").width;

const GameItem: React.FC<GameItemProps> = memo(
    ({ questGame: QuestGame, reorder, onStatusChange, isFirstItem }) => {
        const navigation = useNavigation<ScreenNavigationProp>();
        const [isMenuOpen, setIsMenuOpen] = useState(false);
        const [hasShownHint, setHasShownHint] = useState(false);
        const pan = useRef(new Animated.Value(0)).current;
        const chevronOpacity = useRef(new Animated.Value(0)).current;
        const chevronPosition = useRef(new Animated.Value(0)).current;

        useFocusEffect(
            React.useCallback(() => {
                if (isFirstItem && !hasShownHint && !hasShownHintInSession) {
                    const timer = setTimeout(() => {
                        showHint();
                        setHasShownHint(true);
                        hasShownHintInSession = true;
                    }, 1000);
                    return () => clearTimeout(timer);
                }
            }, [isFirstItem, hasShownHint, QuestGame.name])
        );

        const showHint = () => {
            // Reset animations
            pan.setValue(0);
            chevronOpacity.setValue(1);
            chevronPosition.setValue(0);

            // Start chevron movement immediately
            Animated.timing(chevronPosition, {
                toValue: -100,
                duration: 800,
                useNativeDriver: true,
            }).start();

            // Panel peek animation sequence
            Animated.sequence([
                // Wait before starting
                Animated.delay(500),
                // Peek menu
                Animated.timing(pan, {
                    toValue: -30,
                    duration: 400,
                    useNativeDriver: false,
                }),
                // Hold the peek
                Animated.delay(800),
                // Return to original position
                Animated.timing(pan, {
                    toValue: 0,
                    duration: 400,
                    useNativeDriver: false,
                }),
            ]).start();

            // Fade out chevron
            Animated.timing(chevronOpacity, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }).start();
        };

        const getAvailableStatuses = (
            currentStatus: GameStatus | undefined
        ): GameStatus[] => {
            const allStatuses: GameStatus[] = [
                "active",
                "inactive",
                "completed",
                "undiscovered",
            ];
            return allStatuses.filter((status) => status !== currentStatus);
        };

        const getStatusColor = (status: GameStatus): string => {
            switch (status) {
                case "active":
                    return colorSwatch.accent.yellow;
                case "completed":
                    return colorSwatch.accent.green;
                case "inactive":
                    return colorSwatch.accent.pink;
                case "undiscovered":
                    return colorSwatch.accent.purple;
                default:
                    return colorSwatch.accent.cyan;
            }
        };

        const getStatusLabel = (status: GameStatus): string => {
            switch (status) {
                case "active":
                    return "Active";
                case "completed":
                    return "Complete";
                case "inactive":
                    return "Inactive";
                case "undiscovered":
                    return "Undiscovered";
                default:
                    return status;
            }
        };

        const panResponder = useMemo(
            () =>
                PanResponder.create({
                    onStartShouldSetPanResponder: () => true,
                    onMoveShouldSetPanResponder: (_, gestureState) => {
                        // Only handle horizontal swipes
                        return (
                            Math.abs(gestureState.dx) >
                            Math.abs(gestureState.dy)
                        );
                    },
                    onPanResponderGrant: () => {
                        // Start the gesture without offset
                        pan.setValue(0);
                    },
                    onPanResponderMove: (_, gestureState) => {
                        // Only allow left swipe and limit the swipe distance
                        const newX = Math.min(
                            0,
                            Math.max(-120, gestureState.dx)
                        );
                        pan.setValue(newX);
                    },
                    onPanResponderRelease: (_, gestureState) => {
                        if (gestureState.dx < SWIPE_THRESHOLD) {
                            // Open menu
                            Animated.spring(pan, {
                                toValue: -120,
                                useNativeDriver: false,
                            }).start();
                            setIsMenuOpen(true);
                        } else {
                            // Close menu
                            Animated.spring(pan, {
                                toValue: 0,
                                useNativeDriver: false,
                            }).start();
                            setIsMenuOpen(false);
                        }
                    },
                }),
            []
        );

        const closeMenu = () => {
            Animated.spring(pan, {
                toValue: 0,
                useNativeDriver: false,
            }).start();
            setIsMenuOpen(false);
        };

        const handleStatusSelect = (status: GameStatus) => {
            if (onStatusChange) {
                onStatusChange(status);
            }
            closeMenu();
        };

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
                case "on_hold":
                case "dropped":
                default:
                    return {};
            }
        };

        const getStatusButtonStyles = (status: GameStatus) => {
            const color = getStatusColor(status);
            return {
                borderColor: color,
                borderWidth: 2,
            };
        };

        return (
            <View style={styles.container}>
                <Animated.View
                    style={[
                        styles.gameContainer,
                        {
                            transform: [{ translateX: pan }],
                        },
                    ]}
                    {...panResponder.panHandlers}
                >
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
                                        {"⭐".repeat(
                                            QuestGame.personalRating ?? 0
                                        )}
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
                </Animated.View>
                <View style={styles.statusMenu}>
                    {getAvailableStatuses(QuestGame.gameStatus).map(
                        (status) => (
                            <Pressable
                                key={status}
                                style={[
                                    styles.statusButton,
                                    getStatusButtonStyles(status),
                                ]}
                                onPress={() => handleStatusSelect(status)}
                            >
                                <Text
                                    style={[
                                        styles.statusButtonText,
                                        { color: getStatusColor(status) },
                                    ]}
                                >
                                    {getStatusLabel(status)}
                                </Text>
                            </Pressable>
                        )
                    )}
                </View>
                <Animated.View
                    style={[
                        styles.chevronContainer,
                        {
                            opacity: chevronOpacity,
                            transform: [{ translateX: chevronPosition }],
                        },
                    ]}
                >
                    <SimpleLineIcons
                        name="arrow-left"
                        size={32}
                        color={colorSwatch.accent.cyan}
                    />
                </Animated.View>
            </View>
        );
    },
    (prevProps, nextProps) => {
        return prevProps.questGame.priority === nextProps.questGame.priority;
    }
);

const styles = StyleSheet.create({
    container: {
        position: "relative",
    },
    gameContainer: {
        flexDirection: "row",
        flex: 1,
        backgroundColor: colorSwatch.background.darkest,
        overflow: "hidden",
        zIndex: 1,
    },
    statusMenu: {
        position: "absolute",
        right: 0,
        top: 0,
        bottom: 0,
        width: 120,
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        backgroundColor: colorSwatch.background.darker,
        zIndex: 0,
        paddingVertical: 16,
        gap: 8,
    },
    statusButton: {
        width: "90%",
        padding: 8,
        borderRadius: 8,
        alignItems: "center",
        backgroundColor: "transparent",
    },
    statusButtonText: {
        fontSize: 14,
        fontWeight: "600",
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
    },
    quote: {
        fontStyle: "italic",
        color: colorSwatch.secondary.main,
        fontSize: 14,
        flexWrap: "wrap",
        lineHeight: 20,
    },
    chevronContainer: {
        position: "absolute",
        right: -40,
        top: "40%",
        transform: [{ translateY: -16 }],
        zIndex: 100,
        elevation: 5,
    },
});

export default GameItem;
