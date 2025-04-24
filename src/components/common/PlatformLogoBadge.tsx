import React from "react";
import { View, StyleSheet, Text, Image as RNImage } from "react-native";
import { colorSwatch } from "src/utils/colorConstants";

interface PlatformLogoBadgeProps {
    platform: string;
    size?: number;
    style?: any;
    tintColor?: string;
}

export const PlatformLogoBadge: React.FC<PlatformLogoBadgeProps> = ({
    platform,
    size = 32,
    style,
    tintColor = colorSwatch.accent.cyan,
}) => {
    if (!platform) return null;

    const getPlatformImage = () => {
        // Map platform names to require() statements for images
        const platformMap: Record<string, any> = {
            "Game Boy": require("../../assets/platforms/Game Boy.png"),
            "Game Boy Advance": require("../../assets/platforms/Game Boy Advance.png"),
            "Nintendo 3DS": require("../../assets/platforms/Nintendo 3DS.png"),
            "Nintendo Switch": require("../../assets/platforms/Nintendo Switch.png"),
            "Nintendo GameCube": require("../../assets/platforms/Nintendo GameCube.png"),
            "Super Nintendo Entertainment System": require("../../assets/platforms/Super Nintendo Entertainment System.png"),
            Wii: require("../../assets/platforms/Wii.png"),
            "Wii U": require("../../assets/platforms/Wii U.png"),
            "PlayStation 5": require("../../assets/platforms/PlayStation 5.png"),
            "PlayStation 4": require("../../assets/platforms/PlayStation 4.png"),
            "PlayStation 3": require("../../assets/platforms/PlayStation 3.png"),
            "PlayStation 2": require("../../assets/platforms/PlayStation 2.png"),
            "PlayStation Portable": require("../../assets/platforms/PlayStation Portable.png"),
            "PlayStation Vita": require("../../assets/platforms/PlayStation Vita.png"),
            Xbox: require("../../assets/platforms/Xbox.png"),
            "Xbox 360": require("../../assets/platforms/Xbox 360.png"),
            "Xbox One": require("../../assets/platforms/Xbox One.png"),
            "Xbox Series X|S": require("../../assets/platforms/Xbox Series.png"),
            "Sega Mega Drive/Genesis": require("../../assets/platforms/Sega Mega Drive_Genesis.png"),
            "Sega Saturn": require("../../assets/platforms/Sega Saturn.png"),
            "PC (Microsoft Windows)": require("../../assets/platforms/PC (Microsoft Windows).png"),
            Mac: require("../../assets/platforms/Mac.png"),
            Linux: require("../../assets/platforms/Linux.png"),
            iOS: require("../../assets/platforms/iOS.png"),
            Android: require("../../assets/platforms/Android.png"),
            PlayStation: require("../../assets/platforms/PlayStation.png"),
            "3DO Interactive Multiplayer": require("../../assets/platforms/3DO Interactive Multiplayer.png"),
            "64DD": require("../../assets/platforms/64DD.png"),
            "Amiga CD32": require("../../assets/platforms/Amiga CD32.png"),
            "Amstrad GX4000": require("../../assets/platforms/Amstrad GX4000.png"),
            "Apple Pippin": require("../../assets/platforms/Apple Pippin.png"),
            Arcade: require("../../assets/platforms/Arcade.png"),
            "Arcadia 2001": require("../../assets/platforms/Arcadia 2001.png"),
            "Atari 2600": require("../../assets/platforms/Atari 2600.png"),
            "Atari 5200": require("../../assets/platforms/Atari 5200.png"),
            "Atari 7800": require("../../assets/platforms/Atari 7800.png"),
            "Atari Jaguar": require("../../assets/platforms/Atari Jaguar.png"),
            "Atari Jaguar CD": require("../../assets/platforms/Atari Jaguar CD.png"),
            "Atari Lynx": require("../../assets/platforms/Atari Lynx.png"),
            "Bally Astrocade": require("../../assets/platforms/Bally Astrocade.png"),
            "Casio Loopy": require("../../assets/platforms/Casio Loopy.png"),
            ColecoVision: require("../../assets/platforms/ColecoVision.png"),
            "Commodore CDTV": require("../../assets/platforms/Commodore CDTV.png"),
            DOS: require("../../assets/platforms/DOS.png"),
            Dreamcast: require("../../assets/platforms/Dreamcast.png"),
            "Epoch Cassette Vision": require("../../assets/platforms/Epoch Cassette Vision.png"),
            "Epoch Super Cassette Vision": require("../../assets/platforms/Epoch Super Cassette Vision.png"),
            "Fairchild Channel F": require("../../assets/platforms/Fairchild Channel F.png"),
            "FM-7": require("../../assets/platforms/FM-7.png"),
            "Game & Watch": require("../../assets/platforms/Game & Watch.png"),
            "Game Boy Color": require("../../assets/platforms/Game Boy Color.png"),
            "Game.com": require("../../assets/platforms/Game.com.png"),
            Gamate: require("../../assets/platforms/Gamate.png"),
            Intellivision: require("../../assets/platforms/Intellivision.png"),
            Microvision: require("../../assets/platforms/Microvision.png"),
            MSX: require("../../assets/platforms/MSX.png"),
            MSX2: require("../../assets/platforms/MSX2.png"),
            "N-Gage": require("../../assets/platforms/N-Gage.png"),
            "Neo Geo AES": require("../../assets/platforms/Neo Geo AES.png"),
            "Neo Geo CD": require("../../assets/platforms/Neo Geo CD.png"),
            "Neo Geo Pocket": require("../../assets/platforms/Neo Geo Pocket.png"),
            "Neo Geo Pocket Color": require("../../assets/platforms/Neo Geo Pocket Color.png"),
            "New Nintendo 3DS": require("../../assets/platforms/New Nintendo 3DS.png"),
            "Nintendo 64": require("../../assets/platforms/Nintendo 64.png"),
            "Nintendo DS": require("../../assets/platforms/Nintendo DS.png"),
            "Nintendo DSi": require("../../assets/platforms/Nintendo DSi.png"),
            "Nintendo Entertainment System": require("../../assets/platforms/Nintendo Entertainment System.png"),
            "Nintendo Switch 2": require("../../assets/platforms/Nintendo Switch 2.png"),
            Odyssey: require("../../assets/platforms/Odyssey.png"),
            "PC Engine SuperGrafx": require("../../assets/platforms/PC Engine SuperGrafx.png"),
            "PC-FX": require("../../assets/platforms/PC-FX.png"),
            "Philips CD-i": require("../../assets/platforms/Philips CD-i.png"),
            Playdate: require("../../assets/platforms/Playdate.png"),
            "PlayStation VR": require("../../assets/platforms/PlayStation VR.png"),
            PocketStation: require("../../assets/platforms/PocketStation.png"),
            "Pokémon mini": require("../../assets/platforms/Pokémon mini.png"),
            Satellaview: require("../../assets/platforms/Satellaview.png"),
            "Sega 32X": require("../../assets/platforms/Sega 32X.png"),
            "Sega CD": require("../../assets/platforms/Sega CD.png"),
            "Sega CD 32X": require("../../assets/platforms/Sega CD 32X.png"),
            "Sega Game Gear": require("../../assets/platforms/Sega Game Gear.png"),
            "Sega Pico": require("../../assets/platforms/Sega Pico.png"),
            "SG-1000": require("../../assets/platforms/SG-1000.png"),
            "Sharp MZ-2200": require("../../assets/platforms/Sharp MZ-2200.png"),
            "Sharp X1": require("../../assets/platforms/Sharp X1.png"),
            "Sharp X68000": require("../../assets/platforms/Sharp X68000.png"),
            "Sinclair ZX81": require("../../assets/platforms/Sinclair ZX81.png"),
            SteamVR: require("../../assets/platforms/SteamVR.png"),
            "Super A'Can": require("../../assets/platforms/Super A'Can.png"),
            "Super Famicom": require("../../assets/platforms/Super Famicom.png"),
            "Texas Instruments TI-99": require("../../assets/platforms/Texas Instruments TI-99.png"),
            "Thomson MO5": require("../../assets/platforms/Thomson MO5.png"),
            "TRS-80": require("../../assets/platforms/TRS-80.png"),
            Vectrex: require("../../assets/platforms/Vectrex.png"),
            "Virtual Boy": require("../../assets/platforms/Virtual Boy.png"),
            "Windows Mixed Reality": require("../../assets/platforms/Windows Mixed Reality.png"),
            "Windows Mobile": require("../../assets/platforms/Windows Mobile.png"),
            "Windows Phone": require("../../assets/platforms/Windows Phone.png"),
            WonderSwan: require("../../assets/platforms/WonderSwan.png"),
            "WonderSwan Color": require("../../assets/platforms/WonderSwan Color.png"),
            "ZX Spectrum": require("../../assets/platforms/ZX Spectrum.png"),
        };

        return platformMap[platform] || null;
    };

    const logo = getPlatformImage();

    return (
        <View
            style={[styles.container, { width: size, height: size / 4 }, style]}
        >
            {logo ? (
                <RNImage
                    source={logo}
                    style={[styles.image, tintColor ? { tintColor } : null]}
                    resizeMode="contain"
                />
            ) : (
                <Text style={[styles.fallbackText, { color: tintColor }]}>
                    {platform}
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        zIndex: 1,
        justifyContent: "center",
        alignItems: "center",
        minWidth: 32,
    },
    image: {
        height: "100%",
        width: "100%",
        minHeight: 32,
    },
    fallbackText: {
        fontSize: 14,
        fontWeight: "bold",
        textAlign: "left",
        textAlignVertical: "center",
    },
});
