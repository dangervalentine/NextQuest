import { StyleSheet } from "react-native";
import { colorSwatch } from "./utils/colorConstants";

export const globalStyles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colorSwatch.background.darkest,
    },
});
