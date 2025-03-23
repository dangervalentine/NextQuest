import React, { useEffect, useState } from "react";
import { Image, View, StyleSheet, StyleProp, ViewStyle } from "react-native";

const FullHeightImage = ({
    source,
    style,
}: {
    source: string;
    style: StyleProp<ViewStyle>;
}): React.JSX.Element => {
    const [imageWidth, setImageWidth] = useState(0);
    const [imageHeight, setImageHeight] = useState(0);

    useEffect(() => {
        // Get the image dimensions
        Image.getSize(`https:${source}`, (width, height) => {
            const aspectRatio = width / height;
            const fullHeight = 100; // Set this to the desired height of the container
            setImageHeight(fullHeight);
            setImageWidth(fullHeight * aspectRatio); // Calculate width based on height
        });
    }, [source]);

    return (
        <View style={[styles.container, style]}>
            {imageHeight > 0 && imageWidth > 0 ? (
                <Image
                    source={{ uri: `https:${source}` }}
                    style={[
                        styles.cover,
                        { width: imageWidth, height: imageHeight },
                    ]}
                    resizeMode="cover"
                    onError={() => console.error("Failed to load image")}
                />
            ) : (
                <View style={styles.cover} />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 110, 
        marginRight: 12,
        borderRadius: 4,
    },
    cover: {
        padding: 3,
        borderRadius: 4,
    },
});

export default FullHeightImage;
