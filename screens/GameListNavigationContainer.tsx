import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import GameSection from "./GameList/components/GameSection";
import { SimpleLineIcons } from "@expo/vector-icons";
import HeaderWithIcon from "./shared/HeaderWithIcon";
import { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";
import { GameStatus } from "../constants/gameStatus";
import { colorSwatch } from "../utils/colorConstants";
import { View } from "react-native";

const Tab = createBottomTabNavigator();

const MainNavigationContainer: React.FC = () => {
    const tabScreens: {
        name: string;
        iconName: keyof typeof SimpleLineIcons.glyphMap;
        title: string;
        gameStatus: GameStatus;
    }[] = [
        {
            name: "In Progress",
            iconName: "game-controller",
            title: "In Progress",
            gameStatus: "active",
        },
        {
            name: "Quest Log",
            iconName: "book-open",
            title: "Quest Log",
            gameStatus: "inactive",
        },
        {
            name: "Completed",
            iconName: "check",
            title: "Completed",
            gameStatus: "completed",
        },
    ];

    return (
        <Tab.Navigator screenOptions={screenOptions}>
            {tabScreens.map((screen) => (
                <Tab.Screen
                    key={screen.name}
                    name={screen.name}
                    options={{
                        tabBarLabel: screen.name,
                        tabBarIcon: ({ color, size }) => (
                            <SimpleLineIcons
                                name={screen.iconName}
                                size={size}
                                color={color}
                            />
                        ),
                        headerTitle: () => (
                            <HeaderWithIcon
                                iconName={screen.iconName}
                                title={screen.title}
                            />
                        ),
                    }}
                >
                    {() => <GameSection gameStatus={screen.gameStatus} />}
                </Tab.Screen>
            ))}
        </Tab.Navigator>
    );
};

const tabBarStyle = {
    backgroundColor: colorSwatch.background.dark,
    borderColor: colorSwatch.neutral.darkGray,
    borderTopWidth: 1,
};

const headerStyle = {
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
};

const screenOptions: BottomTabNavigationOptions = {
    tabBarStyle,
    tabBarActiveTintColor: colorSwatch.secondary.main,
    tabBarInactiveTintColor: colorSwatch.text.secondary,
    tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: "bold",
    },
    headerTitleStyle: {
        fontSize: 24,
        fontWeight: "bold",
        color: colorSwatch.secondary.main,
        textAlign: "center",
    },
    headerStyle,
    tabBarBackground: () => (
        <View
            style={{ backgroundColor: colorSwatch.background.dark, flex: 1 }}
        />
    ),
};

export default MainNavigationContainer;
