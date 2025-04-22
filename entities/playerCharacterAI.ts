import { DamageType, PlayerClassOptions } from "@/utility/types";
import { Condition } from "./conditions";
import { ThreatTable } from "./threatTable";
import { RootStore } from "@/stores/RootStore";
import { Minion } from "./creatures";
import { makeObservable, observable } from "mobx";
import { PlayerCharacter } from "./character";

export interface AIPlayerCharacterInterface {
  root: RootStore;
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
}

/**
 * This class is used for PVP
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

  minions: Minion[];
  rangerPet: Minion | null;

  constructor({
    root,
    playerClass,
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
  }: AIPlayerCharacterInterface) {
    this.root = root;
    this.playerClass = playerClass;
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

    makeObservable(this, {
      currentHealth: observable,
      currentMana: observable,
      currentSanity: observable,
      conditions: observable,
      activeAuraConditionIds: observable,
      minions: observable,
      rangerPet: observable,
    });
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
    });
  }
}
