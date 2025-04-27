import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { GameStatus } from "src/constants/config/gameStatus";

export type TabParamList = {
    Ongoing: undefined;
    Backlog: undefined;
    Completed: undefined;
    Search: {
        franchiseId?: number;
        platformId?: number;
        genreId?: number;
        themeId?: number;
        companyId?: number;
    };
};

export type RootStackParamList = {
    Home: undefined;
    GameTabs: {
        screen?: keyof TabParamList;
        params?: TabParamList[keyof TabParamList];
    };
    QuestGameDetailPage: { id: number; name: string; gameStatus: GameStatus };
};

export type ScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export type QuestGameDetailRouteProp = RouteProp<
    RootStackParamList,
    "QuestGameDetailPage"
>;

export type HomeScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    "Home"
>;

export type GameTabsScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    "GameTabs"
>;

export type SearchTabRouteProp = RouteProp<TabParamList, "Search">;
