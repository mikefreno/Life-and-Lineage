import mageBooks from "../assets/json/items/mageBooks.json";
import necroBooks from "../assets/json/items/necroBooks.json";
import paladinBooks from "../assets/json/items/paladinBooks.json";
import rangerBooks from "../assets/json/items/rangerBooks.json";
import mageSpells from "../assets/json/mageSpells.json";
import necroSpells from "../assets/json/necroSpells.json";
import paladinSpells from "../assets/json/paladinSpells.json";
import rangerSpells from "../assets/json/rangerSpells.json";
import * as Crypto from "expo-crypto";
import {
  Attribute,
  ItemClassType,
  PlayerClassOptions,
  type ItemOptions,
  ItemEffect,
} from "../utility/types";
import type { PlayerCharacter } from "./character";
import { Spell } from "./spell";
import { Attack } from "./attack";
import attackObjects from "../assets/json/playerAttacks.json";
import { action, computed, makeObservable, observable } from "mobx";
import { Condition } from "./conditions";
import { wait } from "../utility/functions/misc";

export class Item {
  readonly id: string;
  readonly name: string;
  readonly slot:
    | "head"
    | "body"
    | "one-hand"
    | "two-hand"
    | "off-hand"
    | "quiver"
    | null;
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
  player: PlayerCharacter | null;
  readonly attacks: string[];
  readonly description: string | null;
  readonly effect: ItemEffect | null;
  activePoison:
    | Condition
    | { effect: "health" | "mana" | "sanity"; amount: number }
    | null;
  uses: number | null;

  constructor({
    id,
    name,
    slot,
    stats,
    baseValue,
    itemClass,
    icon,
    requirements = {},
    player,
    attacks = [],
    stackable = false,
    description,
    effect,
    activePoison,
    uses,
  }: ItemOptions) {
    this.id = id ?? Crypto.randomUUID();
    this.name = name;
    this.slot = slot ?? null;
    this.stats = stats ?? null;
    this.baseValue = baseValue;
    this.itemClass = itemClass;
    this.icon = icon;
    this.requirements = requirements;
    this.stackable = stackable;
    this.player = player;
    this.attacks = attacks;
    this.description = description ?? null;
    this.effect = effect ?? null;
    this.activePoison = activePoison ?? null;
    this.uses = uses ?? null;

    makeObservable(this, {
      attachedSpell: computed,
      attachedAttacks: computed,
      playerHasRequirements: computed,
      reinstatePlayer: action,
      use: action,
      player: observable,
      activePoison: observable,
      consumePoison: action,
    });
  }

  get isEquippable() {
    return !!this.slot;
  }

  get playerHasRequirements() {
    if (this.player) {
      if (
        this.requirements.strength &&
        this.requirements.strength >
          this.player.baseStrength +
            this.player.allocatedSkillPoints[Attribute.strength]
      ) {
        return false;
      }
      if (
        this.requirements.intelligence &&
        this.requirements.intelligence >
          this.player.baseIntelligence +
            this.player.allocatedSkillPoints[Attribute.intelligence]
      ) {
        return false;
      }
      if (
        this.requirements.dexterity &&
        this.requirements.dexterity >
          this.player.baseDexterity +
            this.player.allocatedSkillPoints[Attribute.dexterity]
      ) {
        return false;
      }
    }

    return true;
  }

  get providedSpells() {
    if (this.itemClass == ItemClassType.Wand) {
      const builtSpells: Spell[] = [];
      const combinedSpellJson = [
        ...mageSpells,
        ...necroSpells,
        ...paladinSpells,
        ...rangerSpells,
      ];
      this.attacks.forEach((attackString) => {
        const found = combinedSpellJson.find((obj) => obj.name == attackString);
        if (found && this.player) {
          builtSpells.push(
            new Spell({
              ...found,
              proficiencyNeeded: "novice",
            }),
          );
        }
      });
      return builtSpells;
    }
  }

  public equals(otherItem: Item) {
    return this.id === otherItem.id;
  }

  public getItemIcon() {
    if (this.icon) {
      return itemMap[this.icon];
    } else {
      return itemMap["Egg"];
    }
  }

  public getSellPrice(affection: number) {
    return Math.round(this.baseValue * (0.6 + affection / 250));
  }

  public getBuyPrice(affection: number) {
    return Math.round(this.baseValue * (1.4 - affection / 250));
  }

  get attachedAttacks() {
    const builtAttacks: Attack[] = [];
    this.attacks.forEach((attackString) => {
      const found = attackObjects.find((obj) => obj.name == attackString);
      if (found && this.player) {
        builtAttacks.push(
          new Attack({
            ...found,
            user: this.player,
            targets: found.targets as "single" | "dual" | "aoe",
          }),
        );
      }
    });
    return builtAttacks;
  }

  get attachedSpell() {
    if (this.itemClass == ItemClassType.Book) {
      let spell: any;
      let bookObj: any;
      switch (this.player?.playerClass) {
        case PlayerClassOptions.mage:
          bookObj = mageBooks.find((book) => book.name == this.name);
          spell = mageSpells.find(
            (mageSpell) => bookObj?.teaches == mageSpell.name,
          );
          if (spell) {
            return new Spell({ ...spell });
          }
        case PlayerClassOptions.necromancer:
          bookObj = necroBooks.find((book) => book.name == this.name);
          spell = necroSpells.find(
            (necroSpell) => bookObj?.teaches == necroSpell.name,
          );
          if (spell) {
            return new Spell({ ...spell });
          }
        case PlayerClassOptions.ranger:
          bookObj = rangerBooks.find((book) => book.name == this.name);
          spell = rangerSpells.find(
            (paladinSpell) => bookObj?.teaches == paladinSpell.name,
          );
          if (spell) {
            return new Spell({ ...spell });
          }
        case PlayerClassOptions.paladin:
          bookObj = paladinBooks.find((book) => book.name == this.name);
          spell = paladinSpells.find(
            (paladinSpell) => bookObj?.teaches == paladinSpell.name,
          );
          if (spell) {
            return new Spell({ ...spell });
          }
      }
    }
  }

