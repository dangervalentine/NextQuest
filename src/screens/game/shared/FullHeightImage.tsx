import React, { useEffect } from "react";
import { View, Image as RNImage, StyleSheet } from "react-native";
import { Image } from "expo-image";

interface FullHeightImageProps {
    source: string;
    style?: any;
}

const FullHeightImage: React.FC<FullHeightImageProps> = ({ source, style }) => {
    const [imageWidth, setImageWidth] = React.useState(0);
    const [imageHeight, setImageHeight] = React.useState(0);
    const [hasError, setHasError] = React.useState(false);

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
            {imageHeight > 0 && imageWidth > 0 ? (
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
                    onError={() => {
                        console.error("Failed to load image");
                        setHasError(true);
                    }}
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
    cover: {},
});

export default FullHeightImage;
