import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colorSwatch } from "src/utils/colorConstants";

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
        <View style={[styles.badge, { backgroundColor }]}>
            <Text style={styles.text}>{score}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        minWidth: 40,
        alignItems: "center",
        justifyContent: "center",
        marginVertical: 4,
    },
    text: {
        color: colorSwatch.background.darkest,
        fontWeight: "bold",
        fontSize: 16,
    },
});
