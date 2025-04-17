import { Vibration } from "react-native";

/**
 * Safely triggers haptic feedback using React Native's Vibration API
 * @param type The type of haptic feedback to trigger
 */
export const triggerHapticFeedback = (
    type: "light" | "medium" | "heavy" = "light"
) => {
    try {
        // Use basic vibration with different durations for different intensities
        const duration = type === "light" ? 50 : type === "medium" ? 100 : 150;
        Vibration.vibrate(duration);
    } catch (error) {
        console.warn("Vibration not available:", error);
    }
};
