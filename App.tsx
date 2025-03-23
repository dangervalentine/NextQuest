import { StyleSheet, View, ActivityIndicator, Text } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AppNavigator from "./screens/AppNavigator";
import { colorSwatch } from "./utils/colorConstants";
import { initializeDatabase } from "./data/db";

const App = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const setupDatabase = async () => {
            try {
                // await initializeDatabase();
                setIsLoading(false);
            } catch (err) {
                console.error("Database initialization failed:", err);
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to initialize database"
                );
                setIsLoading(false);
            }
        };

        setupDatabase();
    }, []);

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator
                    size="large"
                    color={colorSwatch.accent.green}
                />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    return (
        <GestureHandlerRootView style={styles.rootScreen}>
            <SafeAreaProvider>
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
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colorSwatch.background.dark,
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colorSwatch.background.dark,
    },
    errorText: {
        color: colorSwatch.accent.pink,
        fontSize: 16,
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
