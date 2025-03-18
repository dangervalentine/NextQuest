import { StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import React from "react";
import colorSwatch from "./Colors";
import { StatusBar } from "expo-status-bar";
import Pages from "./components/Pages";

export default function App() {
    return (
        <SafeAreaProvider style={styles.rootScreen}>
            <StatusBar style="light" />
            <Pages />
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    rootScreen: {
        flex: 1,
        backgroundColor: colorSwatch.background.dark,
    },
});
