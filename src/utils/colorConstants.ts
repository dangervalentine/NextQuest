export const colorSwatch = {
    primary: {
        light: "#7E97AC", // Muted Blue-Gray
        main: "#82AAFF", // Bright Blue (Night Owl's primary)
        dark: "#4976A1", // Deep Cool Blue
    },
    secondary: {
        light: "#F78C6C", // Warm Orange (Night Owl's function color)
        main: "#FC9867", // Vibrant Coral (Night Owl's constant color)
        dark: "#D76D51", // Deeper Orange-Red
    },
    accent: {
        cyan: "#7fdbca", // Night Owl's Cyan (Links and special elements)
        green: "#C3E88D", // Soft Green (Success states and completion)
        purple: "#C792EA", // Night Owl's Purple (Section titles and keywords)
        pink: "#F07178", // Soft Red-Pink (Errors and warnings)
        yellow: "#FFCB6B", // Warm Yellow (Highlights and active states)
    },
    neutral: {
        white: "#FFFFFF",
        lightGray: "#D6DEEB", // Night Owl's Light Text
        gray: "#637777", // Night Owl's Comment Color
        darkGray: "#1D3B53", // Night Owl's Border Color
        black: "#011627", // Night Owl's Deepest Blue-Black
    },
    background: {
        light: "#D6DEEB", // Light mode text / dark mode background text
        medium: "#1D3B53", // Night Owl's Selection Background
        dark: "#011627", // Night Owl's Main Background
        darker: "#020f1d", // Nested Background (Even darker than dark)
        darkest: "#01111d", // Deepest Background (For maximum contrast)
    },
    text: {
        primary: "#D6DEEB", // Night Owl's Primary Text
        secondary: "#637777", // Night Owl's Comment Color (Muted text)
        inverse: "#011627", // Dark Text on Light Backgrounds
        muted: "#637777", // Comment text
    },
};

const swatchRGB = {
    primary: {
        light: "rgb(126, 151, 172)", // Muted Blue-Gray
        main: "rgb(130, 170, 255)", // Bright Blue (Night Owl's primary)
        dark: "rgb(73, 118, 161)", // Deep Cool Blue
    },
    secondary: {
        light: "rgb(247, 140, 108)", // Warm Orange (Night Owl's function color)
        main: "rgb(252, 152, 103)", // Vibrant Coral (Night Owl's constant color)
        dark: "rgb(215, 109, 81)", // Deeper Orange-Red
    },
    accent: {
        cyan: "rgb(127, 219, 202)", // Night Owl's Cyan (Links and special elements)
        green: "rgb(195, 232, 141)", // Soft Green (Success states and completion)
        purple: "rgb(199, 146, 234)", // Night Owl's Purple (Section titles and keywords)
        pink: "rgb(240, 113, 120)", // Soft Red-Pink (Errors and warnings)
        yellow: "rgb(255, 203, 107)", // Warm Yellow (Highlights and active states)
    },
    neutral: {
        white: "rgb(255, 255, 255)",
        lightGray: "rgb(214, 222, 235)", // Night Owl's Light Text
        gray: "rgb(99, 119, 119)", // Night Owl's Comment Color
        darkGray: "rgb(29, 59, 83)", // Night Owl's Border Color
        black: "rgb(1, 22, 39)", // Night Owl's Deepest Blue-Black
    },
    background: {
        light: "rgb(214, 222, 235)", // Light mode text / dark mode background text
        medium: "rgb(29, 59, 83)", // Night Owl's Selection Background
        dark: "rgb(1, 22, 39)", // Night Owl's Main Background
        darker: "rgb(2, 15, 29)", // Nested Background (Even darker than dark)
        darkest: "rgb(1, 17, 29)", // Deepest Background (For maximum contrast)
    },
    text: {
        primary: "rgb(214, 222, 235)", // Night Owl's Primary Text
        secondary: "rgb(99, 119, 119)", // Night Owl's Comment Color (Muted text)
        inverse: "rgb(1, 22, 39)", // Dark Text on Light Backgrounds
        muted: "rgb(99, 119, 119)", // Comment text
    },
};

export const COLOR_ARRAY = [
    colorSwatch.secondary.main, // Vibrant Coral
    colorSwatch.accent.cyan, // Night Owl Cyan
    colorSwatch.accent.green, // Soft Green
    colorSwatch.accent.purple, // Night Owl Purple
    colorSwatch.accent.pink, // Soft Red-Pink
    colorSwatch.accent.yellow, // Warm Yellow
];
