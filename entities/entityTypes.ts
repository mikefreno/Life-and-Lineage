import {
  AnimationOptions,
  EnemyImageKeyOption,
} from "@/utility/animation/enemy";
import {
  Attribute,
  BeingType,
  Personality,
  Element,
  PlayerClassOptions,
  ItemClassType,
} from "@/utility/types";
import { type Item } from "./item";
import { type RootStore } from "@/stores/RootStore";
import { JobData, type PlayerCharacter } from "./character";
import { type Enemy, type Minion } from "./creatures";
import { type Investment } from "./investment";
import { Condition } from "./conditions";

export interface BeingOptions {
  baseDexterity?: number;
  baseIntelligence?: number;
  baseStrength?: number;
  allocatedSkillPoints?: Record<Attribute, number>;

  id?: string;
  beingType: BeingType;
  sprite?: EnemyImageKeyOption;

  isPlayerCharacter?: boolean;
  equipment?: {
    mainHand: Item;
    offHand: Item | null;
    head: Item | null;
    body: Item | null;
    quiver: Item[] | null;
  };

  attackStrings?: string[];
  animationStrings: { [key: string]: string };

  conditions?: Condition[];
  debilitations?: Condition[];

  baseArmor?: number;

  baseMana: number;
  currentMana?: number;

  baseManaRegen: number;

  baseSanity?: number | null;
  currentSanity?: number | null;

  baseHealth: number;
  currentHealth?: number;

  baseDamageTable: { [key: string]: number };
  baseResistanceTable: { [key: string]: number };

  deathdate?: { year: number; week: number };
  alive?: boolean;
  activeAuraConditionIds: { attackName: string; conditionIDs: string[] }[];

  root: RootStore;
}

export interface BaseCharacterOptions extends BeingOptions {
  firstName: string;
  lastName: string;
  sex: "male" | "female";
  birthdate: { year: number; week: number };
  alive?: boolean;
  deathdate?: { year: number; week: number };
  job?: string;
  affection?: number;
  qualifications?: string[];
  dateCooldownStart?: { year: number; week: number };
  pregnancyDueDate?: { year: number; week: number };
  babyDaddyId?: string | null;
  isPregnant?: boolean;
  parentIds?: string[];
  childrenIds?: string[];
  partnerIds?: string[];
  knownCharacterIds?: string[];
  root: RootStore;
}

export interface CharacterOptions extends BaseCharacterOptions {
  personality: Personality | null;
}

export interface PlayerCharacterBase extends BaseCharacterOptions {
  magicProficiencies?: { school: Element; proficiency: number }[];
  jobs?: Map<string, JobData>;
  learningSpells?: {
    bookName: string;
    spellName: string;
    experience: number;
    element: Element;
  }[];
  qualificationProgress?: {
    name: string;
    progress: number;
    completed: boolean;
  }[];
  knownSpells?: string[];
  gold?: number;
  baseInventory?: Item[];
  keyItems?: Item[];
  minions?: Minion[];
  rangerPet?: Minion;
  investments?: Investment[];
  unAllocatedSkillPoints?: number;
  availableRespecs?: number;
}

export type MageCharacter = PlayerCharacterBase & {
  playerClass: PlayerClassOptions.mage;
  blessing: Element.fire | Element.water | Element.air | Element.earth;
};

export type NecromancerCharacter = PlayerCharacterBase & {
  playerClass: PlayerClassOptions.necromancer;
  blessing:
    | Element.blood
    | Element.summoning
    | Element.bone
    | Element.pestilence;
};

export type PaladinCharacter = PlayerCharacterBase & {
  playerClass: PlayerClassOptions.paladin;
  blessing: Element.holy | Element.vengeance | Element.protection;
};

export type RangerCharacter = PlayerCharacterBase & {
  playerClass: PlayerClassOptions.ranger;
  blessing: Element.assassination | Element.beastMastery | Element.arcane;
};

export type PlayerCharacterOptions =
  | MageCharacter
  | NecromancerCharacter
  | PaladinCharacter
  | RangerCharacter;

export interface CreatureOptions extends BeingOptions {
  creatureSpecies: string;
}

export interface Phase {
  triggerHealth: number;
  sprite?: EnemyImageKeyOption;
  dialogue?: string;
  baseArmor?: number;
  manaRegen?: number;
  attackStrings?: string[];
  animationStrings: { [key: string]: AnimationOptions };
  baseDamageTable?: { [key: string]: number };
  baseResistanceTable?: { [key: string]: number };
  health?: number;
}

export interface EnemyOptions extends CreatureOptions {
  phases?: Phase[];
  gotDrops?: boolean;
  minions?: Minion[];
  sprite: EnemyImageKeyOption;
  animationStrings: { [key: string]: AnimationOptions };
  drops: {
    item: string;
    itemType: ItemClassType;
    chance: number;
  }[];
  goldDropRange: {
    minimum: number;
    maximum: number;
  };
  storyDrops?: {
    item: string;
  }[];
}

export interface MinionOptions extends CreatureOptions {
  turnsLeftAlive: number;
  parent: Enemy | PlayerCharacter | null;
}
