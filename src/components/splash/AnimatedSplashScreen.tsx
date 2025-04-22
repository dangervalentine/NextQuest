import React, { useMemo, useState, useEffect } from "react";
import { Animated, StyleSheet, View, Dimensions, Easing } from "react-native";
import Constants from "expo-constants";
import { useFonts } from "expo-font";
import { initializeDatabase } from "../../data/config/databaseSeeder";
import { LoadingText } from "../common/LoadingText";
import { colorSwatch } from "../../utils/colorConstants";

type AnimatedSplashScreenProps = {
    children: React.ReactNode;
    image: number | { uri: string };
};

export function AnimatedSplashScreen({
    children,
    image,
}: AnimatedSplashScreenProps) {
    const stretchAnimation = useMemo(() => new Animated.Value(0), []);
    const opacityAnimation = useMemo(() => new Animated.Value(1), []);
    const mainAppOpacity = useMemo(() => new Animated.Value(0), []);
    const dotsOpacity = useMemo(() => new Animated.Value(1), []);
    const INITIAL_IMAGE_WIDTH = 200;
    const screenWidth = Dimensions.get("window").width;
    const targetScale = screenWidth / INITIAL_IMAGE_WIDTH + 0.06;

    const [isAppReady, setAppReady] = useState(false);
    const [isSplashAnimationComplete, setAnimationComplete] = useState(false);
    const [dbInitialized, setDbInitialized] = useState(false);
    const [minimumDelayPassed, setMinimumDelayPassed] = useState(false);

    const MIN_SPLASH_DURATION_MS = 5000;

    const [fontsLoaded] = useFonts({
        "Inter-Regular": require("../../assets/fonts/Inter-Regular.ttf"),
        "Inter-Bold": require("../../assets/fonts/Inter-Bold.ttf"),
        "FiraCode-Light": require("../../assets/fonts/FiraCode-Light.ttf"),
        "FiraCode-Regular": require("../../assets/fonts/FiraCode-Regular.ttf"),
        "FiraCode-Bold": require("../../assets/fonts/FiraCode-Bold.ttf"),
        "PressStart2P-Regular": require("../../assets/fonts/PressStart2P-Regular.ttf"),
    });

    // Track elapsed splash screen time
    useEffect(() => {
        const timer = setTimeout(
            () => setMinimumDelayPassed(true),
            MIN_SPLASH_DURATION_MS
        );
        return () => clearTimeout(timer);
    }, []);

    // Initialize database
    useEffect(() => {
        async function prepare() {
            try {
                await initializeDatabase();
                setDbInitialized(true);
            } catch (e) {
                console.warn("Database initialization failed:", e);
            }
        }
        prepare();
    }, []);

    // Trigger exit animations when ready
    useEffect(() => {
        if (fontsLoaded && dbInitialized && minimumDelayPassed) {
            console.log("Starting exit animation");
            setAppReady(true);

            Animated.sequence([
                // First stretch to full width and fade splash/dots
                Animated.parallel([
                    Animated.timing(stretchAnimation, {
                        toValue: 1,
                        duration: 200,
                        useNativeDriver: true,
                        easing: Easing.bezier(0.4, 0, 0.2, 1),
                    }),
                    Animated.timing(opacityAnimation, {
                        toValue: 0.25,
                        duration: 200,
                        useNativeDriver: true,
                        easing: Easing.out(Easing.ease),
                    }),
                    Animated.timing(dotsOpacity, {
                        toValue: 0,
                        duration: 200,
                        useNativeDriver: true,
                        easing: Easing.out(Easing.ease),
                    }),
                ]),
                // Then fade in the main app
                Animated.timing(mainAppOpacity, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                    easing: Easing.in(Easing.ease),
                }),
            ]).start(() => {
                setAnimationComplete(true);
            });
        }
    }, [fontsLoaded, dbInitialized, minimumDelayPassed]);

    const backgroundColor = colorSwatch.background.darkest;
    const resizeMode = Constants.expoConfig?.splash?.resizeMode || "contain";

    return (
        <View style={styles.rootContainer}>
            <Animated.View style={{ flex: 1, opacity: mainAppOpacity }}>
                {isAppReady && children}
            </Animated.View>
            {!isSplashAnimationComplete && (
                <Animated.View
                    pointerEvents="none"
                    style={[
                        StyleSheet.absoluteFill,
                        {
                            backgroundColor,
                            opacity: opacityAnimation,
                        },
                        {
                            alignItems: "center",
                            justifyContent: "center",
                            flex: 1,
                            height: "100%",
                            width: "100%",
                        },
                    ]}
                >
                    <View
                        style={{
                            position: "absolute",
                            left: 0,
                            right: 0,
                            bottom: 0,
                            top: 0,
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: colorSwatch.background.darkest,
                            paddingBottom: "14%",
                        }}
                    >
                        <Animated.Image
                            style={{
                                height: 200,
                                width: INITIAL_IMAGE_WIDTH,
                                resizeMode,
                                transform: [
                                    {
                                        scale: stretchAnimation.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [1, targetScale],
                                        }),
                                    },
                                ],
                            }}
                            source={image}
                            fadeDuration={0}
                        />
                        <Animated.View
                            style={[
                                styles.dotsContainer,
                                { opacity: dotsOpacity },
                            ]}
                        >
                            <LoadingText />
                        </Animated.View>
                    </View>
                </Animated.View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    rootContainer: {
        flex: 1,
        backgroundColor: colorSwatch.background.darkest,
    },
    dotsContainer: {
        position: "absolute",
        left: 0,
        right: 0,
        alignItems: "center",
        top: "55%",
        marginTop: 110, // 200/2 (half image height) + 10px gap
    },
});
