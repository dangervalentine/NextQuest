import React from "react";
import {
    Animated,
    StyleSheet,
    View,
    TouchableOpacity,
    Dimensions,
    Modal,
    Platform,
    Easing,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colorSwatch } from "src/constants/theme/colorConstants";
import Text from "src/components/common/Text";
import { useGameStatus } from "src/contexts/GameStatusContext";
import { getStatusColor } from "src/utils/colorsUtils";
import QuestIcon from "../../shared/GameIcon";
import { SortField } from "src/types/sortTypes";
import { showToast } from "src/components/common/QuestToast";

const SCREEN_HEIGHT = Dimensions.get("window").height;
const SHEET_MAX_HEIGHT = Math.min(420, SCREEN_HEIGHT * 0.6);

interface GameSortFilterMenuProps {
    visible: boolean;
    onClose: () => void;
    sort: { field: SortField; direction: "asc" | "desc" };
    onSortChange: (sort: {
        field: SortField;
        direction: "asc" | "desc";
    }) => void;
    children?: React.ReactNode;
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
}) => {
    const [slideAnim] = React.useState(new Animated.Value(SHEET_MAX_HEIGHT));
    const { activeStatus } = useGameStatus();
    const statusColor = getStatusColor(activeStatus);

    React.useEffect(() => {
        if (visible) {
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: SHEET_MAX_HEIGHT,
                duration: 250,
                easing: Easing.in(Easing.cubic),
                useNativeDriver: true,
            }).start();
        }
    }, [visible]);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={onClose}
        >
            {/* Overlay */}
            <TouchableOpacity
                style={styles.overlay}
                activeOpacity={.3}
                onPress={onClose}
            />
            {/* Bottom Sheet */}
            <Animated.View
                style={[
                    styles.sheet,
                    {
                        transform: [
                            { translateY: slideAnim },
                        ],
                    },
                ]}
            >
                <SafeAreaView style={{ flex: 1 }}>
                    <View style={styles.header}>
                        <Text
                            variant="title"
                            style={[styles.headerText, { color: statusColor }]}
                        >
                            Sort
                        </Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <QuestIcon name="close" size={24} color={statusColor || colorSwatch.text.primary} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.content}>
                        {/* Sort By Section */}
                        <View style={styles.section}>
                            {SORT_OPTIONS.filter(
                                (option) =>
                                    option.value !== "priority" ||
                                    activeStatus !== "undiscovered"
                            ).map((option) => (
                                <View key={option.value}>
                                    <TouchableOpacity
                                        style={styles.optionRow}
                                        onPress={() => {
                                            if (option.value === "priority") {
                                                if (sort.field !== "priority") {
                                                    onSortChange({
                                                        field: "priority",
                                                        direction: "asc",
                                                    });
                                                } else {
                                                    showToast({
                                                        type: "error",
                                                        text1: "Priority is already selected",
                                                        text2: "Swipe to the right to change priority quickly",
                                                        position: "bottom",
                                                        color: statusColor || colorSwatch.accent.cyan,
                                                        visibilityTime: 4000,
                                                    });
                                                }
                                            } else {
                                                onSortChange({
                                                    field: option.value as SortField,
                                                    direction:
                                                        sort.field === option.value && sort.direction === "asc"
                                                            ? "desc"
                                                            : "asc",
                                                });
                                            }
                                        }}
                                    >
                                        <QuestIcon
                                            name={
                                                option.value === "priority"
                                                    ? "arrow-up"
                                                    : sort.field === option.value
                                                        ? sort.direction === "asc"
                                                            ? "arrow-up"
                                                            : "arrow-down"
                                                        : "arrow-up-down"
                                            }
                                            size={22}
                                            color={
                                                sort.field === option.value
                                                    ? statusColor
                                                    : colorSwatch.neutral.darkGray
                                            }
                                        />
                                        <Text style={[
                                            styles.optionLabel,
                                            sort.field === option.value && { color: statusColor }
                                        ]}>
                                            {option.label}
                                        </Text>
                                    </TouchableOpacity>
                                    <View style={styles.divider} />
                                </View>
                            ))}
                        </View>
                    </View>
                </SafeAreaView>
            </Animated.View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: colorSwatch.neutral.black,
        opacity: 0.2,
        zIndex: 1,
    },
    sheet: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: SHEET_MAX_HEIGHT,
        backgroundColor: colorSwatch.background.darkest,
        zIndex: 2,
        shadowColor: colorSwatch.neutral.black,
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: -2 },
        shadowRadius: 8,
        elevation: 8,
        paddingBottom: Platform.OS === "ios" ? 24 : 8,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colorSwatch.neutral.darkGray,
    },
    headerText: {
        color: colorSwatch.accent.cyan,
        fontSize: 20,
    },
    closeButton: {
        padding: 4,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    section: {
        marginBottom: 24,
    },
    optionRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 16,
        paddingHorizontal: 4,
        marginVertical: 2,
    },
    optionLabel: {
        marginLeft: 12,
        fontSize: 16,
        fontWeight: "bold",
        color: colorSwatch.text.primary,
        flex: 1,
    },
    divider: {
        borderBottomWidth: 1,
        borderBottomColor: colorSwatch.neutral.darkGray,
    },
});

export default GameSortFilterMenu;
