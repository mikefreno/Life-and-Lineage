import mageBooks from "../assets/json/items/mageBooks.json";
import necroBooks from "../assets/json/items/necroBooks.json";
import paladinBooks from "../assets/json/items/paladinBooks.json";
import mageSpells from "../assets/json/mageSpells.json";
import necroSpells from "../assets/json/necroSpells.json";
import paladinSpells from "../assets/json/paladinSpells.json";
import * as Crypto from "expo-crypto";
import { ItemClassType, type ItemOptions } from "../utility/types";
import { parseSpell } from "../utility/functions/jsonParsing";
import type { PlayerCharacter } from "./character";
import { Spell } from "./spell";

export class Item {
  readonly id: string;
  readonly name: string;
  readonly slot: "head" | "body" | "one-hand" | "two-hand" | "off-hand" | null;
  readonly itemClass: ItemClassType;
  readonly stats: Record<string, number> | null;
  readonly baseValue: number;
  readonly icon: string | undefined;
  readonly stackable: boolean;
  readonly requirements: {
    strength?: number;
    intelligence?: number;
    dexterity?: number;
  };

  constructor({
    id,
    name,
    slot,
    stats,
    baseValue,
    itemClass,
    icon,
    requirements,
    stackable = false,
  }: ItemOptions) {
    this.id = id ?? Crypto.randomUUID();
    this.name = name;
    this.slot = slot ?? null;
    this.stats = stats ?? null;
    this.baseValue = baseValue;
    this.itemClass = itemClass;
    this.icon = icon;
    this.requirements = requirements ?? {};
    this.stackable = stackable;
  }

  get isEquippable() {
    return !!this.slot;
  }

  public playerHasRequirements(player: PlayerCharacter) {
    console.log(this.requirements);
    if (
      this.requirements.strength &&
      this.requirements.strength >
        player.baseStrength + player.allocatedSkillPoints.strength
    ) {
      return false;
    }
    if (
      this.requirements.intelligence &&
      this.requirements.intelligence >
        player.baseIntelligence + player.allocatedSkillPoints.intelligence
    ) {
      return false;
    }
    if (
      this.requirements.dexterity &&
      this.requirements.dexterity >
        player.baseDexterity + player.allocatedSkillPoints.dexterity
    ) {
      return false;
    }

    return true;
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

  public getAttachedSpell(
    playerClass: "mage" | "paladin" | "necromancer",
  ): Spell {
    let spell = undefined;
    if (this.itemClass == "book") {
      if (playerClass == "mage") {
        const bookObj = mageBooks.find((book) => book.name == this.name);
        spell = mageSpells.find(
          (mageSpell) => bookObj?.teaches == mageSpell.name,
        );
        if (!spell) {
          throw new Error(`missing spell from Book Item ${this.name}`);
        }
      }
      if (playerClass == "necromancer") {
        const bookObj = necroBooks.find((book) => book.name == this.name);
        spell = necroSpells.find(
          (necroSpell) => bookObj?.teaches == necroSpell.name,
        );
        if (!spell) {
          throw new Error(`missing spell from Book Item ${this.name}`);
        }
      }
      if (playerClass == "paladin") {
        const bookObj = paladinBooks.find((book) => book.name == this.name);
        spell = paladinSpells.find(
          (paladinSpell) => bookObj?.teaches == paladinSpell.name,
        );
        if (!spell) {
          throw new Error(`missing spell from Book Item ${this.name}`);
        }
      }
    }
    if (spell) {
      return parseSpell(spell);
    }
    throw new Error("Requested a spell from a non-book item");
  }

  static fromJSON(json: any): Item {
    const item = new Item({
      id: json.id,
      name: json.name,
      slot: json.slot,
      stats: json.stats,
      baseValue: json.baseValue,
      itemClass: json.itemClass,
      stackable: isStackable(json.itemClass),
      requirements: json.requirements,
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
  Rat_Tail: require("../assets/images/items/Rat_Tail.png"),
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
  Goblin_Staff: require("../assets/images/items/Goblin_Staff.png"),
  Great_Bow: require("../assets/images/items/Great_Bow.png"),
  Black_Bow: require("../assets/images/items/Black_Bow.png"),
  Axe: require("../assets/images/items/Axe.png"),
  Golden_Hammer: require("../assets/images/items/Golden_Hammer.png"),
};

export const isStackable = (itemClass: ItemClassType) => {
  switch (itemClass) {
    case ItemClassType.Potion:
    case ItemClassType.Poison:
    case ItemClassType.Junk:
    case ItemClassType.Ingredient:
    case ItemClassType.Arrow:
      return true;
    default:
      return false;
  }
};
