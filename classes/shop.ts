import { Item, isStackable } from "./item";
import shops from "../assets/json/shops.json";
import arrows from "../assets/json/items/arrows.json";
import artifacts from "../assets/json/items/artifacts.json";
import bodyArmor from "../assets/json/items/bodyArmor.json";
import bows from "../assets/json/items/bows.json";
import mageBooks from "../assets/json/items/mageBooks.json";
import necroBooks from "../assets/json/items/necroBooks.json";
import paladinBooks from "../assets/json/items/paladinBooks.json";
import rangerBooks from "../assets/json/items/rangerBooks.json";
import foci from "../assets/json/items/foci.json";
import hats from "../assets/json/items/hats.json";
import helmets from "../assets/json/items/helmets.json";
import ingredients from "../assets/json/items/ingredients.json";
import junk from "../assets/json/items/junk.json";
import poison from "../assets/json/items/poison.json";
import potions from "../assets/json/items/potions.json";
import robes from "../assets/json/items/robes.json";
import shields from "../assets/json/items/shields.json";
import staves from "../assets/json/items/staves.json";
import wands from "../assets/json/items/wands.json";
import weapons from "../assets/json/items/weapons.json";
import { action, makeObservable, observable } from "mobx";
import { Character } from "./character";
import { rollD20 } from "../utility/functions/roll";
import { getRandomName, toTitleCase } from "../utility/functions/misc/words";
import { generateBirthday } from "../utility/functions/misc/age";
import { ItemClassType } from "../utility/types";

interface ShopProps {
  baseGold: number;
  currentGold?: number;
  lastStockRefresh: Date;
  inventory?: Item[];
  shopKeeper: Character;
  archetype: string;
}

export class Shop {
  baseGold: number;
  currentGold: number;
  lastStockRefresh: string;
  inventory: Item[];
  shopKeeper: Character;
  readonly archetype: string;

  constructor({
    baseGold,
    currentGold,
    lastStockRefresh,
    inventory,
    shopKeeper,
    archetype,
  }: ShopProps) {
    this.baseGold = baseGold;
    this.currentGold = currentGold ?? baseGold;
    this.lastStockRefresh =
      lastStockRefresh.toISOString() ?? new Date().toISOString();
    this.inventory = inventory ?? [];
    this.archetype = archetype;
    this.shopKeeper = shopKeeper;
    makeObservable(this, {
      shopKeeper: observable,
      baseGold: observable,
      currentGold: observable,
      lastStockRefresh: observable,
      refreshInventory: action,
      buyItem: action,
      sellItem: action,
    });
  }

  public refreshInventory(playerClass: "mage" | "necromancer" | "paladin") {
    const shopObj = shops.find((shop) => shop.type == this.archetype);
    if (shopObj) {
      const newCount = getRandomInt(
        shopObj.itemQuantityRange.minimum,
        shopObj.itemQuantityRange.maximum,
      );
      this.inventory = generateInventory(newCount, shopObj.trades, playerClass);
      this.lastStockRefresh = new Date().toISOString();
      this.currentGold = this.baseGold;
    } else {
      throw new Error("Shop not found on refreshInventory()");
    }
  }

  private changeAffection(change: number) {
    this.shopKeeper.affection += Math.floor(change * 4) / 4;
  }

  public buyItem(itemOrItems: Item | Item[], buyPrice: number) {
    const items = Array.isArray(itemOrItems) ? itemOrItems : [itemOrItems];
    const totalCost = items.length * Math.floor(buyPrice);

    if (totalCost <= this.currentGold) {
      items.forEach((item) => {
        this.inventory.push(item);
      });
      this.currentGold -= totalCost;
      this.changeAffection((totalCost / 1000) * items.length);
    } else {
      throw new Error("Not enough gold to complete the purchase");
    }
  }

