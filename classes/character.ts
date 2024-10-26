import {
  getConditionEffectsOnDefenses,
  getConditionEffectsOnMisc,
} from "../utility/functions/conditions";
import { Condition } from "./conditions";
import { Item } from "./item";
import attacks from "../assets/json/playerAttacks.json";
import melee from "../assets/json/items/melee.json";
import wands from "../assets/json/items/wands.json";
import bows from "../assets/json/items/bows.json";
import mageSpells from "../assets/json/mageSpells.json";
import paladinSpells from "../assets/json/paladinSpells.json";
import necroSpells from "../assets/json/necroSpells.json";
import rangerSpells from "../assets/json/rangerSpells.json";
import { Enemy, Minion } from "./creatures";
import summons from "../assets/json/summons.json";
import { action, makeObservable, observable, computed, reaction } from "mobx";
import * as Crypto from "expo-crypto";
import { Investment } from "./investment";
import {
  InvestmentType,
  InvestmentUpgrade,
  ItemClassType,
  MasteryLevel,
  BeingType,
  Element,
  PlayerClassOptions,
  Attribute,
} from "../utility/types";
import {
  calculateAge,
  rollToLiveByAge,
  rollD20,
  damageReduction,
} from "../utility/functions/misc";
import type {
  BoundingBox,
  Tile,
} from "../components/DungeonComponents/DungeonMap";
import { Spell } from "./spell";
import { savePlayer } from "../utility/functions/save_load";

interface CharacterOptions {
  id?: string;
  firstName: string;
  lastName: string;
  sex: "male" | "female";
  birthdate?: string;
  alive?: boolean;
  deathdate?: string;
  job?: string;
  affection?: number;
  qualifications?: string[];
  dateCooldownStart?: string;
  parents?: Character[];
}

/**
 * This class fully contains characters like parents, children, met characters and shopkeepers (which are a property of the `Shop` class).
 * This class serves as a base for the player's character - `PlayerCharacter`
 */
export class Character {
  /**
   * Unique identifier for the character.
   */
  readonly id: string;

  /**
   * Type of being (always "human" for this class).
   */
  readonly beingType = "human";

  /**
   * First name of the character.
   */
  readonly firstName: string;

  /**
   * Last name of the character.
   */
  lastName: string;

  /**
   * Sex of the character ("male" or "female").
   */
  readonly sex: "male" | "female";

  /**
   * Indicates whether the character is alive.
   */
  alive: boolean;

  /**
   * Birthdate of the character in ISO format.
   */
  readonly birthdate: string;

  /**
   * Deathdate of the character in ISO format, or null if the character is alive.
   */
  deathdate: string | null;

  /**
   * Job title of the character.
   */
  job: string;

  /**
   * Affection level of the character towards the player.
   */
  affection: number;

  /**
   * List of qualifications the character has.
   */
  qualifications: string[];

  /**
   * Start date of the cooldown period for the character in ISO format, if applicable.
   */
  dateCooldownStart?: string;
  /**
   * Will be null if not pregnant, the string is in ISO format
   */
  pregnancyDueDate?: string | null;
  parents?: Character[];

  constructor({
    id,
    firstName,
    lastName,
    sex,
    alive,
    birthdate,
    deathdate,
    job,
    affection,
    qualifications,
    dateCooldownStart,
    parents,
  }: CharacterOptions) {
    this.id = id ?? Crypto.randomUUID();
    this.firstName = firstName;
    this.lastName = lastName;
    this.sex = sex;
    this.alive = alive ?? true;
    this.birthdate = birthdate ?? new Date().toISOString();
    this.deathdate = deathdate ?? null;
    this.job = job ?? "Unemployed";
    this.affection = affection ?? 0;
    this.qualifications = qualifications ?? [];
    this.dateCooldownStart = dateCooldownStart;
    this.parents = parents;
    makeObservable(this, {
      alive: observable,
      deathdate: observable,
      job: observable,
      affection: observable,
      qualifications: observable,
      dateCooldownStart: observable,
      fullName: computed,
      setJob: action,
      deathRoll: action,
      setDateCooldownStart: action,
      updateAffection: action,
      lastName: observable,
      updateLastName: action,
      kill: action,
      setParents: action,
    });
  }

  /**
   * Used to check if the character object is the same as another.
   * @param otherCharacter - The character to compare with.
   * @returns True if the characters have the same ID, false otherwise.
   */
  public equals(otherCharacter: Character): boolean {
    return this.id === otherCharacter.id;
  }

  /**
   * Computed property that returns the full name of the character.
   * @returns The character's full name (first name + last name).
   */
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  /**
   * Adds a qualification to the character's qualifications list.
   * @param qual - The qualification to add.
   */
  public addQualification(qual: string): void {
    this.qualifications.push(qual);
  }

  /**
   * Sets the character's job.
   * @param job - The new job title.
   */
  public setJob(job: string): void {
    this.job = job;
  }

  /**
   * Sets the start date of the cooldown period for the character.
   * @param date - The date string in ISO format.
   */
  public setDateCooldownStart(date: string): void {
    this.dateCooldownStart = date;
  }

  public kill() {
    this.alive = false;
    this.deathdate = new Date().toISOString();
  }

  /**
   * Simulates a death roll for the character. This is called on non-player characters to determine if they survive or not.
   * @param gameDate - The current date of the game.
   */
  public deathRoll(gameDate: Date): void {
    if (!(this instanceof PlayerCharacter)) {
      const age = calculateAge(new Date(this.birthdate), gameDate);
      const rollToLive = rollToLiveByAge(age);

      const rollOne = rollD20();
      if (rollOne >= rollToLive) return;
      const rollTwo = rollD20();
      if (rollTwo >= rollToLive) return;
      const rollThree = rollD20();
      if (rollThree >= rollToLive) return;

      this.kill();
    }
  }

  /**
   * Updates the character's affection towards the player.
   * Affection is used to calculate prices in shops and allows for certain character interactions.
   * @param change - The amount to add to the current affection level.
   */
  public updateAffection(change: number): void {
    if (this.affection + change >= 100) {
      this.affection = 100;
    } else if (this.affection + change < -100) {
      this.affection = -100;
    } else {
      this.affection += change;
    }
  }

  public updateLastName(newLastName: string) {
    this.lastName = newLastName;
  }

  public setParents(parent1: PlayerCharacter, parent2?: Character) {
    const newParents: Character[] = [parent1];
    if (parent2) {
      newParents.push(parent2);
    }
    this.parents = newParents;
  }

  /**
   * Creates a Character object from a JSON object.
   * @param json - The JSON object representing the character.
   * @returns A new Character instance.
   */
  static fromJSON(json: any): Character {
    const character = new Character({
      id: json.id,
      firstName: json.firstName,
      lastName: json.lastName,
      sex: json.sex,
      birthdate: json.birthdate ?? undefined,
      alive: json.alive,
      deathdate: json.deathdate ?? null,
      job: json.job,
      affection: json.affection,
      qualifications: json.qualifications,
      dateCooldownStart: json.dateCooldownStart,
      parents: json.parents
        ? json.parents.map((parent: any) => Character.fromJSON(parent))
        : undefined,
    });
    return character;
  }
}

type PlayerCharacterBase = {
  id?: string;
  //required values to creation
  firstName: string;
  lastName: string;
  sex: "male" | "female";
  baseHealth: number;
  baseMana: number;
  baseSanity: number;
  baseStrength: number;
  baseIntelligence: number;
  baseDexterity: number;
  baseManaRegen: number;
  parents: Character[];
  birthdate: string;

  //values that are set based on above, vary during normal gameplay
  currentHealth?: number;
  currentMana?: number;
  currentSanity?: number;
  deathdate?: string;
  job?: string;
  qualifications?: string[];
  affection?: number;
  magicProficiencies?: { school: Element; proficiency: number }[];
  jobExperience?: {
    job: string;
    experience: number;
    rank: number;
  }[];
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
  children?: Character[];
  partners?: Character[];
  knownCharacters?: Character[];
  physicalAttacks?: string[];
  knownSpells?: string[];
  gold?: number;
  conditions?: Condition[];
  inventory?: Item[];
  keyItems?: Item[];
  minions?: Minion[];
  rangerPet?: Minion; // used to avoid removal within a dungeon
  currentDungeon?: {
    instance: string;
    level: string;
    dungeonMap: Tile[];
    currentPosition: Tile;
    enemy: Enemy | null;
    fightingBoss: boolean;
    mapDimensions: {
      width: number;
      height: number;
      offsetX: number;
      offsetY: number;
    };
  } | null;
  equipment?: {
    mainHand: Item;
    offHand: Item | null;
    head: Item | null;
    body: Item | null;
    quiver: Item[] | null;
  };
  investments?: Investment[];
  unAllocatedSkillPoints?: number;
  allocatedSkillPoints?: Record<Attribute, number>;
  alive?: boolean;
};

