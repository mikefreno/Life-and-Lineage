import { Shop, generateShopKeeper } from "../entities/shop";
import type { RootStore } from "./RootStore";
import { storage } from "../utility/functions/storage";
import { throttle } from "lodash";
import { parse, stringify } from "flatted";
import shopsJSON from "../assets/json/shops.json";
import { MerchantType } from "../utility/types";
import { action, makeObservable, observable } from "mobx";

const SHOP_ARCHETYPES: MerchantType[] = [
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
  shopsMap: Map<MerchantType, Shop>;
  root: RootStore;

  constructor({ root }: { root: RootStore }) {
    this.root = root;
    this.shopsMap = this.hydrateShopState();

    makeObservable(this, {
      shopsMap: observable,
      fromCheckpointData: action,
      setShops: action,
    });
  }

  hydrateShopState() {
    try {
      const map = new Map<MerchantType, Shop>();
      SHOP_ARCHETYPES.forEach((archetype) => {
        const shopData = storage.getString(
          `shop_${archetype.replaceAll(" ", "_")}`,
        );
        if (!shopData) {
          throw new Error(`Failed to load ${archetype}`);
        }
        map.set(
          archetype,
          Shop.fromJSON({ ...parse(shopData), root: this.root }),
        );
      });
      return map;
    } catch (e) {}
    return this.getInitShopsState();
  }

  getInitShopsState() {
    const map = new Map<MerchantType, Shop>();
    shopsJSON.forEach((shop) => {
      const newShop = new Shop({
        shopKeeper: generateShopKeeper(shop.type, this.root),
        baseGold: shop.baseGold,
        lastStockRefresh: this.root.time.currentDate,
        archetype: shop.type as MerchantType,
        root: this.root,
      });
      _shopSave(newShop);
      map.set(shop.type as MerchantType, newShop);
    });
    return map;
  }

  public getShop(archetype: MerchantType) {
    return this.shopsMap.get(archetype);
  }
  setShops(arg0: Map<MerchantType, Shop>) {
    this.shopsMap = arg0;
  }

  toCheckpointData() {
    return Array.from(this.shopsMap.entries()).map(([_, shop]) => ({
      ...shop,
      shopKeeper: { ...shop.shopKeeper, root: null },
      root: null,
    }));
  }

  fromCheckpointData(data: any) {
    this.shopsMap.clear();
    data.forEach((shopData: any) => {
      const shop = Shop.fromJSON({ ...shopData, root: this.root });
      this.shopsMap.set(shop.archetype as MerchantType, shop);
    });
  }
}

const _shopSave = async (shop: Shop | undefined) => {
  if (shop) {
    try {
      storage.set(
        `shop_${shop.archetype.replaceAll(" ", "_")}`,
        stringify({
          ...shop,
          baseInventory: shop.baseInventory.map((item) => item.toJSON()),
          shopKeeper: { ...shop.shopKeeper, root: null },
          root: null,
        }),
      );
    } catch (e) {}
  }
};

export const saveShop = throttle(_shopSave, 500);
