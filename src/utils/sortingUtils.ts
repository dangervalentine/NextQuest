export const sortGamesByReleaseDate = <
    T extends { release_dates?: { date: number }[] }
>(
    games: T[]
): T[] => {
    return [...games].sort((a, b) => {
        // Find earliest release date for game A
        const earliestDateA =
            a.release_dates?.reduce((earliest, current) => {
                return earliest === null || current.date < earliest
                    ? current.date
                    : earliest;
            }, null as number | null) ?? null;

        // Find earliest release date for game B
        const earliestDateB =
            b.release_dates?.reduce((earliest, current) => {
                return earliest === null || current.date < earliest
                    ? current.date
                    : earliest;
            }, null as number | null) ?? null;

        // Handle cases where dates might be missing
        if (earliestDateA === null && earliestDateB === null) return 0;
        if (earliestDateA === null) return 1; // Push null dates to the end
        if (earliestDateB === null) return -1;

        // Sort by newest first (larger timestamp = more recent)
        return earliestDateB - earliestDateA;
    });
};
