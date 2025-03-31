import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View } from "react-native";
import { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";
import GameSection from "./GameSection";
import GameSearchSection from "./GameSearchSection";
import HeaderWithIcon from "../../shared/HeaderWithIcon";
import QuestIcon from "../../shared/GameIcon";
import { GameStatus } from "src/constants/config/gameStatus";
import { MinimalQuestGame } from "src/data/models/MinimalQuestGame";
import { colorSwatch } from "src/utils/colorConstants";

const Tab = createBottomTabNavigator();

interface TabNavigatorProps {
    gameData: Record<GameStatus, MinimalQuestGame[]>;
    isLoading: Record<GameStatus, boolean>;
    handleStatusChange: (
        id: number,
        newStatus: GameStatus,
        currentStatus: GameStatus
    ) => void;
    handleDiscover: (game: MinimalQuestGame, newStatus: GameStatus) => void;
    handleRemoveItem: (itemId: number, status: GameStatus) => void;
    handleReorder: (
        fromIndex: number,
        toIndex: number,
        status: GameStatus
    ) => void;
}

// Status color mapping
const getStatusColor = (status: GameStatus): string => {
    switch (status) {
        case "ongoing":
            return colorSwatch.accent.yellow;
        case "completed":
            return colorSwatch.accent.green;
        case "backlog":
            return colorSwatch.accent.purple;
        case "undiscovered":
            return colorSwatch.accent.cyan;
        default:
            return colorSwatch.accent.cyan;
    }
};

// Tab screen configurations
const tabScreens = [
    {
        name: "Ongoing",
        iconName: "gamepad-variant" as const,
        title: "Ongoing Quests",
        gameStatus: "ongoing" as GameStatus,
    },
    {
        name: "Backlog",
        iconName: "scroll" as const,
        title: "Backlog",
        gameStatus: "backlog" as GameStatus,
    },
    {
        name: "Trophies",
        iconName: "medal" as const,
        title: "Trophy Room",
        gameStatus: "completed" as GameStatus,
    },
];

// Navigation styles
export const tabBarStyle = {
    backgroundColor: colorSwatch.background.darkest,
    borderColor: colorSwatch.neutral.darkGray,
    borderTopWidth: 1,
    height: 60,
    paddingBottom: 8,
};

export const headerStyle = {
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

export const screenOptions: BottomTabNavigationOptions = {
    tabBarStyle,
    tabBarActiveTintColor: colorSwatch.accent.cyan,
    tabBarInactiveTintColor: colorSwatch.text.muted,
    tabBarLabelStyle: {
        fontSize: 12,
        fontFamily: "FiraCode-Regular",
    },
    headerStyle,
    headerTitleStyle: {
        fontFamily: "FiraCode-Regular",
    },
    tabBarBackground: () => (
        <View
            style={{ backgroundColor: colorSwatch.background.darkest, flex: 1 }}
        />
    ),
};

const GameTabNavigator: React.FC<TabNavigatorProps> = ({
    gameData,
    isLoading,
    handleStatusChange,
    handleDiscover,
    handleRemoveItem,
    handleReorder,
}) => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                ...screenOptions,
                tabBarStyle: {
                    ...tabBarStyle,
                },
                tabBarActiveTintColor:
                    route.name === "Discover"
                        ? getStatusColor("undiscovered")
                        : getStatusColor(
                              tabScreens.find(
                                  (screen) => screen.name === route.name
                              )?.gameStatus || "ongoing"
                          ),
                tabBarInactiveTintColor: colorSwatch.text.muted,
            })}
        >
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
                                color={getStatusColor(screen.gameStatus)}
                            />
                        ),
                    }}
                >
                    {() => (
                        <GameSection
                            gameStatus={screen.gameStatus}
                            games={gameData[screen.gameStatus]}
                            isLoading={isLoading[screen.gameStatus]}
                            onStatusChange={handleStatusChange}
                            onRemoveItem={handleRemoveItem}
                            onReorder={handleReorder}
                        />
                    )}
                </Tab.Screen>
            ))}
            <Tab.Screen
                key={"Discover"}
                name={"Discover"}
                options={{
                    tabBarLabel: "Discover",
                    tabBarIcon: ({ color, size }) => (
                        <QuestIcon
                            name={"telescope"}
                            size={size}
                            color={color}
                        />
                    ),
                    headerTitle: () => (
                        <HeaderWithIcon
                            iconName={"telescope"}
                            title={"Discover"}
                            color={getStatusColor("undiscovered")}
                        />
                    ),
                }}
            >
                {() => (
                    <GameSearchSection
                        gameStatus={"undiscovered"}
                        games={gameData["undiscovered"]}
                        handleDiscover={handleDiscover}
                    />
                )}
            </Tab.Screen>
        </Tab.Navigator>
    );
};

export default GameTabNavigator;
