import React, { memo, useMemo, useRef, useState, useEffect } from "react";
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
import { colorSwatch } from "src/constants/theme/colorConstants";
import { formatReleaseDate } from "src/utils/dateUtils";
import { ScreenNavigationProp } from "src/navigation/navigationTypes";
import FullHeightImage from "../../shared/FullHeightImage";
import { getStatusLabel } from "src/utils/gameStatusUtils";
import { getRatingColor, getStatusColor } from "src/utils/colorsUtils";
import { HapticFeedback } from "src/utils/hapticUtils";
import { theme } from "src/constants/theme/styles";
import { showToast } from "src/components/common/QuestToast";
import Toast from "react-native-toast-message";
import { useGames } from "src/contexts/GamesContext";

// Shared state to track if hint has been shown in this session
let hasShownHintInSession = false;

interface GameItemProps {
    questGame: MinimalQuestGame;
    reorder?: () => void;
    isFirstItem?: boolean;
    moveToTop?: (id: number, status: GameStatus) => void;
    moveToBottom?: (id: number, status: GameStatus) => void;
    isActive?: boolean;
    canReorder?: boolean;
    onStatusChange?: (newStatus: GameStatus, currentStatus: GameStatus) => void;
}

const SWIPE_THRESHOLD = 20; // Reduced from 75 to make menus easier to open
const LEFT_MENU_POSITION = -305;
const RIGHT_MENU_POSITION = 200;

