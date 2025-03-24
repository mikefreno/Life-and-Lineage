import { Item, isStackable } from "./item";
import shops from "../assets/json/shops.json";
import greetings from "../assets/json/shopLines.json";
import { action, computed, makeObservable, observable, reaction } from "mobx";
import { Character, PlayerCharacter } from "./character";
import {
  getRandomName,
  toTitleCase,
  rollD20,
  getItemJSONMap,
  getClassSpecificBookList,
  getNPCBaseCombatStats,
} from "../utility/functions/misc";
import { ItemClassType, MerchantType, Personality } from "../utility/types";
import { RootStore } from "../stores/RootStore";
import { saveShop } from "../stores/ShopsStore";

interface ShopProps {
  baseGold: number;
  currentGold?: number;
  lastStockRefresh: {
    year: number;
    week: number;
  };
  baseInventory?: Item[];
  shopKeeper: Character;
  archetype: MerchantType;
  root: RootStore;
}
const MAX_AFFECTION = 100;

/**
 * At game start, all Shops are created, they will not be created again, in any sense. The `shopKeeper` like all `Character`'s
 * can die and this will be replaced. Base gold and archetype (e.g. armorer, weaponsmith) are never changed
 */
export class Shop {
  readonly baseGold: number;
  currentGold: number;
  lastStockRefresh: {
    year: number;
    week: number;
  };
  baseInventory: Item[];
  shopKeeper: Character;
  readonly archetype: MerchantType;
  root: RootStore;

  constructor({
    baseGold,
    currentGold,
    lastStockRefresh,
    baseInventory,
    shopKeeper,
    archetype,
    root,
  }: ShopProps) {
    this.baseGold = baseGold;
    this.currentGold = currentGold ?? baseGold;
    this.lastStockRefresh = lastStockRefresh ?? root.time.currentDate;
    this.baseInventory = baseInventory ?? [];
    this.archetype = archetype;
    this.shopKeeper = shopKeeper;
    this.root = root;

    makeObservable(this, {
      shopKeeper: observable,
      baseGold: observable,
      currentGold: observable,
      lastStockRefresh: observable,
      refreshInventory: action,
      buyItem: action,
      sellItem: action,
      deathCheck: action,
      createGreeting: computed,
      purchaseStack: action,
      addGold: action,
      setGold: action,
    });

    reaction(
      () => [this.currentGold, this.shopKeeper.affection],
      () => {
        saveShop(this);
      },
    );
  }

  public addGold(amount: number) {
    this.currentGold += amount;
  }

  public setGold(amount: number) {
    if (__DEV__) {
      this.currentGold = amount;
    }
  }

  public deathCheck() {
    if (this.shopKeeper.deathdate) {
      const shopObj = shops.find((shop) => shop.type == this.archetype);
      if (!shopObj) throw new Error(`missing ${this.archetype} in json`);
      this.shopKeeper = generateShopKeeper(shopObj.type, this.root);
    }
  }

  public refreshInventory() {
    const shopObj = shops.find((shop) => shop.type == this.archetype);
    if (shopObj) {
      const newCount = getRandomInt(
        shopObj.itemQuantityRange.minimum,
        shopObj.itemQuantityRange.maximum,
      );
      this.baseInventory = generateInventory(
        newCount,
        shopObj.trades as ItemClassType[],
        this.root.playerState!,
      );
      this.lastStockRefresh = this.root.time.currentDate;
      this.currentGold = this.baseGold;
    } else {
      throw new Error("Shop not found on refreshInventory()");
    }
  }

  get createGreeting() {
    const playerFullName = this.root.playerState?.fullName || "";
    const personality = this.shopKeeper.personality || "wise";

    if (!greetings[personality]) {
      throw new Error(`No greetings defined for personality: ${personality}`);
    }

    let options;
    if (this.shopKeeper.affection > 90) {
      options = greetings[personality]["very warm"];
    } else if (this.shopKeeper.affection > 75) {
      options = greetings[personality].warm;
    } else if (this.shopKeeper.affection > 50) {
      options = greetings[personality].positive;
    } else if (this.shopKeeper.affection > 25) {
      options = greetings[personality]["slightly positive"];
    } else {
      options = greetings[personality].neutral;
    }

    if (!options || options.length === 0) {
      throw new Error(
        `No greeting options for affection level with personality: ${personality}`,
      );
    }

    const randIdx = Math.floor(Math.random() * options.length);
    return options[randIdx].replaceAll("%p", playerFullName);
  }

