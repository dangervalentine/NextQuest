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
import { colorSwatch } from "src/utils/colorConstants";
import { Ionicons } from "@expo/vector-icons";

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
                                <TouchableOpacity
                                    key={platform.id}
                                    style={[styles.platformItem]}
                                    onPress={() => onSelect(platform)}
                                >
                                    <View style={styles.platformContent}>
                                        <PlatformLogoBadge
                                            platform={platform.name}
                                            size={72}
                                        />
                                        <Text style={styles.platformName}>
                                            - {platform.name}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
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
        borderRadius: 12,
        overflow: "hidden",
        flex: 1,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colorSwatch.neutral.gray,
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
        borderBottomWidth: 1,
        borderBottomColor: colorSwatch.neutral.gray,
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
        fontSize: 16,
        color: colorSwatch.text.primary,
    },
    cancelButton: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: colorSwatch.neutral.gray,
        alignItems: "center",
    },
    cancelText: {
        fontSize: 16,
        color: colorSwatch.accent.cyan,
        fontWeight: "bold",
    },
});
