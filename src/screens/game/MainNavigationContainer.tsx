import React, {
    useState,
    useCallback,
    useEffect,
    useRef,
    useMemo,
} from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { Image, View, StyleSheet, Platform, KeyboardAvoidingView } from "react-native";
import QuestGameDetailPage from "./QuestGameDetailPage";
import { GameStatus } from "src/constants/config/gameStatus";
import { PlatformSelectionModal } from "../../components/common/PlatformSelectionModal";
import { QuestToast } from "src/components/common/QuestToast";
import GameTabs from "./GameTabs";
import {
    RootStackParamList,
    TabParamList,
} from "src/navigation/navigationTypes";
import { getStatusColor } from "src/utils/colorsUtils";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { colorSwatch } from "src/constants/theme/colorConstants";
import { useGameStatus } from "src/contexts/GameStatusContext";
import { useGames, GamesProvider } from "src/contexts/GamesContext";
import { GameTabNavigatorRef } from "./GameList/components/GameTabNavigator";
import AnimatedBackButton from "./shared/AnimatedBackButton";

const Stack = createStackNavigator<RootStackParamList>();

export type MainNavigationProp = NavigationProp<RootStackParamList>;

interface MainNavigationContentProps {
    setNavigationCallback: (callback: (status: GameStatus) => void) => void;
}

const MainNavigationContent: React.FC<MainNavigationContentProps> = ({
    setNavigationCallback,
}) => {
    const navigation = useNavigation<MainNavigationProp>();
    const gameTabsRef = useRef<GameTabNavigatorRef>(null);
    const { activeStatus, setActiveStatus } = useGameStatus();
    const {
        gameData,
        isLoading,
        handleStatusChange,
        handleRemoveItem,
        handleReorder,
        handleDiscover,
    } = useGames();

    const [activeTabColor, setActiveTabColor] = useState<string>(
        colorSwatch.neutral.white
    );

    const handleTabChange = useCallback(
        (tabName: string) => {
            const status = tabName.toLowerCase() as GameStatus;
            setActiveTabColor(getStatusColor(status));
            setActiveStatus(status);
        },
        [setActiveStatus, setActiveTabColor]
    );

    useEffect(() => {
        // Set initial tab color
        setActiveTabColor(getStatusColor("ongoing"));
    }, [setActiveTabColor]);

    const getStatusTab = useCallback(
        (status: GameStatus): keyof TabParamList => {
            switch (status) {
                case "ongoing":
                    return "Ongoing";
                case "backlog":
                    return "Backlog";
                case "completed":
                    return "Completed";
                case "undiscovered":
                    return "Search";
                default:
                    return "Ongoing";
            }
        },
        []
    );

    const handleNavigateToStatus = useCallback(
        (status: GameStatus) => {
            // First navigate to the tab
            navigation.navigate("GameTabs", {
                screen: getStatusTab(status),
            });

            // Then scroll to the bottom after a short delay to ensure navigation is complete
            setTimeout(() => {
                gameTabsRef.current?.scrollToBottom(status);
            }, 500);
        },
        [navigation, getStatusTab]
    );

    // Register the navigation callback so the outer component can use it
    useEffect(() => {
        setNavigationCallback(handleNavigateToStatus);
    }, [setNavigationCallback, handleNavigateToStatus]);

    // Memoize the component's UI for stable props
    const gameTabs = useMemo(
        () => (
            <GameTabs
                ref={gameTabsRef}
                gameData={gameData}
                isLoading={isLoading}
                handleStatusChange={handleStatusChange}
                handleRemoveItem={handleRemoveItem}
                handleReorder={handleReorder}
                handleDiscover={handleDiscover}
                onTabChange={handleTabChange}
            />
        ),
        [
            gameData,
            isLoading,
            handleStatusChange,
            handleRemoveItem,
            handleReorder,
            handleDiscover,
            handleTabChange,
        ]
    );

    return (
        <>
            <Stack.Navigator
                screenOptions={{
                    headerStyle: {
                        backgroundColor: colorSwatch.background.darkest,
                        elevation: 0,
                        shadowOpacity: 0,
                        borderBottomWidth: 0,
                    },
                    headerTitleStyle: {
                        color: colorSwatch.accent.cyan,
                        fontFamily: "Inter-Regular",
                    },
                    headerTintColor: colorSwatch.accent.cyan,
                }}
            >
                <Stack.Screen
                    name="GameTabs"
                    options={{
                        headerShown: false,
                    }}
                >
                    {() => (
                        <View style={styles.container}>
                            <Image
                                source={require("../../assets/next-quest-icons/next_quest_white.png")}
                                style={styles.backgroundImage}
                                resizeMode="contain"
                                tintColor={getStatusColor(activeStatus)}
                            />
                            <View style={styles.contentContainer}>
                                {gameTabs}
                            </View>
                        </View>
                    )}
                </Stack.Screen>
                <Stack.Screen
                    name="QuestGameDetailPage"
                    component={QuestGameDetailPage}
                    options={({ route, navigation }) => ({
                        headerTransparent: true,
                        headerTintColor: activeTabColor,
                        headerLeft: () => (
                            <AnimatedBackButton
                                onPress={() => navigation.goBack()}
                                color={activeTabColor}
                                title={route.params.name}
                            />
                        ),
                        headerTitle: "",
                        headerBackgroundContainerStyle: {},
                        animation: "slide_from_right",
                    })}
                />
            </Stack.Navigator>
            <QuestToast />
        </>
    );
};

const MainNavigationContainer: React.FC = () => {
    // Use a simple variable instead of a ref with readonly current
    let navigationCallback: ((status: GameStatus) => void) | null = null;

    // Platform modal component to be passed to GamesProvider
    const platformModalComponent = useCallback(
        (
            isVisible: boolean,
            platforms: Array<{ id: number; name: string }>,
            onSelect: (platform: { id: number; name: string }) => void,
            onClose: () => void
        ) => (
            <PlatformSelectionModal
                visible={isVisible}
                onClose={onClose}
                onSelect={onSelect}
                platforms={platforms}
            />
        ),
        []
    );

    const setNavigationCallback = useCallback(
        (callback: (status: GameStatus) => void) => {
            navigationCallback = callback;
        },
        []
    );

    return (
        <GamesProvider
            platformModalComponent={platformModalComponent}
            onNavigateToStatus={(status) => {
                // Forward the navigation call to the inner component's handler
                if (navigationCallback) {
                    navigationCallback(status);
                }
            }}
        >
            <MainNavigationContent
                setNavigationCallback={setNavigationCallback}
            />
        </GamesProvider>
    );
};

// Keep these styles from the original component
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backgroundImage: {
        ...StyleSheet.absoluteFillObject,
        width: "100%",
        height: "100%",
        opacity: 0.2,
        zIndex: -1,
    },
    contentContainer: {
        flex: 1,
        backgroundColor: "transparent",
        zIndex: 1,
    },
});

export default React.memo(MainNavigationContainer);
