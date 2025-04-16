import React from "react";
import { View, StyleSheet } from "react-native";
import { PlatformLogoBadge } from "src/components/common/PlatformLogoBadge";
import { colorSwatch } from "src/utils/colorConstants";
import { QuestGame } from "src/data/models/QuestGame";
import Text from "src/components/common/Text";
import ExpandableContent from "src/components/common/ExpandableContent";

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
                                            size={72}
                                            style={{ marginRight: 12 }}
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
                        <Text variant="body" style={styles.platformDate}>
                            {platform.human?.split("T")[0]}
                        </Text>
                    </View>
                ))}
        </View>
    );

    return (
        <ExpandableContent
            content={platformsList}
            maxCollapsedHeight={85}
            containerStyle={styles.container}
        />
    );
};

const styles = StyleSheet.create({
    container: {},
    platformsList: {
        gap: 8,
    },
    platformDate: {
        color: colorSwatch.text.secondary,
        fontSize: 12,
    },
    platformItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12,
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: colorSwatch.background.darker,
        borderRadius: 8,
    },
    platformInfo: {
        flexDirection: "row",
        alignItems: "center",
    },
    platformName: {
        color: colorSwatch.text.primary,
        fontSize: 16,
        marginLeft: 8,
    },
});
