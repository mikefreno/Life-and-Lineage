import { Shop, generateShopKeeper } from "@/entities/shop";
import type { RootStore } from "@/stores/RootStore";
import { storage } from "@/utility/functions/storage";
import { throttle } from "lodash";
import { parse, stringify } from "flatted";
import shopsJSON from "@/assets/json/shops.json";
import { MerchantType } from "@/utility/types";
import { action, computed, makeObservable, observable } from "mobx";

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
  currentShop: Shop | null = null;
  inShopPath = false;

  constructor({ root }: { root: RootStore }) {
    this.root = root;
    this.shopsMap = this.hydrateShopState();

    makeObservable(this, {
      shopsMap: observable,
      currentShop: observable,
      inShopPath: observable,

      fromCheckpointData: action,
      setShops: action,
      setCurrentShop: action,
      setInShopPath: action,

      inMarket: computed,
    });
  }

  get inMarket(): boolean {
    return this.currentShop !== null || this.inShopPath;
  }

  setInShopPath(val: boolean) {
    this.inShopPath = val;
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

  setCurrentShop(shop: Shop | null) {
    this.currentShop = shop;
  }

  getShop(archetype: MerchantType) {
    return this.shopsMap.get(archetype);
  }

  getInitShopsState() {
    const map = new Map<MerchantType, Shop>();

    const usedCombinations = new Set<string>();

    shopsJSON.forEach((shop) => {
      const archetype = shop.type as MerchantType;

      let shopKeeper;
      let sex;

      do {
        shopKeeper = generateShopKeeper(archetype, this.root);
        this.root.characterStore.addCharacter(shopKeeper);
        this.root.playerState?.addKnownCharacter(shopKeeper);

        sex = shopKeeper.sex;

        const combinationKey = `${archetype}-${sex}`;

        if (!usedCombinations.has(combinationKey)) {
          usedCombinations.add(combinationKey);
          break;
        }
        if (usedCombinations.size > 20) {
          console.warn(
            `Couldn't generate unique sex-archetype combination after many attempts`,
          );
          break;
        }
      } while (true);

      const newShop = new Shop({
        shopKeeper: shopKeeper,
        baseGold: shop.baseGold,
        lastStockRefresh: this.root.time.currentDate,
        archetype: archetype,
        root: this.root,
      });

      _shopSave(newShop);
      map.set(archetype, newShop);
    });

    return map;
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
