import React, { useEffect, useRef, useMemo } from "react";
import { Animated, Easing, EasingFunction, View } from "react-native";
import { generateRandomColorSequence } from "src/utils/colorsUtils";

export const LoadingText = ({
    text,
    delay,
}: {
    text: string;
    delay?: number;
}) => {
    const letters = (text || "Loading...").split("");

    // Create animations array with useMemo to avoid hook violations
    const letterAnimations = useMemo(
        () => letters.map(() => new Animated.Value(0)),
        [letters.length] // Only recreate when length changes
    );

    const colors = useMemo(
        () => generateRandomColorSequence(letters.length),
        [letters.length] // Regenerate colors when length changes
    );

    const LETTER_DELAY = 100;
    const WAVE_DURATION = 500;
    const WAVE_HEIGHT = -5;
    const INITIAL_PAUSE = delay || 1000;

    const waveEasing: EasingFunction = Easing.inOut(Easing.ease);

    useEffect(() => {
        // Create the wave animation sequence
        const wave = (anim: Animated.Value) =>
            Animated.sequence([
                Animated.timing(anim, {
                    toValue: WAVE_HEIGHT,
                    duration: WAVE_DURATION / 2,
                    easing: waveEasing,
                    useNativeDriver: true,
                }),
                Animated.timing(anim, {
                    toValue: 0,
                    duration: WAVE_DURATION / 2,
                    easing: waveEasing,
                    useNativeDriver: true,
                }),
            ]);

        // Function to start the wave sequence for all letters
        const startWaveSequence = () => {
            letterAnimations.forEach((anim, index) => {
                setTimeout(() => {
                    wave(anim).start(() => {
                        // When the last letter completes, start over
                        if (index === letters.length - 1) {
                            startWaveSequence();
                        }
                    });
                }, index * LETTER_DELAY);
            });
        };

        // Start with initial delay, then begin the wave sequence
        setTimeout(() => {
            startWaveSequence();
        }, INITIAL_PAUSE);
    }, []);

    const renderLetter = (
        letter: string,
        animation: Animated.Value,
        index: number
    ) => (
        <Animated.Text
            key={index}
            style={{
                transform: [{ translateY: animation }],
                color: colors[index],
                fontSize: 18,
                marginHorizontal: letter === " " ? 6 : 1,
                fontFamily: "sans-serif",
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
