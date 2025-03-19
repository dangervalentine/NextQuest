import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import GameSection from "./GameSection";
import { questGames } from "../data/seedData";
import colorSwatch from "../helpers/colors";
import Icon from "react-native-vector-icons/SimpleLineIcons";
import HeaderWithIcon from "./HeaderWithIcon";
import { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";

const Tab = createBottomTabNavigator();

const MainNavigationContainer: React.FC = () => {
    const tabScreens: {
        name: string;
        iconName: string;
        title: string;
        gameStatus: GameStatus;
    }[] = [
        {
            name: "In Progress",
            iconName: "game-controller",
            title: "In Progress",
            gameStatus: "in_progress",
        },
        {
            name: "Quest Log",
            iconName: "book-open",
            title: "Quest Log",
            gameStatus: "preperation",
        },
        {
            name: "Completed",
            iconName: "check",
            title: "Completed",
            gameStatus: "completed",
        },
    ];

    const getFilteredGames = (gameStatus: GameStatus) =>
        questGames.filter(
            (questGameListItem) => questGameListItem.gameStatus === gameStatus
        );

    return (
        <Tab.Navigator screenOptions={screenOptions}>
            {tabScreens.map((screen) => (
                <Tab.Screen
                    key={screen.name}
                    name={screen.name}
                    options={{
                        tabBarLabel: screen.name,
                        tabBarIcon: ({ color, size }) => (
                            <Icon
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
                    {() => (
                        <GameSection
                            questGameListItems={getFilteredGames(
                                screen.gameStatus
                            )}
                        />
                    )}
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
};

export default MainNavigationContainer;
