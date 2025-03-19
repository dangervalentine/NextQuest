import { StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import React from "react";
import colorSwatch from "./Colors";
import { StatusBar } from "expo-status-bar";
import MainNavigationContainer from "./components/MainNavigationContainer";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import QuestGameDetailPage from "./components/QuestGameDetailPage";
import { RootStackParamList } from "./helpers/navigationTypes";

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
    return (
        <SafeAreaProvider style={styles.rootScreen}>
            <StatusBar style="light" />
            <NavigationContainer>
                <Stack.Navigator>
                    <Stack.Screen
                        name="Home"
                        component={MainNavigationContainer}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="QuestGameDetailPage"
                        component={QuestGameDetailPage}
                        options={({ route }) => ({
                            headerStyle: styles.headerStyle,
                            headerTitleStyle: styles.headerTitleStyle,
                            headerTintColor: colorSwatch.secondary.main,
                            title: route.params?.name || "Game Details",
                        })}
                    />
                </Stack.Navigator>
            </NavigationContainer>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    rootScreen: {
        flex: 1,
        backgroundColor: colorSwatch.background.dark,
    },
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
