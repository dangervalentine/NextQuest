import React from "react";
import { View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colorSwatch } from "../../../../utils/colorConstants";
import Text from "../../../../components/common/Text";
import { AgeRatingBadge } from "../../../../components/common/AgeRatingBadge";
import FullWidthImage from "../../shared/FullWidthImage";
import { QuestGame } from "../../../../data/models/QuestGame";
import { MetacriticBadge } from "../../../../components/common/MetaCriticBadge";
import { getStatusColor } from "src/utils/colors";

interface HeaderSectionProps {
    game: QuestGame;
}

export const HeaderSection: React.FC<HeaderSectionProps> = ({ game }) => {
    const groupedCompanies = {
        developers:
            game.involved_companies
                ?.filter((c) => c.developer)
                .map((c) => c.company?.name || "")
                .filter(Boolean) || [],
        publishers:
            game.involved_companies
                ?.filter((c) => c.publisher)
                .map((c) => c.company?.name || "")
                .filter(Boolean) || [],
    };

    const coverUrl = game.cover?.url
        ? game.cover.url
              .replace("t_cover_big", "t_720p")
              .replace("t_thumb", "t_720p")
        : "";

    return (
        <View style={styles.headerSection}>
            <View style={styles.imageContainer}>
                <FullWidthImage
                    source={coverUrl}
                    loaderColor={getStatusColor(game.gameStatus)}
                />
                <LinearGradient
                    colors={[
                        "rgba(2, 15, 29, 0)",
                        "rgba(2, 15, 29, 0)",
                        "rgba(2, 15, 29, 0.4)",
                        "rgba(2, 15, 29, 0.8)",
                        "rgba(2, 15, 29, 0.95)",
                    ]}
                    locations={[0, 0.4, 0.6, 0.8, 1]}
                    style={styles.headerOverlay}
                />
                <View style={styles.headerContainer}>
                    <View style={styles.badgeContainer}>
                        {game.metacriticScore && (
                            <MetacriticBadge score={game.metacriticScore} />
                        )}
                    </View>
                    <View style={styles.badgeContainer}>
                        <AgeRatingBadge game={game} />
                    </View>
                </View>
            </View>
            <View style={styles.headerInfo}>
                <Text
                    variant="title"
                    style={[
                        styles.titleText,
                        { color: getStatusColor(game.gameStatus) },
                    ]}
                >
                    {game.name}
                </Text>
                <Text variant="subtitle" style={styles.releaseDate}>
                    {game.release_dates?.[0]?.human}
                </Text>
            </View>

            <View style={styles.companyInfo}>
                <View style={styles.companyColumn}>
                    <Text variant="subtitle" style={styles.companyLabel}>
                        Developed by:
                    </Text>
                    <Text variant="body" style={styles.companyName}>
                        {groupedCompanies.developers[0] || "Unknown"}
                    </Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.companyColumn}>
                    <Text variant="subtitle" style={styles.companyLabel}>
                        Published by:
                    </Text>
                    <Text variant="body" style={styles.companyName}>
                        {groupedCompanies.publishers[0] || "Unknown"}
                    </Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    headerSection: {
        flex: 1,
        minHeight: 560,
        backgroundColor: colorSwatch.background.darkest,
        overflow: "hidden",
    },
    imageContainer: {
        position: "relative",
        width: "100%",
    },
    headerContainer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        height: 50,
        right: 0,
        width: "100%",
        paddingLeft: 14,
        paddingRight: 10,
        paddingBottom: 8,
        zIndex: 2,
    },
    headerOverlay: {
        position: "absolute",
        top: 300,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1,
    },
    badgeContainer: {
        zIndex: 3,
    },
    titleText: {
        fontSize: 32,
        textAlign: "center",
        color: colorSwatch.text.primary,
        lineHeight: 32,
        maxWidth: "90%",
        marginTop: 10,
    },
    headerInfo: {
        alignItems: "center",
        margin: 10,
    },
    releaseDate: {
        fontSize: 14,
        color: colorSwatch.text.secondary,
    },
    companyInfo: {
        flexDirection: "row",
        paddingVertical: 16,
        paddingTop: 0,
        marginHorizontal: 12,
        backgroundColor: colorSwatch.background.darkest,
        elevation: 4,
    },
    companyColumn: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "flex-start",
    },
    companyLabel: {
        color: colorSwatch.text.secondary,
        fontSize: 12,
        marginBottom: 4,
    },
    companyName: {
        color: colorSwatch.accent.cyan,
        textAlign: "center",
        fontSize: 14,
    },
    divider: {
        width: 1,
        backgroundColor: colorSwatch.neutral.darkGray,
        marginHorizontal: 16,
    },
});
