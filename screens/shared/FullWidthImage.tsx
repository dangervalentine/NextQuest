import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import { Dimensions, StyleProp, ViewStyle } from "react-native";
import { View, StyleSheet, Image as RNImage } from "react-native";

const FullWidthImage = ({
    source,
    style,
}: {
    source: string;
    style?: StyleProp<ViewStyle>;
}): React.JSX.Element => {
    const [imageHeight, setImageHeight] = useState(0);

    useEffect(() => {
        // Get the image dimensions
        RNImage.getSize(source, (width, height) => {
            // Calculate the height based on the full width
            const aspectRatio = width / height;
            const fullWidth = Dimensions.get("window").width; // Get the full width of the screen
            setImageHeight(fullWidth / aspectRatio); // Set the height based on the aspect ratio
        });
    }, [source]);

    return (
        <View style={[styles.imageContainer, style]}>
            <Image
                source={{ uri: source }}
                style={[styles.image, { height: imageHeight }]}
                contentFit="cover"
                transition={200}
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
        height: undefined,
    },
});

export default FullWidthImage;
