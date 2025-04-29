import React, { memo, useState, useEffect, useRef } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Text from "src/components/common/Text";
import { updateGameRating } from "src/data/repositories/questGames";
import { colorSwatch } from "src/constants/theme/colorConstants";
import { getRatingColor, getStatusColor } from "src/utils/colorsUtils";
import QuestIcon from "../../shared/GameIcon";
import { useGames } from "src/contexts/GamesContext";
import { showToast } from "src/components/common/QuestToast";
import { HapticFeedback } from "src/utils/hapticUtils";
import { useGameStatus } from "src/contexts/GameStatusContext";
import { theme } from "src/constants/theme/styles";

interface RatingProps {
    gameId: number;
    initialRating: number | null;
    notes?: string | null;
}

export const PersonalRatingSection = memo(
    ({ gameId, initialRating, notes }: RatingProps) => {
        // State management
        const [rating, setRating] = useState<number | null>(initialRating);
        const [displayRating, setDisplayRating] = useState<number | null>(
            initialRating
        );
        const lastSelectedRating = useRef<number | null>(null);
        const [hasUpdatedRating, setHasUpdatedRating] = useState(false);

        // Hooks
        const navigation = useNavigation();
        const { loadGamesForStatus } = useGames();
        const { activeStatus } = useGameStatus();

        // Setup navigation listener to refresh data when leaving screen
        useEffect(() => {
            if (!hasUpdatedRating) return;

            const unsubscribe = navigation.addListener(
                "beforeRemove",
                async () => {
                    await loadGamesForStatus("completed");
                }
            );

            return unsubscribe;
        }, [hasUpdatedRating, navigation, loadGamesForStatus]);

        // Keep local state in sync with props
        useEffect(() => {
            if (initialRating !== rating) {
                setRating(initialRating);
                setDisplayRating(initialRating);
            }
        }, [initialRating, rating]);

        // Ensure UI reflects the latest selected rating
        useEffect(() => {
            if (
                lastSelectedRating.current !== null &&
                lastSelectedRating.current !== displayRating
            ) {
                setDisplayRating(lastSelectedRating.current);
            }
        }, [displayRating]);

        // Handle star rating press
        const handleRatingPress = async (newRating: number) => {
            try {
                HapticFeedback.selection();

                // Update UI immediately for responsiveness
                lastSelectedRating.current = newRating;
                setDisplayRating(newRating);

                // Update database and context
                await updateGameRating(gameId, newRating);
                setRating(newRating);
                await loadGamesForStatus("completed");
                setHasUpdatedRating(true);

                // Ensure display is consistent with selection
                setTimeout(() => {
                    if (lastSelectedRating.current !== null) {
                        setDisplayRating(lastSelectedRating.current);
                    }
                }, 100);

                // Show success notification
                showToast({
                    type: "success",
                    text1: "Rating Updated",
                    text2: `Rating set to ${newRating}/10`,
                    visibilityTime: 2000,
                    position: "bottom",
                    bottomOffset: 25,
                    color: getStatusColor(activeStatus),
                });
            } catch (error) {
                console.error(
                    "[PersonalRatingSection] Error setting rating:",
                    error
                );
                setDisplayRating(rating);
                showToast({
                    type: "error",
                    text1: "Error",
                    text2: "Failed to update rating",
                    visibilityTime: 2000,
                    position: "bottom",
                    color: getStatusColor(activeStatus),
                });
            }
        };

        // Get the currently effective rating for display
        const effectiveRating = lastSelectedRating.current || displayRating;

        return (
            <View style={styles.sectionContainer}>
                <Text variant="title" style={styles.sectionTitle}>
                    My Score
                </Text>

                {/* Rating Selection Bar */}
                <View style={styles.ratingSelectionContainer}>
                    <Text variant="subtitle" style={styles.ratingPrompt}>
                        {effectiveRating
                            ? `Your rating: ${effectiveRating} / 10`
                            : "Click to give a rating"}
                    </Text>

                    <View style={styles.ratingButtonsContainer}>
                        {[...Array(10)].map((_, index) => {
                            const buttonRating = index + 1;
                            const isSelected =
                                effectiveRating !== null &&
                                buttonRating <= effectiveRating;
                            const starColor = isSelected
                                ? getRatingColor(effectiveRating || 0)
                                : colorSwatch.text.muted;

                            return (
                                <Pressable
                                    key={buttonRating}
                                    testID={`rating-star-${buttonRating}`}
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
                                        color={starColor}
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
                                { color: getRatingColor(effectiveRating || 0) },
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
        borderRadius: theme.borderRadius,
        padding: 16,
        elevation: 4,
    },
    sectionTitle: {
        color: colorSwatch.primary.dark,
    },
    ratingSelectionContainer: {
        backgroundColor: colorSwatch.background.darker,
        paddingHorizontal: 8,
        borderRadius: theme.borderRadius,
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
        borderRadius: theme.borderRadius,
    },
    noteText: {
        fontSize: 16,
        lineHeight: 24,
        fontStyle: "italic",
        color: colorSwatch.secondary.main,
    },
});
