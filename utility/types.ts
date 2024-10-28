import type { DungeonInstance, DungeonLevel } from "../classes/dungeon";
import type { Item } from "../classes/item";
import type { Game } from "../classes/game";
import type { PlayerCharacter } from "../classes/character";
import type { Enemy, Minion } from "../classes/creatures";
import React from "react";
import { BoundingBox, Tile } from "../components/DungeonComponents/DungeonMap";
import { Attack } from "../classes/attack";
import { Spell } from "../classes/spell";
import { type Condition } from "../classes/conditions";

export interface ItemOptions {
  id?: string;
  name: string;
  slot?: "head" | "body" | "one-hand" | "two-hand" | "off-hand" | null;
  stats?: Record<string, number> | null;
  baseValue: number;
  itemClass: ItemClassType;
  icon?: string;
  requirements?: { strength?: number; intelligence?: number };
  stackable?: boolean;
  player: PlayerCharacter | null;
  attacks?: string[];
  description?: string;
  effect?: ItemEffect;
  activePoison?:
    | Condition
    | { effect: "health" | "mana" | "sanity"; amount: number }
    | null;
}

type StatEffect = {
  stat: "health" | "mana" | "sanity";
  amount: { min: number; max: number };
  turns?: number;
  isPoison?: boolean;
};

type ConditionEffect = {
  condition: Condition;
  isPoison?: boolean;
};

export type ItemEffect = StatEffect | ConditionEffect;

export enum ItemClassType {
  Artifact = "artifact",
  Bow = "bow",
  Potion = "potion",
  Poison = "poison",
  Junk = "junk",
  Ingredient = "ingredient",
  Wand = "wand",
  Focus = "focus",
  Melee = "melee",
  Shield = "shield",
  BodyArmor = "bodyArmor",
  Helmet = "helmet",
  Robe = "robe",
  Hat = "hat",
  Book = "book",
  Arrow = "arrow",
  Staff = "staff",
  StoryItem = "storyItem",
}

export enum ShopkeeperPersonality {
  WISE = "wise",
  RESERVED = "reserved",
  ARROGANT = "arrogant",
  INSANE = "insane",
  CREEPY = "creepy",
  INCREDULOUS = "incredulous",
  SILENT = "silent",
  CALM = "calm",
  JOVIAL = "jovial",
  AGGRESSIVE = "aggressive",
  OPEN = "open",
}

export type InvestmentType = {
  name: string;
  description: string;
  cost: number;
  requires: { requirement: string; message: string } | null;
  turnsPerReturn: number;
  goldReturnRange: {
    min: number;
    max: number;
  };
  maxGoldStockPile: number;
  upgrades: InvestmentUpgrade[];
};

export type InvestmentUpgrade = {
  name: string;
  cost: number;
  description: string;
  excludes?: string | undefined;
  effect: {
    goldMinimumIncrease?: number | undefined;
    goldMaximumIncrease?: number | undefined;
    maxGoldStockPileIncrease?: number | undefined;
    turnsPerRollChange?: number | undefined;
    changeMaxSanity?: number | undefined;
  };
};

export enum Attribute {
  health,
  mana,
  sanity,
  strength,
  intelligence,
  dexterity,
}

export const AttributeToString: Record<Attribute, string> = {
  [Attribute.health]: "Health",
  [Attribute.mana]: "Mana",
  [Attribute.sanity]: "Sanity",
  [Attribute.strength]: "Strength",
  [Attribute.intelligence]: "Intelligence",
  [Attribute.dexterity]: "Dexterity",
};

export enum TutorialOption {
  class,
  aging,
  blessing,
  intro,
  spell,
  labor,
  dungeon,
  dungeonInterior,
  shops,
  shopInterior,
  medical,
  investing,
  training,
  firstBossKill,
}

export enum MasteryLevel {
  Novice,
  Apprentice,
  Adept,
  Expert,
  Master,
  Legend,
}

export const MasteryToBarrier: Record<MasteryLevel, number> = {
  [MasteryLevel.Novice]: 0,
  [MasteryLevel.Apprentice]: 50,
  [MasteryLevel.Adept]: 125,
  [MasteryLevel.Expert]: 225,
  [MasteryLevel.Master]: 350,
  [MasteryLevel.Legend]: 500,
};

export const MasteryToString: Record<MasteryLevel, string> = {
  [MasteryLevel.Novice]: "Novice",
  [MasteryLevel.Apprentice]: "Apprentice",
  [MasteryLevel.Adept]: "Adept",
  [MasteryLevel.Expert]: "Expert",
  [MasteryLevel.Master]: "Master",
  [MasteryLevel.Legend]: "Legend",
};
export const StringToMastery: Record<string, MasteryLevel> = {
  novice: MasteryLevel.Novice,
  apprentice: MasteryLevel.Apprentice,
  adept: MasteryLevel.Adept,
  expert: MasteryLevel.Expert,
  master: MasteryLevel.Master,
  legend: MasteryLevel.Legend,
};

