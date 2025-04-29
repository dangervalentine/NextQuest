import React from "react";
import {
    View,
    Text,
    Modal,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
} from "react-native";
import { PlatformLogoBadge } from "./PlatformLogoBadge";
import { colorSwatch } from "src/constants/theme/colorConstants";
import { Ionicons } from "@expo/vector-icons";
import { triggerHapticFeedback } from "src/utils/systemUtils";
import { useGameStatus } from "src/contexts/GameStatusContext";
import { getStatusColor } from "src/utils/colorsUtils";
import { theme } from "src/constants/theme/styles";

interface Platform {
    id: number;
    name: string;
}

interface PlatformSelectionModalProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (platform: Platform) => void;
    platforms: Platform[];
}

export const PlatformSelectionModal: React.FC<PlatformSelectionModalProps> = ({
    visible,
    onClose,
    onSelect,
    platforms,
}) => {
    const handlePlatformSelect = (platform: Platform) => {
        triggerHapticFeedback("light");
        onSelect(platform);
    };
    const { activeStatus } = useGameStatus();
    const statusColor = getStatusColor(activeStatus);
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Select Platform</Text>
                        <TouchableOpacity
                            onPress={onClose}
                            style={styles.closeButton}
                        >
                            <Ionicons
                                name="close"
                                size={24}
                                color={colorSwatch.text.primary}
                            />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content}>
                        {platforms
                            ?.sort((a, b) => a.name.localeCompare(b.name))
                            .map((platform) => (
                                <View key={platform.id}>
                                    <TouchableOpacity
                                        style={[styles.platformItem]}
                                        onPress={() =>
                                            handlePlatformSelect(platform)
                                        }
                                    >
                                        <View style={styles.platformContent}>
                                            <PlatformLogoBadge
                                                platform={platform.name}
                                                size={72}
                                                tintColor={statusColor}
                                            />
                                            <Text style={styles.platformName}>
                                                - {platform.name}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                    <View style={styles.divider} />
                                </View>
                            ))}
                    </ScrollView>

                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={onClose}
                    >
                        <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const { width } = Dimensions.get("window");
const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
    },
    modalContainer: {
        width: width * 0.9,
        maxHeight: "80%",
        backgroundColor: colorSwatch.background.dark,
        borderRadius: theme.borderRadius,
        overflow: "hidden",
        flex: 1,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colorSwatch.text.muted,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        color: colorSwatch.text.primary,
    },
    closeButton: {
        padding: 4,
    },
    content: {
        flex: 1,
    },
    platformItem: {
        padding: 24,
    },
    platformContent: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 8,
    },
    selectedPlatform: {
        backgroundColor: `${colorSwatch.accent.cyan}33`, // 20% opacity
    },
    platformName: {
        marginLeft: 12,
        fontSize: 12,
        color: colorSwatch.text.primary,
    },
    cancelButton: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: colorSwatch.text.muted,
        alignItems: "center",
    },
    cancelText: {
        fontSize: 16,
        color: colorSwatch.accent.cyan,
        fontWeight: "bold",
    },
    divider: {
        height: 1,
        backgroundColor: colorSwatch.text.muted,
        marginHorizontal: 16,
    },
});
