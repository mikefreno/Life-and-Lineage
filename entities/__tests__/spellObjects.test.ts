import { BeingType, Element, ItemClassType } from "@/utility/types";
import { Enemy } from "../creatures";
import { PlayerCharacter } from "../character";
import { runInAction } from "mobx";
import { Item } from "../item";

// Mock root object
const mockRoot = {
  gameTick: jest.fn(),
  enemyStore: {
    saveEnemy: jest.fn(),
    getAnimationStore: jest.fn().mockReturnValue({
      setDialogueString: jest.fn(),
      triggerDialogue: jest.fn(),
    }),
  },
  shopsStore: {
    getShop: jest.fn(),
  },
  dungeonStore: {
    currentInstance: null,
    currentLevel: null,
  },
  includeDevAttacks: false,
  addDevAction: jest.fn(),
};

describe("Spell Object Tests", () => {
  // Create a training dummy enemy for testing
  const createTrainingDummy = () => {
    return new Enemy({
      id: "dummy-id",
      beingType: "block o wood" as BeingType,
      creatureSpecies: "training dummy",
      currentHealth: 9999,
      baseHealth: 9999,
      currentSanity: null,
      baseSanity: null,
      attackPower: 0,
      currentEnergy: 30,
      baseEnergy: 30,
      energyRegen: 0,
      attackStrings: [],
      sprite: "training_dummy",
      drops: [
        {
          item: "stick",
          itemType: ItemClassType.Melee,
          chance: 1.0,
        },
        {
          item: "big stick",
          itemType: ItemClassType.Melee,
          chance: 0.85,
        },
      ],
      goldDropRange: {
        minimum: 0,
        maximum: 0,
      },
      root: mockRoot,
    });
  };

  // Create a base player character
  const createBasePlayer = (playerClass: string, blessing: Element) => {
    return new PlayerCharacter({
      id: "player-id",
      firstName: "Test",
      lastName: "Player",
      sex: "male",
      alive: true,
      job: "adventurer",
      qualifications: [],
      affection: 0,
      playerClass,
      blessing,
      baseHealth: 100,
      baseSanity: 100,
      baseMana: 100,
      baseManaRegen: 5,
      baseStrength: 10,
      baseIntelligence: 10,
      baseDexterity: 10,
      root: mockRoot,
    });
  };

  // Helper function to reset player stats between spell casts
  const resetPlayerStats = (player: PlayerCharacter) => {
    runInAction(() => {
      player.currentHealth = player.maxHealth;
      player.currentMana = player.maxMana;
      player.currentSanity = player.maxSanity;
      player.conditions = [];
    });
  };

  describe("Paladin Spells", () => {
    let paladin: PlayerCharacter;
    let dummy: Enemy;

    beforeEach(() => {
      paladin = createBasePlayer("paladin", Element.holy);
      dummy = createTrainingDummy();

      // Unlock all spells for testing
      runInAction(() => {
        paladin._unlockAllSpells();
      });

      // Reset player stats
      resetPlayerStats(paladin);
    });

    test("All paladin spells can be cast 100 times", () => {
      // Get all paladin spells
      const spells = paladin.spells;

      expect(spells.length).toBeGreaterThan(0);

      spells.forEach((spell) => {
        //console.log(`Testing paladin spell: ${spell.name}`);

        for (let i = 0; i < 100; i++) {
          // Reset player stats before each cast
          resetPlayerStats(paladin);

          // Cast the spell
          const result = spell.use({
            targets: [dummy],
            user: paladin,
          });

          // Verify the spell was cast successfully
          expect(result).toBeDefined();
          expect(result.logString).toBeDefined();
          expect(result.logString).not.toBe("The spell fizzles out");
        }
      });
    });

    test("Paladin holy spells apply healing and buffs correctly", () => {
      const holySpells = paladin.spells.filter(
        (spell) => spell.element === Element.holy,
      );

      holySpells.forEach((spell) => {
        // Reset player stats
        resetPlayerStats(paladin);

        // Damage the player to test healing
        runInAction(() => {
          paladin.currentHealth = paladin.maxHealth / 2;
        });

        // Cast the spell
        const result = spell.use({
          targets: [dummy],
          user: paladin,
        });

        // Check if healing was applied (if the spell has selfDamage < 0)
        if (spell.selfDamage < 0) {
          expect(paladin.currentHealth).toBeGreaterThan(paladin.maxHealth / 2);
        }

        // Check if buffs were applied
        if (spell.buffs.length > 0) {
          expect(paladin.conditions.length).toBeGreaterThan(0);
        }
      });
    });

    test("Paladin vengeance spells deal damage correctly", () => {
      const vengeanceSpells = paladin.spells.filter(
        (spell) => spell.element === Element.vengeance,
      );

      vengeanceSpells.forEach((spell) => {
        // Reset player stats
        resetPlayerStats(paladin);

        // Record dummy's health before
        const healthBefore = dummy.currentHealth;

        // Cast the spell
        const result = spell.use({
          targets: [dummy],
          user: paladin,
        });

        // Check if damage was dealt (if the spell has initDamage > 0)
        if (spell.initDamage > 0) {
          expect(dummy.currentHealth).toBeLessThan(healthBefore);
        }
      });
    });

    test("Paladin protection spells apply defensive buffs correctly", () => {
      const protectionSpells = paladin.spells.filter(
        (spell) => spell.element === Element.protection,
      );

      protectionSpells.forEach((spell) => {
        // Reset player stats
        resetPlayerStats(paladin);

        // Cast the spell
        const result = spell.use({
          targets: [dummy],
          user: paladin,
        });

        // Check if buffs were applied
        if (spell.buffs.length > 0) {
          expect(paladin.conditions.length).toBeGreaterThan(0);
        }
      });
    });
  });

  describe("Necromancer Spells", () => {
    let necromancer: PlayerCharacter;
    let dummy: Enemy;

    beforeEach(() => {
      necromancer = createBasePlayer("necromancer", Element.pestilence);
      dummy = createTrainingDummy();

      // Unlock all spells for testing
      runInAction(() => {
        necromancer._unlockAllSpells();
      });

      // Reset player stats
      resetPlayerStats(necromancer);
    });

    test("All necromancer spells can be cast 100 times", () => {
      // Get all necromancer spells
      const spells = necromancer.spells;

      expect(spells.length).toBeGreaterThan(0);

      spells.forEach((spell) => {
        //console.log(`Testing necromancer spell: ${spell.name}`);

        for (let i = 0; i < 100; i++) {
          // Reset player stats before each cast
          resetPlayerStats(necromancer);

          // Add blood orbs if needed for blood spells
          if (spell.buffs.includes("consume blood orb")) {
            // Add blood orb conditions
            runInAction(() => {
              for (
                let j = 0;
                j < spell.buffs.filter((b) => b === "consume blood orb").length;
                j++
              ) {
                necromancer.addCondition({
                  id: `blood-orb-${j}`,
                  name: "blood orb",
                  effect: ["blood magic consumable"],
                  turns: 5,
                  style: "buff",
                  placedby: necromancer.id,
                  on: necromancer,
                  tick: jest.fn().mockReturnValue({ turns: 4 }),
                });
              }
            });
          }

          // Cast the spell
          const result = spell.use({
            targets: [dummy],
            user: necromancer,
          });

          // Verify the spell was cast successfully
          expect(result).toBeDefined();
          expect(result.logString).toBeDefined();
          expect(result.logString).not.toBe("The spell fizzles out");
        }
      });
    });

    test("Necromancer blood spells manage blood orbs correctly", () => {
      const bloodSpells = necromancer.spells.filter(
        (spell) => spell.element === Element.blood,
      );

      bloodSpells.forEach((spell) => {
        // Reset player stats
        resetPlayerStats(necromancer);

        // Add blood orbs if needed
        if (spell.buffs.includes("consume blood orb")) {
          const orbsNeeded = spell.buffs.filter(
            (b) => b === "consume blood orb",
          ).length;

          runInAction(() => {
            for (let i = 0; i < orbsNeeded; i++) {
              necromancer.addCondition({
                id: `blood-orb-${i}`,
                name: "blood orb",
                effect: ["blood magic consumable"],
                turns: 5,
                style: "buff",
                placedby: necromancer.id,
                on: necromancer,
                tick: jest.fn().mockReturnValue({ turns: 4 }),
              });
            }
          });

          const orbsBefore = necromancer.bloodOrbCount;

          // Cast the spell
          const result = spell.use({
            targets: [dummy],
            user: necromancer,
          });

          // Check if blood orbs were consumed
          expect(necromancer.bloodOrbCount).toBe(orbsBefore - orbsNeeded);
        }

        // Check if spell generates blood orbs
        if (spell.buffs.includes("blood orb")) {
          const orbsBefore = necromancer.bloodOrbCount;

          // Cast the spell
          const result = spell.use({
            targets: [dummy],
            user: necromancer,
          });

          // Check if blood orbs were generated
          const orbsGenerated = spell.buffs.filter(
            (b) => b === "blood orb",
          ).length;
          expect(necromancer.bloodOrbCount).toBe(orbsBefore + orbsGenerated);
        }
      });
    });

    test("Necromancer summoning spells create minions correctly", () => {
      const summoningSpells = necromancer.spells.filter(
        (spell) => spell.element === Element.summoning,
      );

      summoningSpells.forEach((spell) => {
        // Reset player stats
        resetPlayerStats(necromancer);

        // Clear existing minions
        runInAction(() => {
          necromancer.clearMinions();
        });

        // Cast the spell
        const result = spell.use({
          targets: [dummy],
          user: necromancer,
        });

        // Check if minions were created
        if (spell.summons.length > 0) {
          expect(necromancer.minions.length).toBe(spell.summons.length);
        }
      });
    });

    test("Necromancer bone spells deal damage correctly", () => {
      const boneSpells = necromancer.spells.filter(
        (spell) => spell.element === Element.bone,
      );

      boneSpells.forEach((spell) => {
        // Reset player stats
        resetPlayerStats(necromancer);

        // Record dummy's health before
        const healthBefore = dummy.currentHealth;

        // Cast the spell
        const result = spell.use({
          targets: [dummy],
          user: necromancer,
        });

        // Check if damage was dealt (if the spell has initDamage > 0)
        if (spell.initDamage > 0) {
          expect(dummy.currentHealth).toBeLessThan(healthBefore);
        }
      });
    });

    test("Necromancer pestilence spells apply debuffs correctly", () => {
      const pestilenceSpells = necromancer.spells.filter(
        (spell) => spell.element === Element.pestilence,
      );

      pestilenceSpells.forEach((spell) => {
        // Reset player stats
        resetPlayerStats(necromancer);

        // Clear enemy conditions
        runInAction(() => {
          dummy.conditions = [];
        });

        // Cast the spell
        const result = spell.use({
          targets: [dummy],
          user: necromancer,
        });

        // Check if debuffs were applied
        if (spell.debuffs.length > 0) {
          expect(dummy.conditions.length).toBeGreaterThan(0);
        }
      });
    });
  });

  describe("Ranger Spells", () => {
    let ranger: PlayerCharacter;
    let dummy: Enemy;

    beforeEach(() => {
      ranger = createBasePlayer("ranger", Element.beastMastery);
      dummy = createTrainingDummy();

      // Unlock all spells for testing
      runInAction(() => {
        ranger._unlockAllSpells();
      });

      // Reset player stats
      resetPlayerStats(ranger);

      // Add a bow for bow-based spells
      runInAction(() => {
        ranger.equipment.mainHand = {
          id: "test-bow",
          name: "test bow",
          itemClass: "Bow",
          slot: "two-hand",
          stats: new Map([["PhysicalDamage", 10]]),
          attachedAttacks: [],
          equals: jest.fn().mockReturnValue(false),
          playerHasRequirements: true,
        } as any;
      });
    });

    test("All ranger spells can be cast 100 times", () => {
      // Get all ranger spells
      const spells = ranger.spells;

      expect(spells.length).toBeGreaterThan(0);

      spells.forEach((spell) => {
        //console.log(`Testing ranger spell: ${spell.name}`);

        for (let i = 0; i < 100; i++) {
          // Reset player stats before each cast
          resetPlayerStats(ranger);

          // Cast the spell
          const result = spell.use({
            targets: [dummy],
            user: ranger,
          });

          // Verify the spell was cast successfully
          expect(result).toBeDefined();
          expect(result.logString).toBeDefined();
          expect(result.logString).not.toBe("The spell fizzles out");
        }
      });
    });

    test("Ranger assassination spells deal damage and apply stealth correctly", () => {
      const testItem = Item.fromJSON({
        id: "test-blade",
        name: "test blade",
        itemClass: "Melee",
        slot: "one-hand",
        stats: new Map([["PhysicalDamage", 10]]),
        attachedAttacks: [],
        equals: jest.fn().mockReturnValue(false),
        playerHasRequirements: true,
      });
      ranger.equipItem([testItem], "main-hand");

      const assassinationSpells = ranger.spells.filter(
        (spell) => spell.element === Element.assassination,
      );

      assassinationSpells.forEach((spell) => {
        resetPlayerStats(ranger);

        const healthBefore = dummy.currentHealth;

        const result = spell.use({
          targets: [dummy],
          user: ranger,
        });
        if (spell.name == "poison blade") {
          console.log("result on poison blade: ", result);
        }

        if (spell.initDamage > 0) {
          try {
            expect(dummy.currentHealth).toBeLessThan(healthBefore);
          } catch (error) {
            console.error(
              `Failed on spell: ${spell.name} with initDamage: ${spell.initDamage}`,
            );
            console.error(
              `Health before: ${healthBefore}, Health after: ${dummy.currentHealth}`,
            );
            throw error;
          }
        }

        if (spell.buffs.includes("stealth")) {
          expect(ranger.isInStealth).toBe(true);
        }
      });
    });

    test("Ranger beast mastery spells summon pets correctly", () => {
      const beastMasterySpells = ranger.spells.filter(
        (spell) => spell.element === Element.beastMastery,
      );

      beastMasterySpells.forEach((spell) => {
        // Reset player stats
        resetPlayerStats(ranger);

        // Clear existing pets
        runInAction(() => {
          ranger.rangerPet = null;
        });

        // Cast the spell
        const result = spell.use({
          targets: [dummy],
          user: ranger,
        });

        // Check if pet was summoned
        if (spell.rangerPet) {
          expect(ranger.rangerPet).not.toBeNull();
        }
      });
    });

    test("Ranger arcane spells deal damage correctly with bow", () => {
      const arcaneSpells = ranger.spells.filter(
        (spell) => spell.element === Element.arcane,
      );

      arcaneSpells.forEach((spell) => {
        // Reset player stats
        resetPlayerStats(ranger);

        // Record dummy's health before
        const healthBefore = dummy.currentHealth;

        // Cast the spell
        const result = spell.use({
          targets: [dummy],
          user: ranger,
        });

        // Check if damage was dealt (if the spell has initDamage > 0)
        if (spell.initDamage > 0) {
          expect(dummy.currentHealth).toBeLessThan(healthBefore);
        }
      });
    });
  });

  describe("Mage Spells", () => {
    let mage: PlayerCharacter;
    let dummy: Enemy;

    beforeEach(() => {
      mage = createBasePlayer("mage", Element.fire);
      dummy = createTrainingDummy();

      // Unlock all spells for testing
      runInAction(() => {
        mage._unlockAllSpells();
      });

      // Reset player stats
      resetPlayerStats(mage);
    });

    test("All mage spells can be cast 100 times", () => {
      // Get all mage spells
      const spells = mage.spells;

      expect(spells.length).toBeGreaterThan(0);

      spells.forEach((spell) => {
        //console.log(`Testing mage spell: ${spell.name}`);

        for (let i = 0; i < 100; i++) {
          // Reset player stats before each cast
          resetPlayerStats(mage);

          // Cast the spell
          const result = spell.use({
            targets: [dummy],
            user: mage,
          });

          // Verify the spell was cast successfully
          expect(result).toBeDefined();
          expect(result.logString).toBeDefined();
          expect(result.logString).not.toBe("The spell fizzles out");
        }
      });
    });

    test("Mage fire spells deal damage correctly", () => {
      const fireSpells = mage.spells.filter(
        (spell) => spell.element === Element.fire,
      );

      fireSpells.forEach((spell) => {
        // Reset player stats
        resetPlayerStats(mage);

        // Record dummy's health before
        const healthBefore = dummy.currentHealth;

        // Cast the spell
        const result = spell.use({
          targets: [dummy],
          user: mage,
        });

        // Check if damage was dealt (if the spell has initDamage > 0)
        if (spell.initDamage > 0) {
          expect(dummy.currentHealth).toBeLessThan(healthBefore);
        }
      });
    });

    test("Mage water spells deal damage and apply healing correctly", () => {
      const waterSpells = mage.spells.filter(
        (spell) => spell.element === Element.water,
      );

      waterSpells.forEach((spell) => {
        // Reset player stats
        resetPlayerStats(mage);

        // Damage the player to test healing
        runInAction(() => {
          mage.currentHealth = mage.maxHealth / 2;
        });

        // Record dummy's health before
        const healthBefore = dummy.currentHealth;

        // Cast the spell
        const result = spell.use({
          targets: [dummy],
          user: mage,
        });

        // Check if damage was dealt (if the spell has initDamage > 0)
        if (spell.initDamage > 0) {
          expect(dummy.currentHealth).toBeLessThan(healthBefore);
        }

        // Check if healing was applied (if the spell has selfDamage < 0)
        if (spell.selfDamage < 0) {
          expect(mage.currentHealth).toBeGreaterThan(mage.maxHealth / 2);
        }
      });
    });

    test("Mage air spells deal damage correctly", () => {
      const airSpells = mage.spells.filter(
        (spell) => spell.element === Element.air,
      );

      airSpells.forEach((spell) => {
        // Reset player stats
        resetPlayerStats(mage);

        // Record dummy's health before
        const healthBefore = dummy.currentHealth;

        // Cast the spell
        const result = spell.use({
          targets: [dummy],
          user: mage,
        });

        // Check if damage was dealt (if the spell has initDamage > 0)
        if (spell.initDamage > 0) {
          expect(dummy.currentHealth).toBeLessThan(healthBefore);
        }
      });
    });

    test("Mage earth spells deal damage and apply defensive buffs correctly", () => {
      const earthSpells = mage.spells.filter(
        (spell) => spell.element === Element.earth,
      );

      earthSpells.forEach((spell) => {
        // Reset player stats
        resetPlayerStats(mage);

        // Record dummy's health before
        const healthBefore = dummy.currentHealth;

        // Cast the spell
        const result = spell.use({
          targets: [dummy],
          user: mage,
        });

        // Check if damage was dealt (if the spell has initDamage > 0)
        if (spell.initDamage > 0) {
          expect(dummy.currentHealth).toBeLessThan(healthBefore);
        }

        // Check if buffs were applied
        if (spell.buffs.length > 0) {
          expect(mage.conditions.length).toBeGreaterThan(0);
        }
      });
    });
  });

  describe("Spell Performance Tests", () => {
    test("Measure performance of casting all spells", () => {
      // Create players of each class
      const paladin = createBasePlayer("paladin", Element.holy);
      const necromancer = createBasePlayer("necromancer", Element.pestilence);
      const ranger = createBasePlayer("ranger", Element.beastMastery);
      const mage = createBasePlayer("mage", Element.fire);

      // Unlock all spells
      runInAction(() => {
        paladin._unlockAllSpells();
        necromancer._unlockAllSpells();
        ranger._unlockAllSpells();
        mage._unlockAllSpells();
      });

      // Add a bow for ranger
      runInAction(() => {
        ranger.equipment.mainHand = {
          id: "test-bow",
          name: "test bow",
          itemClass: "Bow",
          slot: "two-hand",
          stats: new Map([["PhysicalDamage", 10]]),
          attachedAttacks: [],
          equals: jest.fn().mockReturnValue(false),
          playerHasRequirements: true,
        } as any;
      });

      // Create a dummy
      const dummy = createTrainingDummy();

      // Test all spells for each class
      const players = [
        { player: paladin, name: "Paladin" },
        { player: necromancer, name: "Necromancer" },
        { player: ranger, name: "Ranger" },
        { player: mage, name: "Mage" },
      ];

      players.forEach(({ player, name }) => {
        //console.log(`Performance testing ${name} spells`);

        const spells = player.spells;

        spells.forEach((spell) => {
          // Reset player stats
          resetPlayerStats(player);

          // Add blood orbs for necromancer if needed
          if (
            name === "Necromancer" &&
            spell.buffs.includes("consume blood orb")
          ) {
            runInAction(() => {
              const orbsNeeded = spell.buffs.filter(
                (b) => b === "consume blood orb",
              ).length;
              for (let i = 0; i < orbsNeeded; i++) {
                player.addCondition({
                  id: `blood-orb-${i}`,
                  name: "blood orb",
                  effect: ["blood magic consumable"],
                  turns: 5,
                  style: "buff",
                  placedby: player.id,
                  on: player,
                  tick: jest.fn().mockReturnValue({ turns: 4 }),
                });
              }
            });
          }

          // Measure time to cast spell 100 times
          const startTime = performance.now();

          for (let i = 0; i < 100; i++) {
            spell.use({
              targets: [dummy],
              user: player,
            });

            // Reset player stats between casts
            resetPlayerStats(player);

            // Add blood orbs for necromancer if needed
            if (
              name === "Necromancer" &&
              spell.buffs.includes("consume blood orb")
            ) {
              runInAction(() => {
                const orbsNeeded = spell.buffs.filter(
                  (b) => b === "consume blood orb",
                ).length;
                for (let i = 0; i < orbsNeeded; i++) {
                  player.addCondition({
                    id: `blood-orb-${i}`,
                    name: "blood orb",
                    effect: ["blood magic consumable"],
                    turns: 5,
                    style: "buff",
                    placedby: player.id,
                    on: player,
                    tick: jest.fn().mockReturnValue({ turns: 4 }),
                  });
                }
              });
            }
          }

          const endTime = performance.now();
          const duration = endTime - startTime;

          //console.log(
          //`${spell.name}: ${duration.toFixed(2)}ms for 100 casts (${(
          //duration / 100
          //).toFixed(2)}ms per cast)`,
          //);
        });
      });
    });
  });
});
