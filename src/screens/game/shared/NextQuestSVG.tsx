import Svg, { Path } from "react-native-svg";

export const NextQuestSVG = ({ fill = "#000" }: { fill?: string }) => {
    return (
        <Svg width="100%" height="100%" viewBox="0 0 100 100">
            <Path d="M0 0h100v100H0z" fill={fill} />
        </Svg>
    );
};

export default NextQuestSVG;
