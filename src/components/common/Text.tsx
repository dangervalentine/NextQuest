import React from "react";
import { Text as RNText, TextProps, StyleSheet, TextStyle } from "react-native";

interface CustomTextProps extends TextProps {
    variant?:
        | "body"
        | "title"
        | "subtitle"
        | "button"
        | "caption"
        | "pixel"
        | "small";
}

const fonts = {
    title: "Inter-Regular",
    subtitle: "FiraCode-Light",
    caption: "FiraCode-Light",
    body: "FiraCode-Regular",
    button: "FiraCode-Bold",
    small: "FiraCode-Regular",
    pixel: "PressStart2P-Regular",
} as const;

const baseStyles: Record<NonNullable<CustomTextProps["variant"]>, TextStyle> = {
    body: {
        fontSize: 14,
        lineHeight: 24,
    },
    title: {
        fontSize: 24,
        lineHeight: 32,
        fontWeight: "600",
    },
    subtitle: {
        fontSize: 18,
        lineHeight: 24,
        fontWeight: "500",
    },
    button: {
        fontSize: 16,
        lineHeight: 24,
        fontWeight: "600",
    },
    caption: {
        fontSize: 14,
        lineHeight: 20,
        fontStyle: "italic",
    },
    small: {
        fontSize: 14,
    },
    pixel: {},
};

const Text: React.FC<CustomTextProps> = ({
    style,
    variant = "body",
    children,
    ...props
}) => {
    return (
        <RNText
            style={StyleSheet.flatten([
                { fontFamily: fonts[variant] },
                baseStyles[variant],
                style,
            ])}
            {...props}
        >
            {children}
        </RNText>
    );
};

export default Text;
