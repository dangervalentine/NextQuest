import React, { useEffect, useState } from "react";
import {
    View,
    Image as RNImage,
    StyleSheet,
    ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { colorSwatch } from "src/utils/colorConstants";

interface FullHeightImageProps {
    source: string;
    style?: any;
}

const FullHeightImage: React.FC<FullHeightImageProps> = ({ source, style }) => {
    const [imageWidth, setImageWidth] = useState(0);
    const [imageHeight, setImageHeight] = useState(0);
    const [hasError, setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (source) {
            // Reset error state when source changes
            setHasError(false);

            // Check if source is a local image (require statement)
            if (typeof source === "number") {
                setImageHeight(100);
                setImageWidth(56);
                return;
            }

            // Ensure the URL is properly formatted
            const imageUrl = source.startsWith("http")
                ? source
                : `https:${source}`;

            // Prefetch the image
            Image.prefetch(imageUrl);

            // Get the image dimensions with original aspect ratio logic
            RNImage.getSize(
                imageUrl,
                (width, height) => {
                    const aspectRatio = width / height;
                    const fullHeight = 100; // Set this to the desired height of the container
                    setImageHeight(fullHeight);
                    setImageWidth(fullHeight * aspectRatio); // Calculate width based on height
                },
                (error) => {
                    console.error("Error getting image size:", error);
                    setHasError(true);
                    setImageHeight(100);
                    setImageWidth(56);
                }
            );
        }
    }, [source]);

    return (
        <View style={[styles.container, style]}>
            {isLoading && (
                <View style={[styles.skeleton]}>
                    <ActivityIndicator
                        size="large"
                        color={colorSwatch.accent.green}
                    />
                </View>
            )}
            {!hasError && imageHeight > 0 && imageWidth > 0 ? (
                <Image
                    source={
                        typeof source === "number"
                            ? source
                            : {
                                  uri: source.startsWith("http")
                                      ? source
                                      : `https:${source}`,
                              }
                    }
                    style={[
                        styles.cover,
                        {
                            width: imageWidth,
                            height: imageHeight,
                            overflow: "hidden",
                            borderRadius: 4,
                        },
                    ]}
                    contentFit="cover"
                    priority="high"
                    cachePolicy="memory-disk"
                    transition={300}
                    onError={() => {
                        console.error("Failed to load image");
                        setHasError(true);
                        setIsLoading(false);
                    }}
                    onLoadEnd={() => setIsLoading(false)}
                />
            ) : (
                <Image
                    style={styles.cover}
                    source={require("../../../assets/placeholder.png")}
                    priority="high"
                    cachePolicy="memory-disk"
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginRight: 12,
    },
    cover: {
        maxWidth: 75,
    },
    skeleton: {
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colorSwatch.background.dark,
        width: 75,
        height: 100,
    },
});

export default FullHeightImage;
