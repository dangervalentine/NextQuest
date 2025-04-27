import React, { useState, useEffect, useCallback, useMemo } from "react";
import { StyleSheet, View, Animated, Easing, Dimensions } from "react-native";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { colorSwatch } from "./constants/theme/colorConstants";
import MainNavigationContainer from "./screens/game/MainNavigationContainer";
import { LoadingText } from "./components/common/LoadingText";
import {
    GameStatusProvider,
    useGameStatus,
} from "./contexts/GameStatusContext";
import { useFonts } from "expo-font";
import { initializeDatabase } from "./data/config/databaseSeeder";
import { getStatusColor } from "./utils/colorsUtils";
import CircleMask from "./components/splash/CircleMask";
// Create a dark theme for navigation
const NavigationTheme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        background: "transparent",
    },
};

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const IMAGE_SIZE = screenWidth * 0.475; // Original size of the image
const ADDITIONAL_LOAD_TIME_MS = 2000;

function AppContent() {
    const [isSplashReady, setSplashReady] = useState(false);
    const [isAppReady, setAppReady] = useState(false);
    const [isImageLoaded, setImageLoaded] = useState(false);
    const [dbInitialized, setDbInitialized] = useState(false);
    const [additionalLoadComplete, setAdditionalLoadComplete] = useState(false);

    const tintColorAnim = useMemo(() => new Animated.Value(0), []);
    const mainAppOpacity = useMemo(() => new Animated.Value(0), []);
    const imageScale = useMemo(() => new Animated.Value(1), []);
    const textOpacity = useMemo(() => new Animated.Value(0), []);
    const imageOpacity = useMemo(() => new Animated.Value(1), []);
    const circleSizeAnim = useMemo(
        () => new Animated.Value(IMAGE_SIZE * 0.95),
        []
    ); // Larger initial size for better visibility
    const targetScale = useMemo(() => screenWidth / IMAGE_SIZE, []);
    const { activeStatus } = useGameStatus();

    const [fontsLoaded] = useFonts({
        "Inter-Regular": require("./assets/fonts/Inter-Regular.ttf"),
        "Inter-Bold": require("./assets/fonts/Inter-Bold.ttf"),
        "FiraCode-Light": require("./assets/fonts/FiraCode-Light.ttf"),
        "FiraCode-Regular": require("./assets/fonts/FiraCode-Regular.ttf"),
        "FiraCode-Bold": require("./assets/fonts/FiraCode-Bold.ttf"),
        "PressStart2P-Regular": require("./assets/fonts/PressStart2P-Regular.ttf"),
    });

    // Show splash screen as soon as fonts and image are loaded
    useEffect(() => {
        if (fontsLoaded && isImageLoaded) {
            setSplashReady(true);
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded, isImageLoaded]);

    // Initialize database and additional loading time after splash is shown
    useEffect(() => {
        if (isSplashReady) {
            async function prepare() {
                try {
                    Animated.timing(textOpacity, {
                        toValue: 1,
                        duration: 300,
                        useNativeDriver: true,
                    }).start(() => {
                        Animated.timing(circleSizeAnim, {
                            toValue: IMAGE_SIZE * 2,
                            duration: 600,
                            delay: 300,
                            easing: Easing.inOut(Easing.ease),
                            useNativeDriver: false,
                        }).start(async () => {
                            // Simulate additional loading time
                            await new Promise((resolve) =>
                                setTimeout(resolve, ADDITIONAL_LOAD_TIME_MS)
                            );
                            // Initialize database
                            await initializeDatabase();
                            setDbInitialized(true);

                            setAdditionalLoadComplete(true);
                        });
                    });
                } catch (e) {
                    console.warn("Initialization failed:", e);
                    setDbInitialized(true);
                    setAdditionalLoadComplete(true);
                }
            }
            prepare();
        }
    }, [isSplashReady]);

    const prepare = useCallback(async () => {
        try {
            const appIsReady =
                isSplashReady && dbInitialized && additionalLoadComplete;

            if (appIsReady) {
                // Start the animation sequence
                Animated.timing(tintColorAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: false,
                }).start(() => {
                    Animated.parallel([
                        Animated.timing(textOpacity, {
                            toValue: 0,
                            duration: 300,
                            useNativeDriver: true,
                        }),
                        Animated.timing(imageOpacity, {
                            toValue: 0.1,
                            duration: 300,
                            useNativeDriver: true,
                        }),
                        Animated.timing(imageScale, {
                            toValue: targetScale,
                            duration: 300,
                            easing: Easing.inOut(Easing.ease),
                            useNativeDriver: true,
                        }),
                    ]).start(() => {
                        Animated.timing(mainAppOpacity, {
                            toValue: 1,
                            duration: 10,
                            useNativeDriver: true,
                        }).start();
                        setAppReady(true);
                    });
                });
            }
        } catch (e) {
            console.warn("Error preparing app:", e);
            setAppReady(true);
        }
    }, [
        mainAppOpacity,
        imageScale,
        textOpacity,
        imageOpacity,
        circleSizeAnim,
        targetScale,
        isSplashReady,
        dbInitialized,
        additionalLoadComplete,
    ]);

    useEffect(() => {
        prepare();
    }, [prepare]);

    const interpolatedTintColor = tintColorAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [colorSwatch.neutral.white, getStatusColor(activeStatus)],
    });

    return (
        <View style={styles.rootContainer}>
            <Animated.View
                style={[styles.mainAppContainer, { opacity: mainAppOpacity }]}
            >
                <View style={styles.container}>
                    <StatusBar style="light" />
                    <NavigationContainer theme={NavigationTheme}>
                        <MainNavigationContainer />
                    </NavigationContainer>
                </View>
            </Animated.View>
            {!isAppReady && (
                <View style={styles.splashContainer}>
                    <Animated.View
                        pointerEvents="none"
                        style={[
                            styles.imageContainer,
                            {
                                transform: [{ scale: imageScale }],
                            },
                        ]}
                    >
                        <View
                            style={{
                                width: IMAGE_SIZE,
                                height: IMAGE_SIZE,
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: colorSwatch.background.darkest,
                            }}
                        >
                            <CircleMask
                                size={IMAGE_SIZE}
                                circleSize={circleSizeAnim}
                                tintColor={interpolatedTintColor}
                                onImageLoad={() => setImageLoaded(true)}
                                opacity={imageOpacity}
                            />
                        </View>
                    </Animated.View>
                    <Animated.View
                        style={[
                            styles.loadingTextContainer,
                            { opacity: textOpacity },
                        ]}
                    >
                        <LoadingText text="Danger Valentine" />
                    </Animated.View>
                </View>
            )}
        </View>
    );
}

export default function App() {
    return (
        <GameStatusProvider>
            <AppContent />
        </GameStatusProvider>
    );
}

const styles = StyleSheet.create({
    rootContainer: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    mainAppContainer: {
        ...StyleSheet.absoluteFillObject,
    },
    splashContainer: {
        flex: 1,
        marginTop: screenHeight * 0.027,
        alignItems: "center",
        justifyContent: "center",
    },
    imageContainer: {
        alignItems: "center",
        justifyContent: "center",
    },
    splashImage: {
        width: IMAGE_SIZE,
        height: IMAGE_SIZE,
    },
    loadingTextContainer: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: screenHeight / 3,
        alignItems: "center",
    },
});
