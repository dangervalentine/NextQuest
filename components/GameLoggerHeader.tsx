import { StyleSheet, Text, View } from "react-native";
import colorSwatch from "../helpers/colors";

function GameLoggerHeader() {
    return (
        <View style={styles.headerContainer}>
            <View style={styles.textContainer}>
                <Text style={styles.header}>GameLogger</Text>
                <Text style={styles.description}>
                    From wishlist to completion—log every game you play.
                </Text>
            </View>
            <Text style={styles.icon}>🕹️</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    headerContainer: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 20,
        borderBottomColor: colorSwatch.neutral.darkGray,
        borderBottomWidth: 1,
        backgroundColor: colorSwatch.background.dark,
        marginTop: 40,
    },
    icon: {
        fontSize: 40,
        marginRight: 35,
    },
    textContainer: {
        flex: 1,
        textAlign: "right",
        marginStart: 5,
    },
    header: {
        fontSize: 24,
        fontWeight: "bold",
        color: colorSwatch.accent.green,
    },
    description: {
        fontSize: 12,
        color: colorSwatch.neutral.white,
    },
});

export default GameLoggerHeader;
