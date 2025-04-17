import React from "react";
import { StyleSheet, View, TextInput, TouchableOpacity } from "react-native";
import { GameStatus } from "src/constants/config/gameStatus";
import { colorSwatch } from "src/utils/colorConstants";
import QuestIcon from "../../shared/GameIcon";
import { getStatusLabel, getStatusStyles } from "src/utils/gameStatusUtils";

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

    const handleSearch = () => {
        onSearchChange(inputValue);
    };

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
                    value={inputValue}
                    onChangeText={setInputValue}
                    onSubmitEditing={handleSearch}
                    returnKeyType="search"
                />
                <TouchableOpacity
                    style={styles.searchButton}
                    onPress={handleSearch}
                >
                    <QuestIcon
                        name="magnify"
                        size={24}
                        color={getStatusStyles(gameStatus).color}
                    />
                </TouchableOpacity>
                {inputValue.length > 0 && (
                    <TouchableOpacity
                        style={styles.clearButton}
                        onPress={() => {
                            setInputValue("");
                            onClear();
                        }}
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
        marginTop: 80,
        marginBottom: 4,
        borderBottomColor: colorSwatch.neutral.darkGray,
        zIndex: 1,
        marginHorizontal: 4,
        borderWidth: 1,
        borderRadius: 8,
        borderColor: colorSwatch.neutral.darkGray,
    },
    searchInputContainer: {
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
