import React, { forwardRef } from "react";
import { GameStatus } from "src/constants/config/gameStatus";
import { MinimalQuestGame } from "src/data/models/MinimalQuestGame";
import GameTabNavigator, {
    GameTabNavigatorRef,
} from "./GameList/components/GameTabNavigator";

interface GameTabsProps {
    gameData: Record<GameStatus, MinimalQuestGame[]>;
    isLoading: Record<GameStatus, boolean>;
    handleDiscover: (game: MinimalQuestGame, newStatus: GameStatus) => void;
    handleReorder: (
        fromIndex: number,
        toIndex: number,
        status: GameStatus
    ) => void;
    onTabChange: (tabName: string) => void;
}

const GameTabs = forwardRef<GameTabNavigatorRef, GameTabsProps>(
    (
        {
            gameData,
            isLoading,
            handleDiscover,
            handleReorder,
            onTabChange,
        },
        ref
    ) => {
        return (
            <GameTabNavigator
                ref={ref}
                gameData={gameData}
                isLoading={isLoading}
                handleDiscover={handleDiscover}
                handleReorder={handleReorder}
                onTabChange={onTabChange}
            />
        );
    }
);

export default GameTabs;