  public changeAffection(change: number) {
    const currentAffection = this.shopKeeper.affection;

    if (change === 0) return;
    if (change > 0 && currentAffection >= MAX_AFFECTION) return;

    const growthFactor =
      1 - (Math.max(0, currentAffection) / MAX_AFFECTION) ** 1.5;
    const adjustedChange = Math.floor(change * growthFactor * 4) / 4;

    this.shopKeeper.updateAffection(adjustedChange);
  }

  public buyItem(itemOrItems: Item | Item[], buyPrice: number) {
    const items = Array.isArray(itemOrItems) ? itemOrItems : [itemOrItems];
    const totalCost = items.length * Math.floor(buyPrice);

    if (totalCost <= this.currentGold) {
      items.forEach((item) => {
        this.baseInventory.push(item);
      });
      this.currentGold -= totalCost;

      const baseChange = (totalCost / 500) * items.length;
      const cappedChange = Math.min(baseChange, 20);
      this.changeAffection(cappedChange);
    } else {
      throw new Error("Not enough gold to complete the purchase");
    }
  }

  public sellItem(itemOrItems: Item | Item[], sellPrice: number) {
    const items = Array.isArray(itemOrItems) ? itemOrItems : [itemOrItems];
    let soldCount = 0;

    items.forEach((item) => {
      const idx = this.baseInventory.findIndex(
        (invItem) => item.id === invItem.id,
      );
      if (idx !== -1) {
        this.baseInventory.splice(idx, 1);
        soldCount++;
      }
    });

    const totalEarned = Math.floor(sellPrice * soldCount);
    this.currentGold += totalEarned;

    const baseChange = totalEarned / 500;
    const cappedChange = Math.min(baseChange, 20);
    this.changeAffection(cappedChange);
  }

  public purchaseStack(items: Item[]) {
    const playerState = this.root.playerState;
    if (!playerState) {
      throw new Error("Player state is not available");
    }

    let totalPrice = 0;
    const successfullySoldItems: Item[] = [];

    for (const item of items) {
      const itemPrice = item.getSellPrice(this.shopKeeper.affection);
      if (this.currentGold >= itemPrice) {
        this.currentGold -= itemPrice;
        totalPrice += itemPrice;
        successfullySoldItems.push(item);
      } else {
        break;
      }
    }

    if (successfullySoldItems.length > 0) {
      playerState.addGold(totalPrice);

      successfullySoldItems.forEach((item) => {
        const index = playerState.baseInventory.findIndex(
          (invItem) => invItem.id === item.id,
        );
        if (index !== -1) {
          playerState.baseInventory.splice(index, 1);
        }
        this.baseInventory.push(item);
      });

      const baseChange = totalPrice / 500;
      const cappedChange = Math.min(baseChange, 20);
      this.changeAffection(cappedChange);
    }

    return successfullySoldItems.length;
  }

  get inventory() {
    const condensedInventory: { item: Item[] }[] = [];
    this.baseInventory.forEach((item) => {
      if (item.stackable) {
        let found = false;
        condensedInventory.forEach((entry) => {
          if (entry.item[0].name == item.name) {
            found = true;
            entry.item.push(item);
          }
        });
        if (!found) {
          condensedInventory.push({ item: [item] });
        }
      } else {
        condensedInventory.push({ item: [item] });
      }
    });
    return condensedInventory;
  }

