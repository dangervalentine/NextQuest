import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Linking,
} from "react-native";
import { colorSwatch } from "src/utils/colorConstants";
import { Image } from "expo-image";
import MetacriticLogo from "../../assets/Metacritic_logo.svg";

type Props = {
    score: number;
    url?: string;
};

const getColor = (score: number) => {
    if (score >= 75) return colorSwatch.accent.green;
    if (score >= 50) return colorSwatch.accent.yellow;
    return colorSwatch.accent.pink;
};

export const MetacriticBadge: React.FC<Props> = ({ score, url }) => {
    const backgroundColor = getColor(score);

    return (
        <View style={styles.metacriticLogoContainer}>
            <View style={[styles.badge, { backgroundColor }]}>
                <Text style={styles.text}>{score}</Text>
            </View>
            <Image
                source={MetacriticLogo}
                style={styles.metacriticLogo}
                contentFit="contain"
            />
            {url && (
                <TouchableOpacity onPress={() => Linking.openURL(url)}>
                    <Text style={styles.text}>{score}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    badge: {
        height: 25,
        width: 25,
        lineHeight: 25,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 4,
    },
    text: {
        color: colorSwatch.text.inverse,
        fontSize: 12,
    },
    metacriticLogo: {
        width: 100,
        height: "80%",
    },
    metacriticLogoContainer: {
        justifyContent: "flex-end",
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        height: "100%",
    },
});
