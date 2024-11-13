import { Shop, generateShopKeeper } from "../entities/shop";
import type { RootStore } from "./RootStore";
import { storage } from "../utility/functions/storage";
import { throttle } from "lodash";
import { parse, stringify } from "flatted";
import { type ShopkeeperPersonality } from "../utility/types";
import shopsJSON from "../assets/json/shops.json";

const SHOP_ARCHETYPES = [
  "armorer",
  "weaponsmith",
  "weaver",
  "archanist",
  "junk dealer",
  "fletcher",
  "apothecary",
  "librarian",
];

export class ShopStore {
  shops: Shop[];
  root: RootStore;

  constructor({ root }: { root: RootStore }) {
    this.shops = this.hydrateShopState();
    this.root = root;
  }

  public refreshAllShops() {
    this.shops.forEach((shop) => shop.refreshInventory(this.root.playerState!));
  }

  hydrateShopState() {
    try {
      const builtShops = SHOP_ARCHETYPES.map((archetype) => {
        console.log(`loading at: shop_${archetype.replaceAll(" ", "_")}`);
        const shopData = storage.getString(`shop_${archetype}`);
        if (!shopData) {
          throw new Error(`Failed to load ${archetype}`);
        }
        return Shop.fromJSON({ ...parse(shopData), root: this.root });
      });
      return builtShops;
    } catch (e) {
      console.log(e);
    }
    return this.getInitShopsState();
  }

  getInitShopsState() {
    let createdShops: Shop[] = [];
    shopsJSON.forEach((shop) => {
      const randIdx = Math.floor(
        Math.random() * shop.possiblePersonalities.length,
      );
      const personality = shop.possiblePersonalities[randIdx];
      const newShop = new Shop({
        shopKeeper: generateShopKeeper(shop.type),
        baseGold: shop.baseGold,
        lastStockRefresh: new Date(),
        archetype: shop.type,
        shopKeeperPersonality: personality as ShopkeeperPersonality,
        root: this.root,
      });
      _shopSave(newShop);
      createdShops.push(newShop);
    });
    return createdShops;
  }
}

const _shopSave = async (shop: Shop | undefined) => {
  if (shop) {
    console.log(`saving at: shop_${shop.archetype.replaceAll(" ", "_")}`);
    try {
      storage.set(
        `shop_${shop.archetype.replaceAll(" ", "_")}`,
        stringify({ ...shop, root: null }),
      );
    } catch (e) {
      console.log("Error in _playerSave:", e);
    }
  }
};

export const saveShop = throttle(_shopSave, 500);
