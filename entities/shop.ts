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
} from "../utility/functions/misc";
import { ItemClassType, Personality } from "../utility/types";
import { RootStore } from "../stores/RootStore";
import { saveShop } from "../stores/ShopsStore";

interface ShopProps {
  baseGold: number;
  currentGold?: number;
  lastStockRefresh: Date;
  baseInventory?: Item[];
  shopKeeper: Character;
  archetype: string;
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
  lastStockRefresh: string;
  baseInventory: Item[];
  shopKeeper: Character;
  readonly archetype: string;
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
    this.lastStockRefresh =
      lastStockRefresh.toISOString() ?? new Date().toISOString();
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
      this.lastStockRefresh = new Date().toISOString();
      this.currentGold = this.baseGold;
    } else {
      throw new Error("Shop not found on refreshInventory()");
    }
  }

  get createGreeting() {
    const playerFullName = this.root.playerState?.fullName || "";
    if (this.shopKeeper.affection > 90) {
      const options = greetings[this.shopKeeper.personality!]["very warm"];
      const randIdx = Math.floor(Math.random() * options.length);
      return options[randIdx].replaceAll("%p", playerFullName);
    }
    if (this.shopKeeper.affection > 75) {
      const options = greetings[this.shopKeeper.personality!].warm;
      const randIdx = Math.floor(Math.random() * options.length);
      return options[randIdx].replaceAll("%p", playerFullName);
    }
    if (this.shopKeeper.affection > 50) {
      const options = greetings[this.shopKeeper.personality!].positive;
      const randIdx = Math.floor(Math.random() * options.length);
      return options[randIdx].replaceAll("%p", playerFullName);
    }
    if (this.shopKeeper.affection > 25) {
      const options =
        greetings[this.shopKeeper.personality!]["slightly positive"];
      const randIdx = Math.floor(Math.random() * options.length);
      return options[randIdx].replaceAll("%p", playerFullName);
    }
    const options = greetings[this.shopKeeper.personality!].neutral;
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
      const idx = this.baseInventory.findIndex((invItem) =>
        invItem.equals(item),
      );
      if (idx !== -1) {
        this.baseInventory.splice(idx, 1);
        soldCount++;
      }
    });

    const totalEarned = Math.floor(sellPrice) * soldCount;
    this.currentGold += totalEarned;

    const baseChange = (sellPrice / 500) * soldCount;
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

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const itemPrice = item.getSellPrice(this.shopKeeper.affection);
      if (this.currentGold >= itemPrice) {
        // Shop can afford to buy the item
        this.currentGold -= itemPrice;
        this.baseInventory.push(item);
        totalPrice += itemPrice;
        successfullySoldItems.push(item);
      }
    }

    if (successfullySoldItems.length > 0) {
      playerState.addGold(totalPrice);
      for (let i = 0; i < successfullySoldItems.length; i++) {
        const item = successfullySoldItems[i];
        for (let j = 0; j < playerState.baseInventory.length; j++) {
          if (playerState.baseInventory[j].equals(item)) {
            playerState.baseInventory.splice(j, 1);
            break;
          }
        }
      }

      const baseChange = (totalPrice / 500) * successfullySoldItems.length;
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
      lastStockRefresh: new Date(json.lastStockRefresh),
      archetype: json.archetype,
      baseInventory: json.baseInventory
        ? json.baseInventory.map((item: any) =>
            Item.fromJSON({ ...item, root: json.root }),
          )
        : [],
      root: json.root, //this is not actually stored
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

export function generateShopKeeper(archetype: string, root: RootStore) {
  const sex = rollD20() <= 12 ? "male" : "female";
  const name = getRandomName(sex);
  const birthdate = root.time.generateBirthDateInRange(25, 70);
  const job = toTitleCase(archetype);
  const shopObj = shops.find((obj) => obj.type == archetype);
  const randIdx = Math.floor(
    Math.random() * shopObj!.possiblePersonalities.length,
  );
  const personality = shopObj!.possiblePersonalities[randIdx];

  const newChar = new Character({
    sex: sex,
    firstName: name.firstName,
    lastName: name.lastName,
    birthdate: birthdate!,
    personality: personality as Personality,
    job: job,
    root,
  });
  return newChar;
}
