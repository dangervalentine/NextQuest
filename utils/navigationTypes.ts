import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

export type RootStackParamList = {
    Home: undefined;
    QuestGameDetailPage: { id: number; name: string };
};

export type ScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export type DetailsScreenRouteProp = RouteProp<
    RootStackParamList,
    "QuestGameDetailPage"
>;
