import ReactNativeHapticFeedback from "react-native-haptic-feedback";
import { Platform, Vibration } from "react-native";

// Configure haptic feedback options
const HAPTIC_OPTIONS = {
    enableVibrateFallback: true, // Fall back to vibration if haptics aren't available
    ignoreAndroidSystemSettings: false, // Respect system haptic settings
};

// Custom vibration patterns for Android
const ANDROID_VIBRATION_PATTERNS: Record<HapticType, number[]> = {
    impactLight: [0, 5], // 5ms vibration - extremely subtle
    impactMedium: [0, 10], // 10ms vibration - very light
    impactHeavy: [0, 20], // 20ms vibration - medium
    notificationSuccess: [0, 20, 50, 20], // Success pattern
    notificationWarning: [0, 30, 50, 30], // Warning pattern
    notificationError: [0, 40, 50, 40], // Error pattern
    selection: [0, 5], // Selection - extra light
};

// Define haptic types for different interactions
export type HapticType =
    | "impactLight" // Light tap, for subtle UI interactions
    | "impactMedium" // Medium tap, for more significant actions
    | "impactHeavy" // Strong tap, for important or destructive actions
    | "notificationSuccess" // Success notification pattern
    | "notificationWarning" // Warning notification pattern
    | "notificationError" // Error notification pattern
    | "selection"; // Selection feedback pattern

/**
 * Triggers haptic feedback using native APIs when available
 * @param type The type of haptic feedback to trigger
 * @param options Optional configuration for the haptic feedback
 */
export const triggerHapticFeedback = (
    type: HapticType = "impactLight",
    options = HAPTIC_OPTIONS
) => {
    try {
        if (Platform.OS === "android") {
            // Use custom vibration patterns for Android
            const pattern = ANDROID_VIBRATION_PATTERNS[type];
            Vibration.vibrate(pattern, false);
        } else {
            // Use standard haptic feedback for iOS
            ReactNativeHapticFeedback.trigger(type, {
                ...options,
                ignoreAndroidSystemSettings: false,
            });
        }
    } catch (error) {
        console.warn("Haptic feedback not available:", error);
    }
};

// Helper functions for common haptic patterns
export const HapticFeedback = {
    /**
     * Light impact feedback - subtle tap
     * Use for:
     * - Button presses
     * - Toggle switches
     * - Minor UI interactions
     * - Menu item selection
     *
     * Note: On Android, this will use a light vibration pattern
     * Note: Will not trigger if device is in silent mode
     */
    light: () => triggerHapticFeedback("impactLight"),

    /**
     * Medium impact feedback - noticeable tap
     * Use for:
     * - Important button presses
     * - State changes
     * - Navigation actions
     * - Form submissions
     *
     * Note: On Android, this will use a medium vibration pattern
     * Note: Will not trigger if device is in silent mode
     */
    medium: () => triggerHapticFeedback("impactMedium"),

    /**
     * Heavy impact feedback - strong tap
     * Use for:
     * - Destructive actions
     * - Critical state changes
     * - Important confirmations
     * - Error states
     *
     * Note: On Android, this will use a strong vibration pattern
     * Note: Will not trigger if device is in silent mode
     */
    heavy: () => triggerHapticFeedback("impactHeavy"),

    /**
     * Success notification pattern - positive feedback
     * Use for:
     * - Successful operations
     * - Completion of tasks
     * - Achievement unlocks
     * - Positive confirmations
     *
     * Note: On Android, this will use a success vibration pattern
     * Note: Will not trigger if device is in silent mode
     */
    success: () => triggerHapticFeedback("notificationSuccess"),

    /**
     * Warning notification pattern - cautionary feedback
     * Use for:
     * - Warning messages
     * - Attention-required states
     * - Important notices
     * - System alerts
     *
     * Note: On Android, this will use a warning vibration pattern
     * Note: Will not trigger if device is in silent mode
     */
    warning: () => triggerHapticFeedback("notificationWarning"),

    /**
     * Error notification pattern - negative feedback
     * Use for:
     * - Error states
     * - Failed operations
     * - Invalid inputs
     * - System errors
     *
     * Note: On Android, this will use an error vibration pattern
     * Note: Will not trigger if device is in silent mode
     */
    error: () => triggerHapticFeedback("notificationError"),

    /**
     * Selection feedback pattern - item selection
     * Use for:
     * - Picker/selector interactions
     * - List item selection
     * - Radio button selection
     * - Dropdown menu items
     *
     * Note: On Android, this will fall back to a light impact pattern
     * Note: Will not trigger if device is in silent mode
     */
    selection: () => triggerHapticFeedback("selection"),
};
