import { ESRB_RATINGS } from "../constants/ratings";
import { QuestGame } from "../data/models/QuestGame";

export const getAgeRating = (questGame: QuestGame) => {
    const ageRating = questGame.age_ratings?.find(
        (rating) => rating.category === 1
    );

    if (!ageRating) return null;

    const rating = ESRB_RATINGS[ageRating.rating];

    return rating;
};
