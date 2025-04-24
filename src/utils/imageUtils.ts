import { ImageSourcePropType } from "react-native";
import { GameStatus } from "../constants/config/gameStatus";

export const getBackgroundImage = (
    status: GameStatus | undefined
): ImageSourcePropType => {
    switch (status) {
        case "ongoing":
            return require("../assets/next-quest-icons/next_quest_yellow.png");
        case "completed":
            return require("../assets/next-quest-icons/next_quest_green.png");
        case "backlog":
            return require("../assets/next-quest-icons/next_quest_purple.png");
        case "undiscovered":
            return require("../assets/next-quest-icons/next_quest_cyan.png");
        default:
            return require("../assets/next-quest-icons/next_quest_white.png");
    }
};
