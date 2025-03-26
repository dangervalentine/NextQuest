import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import "@testing-library/jest-native/extend-expect";
import GameSection from "../GameSection";
import { GameStatus } from "../../../../constants/gameStatus";
import { MinimalQuestGame } from "../../../../data/models/MinimalQuestGame";

describe("GameSection", () => {
    const mockGames: MinimalQuestGame[] = [
        {
            id: 1,
            name: "Test Game 1",
            gameStatus: "ongoing",
            updatedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            genres: [],
            release_dates: [],
            dateAdded: new Date().toISOString(),
        },
        {
            id: 2,
            name: "Test Game 2",
            gameStatus: "ongoing",
            updatedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            genres: [],
            release_dates: [],
            dateAdded: new Date().toISOString(),
        },
    ];

    const mockProps = {
        gameStatus: "ongoing" as GameStatus,
        games: mockGames,
        isLoading: false,
        onStatusChange: jest.fn(),
        onRemoveItem: jest.fn(),
        onReorder: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders correctly with games", () => {
        const { getByTestId, getAllByTestId } = render(
            <GameSection {...mockProps} />
        );

        expect(getByTestId("game-list")).toBeTruthy();
        expect(getAllByTestId(/game-item-/)).toHaveLength(2);
    });

    it("shows loading state", () => {
        const { getByTestId } = render(
            <GameSection {...mockProps} isLoading={true} />
        );

        expect(getByTestId("loading-indicator")).toBeTruthy();
    });

    it("shows empty state when no games", () => {
        const { getByTestId } = render(
            <GameSection {...mockProps} games={[]} />
        );

        expect(getByTestId("empty-state")).toBeTruthy();
    });

    it("handles game status change", () => {
        const { getByTestId } = render(<GameSection {...mockProps} />);

        const gameItem = getByTestId("game-item-1");
        fireEvent.press(gameItem);

        const statusButton = getByTestId("status-button-completed");
        fireEvent.press(statusButton);

        expect(mockProps.onStatusChange).toHaveBeenCalledWith(
            1,
            "completed",
            "ongoing"
        );
    });

    it("handles game removal", () => {
        const { getByTestId } = render(<GameSection {...mockProps} />);

        const removeButton = getByTestId("remove-button-1");
        fireEvent.press(removeButton);

        expect(mockProps.onRemoveItem).toHaveBeenCalledWith(1, "ongoing");
    });

    it("handles reordering in backlog", () => {
        const backlogProps = {
            ...mockProps,
            gameStatus: "backlog" as GameStatus,
            games: mockGames.map((game, index) => ({
                ...game,
                gameStatus: "backlog" as GameStatus,
                priority: index + 1,
            })),
        };

        const { getByTestId } = render(<GameSection {...backlogProps} />);
        expect(mockProps.onReorder).toHaveBeenCalledWith(0, 1, "backlog");
    });

    it("disables reordering for non-backlog sections", () => {
        const { getByTestId } = render(<GameSection {...mockProps} />);

        const gameList = getByTestId("game-list");
        expect(gameList.props.dragEnabled).toBeFalsy();
    });

    it("renders game items with correct status styles", () => {
        const { getAllByTestId } = render(<GameSection {...mockProps} />);

        const gameItems = getAllByTestId(/game-item-/);
        gameItems.forEach((item) => {
            expect(item).toHaveStyle({
                borderColor: expect.any(String),
            });
        });
    });

    it("renders with minimal game data structure", () => {
        const minimalGame: MinimalQuestGame = {
            id: 1,
            name: "Test Game",
            gameStatus: "ongoing",
            updatedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            genres: [],
            release_dates: [],
            dateAdded: new Date().toISOString(),
        };

        const { getByText, queryByTestId } = render(
            <GameSection {...mockProps} games={[minimalGame]} />
        );

        // Verify essential elements are rendered
        expect(getByText("Test Game")).toBeTruthy();
        expect(queryByTestId("game-item-1")).toBeTruthy();
    });
});
