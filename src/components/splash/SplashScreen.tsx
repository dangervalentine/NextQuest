import React, { useRef, useEffect } from "react";
import { View, Image, StyleSheet, Animated, Dimensions } from "react-native";
import MaskedView from "@react-native-masked-view/masked-view";

const { width: screenWidth } = Dimensions.get("window");
const IMAGE_SIZE = screenWidth * 0.25;

const SplashScreen = () => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.timing(scaleAnim, {
            toValue: 10,
            duration: 1000,
            useNativeDriver: true,
        }).start();
    }, []);

    return (
        <MaskedView
            style={styles.maskedView}
            maskElement={
                <View style={styles.maskContainer}>
                    <Animated.View
                        style={[
                            styles.maskCircle,
                            {
                                width: IMAGE_SIZE,
                                height: IMAGE_SIZE,
                                borderRadius: IMAGE_SIZE / 2,
                                transform: [{ scale: scaleAnim }],
                            },
                        ]}
                    />
                </View>
            }
        >
            <Image
                source={require("./assets/next-quest-icons/next_quest_white.png")}
                style={{ width: IMAGE_SIZE, height: IMAGE_SIZE }}
                resizeMode="contain"
            />
        </MaskedView>
    );
};

const styles = StyleSheet.create({
    maskedView: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    maskContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    maskCircle: {
        backgroundColor: "black",
    },
});

export default SplashScreen;
