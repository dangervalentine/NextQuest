import * as React from "react";
import { Dimensions, View, StyleSheet } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import Carousel, {
    ICarouselInstance,
    Pagination,
} from "react-native-reanimated-carousel";
import { Image } from "expo-image";
import { generateRandomColorSequence } from "src/utils/colors";

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
        <View style={{ flex: 1, alignItems: "center" }}>
            <Carousel
                ref={ref}
                width={width - 44}
                height={width / 1.7}
                data={images}
                onProgressChange={progress}
                loop={true}
                renderItem={({ index }) => (
                    <View style={{}}>
                        <Image
                            source={`https:${images[index]}`.replace(
                                "t_screenshot_big",
                                "t_720p"
                            )}
                            style={styles.image}
                            contentFit="contain"
                            placeholder={require("../../../../assets/next-quest-icons/game_item_placeholder.png")}
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
                    maxWidth: 20,
                    height: 5,
                    flex: 1,
                }}
                activeDotStyle={{}}
                containerStyle={{
                    gap: 5,
                    maxWidth: width - 64,
                    width: "100%",
                    justifyContent: "center",
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
        justifyContent: "center",
        alignItems: "center",
    },
});

export default ImageCarousel;
