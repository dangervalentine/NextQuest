import React, { memo, useMemo, useRef, useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Animated,
    PanResponder,
    Dimensions,
    TouchableOpacity,
} from "react-native";
import { SimpleLineIcons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { colorSwatch } from "../../../utils/colorConstants";
import { formatReleaseDate } from "../../../utils/dateFormatters";
import { ScreenNavigationProp } from "../../../utils/navigationTypes";
import { GameStatus } from "../../../constants/gameStatus";
import FullHeightImage from "../../shared/FullHeightImage";
import { QuestGame } from "../../../data/models/QuestGame";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// Shared state to track if hint has been shown in this session
let hasShownHintInSession = false;

interface GameItemProps {
    questGame: QuestGame;
    reorder?: () => void;
    onStatusChange?: (newStatus: GameStatus, currentStatus: GameStatus) => void;
    isFirstItem?: boolean;
}

const SWIPE_THRESHOLD = 75; // Absolute value for both directions

const GameItem: React.FC<GameItemProps> = memo(
    ({ questGame: QuestGame, reorder, onStatusChange, isFirstItem }) => {
        const navigation = useNavigation<ScreenNavigationProp>();
        const [isReordering, setIsReordering] = useState(false);
        const [hasShownHint, setHasShownHint] = useState(false);
        const pan = useRef(new Animated.Value(0)).current;
        const leftChevronOpacity = useRef(new Animated.Value(0)).current;
        const rightChevronOpacity = useRef(new Animated.Value(0)).current;
        const leftChevronPosition = useRef(new Animated.Value(0)).current;
        const rightChevronPosition = useRef(new Animated.Value(0)).current;

        useFocusEffect(
            React.useCallback(() => {
                if (isFirstItem && !hasShownHint && !hasShownHintInSession) {
                    showHint();
                    const timer = setTimeout(() => {
                        setHasShownHint(true);
                        hasShownHintInSession = true;
                    }, 1000);
                    return () => clearTimeout(timer);
                }
            }, [isFirstItem, hasShownHint, QuestGame.name])
        );

        const showHint = () => {
            // Initialize animation values to starting positions
            pan.setValue(0);
            leftChevronOpacity.setValue(0);
            rightChevronOpacity.setValue(0);
            leftChevronPosition.setValue(0);
            rightChevronPosition.setValue(0);

            // Animation sequence to demonstrate swipe functionality on first session load
            Animated.sequence([
                // Brief pause before starting the demonstration
                Animated.delay(300),

                // Phase 1: Left swipe demonstration
                // Move chevron and peek menu simultaneously to show left swipe gesture
                Animated.parallel([
                    Animated.timing(leftChevronPosition, {
                        toValue: -120,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    Animated.timing(leftChevronOpacity, {
                        toValue: 0.75,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pan, {
                        toValue: -60,
                        duration: 300,
                        delay: 100,
                        useNativeDriver: false,
                    }),
                ]),
                // Pause to show the status change menu
                Animated.delay(500),
                // Return chevron to starting position
                Animated.parallel([
                    Animated.timing(leftChevronOpacity, {
                        toValue: 0,
                        duration: 200,
                        useNativeDriver: true,
                    }),
                    Animated.timing(leftChevronPosition, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    // Return card to starting position
                    Animated.timing(pan, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: false,
                        delay: 100,
                    }),
                ]),

                // Phase 2: Right swipe demonstration
                // Move chevron and peek menu simultaneously to show right swipe gesture
                Animated.parallel([
                    Animated.timing(rightChevronPosition, {
                        toValue: 120,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    // Fade in right chevron to prepare for right swipe
                    Animated.timing(rightChevronOpacity, {
                        toValue: 0.75,
                        duration: 200,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pan, {
                        toValue: 60,
                        duration: 300,
                        delay: 100,
                        useNativeDriver: false,
                    }),
                ]),
                // Pause to show the remove menu
                Animated.delay(500),

                Animated.parallel([
                    // Return chevron to starting position
                    Animated.timing(rightChevronPosition, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    Animated.timing(rightChevronOpacity, {
                        toValue: 0,
                        duration: 100,
                        useNativeDriver: true,
                    }),
                    // Return card to starting position
                    Animated.timing(pan, {
                        toValue: 0,
                        duration: 300,
                        delay: 100,
                        useNativeDriver: false,
                    }),
                ]),
            ]).start();
        };

        const getAvailableStatuses = (
            currentStatus: GameStatus | undefined
        ): GameStatus[] => {
            const allStatuses: GameStatus[] = [
                "active",
                "inactive",
                "completed",
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
                    return colorSwatch.accent.purple;
                case "undiscovered":
                    return colorSwatch.accent.pink;
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
                default:
                    return status;
            }
        };

        const panResponder = useMemo(
            () =>
                PanResponder.create({
                    onStartShouldSetPanResponder: () => true,
                    onMoveShouldSetPanResponder: (_, gestureState) => {
                        return (
                            Math.abs(gestureState.dx) >
                            Math.abs(gestureState.dy)
                        );
                    },
                    onPanResponderGrant: () => {
                        pan.setValue(0);
                    },
                    onPanResponderMove: (_, gestureState) => {
                        // Allow both left and right swipes
                        const newX = Math.max(
                            -200,
                            Math.min(100, gestureState.dx)
                        );
                        pan.setValue(newX);
                    },
                    onPanResponderRelease: (_, gestureState) => {
                        if (gestureState.dx < -SWIPE_THRESHOLD) {
                            // Left swipe
                            Animated.spring(pan, {
                                toValue: -200,
                                useNativeDriver: false,
                            }).start();
                        } else if (gestureState.dx > SWIPE_THRESHOLD) {
                            // Right swipe
                            Animated.spring(pan, {
                                toValue: 100,
                                useNativeDriver: false,
                            }).start();
                        } else {
                            // Close menu
                            Animated.spring(pan, {
                                toValue: 0,
                                useNativeDriver: false,
                            }).start();
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
        };

        const handleStatusSelect = (status: GameStatus) => {
            if (onStatusChange) {
                onStatusChange(status, QuestGame.gameStatus);
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

        const handleReorderStart = () => {
            setIsReordering(true);
            if (reorder) {
                reorder();
            }
        };

        const handleReorderEnd = () => {
            setIsReordering(false);
        };

        return (
            <View style={styles.container}>
                {!isReordering && (
                    <View style={styles.statusMenu}>
                        {getAvailableStatuses(QuestGame.gameStatus).map(
                            (status) => (
                                <TouchableOpacity
                                    key={status}
                                    style={[
                                        styles.statusButton,
                                        getStatusButtonStyles(status),
                                    ]}
                                    onPress={() => handleStatusSelect(status)}
                                    activeOpacity={0.7}
                                >
                                    <Text
                                        style={[
                                            styles.statusButtonText,
                                            { color: getStatusColor(status) },
                                        ]}
                                    >
                                        {getStatusLabel(status)}
                                    </Text>
                                </TouchableOpacity>
                            )
                        )}
                    </View>
                )}
                {!isReordering && (
                    <View style={styles.rightMenu}>
                        <TouchableOpacity
                            style={[
                                styles.statusButton,
                                {
                                    borderColor: colorSwatch.accent.pink,
                                    borderWidth: 2,
                                },
                            ]}
                            activeOpacity={0.7}
                        >
                            <Text
                                style={[
                                    styles.statusButtonText,
                                    { color: colorSwatch.accent.pink },
                                ]}
                            >
                                Remove
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
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
                                onTouchStart={handleReorderStart}
                                onTouchEnd={handleReorderEnd}
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
                                {QuestGame.notes &&
                                    QuestGame.gameStatus === "completed" && (
                                        <View style={styles.quoteContainer}>
                                            <Text style={styles.quote}>
                                                "{QuestGame.notes}"
                                            </Text>
                                        </View>
                                    )}
                                {QuestGame.gameStatus !== "completed" && (
                                    <View>
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
                                )}
                            </View>
                        </View>
                    </Pressable>
                </Animated.View>
                <Animated.View
                    style={[
                        styles.chevronContainer,
                        styles.leftChevron,
                        {
                            opacity: leftChevronOpacity,
                            transform: [{ translateX: leftChevronPosition }],
                        },
                    ]}
                >
                    <MaterialCommunityIcons
                        name="arrow-left"
                        size={32}
                        color={colorSwatch.accent.cyan}
                    />
                </Animated.View>
                <Animated.View
                    style={[
                        styles.chevronContainer,
                        styles.rightChevron,
                        {
                            opacity: rightChevronOpacity,
                            transform: [{ translateX: rightChevronPosition }],
                        },
                    ]}
                >
                    <MaterialCommunityIcons
                        name="arrow-right"
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
        overflow: "hidden",
        backgroundColor: colorSwatch.background.darkest,
    },
    gameContainer: {
        flexDirection: "row",
        flex: 1,
        backgroundColor: colorSwatch.background.darkest,
        overflow: "hidden",
        zIndex: 2,
        elevation: 2,
    },
    statusMenu: {
        position: "absolute",
        right: 0,
        top: 0,
        bottom: 0,
        width: 200,
        backgroundColor: colorSwatch.background.darker,
        gap: 4,
        zIndex: 1,
        elevation: 1,
        flexDirection: "row",
        alignItems: "stretch",
    },
    activeItem: {
        backgroundColor: colorSwatch.background.darker,
        borderWidth: 2,
        borderColor: colorSwatch.accent.cyan,
    },
    statusButton: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "transparent",
        padding: 8,
    },
    statusButtonText: {
        fontSize: 12,
        fontWeight: "600",
        textAlign: "center",
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
        gap: 4,
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
        top: "40%",
        transform: [{ translateY: -16 }],
        zIndex: 10,
        elevation: 5,
        backgroundColor: colorSwatch.background.darker,
        padding: 4,
        borderRadius: 100,
    },

    leftChevron: {
        right: -50,
    },
    rightChevron: {
        left: -50,
    },
    rightMenu: {
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        width: 100,
        backgroundColor: colorSwatch.background.darker,
        gap: 4,
        zIndex: 1,
        elevation: 1,
        flexDirection: "row",
        alignItems: "stretch",
    },
});

export default GameItem;