  /**
   * callback provided in the dungeon
   */
  public use(callback?: () => void) {
    if (!this.player) throw new Error(`Missing player on item! ${this.name}`);
    if (!this.effect) {
      throw new Error("Called 'use' on an invalid item!");
    }
    try {
      if (this.effect.isPoison) {
        this.applyPoison(this.effect);
      } else {
        this.usePotion(this.effect);
      }
      this.player.removeFromInventory(this);
      if (callback) {
        wait(500).then(() => callback());
      }
    } catch (error) {
      //@ts-ignore
      throw new Error(`Failed to use item ${this.name}: ${error.message}`);
    }
  }

  private usePotion(effect: ItemEffect) {
    if (!this.player) throw new Error(`Missing player on item! ${this.name}`);
    if ("condition" in effect) {
      this.player.addCondition(effect.condition);
      return;
    }
    const amt = this.calculateEffectAmount(effect.amount);
    this.applyStatEffect(effect.stat, amt);
    if (this.player.inCombat) {
      this.player.endTurn();
    }
  }

  private applyStatEffect(stat: "health" | "mana" | "sanity", amount: number) {
    switch (stat) {
      case "health":
        this.player?.restoreHealth(amount);
        break;
      case "mana":
        this.player?.restoreMana(amount);
        break;
      case "sanity":
        this.player?.restoreSanity(amount);
        break;
      default:
        throw new Error(`Unimplemented attribute: ${stat}`);
    }
  }

  private applyPoison(effect: ItemEffect) {
    if (!this.player) throw new Error(`Missing player on item! ${this.name}`);

    if (this.player.equipment.mainHand.name === "unarmored") {
      throw new Error("Can't apply poison to bare hands!");
    }

    if ("condition" in effect) {
      this.player.equipment.mainHand.activePoison = effect.condition;
      return;
    }

    const amt = this.calculateEffectAmount(effect.amount);
    this.player.equipment.mainHand.activePoison = {
      effect: effect.stat,
      amount: amt,
    };
  }

  private calculateEffectAmount(amount: { min: number; max: number }): number {
    return (
      Math.floor(Math.random() * (amount.max - amount.min + 1)) + amount.min
    );
  }

  public consumePoison() {
    const poison = this.activePoison;
    this.activePoison = null;
    return poison;
  }

  public reinstatePlayer(player: PlayerCharacter) {
    if (this.player == null) {
      this.player = player;
    }
    return this;
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
      attacks: json.attacks,
      description: json.description,
      player: null,
      effect:
        json.effect && "condition" in json.effect
          ? { condition: Condition.fromJSON(json.effect.condition) }
          : json.effect,
      activePoison: json.activePoison,
    });

    return item;
  }
}
export const itemMap: { [key: string]: any } = {
  Amber_Potion: require("../assets/images/items/Amber_Potion.png"),
  Amber_Potion_2: require("../assets/images/items/Amber_Potion_2.png"),
  Amber_Potion_3: require("../assets/images/items/Amber_Potion_3.png"),
  Arrow: require("../assets/images/items/Arrow.png"),
  Axe: require("../assets/images/items/Axe.png"),
  Bag: require("../assets/images/items/Bag.png"),
  Base_Robes: require("../assets/images/items/Robes_1.png"),
  Bat_Wing: require("../assets/images/items/Bat_Wing.png"),
  Black_Bow: require("../assets/images/items/Black_Bow.png"),
  Blue_Potion: require("../assets/images/items/Blue_Potion.png"),
  Blue_Potion_2: require("../assets/images/items/Blue_Potion_2.png"),
  Blue_Potion_3: require("../assets/images/items/Blue_Potion_3.png"),
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
  Goblin_Staff: require("../assets/images/items/Goblin_Staff.png"),
  Golden_Hammer: require("../assets/images/items/Golden_Hammer.png"),
  Golden_Sword: require("../assets/images/items/Golden_Sword.png"),
  Great_Bow: require("../assets/images/items/Great_Bow.png"),
  Green_Potion: require("../assets/images/items/Green_Potion.png"),
  Green_Potion_2: require("../assets/images/items/Green_Potion_2.png"),
  Green_Potion_3: require("../assets/images/items/Green_Potion_3.png"),
  Hammer: require("../assets/images/items/Hammer.png"),
  Harp_Bow: require("../assets/images/items/Harp_Bow.png"),
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
  Paper: require("../assets/images/items/Paper.png"),
  Patch_of_Fur: require("../assets/images/items/Patch_of_Fur.png"),
  Purple_Potion: require("../assets/images/items/Purple_Potion.png"),
  Purple_Potion_2: require("../assets/images/items/Purple_Potion_2.png"),
  Purple_Potion_3: require("../assets/images/items/Purple_Potion_3.png"),
  Rat_Tail: require("../assets/images/items/Rat_Tail.png"),
  Red_Potion: require("../assets/images/items/Red_Potion.png"),
  Red_Potion_2: require("../assets/images/items/Red_Potion_2.png"),
  Red_Potion_3: require("../assets/images/items/Red_Potion_3.png"),
  Ruby_Staff: require("../assets/images/items/Ruby_Staff.png"),
  Sapphire_Staff: require("../assets/images/items/Sapphire_Staff.png"),
  Scroll: require("../assets/images/items/Scroll.png"),
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

export const isStackable = (itemClass: ItemClassType) => {
  switch (itemClass.toLowerCase()) {
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
