import React from "react";
import { View } from "react-native";
import Text from "src/components/common/Text";
import { QuestGame } from "src/data/models/QuestGame";
import { colorSwatch } from "src/constants/theme/colorConstants";
import { StyleSheet } from "react-native";
import { theme } from "src/constants/theme/styles";

interface GameModesSectionProps {
    game: QuestGame;
}

export const GameModesSection: React.FC<GameModesSectionProps> = ({ game }) => {
    if (!game.game_modes?.length) return null;

    return (
        <View style={styles.characteristicSection}>
            <Text variant="title" style={styles.characteristicTitle}>
                Game Modes
            </Text>
            <View style={styles.tagsFlow}>
                {game.game_modes.map((mode, index) => (
                    <View key={index} style={styles.tagItem}>
                        <Text variant="body" style={styles.tagText}>
                            {mode.name}
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    characteristicSection: {
        backgroundColor: colorSwatch.background.darker,
    },
    characteristicTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: colorSwatch.primary.dark,
        marginBottom: 12,
    },
    tagsFlow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    tagItem: {
        backgroundColor: colorSwatch.background.darkest,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: theme.borderRadius,
        borderWidth: 1,
        borderColor: colorSwatch.neutral.darkGray,
    },
    tagText: {
        color: colorSwatch.neutral.lightGray,
        fontSize: 14,
    },
});
