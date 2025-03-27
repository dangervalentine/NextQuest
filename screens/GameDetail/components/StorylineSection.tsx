import React, { memo, useState, useRef, useEffect } from "react";
import { View, StyleSheet, Animated, Pressable } from "react-native";
import Text from "../../../components/Text";
import { colorSwatch } from "../../../utils/colorConstants";
import QuestIcon from "../../shared/GameIcon";

interface StorylineSectionProps {
    storyline?: string;
    summary?: string;
}

const StorylineSection: React.FC<StorylineSectionProps> = memo(
    ({ storyline, summary }) => {
        const [isExpanded, setIsExpanded] = useState(false);
        const rotateAnim = useRef(new Animated.Value(0)).current;
        const content = storyline || summary;

        if (!content) return null;

        let truncatedContent = content;
        if (content.length > 400) {
            truncatedContent = `${content}`.substring(0, 400) + "...";
        }
        const displayContent = isExpanded ? content : truncatedContent;

        const toggleExpansion = () => {
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

        return (
            <View style={styles.storylineContainer}>
                <View style={styles.measureContainer}>
                    <Text variant="body" style={styles.storylineText}>
                        {displayContent}
                    </Text>
                    {content.length > 400 && (
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
                                    size={32}
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
        marginBottom: 16,
        overflow: "hidden",
    },
    measureContainer: {
        padding: 16,
    },
    storylineText: {
        color: colorSwatch.text.primary,
        fontSize: 16,
        lineHeight: 24,
    },
    seeMoreButton: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 8,
        gap: 4,
    },
    seeMoreText: {
        color: colorSwatch.accent.purple,
        fontSize: 18,
        fontWeight: "600",
    },
});

export default StorylineSection;
