import { v4 as uuidv4 } from "uuid";
import mageBooks from "../assets/json/items/mageBooks.json";
import necroBooks from "../assets/json/items/necroBooks.json";
import paladinBooks from "../assets/json/items/paladinBooks.json";
import mageSpells from "../assets/json/mageSpells.json";
import necroSpells from "../assets/json/necroSpells.json";
import paladinSpells from "../assets/json/paladinSpells.json";

interface ItemOptions {
  id?: string;
  name: string;
  slot?: "head" | "body" | "one-hand" | "two-hand" | "off-hand" | null;
  stats?: Record<string, number | undefined> | null;
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
    | "bodyArmor"
    | "helmet"
    | "robe"
    | "hat"
    | "book";
  icon?: string;
}

export class Item {
  readonly id: string;
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
    | "bodyArmor"
    | "helmet"
    | "robe"
    | "hat"
    | "book";
  readonly stats: Record<string, number | undefined> | null;
  readonly baseValue: number;
  readonly icon: string | undefined;

  constructor({
    id,
    name,
    slot,
    stats,
    baseValue,
    itemClass,
    icon,
  }: ItemOptions) {
    this.id = id ?? uuidv4();
    this.name = name;
    this.slot = slot ?? null;
    this.stats = stats ?? null;
    this.baseValue = baseValue;
    this.itemClass = itemClass;
    this.icon = icon;
  }

  public equals(otherItem: Item) {
    return this.id == otherItem.id;
  }

  public getItemIcon() {
    if (this.icon) {
      return itemMap[this.icon];
    } else {
      return itemMap["Egg"];
    }
  }

  public getSellPrice(affection: number) {
    return this.baseValue * (0.6 + affection / 2500);
  }

  public getBuyPrice(affection: number) {
    return Math.round(this.baseValue * (1.4 - affection / 2500));
  }

  public getAttachedSpell(playerClass: "mage" | "paladin" | "necromancer") {
    if (this.itemClass == "book") {
      if (playerClass == "mage") {
        const bookObj = mageBooks.find((book) => book.name == this.name);
        const spell = mageSpells.find(
          (mageSpell) => bookObj?.teaches == mageSpell.name,
        );
        if (!spell) {
          throw new Error(`missing spell from Book Item ${this.name}`);
        }
        return spell;
      }
      if (playerClass == "necromancer") {
        const bookObj = necroBooks.find((book) => book.name == this.name);
        const spell = necroSpells.find(
          (necroSpell) => bookObj?.teaches == necroSpell.name,
        );
        if (!spell) {
          throw new Error(`missing spell from Book Item ${this.name}`);
        }
        return spell;
      }
      if (playerClass == "paladin") {
        const bookObj = paladinBooks.find((book) => book.name == this.name);
        const spell = paladinSpells.find(
          (paladinSpell) => bookObj?.teaches == paladinSpell.name,
        );
        if (!spell) {
          throw new Error(`missing spell from Book Item ${this.name}`);
        }
        return spell;
      }
    }
    throw new Error("Requested a spell from a non-book item");
  }
  //public toJSON(): object {
  //return {
  //id: this.id,
  //name: this.name,
  //slot: this.slot,
  //stats: this.stats,
  //baseValue: this.baseValue,
  //itemClass: this.itemClass,
  //icon: this.icon,
  //};
  //}

  static fromJSON(json: any): Item {
    const item = new Item({
      id: json.id,
      name: json.name,
      slot: json.slot,
      stats: json.stats,
      baseValue: json.baseValue,
      itemClass: json.itemClass,
      icon: json.icon,
    });

    return item;
  }
}
const itemMap: { [key: string]: any } = {
  Arrow: require("../assets/images/items/Arrow.png"),
  Bag: require("../assets/images/items/Bag.png"),
  Base_Robes: require("../assets/images/items/Robes_1.png"),
  Bat_Wing: require("../assets/images/items/Bat_Wing.png"),
  Blue_Potion: require("../assets/images/items/Blue_Potion.png"),
  Bone: require("../assets/images/items/Bone.png"),
  Book: require("../assets/images/items/Book.png"),
  Book_2: require("../assets/images/items/Book_2.png"),
  Book_3: require("../assets/images/items/Book_3.png"),
  Bow: require("../assets/images/items/Bow.png"),
  Chunk_of_Flesh: require("../assets/images/items/Chunk_of_Flesh.png"),
  Egg: require("../assets/images/items/Egg.png"),
  Emerald_Staff: require("../assets/images/items/Emerald_Staff.png"),
  Fang: require("../assets/images/items/Fang.png"),
  Focus_1: require("../assets/images/items/Focus_1.png"),
  Feather: require("../assets/images/items/Feather.png"),
  Goblet: require("../assets/images/items/Goblet.png"),
  Golden_Sword: require("../assets/images/items/Golden_Sword.png"),
  Green_Potion: require("../assets/images/items/Green_Potion.png"),
  Hammer: require("../assets/images/items/Hammer.png"),
  Helm: require("../assets/images/items/Helm.png"),
  Iron_Armor: require("../assets/images/items/Iron_Armor.png"),
  Iron_Boot: require("../assets/images/items/Iron_Boot.png"),
  Iron_Helmet: require("../assets/images/items/Iron_Helmet.png"),
  Iron_Shield: require("../assets/images/items/Iron_Shield.png"),
  Iron_Sword: require("../assets/images/items/Iron_Sword.png"),
  Knife: require("../assets/images/items/Knife.png"),
  Leather_Armor: require("../assets/images/items/Leather_Armor.png"),
  Leather_Boots: require("../assets/images/items/Leather_Boot.png"),
  Leather_Helmet: require("../assets/images/items/Leather_Helmet.png"),
  Magic_Wand: require("../assets/images/items/Magic_Wand.png"),
  Monster_Egg: require("../assets/images/items/Monster_Egg.png"),
  Monster_Eye: require("../assets/images/items/Monster_Eye.png"),
  Monster_Meat: require("../assets/images/items/Monster_Meat.png"),
  Patch_of_Fur: require("../assets/images/items/Patch_of_Fur.png"),
  Red_Potion: require("../assets/images/items/Red_Potion.png"),
  Ruby_Staff: require("../assets/images/items/Ruby_Staff.png"),
  Sapphire_Staff: require("../assets/images/items/Sapphire_Staff.png"),
  Silver_Sword: require("../assets/images/items/Silver_Sword.png"),
  Skull: require("../assets/images/items/Skull.png"),
  Slime_Gel: require("../assets/images/items/Slime_Gel.png"),
  Topaz_Staff: require("../assets/images/items/Topaz_Staff.png"),
  Torch: require("../assets/images/items/Torch.png"),
  Wizard_Hat: require("../assets/images/items/Wizard_Hat.png"),
  Wood_Log: require("../assets/images/items/Wood_Log.png"),
  Wooden_Armor: require("../assets/images/items/Wooden_Armor.png"),
  Wooden_Shield: require("../assets/images/items/Wooden_Shield.png"),
  Wooden_Sword: require("../assets/images/items/Wooden_Sword.png"),
};
