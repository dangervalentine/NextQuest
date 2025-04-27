import React, { useRef, useImperativeHandle, forwardRef } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View } from "react-native";
import { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";
import GameSection, { GameSectionRef } from "./GameSection";
import GameSearchSection from "./GameSearchSection";
import HeaderWithIcon from "../../shared/HeaderWithIcon";
import QuestIcon from "../../shared/GameIcon";
import { GameStatus } from "src/constants/config/gameStatus";
import { MinimalQuestGame } from "src/data/models/MinimalQuestGame";
import { colorSwatch } from "src/utils/colorConstants";
import { getStatusColor } from "src/utils/colors";

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
    onTabChange: (tabName: string) => void;
}

export interface GameTabNavigatorRef {
    scrollToBottom: (status: GameStatus) => void;
    scrollToTop: (status: GameStatus) => void;
}

// Tab screen configurations
const tabScreens = [
    {
        name: "Ongoing",
        iconName: "gamepad-variant" as const,
        title: "Ongoing",
        gameStatus: "ongoing" as GameStatus,
    },
    {
        name: "Backlog",
        iconName: "list" as const,
        title: "Backlog",
        gameStatus: "backlog" as GameStatus,
    },
    {
        name: "Completed",
        iconName: "check-circle" as const,
        title: "Completed",
        gameStatus: "completed" as GameStatus,
    },
];

// Navigation styles
export const tabBarStyle = {
    backgroundColor: colorSwatch.background.darkest,
    borderColor: colorSwatch.neutral.darkGray,
    borderTopWidth: 1,
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    height: 60,
    paddingHorizontal: 0,
};

export const headerStyle = {
    backgroundColor: colorSwatch.background.darkest,
    borderColor: colorSwatch.neutral.darkGray,
    shadowOffset: {
        width: 0,
        height: 4,
    },
    shadowColor: colorSwatch.background.darkest,
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
};

export const screenOptions: BottomTabNavigationOptions = {
    tabBarStyle,
    tabBarActiveTintColor: colorSwatch.accent.cyan,
    tabBarInactiveTintColor: colorSwatch.neutral.darkGray,
    tabBarLabelStyle: {
        fontSize: 12,
        fontFamily: "FiraCode-Regular",
        marginBottom: 5,
    },
    tabBarItemStyle: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        margin: 0,
        padding: 0,
    },
    headerStyle,
    headerTitleStyle: {
        fontFamily: "FiraCode-Regular",
    },
};

const GameTabNavigator = forwardRef<GameTabNavigatorRef, TabNavigatorProps>(
    (
        {
            gameData,
            isLoading,
            handleStatusChange,
            handleDiscover,
            handleRemoveItem,
            handleReorder,
            onTabChange,
        },
        ref
    ) => {
        // Create refs for each game section tab
        const gameSectionRefs = useRef<
            Record<GameStatus, React.RefObject<GameSectionRef>>
        >({
            ongoing: React.createRef(),
            backlog: React.createRef(),
            completed: React.createRef(),
            undiscovered: React.createRef(),
            on_hold: React.createRef(),
            dropped: React.createRef(),
        });

        // Expose methods to parent
        useImperativeHandle(ref, () => ({
            scrollToBottom: (status: GameStatus) => {
                gameSectionRefs.current[status]?.current?.scrollToBottom();
            },
            scrollToTop: (status: GameStatus) => {
                gameSectionRefs.current[status]?.current?.scrollToTop();
            },
        }));

        return (
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    ...screenOptions,
                    tabBarStyle: {
                        ...tabBarStyle,
                    },
                    tabBarActiveTintColor:
                        route.name === "Search"
                            ? getStatusColor("undiscovered")
                            : getStatusColor(
                                  tabScreens.find(
                                      (screen) => screen.name === route.name
                                  )?.gameStatus || "ongoing"
                              ),
                    tabBarInactiveTintColor: colorSwatch.text.muted,
                })}
                screenListeners={{
                    state: (e) => {
                        const currentRoute =
                            e.data.state.routes[e.data.state.index];
                        onTabChange?.(currentRoute.name);
                    },
                }}
            >
                {tabScreens.map((screen) => (
                    <Tab.Screen
                        key={screen.name}
                        name={screen.name}
                        options={{
                            headerShown: false,
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
                                ref={gameSectionRefs.current[screen.gameStatus]}
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
                    key={"Search"}
                    name={"Search"}
                    options={{
                        headerShown: false,
                        tabBarLabel: "Search",
                        tabBarIcon: ({ color, size }) => (
                            <QuestIcon
                                name={"magnify"}
                                size={size}
                                color={color}
                            />
                        ),
                        headerTitle: () => (
                            <HeaderWithIcon
                                iconName={"magnify"}
                                title={"Search"}
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
    }
);

export default GameTabNavigator;
