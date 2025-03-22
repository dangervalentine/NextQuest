import React from "react";
import { View, Text } from "react-native";
import { SimpleLineIcons } from "@expo/vector-icons";
import { colorSwatch } from "../utils/colorConstants";

interface HeaderWithIconProps {
    iconName: keyof typeof SimpleLineIcons.glyphMap;
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
            <SimpleLineIcons
                name={iconName}
                size={24}
                color={colorSwatch.secondary.main}
                style={{ marginRight: 8 }}
            />
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