type MageCharacter = PlayerCharacterBase & {
  playerClass: "mage" | PlayerClassOptions.mage;
  blessing: Element.fire | Element.water | Element.air | Element.earth;
};
type NecromancerCharacter = PlayerCharacterBase & {
  playerClass: "necromancer" | PlayerClassOptions.necromancer;
  blessing:
    | Element.blood
    | Element.summoning
    | Element.bone
    | Element.pestilence;
};
type PaladinCharacter = PlayerCharacterBase & {
  playerClass: "paladin" | PlayerClassOptions.paladin;
  blessing: Element.holy | Element.vengeance | Element.protection;
};
type RangerCharacter = PlayerCharacterBase & {
  playerClass: "ranger" | PlayerClassOptions.ranger;
  blessing: Element.assassination | Element.beastMastery | Element.arcane;
};

type PlayerCharacterOptions =
  | MageCharacter
  | NecromancerCharacter
  | PaladinCharacter
  | RangerCharacter;

/**
 * This is the heart of most state and progression changes in the game, with the only notable exceptions being the game time and
 * the dungeons, which are both in the game class as these persist specific player characters
 */
export class PlayerCharacter extends Character {
  readonly playerClass: PlayerClassOptions;
  readonly blessing: Element;
  readonly parents: Character[];

  children: Character[];
  partners: Character[];
  knownCharacters: Character[];

  baseHealth: number;
  baseSanity: number;
  baseMana: number;
  baseManaRegen: number;
  baseStrength: number;
  baseIntelligence: number;
  baseDexterity: number;

  currentSanity: number;
  currentMana: number;
  currentHealth: number;

  gold: number;

  magicProficiencies: { school: Element; proficiency: number }[];

  unAllocatedSkillPoints: number;
  allocatedSkillPoints: Record<Attribute, number>;

  knownSpells: string[];
  /**
   * Spells currently being learned by the player
   */
  learningSpells: {
    bookName: string;
    spellName: string;
    experience: number;
    element: Element;
  }[];

  minions: Minion[];
  /**
   * Non-despawning pet, only ever not-null (had) by a Ranger class player
   */
  rangerPet: Minion | null;

  jobExperience: { job: string; experience: number; rank: number }[];
  qualificationProgress: {
    name: string;
    progress: number;
    completed: boolean;
  }[];

  conditions: Condition[];
  /**
   * Player's inventory, this should not be used for rendering items, getInventory should be as it stacks items
   */
  inventory: Item[];
  /**
   * Story Items, this can be directly rendered, none of these stack
   */
  keyItems: Item[];
  currentDungeon: {
    instance: string;
    level: string;
    dungeonMap: Tile[];
    currentPosition: Tile;
    enemy: Enemy | null;
    fightingBoss: boolean;
    mapDimensions: BoundingBox;
  } | null;
  equipment: {
    // nulls indicate a lack of equipment in the given slot
    mainHand: Item; // main hand is never null, weapons are replaced with 'unarmored'
    offHand: Item | null;
    head: Item | null;
    body: Item | null;
    quiver: Item[] | null;
  };
  investments: Investment[];

  constructor({
    id,
    firstName,
    lastName,
    playerClass,
    blessing,
    sex,
    alive,
    birthdate,
    deathdate,
    job,
    qualifications,
    currentHealth,
    baseHealth,
    currentSanity,
    baseSanity,
    currentMana,
    baseMana,
    rangerPet,
    baseManaRegen,
    baseStrength,
    baseIntelligence,
    baseDexterity,
    minions,
    jobExperience,
    learningSpells,
    qualificationProgress,
    magicProficiencies,
    conditions,
    parents,
    children,
    partners,
    knownCharacters,
    knownSpells,
    gold,
    inventory,
    currentDungeon,
    equipment,
    investments,
    unAllocatedSkillPoints,
    allocatedSkillPoints,
    keyItems,
  }: PlayerCharacterOptions) {
    super({
      id,
      firstName,
      lastName,
      sex,
      birthdate,
      alive,
      deathdate,
      job,
      qualifications,
    });
    this.playerClass = PlayerClassOptions[playerClass];
    this.blessing = blessing;

    this.parents = parents;

    this.baseHealth = baseHealth;
    this.baseSanity = baseSanity;
    this.baseMana = baseMana;
    this.baseStrength = baseStrength;
    this.baseIntelligence = baseIntelligence;
    this.baseDexterity = baseDexterity;
    this.baseManaRegen = baseManaRegen;

    this.magicProficiencies =
      magicProficiencies ??
      getStartingProficiencies(PlayerClassOptions[playerClass], blessing);

    this.currentHealth = currentHealth ?? baseHealth;
    this.currentSanity = currentSanity ?? baseSanity;
    this.currentMana = currentMana ?? baseMana;

    this.unAllocatedSkillPoints = unAllocatedSkillPoints ?? __DEV__ ? 100 : 0;
    this.allocatedSkillPoints = allocatedSkillPoints ?? {
      [Attribute.health]: 0,
      [Attribute.mana]: 0,
      [Attribute.sanity]: 0,
      [Attribute.strength]: 0,
      [Attribute.dexterity]: 0,
      [Attribute.intelligence]: 0,
    };

    this.gold = gold !== undefined ? gold : __DEV__ ? 1000000 : 500;

    this.minions = minions ?? [];
    this.rangerPet = rangerPet ?? null;

    this.jobExperience = jobExperience ?? [];
    this.learningSpells = learningSpells ?? [];
    this.qualificationProgress = qualificationProgress ?? [];

    this.children = children ?? [];
    this.partners = partners ?? [];
    this.knownCharacters = knownCharacters ?? [];
    this.knownSpells = knownSpells ?? [];
    this.conditions = conditions ?? [];

    this.inventory = inventory ?? [];
    this.keyItems = keyItems ?? [];
    this.currentDungeon = currentDungeon ?? null;
    this.equipment = equipment ?? {
      mainHand: new Item({
        name: "unarmored",
        slot: "one-hand",
        stats: { baseDamage: 1 },
        baseValue: 0,
        itemClass: ItemClassType.Melee,
        player: null,
        attacks: ["punch"],
      }),
      offHand: null,
      head: null,
      body: null,
      quiver: null,
    };
    this.investments = investments ?? [];

    // this is where we set what is to be watched for mutation by mobX.
    // observable are state that is for mutated attributes, computed are for `get`s and
    // actions are methods to be tracked that manipulate any attributes, needed in strict mode
    makeObservable(this, {
      baseHealth: observable,
      currentHealth: observable,
      maxHealth: computed, // this is all effects, base, stat points, gear + conditions
      nonConditionalMaxHealth: computed, // refers to base, stat points, + gear only
      restoreHealth: action,
      damageHealth: action,

      baseSanity: observable,
      currentSanity: observable,
      maxSanity: computed,
      nonConditionalMaxSanity: computed,
      restoreSanity: action,
      damageSanity: action,
      changeBaseSanity: action,

      baseMana: observable,
      currentMana: observable,
      maxMana: computed,
      restoreMana: action,
      nonConditionalMaxMana: computed,
      useMana: action,

      baseManaRegen: observable,
      totalManaRegen: computed,
      nonConditionalManaRegen: computed,
      regenMana: action,

      baseStrength: observable,
      totalStrength: computed,
      baseIntelligence: observable,
      totalIntelligence: computed,
      baseDexterity: observable,
      totalDexterity: computed,
      attackPower: computed,
      magicPower: computed,

      addSkillPoint: action,
      removeSkillPoint: action,
      allocatedSkillPoints: observable,
      unAllocatedSkillPoints: observable,

      gold: observable,
      spendGold: action,
      addGold: action,
      getReadableGold: action,

      getInvestment: action,
      collectFromInvestment: action,
      tickAllInvestments: action,
      purchaseInvestmentBase: action,
      purchaseInvestmentUpgrade: action,

      learnSpellStep: action,
      spells: computed,
      learningSpells: observable,
      magicProficiencies: observable,
      knownSpells: observable,

      minions: observable,
      createMinion: action,
      summonPet: action,
      clearMinions: action,
      removeMinion: action,

      physicalAttacks: computed,
      useArrow: action,
      pass: action,

      isStunned: computed,
      addCondition: action,
      conditionTicker: action,
      removeCondition: action,

      jobExperience: observable,
      getCurrentJobAndExperience: action,
      incrementQualificationProgress: action,
      qualificationProgress: observable,
      getJobExperience: action,
      removeEquipment: action,
      performLabor: action,
      getSpecifiedQualificationProgress: action,

      children: observable,
      partners: observable,
      conditions: observable,
      inventory: observable,
      currentDungeon: observable,
      investments: observable,
      adopt: action,
      makePartner: action,

      addToInventory: action,
      addToKeyItems: action,
      buyItem: action,
      removeFromInventory: action,
      sellItem: action,
      equipment: observable,
      equipItem: action,
      unEquipItem: action,
      getInventory: observable,
      getDamageReduction: action,
      reinstateLinks: action,

      getMedicalService: action,
      setInDungeon: action,
      bossDefeated: action,
    });

    reaction(
      () => [
        this.currentHealth,
        this.currentMana,
        this.currentSanity,
        this.gold,
        this.unAllocatedSkillPoints,
        this.equipmentStats,
      ],
      () => {
        savePlayer(this);
      },
    );
  }
  //----------------------------------Stats----------------------------------//
  public bossDefeated() {
    this.addSkillPoint({ amount: 3 });
  }

