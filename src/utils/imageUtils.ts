import { ImageSourcePropType } from "react-native";
import { GameStatus } from "../constants/config/gameStatus";

export const getBackgroundImage = (
    status: GameStatus | undefined
): ImageSourcePropType => {
    switch (status) {
        case "ongoing":
            return require("../assets/next-quest-icons/next_quest_mono_yellow.png");
        case "completed":
            return require("../assets/next-quest-icons/next_quest_mono_green.png");
        case "backlog":
            return require("../assets/next-quest-icons/next_quest_mono_purple.png");
        case "undiscovered":
            return require("../assets/next-quest-icons/next_quest_mono_cyan.png");
        default:
            return require("../assets/next-quest-icons/next_quest_mono_white.png");
    }
};
