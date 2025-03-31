import {
    getQuestGamesByStatus,
    updateQuestGame,
    updateGamePriorities,
} from "../questGames";
import db from "../../config/database";
import { QuestGame } from "../../models/QuestGame";
import { GameStatus } from "src/constants/config/gameStatus";

jest.mock("../../config/database", () => ({
    getAllAsync: jest.fn(),
    execAsync: jest.fn(),
}));

describe("questGames repository", () => {
    const mockGame: Partial<QuestGame> = {
        id: 1,
        name: "Test Game",
        gameStatus: "ongoing" as GameStatus,
        priority: undefined,
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("getQuestGamesByStatus", () => {
        it("returns games for a given status", async () => {
            (db.getAllAsync as jest.Mock).mockResolvedValue([mockGame]);

            const games = await getQuestGamesByStatus("ongoing");

            expect(db.getAllAsync).toHaveBeenCalledWith(
                expect.stringContaining("WHERE qs.name = 'ongoing'")
            );
            expect(games).toHaveLength(1);
            expect(games[0]).toMatchObject(mockGame);
        });

        it("handles database errors", async () => {
            (db.getAllAsync as jest.Mock).mockRejectedValue(
                new Error("DB Error")
            );

            await expect(getQuestGamesByStatus("ongoing")).rejects.toThrow(
                "DB Error"
            );
        });
    });

    describe("updateQuestGame", () => {
        it("updates game status correctly", async () => {
            await updateQuestGame({
                id: 1,
                gameStatus: "completed",
            });

            expect(db.execAsync).toHaveBeenCalledWith(
                expect.stringContaining("UPDATE quest_games")
            );
            expect(db.execAsync).toHaveBeenCalledWith(
                expect.stringContaining("updatedAt = CURRENT_TIMESTAMP")
            );
        });

        it("updates game priority correctly", async () => {
            await updateQuestGame({
                id: 1,
                priority: 2,
            });

            expect(db.execAsync).toHaveBeenCalledWith(
                expect.stringContaining("priority = 2")
            );
        });

        it("handles database errors during update", async () => {
            (db.execAsync as jest.Mock).mockRejectedValue(
                new Error("DB Error")
            );

            await expect(
                updateQuestGame({ id: 1, gameStatus: "completed" })
            ).rejects.toThrow("DB Error");
        });
    });

    describe("updateGamePriorities", () => {
        const priorityUpdates = [
            { id: 1, priority: 1 },
            { id: 2, priority: 2 },
        ];

        it("updates multiple game priorities in a transaction", async () => {
            await updateGamePriorities(priorityUpdates);

            expect(db.execAsync).toHaveBeenCalledWith("BEGIN TRANSACTION");
            expect(db.execAsync).toHaveBeenCalledWith(
                expect.stringContaining("UPDATE quest_games")
            );
            expect(db.execAsync).toHaveBeenCalledWith("COMMIT");
        });

        it("rolls back transaction on error", async () => {
            (db.execAsync as jest.Mock)
                .mockResolvedValueOnce(undefined) // BEGIN TRANSACTION
                .mockRejectedValueOnce(new Error("DB Error")); // UPDATE

            await expect(updateGamePriorities(priorityUpdates)).rejects.toThrow(
                "DB Error"
            );

            expect(db.execAsync).toHaveBeenCalledWith("ROLLBACK");
        });
    });
});