  static fromJSON(json: any): Shop {
    const shop = new Shop({
      shopKeeper: Character.fromJSON({ ...json.shopKeeper, root: json.root }),
      baseGold: json.baseGold,
      currentGold: json.currentGold,
      lastStockRefresh: json.lastStockRefresh,
      archetype: json.archetype,
      baseInventory: json.baseInventory
        ? json.baseInventory.map((item: any) =>
            Item.fromJSON({ ...item, root: json.root }),
          )
        : [],
      root: json.root,
    });
    return shop;
  }
}

//----------------------associated functions----------------------//

export function generateInventory(
  inventoryCount: number,
  trades: ItemClassType[],
  player: PlayerCharacter,
): Item[] {
  const itemJSONMap = getItemJSONMap(player.playerClass);
  const tradesLength = trades.length;
  let items: Item[] = [];

  if (trades.includes(ItemClassType.Book)) {
    const classBooks = getClassSpecificBookList(player.playerClass);
    const noviceBooks = classBooks.filter((book) => book.baseValue === 2500);
    const missingNoviceBooks = noviceBooks.filter(
      (book) =>
        !(
          player.knownSpells.includes(book.teaches) &&
          player.baseInventory.find((item) => item.name == book.name)
        ),
    );

    items = missingNoviceBooks.map((book) =>
      Item.fromJSON({
        ...book,
        itemClass: ItemClassType.Book,
        stackable: isStackable(ItemClassType.Book),
        root: player.root,
      }),
    );
  }

  // Precalculate player stats
  const playerStats = {
    strength: player.nonConditionalStrength,
    intelligence: player.nonConditionalIntelligence,
    dexterity: player.nonConditionalDexterity,
  };

  for (let i = 0; i < inventoryCount; i++) {
    const type = trades[Math.floor(Math.random() * tradesLength)];

    if (!(type in itemJSONMap)) {
      throw new Error(`Invalid type in trades array: ${type}`);
    }

    const typeItems = itemJSONMap[type];
    const weightedItems = createWeightedItems(typeItems, playerStats);

    const selectedItem =
      weightedItems[Math.floor(Math.random() * weightedItems.length)];

    items.push(
      Item.fromJSON({
        ...selectedItem,
        itemClass: type,
        stackable: isStackable(type),
        root: player.root,
      }),
    );
  }

  return items;
}

function createWeightedItems(
  items: any[],
  playerStats: { strength: number; intelligence: number; dexterity: number },
): any[] {
  const weightedItems: any[] = [];
  const usableWeight = 3;

  for (const item of items) {
    const weight = isItemUsableByPlayerWithStats(item, playerStats)
      ? usableWeight
      : 1;
    for (let i = 0; i < weight; i++) {
      weightedItems.push(item);
    }
  }

  return weightedItems;
}

