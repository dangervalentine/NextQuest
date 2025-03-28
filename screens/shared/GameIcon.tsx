import React from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";
import { SimpleLineIcons } from "@expo/vector-icons";
import { Image } from "react-native";
import { colorSwatch } from "../../utils/colorConstants";

// Define the valid icon names for each library
type MaterialCommunityIconNames = keyof typeof MaterialCommunityIcons.glyphMap;
type FontAwesome5IconNames = "scroll" | "trophy" | "user" | "home"; // Add more valid FontAwesome5 names as needed
type SimpleLineIconsIconNames = keyof typeof SimpleLineIcons.glyphMap;

type IconProps = {
    name: string | number | symbol;
    size?: number;
    color?: string;
};

// Map icon names to their respective libraries
const QuestIcon: React.FC<IconProps> = ({
    name,
    size = 24,
    color = colorSwatch.text.primary,
}) => {
    if (name in MaterialCommunityIcons.glyphMap) {
        return (
            <MaterialCommunityIcons
                name={name as MaterialCommunityIconNames}
                size={size}
                color={color}
            />
        );
    }

    if (name in SimpleLineIcons.glyphMap) {
        return (
            <SimpleLineIcons
                name={name as SimpleLineIconsIconNames}
                size={size}
                color={color}
            />
        );
    }

    if (typeof name === "string" && ["scroll", "trophy"].includes(name)) {
        return (
            <FontAwesome5
                name={name as FontAwesome5IconNames}
                size={size}
                color={color}
            />
        );
    }
    return (
        <Image
            source={require("../../assets/next_quest.png")}
            style={{ width: size, height: size }}
        />
    ); // Fallback to NextQuest image
};

export default QuestIcon;
