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
import { getStatusLabel } from "src/utils/gameStatusUtils";
import { getRatingColor, getStatusColor } from "src/utils/colors";
import { triggerHapticFeedback } from "src/utils/systemUtils";

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
        const [isRemoveClicked, setIsRemoveClicked] = useState(false);
        const prevSwipeX = useRef(0);

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

        const panResponder = useMemo(
            () =>
                PanResponder.create({
                    onStartShouldSetPanResponder: () => !isReordering,
                    onMoveShouldSetPanResponder: (_, gestureState) => {
                        if (isReordering) return false;
                        return (
                            Math.abs(gestureState.dx) >
                            Math.abs(gestureState.dy)
                        );
                    },
                    onPanResponderGrant: () => {
                        pan.setValue(0);
                        prevSwipeX.current = 0;
                    },
                    onPanResponderMove: (_, gestureState) => {
                        if (isReordering) return;

                        // Only allow right swipe if not undiscovered
                        const maxRight =
                            questGame.gameStatus === "undiscovered"
                                ? 0
                                : isRemoveClicked
                                ? 200 // Allow full swipe when remove is clicked
                                : 100; // Only show first button otherwise
                        // Make left swipe wider for undiscovered games
                        const maxLeft =
                            questGame.gameStatus === "undiscovered"
                                ? -300
                                : -200;
                        const newX = Math.max(
                            maxLeft,
                            Math.min(maxRight, gestureState.dx)
                        );

                        // Add haptic feedback only when crossing menu thresholds
                        if (
                            (prevSwipeX.current < 75 && newX >= 75) ||
                            (prevSwipeX.current > 75 && newX <= 75)
                        ) {
                            // Crossing the remove menu threshold
                            triggerHapticFeedback("light");
                        } else if (
                            isRemoveClicked &&
                            ((prevSwipeX.current < 150 && newX >= 150) ||
                                (prevSwipeX.current > 150 && newX <= 150))
                        ) {
                            // Crossing the confirm menu threshold
                            triggerHapticFeedback("light");
                        } else if (
                            (prevSwipeX.current > -75 && newX <= -75) ||
                            (prevSwipeX.current < -75 && newX >= -75)
                        ) {
                            // Crossing the status change menu threshold
                            triggerHapticFeedback("light");
                        }

                        prevSwipeX.current = newX;
                        pan.setValue(newX);
                    },
                    onPanResponderRelease: (_, gestureState) => {
                        if (isReordering) return;
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
                            // If we're swiping far enough to confirm and remove is clicked
                            if (gestureState.dx > 150 && isRemoveClicked) {
                                Animated.spring(pan, {
                                    toValue: 200,
                                    useNativeDriver: false,
                                }).start();
                            } else {
                                // Always snap to first button position if not in remove mode
                                Animated.spring(pan, {
                                    toValue: 100,
                                    useNativeDriver: false,
                                }).start();
                            }
                        } else {
                            // Close menu
                            Animated.spring(pan, {
                                toValue: 0,
                                useNativeDriver: false,
                            }).start(() => {
                                if (isRemoveClicked) {
                                    setIsRemoveClicked(false);
                                }
                            });
                        }
                    },
                }),
            [questGame.gameStatus, isReordering, pan, isRemoveClicked]
        );

        const dragPanResponder = useMemo(
            () =>
                PanResponder.create({
                    onStartShouldSetPanResponder: () => true,
                    onMoveShouldSetPanResponder: () => true,
                    onPanResponderGrant: () => {
                        setIsReordering(true);
                        triggerHapticFeedback("light");
                        if (reorder) {
                            reorder();
                        }
                    },
                    onPanResponderRelease: () => {
                        setIsReordering(false);
                        triggerHapticFeedback("light");
                    },
                    onPanResponderTerminate: () => {
                        setIsReordering(false);
                        triggerHapticFeedback("light");
                    },
                }),
            [reorder]
        );

        const handleRemoveClick = () => {
            triggerHapticFeedback("light");
            setIsRemoveClicked(true);
            Animated.spring(pan, {
                toValue: 200,
                useNativeDriver: false,
            }).start();
        };

        const handleCancel = () => {
            triggerHapticFeedback("light");
            Animated.spring(pan, {
                toValue: 0,
                useNativeDriver: false,
            }).start(() => {
                setIsRemoveClicked(false);
            });
        };

        const handleConfirmRemove = () => {
            if (containerHeight === 0) return;
            setIsAnimating(true);
            triggerHapticFeedback("light");

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

        const handleStatusSelect = (status: GameStatus) => {
            if (containerHeight === 0) return;
            setIsAnimating(true);
            triggerHapticFeedback("light");

            const animations = [
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
            ];

            if (questGame.gameStatus === "undiscovered") {
                animations.pop();
            }

            Animated.parallel(animations).start(() => {
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
                    gameStatus: questGame.gameStatus,
                }),
            [navigation, questGame.id, questGame.name]
        );

        const genresText = useMemo(
            () =>
                questGame.genres
                    ?.slice(0, 2)
                    .map((genre) => genre.name)
                    .join(", ") || "",
            [questGame.genres]
        );

        const getStatusButtonStyles = (status: GameStatus) => {
            const color = getStatusColor(status);
            return {
                backgroundColor: color,
            };
        };

        let coverUrl;
        if (questGame.cover && questGame.cover.url) {
            coverUrl = questGame.cover.url.replace("t_thumb", "t_cover_big");
        } else {
            coverUrl = require("../../../../assets/next-quest-icons/game_item_placeholder.png");
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
                <View style={styles.innerContainer}>
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
                                                borderTopRightRadius: 8,
                                                borderBottomRightRadius: 8,
                                            },
                                        ]}
                                        onPress={() =>
                                            handleStatusSelect(status)
                                        }
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
                                        borderTopLeftRadius: 8,
                                        borderBottomLeftRadius: 8,
                                    },
                                    {
                                        backgroundColor: isRemoveClicked
                                            ? colorSwatch.background.darkest
                                            : colorSwatch.accent.pink,
                                    },
                                ]}
                                activeOpacity={0.7}
                                onPress={
                                    isRemoveClicked
                                        ? handleCancel
                                        : handleRemoveClick
                                }
                            >
                                <Text
                                    variant="button"
                                    style={[
                                        styles.statusButtonText,
                                        {
                                            color: isRemoveClicked
                                                ? colorSwatch.text.primary
                                                : colorSwatch.text.inverse,
                                        },
                                    ]}
                                >
                                    {isRemoveClicked ? "Cancel" : "Remove"}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.statusButton,
                                    {
                                        backgroundColor:
                                            colorSwatch.accent.pink,
                                        opacity: isRemoveClicked ? 1 : 0.3,
                                    },
                                ]}
                                activeOpacity={0.7}
                                onPress={handleConfirmRemove}
                                disabled={!isRemoveClicked}
                            >
                                <Text
                                    variant="button"
                                    style={[
                                        styles.statusButtonText,
                                        !isRemoveClicked && { opacity: 0.3 },
                                    ]}
                                >
                                    Confirm
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
                            questGame.gameStatus !== "undiscovered" && (
                                <View
                                    style={styles.dragHandle}
                                    {...dragPanResponder.panHandlers}
                                >
                                    <View style={styles.dragHandleContent}>
                                        <Text
                                            style={{
                                                color: getStatusColor(
                                                    questGame.gameStatus
                                                ),
                                            }}
                                            numberOfLines={1}
                                        >
                                            {questGame.priority}
                                        </Text>
                                        <SimpleLineIcons
                                            name="menu"
                                            size={20}
                                            color={colorSwatch.text.muted}
                                        />
                                    </View>
                                </View>
                            )}
                        <Pressable
                            onPress={handlePress}
                            style={styles.pressableNavigation}
                        >
                            <FullHeightImage
                                source={coverUrl}
                                loaderColor={getStatusColor(
                                    questGame.gameStatus
                                )}
                            />

                            <View style={styles.contentContainer}>
                                <View style={styles.titleContainer}>
                                    <Text
                                        variant="subtitle"
                                        style={[
                                            styles.title,

                                            {
                                                color: getStatusColor(
                                                    questGame.gameStatus
                                                ),
                                            },
                                        ]}
                                        numberOfLines={1}
                                    >
                                        {questGame.name}
                                    </Text>
                                    {questGame.personalRating &&
                                        questGame.gameStatus ===
                                            "completed" && (
                                            <Text
                                                variant="caption"
                                                style={[
                                                    styles.rating,
                                                    {
                                                        color: getRatingColor(
                                                            questGame.personalRating ||
                                                                0
                                                        ),
                                                    },
                                                ]}
                                            >
                                                ({questGame.personalRating}/10)
                                            </Text>
                                        )}
                                </View>
                                <View style={styles.detailsContainer}>
                                    <Text
                                        variant="small"
                                        style={styles.textSecondary}
                                        numberOfLines={1}
                                    >
                                        {/* Display the selected platform name if available. 
                                                If not, check the number of platforms:
                                                - Show "No Platforms" if there are none.
                                                - Show the platform name if there is exactly one.
                                                - Show the number of platforms if there are multiple. */}
                                        {questGame.selectedPlatform?.name ||
                                            (questGame.platforms.length === 0
                                                ? "No Platforms"
                                                : questGame.platforms.length > 1
                                                ? `${questGame.platforms.length} Platforms`
                                                : questGame.platforms[0].name)}
                                    </Text>
                                    {platformReleaseDate && (
                                        <Text
                                            variant="small"
                                            style={styles.textSecondary}
                                            numberOfLines={1}
                                        >
                                            {formatReleaseDate(
                                                platformReleaseDate.date
                                            )}
                                        </Text>
                                    )}
                                    <Text
                                        variant="small"
                                        style={styles.textSecondary}
                                        numberOfLines={1}
                                    >
                                        {genresText}
                                    </Text>
                                </View>
                            </View>
                        </Pressable>
                    </Animated.View>
                </View>
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
                        color={getStatusColor(questGame.gameStatus)}
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
                        color={getStatusColor(questGame.gameStatus)}
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
        backgroundColor: colorSwatch.background.darkest,
        opacity: 1,
        borderRadius: 12,
        marginHorizontal: 4,
        marginVertical: 4,
        shadowColor: colorSwatch.background.dark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        borderWidth: 1,
        borderColor: colorSwatch.neutral.darkGray,
        minHeight: 120,
    },
    innerContainer: {
        position: "relative",
        overflow: "hidden",
        flex: 1,
        margin: 2,
        borderRadius: 10,
    },
    gameContainer: {
        flexDirection: "row",
        flex: 1,
        backgroundColor: colorSwatch.background.darkest,
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
        width: 200, // Increased width to accommodate both buttons
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
    titleContainer: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 4,
    },
    statusButton: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 8,
        margin: 1,
    },
    statusButtonText: {
        fontSize: 14,
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
    title: {
        fontSize: 16,
        color: colorSwatch.text.primary,
        fontFamily: "Inter-Regular",
        flexWrap: "wrap",
        flex: 1,
        lineHeight: 20,
    },
    pressableNavigation: {
        flexDirection: "row",
        flex: 1,
        paddingHorizontal: 12,
        paddingVertical: 8,
        alignItems: "flex-start",
        gap: 12,
    },
    pressed: {},
    rating: {
        fontSize: 10,
        flexShrink: 0,
    },
    contentContainer: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "flex-start",
        gap: 8,
    },
    detailsContainer: {
        justifyContent: "flex-start",
        alignItems: "flex-start",
        gap: 4,
        flex: 1,
    },
    textSecondary: {
        color: colorSwatch.text.muted,
        lineHeight: 18,
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
