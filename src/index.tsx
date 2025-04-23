import React from "react";
import { registerRootComponent } from "expo";
import { View, StyleSheet } from "react-native";
import App from "./App";

// Wrap the App component with a View that has the background color
const RootComponent: React.FC = () => (
    <View style={globalStyles.root}>
        <App />
    </View>
);

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(RootComponent);

export const globalStyles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: "transparent",
    },
});
