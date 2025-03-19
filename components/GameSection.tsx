import React, { useState, useCallback } from "react";
import { StyleSheet, View } from "react-native";
import GameItem from "./GameItem";
import { QuestGameListItem } from "../interfaces/QuestGameListItem";
import colorSwatch from "../Colors";
import DragList, { DragListRenderItemInfo } from "react-native-draglist";

interface GameSectionProps {
    questGameListItems: QuestGameListItem[];
}

const GameSection: React.FC<GameSectionProps> = ({ questGameListItems }) => {
    const [data, setData] = useState(questGameListItems);

    const renderItem = useCallback(
        ({
            item,
            onDragStart,
            isActive,
        }: DragListRenderItemInfo<QuestGameListItem>) => (
            <View style={isActive ? styles.activeItem : null}>
                <GameItem questGameListItem={item} reorder={onDragStart} />
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
        <View style={styles.pageContainer}>
            <DragList
                data={data}
                onReordered={onReordered}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    pageContainer: {
        flex: 1,
        backgroundColor: colorSwatch.background.dark,
    },
    activeItem: {
        opacity: 0.3,
    },
});

export default React.memo(GameSection);