  /**
   * Adds skill points to a specific attribute or to unallocated points
   * @param amount - the amount of skill points to add, defaults to 1.
   * @param to - the attribute to add skill points to
   * */
  public addSkillPoint({
    amount = 1,
    to = "unallocated",
  }: {
    amount?: number;
    to?: Attribute | "unallocated";
  }) {
    switch (to) {
      case Attribute.health:
      case Attribute.mana:
      case Attribute.sanity:
      case Attribute.strength:
      case Attribute.intelligence:
      case Attribute.dexterity:
        this.allocatedSkillPoints[to] += amount;
        this.unAllocatedSkillPoints -= amount;
        break;
      case "unallocated":
        this.unAllocatedSkillPoints += amount;
        break;
    }
  }

  public removeSkillPoint({
    amount = 1,
    from,
  }: {
    amount?: number;
    from: Attribute;
  }) {
    if (this.allocatedSkillPoints[from] >= amount) {
      this.allocatedSkillPoints[from] -= amount;
      this.addSkillPoint({ amount });
    }
  }

  public getTotalAllocatedPoints() {
    return (
      this.allocatedSkillPoints[Attribute.health] +
      this.allocatedSkillPoints[Attribute.mana] +
      this.allocatedSkillPoints[Attribute.sanity] +
      this.allocatedSkillPoints[Attribute.strength] +
      this.allocatedSkillPoints[Attribute.intelligence] +
      this.allocatedSkillPoints[Attribute.dexterity]
    );
  }
  //----------------------------------Health----------------------------------//
  get maxHealth() {
    const { healthFlat, healthMult } = getConditionEffectsOnDefenses(
      this.conditions,
    );
    return (
      (this.baseHealth + this.allocatedSkillPoints[Attribute.health] * 10) *
        healthMult +
      this.equipmentStats.health +
      healthFlat
    );
  }

  get nonConditionalMaxHealth() {
    return (
      this.baseHealth +
      this.allocatedSkillPoints[Attribute.health] * 10 +
      this.equipmentStats.health
    );
  }
  /**
   * attackerId is here to conform with the Creature implementation, it is unused
   */
  public damageHealth({
    damage,
  }: {
    attackerId: string;
    damage: number | null;
  }) {
    if (damage) {
      if (this.currentHealth - damage > this.maxHealth) {
        this.currentHealth = this.maxHealth;
        return this.currentHealth;
      }
      this.currentHealth -= damage;
    }
    return this.currentHealth;
  }

  public restoreHealth(amount: number) {
    if (this.currentHealth + amount < this.maxHealth) {
      this.currentHealth += amount;
      return amount;
    } else {
      const amt = this.maxHealth - this.currentHealth;
      this.currentHealth = this.maxHealth;
      return amt;
    }
  }

  //----------------------------------Mana----------------------------------//
  get maxMana() {
    const { manaMaxFlat, manaMaxMult } = getConditionEffectsOnMisc(
      this.conditions,
    );
    return (
      (this.baseMana + this.allocatedSkillPoints[Attribute.mana] * 10) *
        manaMaxMult +
      this.equipmentStats.mana +
      manaMaxFlat
    );
  }

  get nonConditionalMaxMana() {
    return (
      this.baseMana +
      this.allocatedSkillPoints[Attribute.mana] * 10 +
      this.equipmentStats.mana
    );
  }

  get totalManaRegen() {
    const { manaRegenFlat, manaRegenMult } = getConditionEffectsOnMisc(
      this.conditions,
    );
    return (
      this.baseManaRegen * manaRegenMult +
      this.equipmentStats.regen +
      manaRegenFlat
    );
  }

  get nonConditionalManaRegen() {
    return this.baseManaRegen + this.equipmentStats.regen;
  }

  public useMana(mana: number) {
    this.currentMana -= mana;
  }

  public restoreMana(amount: number) {
    if (this.currentMana + amount < this.maxMana) {
      this.currentMana += amount;
    } else {
      this.currentMana = this.maxMana;
    }
  }

  public regenMana() {
    if (this.currentMana + this.totalManaRegen < this.maxMana) {
      this.currentMana += this.totalManaRegen;
    } else {
      this.currentMana = this.maxMana;
    }
  }
  //----------------------------------Sanity----------------------------------//
  get maxSanity() {
    const { sanityFlat, sanityMult } = getConditionEffectsOnDefenses(
      this.conditions,
    );
    return (
      (this.baseSanity + this.allocatedSkillPoints[Attribute.sanity] * 5) *
        sanityMult +
      this.equipmentStats.sanity +
      sanityFlat
    );
  }

  get nonConditionalMaxSanity() {
    return (
      this.baseSanity +
      this.allocatedSkillPoints[Attribute.sanity] * 5 +
      this.equipmentStats.sanity
    );
  }

  public damageSanity(damage?: number | null) {
    if (damage) {
      this.currentSanity -= damage;
    }
    return this.currentSanity;
  }

  public restoreSanity(amount: number) {
    if (this.currentSanity + amount < this.maxSanity) {
      this.currentSanity += amount;
    } else {
      this.currentSanity = this.maxSanity;
    }
  }

  public changeBaseSanity(change: number) {
    this.baseSanity += change;
    if (this.currentSanity > this.baseSanity) {
      this.currentSanity = this.baseSanity;
    }
  }

  //----------------------------------Strength-----------------------------------//
  get totalStrength() {
    // needs conditionals added to it, at time of righting no conditions affect this stat

    return (
      this.baseStrength +
      this.allocatedSkillPoints[Attribute.strength] +
      this.equipmentStats.strength
    );
  }

  get nonConditionalStrength() {
    return (
      this.baseStrength +
      this.allocatedSkillPoints[Attribute.strength] +
      this.equipmentStats.strength
    );
  }

  get attackPower() {
    return this.totalStrength * 0.5 + this.equipmentStats.damage;
  }
  //----------------------------------Intelligence-------------------------------//
  get totalIntelligence() {
    // needs conditionals added to it, at time of righting no conditions affect this stat

    return (
      this.baseIntelligence +
      this.allocatedSkillPoints[Attribute.intelligence] +
      this.equipmentStats.intelligence
    );
  }

