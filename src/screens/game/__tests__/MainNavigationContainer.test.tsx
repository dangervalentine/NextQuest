import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import MainNavigationContainer from "../GameListNavigationContainer";
import {
    getQuestGamesByStatus,
    updateQuestGame,
    updateGamePriorities,
} from "../../data/repositories/questGames";
import { GameStatus } from "../../constants/gameStatus";

// Mock the repositories
jest.mock("../../data/repositories/questGames");
jest.mock("../../data/repositories/igdbGames");

// Mock the navigation
jest.mock("@react-navigation/bottom-tabs", () => ({
    createBottomTabNavigator: () => ({
        Navigator: ({ children }: any) => children,
        Screen: ({ children }: any) => children,
    }),
}));

describe("MainNavigationContainer", () => {
    const mockGames = [
        {
            id: 1,
            name: "Test Game 1",
            gameStatus: "ongoing" as GameStatus,
            updatedAt: "2024-01-01T00:00:00.000Z",
            priority: undefined,
        },
        {
            id: 2,
            name: "Test Game 2",
            gameStatus: "backlog" as GameStatus,
            updatedAt: "2024-01-02T00:00:00.000Z",
            priority: 1,
        },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        (getQuestGamesByStatus as jest.Mock).mockResolvedValue(mockGames);
        (updateQuestGame as jest.Mock).mockResolvedValue(undefined);
        (updateGamePriorities as jest.Mock).mockResolvedValue(undefined);
    });

    it("loads initial game data on mount", async () => {
        render(<MainNavigationContainer />);

        await waitFor(() => {
            expect(getQuestGamesByStatus).toHaveBeenCalledWith("ongoing");
            expect(getQuestGamesByStatus).toHaveBeenCalledWith("backlog");
            expect(getQuestGamesByStatus).toHaveBeenCalledWith("completed");
        });
    });

    it("sorts games correctly by priority and updatedAt", async () => {
        const { getByTestId } = render(<MainNavigationContainer />);

        await waitFor(() => {
            const gameList = getByTestId("game-list");
            const games = gameList.props.data;

            // For backlog games, check priority sorting
            const backlogGames = games.filter(
                (g: any) => g.gameStatus === "backlog"
            );
            expect(backlogGames[0].priority).toBeLessThanOrEqual(
                backlogGames[1]?.priority || Infinity
            );

            // For non-backlog games, check updatedAt sorting
            const ongoingGames = games.filter(
                (g: any) => g.gameStatus === "ongoing"
            );
            if (ongoingGames.length > 1) {
                const dates = ongoingGames.map((g: any) =>
                    new Date(g.updatedAt).getTime()
                );
                expect(dates[0]).toBeLessThanOrEqual(dates[1]);
            }
        });
    });

    it("handles game status changes correctly", async () => {
        const { getByTestId } = render(<MainNavigationContainer />);

        await waitFor(() => {
            const gameItem = getByTestId("game-item-1");
            fireEvent.press(gameItem);
        });

        const statusButton = getByTestId("status-button-completed");
        fireEvent.press(statusButton);

        await waitFor(() => {
            expect(updateQuestGame).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: 1,
                    gameStatus: "completed",
                    priority: undefined,
                })
            );
        });
    });

    it("handles backlog priority updates correctly", async () => {
        const { getByTestId } = render(<MainNavigationContainer />);

        // Simulate reordering in backlog
        await waitFor(() => {
            const backlogList = getByTestId("backlog-list");
            fireEvent(backlogList, "onDragEnd", {
                data: {
                    from: 0,
                    to: 1,
                },
            });
        });

        await waitFor(() => {
            expect(updateGamePriorities).toHaveBeenCalledWith(
                expect.arrayContaining([
                    expect.objectContaining({
                        id: expect.any(Number),
                        priority: expect.any(Number),
                    }),
                ])
            );
        });
    });

    it("handles errors during data loading", async () => {
        const consoleError = jest
            .spyOn(console, "error")
            .mockImplementation(() => {});
        (getQuestGamesByStatus as jest.Mock).mockRejectedValue(
            new Error("Test error")
        );

        render(<MainNavigationContainer />);

        await waitFor(() => {
            expect(consoleError).toHaveBeenCalled();
        });

        consoleError.mockRestore();
    });
});








