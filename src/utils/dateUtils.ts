export const formatReleaseDate = (timestamp: number): string => {
    const date = new Date(timestamp * 1000); // Convert Unix timestamp to milliseconds
    const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
    ];
    const month = months[date.getMonth()];
    const day = date.getDate().toString().padStart(2, "0");
    const year = date.getFullYear();

    return `${month} ${day}, ${year}`;
};
