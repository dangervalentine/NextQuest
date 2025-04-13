import React from "react";
import { GameStatus } from "src/constants/config/gameStatus";
import { MinimalQuestGame } from "src/data/models/MinimalQuestGame";
import GameTabNavigator from "./GameList/components/GameTabNavigator";

interface GameTabsProps {
    gameData: Record<GameStatus, MinimalQuestGame[]>;
    isLoading: Record<GameStatus, boolean>;
    handleStatusChange: (
        id: number,
        newStatus: GameStatus,
        currentStatus: GameStatus
    ) => void;
    handleDiscover: (game: MinimalQuestGame, newStatus: GameStatus) => void;
    handleRemoveItem: (itemId: number, status: GameStatus) => void;
    handleReorder: (
        fromIndex: number,
        toIndex: number,
        status: GameStatus
    ) => void;
    onTabChange: (tabName: string) => void;
}

const GameTabs: React.FC<GameTabsProps> = ({
    gameData,
    isLoading,
    handleStatusChange,
    handleDiscover,
    handleRemoveItem,
    handleReorder,
    onTabChange,
}) => {
    return (
        <GameTabNavigator
            gameData={gameData}
            isLoading={isLoading}
            handleStatusChange={handleStatusChange}
            handleDiscover={handleDiscover}
            handleRemoveItem={handleRemoveItem}
            handleReorder={handleReorder}
            onTabChange={onTabChange}
        />
    );
};

export default GameTabs;
