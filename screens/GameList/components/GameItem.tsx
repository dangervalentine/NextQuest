import React, { memo, useMemo, useRef, useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Animated,
    PanResponder,
    TouchableOpacity,
    Easing,
} from "react-native";
import { SimpleLineIcons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { colorSwatch } from "../../../utils/colorConstants";
import { formatReleaseDate } from "../../../utils/dateFormatters";
import { ScreenNavigationProp } from "../../../utils/navigationTypes";
import { GameStatus } from "../../../constants/gameStatus";
import FullHeightImage from "../../shared/FullHeightImage";
import { MinimalQuestGame } from "../../../data/models/MinimalQuestGame";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// Shared state to track if hint has been shown in this session
let hasShownHintInSession = false;

interface GameItemProps {
    questGame: MinimalQuestGame;
    reorder?: () => void;
    removeItem?: (id: number, status: GameStatus) => void;
    onStatusChange?: (newStatus: GameStatus, currentStatus: GameStatus) => void;
    isFirstItem?: boolean;
}

const SWIPE_THRESHOLD = 75; // Absolute value for both directions

const GameItem: React.FC<GameItemProps> = memo(
    ({ questGame, reorder, removeItem, onStatusChange, isFirstItem }) => {
        const navigation = useNavigation<ScreenNavigationProp>();
        const [isReordering, setIsReordering] = useState(false);
        const [hasShownHint, setHasShownHint] = useState(false);
        const pan = useRef(new Animated.Value(0)).current;
        const leftChevronOpacity = useRef(new Animated.Value(0)).current;
        const rightChevronOpacity = useRef(new Animated.Value(0)).current;
        const leftChevronPosition = useRef(new Animated.Value(0)).current;
        const rightChevronPosition = useRef(new Animated.Value(0)).current;
        const [containerHeight, setContainerHeight] = useState<number>(0);
        const [isInitialHeight, setIsInitialHeight] = useState(true);
        const [isAnimating, setIsAnimating] = useState(false);
        const heightAnim = useRef(new Animated.Value(1)).current;

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
            }, [isFirstItem, hasShownHint, questGame.name])
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
                        delay: 150,
                        useNativeDriver: false,
                    }),
                ]),
            ]).start();
        };

        const getAvailableStatuses = (
            currentStatus: GameStatus | undefined
        ): GameStatus[] => {
            const allStatuses: GameStatus[] = [
                "ongoing",
                "backlog",
                "completed",
            ];
            return allStatuses.filter((status) => status !== currentStatus);
        };

        const getStatusColor = (status: GameStatus): string => {
            switch (status) {
                case "ongoing":
                    return colorSwatch.accent.yellow;
                case "completed":
                    return colorSwatch.accent.green;
                case "backlog":
                    return colorSwatch.accent.purple;
                case "undiscovered":
                    return colorSwatch.accent.pink;
                default:
                    return colorSwatch.accent.cyan;
            }
        };

        const getStatusLabel = (status: GameStatus): string => {
            switch (status) {
                case "ongoing":
                    return "Ongoing";
                case "completed":
                    return "Completed";
                case "backlog":
                    return "Backlog";
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
                                toValue: -205,
                                useNativeDriver: false,
                            }).start();
                        } else if (gestureState.dx > SWIPE_THRESHOLD) {
                            // Right swipe
                            Animated.spring(pan, {
                                toValue: 105,
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
            Animated.timing(pan, {
                toValue: 0,
                useNativeDriver: false,
                duration: 200,
                easing: Easing.out(Easing.cubic),
            }).start();
        };

        const handleStatusSelect = (status: GameStatus) => {
            if (containerHeight === 0) return;
            setIsAnimating(true);
            closeMenu();

            Animated.parallel([
                Animated.timing(pan, {
                    toValue: 0,
                    useNativeDriver: false,
                    duration: 300,
                    easing: Easing.out(Easing.cubic),
                }),

                Animated.timing(heightAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: false,
                    delay: 150,
                    easing: Easing.out(Easing.cubic),
                }),
            ]).start(() => {
                if (onStatusChange) {
                    onStatusChange(status, questGame.gameStatus);
                }
            });
        };

        const platformReleaseDate = useMemo(
            () =>
                questGame.release_dates?.find((date) => {
                    if (!date.platform_id) {
                        return false;
                    }

                    return date.platform_id === questGame.selectedPlatform?.id;
                }),
            [questGame.release_dates, questGame.selectedPlatform?.id]
        );

        const handlePress = useMemo(
            () => () =>
                navigation.navigate("QuestGameDetailPage", {
                    id: questGame.id,
                    name: questGame.name || "",
                }),
            [navigation, questGame.id, questGame.name]
        );

        const genresText = useMemo(
            () => questGame.genres?.map((genre) => genre.name).join(", ") || "",
            [questGame.genres]
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
                        borderRadius: 8,
                    };
                case "ongoing":
                case "on_hold":
                case "dropped":
                default:
                    return {};
            }
        };

        const getStatusButtonStyles = (status: GameStatus) => {
            const color = getStatusColor(status);
            return {
                backgroundColor: color,
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

        const handleRemove = () => {
            if (containerHeight === 0) return;
            setIsAnimating(true);
            Animated.parallel([
                Animated.timing(pan, {
                    toValue: 0,
                    useNativeDriver: false,
                    duration: 300,
                    easing: Easing.out(Easing.cubic),
                }),

                Animated.timing(heightAnim, {
                    toValue: 0,
                    duration: 300,
                    delay: 100,
                    useNativeDriver: false,
                    easing: Easing.out(Easing.cubic),
                }),
            ]).start(() => {
                if (removeItem) {
                    removeItem(questGame.id, "undiscovered");
                }
            });
        };

        return (
            <Animated.View
                style={[
                    styles.container,
                    isAnimating && {
                        height: heightAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, containerHeight],
                        }),
                        marginVertical: heightAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 8],
                        }),
                        borderWidth: heightAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 1],
                        }),
                        shadowOpacity: heightAnim,
                        elevation: heightAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 4],
                        }),
                    },
                ]}
                onLayout={(event) => {
                    const height = event.nativeEvent.layout.height;
                    if (height > 0 && isInitialHeight) {
                        setContainerHeight(height);
                        setIsInitialHeight(false);
                    }
                }}
            >
                {!isReordering && (
                    <View style={styles.statusMenu}>
                        {getAvailableStatuses(questGame.gameStatus).map(
                            (status, index) => (
                                <TouchableOpacity
                                    key={status}
                                    style={[
                                        styles.statusButton,
                                        getStatusButtonStyles(status),
                                        index ===
                                            getAvailableStatuses(
                                                questGame.gameStatus
                                            ).length -
                                                1 && {
                                            borderTopRightRadius: 12,
                                            borderBottomRightRadius: 11,
                                        },
                                    ]}
                                    onPress={() => handleStatusSelect(status)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[styles.statusButtonText]}>
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
                                    backgroundColor: colorSwatch.accent.pink,
                                    borderTopLeftRadius: 12,
                                    borderBottomLeftRadius: 12,
                                },
                            ]}
                            activeOpacity={0.7}
                            onPress={handleRemove}
                        >
                            <Text style={[styles.statusButtonText]}>
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
                    {typeof questGame.priority === "number" &&
                        questGame.priority > 0 &&
                        questGame.gameStatus === "backlog" && (
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
                                        {questGame.priority}
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
                        {questGame.cover && questGame.cover.url ? (
                            <FullHeightImage
                                source={questGame.cover.url}
                                style={getStatusStyles(questGame.gameStatus)}
                            />
                        ) : (
                            <FullHeightImage
                                source={require("../../../assets/placeholder.png")}
                                style={getStatusStyles(questGame.gameStatus)}
                            />
                        )}

                        <View style={styles.contentContainer}>
                            <Text style={styles.title}>{questGame.name}</Text>
                            {questGame.gameStatus === "completed" &&
                                questGame.personalRating !== undefined && (
                                    <Text style={styles.rating}>
                                        {"⭐".repeat(questGame.personalRating)}
                                        {"☆".repeat(
                                            10 - questGame.personalRating
                                        )}{" "}
                                        ({questGame.personalRating}/10)
                                    </Text>
                                )}
                            <View style={styles.detailsContainer}>
                                <Text style={styles.textSecondary}>
                                    Platform: {questGame.selectedPlatform?.name}
                                </Text>
                                {questGame.notes &&
                                    questGame.gameStatus === "completed" && (
                                        <View style={styles.quoteContainer}>
                                            <Text style={styles.quote}>
                                                "{questGame.notes}"
                                            </Text>
                                        </View>
                                    )}
                                {questGame.gameStatus !== "completed" && (
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
                                                questGame.dateAdded
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
            </Animated.View>
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
        opacity: 1,
        borderRadius: 12,
        marginHorizontal: 4,
        marginVertical: 8,
        shadowColor: colorSwatch.background.dark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        borderWidth: 1,
        borderColor: colorSwatch.neutral.darkGray,
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
        zIndex: 1,
        elevation: 1,
        flexDirection: "row",
        alignItems: "stretch",
        borderLeftWidth: 1,
        borderLeftColor: colorSwatch.neutral.darkGray,
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
        margin: 1,
    },
    statusButtonText: {
        fontSize: 16,
        fontWeight: "600",
        textAlign: "center",
        color: colorSwatch.text.inverse,
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
        flexDirection: "row",
        alignItems: "stretch",
        borderRightWidth: 1,
        borderRightColor: colorSwatch.neutral.darkGray,
    },
});

export default GameItem;
