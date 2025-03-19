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
