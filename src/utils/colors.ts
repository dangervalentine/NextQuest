import { GameStatus } from "src/constants/config/gameStatus";
import { COLOR_ARRAY, colorSwatch } from "./colorConstants";

export const generateRandomColorSequence = (length: number): string[] => {
    if (length <= 0) return [];

    const result: string[] = [];
    let lastColor = "";

    for (let i = 0; i < length; i++) {
        const availableColors = COLOR_ARRAY.filter(
            (color) => color !== lastColor
        );
        const randomColor =
            availableColors[Math.floor(Math.random() * availableColors.length)];

        result.push(randomColor);
        lastColor = randomColor;
    }

    return result;
};

export const getRatingColor = (rating: number): string => {
    // Normal rating color logic for non-10 ratings
    const normalizedRating = rating / 10;

    if (rating === 1) {
        return colorSwatch.accent.pink;
    }

    if (rating === 10) {
        return colorSwatch.accent.green;
    }

    if (normalizedRating <= 0.4) {
        // Pink to Orange gradient (1-4)
        const t = (normalizedRating - 0.1) * (1 / 0.3); // 0-1 for 0.1-0.4 range
        const pinkRGB = hexToRGB(colorSwatch.accent.pink);
        const orangeRGB = hexToRGB(colorSwatch.secondary.main);
        return interpolateColors(t, pinkRGB, orangeRGB);
    } else if (normalizedRating <= 0.7) {
        // Orange to Yellow gradient (4-7)
        const t = (normalizedRating - 0.4) * (1 / 0.3); // 0-1 for 0.4-0.7 range
        const orangeRGB = hexToRGB(colorSwatch.secondary.main);
        const yellowRGB = hexToRGB(colorSwatch.accent.yellow);
        return interpolateColors(t, orangeRGB, yellowRGB);
    } else if (normalizedRating < 1) {
        // Yellow to Green gradient (7-9)
        const t = (normalizedRating - 0.7) * (1 / 0.3); // 0-1 for 0.7-1.0 range
        const yellowRGB = hexToRGB(colorSwatch.accent.yellow);
        const greenRGB = hexToRGB(colorSwatch.accent.green);
        return interpolateColors(t, yellowRGB, greenRGB);
    }
    return colorSwatch.background.darkest;
};

// Helper function to convert hex to RGB
const hexToRGB = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
};

// Helper function to interpolate between two RGB colors
const interpolateColors = (
    t: number,
    color1: { r: number; g: number; b: number },
    color2: { r: number; g: number; b: number }
): string => {
    const r = Math.round(color1.r + (color2.r - color1.r) * t);
    const g = Math.round(color1.g + (color2.g - color1.g) * t);
    const b = Math.round(color1.b + (color2.b - color1.b) * t);
    return `rgb(${r}, ${g}, ${b})`;
};

export const getStatusColor = (status: GameStatus): string => {
    switch (status) {
        case "ongoing":
            return colorSwatch.accent.yellow;
        case "completed":
            return colorSwatch.accent.green;
        case "backlog":
            return colorSwatch.accent.purple;
        case "undiscovered":
            return colorSwatch.accent.cyan;
        default:
            return colorSwatch.accent.cyan;
    }
};

export const hexToRgba = (hex: string, alpha: number = 1): string => {
    const normalizedHex = hex.replace("#", "");
    const bigint = parseInt(normalizedHex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
