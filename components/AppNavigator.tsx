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
    );
};

const styles = StyleSheet.create({
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

export default AppNavigator;