  public sellItem(itemOrItems: Item | Item[], sellPrice: number) {
    const items = Array.isArray(itemOrItems) ? itemOrItems : [itemOrItems];
    let soldCount = 0;

    items.forEach((item) => {
      const idx = this.inventory.findIndex((invItem) => invItem.equals(item));
      if (idx !== -1) {
        this.inventory.splice(idx, 1);
        soldCount++;
      }
    });

    const totalEarned = Math.floor(sellPrice) * soldCount;
    this.currentGold += totalEarned;
    this.changeAffection((sellPrice / 1000) * soldCount);

    if (soldCount < items.length) {
      console.warn(
        `Only ${soldCount} out of ${items.length} items were found and sold.`,
      );
    }
  }

  public getInventory() {
    const condensedInventory: { item: Item[] }[] = [];
    this.inventory.forEach((item) => {
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
    return new Shop({
      shopKeeper: Character.fromJSON(json.shopKeeper),
      baseGold: json.baseGold,
      currentGold: json.currentGold,
      lastStockRefresh: new Date(json.lastStockRefresh),
      inventory: json.inventory.map((item: any) => Item.fromJSON(item)),
      archetype: json.archetype,
    });
  }
}

//----------------------associated functions----------------------//
function getAnItemByType(
  type: string,
  playerClass: "mage" | "paladin" | "necromancer" | "ranger",
): Item {
  type = toTitleCase(type);
  const itemTypes: { [key: string]: any[] } = {
    Arrow: arrows,
    Artifact: artifacts,
    BodyArmor: bodyArmor,
    Book:
      {
        mage: mageBooks,
        paladin: paladinBooks,
        necromancer: necroBooks,
        ranger: rangerBooks,
      }[playerClass] || mageBooks,
    Bow: bows,
    Focus: foci,
    Hat: hats,
    Helmet: helmets,
    Ingredient: ingredients,
    Junk: junk,
    Poison: poison,
    Potion: potions,
    Robe: robes,
    Shield: shields,
    Staff: staves,
    Wand: wands,
    Weapon: weapons,
  };

  if (!(type in itemTypes)) {
    throw new Error(`Invalid type passed to getAnItemByType(): ${type}`);
  }

  const items = itemTypes[type];
  const idx = getRandomInt(0, items.length - 1);
  const itemObj = items[idx];

  return Item.fromJSON({
    ...itemObj,
    itemClass: type,
    stackable: isStackable(type as ItemClassType),
  });
}

export function generateInventory(
  inventoryCount: number,
  trades: string[],
  playerClass: "mage" | "necromancer" | "paladin" | "ranger",
) {
  let items: Item[] = [];
  for (let i = 0; i < inventoryCount; i++) {
    const type = trades[Math.floor(Math.random() * trades.length)];
    items.push(getAnItemByType(type, playerClass));
  }
  return items;
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function createShops(
  playerClass: "mage" | "paladin" | "necromancer" | "ranger",
) {
  let createdShops: Shop[] = [];
  shops.forEach((shop) => {
    //want to favor likelihood of male shopkeepers slightly
    const itemCount = getRandomInt(
      shop.itemQuantityRange.minimum,
      shop.itemQuantityRange.maximum,
    );
    const newShop = new Shop({
      shopKeeper: generateShopKeeper(shop.type),
      baseGold: shop.baseGold,
      lastStockRefresh: new Date(),
      archetype: shop.type,
      inventory: generateInventory(itemCount, shop.trades, playerClass),
    });
    createdShops.push(newShop);
  });
  return createdShops;
}

export function generateShopKeeper(archetype: string) {
  const sex = rollD20() <= 12 ? "male" : "female";
  const name = getRandomName(sex);
  const birthdate = generateBirthday(25, 70);
  const job = toTitleCase(archetype);

  const newChar = new Character({
    sex: sex,
    firstName: name.firstName,
    lastName: name.lastName,
    birthdate: birthdate,
    job: job,
  });
  return newChar;
}
