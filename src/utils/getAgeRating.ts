import { ESRB_RATINGS } from "src/constants/config/ratings";
import { QuestGame } from "src/data/models/QuestGame";

export const getAgeRating = (questGame: QuestGame) => {
    const ageRating = questGame.age_ratings?.find(
        (rating) => rating.category === 1
    );

    if (!ageRating) return null;

    const rating = ESRB_RATINGS[ageRating.rating];

    return rating;
};
