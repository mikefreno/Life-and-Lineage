import { Investment } from "../investment";
import { PlayerCharacter } from "../character";
import { InvestmentUpgrade } from "../../utility/types";
import { runInAction } from "mobx";

// Mock dependencies
jest.mock("../character");

const mockRootStore = {
  playerState: {
    changeBaseSanity: jest.fn(),
  },
};

describe("Investment", () => {
  let investment: Investment;
  let mockPlayer: jest.Mocked<PlayerCharacter>;

  beforeEach(() => {
    mockPlayer = new PlayerCharacter({
      root: mockRootStore,
    }) as jest.Mocked<PlayerCharacter>;

    investment = new Investment({
      name: "Test Investment",
      minimumReturn: 50,
      maximumReturn: 100,
      turnsPerRoll: 5,
      maxGoldStockPile: 1000,
      goldInvested: 500,
    });
  });

  describe("constructor", () => {
    it("should create investment with default values", () => {
      expect(investment.name).toBe("Test Investment");
      expect(investment.minimumReturn).toBe(50);
      expect(investment.maximumReturn).toBe(100);
      expect(investment.turnsPerRoll).toBe(5);
      expect(investment.turnsUntilNextRoll).toBe(5);
      expect(investment.maxGoldStockPile).toBe(1000);
      expect(investment.currentGoldStockPile).toBe(0);
      expect(investment.upgrades).toEqual([]);
      expect(investment.goldInvested).toBe(500);
    });

    it("should create investment with provided values", () => {
      const customInvestment = new Investment({
        name: "Custom Investment",
        minimumReturn: 100,
        maximumReturn: 200,
        turnsPerRoll: 10,
        turnsUntilNextRoll: 8,
        maxGoldStockPile: 2000,
        currentGoldStockPile: 500,
        upgrades: ["upgrade1"],
        goldInvested: 1000,
      });

      expect(customInvestment.turnsUntilNextRoll).toBe(8);
      expect(customInvestment.currentGoldStockPile).toBe(500);
      expect(customInvestment.upgrades).toEqual(["upgrade1"]);
    });
  });

  describe("turn", () => {
    it("should decrease turnsUntilNextRoll", () => {
      investment.turn();
      expect(investment.turnsUntilNextRoll).toBe(4);
    });

    it("should generate gold and reset timer when turnsUntilNextRoll reaches 0", () => {
      for (let i = 0; i < 5; i++) {
        investment.turn();
      }
      expect(investment.turnsUntilNextRoll).toBe(5);
      expect(investment.currentGoldStockPile).toBeGreaterThan(0);
      expect(investment.currentGoldStockPile).toBeLessThanOrEqual(
        investment.maxGoldStockPile,
      );
    });

    it("should not exceed maxGoldStockPile", () => {
      runInAction(() => {
        investment.currentGoldStockPile = investment.maxGoldStockPile;
      });

      for (let i = 0; i < 5; i++) {
        investment.turn();
      }

      expect(investment.currentGoldStockPile).toBe(investment.maxGoldStockPile);
    });
  });

  describe("collectGold", () => {
    it("should return current gold stockpile and reset it to 0", () => {
      runInAction(() => {
        investment.currentGoldStockPile = 500;
      });

      const collected = investment.collectGold();

      expect(collected).toBe(500);
      expect(investment.currentGoldStockPile).toBe(0);
    });
  });

  describe("addUpgrade", () => {
    let testUpgrade: InvestmentUpgrade;

    beforeEach(() => {
      testUpgrade = {
        name: "Test Upgrade",
        cost: 100,
        effect: {
          goldMinimumIncrease: 10,
          goldMaximumIncrease: 20,
          turnsPerRollChange: -1,
          maxGoldStockPileIncrease: 500,
          changeMaxSanity: 10,
        },
      };
    });

    it("should add upgrade to upgrades array", () => {
      investment.addUpgrade(testUpgrade, mockPlayer);
      expect(investment.upgrades).toContain(testUpgrade.name);
    });

    it("should increase gold invested", () => {
      investment.addUpgrade(testUpgrade, mockPlayer);
      expect(investment.goldInvested).toBe(600);
    });

    it("should apply minimum return increase", () => {
      const initialMinReturn = investment.minimumReturn;
      investment.addUpgrade(testUpgrade, mockPlayer);
      expect(investment.minimumReturn).toBe(initialMinReturn + 10);
    });

    it("should apply maximum return increase", () => {
      const initialMaxReturn = investment.maximumReturn;
      investment.addUpgrade(testUpgrade, mockPlayer);
      expect(investment.maximumReturn).toBe(initialMaxReturn + 20);
    });

    it("should apply turns per roll change", () => {
      const initialTurnsPerRoll = investment.turnsPerRoll;
      investment.addUpgrade(testUpgrade, mockPlayer);
      expect(investment.turnsPerRoll).toBe(initialTurnsPerRoll - 1);
    });

    it("should apply max gold stockpile increase", () => {
      const initialMaxStockpile = investment.maxGoldStockPile;
      investment.addUpgrade(testUpgrade, mockPlayer);
      expect(investment.maxGoldStockPile).toBe(initialMaxStockpile + 500);
    });

    it("should apply sanity change to player", () => {
      investment.addUpgrade(testUpgrade, mockPlayer);
      expect(mockPlayer.changeBaseSanity).toHaveBeenCalledWith(10);
    });
  });

  describe("getGoldRoll", () => {
    it("should return a value between minimumReturn and maximumReturn", () => {
      const roll = investment["getGoldRoll"]();
      expect(roll).toBeGreaterThanOrEqual(investment.minimumReturn);
      expect(roll).toBeLessThanOrEqual(investment.maximumReturn);
    });
  });

  describe("fromJSON", () => {
    it("should create an investment from JSON data", () => {
      const jsonData = {
        name: "JSON Investment",
        minimumReturn: 75,
        maximumReturn: 150,
        turnsPerRoll: 7,
        turnsUntilNextRoll: 3,
        maxGoldStockPile: 1500,
        currentGoldStockPile: 300,
        upgrades: ["upgrade1", "upgrade2"],
        goldInvested: 750,
      };

      const fromJsonInvestment = Investment.fromJSON(jsonData);

      expect(fromJsonInvestment.name).toBe(jsonData.name);
      expect(fromJsonInvestment.minimumReturn).toBe(jsonData.minimumReturn);
      expect(fromJsonInvestment.maximumReturn).toBe(jsonData.maximumReturn);
      expect(fromJsonInvestment.turnsPerRoll).toBe(jsonData.turnsPerRoll);
      expect(fromJsonInvestment.turnsUntilNextRoll).toBe(
        jsonData.turnsUntilNextRoll,
      );
      expect(fromJsonInvestment.maxGoldStockPile).toBe(
        jsonData.maxGoldStockPile,
      );
      expect(fromJsonInvestment.currentGoldStockPile).toBe(
        jsonData.currentGoldStockPile,
      );
      expect(fromJsonInvestment.upgrades).toEqual(jsonData.upgrades);
      expect(fromJsonInvestment.goldInvested).toBe(jsonData.goldInvested);
    });
  });
});
