import React from "react";
import { View, StyleSheet } from "react-native";
import { getAgeRating } from "src/utils/getAgeRating";
import { QuestGame } from "src/data/models/QuestGame";
import E from "../../assets/ESRB/E.svg";
import E10 from "../../assets/ESRB/E10.svg";
import T from "../../assets/ESRB/T.svg";
import M from "../../assets/ESRB/M.svg";
import AO from "../../assets/ESRB/AO.svg";
import RP from "../../assets/ESRB/RP.svg";
import { Image } from "expo-image";

interface AgeRatingBadgeProps {
    game: QuestGame;
    style?: any;
}

export const AgeRatingBadge: React.FC<AgeRatingBadgeProps> = ({
    game,
    style,
}) => {
    const rating = getAgeRating(game);

    if (!rating) return null;

    const getRatingImage = () => {
        switch (rating) {
            case "E":
                return E;
            case "E10":
                return E10;
            case "T":
                return T;
            case "M":
                return M;
            case "AO":
                return AO;
            case "RP":
                return RP;
            default:
                return null;
        }
    };

    const RatingImage = getRatingImage();

    if (!RatingImage) return null;

    return (
        <View style={[style]}>
            <Image
                source={RatingImage}
                style={styles.image}
                contentFit="contain"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    image: {
        height: 32,
        width: "auto",
        aspectRatio: 1,
    },
});
