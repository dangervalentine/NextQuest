import React, { useState } from "react";
import {
    View,
    Text,
    Modal,
    StyleSheet,
    TouchableOpacity,
    Pressable,
    Dimensions,
} from "react-native";
import { colorSwatch } from "src/constants/theme/colorConstants";
import { HapticFeedback } from "src/utils/hapticUtils";
import { getRatingColor } from "src/utils/colorsUtils";
import { theme } from "src/constants/theme/styles";
import QuestIcon from "../../screens/game/shared/GameIcon";

interface RatingModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: (rating: number) => void;
    gameName: string;
}

export const RatingModal: React.FC<RatingModalProps> = ({
    visible,
    onClose,
    onConfirm,
    gameName,
}) => {
    const [selectedRating, setSelectedRating] = useState<number | null>(null);

    const handleRatingPress = (rating: number) => {
        HapticFeedback.selection();
        setSelectedRating(rating);
    };

    const handleConfirm = () => {
        if (selectedRating !== null) {
            HapticFeedback.selection();
            onConfirm(selectedRating);
        }
    };

    const handleSkip = () => {
        HapticFeedback.selection();
        onConfirm(1);
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleSkip}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Rate Your Experience</Text>

                    </View>

                    <View style={styles.content}>
                        <Text style={styles.gameName}>{gameName}</Text>
                        <Text style={styles.prompt}>
                            How would you rate this game?
                        </Text>

                        {/* Rating Stars */}
                        <View style={styles.ratingContainer}>
                            {[...Array(10)].map((_, index) => {
                                const buttonRating = index + 1;
                                const isSelected =
                                    selectedRating !== null &&
                                    buttonRating <= selectedRating;
                                const starColor = isSelected
                                    ? getRatingColor(selectedRating || 0)
                                    : colorSwatch.text.muted;

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
                                                isSelected
                                                    ? "star"
                                                    : "star-outline"
                                            }
                                            size={28}
                                            color={starColor}
                                        />
                                    </Pressable>
                                );
                            })}
                        </View>

                        {selectedRating !== null && (
                            <Text style={styles.ratingText}>
                                {selectedRating}/10
                            </Text>
                        )}
                    </View>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            onPress={handleSkip}
                            style={[styles.button, styles.skipButton]}
                        >
                            <Text style={styles.skipButtonText}>Skip</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleConfirm}
                            style={[
                                styles.button,
                                styles.confirmButton,
                                selectedRating === null && styles.disabledButton,
                            ]}
                            disabled={selectedRating === null}
                        >
                            <Text style={styles.confirmButtonText}>
                                Confirm
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
    },
    modalContainer: {
        width: width * 0.9,
        backgroundColor: colorSwatch.background.dark,
        borderRadius: theme.borderRadius,
        overflow: "hidden",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colorSwatch.text.muted,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        color: colorSwatch.text.primary,
    },
    content: {
        padding: 24,
        alignItems: "center",
    },
    gameName: {
        fontSize: 18,
        fontWeight: "bold",
        color: colorSwatch.text.primary,
        textAlign: "center",
        marginBottom: 8,
    },
    prompt: {
        fontSize: 16,
        color: colorSwatch.text.secondary,
        textAlign: "center",
        marginBottom: 24,
    },
    ratingContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
        gap: 4,
    },
    ratingButton: {
        justifyContent: "center",
        alignItems: "center",
        padding: 0,
    },
    ratingText: {
        fontSize: 18,
        fontWeight: "bold",
        color: colorSwatch.text.primary,
        marginBottom: 8,
    },
    buttonContainer: {
        flexDirection: "row",
        borderTopWidth: 1,
        borderTopColor: colorSwatch.text.muted,
    },
    button: {
        flex: 1,
        padding: 16,
        alignItems: "center",
    },
    skipButton: {
        borderRightWidth: 0.5,
        borderRightColor: colorSwatch.text.muted,
    },
    confirmButton: {
        borderLeftWidth: 0.5,
        borderLeftColor: colorSwatch.text.muted,
    },
    disabledButton: {
        opacity: 0.5,
    },
    skipButtonText: {
        fontSize: 16,
        color: colorSwatch.text.secondary,
        fontWeight: "600",
    },
    confirmButtonText: {
        fontSize: 16,
        color: colorSwatch.accent.cyan,
        fontWeight: "bold",
    },
});
