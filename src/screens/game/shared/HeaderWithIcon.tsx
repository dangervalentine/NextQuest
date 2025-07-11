import React from "react";
import { View, StyleSheet } from "react-native";
import {
    FontAwesome5,
    MaterialCommunityIcons,
    SimpleLineIcons,
} from "@expo/vector-icons";
import QuestIcon from "./GameIcon";
import Text from "../../../components/common/Text";
import { colorSwatch } from "src/constants/theme/colorConstants";

interface HeaderWithIconProps {
    iconName:
    | keyof typeof MaterialCommunityIcons.glyphMap
    | keyof typeof SimpleLineIcons.glyphMap
    | keyof typeof FontAwesome5.glyphMap;
    title: string;
    color?: string;
}

const HeaderWithIcon: React.FC<HeaderWithIconProps> = ({
    iconName,
    title,
    color,
}) => {
    return (
        <View style={styles.container}>
            <View style={styles.iconContainer}>
                <QuestIcon
                    name={iconName}
                    size={24}
                    color={color || colorSwatch.accent.cyan}
                />
            </View>
            <Text variant="title" style={[styles.title, { color }]} numberOfLines={1}>
                {title}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        gap: 8,
    },
    iconContainer: {
        marginRight: 12,
    },
    title: {
        color: colorSwatch.accent.purple,
        width: "100%",
    },
});

export default HeaderWithIcon;
