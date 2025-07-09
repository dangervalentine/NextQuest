import React, {
    useRef,
    useImperativeHandle,
    forwardRef,
    useState,
} from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";
import GameSection, { GameSectionRef } from "./GameSection";
import GameSearchSection from "./GameSearchSection";
import HeaderWithIcon from "../../shared/HeaderWithIcon";
import QuestIcon from "../../shared/GameIcon";
import { GameStatus } from "src/constants/config/gameStatus";
import { MinimalQuestGame } from "src/data/models/MinimalQuestGame";
import { colorSwatch } from "src/constants/theme/colorConstants";
import { getStatusColor } from "src/utils/colorsUtils";
import { SortField } from "src/types/sortTypes";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { TabParamList } from "src/navigation/navigationTypes";
import { MainNavigationProp } from "../../MainNavigationContainer";
import { Text } from "react-native";
import { getStatusIcon } from "src/utils/gameStatusUtils";

const Tab = createBottomTabNavigator();

interface TabNavigatorProps {
    gameData: Record<GameStatus, MinimalQuestGame[]>;
    isLoading: Record<GameStatus, boolean>;
    handleDiscover: (game: MinimalQuestGame, newStatus: GameStatus) => void;
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
        title: "Ongoing",
        gameStatus: "ongoing" as GameStatus,
    },
    {
        name: "Backlog",
        title: "Backlog",
        gameStatus: "backlog" as GameStatus,
    },
    {
        name: "Completed",
        title: "Completed",
        gameStatus: "completed" as GameStatus,
    },
];

// Navigation styles
export const tabBarStyle = {
    backgroundColor: colorSwatch.background.darkest,
    borderWidth: 0,
    borderColor: colorSwatch.neutral.darkGray,
    height: 56,
};

export const screenOptions: BottomTabNavigationOptions = {
    tabBarStyle,
    tabBarInactiveTintColor: colorSwatch.neutral.darkGray,
};

const GameTabNavigator = forwardRef<GameTabNavigatorRef, TabNavigatorProps>(
    (
        {
            gameData,
            isLoading,
            handleDiscover,
            handleReorder,
            onTabChange,
        },
        ref
    ) => {
        const insets = useSafeAreaInsets();

        // Create refs for each game section tab
        const gameSectionRefs = useRef<
            Record<GameStatus, React.RefObject<GameSectionRef | null>>
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

        const [sort, setSort] = useState<{
            field: SortField;
            direction: "asc" | "desc";
        }>({
            field: "priority",
            direction: "asc",
        });
        const [isMenuVisible, setMenuVisible] = useState(false);

        const hasNavigatedRef = React.useRef(false);

        React.useEffect(() => {
            if (hasNavigatedRef.current) return;

            // Check if any main gameData array has data
            const hasAnyData =
                gameData.ongoing.length > 0 ||
                gameData.backlog.length > 0 ||
                gameData.completed.length > 0 ||
                gameData.undiscovered.length > 0;

            if (hasAnyData) {
                handleNavigateToStatus();
                hasNavigatedRef.current = true;
            }
        }, [gameData]);

        const navigation = useNavigation<MainNavigationProp>();

        const handleNavigateToStatus = () => {
            const tabOrder: { label: string; status: GameStatus }[] = [
                { label: "Ongoing", status: "ongoing" },
                { label: "Backlog", status: "backlog" },
                { label: "Completed", status: "completed" },
                { label: "Search", status: "undiscovered" },
            ];
            const firstNonEmptyTab = tabOrder.find(
                (tab) => gameData[tab.status] && gameData[tab.status].length > 0
            );
            const targetTab = firstNonEmptyTab ? firstNonEmptyTab.label : "Search";

            navigation.navigate("GameTabs", {
                screen: targetTab as keyof TabParamList,
            });
        };

        return (
            <Tab.Navigator
                initialRouteName="Search"
                screenOptions={({ route }) => ({
                    headerStyle: {
                        backgroundColor: colorSwatch.background.darkest,
                        borderWidth: 0,
                        borderColor: colorSwatch.neutral.darkGray,
                        borderBottomWidth: 1,
                        borderBottomColor: colorSwatch.neutral.darkGray,
                    },
                    ...screenOptions,
                    tabBarStyle: {
                        ...tabBarStyle,
                        paddingBottom: insets.bottom,
                        height: 56 + insets.bottom,
                    },
                    tabBarItemStyle: {
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: '100%',
                        padding: 0,
                        borderTopWidth: 1,
                        borderTopColor: colorSwatch.neutral.darkGray,
                        borderRightWidth: 1,
                        borderRightColor: colorSwatch.background.darkest,
                        borderLeftWidth: 1,
                        borderLeftColor: colorSwatch.background.darkest,
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
                            headerShown: true,
                            tabBarLabel: ({ color }) => (
                                <Text
                                    style={{
                                        color,
                                        fontSize: 12,
                                        textAlign: 'center',
                                    }}
                                >
                                    {screen.name}
                                </Text>
                            ),
                            tabBarIcon: ({ color, size }) => (
                                <QuestIcon
                                    name={getStatusIcon(screen.gameStatus)}
                                    size={size}
                                    color={color}
                                />
                            ),
                            headerTitle: () => (
                                <HeaderWithIcon
                                    iconName={getStatusIcon(screen.gameStatus)}
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
                                onReorder={handleReorder}
                                sort={sort}
                                onSortChange={setSort}
                                isMenuVisible={isMenuVisible}
                                setMenuVisible={setMenuVisible}
                            />
                        )}
                    </Tab.Screen>
                ))}
                <Tab.Screen
                    key={"Search"}
                    name={"Search"}
                    options={{
                        headerShown: true,
                        tabBarLabel: ({ color }) => (
                            <Text
                                style={{
                                    color,
                                    fontSize: 12,
                                    textAlign: 'center',
                                }}
                            >
                                Discover
                            </Text>
                        ),

                        tabBarIcon: ({ color, size }) => (
                            <QuestIcon
                                name={getStatusIcon("undiscovered")}
                                size={size}
                                color={color}
                            />
                        ),
                        headerTitle: () => (
                            <HeaderWithIcon
                                iconName={getStatusIcon("undiscovered")}
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
    }
);

export default GameTabNavigator;
