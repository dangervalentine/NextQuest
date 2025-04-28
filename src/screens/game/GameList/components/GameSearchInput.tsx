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
    onSortPress?: () => void;
    onFilterPress?: () => void;
    onMenuPress?: () => void;
    placeholder?: string;
}

const GameSearchInput: React.FC<GameSearchInputProps> = ({
    gameStatus,
    searchQuery,
    onSearchChange,
    onClear,
    onSortPress,
    onFilterPress,
    onMenuPress,
    placeholder = `Search ${getStatusLabel(gameStatus)} games...`,
}) => {
    const [inputValue, setInputValue] = React.useState(searchQuery);
    const isUndiscovered = gameStatus === "undiscovered";

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
        <View
            style={[
                styles.topBar,
                { borderBottomColor: colorSwatch.neutral.darkGray },
            ]}
        >
            {/* Hamburger Menu */}
            {onMenuPress && (
                <TouchableOpacity
                    style={styles.iconButton}
                    onPress={onMenuPress}
                >
                    <QuestIcon name="menu" size={24} color={statusColor} />
                </TouchableOpacity>
            )}

            {/* Search Bar */}
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
                <TouchableOpacity
                    style={styles.searchButton}
                    onPress={handleSearch}
                >
                    <QuestIcon name="magnify" size={24} color={statusColor} />
                </TouchableOpacity>
            </View>

            {/* Sort Button */}
            {onSortPress && (
                <TouchableOpacity
                    style={styles.iconButton}
                    onPress={onSortPress}
                >
                    <QuestIcon name="sort" size={24} color={statusColor} />
                </TouchableOpacity>
            )}

            {/* Filter Button */}
            {onFilterPress && (
                <TouchableOpacity
                    style={styles.iconButton}
                    onPress={onFilterPress}
                >
                    <QuestIcon name="tune" size={24} color={statusColor} />
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    topBar: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 8,
        borderWidth: 1,
        justifyContent: "center",
        backgroundColor: colorSwatch.background.darkest,
        borderTopColor: "transparent",
        elevation: 4,
        paddingBottom: 8,
        marginBottom: 4,
    },
    searchInputContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colorSwatch.background.darkest,
        borderRadius: 8,
        marginHorizontal: 8,
        borderWidth: 1,
        borderColor: colorSwatch.neutral.darkGray,
    },
    searchInput: {
        flex: 1,
        paddingHorizontal: 8,
        fontSize: 16,
        color: colorSwatch.text.primary,
    },
    searchButton: {
        padding: 8,
    },
    clearButton: {
        padding: 8,
    },
    iconButton: {
        padding: 8,
    },
});

export default React.memo(GameSearchInput);
