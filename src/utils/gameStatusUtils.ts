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
