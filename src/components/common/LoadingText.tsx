import React, { useEffect, useRef } from "react";
import { Animated, View } from "react-native";
import { generateRandomColorSequence } from "src/utils/colors";
import Text from "./Text";
import { colorSwatch } from "src/utils/colorConstants";

export const LoadingText = () => {
    const letters = "Danger Valentine".split("");
    const letterAnimations = letters.map(
        () => useRef(new Animated.Value(0)).current
    );
    const colors = generateRandomColorSequence(letters.length);

    useEffect(() => {
        const animateLetter = (anim: Animated.Value, index: number) => {
            // Initial fade in
            const fadeIn = Animated.timing(anim, {
                toValue: 1,
                duration: 300,
                delay: index * 100,
                useNativeDriver: true,
            });

            // Flicker effect
            const flicker = Animated.loop(
                Animated.sequence([
                    Animated.timing(anim, {
                        toValue: 0.9,
                        duration: 600,
                        useNativeDriver: true,
                    }),
                    Animated.timing(anim, {
                        toValue: 1,
                        duration: 600,
                        useNativeDriver: true,
                    }),
                ])
            );

            // Run fade in, then start the flicker
            Animated.sequence([
                fadeIn,
                Animated.delay(1000), // Wait a bit before starting the flicker
            ]).start(() => {
                flicker.start();
            });
        };

        letterAnimations.forEach((anim, index) => animateLetter(anim, index));
    }, []);

    const renderLetter = (
        letter: string,
        animation: Animated.Value,
        index: number
    ) => (
        <Animated.Text
            key={index}
            style={{
                opacity: animation,
                color: colors[index],
                fontSize: 18,
                marginHorizontal: letter === " " ? 6 : 1,
                fontFamily: "FiraCode-Regular",
            }}
        >
            {letter}
        </Animated.Text>
    );

    return (
        <>
            <Text
                variant="subtitle"
                style={{ color: colorSwatch.text.secondary }}
            >
                Created by
            </Text>
            <View style={{ flexDirection: "row" }}>
                {letters.map((letter, index) =>
                    renderLetter(letter, letterAnimations[index], index)
                )}
            </View>
        </>
    );
};
