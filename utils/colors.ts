import { COLOR_ARRAY } from "./colorConstants";

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
