import colorSwatch from "../utils/colors";

export type GameStatus = "preperation" | "in_progress" | "completed";

type AdditionalPages = "search";

type Pages = GameStatus | AdditionalPages;

export const ESRB_RATINGS: Record<number, string> = {
    0: "N/A",
    6: "RP",
    7: "EC",
    8: "E",
    9: "E10",
    10: "T",
    11: "M",
    12: "AO",
};

export const COLOR_ARRAY = [
    colorSwatch.secondary.main, // Vibrant Coral
    colorSwatch.accent.cyan, // Bright Cyan
    colorSwatch.accent.green, // Soft Green
    colorSwatch.accent.purple, // Pastel Purple
    colorSwatch.accent.pink, // Soft Red-Pink
    colorSwatch.accent.yellow, // Warm Yellow
];