function isItemUsableByPlayerWithStats(
  item: any,
  stats: { strength: number; intelligence: number; dexterity: number },
): boolean {
  if (!item.requirements) return true;

  const reqs = item.requirements;
  return (
    (!reqs.strength || stats.strength >= reqs.strength) &&
    (!reqs.intelligence || stats.intelligence >= reqs.intelligence) &&
    (!reqs.dexterity || stats.dexterity >= reqs.dexterity)
  );
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateShopKeeper(
  archetype: string,
  root: RootStore,
  existingShopkeepers: Map<string, Personality> = new Map(),
) {
  const sex = Math.random() < 0.7 ? "male" : "female";
  const name = getRandomName(sex);
  const birthdate = root.time.generateBirthDateInRange(25, 70);
  const job = toTitleCase(archetype);
  const shopObj = shops.find((obj) => obj.type == archetype);

  // Get existing personalities with their sexes
  const existingPersonalitiesBySex = new Map<string, Personality[]>();
  existingPersonalitiesBySex.set("male", []);
  existingPersonalitiesBySex.set("female", []);

  // Populate the map with existing personalities by sex
  for (const [_, personality] of existingShopkeepers.entries()) {
    // We need to find the sex of this shopkeeper
    // Since we don't have direct access to the sex from the map,
    // we'll need to check all characters in the character store
    const characters = Array.from(root.characterStore.characters.values());
    for (const character of characters) {
      if (character.personality === personality) {
        const charSex = character.sex as "male" | "female";
        const existingForSex = existingPersonalitiesBySex.get(charSex) || [];
        if (!existingForSex.includes(personality)) {
          existingForSex.push(personality);
          existingPersonalitiesBySex.set(charSex, existingForSex);
        }
      }
    }
  }

  // Get all personalities that are invalid based on existing shopkeepers
  const invalidPersonalities = new Set<Personality>();
  const existingForCurrentSex = existingPersonalitiesBySex.get(sex) || [];

  // Check each existing personality for the current sex
  for (const existingPersonality of existingForCurrentSex) {
    // Add the existing personality itself to invalid list (no duplicates)
    invalidPersonalities.add(existingPersonality);

    // Add all personalities that are excluded by this existing personality
    const exclusions = exclusionMapping[sex][existingPersonality] || [];
    for (const excluded of exclusions) {
      invalidPersonalities.add(excluded);
    }

    // Also check if any existing personality would be excluded by a potential new personality
    for (const potential of Object.values(Personality)) {
      const potentialExclusions = exclusionMapping[sex][potential] || [];
      if (potentialExclusions.includes(existingPersonality)) {
        invalidPersonalities.add(potential);
      }
    }
  }

  // Get all possible personalities for this shop type
  let possiblePersonalities = shopObj!.possiblePersonalities as Personality[];

  // Filter out invalid personalities
  let validPersonalities = possiblePersonalities.filter(
    (p) => !invalidPersonalities.has(p),
  );

  // Fallback if no valid personalities remain
  if (validPersonalities.length === 0) {
    // Try using any non-invalid personality
    validPersonalities = Object.values(Personality).filter(
      (p) => !invalidPersonalities.has(p),
    ) as Personality[];
  }

  // Last resort - use any personality
  if (validPersonalities.length === 0) {
    validPersonalities = Object.values(Personality) as Personality[];
    console.warn(
      `No valid personalities found for ${archetype}, using any available`,
    );
  }

  // Select a random personality from valid options
  const personality =
    validPersonalities[Math.floor(Math.random() * validPersonalities.length)];

  const newChar = new Character({
    beingType: "human",
    sex: sex,
    firstName: name.firstName,
    lastName: name.lastName,
    birthdate: birthdate!,
    personality: personality,
    job: job,
    root,
    ...getNPCBaseCombatStats(),
  });

  return newChar;
}

export const exclusionMapping: Record<
  "male" | "female",
  Record<Personality, Personality[]>
> = {
  female: {
    [Personality.AGGRESSIVE]: [Personality.ARROGANT],
    [Personality.ARROGANT]: [Personality.AGGRESSIVE, Personality.INSANE],
    [Personality.CALM]: [Personality.OPEN, Personality.SILENT],
    [Personality.CREEPY]: [],
    [Personality.INCREDULOUS]: [Personality.RESERVED],
    [Personality.INSANE]: [Personality.ARROGANT],
    [Personality.JOVIAL]: [],
    [Personality.OPEN]: [Personality.CALM, Personality.RESERVED],
    [Personality.RESERVED]: [Personality.OPEN, Personality.INCREDULOUS],
    [Personality.SILENT]: [Personality.CALM],
    [Personality.WISE]: [],
  },
  male: {
    [Personality.AGGRESSIVE]: [Personality.OPEN, Personality.INCREDULOUS],
    [Personality.ARROGANT]: [Personality.OPEN],
    [Personality.CALM]: [Personality.OPEN],
    [Personality.CREEPY]: [Personality.INSANE, Personality.SILENT],
    [Personality.INCREDULOUS]: [Personality.AGGRESSIVE],
    [Personality.INSANE]: [Personality.SILENT, Personality.CREEPY],
    [Personality.JOVIAL]: [],
    [Personality.OPEN]: [
      Personality.ARROGANT,
      Personality.CALM,
      Personality.AGGRESSIVE,
    ],
    [Personality.RESERVED]: [Personality.WISE],
    [Personality.SILENT]: [Personality.CREEPY, Personality.INSANE],
    [Personality.WISE]: [Personality.RESERVED],
  },
};
