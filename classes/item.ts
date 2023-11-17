interface ItemOptions {
  name: string;
  slot: "head" | "body" | "one-hand" | "two-hand" | "off-hand" | null;
  stats: Record<string, number>[];
  baseValue: number;
  itemClass:
    | "artifact"
    | "potion"
    | "poison"
    | "junk"
    | "ingredient"
    | "wand"
    | "focus"
    | "weapon"
    | "shield"
    | "body armor"
    | "helmet"
    | "robe"
    | "hat"
    | "book";
}

export class Item {
  readonly name: string;
  readonly slot: "head" | "body" | "one-hand" | "two-hand" | "off-hand" | null;
  readonly itemClass:
    | "artifact"
    | "potion"
    | "poison"
    | "junk"
    | "ingredient"
    | "wand"
    | "focus"
    | "weapon"
    | "shield"
    | "body armor"
    | "helmet"
    | "robe"
    | "hat"
    | "book";
  readonly stats: Record<string, number>[];
  readonly baseValue: number;

  constructor({ name, slot, stats, baseValue, itemClass }: ItemOptions) {
    this.name = name;
    this.slot = slot;
    this.stats = stats;
    this.baseValue = baseValue;
    this.itemClass = itemClass;
  }

  public getSellPrice(affection: number) {
    return this.baseValue * (0.6 + affection / 2500);
  }

  public getBuyPrice(affection: number) {
    return this.baseValue * (1.4 - affection / 2500);
  }

  public toJSON(): object {
    return {
      name: this.name,
      slot: this.slot,
      stats: this.stats,
      baseValue: this.baseValue,
      itemClass: this.itemClass,
    };
  }

  static fromJSON(json: any): Item {
    const item = new Item({
      name: json.name,
      slot: json.slot,
      stats: json.stats,
      baseValue: json.baseValue,
      itemClass: json.itemClass,
    });

    return item;
  }
}
