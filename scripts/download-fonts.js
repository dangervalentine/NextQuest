const https = require("https");
const fs = require("fs");
const path = require("path");

const fonts = [
    // // Fira Code
    {
        name: "FiraCode-Regular.ttf",
        url:
            "https://github.com/tonsky/FiraCode/raw/master/distr/ttf/FiraCode-Regular.ttf",
    },
    {
        name: "FiraCode-Medium.ttf",
        url:
            "https://github.com/tonsky/FiraCode/raw/master/distr/ttf/FiraCode-Medium.ttf",
    },
    {
        name: "FiraCode-SemiBold.ttf",
        url:
            "https://github.com/tonsky/FiraCode/raw/master/distr/ttf/FiraCode-SemiBold.ttf",
    },
    {
        name: "FiraCode-Bold.ttf",
        url:
            "https://github.com/tonsky/FiraCode/raw/master/distr/ttf/FiraCode-Bold.ttf",
    },
    // Victor Mono
    {
        name: "VictorMono-Regular.ttf",
        url:
            "https://github.com/rubjo/victor-mono/raw/master/public/TTF/VictorMono-Regular.ttf",
    },
    {
        name: "VictorMono-Italic.ttf",
        url:
            "https://github.com/rubjo/victor-mono/raw/master/public/TTF/VictorMono-Italic.ttf",
    },
    {
        name: "VictorMono-Bold.ttf",
        url:
            "https://github.com/rubjo/victor-mono/raw/master/public/TTF/VictorMono-Bold.ttf",
    },
    // Inter
    {
        name: "Inter-Regular.ttf",
        url:
            "https://github.com/rsms/inter/raw/master/docs/font-files/Inter-Regular.ttf",
    },
    {
        name: "Inter-Bold.ttf",
        url:
            "https://github.com/rsms/inter/raw/master/docs/font-files/Inter-Bold.ttf",
    },
];

const fontsDir = path.join(__dirname, "..", "assets", "fonts");

if (!fs.existsSync(fontsDir)) {
    fs.mkdirSync(fontsDir, { recursive: true });
}

fonts.forEach((font) => {
    const filePath = path.join(fontsDir, font.name);
    const file = fs.createWriteStream(filePath);

    https
        .get(font.url, (response) => {
            response.pipe(file);
            file.on("finish", () => {
                file.close();
                console.log(`Downloaded ${font.name}`);
            });
        })
        .on("error", (err) => {
            fs.unlink(filePath, () => {}); // Handle file removal safely
            console.error(`Error downloading ${font.name}: ${err.message}`);
        });
});
