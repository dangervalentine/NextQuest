import { Ionicons } from "@expo/vector-icons";
import { useRef } from "react";
import { Animated, Pressable } from "react-native";
import Text from "src/components/common/Text";

interface AnimatedBackButtonProps {
    onPress: () => void;
    color: string;
    title: string;
}

const AnimatedBackButton: React.FC<AnimatedBackButtonProps> = ({
    onPress,
    color,
    title,
}) => {
    const textMargin = useRef(new Animated.Value(12)).current;

    const handlePress = () => {
        // Animation sequence: text moves toward icon, then bounces back
        Animated.sequence([
            // Move text closer to icon - make faster (80ms)
            Animated.timing(textMargin, {
                toValue: 0,
                duration: 150,
                useNativeDriver: false,
            }),
            // Bounce back
            Animated.timing(textMargin, {
                toValue: 12,
                duration: 150,
                useNativeDriver: false,
            }),
        ]).start(() => onPress());
    };

    return (
        <Pressable
            onPress={handlePress}
            style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                paddingRight: 16,
                paddingVertical: 8,
                paddingLeft: 8,
                width: "100%",
                opacity: pressed ? 0.6 : 1,
            })}
        >
            <Ionicons name="chevron-back" size={24} color={color} />
            <Animated.View style={{ marginLeft: textMargin }}>
                <Text
                    variant="title"
                    style={{
                        fontSize: 24,
                        lineHeight: 32,
                        color: color,
                    }}
                    numberOfLines={1}
                >
                    {title}
                </Text>
            </Animated.View>
        </Pressable>
    );
};

export default AnimatedBackButton;
