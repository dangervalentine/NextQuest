import React, { useState, useCallback } from "react";
import { ImageBackground, StyleSheet, View } from "react-native";
import GameItem from "./GameItem";
import { QuestGame } from "../interfaces/QuestGame";
import DragList, { DragListRenderItemInfo } from "react-native-draglist";
import colorSwatch from "../utils/colors";

interface GameSectionProps {
    QuestGames: QuestGame[];
}

const GameSection: React.FC<GameSectionProps> = ({ QuestGames }) => {
    const [data, setData] = useState(QuestGames);

    const renderItem = useCallback(
        ({
            item,
            onDragStart,
            isActive,
        }: DragListRenderItemInfo<QuestGame>) => (
            <View style={isActive ? styles.activeItem : null}>
                <GameItem questGame={item} reorder={onDragStart} />
            </View>
        ),
        []
    );

    const onReordered = useCallback(
        (fromIndex: number, toIndex: number) => {
            const updatedData = [...data];
            const [removed] = updatedData.splice(fromIndex, 1);
            updatedData.splice(toIndex, 0, removed);

            updatedData.forEach((item, index) => {
                if (item.priority !== index + 1) {
                    item.priority = index + 1;
                }
            });

            setData(updatedData);
        },
        [data]
    );

    return (
        <ImageBackground
            source={require("../assets/quest-logger.webp")}
            style={styles.pageContainer}
            resizeMode="contain"
        >
            <View style={styles.overlay} />
            <DragList
                data={data}
                onReordered={onReordered}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
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
        ...StyleSheet.absoluteFillObject, // Makes the overlay fill the entire ImageBackground
        backgroundColor: colorSwatch.background.dark,
        opacity: 0.99,
    },
    activeItem: {
        opacity: 0.3,
    },
});

export default React.memo(GameSection);
