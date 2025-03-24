import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import GameSection from "./GameList/components/GameSection";
import {
    FontAwesome5,
    MaterialCommunityIcons,
    SimpleLineIcons,
} from "@expo/vector-icons";
import HeaderWithIcon from "./shared/HeaderWithIcon";
import { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";
import { GameStatus } from "../constants/gameStatus";
import { colorSwatch } from "../utils/colorConstants";
import { View } from "react-native";
import QuestIcon from "./shared/GameIcon";

const Tab = createBottomTabNavigator();

const MainNavigationContainer: React.FC = () => {
    const tabScreens: {
        name: string;
        iconName:
            | keyof typeof MaterialCommunityIcons.glyphMap
            | keyof typeof SimpleLineIcons.glyphMap
            | keyof typeof FontAwesome5.glyphMap;
        title: string;
        gameStatus: GameStatus;
    }[] = [
        {
            name: "Active",
            iconName: "sword-cross", // MaterialCommunityIcons
            title: "Active Quests",
            gameStatus: "active",
        },
        {
            name: "Quest Log",
            iconName: "scroll", // FontAwesome5
            title: "Quest Log",
            gameStatus: "inactive",
        },
        {
            name: "Completed",
            iconName: "trophy", // FontAwesome5
            title: "Completed Quests",
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
                            <QuestIcon
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
    backgroundColor: colorSwatch.background.darkest,
    borderColor: colorSwatch.neutral.darkGray,
    borderTopWidth: 1,
    height: 60,
    paddingBottom: 8,
};

const headerStyle = {
    backgroundColor: colorSwatch.background.darkest,
    borderBottomWidth: 1,
    borderColor: colorSwatch.neutral.darkGray,
    shadowOffset: {
        width: 0,
        height: 4,
    },
    shadowColor: colorSwatch.background.darker,
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
};

const screenOptions: BottomTabNavigationOptions = {
    tabBarStyle,
    tabBarActiveTintColor: colorSwatch.accent.cyan,
    tabBarInactiveTintColor: colorSwatch.text.secondary,
    tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: "500",
    },
    headerStyle,
    tabBarBackground: () => (
        <View
            style={{ backgroundColor: colorSwatch.background.darkest, flex: 1 }}
        />
    ),
};

export default MainNavigationContainer;
