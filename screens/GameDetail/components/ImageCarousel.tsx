import * as React from "react";
import { Dimensions, View, StyleSheet } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import Carousel, {
    ICarouselInstance,
    Pagination,
} from "react-native-reanimated-carousel";
import { Image } from "expo-image";
import { generateRandomColorSequence } from "../../../utils/colors";

const { width } = Dimensions.get("window");
const CAROUSEL_WIDTH = width - 32; // Account for padding

interface ImageCarouselProps {
    images: string[];
}

interface ImageDimensions {
    width: number;
    height: number;
}

function ImageCarousel({ images }: ImageCarouselProps) {
    const ref = React.useRef<ICarouselInstance>(null);
    const progress = useSharedValue<number>(0);
    const [dimensions, setDimensions] = React.useState<ImageDimensions[]>([]);
    const [maxHeight, setMaxHeight] = React.useState<number>(
        CAROUSEL_WIDTH * 0.5625
    );

    const onPressPagination = (index: number) => {
        ref.current?.scrollTo({
            count: index - progress.value,
            animated: false,
        });
    };

    const handleImageLoad = (index: number, width: number, height: number) => {
        setDimensions((prev) => {
            const newDimensions = [...prev];
            newDimensions[index] = { width, height };

            // Update max height if this image is taller
            const aspectRatio = height / width;
            const newHeight = CAROUSEL_WIDTH * aspectRatio;
            setMaxHeight((current) => Math.max(current, newHeight));

            return newDimensions;
        });
    };

    const getImageHeight = (index: number): number => {
        const imageDimensions = dimensions[index];
        if (!imageDimensions) {
            return maxHeight; // Use current max height if dimensions not yet loaded
        }
        const aspectRatio = imageDimensions.height / imageDimensions.width;
        return CAROUSEL_WIDTH * aspectRatio;
    };

    return (
        <View style={styles.container}>
            <View style={styles.carouselWrapper}>
                <Carousel
                    ref={ref}
                    width={CAROUSEL_WIDTH}
                    height={maxHeight}
                    data={images}
                    onProgressChange={progress}
                    loop={true}
                    renderItem={({ index }) => (
                        <View
                            style={[
                                styles.imageContainer,
                                { height: getImageHeight(index) },
                            ]}
                        >
                            <Image
                                source={`https:${images[index]}`.replace(
                                    "t_screenshot_big",
                                    "t_720p"
                                )}
                                style={styles.image}
                                contentFit="contain"
                                placeholder={require("../../../assets/placeholder.png")}
                                onLoad={({ source }) => {
                                    console.log("source", source);
                                    handleImageLoad(
                                        index,
                                        source.width,
                                        source.height
                                    );
                                }}
                                onError={() =>
                                    console.error("Failed to load image")
                                }
                            />
                        </View>
                    )}
                />
            </View>

            <Pagination.Custom<{ color: string }>
                progress={progress}
                data={generateRandomColorSequence(images.length).map((x) => ({
                    color: x,
                }))}
                size={40}
                dotStyle={{
                    width: 20,
                    height: 5,
                }}
                activeDotStyle={{}}
                containerStyle={styles.paginationContainer}
                horizontal
                onPress={onPressPagination}
                customReanimatedStyle={(progress, index) => {
                    const isActive = Math.round(progress) === index;

                    return {
                        opacity: isActive ? 1 : 0.1,
                        transform: [
                            {
                                scale: isActive ? 1.2 : 1,
                            },
                        ],
                    };
                }}
                renderItem={(item) => (
                    <View
                        style={{
                            backgroundColor: item.color,
                            flex: 1,
                        }}
                    />
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        padding: 16,
    },
    carouselWrapper: {
        width: "100%",
        alignItems: "center",
    },
    imageContainer: {
        width: CAROUSEL_WIDTH,
        backgroundColor: "transparent",
        justifyContent: "center",
        alignItems: "center",
    },
    image: {
        width: "100%",
        height: "100%",
    },
    paginationContainer: {
        gap: 5,
        alignItems: "center",
        height: 10,
        marginTop: 16,
    },
});

export default ImageCarousel;