  get nonConditionalIntelligence() {
    return (
      this.baseIntelligence +
      this.allocatedSkillPoints[Attribute.intelligence] +
      this.equipmentStats.intelligence
    );
  }
  get magicPower() {
    return this.totalIntelligence * 0.5;
  }
  //----------------------------------Dexterity-------------------------------//
  get totalDexterity() {
    // needs conditionals added to it, at time of righting no conditions affect this stat

    return (
      this.baseDexterity +
      this.allocatedSkillPoints[Attribute.dexterity] +
      this.equipmentStats.dexterity
    );
  }

  get nonConditionalDexterity() {
    return (
      this.baseDexterity +
      this.allocatedSkillPoints[Attribute.dexterity] +
      this.equipmentStats.dexterity
    );
  }
  get criticalChance() {
    return this.totalDexterity * 0.1;
  }
  //----------------------------------Inventory----------------------------------//
  public addToInventory(item: Item | Item[] | null) {
    if (Array.isArray(item)) {
      this.inventory = this.inventory.concat(item);
    } else if (item && item.name !== "unarmored") {
      this.inventory.push(item);
    }
  }

  public addToKeyItems(item: Item | Item[]) {
    if (Array.isArray(item)) {
      if (item.find((item) => item.itemClass !== ItemClassType.StoryItem)) {
        return;
      }
      this.keyItems = this.keyItems.concat(item);
    } else if (item && item.itemClass === ItemClassType.StoryItem) {
      this.inventory.push(item);
    }
  }

  public removeFromInventory(itemOrItems: Item | Item[]) {
    if (Array.isArray(itemOrItems)) {
      itemOrItems.forEach((item) => this.removeSingleItem(item));
    } else {
      this.removeSingleItem(itemOrItems);
    }
  }
  private removeSingleItem(item: Item) {
    const idx = this.inventory.findIndex((invItem) => invItem.equals(item));
    if (idx !== -1) {
      this.inventory.splice(idx, 1);
    }
  }

  public buyItem(itemOrItems: Item | Item[], buyPrice: number) {
    const items = Array.isArray(itemOrItems) ? itemOrItems : [itemOrItems];
    const totalCost = items.length * Math.floor(buyPrice);

    if (totalCost <= this.gold) {
      items.forEach((item) => {
        this.inventory.push(item);
      });
      this.gold -= totalCost;
    } else {
      throw new Error("Not enough gold to complete the purchase");
    }
  }

  public sellItem(itemOrItems: Item | Item[], sellPrice: number) {
    const items = Array.isArray(itemOrItems) ? itemOrItems : [itemOrItems];
    let soldCount = 0;

    items.forEach((item) => {
      const idx = this.inventory.findIndex((invItem) => invItem.equals(item));
      if (idx !== -1) {
        this.inventory.splice(idx, 1);
        soldCount++;
      }
    });

    this.gold += Math.floor(sellPrice) * soldCount;

    if (soldCount < items.length) {
      console.warn(
        `Only ${soldCount} out of ${items.length} items were found and sold.`,
      );
    }
  }

  get equipmentStats() {
    let armor = 0;
    let damage = 0;
    let mana = 0;
    let regen = 0;
    let health = 0;
    let sanity = 0;
    let blockChance = 0;
    let strength = 0;
    let intelligence = 0;
    let dexterity = 0;

    for (const [_, item] of Object.entries(this.equipment)) {
      if (item && "length" in item) {
        if (this.equipment.mainHand.itemClass === ItemClassType.Bow) {
          const stats = item[0]?.stats;
          if (!stats || !item[0].playerHasRequirements) continue;
          armor += stats.armor ?? 0;
          damage += stats.damage ?? 0;
          mana += stats.mana ?? 0;
          regen += stats.regen ?? 0;
          health += stats.health ?? 0;
          sanity += stats.sanity ?? 0;
          blockChance += stats.blockChance ?? 0;
          strength += stats.strength ?? 0;
          intelligence += stats.intelligence ?? 0;
          dexterity += stats.dexterity ?? 0;
        }
      } else {
        const stats = item?.stats;
        if (!stats || !item.playerHasRequirements) continue;
        armor += stats.armor ?? 0;
        damage += stats.damage ?? 0;
        mana += stats.mana ?? 0;
        regen += stats.regen ?? 0;
        health += stats.health ?? 0;
        sanity += stats.sanity ?? 0;
        blockChance += stats.blockChance ?? 0;
        strength += stats.strength ?? 0;
        intelligence += stats.intelligence ?? 0;
        dexterity += stats.dexterity ?? 0;
      }
    }

    return {
      armor,
      damage,
      mana,
      regen,
      health,
      sanity,
      blockChance,
      strength,
      intelligence,
      dexterity,
    };
  }

  public equipItem(item: Item[]) {
    const offsets = this.gatherOffsets();
    switch (item[0].slot) {
      case "head":
        this.removeEquipment("head");
        this.equipment.head = item[0];
        this.removeFromInventory(item[0]);
        break;
      case "body":
        this.removeEquipment("body");
        this.equipment.body = item[0];
        this.removeFromInventory(item[0]);
        break;
      case "off-hand":
        this.removeEquipment("offHand");
        if (this.equipment.mainHand.slot == "two-hand") {
          this.removeEquipment("mainHand");
          this.setUnarmored();
        }
        this.equipment.offHand = item[0];
        this.removeFromInventory(item[0]);
        break;
      case "two-hand":
        this.removeEquipment("mainHand");
        this.removeEquipment("offHand");
        this.equipment.mainHand = item[0];
        this.removeFromInventory(item[0]);
        break;
      case "one-hand":
        if (this.equipment.mainHand.name == "unarmored") {
          this.equipment.mainHand = item[0];
        } else if (this.equipment.mainHand.slot == "two-hand") {
          this.removeEquipment("mainHand");
          this.equipment.mainHand = item[0];
        } else {
          if (this.equipment.offHand?.slot == "off-hand") {
            this.removeEquipment("mainHand");
            this.equipment.mainHand = item[0];
          } else {
            this.removeEquipment("offHand");
            this.equipment.offHand = item[0];
          }
        }
        this.removeFromInventory(item[0]);
        break;
      case "quiver":
        this.removeEquipment("quiver");
        this.equipment.quiver = item;
        this.removeFromInventory(item);
        break;
    }
    this.resolveOffsets(offsets);
  }

  private gatherOffsets() {
    return {
      health: this.maxHealth - this.currentHealth,
      mana: this.maxMana - this.currentMana,
      sanity: this.maxSanity - this.currentSanity,
    };
  }
  private resolveOffsets({
    health,
    mana,
    sanity,
  }: {
    health: number;
    mana: number;
    sanity: number;
  }) {
    this.currentHealth = this.maxHealth - health;
    this.currentMana = this.maxMana - mana;
    this.currentSanity = this.maxSanity - sanity;
  }

  public equippedCheck(item: Item) {
    if (this.equipment.body?.equals(item)) {
      return true;
    } else if (this.equipment.head?.equals(item)) {
      return true;
    } else if (this.equipment.mainHand.equals(item)) {
      return true;
    } else if (this.equipment.offHand?.equals(item)) {
      return true;
    }
    return false;
  }

  public unEquipItem(item: Item[]) {
    const offsets = this.gatherOffsets();
    if (this.equipment.body?.equals(item[0])) {
      this.removeEquipment("body");
    } else if (this.equipment.head?.equals(item[0])) {
      this.removeEquipment("head");
    } else if (this.equipment.mainHand.equals(item[0])) {
      this.removeEquipment("mainHand");
    } else if (this.equipment.offHand?.equals(item[0])) {
      this.removeEquipment("offHand");
    } else if (this.equipment.quiver?.find((arrow) => arrow.equals(item[0]))) {
      this.removeEquipment("quiver");
    }
    this.resolveOffsets(offsets);
  }

  public removeEquipment(
    slot: "mainHand" | "offHand" | "body" | "head" | "quiver",
  ) {
    if (slot === "mainHand") {
      this.addToInventory(this.equipment.mainHand);
      this.setUnarmored();
    } else if (slot === "offHand") {
      this.addToInventory(this.equipment.offHand);
      this.equipment.offHand = null;
    } else if (slot == "body") {
      this.addToInventory(this.equipment.body);
      this.equipment.body = null;
    } else if (slot == "head") {
      this.addToInventory(this.equipment.head);
      this.equipment.head = null;
    } else if (slot == "quiver") {
      this.addToInventory(this.equipment.quiver);
      this.equipment.quiver = null;
    }
  }

