/**
 * ESRB (Entertainment Software Rating Board) ratings mapping
 * Maps rating IDs to their corresponding rating symbols
 */
export const ESRB_RATINGS: Record<number, string> = {
    0: "N/A", // Not rated
    6: "RP", // Rating Pending
    7: "EC", // Early Childhood
    8: "E", // Everyone
    9: "E10", // Everyone 10+
    10: "T", // Teen
    11: "M", // Mature
    12: "AO", // Adults Only
};
