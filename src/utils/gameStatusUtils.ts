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
            return "compass";
        default:
            return "question";
    }
}

export const getStatusTabName = (status: GameStatus): string => {
    switch (status) {
        case "ongoing":
            return "Ongoing";
        case "backlog":
            return "Backlog";
        case "completed":
            return "Completed";
        case "undiscovered":
            return "Discover";
        default:
            return "Ongoing";
    }
};