  /**
   * This should always be used over the `inventory` field
   */
  public getInventory() {
    const condensedInventory: { item: Item[] }[] = [];
    this.inventory.forEach((item) => {
      if (item.stackable) {
        let found = false;
        condensedInventory.forEach((entry) => {
          if (entry.item[0].name == item.name) {
            found = true;
            entry.item.push(item);
          }
        });
        if (!found) {
          condensedInventory.push({ item: [item] });
        }
      } else {
        condensedInventory.push({ item: [item] });
      }
    });
    return condensedInventory;
  }

  /**
   * This includes `conditional` effects, it returns a float between 0 and 0.925 (hard cap)
   */
  public getDamageReduction() {
    const { armorMult, armorFlat } = getConditionEffectsOnDefenses(
      this.conditions,
    );
    return damageReduction(this.equipmentStats.armor * armorMult + armorFlat);
  }

  private setUnarmored() {
    this.equipment.mainHand = new Item({
      name: "unarmored",
      slot: "one-hand",
      stats: { baseDamage: 1 },
      baseValue: 0,
      itemClass: ItemClassType.Melee,
      player: this,
      attacks: ["punch"],
    });
  }

  //----------------------------------Gold----------------------------------//
  public getReadableGold() {
    if (this.gold > 10_000_000_000) {
      const cleanedUp = (this.gold / 1_000_000_000).toFixed(2);
      return `${parseFloat(cleanedUp).toLocaleString()}B`;
    }
    if (this.gold > 10_000_000) {
      const cleanedUp = (this.gold / 1_000_000).toFixed(2);
      return `${parseFloat(cleanedUp).toLocaleString()}M`;
    }
    if (this.gold > 10_000) {
      const cleanedUp = (this.gold / 1000).toFixed(2);
      return `${parseFloat(cleanedUp).toLocaleString()}K`;
    } else return this.gold.toLocaleString();
  }

  public spendGold(amount: number) {
    if (amount <= this.gold) {
      this.gold -= amount;
    } else {
      this.gold = 0;
    }
  }
  public addGold(gold: number) {
    this.gold += gold;
  }
  //----------------------------------Work----------------------------------//
  public getCurrentJobAndExperience() {
    const job = this.jobExperience.find((job) => job.job == this.job);
    return { title: this.job, experience: job?.experience ?? 0 };
  }
  public getJobExperience(title: string): number {
    const job = this.jobExperience.find((job) => job.job === title);
    return job ? job.experience : 0;
  }

  public performLabor({ title, cost, goldReward }: performLaborProps) {
    if (this.currentMana >= cost.mana) {
      if (this.job !== title) {
        throw new Error("Requested Labor on unassigned profession");
      } else {
        if (cost.health) {
          this.damageHealth({ damage: cost.health, attackerId: this.id });
        }
        if (cost.sanity) {
          this.damageSanity(cost.sanity);
        }
        this.useMana(cost.mana);
        this.addGold(goldReward);
        this.gainExperience();
      }
    }
  }

  public getRewardValue(jobTitle: string, baseReward: number) {
    const job = this.jobExperience.find((job) => job.job == jobTitle);
    if (job) {
      return Math.floor(baseReward + (baseReward * job.rank) / 5);
    } else {
      return baseReward;
    }
  }

  public getJobRank(jobTitle: string) {
    const job = this.jobExperience.find((job) => job.job === jobTitle);
    return job ? job.rank : 0;
  }

  private gainExperience() {
    let jobFound = false;

    this.jobExperience.forEach((job) => {
      if (job.job === this.job) {
        jobFound = true;
        if (job.experience < 49) {
          job.experience++;
        } else {
          job.experience = 0;
          job.rank++;
        }
      }
    });

    if (!jobFound) {
      this.jobExperience.push({ job: this.job, experience: 1, rank: 0 });
    }
  }
  //----------------------------------Qualification----------------------------------//
  public incrementQualificationProgress(
    name: string,
    ticksToProgress: number,
    sanityCost: number,
    goldCost: number,
  ) {
    let foundQual = false;
    this.qualificationProgress.forEach((qual) => {
      if (qual.name == name) {
        foundQual = true;
        this.damageSanity(sanityCost);
        this.spendGold(goldCost);
        if (ticksToProgress > qual.progress + 1) {
          qual.progress++;
        } else {
          qual.completed = true;
          this.addQualification(qual.name);
        }
      }
    });
    if (!foundQual) {
      this.damageSanity(sanityCost);
      this.spendGold(goldCost);
      this.qualificationProgress.push({
        name: name,
        progress: 1,
        completed: false,
      });
    }
  }

  public getSpecifiedQualificationProgress(name: string) {
    const found = this.qualificationProgress.find((qual) => qual.name == name)
      ?.progress;
    return found;
  }

  public hasAllPreReqs(preReqs: string[] | null) {
    let hasAll = true;
    if (preReqs) {
      preReqs.forEach((preReq) => {
        if (!this.qualifications.includes(preReq)) {
          hasAll = false;
        }
      });
    }
    return hasAll;
  }

  public missingPreReqs(preReqs: string[] | null) {
    if (preReqs) {
      let missing: string[] = [];
      preReqs.forEach((preReq) => {
        if (!this.qualifications.includes(preReq)) {
          missing.push(preReq);
        }
      });
      return missing.length > 0 ? missing : null;
    }
    return null;
  }
  //----------------------------------Spells----------------------------------//

  get spells() {
    let spellList: any[] = [];
    if (this.playerClass == "paladin") {
      spellList = paladinSpells;
    } else if (this.playerClass == "necromancer") {
      spellList = necroSpells;
    } else if (this.playerClass == "ranger") {
      spellList = rangerSpells;
    } else spellList = mageSpells;

    let spells: Spell[] = [];
    this.knownSpells.forEach((spell) => {
      const found = spellList.find((spellObj) => spell == spellObj.name);
      if (found) {
        const spell = new Spell({ ...found });
        spells.push(spell);
      }
    });
    return spells;
  }

  public learnSpellStep(bookName: string, spell: string, element: Element) {
    let spellFound = false;

    this.learningSpells = this.learningSpells.reduce(
      (result: (typeof spellExp)[], spellExp) => {
        if (spellExp.spellName === spell) {
          spellFound = true;

          if (spellExp.experience < 19) {
            result.push({
              ...spellExp,
              experience: spellExp.experience + 1,
            });
          } else {
            this.learnSpellCompletion(spell, bookName);
          }
        } else {
          result.push(spellExp);
        }
        return result;
      },
      [],
    );

    if (!spellFound) {
      this.learningSpells.push({
        bookName: bookName,
        spellName: spell,
        experience: 1,
        element: element,
      });
    }
  }

  public learnSpellCompletion(spell: string, bookName: string) {
    let newState = this.knownSpells.map((spell) => spell);
    newState.push(spell);
    this.knownSpells = newState;
    let newLearningState = this.learningSpells.filter((spellWithExp) => {
      if (spellWithExp.spellName !== spell) {
        return spellWithExp;
      }
    });
    const book = this.inventory.find((item) => item.name == bookName);
    if (book) {
      this.removeFromInventory(book);
    }
    this.learningSpells = newLearningState;
  }
  //----------------------------------Relationships----------------------------------//
  public addNewKnownCharacter(character: Character) {
    this.knownCharacters.push(character);
  }

  public makePartner(character: Character) {
    this.knownCharacters = this.knownCharacters.filter(
      (knownCharacter) => !character.equals(knownCharacter),
    );
    this.partners.push(character);
  }
  public askForPartner(character: Character) {
    if (character.affection > 75) {
      if (rollD20() >= 5) {
        this.makePartner(character);
        return true;
      }
    } else if (character.affection > 25) {
      if (rollD20() >= 10) {
        this.makePartner(character);
        return true;
      }
    } else if (character.affection > 25) {
      if (rollD20() >= 15) {
        this.makePartner(character);
        return true;
      }
    } else if (character.affection > 0) {
      if (rollD20() >= 18) {
        this.makePartner(character);
        return true;
      }
    }
    return false;
  }

