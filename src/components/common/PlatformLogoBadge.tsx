import React from "react";
import { View, StyleSheet, Text } from "react-native";
import { SvgProps } from "react-native-svg";
import { Image } from "expo-image";

// Import only cyan variants
import GameBoyCyan from "../../assets/platform-logos-colored/Game Boy-cyan.svg";
import GameBoyAdvanceCyan from "../../assets/platform-logos-colored/Game Boy Advance-cyan.svg";
import Nintendo3DSCyan from "../../assets/platform-logos-colored/Nintendo 3DS-cyan.svg";
import NintendoSwitchCyan from "../../assets/platform-logos-colored/Nintendo Switch-cyan.svg";
import NintendoGameCubeCyan from "../../assets/platform-logos-colored/Nintendo GameCube-cyan.svg";
import SNESCyan from "../../assets/platform-logos-colored/Super Nintendo Entertainment System-cyan.svg";
import WiiCyan from "../../assets/platform-logos-colored/Wii-cyan.svg";
import WiiUCyan from "../../assets/platform-logos-colored/Wii U-cyan.svg";
import PS5Cyan from "../../assets/platform-logos-colored/PlayStation 5-cyan.svg";
import PS4Cyan from "../../assets/platform-logos-colored/PlayStation 4-cyan.svg";
import PS3Cyan from "../../assets/platform-logos-colored/PlayStation 3-cyan.svg";
import PS2Cyan from "../../assets/platform-logos-colored/PlayStation 2-cyan.svg";
import PSPCyan from "../../assets/platform-logos-colored/PlayStation Portable-cyan.svg";
import PSVitaCyan from "../../assets/platform-logos-colored/PlayStation Vita-cyan.svg";
import XboxCyan from "../../assets/platform-logos-colored/Xbox-cyan.svg";
import Xbox360Cyan from "../../assets/platform-logos-colored/Xbox 360-cyan.svg";
import XboxOneCyan from "../../assets/platform-logos-colored/Xbox One-cyan.svg";
import XboxSeriesXCyan from "../../assets/platform-logos-colored/Xbox Series-cyan.svg";
import SegaMDCyan from "../../assets/platform-logos-colored/Sega Mega Drive_Genesis-cyan.svg";
import SegaSaturnCyan from "../../assets/platform-logos-colored/Sega Saturn-cyan.svg";
import PCCyan from "../../assets/platform-logos-colored/PC (Microsoft Windows)-cyan.svg";
import MacCyan from "../../assets/platform-logos-colored/Mac-cyan.svg";
import LinuxCyan from "../../assets/platform-logos-colored/Linux-cyan.svg";
import iOSCyan from "../../assets/platform-logos-colored/iOS-cyan.svg";
import AndroidCyan from "../../assets/platform-logos-colored/Android-cyan.svg";
import PlayStationCyan from "../../assets/platform-logos-colored/PlayStation-cyan.svg";

import { colorSwatch } from "src/utils/colorConstants";

interface PlatformLogoBadgeProps {
    platform: string;
    size?: number;
    style?: any;
}

export const PlatformLogoBadge: React.FC<PlatformLogoBadgeProps> = ({
    platform,
    size = 32,
    style,
}) => {
    if (!platform) return null;

    const mappedPlatform = platform;

    const getPlatformLogo = (): React.FC<SvgProps> | null => {
        const key = `${mappedPlatform}-cyan`;

        switch (key) {
            case "Game Boy-cyan":
                return GameBoyCyan;
            case "Game Boy Advance-cyan":
                return GameBoyAdvanceCyan;
            case "Nintendo 3DS-cyan":
                return Nintendo3DSCyan;
            case "Nintendo Switch-cyan":
                return NintendoSwitchCyan;
            case "Nintendo GameCube-cyan":
                return NintendoGameCubeCyan;
            case "Super Nintendo Entertainment System-cyan":
                return SNESCyan;
            case "Wii-cyan":
                return WiiCyan;
            case "Wii U-cyan":
                return WiiUCyan;
            case "PlayStation 5-cyan":
                return PS5Cyan;
            case "PlayStation 4-cyan":
                return PS4Cyan;
            case "PlayStation 3-cyan":
                return PS3Cyan;
            case "PlayStation 2-cyan":
                return PS2Cyan;
            case "PlayStation Portable-cyan":
                return PSPCyan;
            case "PlayStation Vita-cyan":
                return PSVitaCyan;
            case "Xbox-cyan":
                return XboxCyan;
            case "Xbox 360-cyan":
                return Xbox360Cyan;
            case "Xbox One-cyan":
                return XboxOneCyan;
            case "Xbox Series X|S-cyan":
                return XboxSeriesXCyan;
            case "Sega Mega Drive_Genesis-cyan":
                return SegaMDCyan;
            case "Sega Saturn-cyan":
                return SegaSaturnCyan;
            case "PC (Microsoft Windows)-cyan":
                return PCCyan;
            case "Mac-cyan":
                return MacCyan;
            case "Linux-cyan":
                return LinuxCyan;
            case "iOS-cyan":
                return iOSCyan;
            case "Android-cyan":
                return AndroidCyan;
            case "PlayStation-cyan":
                return PlayStationCyan;
            default:
                return null;
        }
    };

    const logo = getPlatformLogo();

    return (
        <View
            style={[styles.container, { width: size, height: size / 4 }, style]}
        >
            {logo ? (
                <Image
                    source={logo}
                    style={styles.image}
                    contentFit="contain"
                />
            ) : (
                <Text style={styles.image}>{platform}</Text>
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
        color: colorSwatch.accent.cyan,
        fontSize: 14,
        fontWeight: "bold",
        textAlign: "left",
        textAlignVertical: "center",
    },
});
