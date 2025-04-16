import { GameStatus } from "src/constants/config/gameStatus";
import { colorSwatch } from "./colorConstants";

interface StatusStyle {
    borderColor: string;
    color: string;
}

/**
 * Returns the appropriate colors for a given game status
 * @param status The game status to get colors for
 * @returns An object containing borderColor and color values
 */
export const getStatusStyles = (
    status: GameStatus | undefined
): StatusStyle => {
    switch (status) {
        case "completed":
            return {
                borderColor: colorSwatch.accent.green,
                color: colorSwatch.accent.green,
            };
        case "ongoing":
            return {
                borderColor: colorSwatch.accent.yellow,
                color: colorSwatch.accent.yellow,
            };
        case "backlog":
            return {
                borderColor: colorSwatch.accent.purple,
                color: colorSwatch.accent.purple,
            };
        case "undiscovered":
            return {
                borderColor: colorSwatch.accent.cyan,
                color: colorSwatch.accent.cyan,
            };
        case "on_hold":
        case "dropped":
        default:
            return {
                borderColor: colorSwatch.neutral.darkGray,
                color: colorSwatch.neutral.darkGray,
            };
    }
};

export const getStatusLabel = (status: GameStatus): string => {
    switch (status) {
        case "ongoing":
            return "Ongoing";
        case "completed":
            return "Completed";
        case "backlog":
            return "Backlog";
        case "undiscovered":
            return "Undiscovered";
        case "on_hold":
            return "On Hold";
        case "dropped":
            return "Dropped";
        default:
            return status;
    }
};
