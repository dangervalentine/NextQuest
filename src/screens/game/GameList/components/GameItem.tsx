import React, { memo, useMemo, useRef, useState } from "react";
import {
    View,
    StyleSheet,
    Pressable,
    Animated,
    PanResponder,
    TouchableOpacity,
    Easing,
} from "react-native";
import Text from "src/components/common/Text";
import { SimpleLineIcons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { GameStatus } from "src/constants/config/gameStatus";
import { MinimalQuestGame } from "src/data/models/MinimalQuestGame";
import { colorSwatch } from "src/utils/colorConstants";
import { formatReleaseDate } from "src/utils/dateFormatters";
import { ScreenNavigationProp } from "src/utils/navigationTypes";
import FullHeightImage from "../../shared/FullHeightImage";
import { getStatusStyles } from "src/utils/gameStatusUtils";

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
                    setHasShownHint(true);
                    hasShownHintInSession = true;
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
                        toValue: -200,
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
                        toValue: 200,
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
                // "undiscovered",
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
                    return colorSwatch.accent.cyan;
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
                case "undiscovered":
                    return "Undiscovered";
                case "on_hold":
                    return "On Hold";
                case "dropped":
                    return "Dropped";
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
                        // Only allow right swipe if not undiscovered
                        const maxRight =
                            questGame.gameStatus === "undiscovered" ? 0 : 100;
                        // Make left swipe wider for undiscovered games
                        const maxLeft =
                            questGame.gameStatus === "undiscovered"
                                ? -300
                                : -200;
                        const newX = Math.max(
                            maxLeft,
                            Math.min(maxRight, gestureState.dx)
                        );
                        pan.setValue(newX);
                    },
                    onPanResponderRelease: (_, gestureState) => {
                        if (gestureState.dx < -SWIPE_THRESHOLD) {
                            // Left swipe - wider for undiscovered
                            const leftPosition =
                                questGame.gameStatus === "undiscovered"
                                    ? -305
                                    : -205;
                            Animated.spring(pan, {
                                toValue: leftPosition,
                                useNativeDriver: false,
                            }).start();
                        } else if (
                            gestureState.dx > SWIPE_THRESHOLD &&
                            questGame.gameStatus !== "undiscovered"
                        ) {
                            // Right swipe - only if not undiscovered
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
            [questGame.gameStatus]
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
            // if (containerHeight === 0) return;
            // setIsAnimating(true);

            const animations = [
                Animated.timing(pan, {
                    toValue: 0,
                    useNativeDriver: false,
                    duration: 300,
                    easing: Easing.out(Easing.cubic),
                }),
            ];

            // Only add height animation if not moving to undiscovered
            if (questGame.gameStatus !== "undiscovered") {
                animations.push(
                    Animated.timing(heightAnim, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: false,
                        delay: 150,
                        easing: Easing.out(Easing.cubic),
                    })
                );
            }

            Animated.parallel(animations).start(() => {
                if (onStatusChange) {
                    onStatusChange(status, questGame.gameStatus);
                }
                // setIsAnimating(true);
            });

            closeMenu();

            if (onStatusChange) {
                onStatusChange(status, questGame.gameStatus);
            }
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

        let coverUrl;
        if (questGame.cover && questGame.cover.url) {
            coverUrl = questGame.cover.url.replace("t_thumb", "t_cover_big");
        } else {
            coverUrl = require("../../../../assets/placeholder.png");
        }

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
                    <View
                        style={[
                            styles.statusMenu,
                            questGame.gameStatus === "undiscovered" && {
                                width: 300,
                            },
                        ]}
                    >
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
                                            borderBottomRightRadius: 12,
                                        },
                                    ]}
                                    onPress={() => handleStatusSelect(status)}
                                    activeOpacity={0.7}
                                >
                                    <Text
                                        variant="button"
                                        style={styles.statusButtonText}
                                    >
                                        {getStatusLabel(status)}
                                    </Text>
                                </TouchableOpacity>
                            )
                        )}
                    </View>
                )}
                {!isReordering && questGame.gameStatus !== "undiscovered" && (
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
                            <Text
                                variant="button"
                                style={styles.statusButtonText}
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
                                source={coverUrl}
                                style={getStatusStyles(questGame.gameStatus)}
                            />
                        ) : (
                            <FullHeightImage
                                source={require("../../../../assets/placeholder.png")}
                                style={getStatusStyles(questGame.gameStatus)}
                            />
                        )}

                        <View style={styles.contentContainer}>
                            <Text variant="subtitle" style={styles.title}>
                                {questGame.name}
                            </Text>
                            {questGame.gameStatus === "completed" &&
                                questGame.personalRating !== undefined && (
                                    <Text
                                        variant="caption"
                                        style={styles.rating}
                                    >
                                        {"⭐".repeat(questGame.personalRating)}
                                        {"☆".repeat(
                                            10 - questGame.personalRating
                                        )}{" "}
                                        ({questGame.personalRating}/10)
                                    </Text>
                                )}
                            <View style={styles.detailsContainer}>
                                {/* {questGame.notes &&
                                    questGame.gameStatus === "completed" && (
                                        <View style={styles.quoteContainer}>
                                            <Text
                                                variant="caption"
                                                style={styles.quote}
                                            >
                                                "{questGame.notes}"
                                            </Text>
                                        </View>
                                    )} */}
                                {/* {questGame.gameStatus !== "completed" && ( */}
                                <View style={styles.detailsContainer}>
                                    <Text style={styles.textSecondary}>
                                        <Text>Platform: </Text>
                                        <Text>
                                            {questGame.selectedPlatform?.name}
                                        </Text>
                                    </Text>
                                    {platformReleaseDate && (
                                        <Text style={styles.textSecondary}>
                                            <Text>Release Date: </Text>
                                            <Text>
                                                {formatReleaseDate(
                                                    platformReleaseDate.date
                                                )}
                                            </Text>
                                        </Text>
                                    )}
                                    <Text style={styles.textSecondary}>
                                        <Text>Genres: </Text>
                                        <Text>{genresText}</Text>
                                    </Text>
                                </View>
                                {/* )} */}
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
        // Compare all relevant props
        const shouldUpdate =
            prevProps.questGame.id !== nextProps.questGame.id ||
            prevProps.questGame.name !== nextProps.questGame.name ||
            prevProps.questGame.gameStatus !== nextProps.questGame.gameStatus ||
            prevProps.questGame.priority !== nextProps.questGame.priority ||
            prevProps.questGame.personalRating !==
                nextProps.questGame.personalRating ||
            prevProps.questGame.cover?.url !== nextProps.questGame.cover?.url ||
            prevProps.questGame.selectedPlatform?.id !==
                nextProps.questGame.selectedPlatform?.id ||
            prevProps.isFirstItem !== nextProps.isFirstItem;

        return !shouldUpdate; // Return true to prevent re-render
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
    activeItem: {
        borderWidth: 2,
        borderColor: colorSwatch.accent.cyan,
        borderRadius: 12,
    },
    statusButton: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 8,
        margin: 1,
    },
    statusButtonText: {
        fontSize: 16,
        color: colorSwatch.text.inverse,
    },
    dragHandle: {
        justifyContent: "center",
        alignItems: "center",
        width: 36,
        backgroundColor: colorSwatch.background.darker,
        borderRightWidth: 1,
        borderRightColor: colorSwatch.neutral.darkGray,
    },
    dragHandleContent: {
        alignItems: "center",
    },
    priorityText: {
        color: colorSwatch.accent.cyan,
    },
    title: {
        fontSize: 18,
        marginBottom: 4,
        color: colorSwatch.accent.purple,
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
        justifyContent: "flex-start",
        alignItems: "flex-start",
    },
    textSecondary: {
        color: colorSwatch.primary.dark,
    },
    quoteContainer: {
        backgroundColor: colorSwatch.background.darker,
        paddingVertical: 8,
    },
    quote: {
        color: colorSwatch.secondary.main,
        flexWrap: "wrap",
        lineHeight: 16,
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
});

export default GameItem;
