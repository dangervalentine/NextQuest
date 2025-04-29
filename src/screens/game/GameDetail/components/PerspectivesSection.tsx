import React from "react";
import { View } from "react-native";
import Text from "src/components/common/Text";
import { QuestGame } from "src/data/models/QuestGame";
import { colorSwatch } from "src/constants/theme/colorConstants";
import { StyleSheet } from "react-native";
import { theme } from "src/constants/theme/styles";

interface PerspectivesSectionProps {
    game: QuestGame;
}

export const PerspectivesSection: React.FC<PerspectivesSectionProps> = ({
    game,
}) => {
    if (!game.player_perspectives?.length) return null;

    return (
        <View style={styles.characteristicSection}>
            <Text variant="title" style={styles.characteristicTitle}>
                Player Perspectives
            </Text>
            <View style={styles.tagsFlow}>
                {game.player_perspectives.map((perspective, index) => (
                    <View key={index} style={styles.tagItem}>
                        <Text variant="body" style={styles.tagText}>
                            {perspective.name}
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
