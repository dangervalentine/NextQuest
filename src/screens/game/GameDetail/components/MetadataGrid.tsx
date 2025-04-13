import React from "react";
import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "src/utils/navigationTypes";
import { QuestGame } from "src/data/models/QuestGame";
import Text from "src/components/common/Text";
import { MetacriticBadge } from "src/components/common/MetaCriticBadge";
import { StyleSheet } from "react-native";
import { colorSwatch } from "src/utils/colorConstants";

interface MetadataGridProps {
    game: QuestGame;
}

const MetadataGrid: React.FC<MetadataGridProps> = ({ game }) => {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

    const handleFranchisePress = (franchiseId: number) => {
        navigation.navigate("GameTabs", {
            screen: "Discover",
            params: { franchiseId },
        });
    };

    return (
        <View style={styles.metadataGrid}>
            {game.franchises && game.franchises.length > 0 && (
                <View>
                    <Text variant="subtitle" style={styles.metadataLabel}>
                        Franchises
                    </Text>
                    <View style={styles.franchiseLinks}>
                        {game.franchises.map((franchise) => (
                            <Text
                                key={franchise.id}
                                variant="body"
                                style={styles.franchiseLink}
                                onPress={() =>
                                    handleFranchisePress(franchise.id)
                                }
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
            )}
            {game.metacriticScore && (
                <MetacriticBadge score={game.metacriticScore} />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    metadataGrid: {
        borderRadius: 8,
        marginHorizontal: 16,
        marginTop: 16,
    },
    metadataLabel: {
        color: colorSwatch.text.secondary,
        marginBottom: 8,
    },
    franchiseLinks: {
        flexDirection: "row",
        flexWrap: "wrap",
    },
    franchiseLink: {
        color: colorSwatch.accent.cyan,
        textDecorationLine: "underline",
    },
});

export default MetadataGrid;
