import React, { memo } from "react";
import { StyleSheet } from "react-native";
import Text from "../../../../components/common/Text";
import ExpandableContent from "../../../../components/common/ExpandableContent";
import { colorSwatch } from "../../../../constants/theme/colorConstants";
import { theme } from "src/constants/theme/styles";

interface StorylineSectionProps {
    storyline?: string;
    summary?: string;
}

const StorylineSection: React.FC<StorylineSectionProps> = memo(
    ({ storyline, summary }) => {
        const content = storyline || summary;
        if (!content) return null;

        return (
            <Text variant="body" style={styles.storylineText}>
                {content}
            </Text>
            // <ExpandableContent
            //     content={
            //         <Text variant="body" style={styles.storylineText}>
            //             {content}
            //         </Text>
            //     }
            //     maxCollapsedHeight={80}
            //     containerStyle={styles.storylineContainer}
            // />
        );
    }
);

const styles = StyleSheet.create({
    storylineContainer: {
        backgroundColor: colorSwatch.background.darker,
        borderRadius: theme.borderRadius,
    },
    storylineText: {
        color: colorSwatch.text.primary,
        fontSize: 14,
        lineHeight: 20,
    },
});

export default StorylineSection;
