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
  shopsMap: Map<string, Shop>;
  root: RootStore;

  constructor({ root }: { root: RootStore }) {
    this.shopsMap = this.hydrateShopState();
    this.root = root;
  }

  hydrateShopState() {
    try {
      const map = new Map<string, Shop>();
      SHOP_ARCHETYPES.forEach((archetype) => {
        const shopData = storage.getString(`shop_${archetype}`);
        if (!shopData) {
          throw new Error(`Failed to load ${archetype}`);
        }
        map.set(
          archetype,
          Shop.fromJSON({ ...parse(shopData), root: this.root }),
        );
      });
      return map;
    } catch (e) {
      console.log(e);
    }
    return this.getInitShopsState();
  }

  getInitShopsState() {
    const map = new Map<string, Shop>();
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
      map.set(shop.type, newShop);
    });
    return map;
  }

  public getShop(archetype: string) {
    return this.shopsMap.get(archetype);
  }
}

const _shopSave = async (shop: Shop | undefined) => {
  if (shop) {
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
