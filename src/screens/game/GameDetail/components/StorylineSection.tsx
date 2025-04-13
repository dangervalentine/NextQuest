import React, { memo, useState, useRef, useEffect } from "react";
import {
    View,
    StyleSheet,
    Animated,
    Pressable,
    LayoutChangeEvent,
} from "react-native";
import Text from "../../../../components/common/Text";
import { colorSwatch } from "../../../../utils/colorConstants";
import QuestIcon from "../../shared/GameIcon";

interface StorylineSectionProps {
    storyline?: string;
    summary?: string;
}

const StorylineSection: React.FC<StorylineSectionProps> = memo(
    ({ storyline, summary }) => {
        const [isExpanded, setIsExpanded] = useState(false);
        const [contentHeight, setContentHeight] = useState(0);
        const rotateAnim = useRef(new Animated.Value(0)).current;
        const heightAnim = useRef(new Animated.Value(0)).current;
        const content = storyline || summary;

        if (!content) return null;

        const displayContent = content;

        const toggleExpansion = () => {
            // Run height animation (JS-driven)
            Animated.timing(heightAnim, {
                toValue: isExpanded ? 0 : 1,
                duration: 300,
                useNativeDriver: false,
            }).start();

            // Run rotation animation (native-driven)
            Animated.timing(rotateAnim, {
                toValue: isExpanded ? 0 : 1,
                duration: 300,
                useNativeDriver: true,
            }).start();

            setIsExpanded(!isExpanded);
        };

        const spin = rotateAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ["0deg", "180deg"],
        });

        const onTextLayout = (event: LayoutChangeEvent) => {
            const height = event.nativeEvent.layout.height;
            setContentHeight(height);
        };

        const shouldShowButton = contentHeight >= 100;

        return (
            <View style={styles.storylineContainer}>
                <View>
                    <Animated.View
                        style={{
                            maxHeight: heightAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [100, 1000],
                            }),
                            overflow: "hidden",
                        }}
                    >
                        <Text
                            variant="body"
                            style={styles.storylineText}
                            onLayout={onTextLayout}
                        >
                            {displayContent}
                        </Text>
                    </Animated.View>
                    {shouldShowButton && (
                        <Pressable
                            style={styles.seeMoreButton}
                            onPress={toggleExpansion}
                        >
                            <Text variant="button" style={styles.seeMoreText}>
                                {isExpanded ? "See less" : "See more"}
                            </Text>
                            <Animated.View
                                style={{ transform: [{ rotate: spin }] }}
                            >
                                <QuestIcon
                                    name="chevron-down"
                                    size={12}
                                    color={colorSwatch.accent.cyan}
                                />
                            </Animated.View>
                        </Pressable>
                    )}
                </View>
            </View>
        );
    }
);

const styles = StyleSheet.create({
    storylineContainer: {
        backgroundColor: colorSwatch.background.darker,
        borderRadius: 8,
    },
    storylineText: {
        color: colorSwatch.text.primary,
        fontSize: 12,
        lineHeight: 24,
    },
    seeMoreButton: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 12,
        gap: 4,
        borderWidth: 1,
        borderColor: colorSwatch.accent.cyan,
        borderRadius: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        alignSelf: "flex-start",
    },
    seeMoreText: {
        color: colorSwatch.accent.cyan,
        fontSize: 12,
        fontWeight: "600",
    },
});

export default StorylineSection;
