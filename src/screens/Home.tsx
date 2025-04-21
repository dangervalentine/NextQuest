import React from "react";
import { View, StyleSheet, ImageBackground } from "react-native";
import { colorSwatch } from "../utils/colorConstants";
import Text from "../components/common/Text";

const Home: React.FC = () => {
    return (
        <ImageBackground
            source={require("../assets/next-quest-icons/next_quest_scroll.png")}
            style={styles.pageContainer}
            resizeMode="contain"
        >
            <View style={styles.overlay} />
            <View style={styles.contentContainer}>
                <Text variant="title" style={styles.title}>
                    Next Quest
                </Text>
                <Text variant="subtitle" style={styles.subtitle}>
                    Your Gaming Journey Awaits
                </Text>
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    pageContainer: {
        flex: 1,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: colorSwatch.background.darker,
        opacity: 0.99,
    },
    contentContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    title: {
        fontSize: 32,
        color: colorSwatch.accent.cyan,
        marginBottom: 16,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 24,
        color: colorSwatch.text.secondary,
        textAlign: "center",
    },
});

export default Home;
