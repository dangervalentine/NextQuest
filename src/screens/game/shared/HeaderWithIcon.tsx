import React from "react";
import { View, StyleSheet } from "react-native";
import {
    FontAwesome5,
    MaterialCommunityIcons,
    SimpleLineIcons,
} from "@expo/vector-icons";
import QuestIcon from "./GameIcon";
import Text from "../../../components/common/Text";
import { colorSwatch } from "src/utils/colorConstants";

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
            <Text variant="title" style={styles.title}>
                {title}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    iconContainer: {
        marginRight: 12,
    },
    title: {
        color: colorSwatch.accent.purple,
    },
});

export default HeaderWithIcon;
