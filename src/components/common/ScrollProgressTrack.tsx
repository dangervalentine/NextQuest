import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    View,
    StyleSheet,
    Pressable,
    Animated,
} from "react-native";
import { colorSwatch } from "src/constants/theme/colorConstants";
import { useGameStatus } from "src/contexts/GameStatusContext";
import { getStatusColor } from "src/utils/colorsUtils";
import { HapticFeedback } from "src/utils/hapticUtils";

/**
 * Hook for creating smooth animated scroll position values
 * Use this in parent components for optimal scroll tracking performance
 */
export const useAnimatedScrollPosition = () => {
    const animatedValue = useRef(new Animated.Value(0)).current;

    /**
     * Returns an onScroll handler that updates the animated value
     * @param contentHeight - Total scrollable content height
     * @param containerHeight - Visible container height
     */
    const createScrollHandler = useCallback((contentHeight: number, containerHeight: number) => {
        const maxScrollDistance = Math.max(0, contentHeight - containerHeight);

        return Animated.event(
            [{ nativeEvent: { contentOffset: { y: animatedValue } } }],
            {
                useNativeDriver: false, // Required for layout calculations
                listener: (event: any) => {
                    // Optional: Add any additional scroll handling here
                    // The animated value is automatically updated by Animated.event
                }
            }
        );
    }, [animatedValue]);

    /**
     * Returns normalized scroll position (0-1) as an animated value
     */
    const getNormalizedScrollPosition = useCallback((contentHeight: number, containerHeight: number) => {
        const maxScrollDistance = Math.max(1, contentHeight - containerHeight);

        return animatedValue.interpolate({
            inputRange: [0, maxScrollDistance],
            outputRange: [0, 1],
            extrapolate: 'clamp',
        });
    }, [animatedValue]);

    /**
     * Manually set the animated scroll value (useful for programmatic scrolling)
     * @param value - The new scroll offset value
     */
    const setScrollValue = useCallback((value: number) => {
        animatedValue.setValue(value);
    }, [animatedValue]);

    return {
        createScrollHandler,
        getNormalizedScrollPosition,
        rawScrollValue: animatedValue,
        setScrollValue,
    };
};

interface ScrollProgressTrackProps {
    /** Current scroll position (0 to 1) */
    scrollPosition: number;
    /** Callback when user taps on track to scroll */
    onScrollToPosition: (position: number) => void;
    /** Total content height */
    contentHeight: number;
    /** Visible container height */
    containerHeight: number;
    /** Whether the track should be visible */
    visible?: boolean;
    /** Optional tooltip text to show on press */
    tooltipText?: string;
    /** Track width */
    trackWidth?: number;
    /** Thumb height */
    thumbHeight?: number;
    /** Optional animated scroll position for smoother tracking */
    animatedScrollPosition?: Animated.Value;
}

