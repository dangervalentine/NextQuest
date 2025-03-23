import React, { useState, useCallback, useEffect } from "react";
import {
    ImageBackground,
    StyleSheet,
    View,
    ActivityIndicator,
    Text,
} from "react-native";
import GameItem from "./GameItem";
import DragList, { DragListRenderItemInfo } from "react-native-draglist";
import { getQuestGamesByStatus, updateGamePriorities } from "../../../data/db";
import { GameStatus } from "../../../constants/gameStatus";
import { colorSwatch } from "../../../utils/colorConstants";
import { QuestGame } from "../../../data/models/QuestGame";

interface GameSectionProps {
    gameStatus: GameStatus;
}

const GameSection: React.FC<GameSectionProps> = ({ gameStatus }) => {
    const [data, setData] = useState<QuestGame[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadGames();
    }, [gameStatus]);

    const loadGames = async () => {
        try {
            setIsLoading(true);
            const games = await getQuestGamesByStatus(gameStatus);
            const sortedGames = [...games].sort(
                (a, b) => (a.priority || Infinity) - (b.priority || Infinity)
            );
            setData(sortedGames);
        } catch (error) {
            console.error("Error loading games:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const renderItem = useCallback(
        ({
            item,
            onDragStart,
            isActive,
        }: DragListRenderItemInfo<QuestGame>) => {
            if (!item) return null;
            return (
                <View style={[isActive && styles.activeItem]}>
                    <GameItem questGame={item} reorder={onDragStart} />
                </View>
            );
        },
        []
    );

    const onReordered = useCallback(
        async (fromIndex: number, toIndex: number) => {
            if (!data.length) return;

            const updatedData = [...data];
            const [removed] = updatedData.splice(fromIndex, 1);
            updatedData.splice(toIndex, 0, removed);

            const priorityUpdates = updatedData.map((item, index) => ({
                id: item.id,
                priority: index + 1,
            }));

            try {
                await updateGamePriorities(priorityUpdates);
                const dataWithNewPriorities = updatedData.map(
                    (item, index) => ({
                        ...item,
                        priority: index + 1,
                    })
                );
                setData(dataWithNewPriorities);
            } catch (error) {
                console.error("Failed to update priorities:", error);
                await loadGames();
            }
        },
        [data]
    );

    if (isLoading) {
        return (
            <ImageBackground
                source={require("../../../assets/quest-logger.png")}
                style={styles.pageContainer}
                resizeMode="contain"
            >
                <View style={styles.overlay} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator
                        size="large"
                        color={colorSwatch.accent.green}
                    />
                </View>
            </ImageBackground>
        );
    }

    return data.length === 0 ? (
        <ImageBackground
            source={require("../../../assets/quest-logger.png")}
            style={styles.pageContainer}
            resizeMode="contain"
        >
            <View style={styles.overlay} />
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>
                    No games found in this category
                </Text>
            </View>
        </ImageBackground>
    ) : (
        <ImageBackground
            source={require("../../../assets/quest-logger.png")}
            style={styles.pageContainer}
            resizeMode="contain"
        >
            <View style={styles.overlay} />
            <DragList
                data={data}
                onReordered={onReordered}
                keyExtractor={(item) => {
                    if (!item || !item.id) {
                        console.warn("Invalid item in keyExtractor:", item);
                        return "";
                    }
                    return item.id.toString();
                }}
                renderItem={(props) => {
                    if (!props.item) {
                        console.warn("Invalid item in renderItem:", props);
                        return null;
                    }
                    return renderItem(props);
                }}
                ListEmptyComponent={() => (
                    <View style={styles.loadingContainer}>
                        <Text style={styles.loadingText}>
                            No games available
                        </Text>
                    </View>
                )}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                contentContainerStyle={styles.listContainer}
                removeClippedSubviews={true}
            />
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    pageContainer: {
        flex: 1,
        backgroundColor: colorSwatch.background.dark,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: colorSwatch.background.dark,
        opacity: 0.99,
    },
    activeItem: {
        opacity: 0.3,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        color: colorSwatch.accent.green,
        marginTop: 10,
        fontSize: 16,
    },
    separator: {
        height: 1,
        backgroundColor: colorSwatch.primary.dark,
    },
    listContainer: {
        padding: 10,
    },
});

export default React.memo(GameSection);
