import React, { useEffect } from "react";
import { StyleSheet, View, TextInput, TouchableOpacity } from "react-native";
import { GameStatus } from "src/constants/config/gameStatus";
import { colorSwatch } from "src/constants/theme/colorConstants";
import QuestIcon from "../../shared/GameIcon";
import { getStatusLabel } from "src/utils/gameStatusUtils";
import { getStatusColor } from "src/utils/colorsUtils";
import { theme } from "src/constants/theme/styles";

interface GameSearchInputProps {
    gameStatus: GameStatus;
    searchQuery: string;
    onSearchChange: (text: string) => void;
    onClear: () => void;
    onMenuPress?: () => void;
    placeholder?: string;
}

const GameSearchInput: React.FC<GameSearchInputProps> = ({
    gameStatus,
    searchQuery,
    onSearchChange,
    onClear,
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
            {/* Hamburger Menu */}
            {onMenuPress && (
                <TouchableOpacity
                    style={styles.iconButton}
                    onPress={onMenuPress}
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
        borderWidth: 1,
        justifyContent: "center",
        backgroundColor: colorSwatch.background.darkest,
        borderTopColor: "transparent",
        elevation: 4,
        paddingBottom: 8,
        marginHorizontal: 4,
        marginBottom: 4,
        gap: 8,
    },
    searchInputContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colorSwatch.background.darkest,
        borderRadius: theme.borderRadius,
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
        borderWidth: 1,
        borderColor: colorSwatch.neutral.darkGray,
        padding: 8,
        borderRadius: theme.borderRadius,
    },
});

export default React.memo(GameSearchInput);
