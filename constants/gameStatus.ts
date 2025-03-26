/**
 * Represents the current status of a game in the user's quest log
 */
export type GameStatus =
    | "ongoing" // A game currently being played; an ongoing quest.
    | "backlog" // A game that has not been started yet.
    | "completed" // A game that has been fully finished or conquered.
    | "on_hold" // A game that is temporarily paused.
    | "undiscovered" // A game yet to be started; a future adventure awaits.
    | "dropped"; // A game that has been abandoned.
