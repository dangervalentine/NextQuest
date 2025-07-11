import React from "react";
import { View } from "react-native";
import Text from "src/components/common/Text";
import { QuestGame } from "src/data/models/QuestGame";
import { colorSwatch } from "src/constants/theme/colorConstants";
import { StyleSheet } from "react-native";
import { theme } from "src/constants/theme/styles";

interface ThemesSectionProps {
    game: QuestGame;
}

export const ThemesSection: React.FC<ThemesSectionProps> = ({ game }) => {
    if (!game.themes?.length) return null;

    return (
        <View style={styles.characteristicSection}>
            <Text variant="title" style={styles.characteristicTitle}>
                Themes
            </Text>
            <View style={styles.tagsFlow}>
                {game.themes.map((theme, index) => (
                    <View key={index} style={styles.tagItem}>
                        <Text variant="body" style={styles.tagText}>
                            {theme.name}
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
