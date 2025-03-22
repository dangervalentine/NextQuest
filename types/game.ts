/**
 * Represents the current status of a game in the user's quest log
 */
export type GameStatus = "preperation" | "in_progress" | "completed";

/**
 * Additional page types for navigation purposes
 */
export type AdditionalPages = "search";

/**
 * Combined type for all possible page types in the app
 */
export type Pages = GameStatus | AdditionalPages;
