import React, { useEffect } from "react";
import { StyleSheet, View, TextInput, TouchableOpacity } from "react-native";
import { GameStatus } from "src/constants/config/gameStatus";
import { colorSwatch } from "src/constants/theme/colorConstants";
import QuestIcon from "../../shared/GameIcon";
import { getStatusLabel } from "src/utils/gameStatusUtils";
import { getStatusColor } from "src/utils/colorsUtils";

interface GameSearchInputProps {
    gameStatus: GameStatus;
    searchQuery: string;
    onSearchChange: (text: string) => void;
    onClear: () => void;
    placeholder?: string;
}

const GameSearchInput: React.FC<GameSearchInputProps> = ({
    gameStatus,
    searchQuery,
    onSearchChange,
    onClear,
    placeholder = `Search ${getStatusLabel(gameStatus)} games...`,
}) => {
    const [inputValue, setInputValue] = React.useState(searchQuery);
    const isUndiscovered = gameStatus === "undiscovered";

    // Effect to update the search when input changes for non-undiscovered status
    useEffect(() => {
        if (!isUndiscovered) {
            onSearchChange(inputValue);
        }
    }, [inputValue, isUndiscovered, onSearchChange]);

    const handleSearch = () => {
        onSearchChange(inputValue);
    };

    const handleInputChange = (text: string) => {
        setInputValue(text);
    };

    const handleClear = () => {
        setInputValue("");
        onClear();
    };

    const statusColor = getStatusColor(gameStatus);

    return (
        <View style={[styles.searchContainer, { borderColor: statusColor }]}>
            <View style={styles.searchInputContainer}>
                <TextInput
                    style={[styles.searchInput, { color: statusColor }]}
                    placeholder={placeholder}
                    placeholderTextColor={statusColor}
                    value={inputValue}
                    onChangeText={handleInputChange}
                    onSubmitEditing={handleSearch}
                    returnKeyType="search"
                />
                {isUndiscovered && (
                    <TouchableOpacity
                        style={styles.searchButton}
                        onPress={handleSearch}
                    >
                        <QuestIcon
                            name="magnify"
                            size={24}
                            color={statusColor}
                        />
                    </TouchableOpacity>
                )}
                {inputValue.length > 0 && (
                    <TouchableOpacity
                        style={styles.clearButton}
                        onPress={handleClear}
                    >
                        <QuestIcon
                            name="close-circle"
                            size={24}
                            color={statusColor}
                        />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    searchContainer: {
        marginTop: 80,
        marginBottom: 4,
        borderBottomColor: colorSwatch.neutral.darkGray,
        zIndex: 1,
        marginHorizontal: 4,
        borderWidth: 1,
        borderRadius: 8,
        borderColor: colorSwatch.neutral.darkGray,
        justifyContent: "center",
        minHeight: 45,
    },
    searchInputContainer: {
        color: colorSwatch.text.primary,
        flexDirection: "row",
        alignItems: "center",
    },
    searchInput: {
        flex: 1,
        paddingHorizontal: 12,
        color: colorSwatch.text.primary,
        fontSize: 16,
    },
    searchButton: {
        padding: 8,
        paddingHorizontal: 12,
        borderWidth: 0,
        borderRadius: 0,
    },
    clearButton: {
        padding: 8,
        paddingHorizontal: 12,
        borderWidth: 0,
        borderRadius: 0,
    },
});

export default React.memo(GameSearchInput);
