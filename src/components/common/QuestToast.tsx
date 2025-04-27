import React from "react";
import Toast, { BaseToast, ToastProps } from "react-native-toast-message";
import { colorSwatch } from "src/constants/theme/colorConstants";

type ToastConfigParams = {
    type: string;
    text1?: string;
    text2?: string;
    onPress?: () => void;
    position?: "top" | "bottom";
    visibilityTime?: number;
    color?: string;
};

type ToastBaseProps = ToastProps & {
    props?: {
        onPress?: () => void;
        color?: string;
    };
};

// Default configuration for toasts
const DEFAULT_POSITION = "bottom";
const DEFAULT_VISIBILITY_TIME = 3000;
const DEFAULT_BOTTOM_OFFSET = 64;

const toastConfig = {
    success: (props: ToastBaseProps) => (
        <BaseToast
            {...props}
            onPress={() => {
                if (props.props?.onPress) {
                    props.props.onPress();
                } else {
                    Toast.hide();
                }
            }}
            style={{
                borderWidth: 1,
                borderTopColor: colorSwatch.primary.main,
                borderRightColor: colorSwatch.primary.main,
                borderBottomColor: colorSwatch.primary.main,
                borderLeftWidth: 5,
                borderLeftColor: props.props?.color || colorSwatch.accent.cyan,
                backgroundColor: colorSwatch.background.darkest,
                height: "auto",
                paddingVertical: 12,
                marginBottom: 12,
                width: "90%",
                marginHorizontal: "5%",
            }}
            contentContainerStyle={{
                paddingHorizontal: 15,
            }}
            text1Style={{
                fontSize: 16,
                fontWeight: "600",
                color: colorSwatch.text.primary,
                fontFamily: "Inter-Bold",
            }}
            text2Style={{
                fontSize: 14,
                color: colorSwatch.text.secondary,
                fontFamily: "FiraCode-Regular",
            }}
        />
    ),
    error: (props: ToastBaseProps) => (
        <BaseToast
            {...props}
            onPress={() => {
                if (props.props?.onPress) {
                    props.props.onPress();
                } else {
                    Toast.hide();
                }
            }}
            style={{
                borderLeftColor: props.props?.color || colorSwatch.accent.pink,
                backgroundColor: colorSwatch.background.medium,
                height: "auto",
                paddingVertical: 12,
                marginBottom: 12,
                width: "90%",
                marginHorizontal: "5%",
            }}
            contentContainerStyle={{
                paddingHorizontal: 15,
            }}
            text1Style={{
                fontSize: 16,
                fontWeight: "600",
                color: colorSwatch.text.primary,
                fontFamily: "Inter-Bold",
            }}
            text2Style={{
                fontSize: 14,
                color: colorSwatch.text.secondary,
                fontFamily: "FiraCode-Regular",
            }}
        />
    ),
};

export const QuestToast: React.FC = () => {
    return (
        <Toast
            config={toastConfig}
            position={DEFAULT_POSITION}
            bottomOffset={DEFAULT_BOTTOM_OFFSET}
            visibilityTime={DEFAULT_VISIBILITY_TIME}
        />
    );
};

// Custom show function with default values
export const showToast = (params: ToastConfigParams) => {
    Toast.show({
        ...params,
        position: params.position || DEFAULT_POSITION,
        visibilityTime: params.visibilityTime ?? DEFAULT_VISIBILITY_TIME,
        props: {
            onPress: params.onPress,
            color: params.color,
        },
    });
};

// Helper function to show an indefinite toast that only closes on press
export const showIndefiniteToast = (
    params: Omit<ToastConfigParams, "visibilityTime">
) => {
    showToast({
        ...params,
        visibilityTime: 0,
    });
};
