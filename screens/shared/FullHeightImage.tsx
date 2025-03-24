import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import {
    View,
    StyleSheet,
    StyleProp,
    ViewStyle,
    Image as RNImage,
} from "react-native";

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
        RNImage.getSize(`https:${source}`, (width, height) => {
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
                        {
                            width: imageWidth,
                            height: imageHeight,
                            overflow: "hidden",
                        },
                    ]}
                    contentFit="cover"
                    onError={() => console.error("Failed to load image")}
                />
            ) : (
                <Image
                    style={styles.cover}
                    source={require("../../assets/placeholder.png")}
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
