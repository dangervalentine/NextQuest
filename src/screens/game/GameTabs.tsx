import React, { forwardRef } from "react";
import GameTabNavigator, {
    GameTabNavigatorRef,
} from "./GameList/components/GameTabNavigator";

interface GameTabsProps {
    onTabChange: (tabName: string) => void;
}

const GameTabs = forwardRef<GameTabNavigatorRef, GameTabsProps>(
    (
        {
            onTabChange,
        },
        ref
    ) => {
        return (
            <GameTabNavigator
                ref={ref}
                onTabChange={onTabChange}
            />
        );
    }
);

export default GameTabs;
