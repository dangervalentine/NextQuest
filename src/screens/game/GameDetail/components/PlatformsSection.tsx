import React from "react";
import { View, StyleSheet } from "react-native";
import { PlatformLogoBadge } from "src/components/common/PlatformLogoBadge";
import { colorSwatch } from "src/constants/theme/colorConstants";
import { QuestGame } from "src/data/models/QuestGame";
import Text from "src/components/common/Text";
import ExpandableContent from "src/components/common/ExpandableContent";
import { getStatusColor } from "src/utils/colorsUtils";

interface PlatformsSectionProps {
    game: QuestGame;
}

export const PlatformsSection: React.FC<PlatformsSectionProps> = ({ game }) => {
    if (!game.platforms?.length) return null;

    const platformsList = (
        <View style={styles.platformsList}>
            {game.platforms
                ?.map((platform) => {
                    const releaseDate = game.release_dates?.find(
                        (rd) => rd.platform_id === platform.id
                    );
                    return {
                        date: releaseDate?.date || Infinity,
                        name: platform.name,
                        human: releaseDate?.human || "",
                    };
                })
                .sort((a, b) => a.date - b.date)
                .map((platform, index) => (
                    <View key={index} style={styles.platformItem}>
                        <View style={styles.platformInfo}>
                            {(() => {
                                try {
                                    return (
                                        <PlatformLogoBadge
                                            platform={platform.name}
                                            size={64}
                                            style={{ marginRight: 12 }}
                                            tintColor={getStatusColor(
                                                game.gameStatus
                                            )}
                                        />
                                    );
                                } catch (error) {
                                    console.warn(
                                        `Error rendering logo for ${platform.name}:`,
                                        error
                                    );
                                    return (
                                        <Text
                                            variant="body"
                                            style={styles.platformName}
                                        >
                                            {platform.name}
                                        </Text>
                                    );
                                }
                            })()}
                        </View>
                    </View>
                ))}
        </View>
    );

    return (
        <ExpandableContent
            content={platformsList}
            maxCollapsedHeight={65}
            containerStyle={styles.container}
        />
    );
};

const styles = StyleSheet.create({
    container: {},
    platformsList: {
        gap: 8,
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "center",
    },
    platformItem: {
        flexDirection: "column",
        justifyContent: "space-between",
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: colorSwatch.background.darker,
        borderRadius: 8,
    },
    platformInfo: {},
    platformName: {
        color: colorSwatch.text.primary,
        fontSize: 16,
        marginLeft: 8,
    },
});