const GameItem: React.FC<GameItemProps> = memo(
    ({
        questGame,
        reorder,
        isFirstItem,
        moveToTop,
        moveToBottom,
        isActive = false,
        canReorder = false,
        onStatusChange,
    }) => {
        const navigation = useNavigation<ScreenNavigationProp>();
        const { handleRemoveItem, handleStatusChange } = useGames();

        // Animation values
        const pan = useRef(new Animated.Value(0)).current;
        const leftChevronOpacity = useRef(new Animated.Value(0)).current;
        const rightChevronOpacity = useRef(new Animated.Value(0)).current;
        const leftChevronPosition = useRef(new Animated.Value(0)).current;
        const rightChevronPosition = useRef(new Animated.Value(0)).current;
        const heightAnim = useRef(new Animated.Value(1)).current;

        // State variables
        const [isReordering, setIsReordering] = useState(false);
        const [hasShownHint, setHasShownHint] = useState(false);
        const [isRemoveClicked, setIsRemoveClicked] = useState(false);
        const [isLeftMenuOpen, setIsLeftMenuOpen] = useState(false);
        const [isRightMenuOpen, setIsRightMenuOpen] = useState(false);
        const prevSwipeX = useRef(0);
        const [panValue, setPanValue] = useState(0);

        // Layout variables
        const [containerHeight, setContainerHeight] = useState<number>(0);
        const [isInitialHeight, setIsInitialHeight] = useState(true);
        const [isAnimating, setIsAnimating] = useState(false);

        const containerRef = useRef<View>(null);
        const [itemYPosition, setItemYPosition] = useState<number | null>(null);
        const [itemHeight, setItemHeight] = useState<number | null>(null);

        // Get status color once and reuse it throughout the component
        const statusColor = getStatusColor(questGame.gameStatus);

        // Add a listener to track pan value
        useEffect(() => {
            const panListener = pan.addListener(({ value }) => {
                setPanValue(value);
            });

            return () => {
                pan.removeListener(panListener);
            };
        }, [pan]);

        useFocusEffect(
            React.useCallback(() => {
                if (isFirstItem && !hasShownHint && !hasShownHintInSession) {
                    // Wait a tick to ensure layout pass
                    requestAnimationFrame(() => {
                        if (containerRef.current) {
                            containerRef.current.measure((x, y, width, height, pageX, pageY) => {
                                setItemYPosition(pageY);
                                setItemHeight(height);

                                setTimeout(() => {
                                    showToast({
                                        type: "success",
                                        text2: "Swipe to change the status or priority of a game",
                                        visibilityTime: 3000,
                                        topOffset: height + 12,
                                        position: "top",
                                        color: statusColor || colorSwatch.accent.cyan,
                                    });

                                    // Show hint animation after
                                    showHint();
                                }, 2000);
                            });
                        }
                    });

                    setHasShownHint(true);
                    hasShownHintInSession = true;
                }

                // Cleanup function - dismisses toast when component loses focus
                return () => {
                    Toast.hide();
                };
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

                // Left swipe demonstration - show the status menu
                Animated.parallel([
                    Animated.timing(leftChevronPosition, {
                        toValue: -300,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    Animated.timing(leftChevronOpacity, {
                        toValue: 0.75,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pan, {
                        toValue: -100,
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
                        toValue: 100,
                        duration: 300,
                        delay: 100,
                        useNativeDriver: false,
                    }),
                ]),
                // Pause to show the right menu
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
                        pan.setValue(panValue);
                        pan.setOffset(0);
                    },
                    onPanResponderMove: (_, gestureState) => {
                        if (isReordering) return;

                        let newX = panValue + gestureState.dx;

                        // Prevent right swipes past 0 when !canReorder
                        if (!canReorder && newX > 0) {
                            newX = 0;
                        }

                        // Constrain within left and right menu bounds
                        const maxRight =
                            questGame.gameStatus === "undiscovered" ||
                                !canReorder
                                ? 0
                                : RIGHT_MENU_POSITION;

                        const maxLeft = LEFT_MENU_POSITION;

                        newX = Math.max(maxLeft, Math.min(maxRight, newX));

                        // Haptic feedback when crossing thresholds
                        if (isLeftMenuOpen) {
                            // Closing left menu - trigger when moving away from full open position
                            if (
                                prevSwipeX.current <=
                                LEFT_MENU_POSITION + SWIPE_THRESHOLD &&
                                newX > LEFT_MENU_POSITION + SWIPE_THRESHOLD
                            ) {
                                HapticFeedback.selection();
                            }
                        } else if (isRightMenuOpen) {
                            // Closing right menu - trigger when moving away from full open position
                            if (
                                prevSwipeX.current >=
                                RIGHT_MENU_POSITION - SWIPE_THRESHOLD &&
                                newX < RIGHT_MENU_POSITION - SWIPE_THRESHOLD
                            ) {
                                HapticFeedback.selection();
                            }
                        } else {
                            // Opening menu - trigger when moving away from center
                            if (
                                (prevSwipeX.current > -SWIPE_THRESHOLD &&
                                    newX <= -SWIPE_THRESHOLD) ||
                                (prevSwipeX.current < SWIPE_THRESHOLD &&
                                    newX >= SWIPE_THRESHOLD)
                            ) {
                                HapticFeedback.selection();
                            }
                        }

                        prevSwipeX.current = newX;
                        pan.setValue(newX);
                    },
                    onPanResponderRelease: () => {
                        if (isReordering) return;

                        // Get the current position after the gesture
                        const currentPosition = panValue;

                        // For slow movements, use position thresholds rather than velocity
                        const significantRightMovement =
                            currentPosition > SWIPE_THRESHOLD;
                        const significantLeftMovement =
                            currentPosition < -SWIPE_THRESHOLD;

                        // Calculate distance from menu position
                        const distanceFromLeftMenu = Math.abs(
                            currentPosition - LEFT_MENU_POSITION
                        );
                        const distanceFromRightMenu = Math.abs(
                            currentPosition - RIGHT_MENU_POSITION
                        );

                        if (
                            (isLeftMenuOpen &&
                                distanceFromLeftMenu > SWIPE_THRESHOLD) ||
                            (isRightMenuOpen &&
                                distanceFromRightMenu > SWIPE_THRESHOLD)
                        ) {
                            HapticFeedback.selection();

                            Animated.spring(pan, {
                                toValue: 0,
                                useNativeDriver: false,
                            }).start(() => {
                                if (isRemoveClicked) {
                                    setIsRemoveClicked(false);
                                }
                                setIsLeftMenuOpen(false);
                                setIsRightMenuOpen(false);
                            });
                        }
                        // Opening left menu (status)
                        else if (significantLeftMovement) {
                            Animated.spring(pan, {
                                toValue: LEFT_MENU_POSITION,
                                useNativeDriver: false,
                            }).start(() => {
                                setIsLeftMenuOpen(true);
                                setIsRightMenuOpen(false);
                            });
                        }
                        // Opening right menu (priority)
                        else if (significantRightMovement) {
                            Animated.spring(pan, {
                                toValue: RIGHT_MENU_POSITION,
                                useNativeDriver: false,
                                tension: 40,
                                friction: 7,
                            }).start(() => {
                                setIsRightMenuOpen(true);
                                setIsLeftMenuOpen(false);
                            });
                        }
                        // Return to center/closed
                        else {
                            Animated.spring(pan, {
                                toValue: 0,
                                useNativeDriver: false,
                            }).start(() => {
                                if (isRemoveClicked) {
                                    setIsRemoveClicked(false);
                                }
                                setIsLeftMenuOpen(false);
                                setIsRightMenuOpen(false);
                            });
                        }
                    },
                }),
            [
                questGame.gameStatus,
                isReordering,
                pan,
                isRemoveClicked,
                canReorder,
                panValue,
            ]
        );

        const dragPanResponder = useMemo(
            () =>
                PanResponder.create({
                    onStartShouldSetPanResponder: () => canReorder,
                    onMoveShouldSetPanResponder: () => canReorder,
                    onPanResponderGrant: () => {
                        setIsReordering(true);
                        HapticFeedback.selection();
                        if (reorder) {
                            reorder();
                        }
                    },
                    onPanResponderRelease: () => {
                        setIsReordering(false);
                        HapticFeedback.selection();
                    },
                    onPanResponderTerminate: () => {
                        setIsReordering(false);
                        HapticFeedback.selection();
                    },
                }),
            [reorder, canReorder]
        );

        const handleRemoveClick = () => {
            HapticFeedback.selection();
            setIsRemoveClicked(true);
        };

        const handleCancel = () => {
            HapticFeedback.selection();
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
            HapticFeedback.selection();

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
                handleRemoveItem(questGame.id, "undiscovered");
            });
        };

        const handleStatusSelect = (status: GameStatus) => {
            if (containerHeight === 0) return;
            setIsAnimating(true);
            HapticFeedback.selection();

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
                } else {
                    handleStatusChange(questGame.id, status, questGame.gameStatus);
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

        const handleMoveToTop = () => {
            if (moveToTop && questGame.gameStatus !== "undiscovered") {
                HapticFeedback.selection();
                moveToTop(questGame.id, questGame.gameStatus);
                // Close menu after action
                Animated.spring(pan, {
                    toValue: 0,
                    useNativeDriver: false,
                }).start();
            }
        };

        const handleMoveToBottom = () => {
            if (moveToBottom && questGame.gameStatus !== "undiscovered") {
                HapticFeedback.selection();
                moveToBottom(questGame.id, questGame.gameStatus);
                // Close menu after action
                Animated.spring(pan, {
                    toValue: 0,
                    useNativeDriver: false,
                }).start();
            }
        };

        let coverUrl;
        if (questGame.cover && questGame.cover.url) {
            coverUrl = questGame.cover.url.replace("t_thumb", "t_cover_big");
        } else {
            coverUrl = require("../../../../assets/next-quest-icons/game_item_placeholder.png");
        }

        return (
            <Animated.View
                ref={containerRef}
                style={[
                    styles.container,
                    isActive && {
                        borderColor: getStatusColor(questGame.gameStatus),
                    },
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
                    {!isReordering && panValue < -5 && (
                        <View
                            style={[
                                styles.statusMenu,
                                questGame.gameStatus === "undiscovered" && {
                                    width: 300,
                                },
                            ]}
                        >
                            {!isRemoveClicked ? (
                                <>
                                    {getAvailableStatuses(
                                        questGame.gameStatus
                                    ).map((status, index) => (
                                        <TouchableOpacity
                                            key={status}
                                            style={[
                                                styles.statusButton,
                                                {
                                                    backgroundColor: getStatusColor(
                                                        status
                                                    ),
                                                },
                                                index ===
                                                getAvailableStatuses(
                                                    questGame.gameStatus
                                                ).length -
                                                1 &&
                                                questGame.gameStatus ===
                                                "undiscovered" && {
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
                                    ))}
                                    {questGame.gameStatus !==
                                        "undiscovered" && (
                                            <TouchableOpacity
                                                style={[
                                                    styles.statusButton,
                                                    {
                                                        backgroundColor:
                                                            colorSwatch.accent.pink,
                                                        borderTopRightRadius: 8,
                                                        borderBottomRightRadius: 8,
                                                    },
                                                ]}
                                                activeOpacity={0.7}
                                                onPress={handleRemoveClick}
                                            >
                                                <Text
                                                    variant="button"
                                                    style={[
                                                        styles.statusButtonText,
                                                    ]}
                                                >
                                                    Remove
                                                </Text>
                                            </TouchableOpacity>
                                        )}
                                </>
                            ) : (
                                <View
                                    style={{
                                        flexDirection: "row",
                                        justifyContent: "flex-end",
                                        flex: 1,
                                    }}
                                >
                                    <TouchableOpacity
                                        style={[
                                            styles.statusButton,
                                            {
                                                backgroundColor:
                                                    colorSwatch.accent.pink,
                                                width: 200,
                                                flex: 0,
                                            },
                                        ]}
                                        activeOpacity={0.7}
                                        onPress={handleConfirmRemove}
                                    >
                                        <Text
                                            variant="button"
                                            style={styles.statusButtonText}
                                        >
                                            Confirm
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[
                                            styles.statusButton,
                                            {
                                                backgroundColor:
                                                    colorSwatch.background
                                                        .medium,
                                                borderTopRightRadius: 8,
                                                borderBottomRightRadius: 8,
                                                width: 100,
                                                flex: 0,
                                            },
                                        ]}
                                        activeOpacity={0.7}
                                        onPress={handleCancel}
                                    >
                                        <Text
                                            variant="button"
                                            style={[
                                                styles.statusButtonText,
                                                {
                                                    color:
                                                        colorSwatch.text
                                                            .primary,
                                                },
                                            ]}
                                        >
                                            Cancel
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    )}
                    {!isReordering &&
                        panValue > 10 &&
                        questGame.gameStatus !== "undiscovered" &&
                        canReorder && (
                            <View style={styles.rightMenu}>
                                <TouchableOpacity
                                    style={[
                                        styles.statusButton,
                                        {
                                            backgroundColor:
                                                colorSwatch.background.darkest,
                                            borderTopLeftRadius: 8,
                                            borderBottomLeftRadius: 8,
                                            borderRightWidth: 1,
                                            borderRightColor:
                                                colorSwatch.neutral.darkGray,
                                        },
                                    ]}
                                    activeOpacity={0.7}
                                    onPress={handleMoveToTop}
                                >
                                    <MaterialCommunityIcons
                                        name="chevron-up"
                                        size={24}
                                        color={statusColor}
                                    />
                                    <Text
                                        variant="button"
                                        style={[
                                            styles.statusButtonText,
                                            {
                                                color: statusColor,
                                            },
                                        ]}
                                    >
                                        Top
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.statusButton,
                                        {
                                            backgroundColor:
                                                colorSwatch.background.darkest,
                                            borderColor:
                                                colorSwatch.background.dark,
                                            borderWidth: 1,
                                        },
                                    ]}
                                    activeOpacity={0.7}
                                    onPress={handleMoveToBottom}
                                >
                                    <MaterialCommunityIcons
                                        name="chevron-down"
                                        size={24}
                                        color={statusColor}
                                    />
                                    <Text
                                        variant="button"
                                        style={[
                                            styles.statusButtonText,
                                            {
                                                color: statusColor,
                                            },
                                        ]}
                                    >
                                        Bottom
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
                            questGame.gameStatus !== "undiscovered" &&
                            canReorder && (
                                <View
                                    style={styles.dragHandle}
                                    {...dragPanResponder.panHandlers}
                                >
                                    <View style={styles.dragHandleContent}>
                                        <Text
                                            style={{
                                                color: statusColor,
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
                                loaderColor={statusColor}
                            />

                            <View style={styles.contentContainer}>
                                <View style={styles.titleContainer}>
                                    <Text
                                        variant="subtitle"
                                        style={[
                                            styles.title,
                                            {
                                                color: statusColor,
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
                        color={statusColor}
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
                        color={statusColor}
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
            prevProps.isFirstItem !== nextProps.isFirstItem ||
            prevProps.moveToTop !== nextProps.moveToTop ||
            prevProps.moveToBottom !== nextProps.moveToBottom ||
            prevProps.canReorder !== nextProps.canReorder ||
            prevProps.isActive !== nextProps.isActive;

        return !shouldUpdate; // Return true to prevent re-render
    }
);

const styles = StyleSheet.create({
    container: {
        position: "relative",
        backgroundColor: colorSwatch.background.darkest,
        opacity: 1,
        borderRadius: theme.borderRadius,
        marginHorizontal: 4,
        marginVertical: 2,
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
        borderRadius: theme.borderRadius,
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
        width: 300,
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
        width: 200,
        flexDirection: "row",
        alignItems: "stretch",
        borderRightWidth: 1,
        borderRightColor: colorSwatch.neutral.darkGray,
    },
    activeItem: {
        borderWidth: 2,
        borderColor: colorSwatch.accent.cyan,
        borderRadius: theme.borderRadius,
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
        margin: 1,
        flexDirection: "column",
    },
    statusButtonText: {
        fontSize: 14,
        color: colorSwatch.text.inverse,
        textAlign: "center",
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
        borderRadius: theme.borderRadius,
    },
    leftChevron: {
        right: -50,
    },
    rightChevron: {
        left: -50,
    },
});

export default GameItem;
