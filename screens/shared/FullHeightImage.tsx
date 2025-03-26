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

    useEffect(() => {
        if (source) {
            // Prefetch the image
            Image.prefetch(`https:${source}`);

            // Get the image dimensions with original aspect ratio logic
            RNImage.getSize(
                `https:${source}`,
                (width, height) => {
                    const aspectRatio = width / height;
                    const fullHeight = 100; // Set this to the desired height of the container
                    setImageHeight(fullHeight);
                    setImageWidth(fullHeight * aspectRatio); // Calculate width based on height
                },
                (error) => console.error("Error getting image size:", error)
            );
        }
    }, [source]);

    return (
        <View style={[styles.container, style]}>
            {imageHeight > 0 && imageWidth > 0 ? (
                <Image
                    source={{ uri: `https:${source}` }}
                    style={[
                        styles.cover,
                        {
                            width: imageWidth,
                            height: imageHeight,
                            overflow: "hidden",
                        },
                    ]}
                    contentFit="cover"
                    priority="high"
                    cachePolicy="memory-disk"
                    onError={() => console.error("Failed to load image")}
                />
            ) : (
                <Image
                    style={styles.cover}
                    source={require("../../assets/placeholder.png")}
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
