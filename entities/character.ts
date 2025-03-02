import {
  getConditionEffectsOnDefenses,
  getConditionEffectsOnMisc,
} from "../utility/functions/conditions";
import { Condition } from "./conditions";
import { Item } from "./item";
import jobsJSON from "../assets/json/jobs.json";
import mageSpells from "../assets/json/mageSpells.json";
import paladinSpells from "../assets/json/paladinSpells.json";
import necroSpells from "../assets/json/necroSpells.json";
import rangerSpells from "../assets/json/rangerSpells.json";
import { Minion } from "./creatures";
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
  Personality,
  Rarity,
  MerchantType,
  Modifier,
} from "../utility/types";
import {
  rollToLiveByAge,
  rollD20,
  damageReduction,
  getRandomName,
  getRandomPersonality,
} from "../utility/functions/misc";
import { Spell } from "./spell";
import storyItems from "../assets/json/items/storyItems.json";
import { Attack } from "./attack";
import { storage } from "../utility/functions/storage";
import { stringify } from "flatted";
import { throttle } from "lodash";
import type { RootStore } from "../stores/RootStore";

export interface JobData {
  title: string;
  cost: { mana: number; health?: number };
  qualifications: string[] | null;
  experienceToPromote: number;
  reward: { gold: number };
  currentExperience: number;
  currentRank: number;
  rankMultiplier: number;
}

interface BaseCharacterOptions {
  id?: string;
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
  isPregnant?: boolean;
  parentIds?: string[];
  childrenIds?: string[];
  partnerIds?: string[];
  knownCharacterIds?: string[];
  root: RootStore;
}

interface CharacterOptions extends BaseCharacterOptions {
  personality: Personality | null;
}

interface PlayerCharacterBase extends BaseCharacterOptions {
  baseHealth: number;
  baseMana: number;
  baseSanity: number;
  baseStrength: number;
  baseIntelligence: number;
  baseDexterity: number;
  baseManaRegen: number;

  currentHealth?: number;
  currentMana?: number;
  currentSanity?: number;
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
  conditions?: Condition[];
  baseInventory?: Item[];
  keyItems?: Item[];
  minions?: Minion[];
  rangerPet?: Minion;
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
}

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
 * This class fully contains characters like parents, children, met characters and shopkeepers (which are a property of the `Shop` class).
 * This class serves as a base for the player's character - `PlayerCharacter`
 */
export class Character {
  readonly id: string;
  readonly beingType = "human";
  readonly firstName: string;
  lastName: string;
  readonly personality: Personality | null; // null only for the playerCharacter
  readonly sex: "male" | "female";
  alive: boolean;
  readonly birthdate: { year: number; week: number };
  deathdate: { year: number; week: number } | null;
  job: string;
  affection: number;
  qualifications: string[];
  dateCooldownStart?: { year: number; week: number };
  pregnancyDueDate?: { year: number; week: number };
  isPregnant: boolean;

  childrenIds: string[];
  partnerIds: string[];
  parentIds: string[];
  knownCharacterIds: string[];

