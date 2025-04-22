import React from "react";
import { StyleSheet, View } from "react-native";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { colorSwatch } from "./utils/colorConstants";
import MainNavigationContainer from "./screens/game/MainNavigationContainer";
import { AnimatedAppLoader } from "./components/splash/AnimatedAppLoader";

// Create a dark theme for navigation
const NavigationTheme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        background: colorSwatch.background.darkest,
    },
};

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function App() {
    return (
        <View style={styles.rootContainer}>
            <AnimatedAppLoader
                image={require("./assets/next-quest-icons/next_quest_yellow.png")}
            >
                <MainApp />
            </AnimatedAppLoader>
        </View>
    );
}

function MainApp() {
    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <NavigationContainer theme={NavigationTheme}>
                <MainNavigationContainer />
            </NavigationContainer>
        </View>
    );
}

const styles = StyleSheet.create({
    rootContainer: {
        flex: 1,
        backgroundColor: colorSwatch.background.darkest,
    },
    container: {
        flex: 1,
        backgroundColor: colorSwatch.background.darkest,
    },
});
