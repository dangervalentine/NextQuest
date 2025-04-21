import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import {
    Dimensions,
    StyleProp,
    ViewStyle,
    ActivityIndicator,
} from "react-native";
import { View, StyleSheet, Image as RNImage } from "react-native";
import { colorSwatch } from "src/utils/colorConstants";

interface FullWidthImageProps {
    source?: string;
    style?: StyleProp<ViewStyle>;
    loaderColor?: string;
}

const FullWidthImage: React.FC<FullWidthImageProps> = ({
    source,
    style,
    loaderColor = colorSwatch.accent.green,
}): React.JSX.Element => {
    const [imageHeight, setImageHeight] = useState(0);
    const [hasError, setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (source && source.length > 0) {
            // Reset error state when source changes
            setHasError(false);
            setIsLoading(true);

            // Get the image dimensions
            const imageUrl = source.startsWith("http")
                ? source
                : `https:${source}`;

            Image.prefetch(imageUrl)
                .then(() => {})
                .catch((error) => {
                    console.error("[FullWidthImage] Prefetch failed:", error);
                    setHasError(true);
                    setIsLoading(false);
                });

            RNImage.getSize(
                imageUrl,
                (width, height) => {
                    // Calculate the height based on the full width
                    const aspectRatio = width / height;
                    const fullWidth = Dimensions.get("window").width;
                    const calculatedHeight = fullWidth / aspectRatio;
                    setImageHeight(calculatedHeight);
                },
                (error) => {
                    console.error(
                        "[FullWidthImage] Error getting image size:",
                        error
                    );
                    setHasError(true);
                    setIsLoading(false);
                }
            );
        } else {
            setHasError(true);
            setIsLoading(false);
        }
    }, [source]);

    // If source is invalid or empty, show placeholder
    if (!source || source.length === 0 || hasError) {
        return (
            <View style={[styles.imageContainer, style]}>
                <Image
                    source={require("../../../assets/next-quest-icons/game_item_placeholder.png")}
                    style={[styles.image, { height: 560 }]}
                    contentFit="cover"
                    priority="high"
                    cachePolicy="memory-disk"
                />
            </View>
        );
    }

    return (
        <View style={[styles.imageContainer, style]}>
            {isLoading && (
                <View style={[styles.skeleton]}>
                    <ActivityIndicator size="large" color={loaderColor} />
                </View>
            )}
            <Image
                source={{
                    uri: source.startsWith("http") ? source : `https:${source}`,
                }}
                style={[styles.image, { height: imageHeight || 560 }]}
                contentFit="cover"
                priority="high"
                cachePolicy="memory-disk"
                transition={300}
                onError={(error) => {
                    console.error(
                        "[FullWidthImage] Failed to load image:",
                        error
                    );
                    setHasError(true);
                    setIsLoading(false);
                }}
                onLoadEnd={() => {
                    setIsLoading(false);
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    imageContainer: {
        width: "100%",
        overflow: "hidden",
    },
    image: {
        width: "100%",
        minHeight: 560,
        height: undefined,
    },
    skeleton: {
        position: "absolute",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colorSwatch.background.darkest,
        width: "100%",
        height: 560,
        zIndex: 1,
    },
});

export default FullWidthImage;