  root: RootStore;

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
    personality,
    pregnancyDueDate,
    isPregnant = false,
    childrenIds,
    parentIds,
    partnerIds,
    knownCharacterIds,
    root,
  }: CharacterOptions) {
    this.id = id ?? Crypto.randomUUID();
    this.firstName = firstName;
    this.lastName = lastName;
    this.sex = sex;

    this.parentIds = parentIds ?? [];
    this.childrenIds = childrenIds ?? [];
    this.partnerIds = partnerIds ?? [];
    this.knownCharacterIds = knownCharacterIds ?? [];

    this.personality = personality;
    this.alive = alive ?? true;
    this.birthdate = birthdate;
    this.deathdate = deathdate ?? null;
    this.job = job ?? "Unemployed";
    this.affection = affection ?? 0;
    this.qualifications = qualifications ?? [];
    this.dateCooldownStart = dateCooldownStart;
    this.pregnancyDueDate = pregnancyDueDate;
    this.isPregnant = isPregnant;
    this.root = root;

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
      birthdate: observable,
      updateAffection: action,
      lastName: observable,
      updateLastName: action,
      kill: action,
      setParents: action,
      pregnancyDueDate: observable,
      isPregnant: observable,
      initiatePregnancy: action,
      giveBirth: action,
      age: computed,
      parentIds: observable,
      childrenIds: observable,
      partnerIds: observable,
      parents: computed,
      children: computed,
      partners: computed,
      makePartner: action,
      removePartner: action,
      addChild: action,
      knownCharacterIds: observable,
      knownCharacters: computed,
    });

    reaction(
      () => [
        this.lastName,
        this.alive,
        this.deathdate,
        this.job,
        this.affection,
        this.qualifications,
        this.dateCooldownStart,
        this.pregnancyDueDate,
        this.parentIds,
        this.childrenIds,
        this.partnerIds,
      ],
      () => {
        if (this.root?.characterStore) {
          this.root.characterStore.saveCharacter(this);
        }
      },
    );
  }

  get parents(): Character[] {
    return this.parentIds.map((id) =>
      this.root.characterStore.getCharacter(id),
    );
  }

  get children(): Character[] {
    return this.childrenIds.map((id) =>
      this.root.characterStore.getCharacter(id),
    );
  }

  get partners(): Character[] {
    return this.partnerIds.map((id) =>
      this.root.characterStore.getCharacter(id),
    );
  }

  get knownCharacters(): Character[] {
    return this.knownCharacterIds.map((id) =>
      this.root.characterStore.getCharacter(id),
    );
  }

  public addKnownCharacter(character: Character) {
    if (!this.knownCharacterIds.includes(character.id)) {
      this.knownCharacterIds.push(character.id);
    }
  }

  public removeKnownCharacter(character: Character) {
    this.knownCharacterIds = this.knownCharacterIds.filter(
      (id) => id !== character.id,
    );
  }

  public makePartner(character: Character) {
    if (!this.partnerIds.includes(character.id)) {
      this.partnerIds.push(character.id);
    }
  }

  public removePartner(character: Character) {
    this.partnerIds = this.partnerIds.filter((id) => id !== character.id);
  }

  public addChild(child: Character) {
    if (!this.childrenIds.includes(child.id)) {
      this.childrenIds.push(child.id);
    }
  }

  public setParents(parent1: Character, parent2?: Character) {
    const newParentIds: string[] = [parent1.id];
    if (parent2) {
      newParentIds.push(parent2.id);
    }
    this.parentIds = newParentIds;
  }

  /**
   * Used to check if the character object is the same as another.
   * @param otherCharacter - The character to compare with.
   * @returns True if the characters have the same ID, false otherwise.
   */
  public equals(otherCharacter: Character): boolean {
    return this.id === otherCharacter.id;
  }

  get age() {
    const yearDiff = this.root.time.year - this.birthdate.year;
    const weekDiff = this.root.time.week - this.birthdate.week;

    if (weekDiff < 0) {
      return yearDiff - 1;
    }

    return yearDiff;
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
  public setDateCooldownStart(): void {
    this.dateCooldownStart = this.root.time.currentDate;
  }

  public kill() {
    this.alive = false;
    this.deathdate = this.root.time.currentDate ?? null;
  }

  /**
   * Simulates a death roll for the character. This is called on non-player characters to determine if they survive or not.
   * @param gameDate - The current date of the game.
   */
  public deathRoll(): void {
    if (!(this instanceof PlayerCharacter)) {
      const rollToLive = rollToLiveByAge(this.age ?? 0);

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

  public initiatePregnancy() {
    if (this.isPregnant || this.sex === "male") return false;

    const currentDate = this.root.time.currentDate;
    this.isPregnant = true;
    this.pregnancyDueDate = {
      year:
        currentDate.week + 40 >= 52 ? currentDate.year + 1 : currentDate.year,
      week: (currentDate.week + 40) % 52,
    };

    return true;
  }

  public giveBirth(): Character | null {
    if (!this.isPregnant || !this.pregnancyDueDate) return null;

    const currentDate = this.root.time.currentDate;
    if (
      currentDate.year < this.pregnancyDueDate.year ||
      (currentDate.year === this.pregnancyDueDate.year &&
        currentDate.week < this.pregnancyDueDate.week)
    ) {
      return null;
    }

    this.isPregnant = false;
    this.pregnancyDueDate = undefined;

    const sex = Math.random() > 0.5 ? "male" : "female";

    const baby = new Character({
      firstName: getRandomName(sex).firstName,
      lastName: this.lastName,
      sex,
      personality: getRandomPersonality(),
      birthdate: currentDate,
      root: this.root,
    });

    return baby;
  }

  static fromJSON(json: any): Character {
    const character = new Character({
      id: json.id,
      firstName: json.firstName,
      lastName: json.lastName,
      sex: json.sex,
      birthdate: json.birthdate,
      alive: json.alive,
      deathdate: json.deathdate ?? null,
      job: json.job,
      personality: json.personality,
      affection: json.affection,
      qualifications: json.qualifications,
      dateCooldownStart: json.dateCooldownStart,
      parentIds: json.parentIds ?? [],
      childrenIds: json.childrenIds ?? [],
      partnerIds: json.partnerIds ?? [],
      pregnancyDueDate: json.pregnancyDueDate,
      isPregnant: json.isPregnant,
      knownCharacterIds: json.knownCharacterIds ?? [],
      root: json.root,
    });
    return character;
  }
}

export class PlayerCharacter extends Character {
  readonly playerClass: PlayerClassOptions;
  readonly blessing: Element;

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

  learningSpells: {
    bookName: string;
    spellName: string;
    experience: number;
    element: Element;
  }[];

  minions: Minion[];

  rangerPet: Minion | null;

  qualificationProgress: {
    name: string;
    progress: number;
    completed: boolean;
  }[];
  jobs: Map<string, JobData>;

  conditions: Condition[];
  baseInventory: Item[];
  keyItems: Item[];
  equipment: {
    mainHand: Item;
    offHand: Item | null;
    head: Item | null;
    body: Item | null;
    quiver: Item[] | null;
  };
  investments: Investment[];

  constructor({
    playerClass,
    blessing,
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
    learningSpells,
    qualificationProgress,
    magicProficiencies,
    conditions,
    knownSpells,
    gold,
    baseInventory,
    equipment,
    investments,
    unAllocatedSkillPoints,
    allocatedSkillPoints,
    keyItems,
    root,
    jobs,
    ...props
  }: PlayerCharacterOptions) {
    super({
      ...props,
      root,
      personality: null,
    });
    this.playerClass = PlayerClassOptions[playerClass];
    this.blessing = blessing;

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

    //this.unAllocatedSkillPoints = unAllocatedSkillPoints ?? __DEV__ ? 100 : 0;
    this.unAllocatedSkillPoints = unAllocatedSkillPoints ?? 0;
    this.allocatedSkillPoints = allocatedSkillPoints ?? {
      [Attribute.health]: 0,
      [Attribute.mana]: 0,
      [Attribute.sanity]: 0,
      [Attribute.strength]: 0,
      [Attribute.dexterity]: 0,
      [Attribute.intelligence]: 0,
    };

    //this.gold = gold !== undefined ? gold : __DEV__ ? 1000000 : 500;
    this.gold = gold !== undefined ? gold : 500;

    this.minions = minions
      ? minions.map((minion) => Minion.fromJSON({ ...minion, parent: this }))
      : [];
    this.rangerPet = rangerPet
      ? Minion.fromJSON({ ...rangerPet, parent: this })
      : null;

    this.jobs = jobs ?? this.initJobs();
    this.learningSpells = learningSpells ?? [];
    this.qualificationProgress = qualificationProgress ?? [];
    this.knownSpells = knownSpells ?? [];
    this.conditions = conditions ?? [];

    this.baseInventory = baseInventory ?? [];
    this.keyItems = keyItems ?? []; //__DEV__ ? testKeyItems(root) : [];
    this.equipment = equipment ?? {
      mainHand: new Item({
        rarity: Rarity.NORMAL,
        prefix: null,
        suffix: null,
        name: "unarmored",
        slot: "one-hand",
        stats: { [Modifier.PhysicalDamage]: 1 },
        baseValue: 0,
        itemClass: ItemClassType.Melee,
        attacks: __DEV__ ? ["punch", "dev punch"] : ["punch"],
        root,
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
      totalHealthRegen: computed,
      regenHealth: action,

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
      setUnAllocatedSkillPoints: action,

      gold: observable,
      spendGold: action,
      addGold: action,
      readableGold: computed,
      setGold: action,

      getInvestment: action,
      collectFromInvestment: action,
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
      minionsAndPets: computed,

      weaponAttacks: computed,
      useArrow: action,
      pass: action,

      isStunned: computed,
      addCondition: action,
      removeCondition: action,

      jobs: observable.deep,
      getCurrentJobAndExperience: action,
      incrementQualificationProgress: action,
      qualificationProgress: observable,
      getJobExperience: action,
      removeEquipment: action,
      performLabor: action,
      getSpecifiedQualificationProgress: action,
      gainProficiency: action,

      conditions: observable,
      investments: observable,
      adopt: action,

      baseInventory: observable,
      addToInventory: action,
      addToKeyItems: action,
      buyItem: action,
      removeFromInventory: action,
      sellItem: action,
      equipment: observable,
      equipItem: action,
      unEquipItem: action,
      inventory: computed,
      getPhysicalDamageReduction: action,
      purchaseStack: action,

      getMedicalService: action,
      bossDefeated: action,

      gameTurnHandler: action,

      totalPhysicalDamage: computed,
      totalFireDamage: computed,
      totalColdDamage: computed,
      totalLightningDamage: computed,
      totalPoisonDamage: computed,
      totalDamage: computed,

      fireResistance: computed,
      coldResistance: computed,
      lightningResistance: computed,
      poisonResistance: computed,
      totalArmor: computed,
      dodgeChance: computed,
      blockChance: computed,
    });

    reaction(
      () => [
        this.currentHealth,
        this.currentMana,
        this.currentSanity,
        this.gold,
        this.unAllocatedSkillPoints,
        this.equipmentStats,
        this.baseInventory.length,
      ],
      () => {
        savePlayer(this);
      },
    );
  }

  public gameTurnHandler() {
    //condition ticker
    for (let i = this.conditions.length - 1; i >= 0; i--) {
      const { turns } = this.conditions[i].tick(this);
      if (turns <= 0) {
        this.conditions.splice(i, 1);
      }
    }

    // affection ticker
    const updateAffection = (character: Character, rate: number) => {
      if (character.affection > 0) {
        character.updateAffection(-rate);
      }
    };

    this.parents.forEach((parent) => updateAffection(parent, 0.1));
    this.partners.forEach((partner) => updateAffection(partner, 0.15));
    this.children.forEach((child) => updateAffection(child, 0.15));

    // investment ticker
    for (let i = 0; i < this.investments.length; i++) {
      this.investments[i].turn();
    }
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
  public addSkillPoint(params?: {
    amount?: number;
    to?: Attribute | "unallocated";
  }) {
    const amount = params?.amount ?? 1;
    const to = params?.to ?? "unallocated";

    if (to === "unallocated") {
      this.unAllocatedSkillPoints += amount;
      return;
    }

    if (this.unAllocatedSkillPoints >= amount) {
      if (Object.values(Attribute).includes(to as Attribute)) {
        this.allocatedSkillPoints[to as Attribute] += amount;
        this.unAllocatedSkillPoints -= amount;
      }
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
      if (this.currentHealth > this.maxHealth) {
        this.currentHealth = this.maxHealth;
      }
      if (this.currentMana > this.maxMana) {
        this.currentMana = this.maxMana;
      }
      if (this.currentSanity > this.maxSanity) {
        this.currentSanity = this.maxSanity;
      }
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

  public setUnAllocatedSkillPoints(points: number) {
    if (__DEV__) {
      this.unAllocatedSkillPoints = points;
    }
  }
  //----------------------------------Health----------------------------------//
  get maxHealth() {
    const { healthFlat, healthMult } = getConditionEffectsOnDefenses(
      this.conditions,
    );
    return (
      (this.baseHealth + this.allocatedSkillPoints[Attribute.health] * 10) *
        healthMult +
      (this.equipmentStats.get(Modifier.Health) ?? 0) +
      healthFlat
    );
  }

  get nonConditionalMaxHealth() {
    return (
      this.baseHealth +
      this.allocatedSkillPoints[Attribute.health] * 10 +
      (this.equipmentStats.get(Modifier.Health) ?? 0)
    );
  }

  get totalHealthRegen() {
    const { healthRegenFlat, healthRegenMult } = getConditionEffectsOnMisc(
      this.conditions,
    );
    return (
      healthRegenFlat * healthRegenMult +
      (this.equipmentStats.get(Modifier.HealthRegen) ?? 0)
    );
  }

  public regenHealth() {
    if (this.currentHealth + this.totalHealthRegen < this.maxHealth) {
      this.currentHealth += this.totalHealthRegen;
    } else {
      this.currentHealth = this.maxHealth;
    }
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
      (this.equipmentStats.get(Modifier.Mana) ?? 0) +
      manaMaxFlat
    );
  }

  get nonConditionalMaxMana() {
    return (
      this.baseMana +
      this.allocatedSkillPoints[Attribute.mana] * 10 +
      (this.equipmentStats.get(Modifier.Mana) ?? 0)
    );
  }

  get totalManaRegen() {
    const { manaRegenFlat, manaRegenMult } = getConditionEffectsOnMisc(
      this.conditions,
    );
    return (
      this.baseManaRegen * manaRegenMult +
      (this.equipmentStats.get(Modifier.ManaRegen) ?? 0) +
      manaRegenFlat
    );
  }

  get nonConditionalManaRegen() {
    return (
      this.baseManaRegen + (this.equipmentStats.get(Modifier.ManaRegen) ?? 0)
    );
  }

  public useMana(mana: number) {
    this.currentMana -= mana;
  }

  public damageMana(damage: number) {
    if (this.currentMana < damage) {
      this.currentMana = 0;
    } else {
      this.currentMana -= damage;
    }
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
      (this.equipmentStats.get(Modifier.Sanity) ?? 0) +
      sanityFlat
    );
  }

  get nonConditionalMaxSanity() {
    return (
      this.baseSanity +
      this.allocatedSkillPoints[Attribute.sanity] * 5 +
      (this.equipmentStats.get(Modifier.Sanity) ?? 0)
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
      (this.equipmentStats.get(Modifier.Strength) ?? 0)
    );
  }

  get nonConditionalStrength() {
    return (
      this.baseStrength +
      this.allocatedSkillPoints[Attribute.strength] +
      (this.equipmentStats.get(Modifier.Strength) ?? 0)
    );
  }

  get attackPower() {
    return this.totalStrength * 0.5 + this.totalDamage;
  }
  //----------------------------------Intelligence-------------------------------//
  get totalIntelligence() {
    // needs conditionals added to it, at time of righting no conditions affect this stat

    return (
      this.baseIntelligence +
      this.allocatedSkillPoints[Attribute.intelligence] +
      (this.equipmentStats.get(Modifier.Intelligence) ?? 0)
    );
  }

  get nonConditionalIntelligence() {
    return (
      this.baseIntelligence +
      this.allocatedSkillPoints[Attribute.intelligence] +
      (this.equipmentStats.get(Modifier.Intelligence) ?? 0)
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
      (this.equipmentStats.get(Modifier.Dexterity) ?? 0)
    );
  }

  get nonConditionalDexterity() {
    return (
      this.baseDexterity +
      this.allocatedSkillPoints[Attribute.dexterity] +
      (this.equipmentStats.get(Modifier.Dexterity) ?? 0)
    );
  }
  get criticalChance() {
    return this.totalDexterity * 0.1;
  }
  //----------------------------------Inventory----------------------------------//
  public addToInventory(item: Item | Item[] | null) {
    if (Array.isArray(item)) {
      this.baseInventory = this.baseInventory.concat(item);
    } else if (item && item.name.toLowerCase() !== "unarmored") {
      this.baseInventory.push(item);
    }
  }

  public addToKeyItems(item: Item | Item[]) {
    if (Array.isArray(item)) {
      if (item.find((item) => item.itemClass !== ItemClassType.StoryItem)) {
        return;
      }
      this.keyItems = this.keyItems.concat(item);
    } else if (item && item.itemClass === ItemClassType.StoryItem) {
      this.keyItems.push(item);
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
    const idx = this.baseInventory.findIndex((invItem) => invItem.equals(item));
    if (idx !== -1) {
      this.baseInventory.splice(idx, 1);
    }
  }

  public buyItem(itemOrItems: Item | Item[], buyPrice: number) {
    const items = Array.isArray(itemOrItems) ? itemOrItems : [itemOrItems];
    const totalCost = items.length * Math.floor(buyPrice);

    if (totalCost <= this.gold) {
      items.forEach((item) => {
        this.baseInventory.push(item);
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
      const idx = this.baseInventory.findIndex((invItem) =>
        invItem.equals(item),
      );
      if (idx !== -1) {
        this.baseInventory.splice(idx, 1);
        soldCount++;
      }
    });

    this.gold += Math.floor(sellPrice) * soldCount;
  }

  public purchaseStack(itemStack: Item[], shopArchetype: MerchantType) {
    const shop = this.root.shopsStore.getShop(shopArchetype);
    if (!shop)
      throw new Error(`Shop with archetype ${shopArchetype} not found`);

    let totalCost = 0;
    let purchaseCount = 0;
    const shopAffection = shop.shopKeeper.affection;
    const playerInventory = this.baseInventory;
    const shopInventory = shop.baseInventory;

    for (let i = 0; i < itemStack.length; i++) {
      const item = itemStack[i];

      // Check if the item exists in the shop inventory
      const shopItemIndex = shopInventory.findIndex(
        (shopItem) => shopItem.id === item.id,
      );
      if (shopItemIndex === -1) continue;

      const itemPrice = Math.floor(
        item.baseValue * (1.4 - shopAffection / 250),
      ); // Inline getBuyPrice

      if (this.gold < itemPrice) break;

      this.gold -= itemPrice;
      totalCost += itemPrice;
      playerInventory.push(item);

      // Remove the item from shop inventory immediately
      shopInventory.splice(shopItemIndex, 1);

      purchaseCount++;
    }

    if (purchaseCount > 0) {
      shop.addGold(totalCost);

      const baseChange = (totalCost / 500) * purchaseCount;
      const cappedChange = baseChange < 20 ? baseChange : 20;
      shop.changeAffection(cappedChange);
    }

    return purchaseCount;
  }

  get equipmentStats() {
    const stats = new Map<Modifier, number>();

    for (const [_, item] of Object.entries(this.equipment)) {
      if (item && "length" in item) {
        if (this.equipment.mainHand.itemClass === ItemClassType.Bow) {
          const itemStats = item[0]?.stats;
          if (!itemStats || !item[0].playerHasRequirements) continue;

          itemStats.forEach((value, key) => {
            stats.set(key, (stats.get(key) ?? 0) + value);
          });
        }
      } else {
        const itemStats = item?.stats;
        if (!itemStats || !item.playerHasRequirements) continue;

        itemStats.forEach((value, key) => {
          stats.set(key, (stats.get(key) ?? 0) + value);
        });
      }
    }

    return stats;
  }

  private calculateTotalDamage(
    baseDamageModifier: Modifier,
    addedDamageModifier: Modifier,
    multiplierModifier: Modifier,
  ): number {
    let baseDamage = 0;
    let addedDamage = 0;
    let multiplier = 1;

    for (const [_, item] of Object.entries(this.equipment)) {
      if (Array.isArray(item)) {
        baseDamage += item[0].stats?.get(baseDamageModifier) || 0;
      } else if (item && item.stats) {
        baseDamage += item.stats.get(baseDamageModifier) || 0;
        addedDamage += item.stats.get(addedDamageModifier) || 0;
        multiplier += item.stats.get(multiplierModifier) || 0;
      }
    }

    return (baseDamage + addedDamage) * multiplier;
  }

  get totalPhysicalDamage(): number {
    return this.calculateTotalDamage(
      Modifier.PhysicalDamage,
      Modifier.PhysicalDamageAdded,
      Modifier.PhysicalDamageMultiplier,
    );
  }

  get totalFireDamage(): number {
    return this.calculateTotalDamage(
      Modifier.FireDamage,
      Modifier.FireDamageAdded,
      Modifier.FireDamageMultiplier,
    );
  }

  get totalColdDamage(): number {
    return this.calculateTotalDamage(
      Modifier.ColdDamage,
      Modifier.ColdDamageAdded,
      Modifier.ColdDamageMultiplier,
    );
  }

  get totalLightningDamage(): number {
    return this.calculateTotalDamage(
      Modifier.LightningDamage,
      Modifier.LightningDamageAdded,
      Modifier.LightningDamageMultiplier,
    );
  }

  get totalPoisonDamage(): number {
    return this.calculateTotalDamage(
      Modifier.PoisonDamage,
      Modifier.PoisonDamageAdded,
      Modifier.PoisonDamageMultiplier,
    );
  }

  get totalDamage(): number {
    return (
      this.totalPhysicalDamage +
      this.totalFireDamage +
      this.totalColdDamage +
      this.totalLightningDamage +
      this.totalPoisonDamage
    );
  }

  private calculateTotalResistance(resistanceModifier: Modifier): number {
    let resistance = 0;
    for (const [_, item] of Object.entries(this.equipment)) {
      if (Array.isArray(item)) {
        // arrows - no mods
        continue;
      } else if (item && item.stats) {
        resistance += item.stats.get(resistanceModifier) || 0;
      }
    }
    // Cap resistance at 75%
    return Math.min(resistance, 75);
  }

  get fireResistance(): number {
    return this.calculateTotalResistance(Modifier.FireResistance);
  }

  get coldResistance(): number {
    return this.calculateTotalResistance(Modifier.ColdResistance);
  }

  get lightningResistance(): number {
    return this.calculateTotalResistance(Modifier.LightningResistance);
  }

  get poisonResistance(): number {
    return this.calculateTotalResistance(Modifier.PoisonResistance);
  }

  get totalArmor(): number {
    let baseArmor = 0;
    let addedArmor = 0;
    for (const [_, item] of Object.entries(this.equipment)) {
      if (Array.isArray(item)) {
        // arrows - no mods
        continue;
      } else if (item && item.stats) {
        baseArmor += item.stats.get(Modifier.Armor) || 0;
        addedArmor += item.stats.get(Modifier.ArmorAdded) || 0;
      }
    }
    return baseArmor + addedArmor;
  }

  get dodgeChance(): number {
    let dodgeChance = 0;
    for (const [_, item] of Object.entries(this.equipment)) {
      if (Array.isArray(item)) {
        // arrows - no mods
        continue;
      } else if (item && item.stats) {
        dodgeChance += item.stats.get(Modifier.DodgeChance) || 0;
      }
    }
    // Base dodge chance from dexterity (assuming 1 dexterity = 0.1% dodge chance)
    const baseDodgeChance = this.totalDexterity * 0.1;
    // Cap dodge chance at 75%
    return Math.min(dodgeChance + baseDodgeChance, 75);
  }

  get blockChance(): number {
    let blockChance = 0;
    for (const [_, item] of Object.entries(this.equipment)) {
      if (Array.isArray(item)) {
        // arrows - no mods
        continue;
      } else if (item && item.stats) {
        blockChance += item.stats.get(Modifier.BlockChance) || 0;
      }
    }
    // Cap block chance at 75%
    return Math.min(blockChance, 75);
  }

  public equipItem(
    item: Item[],
    slot: "head" | "main-hand" | "off-hand" | "body" | "quiver",
  ) {
    if (!item[0].slot) {
      return;
    }
    const percentages = this.gatherPercents();
    switch (slot) {
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
        if (
          (this.equipment.mainHand.name == "unarmored" ||
            this.equipment.mainHand.slot == "two-hand") &&
          (item[0].slot == "two-hand" ||
            item[0].itemClass == ItemClassType.Melee ||
            item[0].itemClass == ItemClassType.Wand ||
            item[0].itemClass == ItemClassType.Staff)
        ) {
          this.equipItem(item, "main-hand");
          break;
        }
        this.removeEquipment("off-hand");
        if (this.equipment.mainHand.slot == "two-hand") {
          this.removeEquipment("main-hand");
          this.setUnarmored();
        }
        this.equipment.offHand = item[0];
        this.removeFromInventory(item[0]);
        break;
      case "main-hand":
        if (
          item[0].itemClass == ItemClassType.Shield &&
          !this.equipment.offHand
        ) {
          this.equipment.offHand = item[0];
          this.removeFromInventory(item[0]);
        } else {
          this.removeEquipment("main-hand");
          if (item[0].slot == "two-hand") {
            this.removeEquipment("off-hand");
          }
          this.equipment.mainHand = item[0];
          this.removeFromInventory(item[0]);
        }
        break;
      case "quiver":
        this.removeEquipment("quiver");
        this.equipment.quiver = item;
        this.removeFromInventory(item);
        break;
    }
    this.resolvePercentages(percentages);
  }

  private gatherPercents() {
    return {
      health: this.currentHealth / this.maxHealth,
      mana: this.currentMana / this.maxMana,
      sanity: this.currentSanity / this.maxSanity,
    };
  }

  private resolvePercentages({
    health,
    mana,
    sanity,
  }: {
    health: number;
    mana: number;
    sanity: number;
  }) {
    this.currentHealth = Math.round(this.maxHealth * health);
    this.currentMana = Math.round(this.maxMana * mana);
    this.currentSanity = Math.round(this.maxSanity * sanity);
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

  public removeEquipment(
    slot: "main-hand" | "off-hand" | "body" | "head" | "quiver",
    addToInventory: boolean = true,
  ) {
    if (slot === "main-hand") {
      const item = this.equipment.mainHand;
      if (addToInventory) this.addToInventory(item);
      this.setUnarmored();
      return item;
    } else if (slot === "off-hand") {
      const item = this.equipment.offHand;
      if (addToInventory) this.addToInventory(item);
      this.equipment.offHand = null;
      return item;
    } else if (slot == "body") {
      const item = this.equipment.body;
      if (addToInventory) this.addToInventory(item);
      this.equipment.body = null;
      return item;
    } else if (slot == "head") {
      const item = this.equipment.head;
      if (addToInventory) this.addToInventory(item);
      this.equipment.head = null;
      return item;
    } else if (slot == "quiver") {
      const item = this.equipment.quiver;
      if (addToInventory) this.addToInventory(item);
      this.equipment.quiver = null;
      return item;
    }
  }

  public unEquipItem(item: Item[], addToInventory: boolean = true) {
    const percentages = this.gatherPercents();
    if (this.equipment.body?.equals(item[0])) {
      this.removeEquipment("body", addToInventory);
    } else if (this.equipment.head?.equals(item[0])) {
      this.removeEquipment("head", addToInventory);
    } else if (this.equipment.mainHand.equals(item[0])) {
      this.removeEquipment("main-hand", addToInventory);
    } else if (this.equipment.offHand?.equals(item[0])) {
      this.removeEquipment("off-hand", addToInventory);
    } else if (this.equipment.quiver?.find((arrow) => arrow.equals(item[0]))) {
      this.removeEquipment("quiver", addToInventory);
    }
    this.resolvePercentages(percentages);
  }

  /**
   * This should always be used over the `baseInventory` field
   */
  get inventory() {
    const condensedInventory: { item: Item[] }[] = [];
    this.baseInventory.forEach((item) => {
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
  public getPhysicalDamageReduction() {
    const { armorMult, armorFlat } = getConditionEffectsOnDefenses(
      this.conditions,
    );
    return damageReduction(this.totalArmor * armorMult + armorFlat);
  }

  private setUnarmored() {
    this.equipment.mainHand = new Item({
      name: "unarmored",
      slot: "one-hand",
      stats: { [Modifier.PhysicalDamage]: 1 },
      baseValue: 0,
      rarity: Rarity.NORMAL,
      prefix: null,
      suffix: null,
      itemClass: ItemClassType.Melee,
      root: this.root,
      attacks: __DEV__ ? ["punch", "dev punch"] : ["punch"],
    });
  }

  //----------------------------------Gold----------------------------------//
  get readableGold() {
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

  public setGold(gold: number) {
    if (__DEV__) {
      this.gold = gold;
    }
  }
  //----------------------------------Work----------------------------------//
  public getCurrentJobAndExperience() {
    const job = this.jobs.get(this.job);
    return { title: this.job, experience: job?.currentExperience ?? 0 };
  }

  public getJobExperience(title: string): number {
    return this.jobs.get(title)?.currentExperience ?? 0;
  }

  public performLabor({ title, cost, goldReward }: performLaborProps): boolean {
    if (
      this.currentMana < cost.mana ||
      (cost.health && this.currentHealth <= cost.health) ||
      this.job !== title
    ) {
      return false;
    }

    if (cost.health) {
      this.damageHealth({ damage: cost.health, attackerId: this.id });
    }
    if (cost.sanity) {
      this.damageSanity(cost.sanity);
    }

    this.useMana(cost.mana);
    this.addGold(goldReward);
    this.gainExperience();

    return true;
  }

  public getRewardValue(jobTitle: string, baseReward: number) {
    const job = this.jobs.get(jobTitle);
    if (job) {
      return Math.floor(baseReward + (baseReward * job.currentRank) / 5);
    } else {
      return baseReward;
    }
  }

  public getJobRank(jobTitle: string) {
    const job = this.jobs.get(jobTitle);
    return job ? job.currentRank : 0;
  }

  private gainExperience() {
    let jobData = this.jobs.get(this.job);
    if (!jobData) return;
    let exp = jobData.currentExperience;
    let rank = jobData.currentRank;

    if (exp < jobData.experienceToPromote - 1) {
      exp++;
    } else {
      exp = 0;
      rank++;
    }

    this.jobs.set(this.job, {
      ...jobData,
      currentRank: rank,
      currentExperience: exp,
    });
  }

  private initJobs() {
    const tempMap = new Map();
    for (const job of jobsJSON) {
      tempMap.set(job.title, {
        ...job,
        cost: {
          mana: job.cost.mana,
          health: job.cost.health || 0,
        },
        qualifications: job.qualifications || [],
        currentExperience: 0,
        currentRank: 0,
      });
    }
    return tempMap;
  }

  //----------------------------------Qualification----------------------------------//
  public incrementQualificationProgress(
    name: string,
    ticksToProgress: number,
    sanityCost: number,
    goldCost: number,
  ) {
    if (this.currentSanity - sanityCost > -this.maxSanity) {
      let foundQual = false;
      this.qualificationProgress.forEach((qual) => {
        if (qual.name == name) {
          foundQual = true;
          if (!qual.completed) {
            this.damageSanity(sanityCost);
            this.spendGold(goldCost);
            if (ticksToProgress > qual.progress + 1) {
              qual.progress++;
            } else {
              qual.completed = true;
              this.addQualification(qual.name);
            }
            this.root.gameTick();
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
        this.root.gameTick();
      }
    }
  }

  public getSpecifiedQualificationProgress(name: string) {
    return this.qualificationProgress.find((qual) => qual.name == name)
      ?.progress;
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
    const book = this.baseInventory.find((item) => item.name == bookName);
    if (book) {
      this.removeFromInventory(book);
    }
    this.learningSpells = newLearningState;
  }
  _unlockAllSpells() {
    if (__DEV__) {
      let spellList;
      if (this.playerClass == "paladin") {
        spellList = paladinSpells;
      } else if (this.playerClass == "necromancer") {
        spellList = necroSpells;
      } else if (this.playerClass == "ranger") {
        spellList = rangerSpells;
      } else spellList = mageSpells;

      this.knownSpells = spellList.map((spell) => spell.name);
    }
  }
  //----------------------------------Relationships----------------------------------//
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

  public canDate({
    character,
    characterAge,
  }: {
    character: Character;
    characterAge: number;
  }) {
    if (characterAge >= 18) {
      for (const child of this.children) {
        if (child.equals(character)) {
          return false;
        }
      }
      for (const parent of this.parents) {
        if (parent.equals(character)) {
          return false;
        }
      }
      return true;
    }
    return false;
  }

  public characterIsChild({ character }: { character: Character }) {
    for (const child of this.children) {
      if (child.equals(character)) {
        return true;
      }
    }
    return false;
  }

  public getAdultCharacter() {
    const allEligibleCharacters = this.getAllAdultCharacters();
    const randomIndex = Math.floor(
      Math.random() * allEligibleCharacters.length,
    );

    return allEligibleCharacters[randomIndex];
  }

  public getAllAdultCharacters() {
    const allEligibleCharacters = [
      ...this.knownCharacters,
      ...this.partners,
      ...this.children,
      ...this.parents,
    ].filter((character) => character.age >= 18 && !character.deathdate);

    return allEligibleCharacters;
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
    this.conditions = this.conditions.filter(
      (cond) => cond.id !== condition.id,
    );
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

  private conditionTicker() {
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
      currentHealth: minionObj.health,
      baseHealth: minionObj.health,
      attackPower: minionObj.attackPower,
      attackStrings: minionObj.attackStrings,
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
  get weaponAttacks() {
    if (__DEV__) {
      const fullHeal = new Attack({
        name: "DevHeal",
        user: this,
        selfDamage: -9999,
      });
      let attacks = [fullHeal, ...this.equipment.mainHand.attachedAttacks];
      const spells = this.equipment.mainHand.providedSpells;
      if (spells) {
        return [...attacks, ...spells];
      }
      return attacks;
    }
    const attacks = this.equipment.mainHand.attachedAttacks;
    const spells = this.equipment.mainHand.providedSpells ?? [];
    return [...attacks, ...spells];
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
    this.regenHealth();
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
        (chosenSpell.proficiencyNeeded ?? MasteryLevel.Novice);
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
    const minionObj = summons.find(
      (summon) => summon.name.toLowerCase() == minionName.toLowerCase(),
    );
    if (!minionObj) {
      throw new Error(`Minion (${minionName}) not found!`);
    }
    const minion = new Minion({
      creatureSpecies: minionObj.name,
      currentHealth: minionObj.health,
      baseHealth: minionObj.health,
      attackPower: minionObj.attackPower,
      attackStrings: minionObj.attackStrings,
      turnsLeftAlive: minionObj.turns,
      beingType: minionObj.beingType as BeingType,
      currentEnergy: minionObj.energy?.maximum,
      baseEnergy: minionObj.energy?.maximum,
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
    if (investment.requires.removes) {
      this.keyItems = this.keyItems.filter(
        (item) => item.name !== investment.name,
      );
    }
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
      jobs: json.jobs ? deserializeJobs(json.jobs) : new Map(),
      learningSpells: json.learningSpells,
      qualificationProgress: json.qualificationProgress,
      magicProficiencies: json.magicProficiencies,
      minions: json.minions,
      rangerPet: json.rangerPet,
      knownSpells: json.knownSpells,
      gold: json.gold,
      baseInventory: json.baseInventory
        ? json.baseInventory.map((item: any) =>
            Item.fromJSON({ ...item, root: json.root }),
          )
        : [],
      equipment: json.equipment && {
        ...Object.fromEntries(
          ["mainHand", "offHand", "body", "head"].map((slot) => [
            slot,
            json.equipment[slot]
              ? Item.fromJSON({ ...json.equipment[slot], root: json.root })
              : null,
          ]),
        ),
        quiver:
          json.equipment.quiver?.map((arrow: any) =>
            Item.fromJSON({ ...arrow, root: json.root }),
          ) ?? null,
      },
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
      pregnancyDueDate: json.pregnancyDueDate,
      isPregnant: json.isPregnant,
      //character refs
      parentIds: json.parentIds ?? [],
      childrenIds: json.childrenIds ?? [],
      partnerIds: json.partnerIds ?? [],
      knownCharacterIds: json.knownCharacterIds ?? [],
      root: json.root,
    });
    return player;
  }
}

export function serializeJobs(jobs: Map<string, JobData>) {
  const jobsObject: Record<string, JobData> = {};
  for (const [key, value] of jobs.entries()) {
    jobsObject[key] = value;
  }
  return JSON.stringify(jobsObject);
}

function deserializeJobs(serializedJobs: string) {
  const jobsObject: Record<string, JobData> = JSON.parse(serializedJobs);
  return new Map(Object.entries(jobsObject));
}

function testKeyItems(root: RootStore) {
  const items: Item[] = [];
  storyItems.forEach((obj) => {
    items.push(
      Item.fromJSON({ ...obj, itemClass: ItemClassType.StoryItem, root }),
    );
  });
  return items;
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

export function getStartingBook(player: PlayerCharacter) {
  switch (player.blessing) {
    case Element.fire:
      return new Item({
        name: "book of fire bolt",
        baseValue: 2500,
        itemClass: ItemClassType.Book,
        icon: "Book",
        rarity: Rarity.NORMAL,
        root: player.root,
      });
    case Element.water:
      return new Item({
        name: "book of frost",
        baseValue: 2500,
        itemClass: ItemClassType.Book,
        icon: "Book",
        rarity: Rarity.NORMAL,
        root: player.root,
      });
    case Element.air:
      return new Item({
        name: "book of air burst",
        baseValue: 2500,
        itemClass: ItemClassType.Book,
        icon: "Book",
        rarity: Rarity.NORMAL,
        root: player.root,
      });
    case Element.earth:
      return new Item({
        name: "book of rock toss",
        baseValue: 2500,
        itemClass: ItemClassType.Book,
        icon: "Book",
        rarity: Rarity.NORMAL,
        root: player.root,
      });
    case Element.blood:
      return new Item({
        name: "book of pull blood",
        baseValue: 2500,
        itemClass: ItemClassType.Book,
        icon: "Book",
        rarity: Rarity.NORMAL,
        root: player.root,
      });
    case Element.summoning:
      return new Item({
        name: "book of the flying skull",
        baseValue: 2500,
        itemClass: ItemClassType.Book,
        icon: "Book",
        rarity: Rarity.NORMAL,
        root: player.root,
      });
    case Element.pestilence:
      return new Item({
        name: "book of poison dart",
        baseValue: 2500,
        itemClass: ItemClassType.Book,
        icon: "Book",
        rarity: Rarity.NORMAL,
        root: player.root,
      });
    case Element.bone:
      return new Item({
        name: "book of teeth",
        baseValue: 2500,
        itemClass: ItemClassType.Book,
        icon: "Book",
        rarity: Rarity.NORMAL,
        root: player.root,
      });
    case Element.holy:
      return new Item({
        name: "book of flash heal",
        baseValue: 2500,
        itemClass: ItemClassType.Book,
        icon: "Book",
        rarity: Rarity.NORMAL,
        root: player.root,
      });
    case Element.protection:
      return new Item({
        name: "book of blessed guard",
        baseValue: 2500,
        itemClass: ItemClassType.Book,
        icon: "Book",
        rarity: Rarity.NORMAL,
        root: player.root,
      });
    case Element.vengeance:
      return new Item({
        name: "book of judgment",
        baseValue: 2500,
        itemClass: ItemClassType.Book,
        icon: "Book",
        rarity: Rarity.NORMAL,
        root: player.root,
      });
    case Element.beastMastery:
      return new Item({
        name: "book of the raven",
        baseValue: 2500,
        itemClass: ItemClassType.Book,
        icon: "Book",
        rarity: Rarity.NORMAL,
        root: player.root,
      });
    case Element.assassination:
      return new Item({
        name: "book of throw dagger",
        baseValue: 2500,
        itemClass: ItemClassType.Book,
        icon: "Book",
        rarity: Rarity.NORMAL,
        root: player.root,
      });
    case Element.arcane:
      return new Item({
        name: "book of arcane shot",
        baseValue: 2500,
        itemClass: ItemClassType.Book,
        icon: "Book",
        rarity: Rarity.NORMAL,
        root: player.root,
      });
    default:
      throw new Error("Invalid player blessing in getStartingBook()");
  }
}

const _playerSave = async (
  player: PlayerCharacter | undefined,
  callback?: () => void,
) => {
  if (player) {
    try {
      const playerData = {
        ...player,
        jobs: serializeJobs(player.jobs),
        baseInventory: player.baseInventory.map((item) => item.toJSON()),
        equipment: {
          head: player.equipment.head?.toJSON(),
          body: player.equipment.body?.toJSON(),
          mainHand: player.equipment.mainHand.toJSON(),
          offHand: player.equipment.offHand?.toJSON(),
        },
        root: undefined,
      };

      storage.set("player", stringify(playerData));
    } catch (error) {
      console.error("Error saving player:", error);
    }
  }

  if (callback) {
    callback();
  }
};
export const savePlayer = throttle(_playerSave, 500);
