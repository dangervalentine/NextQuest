import React, { useEffect, useRef, useMemo } from "react";
import { Animated, View } from "react-native";
import { generateRandomColorSequence } from "src/utils/colors";

export const LoadingText = ({ text }: { text: string }) => {
    const letters = (text || "Loading...").split("");
    const letterAnimations = letters.map(
        () => useRef(new Animated.Value(1)).current
    ); // Memoize the colors so they don't change on re-render

    const colors = useMemo(
        () => generateRandomColorSequence(letters.length),
        []
    ); // Animation timing constants

    const LETTER_DELAY = 100; // Delay between each letter starting
    const FADE_DURATION = 200; // Duration of each fade
    const INITIAL_PAUSE = 1000; // Initial pause before flicker starts // Calculate total sequence time: // Time for last letter to start + fade duration + a small buffer
    const SEQUENCE_TIME =
        (letters.length - 1) * LETTER_DELAY + FADE_DURATION - 200;

    useEffect(() => {
        const animateLetter = (anim: Animated.Value, index: number) => {
            // Initial fade in
            const fadeIn = Animated.timing(anim, {
                toValue: 1,
                duration: 300,
                delay: index * LETTER_DELAY,
                useNativeDriver: true,
            }); // Flicker effect

            const flicker = Animated.loop(
                Animated.sequence([
                    Animated.timing(anim, {
                        toValue: 0,
                        duration: FADE_DURATION,
                        useNativeDriver: true,
                    }),

                    Animated.timing(anim, {
                        toValue: 1,
                        duration: FADE_DURATION,
                        useNativeDriver: true,
                    }), // Wait for exactly one sequence to complete before restarting

                    Animated.delay(SEQUENCE_TIME),
                ])
            ); // Run fade in, then start the flicker

            Animated.sequence([fadeIn, Animated.delay(INITIAL_PAUSE)]).start(
                () => {
                    flicker.start();
                }
            );
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
                fontFamily: "PressStart2P-Regular",
            }}
        >
            {letter}
        </Animated.Text>
    );

    return (
        <View style={{ flexDirection: "row" }}>
            {letters.map((letter, index) =>
                renderLetter(letter, letterAnimations[index], index)
            )}
        </View>
    );
};
