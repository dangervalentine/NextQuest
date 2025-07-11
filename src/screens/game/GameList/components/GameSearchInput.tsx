import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View, TextInput, TouchableOpacity, Keyboard, Dimensions, Platform } from "react-native";
import { GameStatus } from "src/constants/config/gameStatus";
import { colorSwatch } from "src/constants/theme/colorConstants";
import QuestIcon from "../../shared/GameIcon";
import { getStatusColor } from "src/utils/colorsUtils";
import { theme } from "src/constants/theme/styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
    placeholder = `Search...`,
}) => {
    const [inputValue, setInputValue] = useState(searchQuery);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [isFocused, setIsFocused] = useState(false);
    const [showFloating, setShowFloating] = useState(false);
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
    const floatingTimeout = useRef<NodeJS.Timeout | null>(null);
    const insets = useSafeAreaInsets();

    // Keyboard listeners
    useEffect(() => {
        const showSub = Keyboard.addListener(
            Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
            (e) => {
                setKeyboardHeight(e.endCoordinates.height);
            }
        );
        const hideSub = Keyboard.addListener(
            Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
            () => {
                setKeyboardHeight(0);
            }
        );

        return () => {
            showSub.remove();
            hideSub.remove();
            if (floatingTimeout.current) {
                clearTimeout(floatingTimeout.current);
            }
        };
    }, []);

    // Control floating input visibility with slight delay to prevent flickering
    useEffect(() => {
        const shouldShow = isFocused && keyboardHeight > 0;

        if (floatingTimeout.current) {
            clearTimeout(floatingTimeout.current);
        }

        if (shouldShow) {
            // Show immediately when conditions are met
            setShowFloating(true);
        } else {
            // Hide with small delay to prevent flickering
            floatingTimeout.current = setTimeout(() => {
                setShowFloating(false);
            }, 50);
        }
    }, [isFocused, keyboardHeight]);

    // Debounce onSearchChange
    useEffect(() => {
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }
        debounceTimeout.current = setTimeout(() => {
            onSearchChange(inputValue);
        }, 300);
        return () => {
            if (debounceTimeout.current) {
                clearTimeout(debounceTimeout.current);
            }
        };
    }, [inputValue, onSearchChange]);

    useEffect(() => {
        setInputValue(searchQuery);
    }, [searchQuery]);

    const handleSearch = () => {
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }
        onSearchChange(inputValue);
    };

    const handleInputChange = (text: string) => {
        setInputValue(text);
    };

    const handleClear = () => {
        setInputValue("");
        onClear();
    };

    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleBlur = () => {
        setIsFocused(false);
    };

    const statusColor = getStatusColor(gameStatus);

    // Calculate the bottom position for the floating input
    // Dynamic tab bar height calculation based on safe area
    const dynamicTabBarHeight = Platform.OS === 'ios'
        ? (insets.bottom > 0 ? 49 + insets.bottom : 49) // iPhone with/without home indicator
        : 56; // Android standard tab bar height

    const floatingInputBottom = keyboardHeight - dynamicTabBarHeight;

    // Render the floating input when focused and keyboard is open
    const renderFloatingInput = () => {
        if (!showFloating) return null;

        return (
            <View
                style={[
                    styles.floatingInputContainer,
                    {
                        bottom: floatingInputBottom,
                        left: 1,
                        right: 1,
                    },
                ]}
            >
                <View style={[styles.searchInputContainer, styles.floatingSearchContainer]}>
                    <TextInput
                        style={[styles.searchInput, { color: statusColor }]}
                        placeholder={placeholder}
                        placeholderTextColor={statusColor}
                        value={inputValue}
                        onChangeText={handleInputChange}
                        onSubmitEditing={handleSearch}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        returnKeyType="search"
                        autoFocus={true}
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
                        <QuestIcon name="magnify" size={32} color={statusColor} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <>
            <View
                style={[
                    styles.searchContainer,
                    { borderBottomColor: colorSwatch.neutral.darkGray },
                    // Hide the normal input when floating input is active
                    showFloating && styles.hiddenTopBar,
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
                        onFocus={handleFocus}
                        onBlur={handleBlur}
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
                        <QuestIcon name="magnify" size={32} color={statusColor} />
                    </TouchableOpacity>
                </View>
                {/* Hamburger Menu */}
                {onMenuPress && gameStatus !== "undiscovered" && (
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={onMenuPress}
                    >
                        <QuestIcon name="sort" size={32} color={statusColor} />
                    </TouchableOpacity>
                )}
            </View>
            {/* Floating input above keyboard */}
            {renderFloatingInput()}
        </>
    );
};

const styles = StyleSheet.create({
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colorSwatch.background.darkest,
        borderWidth: 0,
        borderTopWidth: 1,
        borderTopColor: colorSwatch.neutral.darkGray,
        elevation: 4,
        paddingVertical: 8,
        paddingHorizontal: 8,
        marginTop: 4,
        gap: 8,
    },
    hiddenTopBar: {
        opacity: 0.3, // Make the original input semi-transparent when floating
    },
    floatingInputContainer: {
        position: "absolute",
        zIndex: 1000,
        elevation: 1000,
        backgroundColor: colorSwatch.background.dark,
        paddingHorizontal: 8,
        paddingVertical: 8,
        shadowColor: colorSwatch.neutral.darkGray,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        borderWidth: 1,
        borderRightWidth: 0,
        borderLeftWidth: 0,
        borderColor: colorSwatch.neutral.darkGray,
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
    floatingSearchContainer: {
        // borderWidth: 0, // Remove border since container has it
    },
    searchInput: {
        flex: 1,
        paddingHorizontal: 24,
        paddingVertical: 2,
        fontSize: 20,
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
