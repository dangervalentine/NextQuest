import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRoute } from "@react-navigation/native";
import { DetailsScreenRouteProp } from "../helpers/navigationTypes";
import colorSwatch from "../helpers/colors";
import { questGames } from "../data/seedData";
import TwitchAuthService from "../services/TwitchAuthService";

const QuestGameDetailPage: React.FC = () => {
    const route = useRoute<DetailsScreenRouteProp>();
    const [token, setToken] = useState<string | null>(null);
    const { name } = route.params;

    const questGame = questGames.find((game) => game.name === name);

    if (!questGame) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Game not found</Text>
            </View>
        );
    }

    useEffect(() => {
        const loadToken = async () => {
            const accessToken = await TwitchAuthService.getToken();
            setToken(accessToken);
        };

        loadToken();
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{questGame.name}</Text>

            <Text style={styles.label}>Status: </Text>
            <Text style={styles.detail}>{questGame.gameStatus}</Text>

            {questGame.personalRating && (
                <>
                    <Text style={styles.label}>Personal Rating: </Text>
                    <Text style={styles.detail}>
                        {questGame.personalRating}
                    </Text>
                </>
            )}

            {questGame.completionDate && (
                <>
                    <Text style={styles.label}>Completion Date: </Text>
                    <Text style={styles.detail}>
                        {questGame.completionDate}
                    </Text>
                </>
            )}

            {questGame.notes && (
                <>
                    <Text style={styles.label}>Notes: </Text>
                    <Text style={styles.detail}>{questGame.notes}</Text>
                </>
            )}

            <Text style={styles.label}>Date Added: </Text>
            <Text style={styles.detail}>{questGame.dateAdded}</Text>

            <Text style={styles.label}>Platform: </Text>
            <Text style={styles.detail}>{questGame.platform}</Text>

            {questGame.priority && (
                <>
                    <Text style={styles.label}>Priority: </Text>
                    <Text style={styles.detail}>{questGame.priority}</Text>
                </>
            )}
            <>
                <Text style={styles.label}>Access Token: </Text>
                <Text style={styles.detail}>{token}</Text>
            </>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: colorSwatch.background.dark, // Dark background
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: colorSwatch.text.primary, // Light blue text
        marginBottom: 8,
    },
    label: {
        fontSize: 16,
        fontWeight: "bold",
        color: colorSwatch.text.secondary, // Softer blue for labels
        marginTop: 10,
    },
    detail: {
        fontSize: 16,
        color: colorSwatch.text.primary, // Light blue for details
        marginBottom: 10,
    },
});

export default QuestGameDetailPage;