  public removePartner(character: Character) {
    this.partners = this.partners.filter(
      (partner) => !character.equals(partner),
    );
    this.knownCharacters.push(character);
  }

  /**
   * Searches the various character arrays, removing the character with the matching name, and decreases layer sanity based on closeness or relationship
   */
  public killCharacter({ name }: { name: string }) {
    //this.knownCharacters.find((character))
    const isParent = this.parents.find(
      (character) => character.fullName == name,
    );
    if (isParent) {
      this.changeBaseSanity(-25);
      isParent.kill();
      return;
    }

    const isPartner = this.partners.find(
      (character) => character.fullName == name,
    );
    if (isPartner) {
      this.changeBaseSanity(-25);
      isPartner.kill();
      return;
    }

    const isChild = this.children.find(
      (character) => character.fullName == name,
    );
    if (isChild) {
      this.changeBaseSanity(-30);
      isChild.kill();
      return;
    }
    const isKnown = this.knownCharacters.find(
      (character) => character.fullName == name,
    );
    if (isKnown) {
      if (isKnown.affection > 75) {
        this.changeBaseSanity(-25);
      } else if (isKnown.affection > 25) {
        this.changeBaseSanity(-20);
      } else if (isKnown.affection > -25) {
        this.changeBaseSanity(-15);
      } else if (isKnown.affection > -75) {
        this.changeBaseSanity(-10);
      } else {
        this.changeBaseSanity(-5);
      }
      isKnown.kill();
      return;
    } else {
      console.error("This should never be reached");
    }
  }

  public isKnownCharacter(characterToCheck: Character) {
    if (
      this.knownCharacters.some((character) =>
        character.equals(characterToCheck),
      )
    ) {
      return true;
    }
    if (this.partners.some((partner) => partner.equals(characterToCheck))) {
      return true;
    }
    if (this.children.some((child) => child.equals(characterToCheck))) {
      return true;
    }
    if (this.parents.some((parent) => parent.equals(characterToCheck))) {
      return true;
    }

    return false;
  }

  public getAdultCharacter(gameDate: Date) {
    const allEligibleCharacters = this.getAllAdultCharacters(gameDate);
    const randomIndex = Math.floor(
      Math.random() * allEligibleCharacters.length,
    );

    return allEligibleCharacters[randomIndex];
  }

  public getAllAdultCharacters(gameDate: Date) {
    const allEligibleCharacters = [
      ...this.knownCharacters,
      ...this.partners,
      ...this.children,
      ...this.parents,
    ].filter(
      (character) =>
        calculateAge(new Date(character.birthdate), gameDate) >= 18 &&
        !character.deathdate,
    );

    return allEligibleCharacters;
  }

  public tickDownRelationshipAffection() {
    this.parents.forEach((parent) => {
      if (parent.affection > 0) {
        parent.updateAffection(-0.1);
      }
    });
    this.partners.forEach((partner) => {
      if (partner.affection > 0) {
        partner.updateAffection(-0.15);
      }
    });
    this.children.forEach((child) => {
      if (child.affection > 0) {
        child.updateAffection(-0.15);
      }
    });
    this.knownCharacters.forEach((character) => {
      if (character.affection > 0) {
        character.updateAffection(-0.25);
      }
    });
  }
  public adopt({ child, partner }: { child: Character; partner?: Character }) {
    child.updateLastName(this.lastName);
    child.setParents(this, partner);
    this.children.push(child);
  }
  //----------------------------------Conditions----------------------------------//
  public addCondition(condition?: Condition | null) {
    if (condition) {
      condition.on = this;
      this.conditions.push(condition);
    }
  }
  public removeCondition(condition: Condition) {
    this.conditions = this.conditions.filter((cond) => cond !== condition);
  }

  get isStunned() {
    return this.conditions.some((condition) =>
      condition.effect.includes("stun"),
    );
  }

  public isSilenced() {
    return this.conditions.some((condition) =>
      condition.effect.includes("silenced"),
    );
  }

  public conditionTicker() {
    for (let i = this.conditions.length - 1; i >= 0; i--) {
      const { turns } = this.conditions[i].tick(this);

      if (turns <= 0) {
        this.conditions.splice(i, 1);
      }
    }
  }

  private removeDebuffs(amount: number) {
    const debuffArray = this.conditions.filter(
      (condition) =>
        condition.style == "debuff" && condition.placedby !== "age",
    );
    for (let i = 0; i < amount && debuffArray.length > 0; i++) {
      debuffArray.shift();
    }
    this.conditions = debuffArray;
  }
  //----------------------------------Mage Only-----------------------------------//
  //----------------------------------Paladin Only---------------------------------//
  //----------------------------------Ranger Only----------------------------------//
  get isInStealth() {
    return !!this.conditions.find((cond) => cond.effect.includes("stealth"));
  }
  public exitStealth() {
    const filtered: Condition[] = [];
    this.conditions.forEach((cond) => {
      if (!cond.effect.includes("stealth")) {
        filtered.push(cond);
      }
    });
  }
  /**
   * Returns the species(name) of the created minion, adds the minion to the minion list
   */
  public summonPet(minionName: string) {
    const minionObj = summons.find((summon) => summon.name == minionName);
    if (!minionObj) {
      throw new Error(`Minion (${minionName}) not found!`);
    }
    const minion = new Minion({
      creatureSpecies: minionObj.name,
      health: minionObj.health,
      healthMax: minionObj.health,
      attackPower: minionObj.attackPower,
      attacks: minionObj.attacks,
      turnsLeftAlive: minionObj.turns,
      beingType: minionObj.beingType as BeingType,
      parent: this,
    });
    this.rangerPet = minion;
    return minion.creatureSpecies;
  }
  //----------------------------------Necromancer Only----------------------------------//
  /**
   * This is only ever needed if the player is a necromancer
   */
  private getBloodOrbs() {
    return this.conditions.filter((cond) => cond.name == "blood orb");
  }
  /**
   * This is only ever needed if the player is a necromancer
   */
  get bloodOrbCount() {
    return this.getBloodOrbs().length;
  }
  /**
   *
   */
  public hasEnoughBloodOrbs(spell: Spell) {
    const bloodOrbsNeeded = spell.buffs.filter(
      (buff) => buff == "consume blood orb",
    ).length;
    if (bloodOrbsNeeded > this.bloodOrbCount) {
      return false;
    }
    return true;
  }

  /**
   * This is only ever needed if the player is a necromancer
   * `Throws` if the user does not have enough blood orbs; only ever call if `hasEnoughBloodOrbs` returns true
   * Removes soonest to expire blood orbs first
   */
  public removeBloodOrbs(spell: Spell) {
    const bloodOrbsNeeded = spell.buffs.filter(
      (buff) => buff == "consume blood orb",
    ).length;
    if (bloodOrbsNeeded > this.bloodOrbCount) {
      throw new Error("User does not have enough blood orbs");
    } else {
      let orbsToRemove = this.getBloodOrbs()
        .sort((a, b) => a.turns - b.turns)
        .splice(0, bloodOrbsNeeded);
      for (let i = 0; orbsToRemove.length > 0; i++) {
        //still make sure that we can not run past length of conditions, should not ever be hit
        if (i > this.conditions.length) {
          break;
        }
        const filtered = orbsToRemove.filter(
          (orb) => !(orb.id == this.conditions[i].id),
        );
        if (filtered.length < orbsToRemove.length) {
          // we found a match with i, remove it from this.conditions, and update removal list
          this.conditions.splice(i, 1);
          orbsToRemove = filtered;
        }
      }
    }
  }
  //----------------------------------Physical Combat----------------------------------//
  get physicalAttacks() {
    return this.equipment.mainHand.attachedAttacks;
  }

  public useArrow() {
    if (this.equipment.quiver && this.equipment.quiver.length > 0) {
      this.equipment.quiver = this.equipment.quiver.slice(0, -1);
    }
  }

  public pass({ voluntary = false }: { voluntary?: boolean }) {
    if (voluntary) {
      this.regenMana(); // if the user voluntarily passes the turn, their mana regen is doubled
    }
    this.endTurn();
  }

  public endTurn() {
    this.regenMana();
    this.conditionTicker();
  }

  //----------------------------------Magical Combat----------------------------------//