export enum Element {
  fire,
  earth,
  air,
  water,
  summoning,
  pestilence,
  blood,
  bone,
  holy,
  vengeance,
  protection,
  beastMastery,
  assassination,
  arcane,
}

export const ElementToString: Record<Element, string> = {
  [Element.fire]: "Fire",
  [Element.earth]: "Earth",
  [Element.air]: "Air",
  [Element.water]: "Water",
  [Element.summoning]: "Summoning",
  [Element.pestilence]: "Pestilence",
  [Element.blood]: "Blood",
  [Element.bone]: "Bone",
  [Element.holy]: "Holy",
  [Element.vengeance]: "Vengeance",
  [Element.protection]: "Protection",
  [Element.beastMastery]: "Beast Mastery",
  [Element.assassination]: "Assassination",
  [Element.arcane]: "Arcane",
};
export const StringToElement: Record<string, Element> = {
  fire: Element.fire,
  earth: Element.earth,
  air: Element.air,
  water: Element.water,
  summoning: Element.summoning,
  pestilence: Element.pestilence,
  blood: Element.blood,
  bone: Element.bone,
  holy: Element.holy,
  vengeance: Element.vengeance,
  protection: Element.protection,
  beastMastery: Element.beastMastery,
  assassination: Element.assassination,
  arcane: Element.arcane,
};

export function isElement(value: number): value is Element {
  return value >= 0 && value <= 13;
}
export enum PlayerClassOptions {
  mage = "mage",
  necromancer = "necromancer",
  ranger = "ranger",
  paladin = "paladin",
}
export function isPlayerClassOptions(value: any): value is PlayerClassOptions {
  return Object.values(PlayerClassOptions).includes(value);
}

export enum AttackUse {
  success,
  miss,
  block,
  stunned,
  lowEnergy,
}

export type Activity = {
  name: string;
  cost: number;
  aloneCooldown?: number;
  alone?: {
    meetingSomeone: number;
    nothingHappens: number;
    randomGood: number;
    randomBad: number;
  };
  dateCooldown?: number;
  date?: {
    increaseAffection: number;
    increaseAffectionRange: { min: number; max: number };
    decreaseAffection: number;
    decreaseAffectionRange: { min: number; max: number };
  };
  randomBad?: BadOutcome[];
  randomGood?: GoodOutcome[];
};
export type BadOutcome = {
  name: string;
  buyOff?: { price: number };
  fight?: string;
  dungeonTitle?: string;
  effect?: { healthDamage?: number; sanityDamage?: number };
};
export type GoodOutcome = {
  name: string;
  effect: { gold?: number; healthRestore?: number; sanityRestore?: number };
};
export enum SkillPoint {
  Health,
  Mana,
  Sanity,
  AttackPower,
}
export type EffectOptions =
  | "stun"
  | "silenced"
  | "accuracy reduction"
  | "accuracy increase"
  | "sanity heal"
  | "sanity damage"
  | "sanityMax increase"
  | "sanityMax decrease"
  | "heal"
  | "health damage"
  | "healthMax increase"
  | "healthMax decrease"
  | "mana regen"
  | "mana drain"
  | "manaMax increase"
  | "manaMax decrease"
  | "armor increase"
  | "armor decrease"
  | "weaken"
  | "strengthen"
  | "destroy undead"
  | "undead cower"
  | "blur"
  | "thorns"
  | "trap"
  | "revenge"
  | "blood magic consumable"
  | "execute"
  | "stealth";

export type EffectStyle = "multiplier" | "percentage" | "flat";

export type ConditionType = {
  id?: string;
  name: string;
  style: "debuff" | "buff";
  turns: number;
  trapSetupTime?: number;
  effect: EffectOptions[];
  effectStyle: EffectStyle[];
  effectMagnitude: number[];
  healthDamage: number[];
  sanityDamage: number[];
  placedby: string;
  placedbyID: string;
  aura?: boolean;
  icon: string;
  on: PlayerCharacter | Enemy | Minion | null;
};

export type ConditionObjectType = {
  name: string;
  style: "debuff" | "buff";
  turns: number;
  trapSetupTime?: number;
  effect: EffectOptions[];
  effectStyle: EffectStyle[];
  effectAmount: number[];
  icon: string;
  aura?: boolean;
};

