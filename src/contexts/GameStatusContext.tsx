import React, { createContext, useContext, useState } from "react";
import { GameStatus } from "../constants/config/gameStatus";

interface GameStatusContextType {
    activeStatus: GameStatus | undefined;
    setActiveStatus: (status: GameStatus | undefined) => void;
}

const GameStatusContext = createContext<GameStatusContextType>({
    activeStatus: undefined,
    setActiveStatus: () => {},
});

export const GameStatusProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [activeStatus, setActiveStatus] = useState<GameStatus | undefined>(
        undefined
    );
    const [isInitialized, setInitialized] = useState(false);

    return (
        <GameStatusContext.Provider
            value={{
                activeStatus,
                setActiveStatus,
            }}
        >
            {children}
        </GameStatusContext.Provider>
    );
};

export const useGameStatus = () => {
    const context = useContext(GameStatusContext);
    if (context === undefined) {
        throw new Error(
            "useGameStatus must be used within a GameStatusProvider"
        );
    }
    return context;
};
