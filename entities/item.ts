import mageBooks from "../assets/json/items/mageBooks.json";
import necroBooks from "../assets/json/items/necroBooks.json";
import paladinBooks from "../assets/json/items/paladinBooks.json";
import rangerBooks from "../assets/json/items/rangerBooks.json";
import mageSpells from "../assets/json/mageSpells.json";
import necroSpells from "../assets/json/necroSpells.json";
import paladinSpells from "../assets/json/paladinSpells.json";
import rangerSpells from "../assets/json/rangerSpells.json";
import {
  Attribute,
  ItemClassType,
  PlayerClassOptions,
  ItemEffect,
  Modifier,
  Rarity,
} from "../utility/types";
import { Spell } from "./spell";
import { Attack } from "./attack";
import attackObjects from "../assets/json/playerAttacks.json";
import { action, computed, makeObservable, observable } from "mobx";
import { Condition } from "./conditions";
import { toTitleCase, wait } from "../utility/functions/misc";
import type { RootStore } from "../stores/RootStore";
import PREFIXES from "../assets/json/prefix.json";
import SUFFIXES from "../assets/json/suffix.json";
import * as Crypto from "expo-crypto";

interface ItemProps {
  id?: string;
  name: string;
  slot?: "head" | "body" | "one-hand" | "two-hand" | "off-hand" | null;
  stats?: Partial<Record<Modifier, number>> | null;
  baseValue: number;
  itemClass: ItemClassType;
  icon?: string;
  requirements?: { strength?: number; intelligence?: number };
  stackable?: boolean;
  attacks?: string[];
  description?: string;
  effect?: ItemEffect;
  activePoison?:
    | Condition
    | { effect: "health" | "mana" | "sanity"; amount: number }
    | null;
  rarity?: Rarity | null;
  prefix?: {
    affix: Affix;
    tier: number;
  } | null;
  suffix?: {
    affix: Affix;
    tier: number;
  } | null;
  uses?: number;
  root: RootStore;
}

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
  readonly rarity: Rarity;
  readonly stats: Partial<Record<Modifier, number>> | null;
  readonly prefix: {
    affix: Affix;
    tier: number;
  } | null;
  readonly suffix: {
    affix: Affix;
    tier: number;
  } | null;
  readonly baseValue: number;
  readonly icon: string | undefined;
  readonly stackable: boolean;
  readonly requirements: {
    strength?: number;
    intelligence?: number;
    dexterity?: number;
  };
  readonly attacks: string[];
  readonly description: string | null;
  readonly effect: ItemEffect | null;
  activePoison:
    | Condition
    | { effect: "health" | "mana" | "sanity"; amount: number }
    | null;
  uses: number | null;
  root: RootStore;

  constructor({
    id,
    name,
    slot,
    stats,
    baseValue,
    itemClass,
    icon,
    rarity,
    prefix,
    suffix,
    requirements = {},
    root,
    attacks = [],
    stackable = false,
    description,
    effect,
    activePoison,
    uses,
  }: ItemProps) {
    this.id = id ?? Crypto.randomUUID();

    if (
      ItemRarityService.isEquipable(slot ?? null) &&
      itemClass !== ItemClassType.Arrow
    ) {
      if (prefix || suffix || rarity) {
        this.rarity = rarity ?? Rarity.NORMAL;
        this.prefix = prefix ?? null;
        this.suffix = suffix ?? null;
        this.stats = stats ?? null;
        this.name = name;
      } else {
        const rolledRarity = ItemRarityService.rollRarity();
        const { prefix: rolledPrefix, suffix: rolledSuffix } =
          ItemRarityService.generateAffixes(rolledRarity);

        this.rarity = rolledRarity;
        this.prefix = rolledPrefix;
        this.suffix = rolledSuffix;

        this.stats = ItemRarityService.applyAffixesToStats(
          stats ?? null,
          rolledPrefix,
          rolledSuffix,
        );

        this.name = ItemRarityService.generateItemName(
          name,
          rolledPrefix,
          rolledSuffix,
        );
      }
    } else {
      this.rarity = Rarity.NORMAL;
      this.prefix = null;
      this.suffix = null;
      this.stats = stats ?? null;
      this.name = name;
    }

    this.slot = slot ?? null;
    this.baseValue = baseValue;
    this.itemClass = itemClass;
    this.icon = icon;
    this.requirements = requirements;
    this.stackable = stackable;
    this.root = root;
    this.attacks = attacks;
    this.description = description ?? null;
    this.effect = effect ?? null;
    this.activePoison = activePoison ?? null;
    this.uses = uses ?? null;

    makeObservable(this, {
      name: observable,
      totalPhysicalDamage: computed,
      totalFireDamage: computed,
      totalColdDamage: computed,
      totalLightningDamage: computed,
      totalPoisonDamage: computed,
      totalDamage: computed,
      totalArmor: computed,
      attachedSpell: computed,
      attachedAttacks: computed,
      playerHasRequirements: computed,
      use: action,
      activePoison: observable,
      consumePoison: action,
    });
  }

  get isEquippable() {
    return !!this.slot;
  }

  get playerHasRequirements() {
    if (this.root.playerState) {
      if (
        this.requirements.strength &&
        this.requirements.strength >
          this.root.playerState.baseStrength +
            this.root.playerState.allocatedSkillPoints[Attribute.strength]
      ) {
        return false;
      }
      if (
        this.requirements.intelligence &&
        this.requirements.intelligence >
          this.root.playerState.baseIntelligence +
            this.root.playerState.allocatedSkillPoints[Attribute.intelligence]
      ) {
        return false;
      }
      if (
        this.requirements.dexterity &&
        this.requirements.dexterity >
          this.root.playerState.baseDexterity +
            this.root.playerState.allocatedSkillPoints[Attribute.dexterity]
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
        if (found && this.root.playerState) {
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
      if (found && this.root.playerState) {
        builtAttacks.push(
          new Attack({
            ...found,
            user: this.root.playerState,
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
      switch (this.root.playerState?.playerClass) {
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
    if (!this.root.playerState)
      throw new Error(`Missing player on item! ${this.name}`);
    if (!this.effect) {
      throw new Error("Called 'use' on an invalid item!");
    }
    try {
      if (this.effect.isPoison) {
        this.applyPoison(this.effect);
      } else {
        this.usePotion(this.effect);
      }
      this.root.playerState.removeFromInventory(this);
      if (callback) {
        wait(500).then(() => callback());
      }
    } catch (error) {
      //@ts-ignore
      throw new Error(`Failed to use item ${this.name}: ${error.message}`);
    }
  }

  get totalPhysicalDamage() {
    return this.calculateTotalDamage("physical");
  }

  get totalFireDamage() {
    return this.calculateTotalDamage("fire");
  }

  get totalColdDamage() {
    return this.calculateTotalDamage("cold");
  }

  get totalLightningDamage() {
    return this.calculateTotalDamage("lightning");
  }

  get totalPoisonDamage() {
    return this.calculateTotalDamage("poison");
  }

  get totalDamage() {
    return [
      this.totalPhysicalDamage,
      this.totalFireDamage,
      this.totalColdDamage,
      this.totalLightningDamage,
      this.totalPoisonDamage,
    ].reduce((sum, damage) => sum + damage, 0);
  }

  get totalArmor() {
    if (!this.stats) return 0;
    return Math.round((this.stats.armor ?? 0) + (this.stats.armorAdded ?? 0));
  }

  private calculateTotalDamage(
    damageType: "physical" | "fire" | "cold" | "lightning" | "poison",
  ): number {
    if (!this.stats) return 0;

    const baseDamage = this.stats[`${damageType}Damage`] ?? 0;
    const addedDamage = this.stats[`${damageType}DamageAdded`] ?? 0;
    const multiplier = this.stats[`${damageType}DamageMultiplier`] ?? 0;

    if (!baseDamage && !addedDamage) return 0;

    return (baseDamage + addedDamage) * (1 + multiplier);
  }

  private usePotion(effect: ItemEffect) {
    if (!this.root.playerState)
      throw new Error(`Missing player on item! ${this.name}`);
    if ("condition" in effect) {
      this.root.playerState.addCondition(effect.condition);
      return;
    }
    const amt = this.calculateEffectAmount(effect.amount);
    this.applyStatEffect(effect.stat, amt);
    if (this.root.dungeonStore.inCombat) {
      this.root.playerState.endTurn();
    }
  }

  private applyStatEffect(stat: "health" | "mana" | "sanity", amount: number) {
    switch (stat) {
      case "health":
        this.root.playerState?.restoreHealth(amount);
        break;
      case "mana":
        this.root.playerState?.restoreMana(amount);
        break;
      case "sanity":
        this.root.playerState?.restoreSanity(amount);
        break;
      default:
        throw new Error(`Unimplemented attribute: ${stat}`);
    }
  }

  private applyPoison(effect: ItemEffect) {
    if (!this.root.playerState)
      throw new Error(`Missing player on item! ${this.name}`);

    if (this.root.playerState.equipment.mainHand.name === "unarmored") {
      throw new Error("Can't apply poison to bare hands!");
    }

    if ("condition" in effect) {
      this.root.playerState.equipment.mainHand.activePoison = effect.condition;
      return;
    }

    const amt = this.calculateEffectAmount(effect.amount);
    this.root.playerState.equipment.mainHand.activePoison = {
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

  static fromJSON(json: any): Item {
    const item = new Item({
      id: json.id,
      name: json.name,
      slot: json.slot,
      stats: json.stats,
      prefix: json.prefix,
      suffix: json.suffix,
      rarity: json.rarity,
      baseValue: json.baseValue,
      itemClass: json.itemClass,
      stackable: isStackable(json.itemClass),
      requirements: json.requirements,
      icon: json.icon,
      attacks: json.attacks,
      description: json.description,
      effect:
        json.effect && "condition" in json.effect
          ? { condition: Condition.fromJSON(json.effect.condition) }
          : json.effect,
      activePoison: json.activePoison,
      root: json.root,
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

export type Affix = {
  name: {
    [tier: string]: string;
  };
  modifier: {
    [stat: string]:
      | Array<{
          [tier: string]: {
            min: number;
            max: number;
          };
        }>
      | undefined;
  };
  tiers: number;
};

function hasProp<K extends PropertyKey>(
  data: object,
  prop: K,
): data is Record<K, unknown> {
  return prop in data;
}

function assertNonNull<T>(value: T | null | undefined): asserts value is T {
  if (value === null || value === undefined) {
    throw new Error("Value is null or undefined");
  }
}

const RARITY_CHANCES = {
  RARE: 10,
  MAGIC: 25,
};

export class ItemRarityService {
  static isEquipable(slot: string | null): boolean {
    if (!slot) return false;
    return [
      "head",
      "body",
      "one-hand",
      "two-hand",
      "off-hand",
      "quiver",
    ].includes(slot);
  }

  static rollRarity(): Rarity {
    const roll = Math.random() * 100;

    if (roll <= RARITY_CHANCES.RARE) {
      return Rarity.RARE;
    } else if (roll <= RARITY_CHANCES.RARE + RARITY_CHANCES.MAGIC) {
      return Rarity.MAGIC;
    }

    return Rarity.NORMAL;
  }

  static getRandomAffix(affixes: Affix[]): { affix: Affix; tier: number } {
    const index = Math.floor(Math.random() * affixes.length);
    const affix = affixes[index];
    const tier = this.rollTier(affix.tiers);
    return { affix, tier };
  }

  static rollTier(maxTier: number): number {
    const T1_CHANCE = 0.05;
    const base = Math.pow(T1_CHANCE, 1 / (maxTier - 1));

    const roll = Math.random();
    let cumulativeProbability = 0;

    for (let tier = 1; tier <= maxTier; tier++) {
      const probability = Math.pow(base, maxTier - tier) * (1 - base);
      cumulativeProbability += probability;

      if (roll <= cumulativeProbability) {
        return tier;
      }
    }

    return maxTier;
  }

  static generateAffixes(rarity: Rarity): {
    prefix: { affix: Affix; tier: number } | null;
    suffix: { affix: Affix; tier: number } | null;
  } {
    switch (rarity) {
      case Rarity.RARE:
        return {
          prefix: this.getRandomAffix(PREFIXES as Affix[]),
          suffix: this.getRandomAffix(SUFFIXES),
        };
      case Rarity.MAGIC:
        // 50/50 chance for prefix or suffix
        return Math.random() < 0.5
          ? { prefix: this.getRandomAffix(PREFIXES as Affix[]), suffix: null }
          : { prefix: null, suffix: this.getRandomAffix(SUFFIXES) };
      default:
        return { prefix: null, suffix: null };
    }
  }

  static rollStatValue(range: { min: number; max: number }): number {
    return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
  }

  static applyAffixesToStats(
    baseStats: Record<string, number> | null,
    prefix: { affix: Affix; tier: number } | null,
    suffix: { affix: Affix; tier: number } | null,
  ): Record<string, number> {
    const stats = { ...baseStats } || {};

    const applyModifiers = (affix: Affix, tier: number) => {
      Object.entries(affix.modifier).forEach(([stat, modifiers]) => {
        if (modifiers) {
          modifiers.forEach((modifier) => {
            if (hasProp(modifier, tier.toString())) {
              const range = modifier[tier.toString()];
              assertNonNull(range);
              const value = this.rollStatValue(range);
              stats[stat] = (stats[stat] || 0) + value;
            }
          });
        }
      });
    };

    if (prefix) {
      applyModifiers(prefix.affix, prefix.tier);
    }
    if (suffix) {
      applyModifiers(suffix.affix, suffix.tier);
    }

    return stats;
  }

  static generateItemName(
    baseName: string,
    prefix: { affix: Affix; tier: number } | null,
    suffix: { affix: Affix; tier: number } | null,
  ): string {
    let name = toTitleCase(baseName);
    if (prefix) {
      name = `${toTitleCase(
        prefix.affix.name[prefix.tier.toString()],
      )} ${name}`;
    }
    if (suffix) {
      name = `${name} of ${toTitleCase(
        suffix.affix.name[suffix.tier.toString()],
      )}`;
    }
    return name;
  }

  static calculateValueModifier(tier: number): number {
    const baseMod = 2; // 200% increase for tier 1
    const reductionFactor = 0.65;
    return baseMod * Math.pow(reductionFactor, tier - 1);
  }

  static calculateModifiedValue(
    baseValue: number,
    prefix: { affix: Affix; tier: number } | null,
    suffix: { affix: Affix; tier: number } | null,
  ): number {
    let valueModifier = 1;

    if (prefix) {
      valueModifier += this.calculateValueModifier(prefix.tier);
    }
    if (suffix) {
      valueModifier += this.calculateValueModifier(suffix.tier);
    }

    return Math.round(baseValue * valueModifier);
  }
}
