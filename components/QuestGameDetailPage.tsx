import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    Linking,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { DetailsScreenRouteProp } from "../helpers/navigationTypes";
import colorSwatch from "../helpers/colors";
import IGDBService from "../services/IGDBService";
import { GameDetails } from "../interfaces/GameDetails";
import { QuestGame } from "../interfaces/QuestGame";
import { getStatus } from "../helpers/dataMappers";

const GameDetailPage: React.FC = () => {
    const route = useRoute<DetailsScreenRouteProp>();
    const { id, name } = route.params;
    const [game, setGameDetails] = useState<QuestGame | null>(null);

    useEffect(() => {
        const loadGameDetails = async () => {
            const game: GameDetails | null = await IGDBService.fetchGameDetails(
                id
            );
            setGameDetails(game);
        };
        loadGameDetails();
    }, [id]);

    if (!game) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>{name}</Text>
                <Text style={styles.info}>Loading...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Image
                source={{ uri: `https:${game.cover_url}` }}
                style={styles.cover}
            />

            <View style={styles.rowContainer}>
                <Text style={styles.categoryTitle}>Genres:</Text>
                <Text style={styles.categoryDetails}>
                    {game.genres.join(", ")}
                </Text>
            </View>
            <View style={styles.rowContainer}>
                <Text style={styles.categoryTitle}>Release Date:</Text>
                <Text style={styles.categoryDetails}>{game.release_date}</Text>
            </View>
            <View style={styles.rowContainer}>
                <Text style={styles.categoryTitle}>Age Rating:</Text>
                <Text style={styles.categoryDetails}>{game.age_rating}</Text>
            </View>
            <View style={styles.rowContainer}>
                <Text style={styles.categoryTitle}>Platforms:</Text>
                <Text style={styles.categoryDetails}>
                    {game.platforms.join(", ")}
                </Text>
            </View>

            {game.gameStatus && (
                <View style={styles.rowContainer}>
                    <Text style={styles.categoryTitle}>Status:</Text>
                    <Text style={styles.categoryDetails}>
                        {getStatus(game.gameStatus)}
                    </Text>
                </View>
            )}

            {game.personalRating && (
                <View style={styles.rowContainer}>
                    <Text style={styles.categoryTitle}>Personal Rating:</Text>
                    <Text style={styles.categoryDetails}>
                        {game.personalRating ?? "N/A"}
                    </Text>
                </View>
            )}

            {game.gameStatus === "completed" && (
                <View style={styles.rowContainer}>
                    <Text style={styles.categoryTitle}>Completion Date:</Text>
                    <Text style={styles.categoryDetails}>
                        {game.completionDate ?? "N/A"}
                    </Text>
                </View>
            )}

            {game.dateAdded && (
                <View style={styles.rowContainer}>
                    <Text style={styles.categoryTitle}>Date Added:</Text>
                    <Text style={styles.categoryDetails}>{game.dateAdded}</Text>
                </View>
            )}

            {game.gameStatus === "completed" && game.rating !== undefined && (
                <View style={styles.personalNotes}>
                    <Text style={styles.title}>Personal Notes:</Text>
                    <Text style={styles.rating}>
                        {" "}
                        {"⭐".repeat(game.personalRating ?? 0)}
                        {"☆".repeat(10 - (game.personalRating ?? 0))} (
                        {game.personalRating ?? 0}/10)
                    </Text>
                    <Text style={styles.quote}>
                        {game.notes ?? "No notes available"}
                    </Text>
                </View>
            )}

            <Text style={styles.sectionTitle}>Summary</Text>
            <Text style={styles.text}>{game.summary}</Text>
            <Text style={styles.sectionTitle}>Storyline</Text>
            <Text style={styles.text}>{game.storyline}</Text>
            <Text style={styles.sectionTitle}>Companies</Text>
            {game.involved_companies.map((company, index) => (
                <Text key={index} style={styles.info}>
                    {company.role}: {company.name}
                </Text>
            ))}

            {/* <Text style={styles.sectionTitle}>Screenshots</Text>
            {game.screenshots.map((screenshot, index) => (
                <Image
                    key={index}
                    source={{ uri: `https:${screenshot}` }}
                    style={styles.screenshot}
                />
            ))} */}
            <Text style={styles.sectionTitle}>Videos</Text>
            {game.videos.map((video, index) => (
                <Text
                    key={index}
                    style={styles.video}
                    onPress={async () => {
                        const supported = await Linking.canOpenURL(video.url);
                        if (supported) {
                            Linking.openURL(video.url);
                        } else {
                            console.error(`Cannot open URL: ${video.url}`);
                        }
                    }}
                >
                    {video.url}
                </Text>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: colorSwatch.background.dark,
        flex: 1,
    },
    cover: {
        width: "100%",
        aspectRatio: 1 / 1.5,
        resizeMode: "cover",
        borderRadius: 5,
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 10,
        color: colorSwatch.accent.green,
    },
    categoryTitle: { color: colorSwatch.accent.green, marginRight: 5 },
    categoryDetails: {
        color: colorSwatch.text.primary,
        flexWrap: "wrap",
        flex: 1,
    },
    rowContainer: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 10,
    },
    info: { fontSize: 16, marginBottom: 5, color: colorSwatch.text.primary },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginTop: 15,
        marginBottom: 5,
        color: colorSwatch.primary.main,
    },
    text: { fontSize: 16, marginBottom: 10, color: colorSwatch.text.primary },
    quote: {
        fontStyle: "italic",
        color: colorSwatch.secondary.main,
        marginBottom: 10,
    },
    screenshot: {
        width: "100%",
        height: 200,
        resizeMode: "cover",
        marginBottom: 10,
    },
    video: { fontSize: 16, color: colorSwatch.text.primary, marginBottom: 10 },
    rating: {
        fontSize: 10,
        marginBottom: 5,
        color: colorSwatch.accent.purple,
    },
    personalNotes: {
        marginVertical: 10,
        borderColor: colorSwatch.primary.dark,
        borderWidth: 1,
        padding: 8,
        borderRadius: 5,
    },
});

export default GameDetailPage;