  public gainProficiency(chosenSpell: Spell) {
    let currentProficiencies = this.magicProficiencies;
    const newProficiencies = currentProficiencies.map((prof) => {
      if (prof.school === chosenSpell.element) {
        prof.proficiency += this.experienceGainSteps(chosenSpell) ?? 0;
        return prof;
      }
      return prof;
    });
    this.magicProficiencies = newProficiencies;
  }

  public currentMasteryLevel(school: Element): MasteryLevel {
    const schoolProficiency = this.magicProficiencies.find(
      (prof) => prof.school == school,
    )?.proficiency;

    if (!schoolProficiency || schoolProficiency < 50) {
      return MasteryLevel.Novice;
    } else if (schoolProficiency < 125) {
      return MasteryLevel.Apprentice;
    } else if (schoolProficiency < 225) {
      return MasteryLevel.Adept;
    } else if (schoolProficiency < 350) {
      return MasteryLevel.Expert;
    } else if (schoolProficiency < 500) {
      return MasteryLevel.Master;
    } else {
      return MasteryLevel.Legend;
    }
  }

  private experienceGainSteps(chosenSpell: Spell) {
    if (
      (this.currentMasteryLevel(chosenSpell.element) as MasteryLevel) <
      MasteryLevel.Legend
    ) {
      const levelDif =
        (this.currentMasteryLevel(chosenSpell.element) as MasteryLevel) -
        chosenSpell.proficiencyNeeded;
      switch (levelDif) {
        case 0:
          return 2;
        case 1:
          return 1;
        case 2:
          return 0.5;
        default:
          return 0;
      }
    }
  }

  //----------------------------------Minions----------------------------------//
  /**
   * Returns the species(name) of the created minion, adds the minion to the minion list
   */
  public createMinion(minionName: string) {
    const minionObj = summons.find((summon) => summon.name == minionName);
    if (!minionObj) {
      throw new Error(`Minion (${minionName}) not found!`);
    }
    const minion = new Minion({
      creatureSpecies: minionObj.name,
      health: minionObj.health,
      healthMax: minionObj.health,
      attackPower: minionObj.attackPower,
      attacks: minionObj.attacks,
      turnsLeftAlive: minionObj.turns,
      beingType: minionObj.beingType as BeingType,
      energy: minionObj.energy?.maximum,
      energyMax: minionObj.energy?.maximum,
      energyRegen: minionObj.energy?.regen,
      parent: this,
    });
    this.addMinion(minion);
    return minion.creatureSpecies;
  }

  public clearMinions() {
    this.minions = [];
  }
  public removeMinion(minionToRemove: Minion) {
    let newList: Minion[] = [];
    this.minions.forEach((minion) => {
      if (!minion.equals(minionToRemove.id)) {
        newList.push(minion);
      }
    });
    this.minions = newList;
  }

  private addMinion(minion: Minion) {
    this.minions.push(minion);
  }
  //----------------------------------Investments----------------------------------//
  public purchaseInvestmentBase(investment: InvestmentType) {
    this.gold -= investment.cost;
    const newInvestment = new Investment({
      name: investment.name,
      minimumReturn: investment.goldReturnRange.min,
      maximumReturn: investment.goldReturnRange.max,
      turnsPerRoll: investment.turnsPerReturn,
      maxGoldStockPile: investment.maxGoldStockPile,
      goldInvested: investment.cost,
    });
    this.investments.push(newInvestment);
  }

  public purchaseInvestmentUpgrade(
    suppliedInvestment: InvestmentType,
    suppliedUpgrade: InvestmentUpgrade,
    playerCharacter: PlayerCharacter,
  ) {
    const base = this.investments.find(
      (investment) => investment.name == suppliedInvestment.name,
    );
    if (base) {
      base.addUpgrade(suppliedUpgrade, playerCharacter);
      this.gold -= suppliedUpgrade.cost;
    } else {
      throw new Error("no base upgrade found!");
    }
  }

  public tickAllInvestments() {
    this.investments.forEach((investment) => investment.turn());
  }
  public collectFromInvestment(investmentName: string) {
    const found = this.investments.find(
      (investment) => investment.name == investmentName,
    );
    if (found) {
      this.gold += found.collectGold();
    }
  }
  public getInvestment(investmentName: string) {
    const found = this.investments.find(
      (investment) => investment.name == investmentName,
    );
    return found;
  }
  //----------------------------------Misc----------------------------------//
  get minionsAndPets(): Minion[] {
    return this.minions.concat(this.rangerPet ? [this.rangerPet] : []);
  }
  public getMedicalService(
    cost: number,
    healthRestore?: number,
    sanityRestore?: number,
    manaRestore?: number,
    removeDebuffs?: number,
  ) {
    this.clearMinions();
    if (cost <= this.gold) {
      this.gold -= cost;
      if (healthRestore) {
        this.restoreHealth(healthRestore);
      }
      if (sanityRestore) {
        this.restoreSanity(sanityRestore);
      }
      if (manaRestore) {
        this.restoreMana(manaRestore);
      }
      if (removeDebuffs) {
        this.removeDebuffs(removeDebuffs);
      }
    }
  }

  public setInDungeon(props: inDungeonProps) {
    if (props.state) {
      if ("dungeonMap" in props) {
        this.currentDungeon = {
          instance: props.instance,
          level: props.level,
          dungeonMap: props.dungeonMap,
          currentPosition: props.currentPosition,
          mapDimensions: props.mapDimensions,
          enemy: props.enemy,
          fightingBoss: props.fightingBoss,
        };
      } else {
        const syntheticTile: Tile = {
          x: 0,
          y: 0,
          clearedRoom: false,
          isBossRoom: false,
        };
        const syntheticDungeon = [syntheticTile];
        const mapDimensions = {
          width: 0,
          height: 0,
          offsetX: 0,
          offsetY: 0,
        };
        this.currentDungeon = {
          instance: props.instance,
          level: props.level,
          dungeonMap: syntheticDungeon,
          currentPosition: syntheticTile,
          mapDimensions: mapDimensions,
          enemy: props.enemy ?? null,
          fightingBoss: false,
        };
      }
    } else {
      this.currentDungeon = null;
    }
  }

  public reinstateLinks() {
    this.minions = this.minions.map((minion) => minion.reinstateParent(this));
    this.rangerPet = this.rangerPet?.reinstateParent(this) ?? null;
    this.conditions = this.conditions.map((cond) => cond.reinstateParent(this));
    this.inventory = this.inventory.map((item) => item.reinstatePlayer(this));
    this.equipment.mainHand = this.equipment.mainHand.reinstatePlayer(this);
    this.equipment.offHand =
      this.equipment.offHand?.reinstatePlayer(this) ?? null;
    this.equipment.body = this.equipment.body?.reinstatePlayer(this) ?? null;
    this.equipment.head = this.equipment.head?.reinstatePlayer(this) ?? null;
    this.equipment.quiver =
      this.equipment.quiver?.map((item) => item.reinstatePlayer(this)) ?? null;
  }

