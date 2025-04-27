import React, { memo, useState, useRef, ReactNode } from "react";
import {
    View,
    StyleSheet,
    Animated,
    Pressable,
    LayoutChangeEvent,
    ViewStyle,
    TextStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Text from "./Text";
import { colorSwatch } from "../../constants/theme/colorConstants";
import QuestIcon from "../../screens/game/shared/GameIcon";

interface ExpandableContentProps {
    content: ReactNode;
    maxCollapsedHeight?: number;
    containerStyle?: ViewStyle;
    contentContainerStyle?: ViewStyle;
    buttonStyle?: ViewStyle;
    buttonTextStyle?: TextStyle;
}

const ExpandableContent: React.FC<ExpandableContentProps> = memo(
    ({
        content,
        maxCollapsedHeight = 100,
        containerStyle,
        contentContainerStyle,
        buttonStyle,
        buttonTextStyle,
    }) => {
        const [isExpanded, setIsExpanded] = useState(false);
        const [contentHeight, setContentHeight] = useState(0);
        const rotateAnim = useRef(new Animated.Value(0)).current;

        if (!content) return null;

        const onLayout = (event: LayoutChangeEvent) => {
            const height = event.nativeEvent.layout.height;
            setContentHeight(height);
        };

        const toggleExpansion = () => {
            const expanding = !isExpanded;

            Animated.timing(rotateAnim, {
                toValue: expanding ? 1 : 0,
                duration: 200,
                useNativeDriver: true,
            }).start();

            setIsExpanded(expanding);
        };

        const spin = rotateAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ["0deg", "180deg"],
        });

        const shouldShowButton = contentHeight >= maxCollapsedHeight;

        return (
            <View style={[styles.container, containerStyle]}>
                <View style={[styles.contentContainer, contentContainerStyle]}>
                    {/* Content with conditional max height */}
                    <View
                        style={[
                            !isExpanded && { maxHeight: maxCollapsedHeight },
                            { overflow: "hidden", position: "relative" },
                        ]}
                    >
                        <View onLayout={onLayout}>{content}</View>

                        {!isExpanded && shouldShowButton && (
                            <LinearGradient
                                colors={[
                                    "rgba(2, 15, 29, 0)",
                                    "rgba(2, 15, 29, 1)",
                                ]}
                                locations={[0, 1]}
                                style={styles.gradient}
                                pointerEvents="none"
                            />
                        )}
                    </View>
                </View>

                {shouldShowButton && (
                    <Pressable
                        style={[styles.seeMoreButton, buttonStyle]}
                        onPress={toggleExpansion}
                    >
                        <Text
                            variant="button"
                            style={[styles.seeMoreText, buttonTextStyle]}
                        >
                            {isExpanded ? "Collapse" : "Learn more"}
                        </Text>
                        <Animated.View
                            style={{ transform: [{ rotate: spin }] }}
                        >
                            <QuestIcon
                                name="chevron-down"
                                size={12}
                                color={colorSwatch.text.primary}
                            />
                        </Animated.View>
                    </Pressable>
                )}
            </View>
        );
    }
);

const styles = StyleSheet.create({
    container: {
        backgroundColor: colorSwatch.background.darker,
        borderRadius: 8,
        padding: 16,
    },
    contentContainer: {
        paddingBottom: 1,
    },
    gradient: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 40,
        zIndex: 1,
    },
    seeMoreButton: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 12,
        gap: 4,
        borderWidth: 1,
        borderColor: colorSwatch.neutral.darkGray,
        borderRadius: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        alignSelf: "flex-start",
        backgroundColor: colorSwatch.background.darker,
    },
    seeMoreText: {
        color: colorSwatch.text.primary,
        fontSize: 12,
        fontWeight: "600",
    },
});

export default ExpandableContent;