const ScrollProgressTrack: React.FC<ScrollProgressTrackProps> = ({
    scrollPosition,
    onScrollToPosition,
    contentHeight,
    containerHeight,
    visible = true,
    tooltipText,
    trackWidth = 4,
    thumbHeight = 24,
    animatedScrollPosition,
}) => {
    const { activeStatus } = useGameStatus();
    const statusColor = getStatusColor(activeStatus);
    const [isPressed, setIsPressed] = useState(false);
    const [pressPosition, setPressPosition] = useState(0);
    const [showTooltip, setShowTooltip] = useState(false);

    // Animation values
    const trackOpacity = useRef(new Animated.Value(0)).current;
    const thumbOpacity = useRef(new Animated.Value(0)).current;
    const pressRipple = useRef(new Animated.Value(0)).current;
    const tooltipOpacity = useRef(new Animated.Value(0)).current;
    const tooltipScale = useRef(new Animated.Value(0.8)).current;

    // Internal animated scroll position - falls back to prop-based updates if no animated value provided
    const internalScrollPosition = useRef(new Animated.Value(scrollPosition)).current;

    // Update internal scroll position when prop changes (fallback for non-animated usage)
    useEffect(() => {
        if (!animatedScrollPosition) {
            Animated.timing(internalScrollPosition, {
                toValue: scrollPosition,
                duration: 0, // Immediate update, but still benefits from native driver
                useNativeDriver: false, // translateY needs to run on JS thread for layout calculations
            }).start();
        }
    }, [scrollPosition, animatedScrollPosition]);

    // Show/hide track based on visibility
    useEffect(() => {
        const duration = visible ? 0 : 400; // Fast fade-in, slower fade-out

        Animated.parallel([
            Animated.timing(trackOpacity, {
                toValue: visible ? 0.3 : 0,
                duration: duration,
                useNativeDriver: true,
            }),
            Animated.timing(thumbOpacity, {
                toValue: visible ? 0.8 : 0,
                duration: duration,
                useNativeDriver: true,
            }),
        ]).start();
    }, [visible]);

    // Calculate track dimensions
    const availableHeight = Math.max(100, containerHeight); // Minimum height

    // Calculate dynamic thumb height based on content ratio
    const calculateThumbHeight = () => {
        if (contentHeight <= containerHeight) {
            return thumbHeight; // Use minimum height when content fits
        }

        // Calculate proportional height: visible area / total content * track height
        const ratio = containerHeight / contentHeight;
        const dynamicHeight = Math.max(thumbHeight, availableHeight * ratio);

        // Ensure thumb doesn't exceed track height and has reasonable bounds
        return Math.min(dynamicHeight, availableHeight * 0.8); // Max 80% of track
    };

    const currentThumbHeight = calculateThumbHeight();
    const maxThumbPosition = Math.max(0, availableHeight - currentThumbHeight);

    // Use the provided animated value or fall back to internal one
    const activeScrollPosition = animatedScrollPosition || internalScrollPosition;

    // Create animated thumb position with proper normalization
    const animatedThumbPosition = animatedScrollPosition ?
        // For raw scroll values, normalize based on content dimensions
        animatedScrollPosition.interpolate({
            inputRange: [0, Math.max(1, contentHeight - containerHeight)],
            outputRange: [0, maxThumbPosition],
            extrapolate: 'clamp',
        }) :
        // For normalized values (0-1), use directly
        activeScrollPosition.interpolate({
            inputRange: [0, 1],
            outputRange: [0, maxThumbPosition],
            extrapolate: 'clamp',
        });

    // Handle press animations
    const animatePress = useCallback((pressed: boolean) => {
        if (pressed) {
            HapticFeedback.light();
            Animated.parallel([
                Animated.timing(pressRipple, {
                    toValue: 1,
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.timing(thumbOpacity, {
                    toValue: 1,
                    duration: 150,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(pressRipple, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(thumbOpacity, {
                    toValue: visible ? 0.8 : 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible]);

    // Handle tooltip animations
    const animateTooltip = useCallback((show: boolean) => {
        if (show) {
            setShowTooltip(true);
            Animated.parallel([
                Animated.timing(tooltipOpacity, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.spring(tooltipScale, {
                    toValue: 1,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(tooltipOpacity, {
                    toValue: 0,
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.timing(tooltipScale, {
                    toValue: 0.8,
                    duration: 150,
                    useNativeDriver: true,
                }),
            ]).start(() => setShowTooltip(false));
        }
    }, []);

    // Handle press with better touch detection
    const handlePress = useCallback((event: any) => {
        const { locationY } = event.nativeEvent;

        // Position relative to the track (no padding offset needed since container is now full height)
        const position = Math.max(0, Math.min(1, locationY / availableHeight));

        setPressPosition(locationY);
        onScrollToPosition(position);
        HapticFeedback.medium();

        // Show tooltip if available
        if (tooltipText) {
            animateTooltip(true);
            setTimeout(() => animateTooltip(false), 1000);
        }
    }, [availableHeight, onScrollToPosition, tooltipText, animateTooltip]);

    // Handle press start
    const handlePressIn = useCallback(() => {
        setIsPressed(true);
        animatePress(true);
    }, [animatePress]);

    // Handle press end
    const handlePressOut = useCallback(() => {
        setIsPressed(false);
        animatePress(false);
        if (tooltipText) {
            setTimeout(() => animateTooltip(false), 500);
        }
    }, [animatePress, tooltipText, animateTooltip]);

    if (containerHeight < 100 || contentHeight < containerHeight) return null;

    return (
        <View style={styles.container} >
            {/* Track */}
            <Animated.View
                style={[
                    styles.track,
                    {
                        opacity: trackOpacity,
                        width: trackWidth,
                        height: availableHeight,
                    },
                ]}
            />

            {/* Pressable area */}
            <Pressable
                style={[
                    styles.pressableArea,
                    {
                        width: 64,
                        height: availableHeight,
                    },
                ]}
                hitSlop={{ top: 10, bottom: 10, left: 24, right: 0 }}
                onPress={handlePress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
            >
                {/* Thumb */}
                <Animated.View
                    style={[
                        styles.thumb,
                        {
                            opacity: thumbOpacity,
                            width: trackWidth,
                            height: currentThumbHeight,
                            transform: [
                                { translateY: animatedThumbPosition },
                            ],
                            backgroundColor: statusColor,
                        },
                    ]}
                />

                {/* Press ripple effect */}
                <Animated.View
                    style={[
                        styles.pressRipple,
                        {
                            opacity: pressRipple,
                            transform: [
                                { translateY: pressPosition - 15 },
                                {
                                    scale: pressRipple.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0.5, 1.5],
                                    })
                                },
                            ],
                            backgroundColor: statusColor,
                        },
                    ]}
                />
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: "center",
        zIndex: 1000,
    },
    track: {
        position: "absolute",
        backgroundColor: colorSwatch.neutral.gray,
    },
    pressableArea: {
        position: "absolute",
        justifyContent: "flex-start",
        alignItems: "center",
    },
    thumb: {
        position: "absolute",
        backgroundColor: colorSwatch.accent.cyan,
        shadowColor: colorSwatch.neutral.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    pressRipple: {
        position: "absolute",
        width: 20,
        height: 20,
        borderRadius: 15,
        backgroundColor: colorSwatch.accent.cyan,
    },

});

export default ScrollProgressTrack;
