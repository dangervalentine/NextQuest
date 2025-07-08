import { GameStatus } from "src/constants/config/gameStatus";

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

export const getStatusIcon = (status: GameStatus): string => {
    switch (status) {
        case "ongoing":
            return "gamepad-variant";
        case "backlog":
            return "list";
        case "completed":
            return "check-circle";
        case "undiscovered":
            return "magnify";
        default:
            return "question";
    }
}
