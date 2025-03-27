import React from "react";
import { View, StyleSheet, Linking, TouchableOpacity } from "react-native";
import { colorSwatch } from "../../utils/colorConstants";
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import Text from "../../components/Text";
interface Website {
    id: number;
    category: number;
    url: string;
}

interface WebsitesSectionProps {
    websites: Website[];
}

const WebsitesSection: React.FC<WebsitesSectionProps> = ({ websites }) => {
    if (!websites?.length) return null;

    const getWebsiteInfo = (
        category: number
    ): { label: string; icon: JSX.Element } => {
        const iconSize = 16;
        const iconColor = colorSwatch.accent.cyan;

        const types = {
            1: {
                label: "Official",
                icon: (
                    <FontAwesome5
                        name="globe"
                        size={iconSize}
                        color={iconColor}
                    />
                ),
            },
            2: {
                label: "Wikia",
                icon: (
                    <FontAwesome5
                        name="wikipedia-w"
                        size={iconSize}
                        color={iconColor}
                    />
                ),
            },
            3: {
                label: "Wikipedia",
                icon: (
                    <FontAwesome5
                        name="wikipedia-w"
                        size={iconSize}
                        color={iconColor}
                    />
                ),
            },
            4: {
                label: "Facebook",
                icon: (
                    <FontAwesome5
                        name="facebook"
                        size={iconSize}
                        color={iconColor}
                    />
                ),
            },
            5: {
                label: "Twitter",
                icon: (
                    <FontAwesome5
                        name="twitter"
                        size={iconSize}
                        color={iconColor}
                    />
                ),
            },
            6: {
                label: "Twitch",
                icon: (
                    <FontAwesome5
                        name="twitch"
                        size={iconSize}
                        color={iconColor}
                    />
                ),
            },
            8: {
                label: "Instagram",
                icon: (
                    <FontAwesome5
                        name="instagram"
                        size={iconSize}
                        color={iconColor}
                    />
                ),
            },
            9: {
                label: "YouTube",
                icon: (
                    <FontAwesome5
                        name="youtube"
                        size={iconSize}
                        color={iconColor}
                    />
                ),
            },
            10: {
                label: "iPhone",
                icon: (
                    <FontAwesome5
                        name="app-store-ios"
                        size={iconSize}
                        color={iconColor}
                    />
                ),
            },
            11: {
                label: "iPad",
                icon: (
                    <FontAwesome5
                        name="tablet"
                        size={iconSize}
                        color={iconColor}
                    />
                ),
            },
            12: {
                label: "Android",
                icon: (
                    <FontAwesome5
                        name="android"
                        size={iconSize}
                        color={iconColor}
                    />
                ),
            },
            13: {
                label: "Steam",
                icon: (
                    <FontAwesome5
                        name="steam"
                        size={iconSize}
                        color={iconColor}
                    />
                ),
            },
            14: {
                label: "Reddit",
                icon: (
                    <FontAwesome5
                        name="reddit"
                        size={iconSize}
                        color={iconColor}
                    />
                ),
            },
            15: {
                label: "Itch.io",
                icon: (
                    <FontAwesome5
                        name="gamepad"
                        size={iconSize}
                        color={iconColor}
                    />
                ),
            },
            16: {
                label: "Epic",
                icon: (
                    <FontAwesome5
                        name="gamepad"
                        size={iconSize}
                        color={iconColor}
                    />
                ),
            },
            17: {
                label: "GOG",
                icon: (
                    <FontAwesome5
                        name="gamepad"
                        size={iconSize}
                        color={iconColor}
                    />
                ),
            },
            18: {
                label: "Discord",
                icon: (
                    <FontAwesome5
                        name="discord"
                        size={iconSize}
                        color={iconColor}
                    />
                ),
            },
            19: {
                label: "Bluesky",
                icon: (
                    <MaterialCommunityIcons
                        name="bird"
                        size={iconSize}
                        color={iconColor}
                    />
                ),
            },
        };
        return (
            types[category as keyof typeof types] || {
                label: "Other",
                icon: (
                    <FontAwesome5
                        name="link"
                        size={iconSize}
                        color={iconColor}
                    />
                ),
            }
        );
    };

    const handleWebsitePress = (url: string) => {
        Linking.openURL(url).catch((err) =>
            console.error("Error opening URL:", err)
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Websites</Text>
            <View style={styles.websitesContainer}>
                {websites.map((website, index) => {
                    const websiteInfo = getWebsiteInfo(website.category);
                    return (
                        <TouchableOpacity
                            key={index}
                            style={styles.websiteButton}
                            onPress={() => handleWebsitePress(website.url)}
                        >
                            {websiteInfo.icon}
                            <Text style={styles.websiteType}>
                                {websiteInfo.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colorSwatch.background.darker,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: colorSwatch.neutral.darkGray,
        marginTop: 16,
    },
    title: {
        fontSize: 16,
        fontWeight: "600",
        color: colorSwatch.accent.purple,
        marginBottom: 12,
    },
    websitesContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    websiteButton: {
        backgroundColor: colorSwatch.background.darkest,
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        borderWidth: 1,
        borderColor: colorSwatch.neutral.darkGray,
    },
    websiteType: {
        color: colorSwatch.neutral.lightGray,
    },
});
export default WebsitesSection;
