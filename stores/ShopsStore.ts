import { parse } from "react-native-svg";
import { Shop, saveShop } from "../entities/shop";
import type { RootStore } from "./RootStore";
import { storage } from "../utility/functions/storage";

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
    let retrieved_shops: string[];
    try {
      retrieved_shops = SHOP_ARCHETYPES.map((archetype) => {
        const shopData = storage.getString(`shop_${archetype}`);
        if (!shopData) throw new Error(`Missing stored ${archetype}!`);
        return shopData;
      });
    } catch (e) {
      console.warn(e);
      retrieved_shops = [];
    }

    this.shops = retrieved_shops.map((shop) => {
      const madeShop = Shop.fromJSON({ ...parse(shop), root: this });
      saveShop(madeShop);
      return madeShop;
    });
    this.root = root;
  }

  public refreshAllShops() {
    this.shops.forEach((shop) => shop.refreshInventory(this.root.playerState!));
  }
}
