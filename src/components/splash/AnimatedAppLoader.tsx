import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { Asset } from "expo-asset";
import * as SplashScreen from "expo-splash-screen";
import { AnimatedSplashScreen } from "./AnimatedSplashScreen";
import { colorSwatch } from "../../utils/colorConstants";

type AnimatedAppLoaderProps = {
    children: React.ReactNode;
    image: number | { uri: string };
};

export function AnimatedAppLoader({ children, image }: AnimatedAppLoaderProps) {
    const [isSplashReady, setSplashReady] = useState(false);

    useEffect(() => {
        async function prepare() {
            try {
                await SplashScreen.hideAsync();
                if (typeof image === "number") {
                    setSplashReady(true);
                } else {
                    await Asset.fromURI(image.uri).downloadAsync();
                    setSplashReady(true);
                }
            } catch (e) {
                console.warn("Error preparing splash:", e);
                setSplashReady(true);
            }
        }
        prepare();
    }, [image]);

    if (!isSplashReady) {
        return <View style={styles.rootContainer} />;
    }

    return (
        <AnimatedSplashScreen image={image}>{children}</AnimatedSplashScreen>
    );
}

const styles = StyleSheet.create({
    rootContainer: {
        flex: 1,
        backgroundColor: colorSwatch.background.darkest,
    },
});
