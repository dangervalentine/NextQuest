import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../helpers/navigationTypes";
import colorSwatch from "../Colors"; // Import color swatch
import { questGames } from "../data/seedData";

// Define the type for a quest game (based on your properties)
type QuestGame = {
    name: string;
    gameStatus: string; // or an enum like GameStatus if you have one
    personalRating?: number;
    completionDate?: string;
    notes?: string;
    dateAdded: string;
    platform: string;
    priority?: number;
};

type QuestGameDetailPageProps = {
    route: RouteProp<RootStackParamList, "QuestGameDetailPage">;
};

const QuestGameDetailPage = ({ route }: QuestGameDetailPageProps) => {
    // Get the name parameter from route.params
    const { name } = route.params;

    // Find the quest game that matches the name parameter
    const questGame = questGames.find((game) => game.name === name);

    if (!questGame) {
        // If no matching game is found, render a message
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Game not found</Text>
            </View>
        );
    }

    // Render the quest game details
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
