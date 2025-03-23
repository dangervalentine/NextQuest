/**
 * Represents the current status of a game in the user's quest log
 */
export type GameStatus =
    | "active" // A game currently being played; an ongoing quest.
    | "inactive" // A game that was started but is currently on hold.
    | "completed" // A game that has been fully finished or conquered.
    | "undiscovered"; // A game yet to be started; a future adventure awaits.
