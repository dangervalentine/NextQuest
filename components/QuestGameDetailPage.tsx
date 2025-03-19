import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, ScrollView } from "react-native";
import { useRoute } from "@react-navigation/native";
import { DetailsScreenRouteProp } from "../helpers/navigationTypes";
import colorSwatch from "../helpers/colors";
import IGDBService from "../services/IGDBService";
import { GameDetails } from "../interfaces/GameDetails";

const QuestGameDetailPage: React.FC = () => {
    const route = useRoute<DetailsScreenRouteProp>();
    const { id, name } = route.params;
    const [gameDetails, setGameDetails] = useState<GameDetails | null>(null);

    useEffect(() => {
        const loadGameDetails = async () => {
            const game: GameDetails | null = await IGDBService.fetchGameDetails(
                id
            );

            setGameDetails(game);
        };
        loadGameDetails();
    }, [id]);

    if (!gameDetails) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>{name}</Text>
                <Text style={styles.detail}>Loading...</Text>
            </View>
        );
    }

    if (gameDetails) {
        return (
            <ScrollView style={styles.container}>
                <Text style={styles.title}>{gameDetails.name}</Text>

                <Text style={styles.label}>Summary: </Text>
                <Text style={styles.detail}>{gameDetails.summary}</Text>

                <Text style={styles.label}>Genres: </Text>
                <Text style={styles.detail}>
                    {gameDetails.genres.join(", ")}
                </Text>

                <Text style={styles.label}>Platforms: </Text>
                <Text style={styles.detail}>
                    {gameDetails.platforms.join(", ")}
                </Text>

                <Text style={styles.label}>Release Date: </Text>
                <Text style={styles.detail}>
                    {gameDetails.release_date || "N/A"}
                </Text>

                <Text style={styles.label}>Rating: </Text>
                <Text style={styles.detail}>
                    {Math.floor(gameDetails.rating) || "N/A"}
                </Text>

                <Text style={styles.label}>Aggregated Rating: </Text>
                <Text style={styles.detail}>
                    {gameDetails.aggregated_rating || "N/A"}
                </Text>

                <Text style={styles.label}>Storyline: </Text>
                <Text style={styles.detail}>
                    {gameDetails.storyline || "N/A"}
                </Text>

                {gameDetails.cover_url && (
                    <>
                        <Text style={styles.label}>Cover: </Text>
                        <Image
                            source={{ uri: `https:${gameDetails.cover_url}` }}
                            style={styles.coverImage}
                        />
                    </>
                )}

                <Text style={styles.label}>Age Ratings: </Text>
                <Text style={styles.detail}>
                    {gameDetails.age_rating || "N/A"}
                </Text>

                <Text style={styles.label}>Involved Companies: </Text>
                {gameDetails.involved_companies?.map((company: any) => (
                    <Text
                        key={company.name + Math.random()}
                        style={styles.detail}
                    >
                        {company.name} (
                        {company.developer ? "Developer" : "Publisher"})
                    </Text>
                ))}

                <Text style={styles.label}>Screenshots: </Text>
                {gameDetails.screenshots?.map((screenshot: any) => (
                    <Image
                        key={screenshot}
                        source={{ uri: `https:${screenshot}` }}
                        style={styles.screenshotImage}
                    />
                ))}

                {/* <Text style={styles.label}>Videos: </Text>
                {gameDetails.videos?.map((video: any) => (
                    <Text key={video} style={styles.detail}>
                        Video ID: {video}
                    </Text>
                ))} */}
            </ScrollView>
        );
    }
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: colorSwatch.background.dark,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: colorSwatch.text.primary,
        marginBottom: 8,
    },
    label: {
        fontSize: 16,
        fontWeight: "bold",
        color: colorSwatch.text.secondary,
        marginTop: 10,
    },
    detail: {
        fontSize: 16,
        color: colorSwatch.text.primary,
        marginBottom: 10,
    },
    coverImage: {
        width: 200,
        height: 300,
        marginTop: 10,
        marginBottom: 10,
    },
    screenshotImage: {
        width: "100%",
        height: 200,
        marginBottom: 10,
    },
});

export default QuestGameDetailPage;
