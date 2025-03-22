import * as React from "react";
import { Dimensions, View, StyleSheet } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import Carousel, {
    ICarouselInstance,
    Pagination,
} from "react-native-reanimated-carousel";
import { generateRandomColorSequence } from "../utils/colors";
import { Image } from "expo-image";

const { width } = Dimensions.get("window");

interface ImageCarouselProps {
    images: string[];
}

function ImageCarousel({ images }: ImageCarouselProps) {
    const ref = React.useRef<ICarouselInstance>(null);
    const progress = useSharedValue<number>(0);

    const onPressPagination = (index: number) => {
        ref.current?.scrollTo({
            count: index - progress.value,
            animated: false,
        });
    };

    return (
        <View style={{ flex: 1 }}>
            <Carousel
                ref={ref}
                width={width - 20}
                height={width / 1.7}
                data={images}
                onProgressChange={progress}
                loop={true}
                renderItem={({ index }) => (
                    <View style={{}}>
                        <Image
                            source={`https:${images[index]}`}
                            style={styles.image}
                            contentFit="contain"
                            placeholder={require("../assets/placeholder.png")}
                            onError={() =>
                                console.error("Failed to load image")
                            }
                        />
                    </View>
                )}
            />

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
                containerStyle={{
                    gap: 5,
                    alignItems: "center",
                    height: 10,
                }}
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
    image: {
        width: "100%",
        height: "100%",
        resizeMode: "contain",
        alignSelf: "flex-start",
    },
});

export default ImageCarousel;
