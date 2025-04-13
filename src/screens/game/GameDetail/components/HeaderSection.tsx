import React from "react";
import { View, StyleSheet } from "react-native";
import { colorSwatch } from "src/utils/colorConstants";
import Text from "src/components/common/Text";
import { AgeRatingBadge } from "src/components/common/AgeRatingBadge";
import FullWidthImage from "../../shared/FullWidthImage";
import { QuestGame } from "src/data/models/QuestGame";

interface HeaderSectionProps {
    game: QuestGame;
}

export const HeaderSection: React.FC<HeaderSectionProps> = ({ game }) => (
    <View style={styles.headerSection}>
        {game.cover && (
            <View>
                <FullWidthImage
                    source={`https:${game.cover.url
                        .replace("t_cover_big", "t_720p")
                        .replace("t_thumb", "t_720p")}`}
                />
                <AgeRatingBadge game={game} />
            </View>
        )}
        <View style={styles.headerInfo}>
            <Text variant="title" style={styles.gameTitle}>
                {game.name}
            </Text>
            <Text variant="subtitle" style={styles.releaseDate}>
                {game.release_dates?.[0]?.human || "Release date unknown"}
            </Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
    headerSection: {
        marginTop: 130,
    },
    headerInfo: {
        alignItems: "center",
    },
    gameTitle: {
        color: colorSwatch.neutral.lightGray,
        marginBottom: 4,
        marginTop: 12,
        fontSize: 24,
        lineHeight: 32,
        flex: 1,
        textAlign: "center",
        maxWidth: "80%",
        flexWrap: "wrap",
    },
    releaseDate: {
        fontSize: 14,
        color: colorSwatch.text.secondary,
    },
});
