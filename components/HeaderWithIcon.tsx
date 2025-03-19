import React from "react";
import { View, Text } from "react-native";
import Icon from "react-native-vector-icons/SimpleLineIcons";
import colorSwatch from "../helpers/colors";

interface HeaderWithIconProps {
    iconName: string;
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
            <Icon
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
