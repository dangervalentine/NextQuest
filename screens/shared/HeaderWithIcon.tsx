import React from "react";
import { View, Text, StyleSheet } from "react-native";
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
        <View style={styles.container}>
            <View style={styles.iconContainer}>
                <QuestIcon
                    name={iconName}
                    size={24}
                    color={colorSwatch.accent.cyan}
                />
            </View>
            <Text style={styles.title}>{title}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
    },
    iconContainer: {
        marginRight: 12,
    },
    title: {
        fontSize: 24,
        fontWeight: "600",
        color: colorSwatch.accent.purple,
    },
});

export default HeaderWithIcon;
