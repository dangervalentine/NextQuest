import React from "react";
import { View, Text } from "react-native";
import {
    FontAwesome5,
    MaterialCommunityIcons,
    SimpleLineIcons,
} from "@expo/vector-icons";
import { colorSwatch } from "../../utils/colorConstants";
import QuestIcon from "./GameIcon";

interface HeaderWithIconProps {
    iconName:
        | keyof typeof MaterialCommunityIcons.glyphMap
        | keyof typeof SimpleLineIcons.glyphMap
        | keyof typeof FontAwesome5.glyphMap;
    title: string;
}

const HeaderWithIcon: React.FC<HeaderWithIconProps> = ({ iconName, title }) => {
    return (
        <View
            style={{
                flexDirection: "row",
                alignItems: "center",
            }}
        >
            <View style={{ marginRight: 8 }}>
                <QuestIcon
                    name={iconName}
                    size={24}
                    color={colorSwatch.secondary.main}
                />
            </View>
            <Text
                style={{
                    fontSize: 24,
                    fontWeight: "bold",
                    color: colorSwatch.secondary.main,
                }}
            >
                {title}
            </Text>
        </View>
    );
};

export default HeaderWithIcon;
