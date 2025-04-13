import { StyleSheet, View } from "react-native";
import { colorSwatch } from "src/utils/colorConstants";
import { QuestGame } from "src/data/models/QuestGame";
import Text from "src/components/common/Text";

interface CompaniesSectionProps {
    game: QuestGame;
}

const CompaniesSection: React.FC<CompaniesSectionProps> = ({ game }) => {
    // Group companies by role
    const groupedCompanies = {
        developers:
            game.involved_companies
                ?.filter((c) => c.developer)
                .map((c) => c.company?.name || "")
                .filter(Boolean) || [],
        publishers:
            game.involved_companies
                ?.filter((c) => c.publisher)
                .map((c) => c.company?.name || "")
                .filter(Boolean) || [],
        others:
            game.involved_companies
                ?.filter((c) => !c.developer && !c.publisher)
                .map((c) => c.company?.name || "")
                .filter(Boolean) || [],
    };

    if (
        !groupedCompanies.developers.length &&
        !groupedCompanies.publishers.length &&
        !groupedCompanies.others.length
    ) {
        return null;
    }

    const allCompanies = [
        ...groupedCompanies.developers.map((name) => ({
            name,
            role: "Developer",
        })),
        ...groupedCompanies.publishers.map((name) => ({
            name,
            role: "Publisher",
        })),
        ...groupedCompanies.others.map((name) => ({ name, role: "Other" })),
    ];

    return (
        <View style={styles.companiesList}>
            {allCompanies.map((company, index) => (
                <View key={index} style={styles.companyItem}>
                    <Text variant="body" style={styles.companyName}>
                        {company.name}
                    </Text>
                    <Text variant="body" style={styles.companyRole}>
                        {company.role}
                    </Text>
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    companiesList: {
        gap: 8,
    },
    companiesGrid: {
        gap: 12,
    },
    companyCard: {
        backgroundColor: colorSwatch.background.darkest,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colorSwatch.neutral.darkGray,
    },
    companyRole: {
        fontSize: 12,
        color: colorSwatch.accent.purple,
        marginBottom: 4,
    },
    companyName: {
        fontSize: 16,
        color: colorSwatch.neutral.lightGray,
        fontWeight: "500",
        flexWrap: "wrap",
    },
    companyItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: colorSwatch.background.darkest,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colorSwatch.neutral.darkGray,
    },
});

export default CompaniesSection;
