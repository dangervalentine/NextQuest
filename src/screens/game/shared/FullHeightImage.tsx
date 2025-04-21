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
    loaderColor?: string;
}

const FullHeightImage: React.FC<FullHeightImageProps> = ({
    source,
    style,
    loaderColor = colorSwatch.accent.green,
}) => {
    const [imageWidth, setImageWidth] = useState(0);
    const [imageHeight, setImageHeight] = useState(0);
    const [hasError, setHasError] = useState(false);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const prepareImage = async () => {
            if (!source) return;

            setIsReady(false);
            setHasError(false);

            try {
                if (typeof source === "number") {
                    if (isMounted) {
                        setImageHeight(100);
                        setImageWidth(75);
                        setIsReady(true);
                    }
                    return;
                }

                const imageUrl = source.startsWith("http")
                    ? source
                    : `https:${source}`;

                // Wait for prefetch to complete
                await Image.prefetch(imageUrl);

                // Get dimensions
                await new Promise((resolve, reject) => {
                    RNImage.getSize(
                        imageUrl,
                        (width, height) => {
                            if (isMounted) {
                                const aspectRatio = width / height;
                                const fullHeight = 100;
                                setImageHeight(fullHeight);
                                setImageWidth(fullHeight * aspectRatio);
                                setIsReady(true);
                            }
                            resolve(null);
                        },
                        (error) => {
                            console.error("Error getting image size:", error);
                            if (isMounted) {
                                setHasError(true);
                                setImageHeight(100);
                                setImageWidth(75);
                            }
                            reject(error);
                        }
                    );
                });
            } catch (error) {
                if (isMounted) {
                    console.error("Error preparing image:", error);
                    setHasError(true);
                }
            }
        };

        prepareImage();

        return () => {
            isMounted = false;
        };
    }, [source]);

    return (
        <View style={[styles.container, style]}>
            {!isReady ? (
                <View style={[styles.skeleton]}>
                    <ActivityIndicator size="large" color={loaderColor} />
                </View>
            ) : !hasError ? (
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
                    }}
                />
            ) : (
                <Image
                    style={styles.cover}
                    source={require("../../../assets/next-quest-icons/game_item_placeholder.png")}
                    priority="high"
                    cachePolicy="memory-disk"
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {},
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
