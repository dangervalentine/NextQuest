import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, ScrollView } from "react-native";
import { useRoute } from "@react-navigation/native";
import { DetailsScreenRouteProp } from "../helpers/navigationTypes";
import colorSwatch from "../helpers/colors";
import IGDBService from "../services/IGDBService";

const QuestGameDetailPage: React.FC = () => {
    const route = useRoute<DetailsScreenRouteProp>();
    const { name } = route.params;
    const [gameDetails, setGameDetails] = useState<any>(null);

    useEffect(() => {
        const loadGameDetails = async () => {
            const details = await IGDBService.fetchGameDetails(name);
            setGameDetails(details);
        };

        loadGameDetails();
    }, [name]);

    if (!gameDetails) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Loading...</Text>
            </View>
        );
    }

    const game = gameDetails[0];
    if (!game) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>
                    Error loading details for: {name}.
                </Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>{game.name}</Text>

            <Text style={styles.label}>Summary: </Text>
            <Text style={styles.detail}>{game.summary}</Text>

            <Text style={styles.label}>Genres: </Text>
            <Text style={styles.detail}>
                {game.genres.map((g: any) => g.name).join(", ")}
            </Text>

            <Text style={styles.label}>Platforms: </Text>
            <Text style={styles.detail}>
                {game.platforms.map((p: any) => p.name).join(", ")}
            </Text>

            <Text style={styles.label}>Release Date: </Text>
            <Text style={styles.detail}>
                {game.release_dates[0]?.human || "N/A"}
            </Text>

            <Text style={styles.label}>Rating: </Text>
            <Text style={styles.detail}>{game.rating || "N/A"}</Text>

            <Text style={styles.label}>Aggregated Rating: </Text>
            <Text style={styles.detail}>{game.aggregated_rating || "N/A"}</Text>

            <Text style={styles.label}>Storyline: </Text>
            <Text style={styles.detail}>{game.storyline || "N/A"}</Text>

            {game.cover?.url && (
                <>
                    <Text style={styles.label}>Cover: </Text>
                    <Image
                        source={{ uri: `https:${game.cover.url}` }}
                        style={styles.coverImage}
                    />
                </>
            )}

            <Text style={styles.label}>Age Ratings: </Text>
            {game.age_ratings?.map((rating: any) => (
                <Text key={rating.id} style={styles.detail}>
                    {rating.rating} ({rating.category})
                </Text>
            ))}

            <Text style={styles.label}>Involved Companies: </Text>
            {game.involved_companies?.map((company: any) => (
                <Text key={company.company.id} style={styles.detail}>
                    {company.company.name} (
                    {company.developer ? "Developer" : "Publisher"})
                </Text>
            ))}

            <Text style={styles.label}>Screenshots: </Text>
            {game.screenshots?.map((screenshot: any) => (
                <Image
                    key={screenshot.id}
                    source={{ uri: `https:${screenshot.url}` }}
                    style={styles.screenshotImage}
                />
            ))}

            <Text style={styles.label}>Videos: </Text>
            {game.videos?.map((video: any) => (
                <Text key={video.id} style={styles.detail}>
                    Video ID: {video.video_id}
                </Text>
            ))}
        </ScrollView>
    );
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
