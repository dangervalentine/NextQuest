import { View, Animated } from "react-native";
import { colorSwatch } from "../../utils/colorConstants";
// Custom triangle-in-circle-in-square mask component
interface CircleMaskProps {
    size: number;
    circleSize: number | Animated.Value;
    tintColor: string | Animated.AnimatedInterpolation<string | number>;
    onImageLoad: () => void;
    opacity: number | Animated.AnimatedInterpolation<number>;
}

const CircleMask: React.FC<CircleMaskProps> = ({
    size,
    circleSize,
    tintColor,
    onImageLoad,
    opacity,
}) => {
    return (
        <View style={{ width: size, height: size }}>
            {/* Background square */}
            <View
                style={{
                    position: "absolute",
                    width: size,
                    height: size,
                    backgroundColor: colorSwatch.background.darkest,
                }}
            />

            {/* Circle mask for the image */}
            <View
                style={{
                    position: "absolute",
                    width: size,
                    height: size,
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Animated.View
                    style={{
                        width: circleSize,
                        height: circleSize,
                        borderRadius: size,
                        overflow: "hidden",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: colorSwatch.background.darkest,
                    }}
                >
                    <Animated.Image
                        source={require("../../assets/next-quest-icons/next_quest_white.png")}
                        style={{
                            width: size,
                            height: size,
                            tintColor: tintColor,
                            opacity: opacity,
                        }}
                        resizeMode="contain"
                        onLoad={onImageLoad}
                    />
                </Animated.View>
            </View>
        </View>
    );
};

export default CircleMask;
