import { StyleSheet, View } from "react-native";
import Text from "../../components/Text";
import { colorSwatch } from "../../utils/colorConstants";

const GameLoggerHeader = () => {
    return (
        <View style={styles.container}>
            <Text variant="title" style={styles.title}>
                Quest Logger
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        backgroundColor: colorSwatch.background.darkest,
        borderBottomWidth: 1,
        borderBottomColor: colorSwatch.neutral.darkGray,
    },
    title: {
        color: colorSwatch.accent.cyan,
    },
});

export default GameLoggerHeader;
