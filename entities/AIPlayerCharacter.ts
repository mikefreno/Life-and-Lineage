import { DamageType, Element, PlayerClassOptions } from "@/utility/types";
import { Condition } from "./conditions";
import { ThreatTable } from "./threatTable";
import { RootStore } from "@/stores/RootStore";
import { Minion } from "./creatures";
import { computed, makeObservable, observable } from "mobx";
import { PlayerCharacter } from "./character";

export interface AIPlayerCharacterInterface {
  root: RootStore;
  blessing: Element;
  playerClass: PlayerClassOptions;
  name: string;
  maxHealth: number;
  maxSanity: number;
  maxMana: number;
  baseManaRegen: number;
  strength: number;
  intelligence: number;
  dexterity: number;
  resistanceTable: { [key in DamageType]?: number };
  damageTable: { [key in DamageType]?: number };
  attackStrings: string[];
  knownSpells: string[];
  winCount: number;
  lossCount: number;
}

/**
 * This class is used for PvP
 */
export class AIPlayerCharacter {
  root: RootStore;
  readonly playerClass: PlayerClassOptions;
  readonly name: string;

  currentHealth: number;
  readonly maxHealth: number;
  currentSanity: number;
  readonly maxSanity: number;
  currentMana: number;
  readonly maxMana: number;
  readonly baseManaRegen: number;

  readonly strength: number; // unlike the original class, this includes the Allocated points, equipment,etc, only conditions need be added
  readonly intelligence: number;
  readonly dexterity: number;

  readonly attackStrings: string[];
  readonly knownSpells: string[];
  readonly resistanceTable: { [key in DamageType]?: number };
  readonly damageTable: { [key in DamageType]?: number };

  threatTable: ThreatTable = new ThreatTable();

  conditions: Condition[];
  activeAuraConditionIds: { attackName: string; conditionIDs: string[] }[];
  winCount: number;
  lossCount: number;

  minions: Minion[];
  rangerPet: Minion | null;
  blessing: Element;

  constructor({
    root,
    playerClass,
    blessing,
    name,
    maxHealth,
    maxSanity,
    maxMana,
    baseManaRegen,
    strength,
    intelligence,
    dexterity,
    resistanceTable,
    damageTable,
    attackStrings,
    knownSpells,
    winCount,
    lossCount,
  }: AIPlayerCharacterInterface) {
    this.root = root;
    this.playerClass = playerClass;
    this.blessing = blessing;
    this.name = name;
    this.currentHealth = maxHealth;
    this.maxHealth = maxHealth;
    this.currentSanity = maxSanity;
    this.maxSanity = maxSanity;
    this.currentMana = maxMana;
    this.maxMana = maxMana;
    this.strength = strength;
    this.intelligence = intelligence;
    this.dexterity = dexterity;
    this.baseManaRegen = baseManaRegen;
    this.resistanceTable = resistanceTable;
    this.damageTable = damageTable;
    this.attackStrings = attackStrings;
    this.knownSpells = knownSpells;

    this.conditions = [];
    this.minions = [];
    this.activeAuraConditionIds = [];
    this.rangerPet = null;

    this.winCount = winCount;
    this.lossCount = lossCount;

    makeObservable(this, {
      currentHealth: observable,
      currentMana: observable,
      currentSanity: observable,
      conditions: observable,
      activeAuraConditionIds: observable,
      minions: observable,
      rangerPet: observable,
      rewardValue: computed,
    });
  }

  get rewardValue() {
    const ratio = this.winCount / Math.max(this.lossCount, 1);
    return Math.min(3, Math.max(1, ratio));
  }

  static create(player: PlayerCharacter) {
    const resistanceTable: Record<DamageType, number> = {
      [DamageType.PHYSICAL]: player.physicalDamageReduction,
      [DamageType.FIRE]: player.fireResistance,
      [DamageType.COLD]: player.coldResistance,
      [DamageType.LIGHTNING]: player.lightningResistance,
      [DamageType.POISON]: player.poisonResistance,
      [DamageType.HOLY]: player.holyResistance,
      [DamageType.MAGIC]: player.magicResistance,
      [DamageType.RAW]: 0,
    };

    const damageTable: Record<DamageType, number> = {
      [DamageType.PHYSICAL]: player.physicalDamage,
      [DamageType.FIRE]: player.fireDamage,
      [DamageType.COLD]: player.coldDamage,
      [DamageType.LIGHTNING]: player.lightningResistance,
      [DamageType.POISON]: player.poisonDamage,
      [DamageType.HOLY]: player.holyResistance,
      [DamageType.MAGIC]: player.magicResistance,
      [DamageType.RAW]: 0,
    };

    return new AIPlayerCharacter({
      root: player.root,
      playerClass: player.playerClass,
      name: player.pvpName,
      maxHealth: player.nonConditionalMaxHealth,
      maxSanity: player.nonConditionalMaxSanity ?? player.baseSanity ?? 50,
      maxMana: player.nonConditionalMaxMana,
      baseManaRegen: player.nonConditionalManaRegen,
      strength: player.nonConditionalStrength,
      intelligence: player.nonConditionalIntelligence,
      dexterity: player.nonConditionalDexterity,
      resistanceTable,
      damageTable,
      attackStrings: player.attackStrings,
      knownSpells: player.knownSpells,
      winCount: 0,
      lossCount: 0,
    });
  }
}
