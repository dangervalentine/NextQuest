import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colorSwatch } from "src/utils/colorConstants";
import { Image } from "expo-image";
import MetacriticLogo from "../../assets/Metacritic_logo.svg";

type Props = {
    score: number;
};

const getColor = (score: number) => {
    if (score >= 75) return colorSwatch.accent.green;
    if (score >= 50) return colorSwatch.accent.yellow;
    return colorSwatch.accent.pink;
};

export const MetacriticBadge: React.FC<Props> = ({ score }) => {
    const backgroundColor = getColor(score);

    return (
        <View style={styles.container}>
            <View style={[styles.badge, { backgroundColor }]}>
                <Text style={styles.text}>{score}</Text>
            </View>
            <View style={styles.metacriticLogoContainer}>
                <Image
                    source={MetacriticLogo}
                    style={styles.metacriticLogo}
                    contentFit="contain"
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        flex: 1,
    },
    badge: {
        width: 50,
        height: 50,
        lineHeight: 50,
        alignItems: "center",
        justifyContent: "center",
        marginVertical: 4,
        borderRadius: 3,
    },
    text: {
        color: colorSwatch.text.inverse,
        fontSize: 24,
    },
    metacriticLogo: {
        width: "80%",
        height: "80%",
        margin: 4,
    },
    metacriticLogoContainer: {
        flex: 1,
        height: "100%",
        alignItems: "flex-start",
        justifyContent: "center",
    },
});