  /**
   * Creates a PlayerCharacter instance from a JSON object
   * @param json - JSON representation of a PlayerCharacter
   * @returns A new PlayerCharacter instance
   */
  static fromJSON(json: any): PlayerCharacter {
    const player = new PlayerCharacter({
      id: json.id,
      firstName: json.firstName,
      lastName: json.lastName,
      sex: json.sex,
      alive: json.alive,
      birthdate: json.birthdate ?? undefined,
      deathdate: json.deathdate ?? null,
      job: json.job,
      qualifications: json.qualifications,
      affection: json.affection,
      playerClass: json.playerClass,
      blessing: json.blessing,
      currentHealth: json.currentHealth,
      baseHealth: json.baseHealth,
      currentSanity: json.currentSanity,
      baseSanity: json.baseSanity,
      currentMana: json.currentMana,
      baseMana: json.baseMana,
      baseManaRegen: json.baseManaRegen,
      jobExperience: json.jobExperience,
      learningSpells: json.learningSpells,
      qualificationProgress: json.qualificationProgress,
      magicProficiencies: json.magicProficiencies,
      parents: json.parents
        ? json.parents.map((parent: any) => Character.fromJSON(parent))
        : [],
      children: json.children
        ? json.children.map((child: any) => Character.fromJSON(child))
        : [],
      partners: json.partners
        ? json.partners.map((partner: any) => Character.fromJSON(partner))
        : [],
      knownCharacters: json.knownCharacters
        ? json.knownCharacters.map((relationships: any) =>
            Character.fromJSON(relationships),
          )
        : [],
      minions: json.minions
        ? json.minions.map((minion: any) => Minion.fromJSON(minion))
        : [],
      rangerPet: json.rangerPet ? Minion.fromJSON(json.rangerPet) : undefined,
      knownSpells: json.knownSpells,
      physicalAttacks: json.physicalAttacks,
      gold: json.gold,
      inventory: json.inventory
        ? json.inventory.map((item: any) => Item.fromJSON(item))
        : [],
      currentDungeon: json.currentDungeon
        ? {
            instance: json.currentDungeon.instance,
            level: json.currentDungeon.level,
            dungeonMap: json.currentDungeon.dungeonMap,
            currentPosition: json.currentDungeon.currentPosition,
            enemy: json.currentDungeon.enemy
              ? Enemy.fromJSON(json.currentDungeon.enemy)
              : null,
            fightingBoss: json.currentDungeon.fightingBoss,
            mapDimensions: json.currentDungeon.mapDimensions,
          }
        : null,
      equipment: json.equipment
        ? {
            mainHand: Item.fromJSON(json.equipment.mainHand),
            offHand: json.equipment.offHand
              ? Item.fromJSON(json.equipment.offHand)
              : null,
            body: json.equipment.body
              ? Item.fromJSON(json.equipment.body)
              : null,
            head: json.equipment.head
              ? Item.fromJSON(json.equipment.head)
              : null,
            quiver: json.equipment.quiver
              ? json.equipment.quiver.map((arrow: any) => Item.fromJSON(arrow))
              : null,
          }
        : undefined,
      conditions: json.conditions
        ? json.conditions.map((condition: any) => Condition.fromJSON(condition))
        : [],
      investments: json.investments
        ? json.investments.map((investment: any) =>
            Investment.fromJSON(investment),
          )
        : undefined,
      unAllocatedSkillPoints: json.unAllocatedSkillPoints,
      allocatedSkillPoints: json.allocatedSkillPoints,
      baseStrength: json.baseStrength,
      baseIntelligence: json.baseIntelligence,
      baseDexterity: json.baseDexterity,
    });
    return player;
  }
}

interface performLaborProps {
  goldReward: number;
  cost: {
    mana: number;
    sanity?: number;
    health?: number;
  };
  title: string;
}

function getStartingProficiencies(
  playerClass: PlayerClassOptions,
  blessing: Element,
) {
  if (playerClass == "paladin") {
    const starter = [
      { school: Element.holy, proficiency: blessing == Element.holy ? 50 : 0 },
      {
        school: Element.protection,
        proficiency: blessing == Element.protection ? 50 : 0,
      },
      {
        school: Element.vengeance,
        proficiency: blessing == Element.vengeance ? 50 : 0,
      },
    ];
    return starter;
  } else if (playerClass == "necromancer") {
    const starter = [
      {
        school: Element.blood,
        proficiency: blessing == Element.blood ? 50 : 0,
      },
      {
        school: Element.summoning,
        proficiency: blessing == Element.summoning ? 50 : 0,
      },
      {
        school: Element.pestilence,
        proficiency: blessing == Element.pestilence ? 50 : 0,
      },
      { school: Element.bone, proficiency: blessing == Element.bone ? 50 : 0 },
    ];
    return starter;
  } else if (playerClass == "mage") {
    const starter = [
      { school: Element.fire, proficiency: blessing == Element.fire ? 50 : 0 },
      {
        school: Element.water,
        proficiency: blessing == Element.water ? 50 : 0,
      },
      { school: Element.air, proficiency: blessing == Element.air ? 50 : 0 },
      {
        school: Element.earth,
        proficiency: blessing == Element.earth ? 50 : 0,
      },
    ];
    return starter;
  } else if (playerClass == "ranger") {
    const starter = [
      {
        school: Element.arcane,
        proficiency: blessing == Element.arcane ? 50 : 0,
      },
      {
        school: Element.beastMastery,
        proficiency: blessing == Element.beastMastery ? 50 : 0,
      },
      {
        school: Element.assassination,
        proficiency: blessing == Element.assassination ? 50 : 0,
      },
    ];
    return starter;
  }
  throw new Error("Incorrect playerClass setting");
}

export function getStartingBook(playerBlessing: Element) {
  switch (playerBlessing) {
    case Element.fire:
      return new Item({
        name: "book of fire bolt",
        baseValue: 2500,
        itemClass: ItemClassType.Book,
        icon: "Book",
        playerClass: PlayerClassOptions.mage,
      });
    case Element.water:
      return new Item({
        name: "book of frost",
        baseValue: 2500,
        itemClass: ItemClassType.Book,
        icon: "Book",
        playerClass: PlayerClassOptions.mage,
      });
    case Element.air:
      return new Item({
        name: "book of gust",
        baseValue: 2500,
        itemClass: ItemClassType.Book,
        icon: "Book",
        playerClass: PlayerClassOptions.mage,
      });
    case Element.earth:
      return new Item({
        name: "book of rock toss",
        baseValue: 2500,
        itemClass: ItemClassType.Book,
        icon: "Book",
        playerClass: PlayerClassOptions.mage,
      });
    case Element.blood:
      return new Item({
        name: "book of pull blood",
        baseValue: 2500,
        itemClass: ItemClassType.Book,
        icon: "Book",
        playerClass: PlayerClassOptions.necromancer,
      });
    case Element.summoning:
      return new Item({
        name: "book of the flying skull",
        baseValue: 2500,
        itemClass: ItemClassType.Book,
        icon: "Book",
        playerClass: PlayerClassOptions.necromancer,
      });
    case Element.pestilence:
      return new Item({
        name: "book of poison dart",
        baseValue: 2500,
        itemClass: ItemClassType.Book,
        icon: "Book",
        playerClass: PlayerClassOptions.necromancer,
      });
    case Element.bone:
      return new Item({
        name: "book of teeth",
        baseValue: 2500,
        itemClass: ItemClassType.Book,
        icon: "Book",
        playerClass: PlayerClassOptions.necromancer,
      });
    case Element.holy:
      return new Item({
        name: "book of flash heal",
        baseValue: 2500,
        itemClass: ItemClassType.Book,
        icon: "Book",
        playerClass: PlayerClassOptions.paladin,
      });
    case Element.protection:
      return new Item({
        name: "book of blessed guard",
        baseValue: 2500,
        itemClass: ItemClassType.Book,
        icon: "Book",
        playerClass: PlayerClassOptions.paladin,
      });
    case Element.vengeance:
      return new Item({
        name: "book of judgment",
        baseValue: 2500,
        itemClass: ItemClassType.Book,
        icon: "Book",
        playerClass: PlayerClassOptions.paladin,
      });
    case Element.beastMastery:
      return new Item({
        name: "book of the raven",
        baseValue: 2500,
        itemClass: ItemClassType.Book,
        icon: "Book",
        playerClass: PlayerClassOptions.ranger,
      });
    case Element.assassination:
      return new Item({
        name: "book of throw dagger",
        baseValue: 2500,
        itemClass: ItemClassType.Book,
        icon: "Book",
        playerClass: PlayerClassOptions.ranger,
      });
    case Element.arcane:
      return new Item({
        name: "book of arcane shot",
        baseValue: 2500,
        itemClass: ItemClassType.Book,
        icon: "Book",
        playerClass: PlayerClassOptions.ranger,
      });
    default:
      throw new Error("Invalid player blessing in getStartingBook()");
  }
}

type enterDungeonProps = {
  state: true;
  instance: string;
  level: string;
  dungeonMap: Tile[];
  currentPosition: Tile;
  enemy: Enemy | null;
  mapDimensions: BoundingBox;
  fightingBoss: boolean;
};

type enterActivityProps = {
  state: true;
  instance: "Activities" | "Personal";
  level: string;
};
type leaveDungeonProps = {
  state: false;
};
type inDungeonProps =
  | enterDungeonProps
  | leaveDungeonProps
  | enterActivityProps;
