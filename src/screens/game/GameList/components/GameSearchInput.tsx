import React from "react";
import { StyleSheet, View, TextInput, TouchableOpacity } from "react-native";
import { GameStatus } from "src/constants/config/gameStatus";
import { colorSwatch } from "src/utils/colorConstants";
import QuestIcon from "../../shared/GameIcon";
import { getStatusStyles } from "src/utils/gameStatusUtils";

interface GameSearchInputProps {
    gameStatus: GameStatus;
    searchQuery: string;
    onSearchChange: (text: string) => void;
    placeholder?: string;
}

const GameSearchInput: React.FC<GameSearchInputProps> = ({
    gameStatus,
    searchQuery,
    onSearchChange,
    placeholder = "Search games...",
}) => {
    return (
        <View style={styles.searchContainer}>
            <View
                style={[
                    styles.searchInputContainer,
                    getStatusStyles(gameStatus),
                ]}
            >
                <TextInput
                    style={styles.searchInput}
                    placeholder={placeholder}
                    placeholderTextColor={getStatusStyles(gameStatus).color}
                    value={searchQuery}
                    onChangeText={onSearchChange}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity
                        style={styles.clearButton}
                        onPress={() => onSearchChange("")}
                    >
                        <QuestIcon
                            name="close-circle"
                            size={24}
                            color={getStatusStyles(gameStatus).color}
                        />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    searchContainer: {
        width: "100%",
        backgroundColor: colorSwatch.background.darker,
        borderBottomWidth: 1,
        borderBottomColor: colorSwatch.neutral.darkGray,
        zIndex: 1,
    },
    searchInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colorSwatch.background.dark,
    },
    searchInput: {
        flex: 1,
        paddingHorizontal: 12,
        color: colorSwatch.text.primary,
        fontSize: 16,
    },
    clearButton: {
        padding: 8,
        paddingHorizontal: 12,
        borderWidth: 0,
        borderRadius: 0,
    },
});

export default React.memo(GameSearchInput);
