import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainNavigationContainer from "./MainNavigationContainer";
import QuestGameDetailPage from "./QuestGameDetailPage";

const AppNavigator = () => {
    const Stack = createNativeStackNavigator();
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="Tabs"
                component={MainNavigationContainer}
                options={{ headerShown: false }}
            />

            <Stack.Screen
                name="QuestGameDetailPage"
                component={QuestGameDetailPage}
            />
        </Stack.Navigator>
    );
};
