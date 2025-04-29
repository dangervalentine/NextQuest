import React from "react";
import {
    Animated,
    StyleSheet,
    View,
    TouchableOpacity,
    Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colorSwatch } from "src/constants/theme/colorConstants";
import Text from "src/components/common/Text";
import { useGameStatus } from "src/contexts/GameStatusContext";
import { getStatusColor } from "src/utils/colorsUtils";
import QuestIcon from "../../shared/GameIcon";
import { SortField } from "src/types/sortTypes";
import { theme } from "src/constants/theme/styles";

const SCREEN_WIDTH = Dimensions.get("window").width;
const MENU_WIDTH = Math.min(320, SCREEN_WIDTH * 0.85);

interface GameSortFilterMenuProps {
    visible: boolean;
    onClose: () => void;
    sort: { field: SortField; direction: "asc" | "desc" };
    onSortChange: (sort: {
        field: SortField;
        direction: "asc" | "desc";
    }) => void;
    children?: React.ReactNode;
    // ...
}

const SORT_OPTIONS = [
    { label: "Priority", value: "priority" },
    { label: "Name", value: "name" },
    { label: "Date Added", value: "dateAdded" },
    { label: "Personal Rating", value: "rating" },
    { label: "Release Year", value: "releaseYear" },
];

const GameSortFilterMenu: React.FC<GameSortFilterMenuProps> = ({
    visible,
    onClose,
    sort,
    onSortChange,
    children,
}) => {
    const [slideAnim] = React.useState(new Animated.Value(SCREEN_WIDTH));
    const { activeStatus } = useGameStatus();
    const statusColor = getStatusColor(activeStatus);

    React.useEffect(() => {
        Animated.timing(slideAnim, {
            toValue: visible ? SCREEN_WIDTH - MENU_WIDTH : SCREEN_WIDTH,
            duration: 300,
            useNativeDriver: false,
        }).start();
    }, [visible]);

    return (
        <>
            {/* Overlay */}
            {visible && (
                <TouchableOpacity
                    style={styles.overlay}
                    activeOpacity={1}
                    onPress={onClose}
                />
            )}
            {/* Side Menu */}
            <Animated.View style={[styles.menu, { left: slideAnim }]}>
                <SafeAreaView style={{ flex: 1 }}>
                    <View style={styles.header}>
                        <Text
                            variant="title"
                            style={[styles.headerText, { color: statusColor }]}
                        >
                            Sort & Filter
                        </Text>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={styles.closeText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.content}>
                        {/* Sort By Section */}
                        <View style={styles.section}>
                            <Text style={styles.sectionHeader}>Sort By</Text>
                            {SORT_OPTIONS.filter(
                                (option) =>
                                    option.value !== "priority" ||
                                    activeStatus !== "undiscovered"
                            ).map((option) => (
                                <TouchableOpacity
                                    key={option.value}
                                    style={styles.optionRow}
                                    onPress={() =>
                                        onSortChange({
                                            field: option.value as SortField,
                                            direction: sort.direction,
                                        })
                                    }
                                >
                                    <QuestIcon
                                        name={
                                            sort.field === option.value
                                                ? "radiobox-marked"
                                                : "radiobox-blank"
                                        }
                                        size={22}
                                        color={
                                            sort.field === option.value
                                                ? statusColor
                                                : colorSwatch.neutral.darkGray
                                        }
                                    />
                                    <Text style={styles.optionLabel}>
                                        {option.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                            <View style={styles.sortDirectionRow}>
                                <TouchableOpacity
                                    onPress={() =>
                                        onSortChange({
                                            field: sort.field,
                                            direction: "asc",
                                        })
                                    }
                                    style={[
                                        styles.directionButton,
                                        sort.direction === "asc" && {
                                            backgroundColor:
                                                colorSwatch.neutral.darkGray,
                                        },
                                    ]}
                                >
                                    <QuestIcon
                                        name="arrow-up"
                                        size={20}
                                        color={
                                            sort.direction === "asc"
                                                ? statusColor
                                                : colorSwatch.text.secondary
                                        }
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() =>
                                        onSortChange({
                                            field: sort.field,
                                            direction: "desc",
                                        })
                                    }
                                    style={[
                                        styles.directionButton,
                                        sort.direction === "desc" && {
                                            backgroundColor:
                                                colorSwatch.neutral.darkGray,
                                        },
                                    ]}
                                >
                                    <QuestIcon
                                        name="arrow-down"
                                        size={20}
                                        color={
                                            sort.direction === "desc"
                                                ? statusColor
                                                : colorSwatch.text.secondary
                                        }
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                        {/* Divider */}
                        <View style={styles.divider} />
                        {/* Placeholder for filter options */}
                        <View style={styles.section}>
                            <Text style={styles.sectionHeader}>Filter</Text>
                            <Text style={styles.placeholder}>
                                Filter options go here.
                            </Text>
                        </View>
                    </View>
                </SafeAreaView>
            </Animated.View>
        </>
    );
};

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "#000A",
        zIndex: 10,
    },
    menu: {
        position: "absolute",
        top: 0,
        bottom: 0,
        width: MENU_WIDTH,
        backgroundColor: colorSwatch.background.darkest,
        zIndex: 20,
        borderTopLeftRadius: 16,
        borderBottomLeftRadius: 16,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowOffset: { width: -2, height: 0 },
        shadowRadius: 8,
        elevation: 8,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: colorSwatch.neutral.darkGray,
    },
    headerText: {
        color: colorSwatch.accent.cyan,
        fontSize: 20,
    },
    closeText: {
        color: colorSwatch.primary.dark,
        fontWeight: "bold",
        fontSize: 16,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    placeholder: {
        color: colorSwatch.text.secondary,
        fontSize: 16,
        textAlign: "center",
        marginTop: 40,
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        fontWeight: "bold",
        fontSize: 16,
        marginBottom: 12,
        color: colorSwatch.text.primary,
    },
    optionRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
        paddingHorizontal: 4,
    },
    optionLabel: {
        marginLeft: 12,
        fontSize: 15,
        color: colorSwatch.text.primary,
    },
    sortDirectionRow: {
        flexDirection: "row",
        marginTop: 12,
        gap: 12,
    },
    directionButton: {
        padding: 8,
        borderRadius: theme.borderRadius,
    },
    divider: {
        height: 1,
        backgroundColor: colorSwatch.neutral.darkGray,
        marginVertical: 12,
    },
});

export default GameSortFilterMenu;
