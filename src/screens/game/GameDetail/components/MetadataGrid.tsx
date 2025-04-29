import React from "react";
import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "src/navigation/navigationTypes";
import { QuestGame } from "src/data/models/QuestGame";
import Text from "src/components/common/Text";
import { StyleSheet } from "react-native";
import { colorSwatch } from "src/constants/theme/colorConstants";
import { getStatusColor } from "src/utils/colorsUtils";
import { theme } from "src/constants/theme/styles";

interface MetadataGridProps {
    game: QuestGame;
}

const FranchiseSection: React.FC<MetadataGridProps> = ({ game }) => {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

    const handleFranchisePress = (franchiseId: number) => {
        navigation.navigate("GameTabs", {
            screen: "Search",
            params: { franchiseId },
        });
    };

    return (
        <View style={styles.metadataGrid}>
            <Text variant="subtitle" style={styles.metadataLabel}>
                {game.franchises.length > 1 ? "Franchises" : "Franchise"}:
            </Text>
            <View style={styles.franchiseLinks}>
                {game.franchises.map((franchise) => (
                    <Text
                        key={franchise.id}
                        variant="body"
                        style={[
                            styles.franchiseLink,
                            { color: getStatusColor(game.gameStatus) },
                        ]}
                        onPress={() => handleFranchisePress(franchise.id)}
                    >
                        {franchise.name}
                        {franchise.id !==
                        game.franchises[game.franchises.length - 1].id
                            ? ", "
                            : ""}
                    </Text>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    metadataGrid: {
        borderRadius: theme.borderRadius,
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
        justifyContent: "space-between",
    },
    metadataLabel: {
        color: colorSwatch.text.secondary,
    },
    franchiseLinks: {
        flex: 1,
        flexDirection: "row",
        flexWrap: "wrap",
    },
    franchiseLink: {
        color: colorSwatch.accent.cyan,
        textDecorationLine: "underline",
    },
});

export default FranchiseSection;
