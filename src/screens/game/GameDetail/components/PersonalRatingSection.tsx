import React, { memo, useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import Text from "src/components/common/Text";
import { updateGameRating } from "src/data/repositories/questGames";
import { colorSwatch } from "src/utils/colorConstants";
import { getRatingColor } from "src/utils/colors";
import QuestIcon from "../../shared/GameIcon";

interface RatingProps {
    gameId: number;
    initialRating: number | null;
    notes?: string | null;
}

export const PersonalRatingSection = memo(
    ({ gameId, initialRating, notes }: RatingProps) => {
        const [rating, setRating] = useState<number | null>(initialRating);

        const handleRatingPress = async (newRating: number) => {
            try {
                setRating(newRating);
                await updateGameRating(gameId, newRating);
            } catch (error) {
                console.error(
                    "[PersonalReviewSection] Error setting rating:",
                    error
                );
            }
        };

        return (
            <View style={styles.sectionContainer}>
                <Text variant="title" style={styles.sectionTitle}>
                    My Score
                </Text>

                {/* Rating Selection Bar */}
                <View style={styles.ratingSelectionContainer}>
                    <Text variant="subtitle" style={styles.ratingPrompt}>
                        {rating
                            ? `Your rating: ${rating} / 10`
                            : "Click to give a rating"}
                    </Text>
                    <View style={styles.ratingButtonsContainer}>
                        {[...Array(10)].map((_, index) => {
                            const buttonRating = index + 1;
                            const isSelected =
                                rating !== null && buttonRating <= rating;

                            return (
                                <Pressable
                                    key={buttonRating}
                                    onPress={() =>
                                        handleRatingPress(buttonRating)
                                    }
                                    style={styles.ratingButton}
                                >
                                    <QuestIcon
                                        name={
                                            isSelected ? "star" : "star-outline"
                                        }
                                        size={24}
                                        color={
                                            isSelected
                                                ? getRatingColor(rating || 0)
                                                : colorSwatch.text.muted
                                        }
                                    />
                                </Pressable>
                            );
                        })}
                    </View>
                </View>

                {/* Notes Section */}
                {notes && (
                    <View style={styles.noteContainer}>
                        <Text
                            variant="caption"
                            style={[
                                styles.noteText,
                                {
                                    color: getRatingColor(rating || 0),
                                },
                            ]}
                        >
                            "{notes}"
                        </Text>
                    </View>
                )}
            </View>
        );
    }
);

const styles = StyleSheet.create({
    sectionContainer: {
        marginHorizontal: 16,
        marginTop: 24,
        backgroundColor: colorSwatch.background.darkest,
        borderRadius: 12,
        padding: 16,
        elevation: 4,
    },
    sectionTitle: {
        color: colorSwatch.primary.dark,
    },
    ratingSelectionContainer: {
        backgroundColor: colorSwatch.background.darker,
        paddingHorizontal: 8,
        borderRadius: 12,
    },
    ratingPrompt: {
        marginTop: 16,
        fontSize: 16,
        color: colorSwatch.text.primary,
        textAlign: "center",
    },
    ratingButtonsContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginVertical: 16,
        gap: 4,
    },
    ratingButton: {
        justifyContent: "center",
        alignItems: "center",
    },
    noteContainer: {
        backgroundColor: colorSwatch.background.dark,
        padding: 16,
        borderRadius: 8,
    },
    noteText: {
        fontSize: 16,
        lineHeight: 24,
        fontStyle: "italic",
        color: colorSwatch.secondary.main,
    },
});