export interface checkReleasePositionProps {
  itemStack: Item[] | null;
  xPos: number;
  yPos: number;
  size: number;
  equipped?: boolean;
}

export type BeingType =
  | "block o wood"
  | "beast"
  | "undead"
  | "demi-human"
  | "human"
  | "draconic";

/**
 * This is used mostly for simplicity. While prop drilling wouldn't be too cumbersome, this makes management a bit easier
 * and reading the main DungeonLevelScreen's template
 */
export interface DungeonContextType {
  slug: string | string[];
  fightingBoss: boolean;
  setFightingBoss: React.Dispatch<React.SetStateAction<boolean>>;
  thisDungeon: DungeonLevel;
  thisInstance: DungeonInstance;
  attackAnimationOnGoing: boolean;
  setAttackAnimationOnGoing: React.Dispatch<React.SetStateAction<boolean>>;
  enemyDodgeDummy: number;
  setEnemyDodgeDummy: React.Dispatch<React.SetStateAction<number>>;
  enemyAttackDummy: number;
  setEnemyAttackDummy: React.Dispatch<React.SetStateAction<number>>;
  enemyTextString: string | undefined;
  setEnemyTextString: React.Dispatch<React.SetStateAction<string | undefined>>;
  inventoryFullNotifier: boolean;
  setInventoryFullNotifier: React.Dispatch<React.SetStateAction<boolean>>;
  droppedItems: {
    itemDrops: Item[];
    gold: number;
    storyDrops: Item[];
  } | null;
  leftBehindDrops: Item[];
  setDroppedItems: React.Dispatch<
    React.SetStateAction<{
      itemDrops: Item[];
      gold: number;
      storyDrops: Item[];
    } | null>
  >;
  setLeftBehindDrops: React.Dispatch<React.SetStateAction<Item[]>>;
  firstLoad: boolean;
  setFirstLoad: React.Dispatch<React.SetStateAction<boolean>>;
  enemyTextDummy: number;
  setEnemyTextDummy: React.Dispatch<React.SetStateAction<number>>;
  tiles: Tile[];
  setTiles: React.Dispatch<React.SetStateAction<Tile[]>>;
  inCombat: boolean;
  setInCombat: React.Dispatch<React.SetStateAction<boolean>>;
  currentPosition: Tile | null;
  setCurrentPosition: React.Dispatch<React.SetStateAction<Tile | null>>;
  mapDimensions: BoundingBox;
  setMapDimensions: React.Dispatch<React.SetStateAction<BoundingBox>>;
  level: string;
  instanceName: string;
  battleLogger: (whatHappened: string) => void;
  showFirstBossKillTutorial: boolean;
  setShowFirstBossKillTutorial: React.Dispatch<React.SetStateAction<boolean>>;
  shouldShowFirstBossKillTutorialAfterItemDrops: boolean;
  setShouldShowFirstBossKillTutorialAfterItemDrops: React.Dispatch<
    React.SetStateAction<boolean>
  >;
  showTargetSelection: {
    showing: boolean;
    chosenAttack: Attack | Spell | null;
  };
  setShowTargetSelection: React.Dispatch<
    React.SetStateAction<{
      showing: boolean;
      chosenAttack: Attack | Spell | null;
    }>
  >;
  displayItem: {
    item: Item[];
    positon: {
      left: number;
      top: number;
    };
  } | null;
  setDisplayItem: React.Dispatch<
    React.SetStateAction<{
      item: Item[];
      positon: {
        left: number;
        top: number;
      };
    } | null>
  >;
}

/**
 * This represents all data to be accessed at any level, most of which is set at the highest level (root) `_layout.tsx`
 */
export interface AppContextType {
  gameState: Game | undefined;
  setGameData: React.Dispatch<React.SetStateAction<Game | undefined>>;
  playerState: PlayerCharacter | undefined;
  setPlayerCharacter: React.Dispatch<
    React.SetStateAction<PlayerCharacter | undefined>
  >;
  enemyState: Enemy | null;
  setEnemy: React.Dispatch<React.SetStateAction<Enemy | null>>;
  logsState: string[];
  setLogs: React.Dispatch<React.SetStateAction<string[]>>;
  // the following are for controlling the player status stats display
  isCompact: boolean;
  setIsCompact: React.Dispatch<React.SetStateAction<boolean>>;
  showDetailedStatusView: boolean;
  setShowDetailedStatusView: React.Dispatch<React.SetStateAction<boolean>>;
  dimensions: {
    height: number;
    width: number;
    greater: number;
    lesser: number;
  };
  blockSize: number | undefined;
  setBlockSize: React.Dispatch<React.SetStateAction<number | undefined>>;
}
