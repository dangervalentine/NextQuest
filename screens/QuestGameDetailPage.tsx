import React, { useEffect, useRef, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Animated,
    ActivityIndicator,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { DetailsScreenRouteProp } from "../utils/navigationTypes";
import IGDBService from "../services/IGDBService";
import { QuestGame } from "../interfaces/QuestGame";
import { getGameStatus } from "../utils/dataMappers";
import ImageCarousel from "../components/ImageCarousel";
import { Image } from "expo-image";
import { colorSwatch } from "../utils/colorConstants";

const GameDetailPage: React.FC = () => {
    const route = useRoute<DetailsScreenRouteProp>();
    const { id } = route.params;
    const [game, setGameDetails] = useState<QuestGame | null>(null);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const loadGameDetails = async () => {
            const game: QuestGame | null = await IGDBService.fetchGameDetails(
                id
            );
            setGameDetails(game);

            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }).start();
        };
        loadGameDetails();
    }, [id]);

    if (!game) {
        return (
            <View style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator
                        size="large"
                        color={colorSwatch.accent.green}
                    />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Animated.ScrollView style={[{ opacity: fadeAnim }]}>
                <Image
                    source={{ uri: `https:${game.cover}` }}
                    style={styles.coverImage}
                    contentFit="cover"
                    transition={200}
                />

                <View style={styles.rowContainer}>
                    <Text style={styles.categoryTitle}>Genres:</Text>
                    <Text style={styles.categoryDetails}>
                        {game.genres.map((genre) => genre.name).join(", ")}
                    </Text>
                </View>
                <View style={styles.rowContainer}>
                    <Text style={styles.categoryTitle}>Platforms:</Text>
                    <Text style={styles.categoryDetails}>
                        {game.platforms
                            ?.map((p) => {
                                const releaseDate = game.release_dates.find(
                                    (rd) => rd.platform === p.id
                                );
                                return {
                                    name: p.name,
                                    date: releaseDate?.date || Infinity,
                                    human: releaseDate?.human || "",
                                };
                            })
                            .sort((a, b) => a.date - b.date)
                            .map(
                                (p) =>
                                    `${p.name}${p.human ? ` (${p.human})` : ""}`
                            )
                            .join(",\n ") ?? "N/A"}
                    </Text>
                </View>
                <View style={styles.rowContainer}>
                    <Text style={styles.categoryTitle}>Age Rating:</Text>
                    <Text style={styles.categoryDetails}>
                        {game.age_rating}
                    </Text>
                </View>

                {game.gameStatus && (
                    <View style={styles.rowContainer}>
                        <Text style={styles.categoryTitle}>Status:</Text>
                        <Text style={styles.categoryDetails}>
                            {getGameStatus(game.gameStatus)}
                        </Text>
                    </View>
                )}

                {game.personalRating && (
                    <View style={styles.rowContainer}>
                        <Text style={styles.categoryTitle}>
                            Personal Rating:
                        </Text>
                        <Text style={styles.categoryDetails}>
                            {game.personalRating ?? "N/A"}
                        </Text>
                    </View>
                )}

                {game.gameStatus === "completed" && (
                    <View style={styles.rowContainer}>
                        <Text style={styles.categoryTitle}>
                            Completion Date:
                        </Text>
                        <Text style={styles.categoryDetails}>
                            {game.completionDate ?? "N/A"}
                        </Text>
                    </View>
                )}

                {game.dateAdded && (
                    <View style={styles.rowContainer}>
                        <Text style={styles.categoryTitle}>Date Added:</Text>
                        <Text style={styles.categoryDetails}>
                            {game.dateAdded}
                        </Text>
                    </View>
                )}

                {game.gameStatus === "completed" &&
                    game.rating !== undefined && (
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

                <Text style={styles.sectionTitle}>Companies:</Text>
                {game.involved_companies?.map((company, index) => (
                    <Text key={index} style={styles.info}>
                        {company.role}: {company.name}
                    </Text>
                ))}

                <Text style={styles.sectionTitle}>Storyline:</Text>
                <Text style={styles.text}>{game.storyline}</Text>

                <Text style={styles.sectionTitle}>Screenshots:</Text>
                <View style={{ marginBottom: 10 }}>
                    <ImageCarousel images={game.screenshots ?? []} />
                </View>
                {/* <Text style={styles.sectionTitle}>Videos:</Text>
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
                    {`Video ${index + 1}`}
                    </Text>
                    ))} */}
                <Text style={styles.sectionTitle}>Summary:</Text>
                <Text style={styles.text}>{game.summary}</Text>

                <View style={styles.bottomClearance}></View>
            </Animated.ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colorSwatch.background.dark,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        color: colorSwatch.accent.green,
        marginTop: 12,
        fontSize: 16,
    },
    coverImage: {
        width: "100%",
        aspectRatio: 1 / 1.5,
        resizeMode: "cover",
        borderRadius: 10,
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
    video: {
        fontSize: 16,
        color: colorSwatch.text.primary,
        flexDirection: "row",
    },
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
    bottomClearance: {
        height: 60,
        width: "80%",
        borderBottomColor: colorSwatch.primary.dark,
        borderBottomWidth: 1,
        alignSelf: "center",
        marginBottom: 20,
    },
});

export default GameDetailPage;
