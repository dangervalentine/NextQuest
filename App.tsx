import { StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AppNavigator from "./components/AppNavigator";
import colorSwatch from "./utils/colors";

const App = () => {
    return (
        <GestureHandlerRootView>
            <SafeAreaProvider style={styles.rootScreen}>
                <StatusBar style="light" />
                <AppNavigator />
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    rootScreen: {
        flex: 1,
        backgroundColor: colorSwatch.background.dark,
    },
    container: {},
    headerStyle: {
        backgroundColor: colorSwatch.background.dark,
        borderBottomWidth: 1,
        borderColor: colorSwatch.neutral.darkGray,
        shadowOffset: {
            width: 5,
            height: 8,
        },
        shadowColor: colorSwatch.neutral.darkGray,
        shadowOpacity: 1,
        shadowRadius: 3.84,
        elevation: 20,
    },
    headerTitleStyle: {
        fontSize: 24,
        fontWeight: "bold",
        color: colorSwatch.secondary.main,
        textAlign: "center",
    },
});

export default App;
