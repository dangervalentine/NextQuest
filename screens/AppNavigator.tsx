import { createStackNavigator } from "@react-navigation/stack";
import { StyleSheet } from "react-native";
import { RootStackParamList } from "../utils/navigationTypes";
import QuestGameDetailPage from "../screens/QuestGameDetailPage";
import MainNavigationContainer from "../screens/GameListNavigationContainer";
import { NavigationContainer } from "@react-navigation/native";
import { colorSwatch } from "../utils/colorConstants";

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerStyle: styles.headerStyle,
                    headerTitleStyle: styles.headerTitleStyle,
                    headerTintColor: colorSwatch.accent.cyan,
                    headerShadowVisible: false,
                }}
            >
                <Stack.Screen
                    name="Home"
                    component={MainNavigationContainer}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="QuestGameDetailPage"
                    component={QuestGameDetailPage}
                    options={({ route }) => ({
                        title: route.params?.name || "Game Details",
                    })}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

const styles = StyleSheet.create({
    headerStyle: {
        backgroundColor: colorSwatch.background.darkest,
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 1,
        borderBottomColor: colorSwatch.neutral.darkGray,
    },
    headerTitleStyle: {
        fontSize: 20,
        fontWeight: "600",
        color: colorSwatch.accent.purple,
        textAlign: "center",
    },
});

export default AppNavigator;
