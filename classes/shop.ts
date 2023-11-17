import { Item } from "./item";

interface ShopProps {
  shopKeeperName: string;
  shopKeeperBirthDate: Date;
  shopKeeperSex: "male" | "female";
  affection?: number;
  personality: string;
  baseGold: number;
  lastStockRefresh: Date;
  inventory?: Item[];
  archetype: string;
}

export class Shop {
  readonly shopKeeperName: string;
  readonly shopKeeperBirthDate: Date;
  readonly shopKeeperSex: "male" | "female";
  private affection: number;
  private personality: string;
  private baseGold: number;
  private lastStockRefresh: Date;
  private inventory: Item[];
  readonly archetype: string;

  constructor({
    shopKeeperName,
    shopKeeperBirthDate,
    shopKeeperSex,
    affection,
    personality,
    baseGold,
    lastStockRefresh,
    inventory,
    archetype,
  }: ShopProps) {
    this.shopKeeperName = shopKeeperName;
    this.shopKeeperBirthDate = shopKeeperBirthDate;
    this.shopKeeperSex = shopKeeperSex;
    this.affection = affection ?? 0;
    this.personality = personality;
    this.baseGold = baseGold;
    this.lastStockRefresh = lastStockRefresh ?? new Date();
    this.inventory = inventory ?? [];
    this.archetype = archetype;
  }

  public toJSON(): object {
    return {
      shopKeeperName: this.shopKeeperName,
      shopKeeperBirthDate: this.shopKeeperBirthDate.toISOString(),
      shopKeeperSex: this.shopKeeperSex,
      affection: this.affection,
      personality: this.personality,
      baseGold: this.baseGold,
      lastStockRefresh: this.lastStockRefresh.toISOString(),
      inventory: this.inventory.map((item) => item.toJSON()),
      archetype: this.archetype,
    };
  }

  static fromJSON(json: any): Shop {
    return new Shop({
      shopKeeperName: json.shopKeeperName,
      shopKeeperBirthDate: new Date(json.shopKeeperBirthDate),
      shopKeeperSex: json.shopKeeperSex,
      affection: json.affection,
      personality: json.personality,
      baseGold: json.baseGold,
      lastStockRefresh: new Date(json.lastStockRefresh),
      inventory: json.inventory.map((item: any) => Item.fromJSON(item)),
      archetype: json.archetype,
    });
  }
}
