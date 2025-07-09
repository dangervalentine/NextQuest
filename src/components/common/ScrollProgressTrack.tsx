import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    View,
    StyleSheet,
    Pressable,
    Animated,
} from "react-native";
import { colorSwatch } from "src/constants/theme/colorConstants";
import { theme } from "src/constants/theme/styles";
import { useGameStatus } from "src/contexts/GameStatusContext";
import { getStatusColor } from "src/utils/colorsUtils";
import { HapticFeedback } from "src/utils/hapticUtils";

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
}

const ScrollProgressTrack: React.FC<ScrollProgressTrackProps> = ({
    scrollPosition,
    onScrollToPosition,
    contentHeight,
    containerHeight,
    visible = true,
    tooltipText,
    trackWidth = 12,
    thumbHeight = 24,
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

    // Show/hide track based on visibility
    useEffect(() => {
        Animated.parallel([
            Animated.timing(trackOpacity, {
                toValue: visible ? 0.3 : 0,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(thumbOpacity, {
                toValue: visible ? 0.8 : 0,
                duration: 300,
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
    const thumbPosition = Math.max(0, Math.min(
        maxThumbPosition,
        scrollPosition * maxThumbPosition
    ));

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
    }, [availableHeight, onScrollToPosition, tooltipText, animateTooltip, scrollPosition]);

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

    if (!visible || containerHeight < 100 || contentHeight < containerHeight) return null;

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
                            width: trackWidth + 4,
                            height: currentThumbHeight,
                            transform: [
                                { translateY: thumbPosition },
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
        right: 8,
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
