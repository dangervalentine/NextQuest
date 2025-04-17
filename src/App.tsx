import { StyleSheet, View, ActivityIndicator } from "react-native";
import Text from "./components/common/Text";
import { NavigationContainer } from "@react-navigation/native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useEffect, useState } from "react";
import { initializeDatabase } from "./data/config/databaseSeeder";
import { colorSwatch } from "./utils/colorConstants";
import { StatusBar } from "expo-status-bar";
import MainNavigationContainer from "./screens/game/MainNavigationContainer";
import { QuestToast } from "./components/common/QuestToast";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [fontsLoaded] = useFonts({
        "Inter-Regular": require("./assets/fonts/Inter-Regular.ttf"),
        "Inter-Bold": require("./assets/fonts/Inter-Bold.ttf"),
        "FiraCode-Light": require("./assets/fonts/FiraCode-Light.ttf"),
        "FiraCode-Regular": require("./assets/fonts/FiraCode-Regular.ttf"),
        "FiraCode-Bold": require("./assets/fonts/FiraCode-Bold.ttf"),
        "PressStart2P-Regular": require("./assets/fonts/PressStart2P-Regular.ttf"),
    });

    useEffect(() => {
        async function prepare() {
            try {
                // await initializeDatabase();
            } catch (e) {
                console.warn(e);
                setError("Failed to initialize database");
            } finally {
                setIsLoading(false);
            }
        }

        prepare();
    }, []);

    const onLayoutRootView = useCallback(async () => {
        if (fontsLoaded && !isLoading) {
            await SplashScreen.hideAsync();
        }
    }, [fontsLoaded, isLoading]);

    if (!fontsLoaded || isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator
                    size="large"
                    color={colorSwatch.accent.green}
                />
                <Text variant="body" style={styles.loadingText}>
                    Loading...
                </Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text variant="subtitle" style={styles.errorText}>
                    {error}
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container} onLayout={onLayoutRootView}>
            <StatusBar style="light" />
            <NavigationContainer>
                <MainNavigationContainer />
            </NavigationContainer>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colorSwatch.background.darkest,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        backgroundColor: colorSwatch.background.darkest,
        alignItems: "center",
        gap: 16,
    },
    loadingText: {
        color: colorSwatch.text.primary,
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colorSwatch.background.darkest,
    },
    errorText: {
        color: colorSwatch.accent.pink,
    },
});
