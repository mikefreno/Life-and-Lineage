import {
  getConditionEffectsOnDefenses,
  getConditionEffectsOnMisc,
} from "../utility/functions/conditions";
import { Condition } from "./conditions";
import { Item, isStackable } from "./item";
import attacks from "../assets/json/playerAttacks.json";
import weapons from "../assets/json/items/weapons.json";
import wands from "../assets/json/items/wands.json";
import mageSpells from "../assets/json/mageSpells.json";
import paladinSpells from "../assets/json/paladinSpells.json";
import necroSpells from "../assets/json/necroSpells.json";
import { Enemy, Minion } from "./creatures";
import summons from "../assets/json/summons.json";
import { action, makeObservable, observable, computed } from "mobx";
import * as Crypto from "expo-crypto";
import { Investment } from "./investment";
import {
  InvestmentType,
  InvestmentUpgrade,
  ItemClassType,
  MasteryLevel,
  BeingType,
  Element,
} from "../utility/types";
import { rollD20 } from "../utility/functions/roll";
import shops from "../assets/json/shops.json";
import artifacts from "../assets/json/items/artifacts.json";
import bodyArmor from "../assets/json/items/bodyArmor.json";
import mageBooks from "../assets/json/items/mageBooks.json";
import necroBooks from "../assets/json/items/necroBooks.json";
import paladinBooks from "../assets/json/items/paladinBooks.json";
import foci from "../assets/json/items/foci.json";
import hats from "../assets/json/items/hats.json";
import helmets from "../assets/json/items/helmets.json";
import ingredients from "../assets/json/items/ingredients.json";
import junk from "../assets/json/items/junk.json";
import poison from "../assets/json/items/poison.json";
import potions from "../assets/json/items/potions.json";
import robes from "../assets/json/items/robes.json";
import shields from "../assets/json/items/shields.json";
import { calculateAge, rollToLiveByAge } from "../utility/functions/misc/age";
import { damageReduction } from "../utility/functions/misc/numbers";
import { getMasteryLevel } from "../utility/spellHelper";
import type {
  BoundingBox,
  Tile,
} from "../components/DungeonComponents/DungeonMap";
import { toTitleCase } from "../utility/functions/misc/words";
import { Attack } from "./attack";
import { Spell } from "./spell";

interface CharacterOptions {
  id?: string;
  firstName: string;
  lastName: string;
  sex: "male" | "female";
  birthdate?: string;
  alive?: boolean;
  deathdate?: string;
  job?: string;
  isPlayerPartner?: boolean;
  affection?: number;
  qualifications?: string[];
  dateCooldownStart?: string;
}

/**
 * This class fully contain characters like parents, children, met characters and shopkeepers(which are a property of the `Shop` class).
 * This class serves as a base for the player's character - `PlayerCharacter`
 */
export class Character {
  readonly id: string;
  readonly beingType = "human";
  readonly firstName: string;
  readonly lastName: string;
  readonly sex: "male" | "female";
  alive: boolean;
  readonly birthdate: string;
  deathdate: string | null;
  job: string;
  isPlayerPartner: boolean;
  affection: number;
  qualifications: string[];
  dateCooldownStart?: string;

  constructor({
    id,
    firstName,
    lastName,
    sex,
    alive,
    birthdate,
    deathdate,
    job,
    isPlayerPartner,
    affection,
    qualifications,
    dateCooldownStart,
  }: CharacterOptions) {
    this.id = id ?? Crypto.randomUUID();
    this.firstName = firstName;
    this.lastName = lastName;
    this.sex = sex;
    this.alive = alive ?? true;
    this.birthdate = birthdate ?? new Date().toISOString();
    this.deathdate = deathdate ?? null;
    this.job = job ?? "Unemployed";
    this.isPlayerPartner = isPlayerPartner ?? false;
    this.affection = affection ?? 0;
    this.qualifications = qualifications ?? [];
    this.dateCooldownStart = dateCooldownStart;
    makeObservable(this, {
      alive: observable,
      deathdate: observable,
      job: observable,
      affection: observable,
      qualifications: observable,
      isPlayerPartner: observable,
      dateCooldownStart: observable,
      fullName: computed,
      setJob: action,
      deathRoll: action,
      setDateCooldownStart: action,
      updateAffection: action,
    });
  }

  /**
   * Used to check if the character object is the same as another
   */
  public equals(otherCharacter: Character) {
    return this.id == otherCharacter.id;
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  public addQualification(qual: string) {
    this.qualifications.push(qual);
  }

  public setJob(job: string) {
    this.job = job;
  }

  public setDateCooldownStart(date: string) {
    this.dateCooldownStart = date;
  }

  public deathRoll(gameDate: Date) {
    if (!(this instanceof PlayerCharacter)) {
      const age = calculateAge(new Date(this.birthdate), gameDate);
      const rollToLive = rollToLiveByAge(age);

      const rollOne = rollD20();
      if (rollOne >= rollToLive) return;
      const rollTwo = rollD20();
      if (rollTwo >= rollToLive) return;
      const rollThree = rollD20();
      if (rollThree >= rollToLive) return;

      this.alive = false;
      this.deathdate = new Date().toISOString();
    }
  }

  /**
   * This is called on non player characters to manage their `affection` to the player.
   * Affection is used to calculate prices in shops and allows for certain character interactions
   */
  public updateAffection(change: number) {
    if (this.affection + change >= 100) {
      this.affection = 100;
    } else if (this.affection + change < -100) {
      this.affection = -100;
    } else {
      this.affection += change;
    }
  }

  static fromJSON(json: any): Character {
    const character = new Character({
      id: json.id,
      firstName: json.firstName,
      lastName: json.lastName,
      sex: json.sex,
      birthdate: json.birthdate ?? undefined,
      alive: json.alive,
      deathdate: json.deathdate ?? null,
      isPlayerPartner: json.isPlayerPartner,
      job: json.job,
      affection: json.affection,
      qualifications: json.qualifications,
      dateCooldownStart: json.dateCooldownStart,
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
    element: string;
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
  minions?: Minion[];
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
  allocatedSkillPoints?: {
    health: number;
    mana: number;
    sanity: number;
    strength: number;
    intelligence: number;
    dexterity: number;
  };

  alive?: boolean;
};

type MageCharacter = PlayerCharacterBase & {
  playerClass: "mage";
  blessing: "fire" | "water" | "air" | "earth";
};
type NecromancerCharacter = PlayerCharacterBase & {
  playerClass: "necromancer";
  blessing: "blood" | "summoning" | "pestilence" | "bone";
};
type PaladinCharacter = PlayerCharacterBase & {
  playerClass: "paladin";
  blessing: "holy" | "vengeance" | "protection";
};
type RangerCharacter = PlayerCharacterBase & {
  playerClass: "ranger";
  blessing: "assassination" | "beastMastery" | "arcane";
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
  readonly playerClass: "mage" | "necromancer" | "paladin" | "ranger";
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
  allocatedSkillPoints: {
    health: number;
    mana: number;
    sanity: number;
    strength: number;
    intelligence: number;
    dexterity: number;
  };

  knownSpells: string[];
  learningSpells: {
    bookName: string;
    spellName: string;
    experience: number;
    element: string;
  }[];

  minions: Minion[];
  jobExperience: { job: string; experience: number; rank: number }[];
  qualificationProgress: {
    name: string;
    progress: number;
    completed: boolean;
  }[];

  conditions: Condition[];
  inventory: Item[];
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
    this.playerClass = playerClass;
    this.blessing = Element[blessing];

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
      getStartingProficiencies(playerClass, Element[blessing]);

    this.currentHealth = currentHealth ?? baseHealth;
    this.currentSanity = currentSanity ?? baseSanity;
    this.currentMana = currentMana ?? baseMana;

    this.unAllocatedSkillPoints = unAllocatedSkillPoints ?? 0;
    this.allocatedSkillPoints = allocatedSkillPoints ?? {
      health: 0,
      mana: 0,
      sanity: 0,
      strength: 0,
      intelligence: 0,
      dexterity: 0,
    };

    this.gold =
      gold ?? process.env.NODE_ENV === "development" ? 1_000_000 : 500;

    this.minions = minions ?? [];
    this.jobExperience = jobExperience ?? [];
    this.learningSpells = learningSpells ?? [];
    this.qualificationProgress = qualificationProgress ?? [];

    this.children = children ?? [];
    this.partners = partners ?? [];
    this.knownCharacters = knownCharacters ?? [];
    this.knownSpells = knownSpells ?? [];
    this.conditions = conditions ?? [];

    this.inventory = inventory ?? [];
    this.currentDungeon = currentDungeon ?? null;
    this.equipment = equipment ?? {
      mainHand: new Item({
        name: "unarmored",
        slot: "one-hand",
        stats: { baseDamage: 1 },
        baseValue: 0,
        itemClass: ItemClassType.Weapon,
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
      clearMinions: action,
      removeMinion: action,

      physicalAttacks: computed,
      pass: action,

      isStunned: computed,
      addCondition: action,
      conditionTicker: action,

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

      addToInventory: action,
      buyItem: action,
      removeFromInventory: action,
      sellItem: action,
      equipment: observable,
      equipItem: action,
      unEquipItem: action,
      getInventory: observable,
      getDamageReduction: action,

      getMedicalService: action,
      setInDungeon: action,
      bossDefeated: action,
    });
  }
  //----------------------------------Stats----------------------------------//
  public bossDefeated() {
    this.addSkillPoint({ amount: 3 });
  }

  public addSkillPoint({
    amount = 1,
    to = "unallocated",
  }: {
    amount?: number;
    to?:
      | "health"
      | "mana"
      | "sanity"
      | "strength"
      | "intelligence"
      | "dexterity"
      | "unallocated";
  }) {
    switch (to) {
      case "health":
      case "mana":
      case "sanity":
      case "strength":
      case "intelligence":
      case "dexterity":
        this.unAllocatedSkillPoints -= amount;
        this.allocatedSkillPoints[to] += amount;
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
    from:
      | "health"
      | "mana"
      | "sanity"
      | "strength"
      | "intelligence"
      | "dexterity";
  }) {
    if (this.allocatedSkillPoints[from] >= amount) {
      this.allocatedSkillPoints[from] -= amount;
      this.addSkillPoint({ amount });
    }
  }

  public getTotalAllocatedPoints() {
    return (
      this.allocatedSkillPoints.health +
      this.allocatedSkillPoints.mana +
      this.allocatedSkillPoints.sanity +
      this.allocatedSkillPoints.strength +
      this.allocatedSkillPoints.intelligence +
      this.allocatedSkillPoints.dexterity
    );
  }
  //----------------------------------Health----------------------------------//
  get maxHealth() {
    const { healthFlat, healthMult } = getConditionEffectsOnDefenses(
      this.conditions,
    );
    return (
      (this.baseHealth + this.allocatedSkillPoints.health * 10) * healthMult +
      this.equipmentStats.health +
      healthFlat
    );
  }

  get nonConditionalMaxHealth() {
    return (
      this.baseHealth +
      this.allocatedSkillPoints.health * 10 +
      this.equipmentStats.health
    );
  }

  public damageHealth(damage?: number | null) {
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
      (this.baseMana + this.allocatedSkillPoints.mana * 10) * manaMaxMult +
      this.equipmentStats.mana +
      manaMaxFlat
    );
  }

  get nonConditionalMaxMana() {
    return (
      this.baseMana +
      this.allocatedSkillPoints.mana * 10 +
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

  private restoreMana(amount: number) {
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
      (this.baseSanity + this.allocatedSkillPoints.sanity * 5) * sanityMult +
      this.equipmentStats.sanity +
      sanityFlat
    );
  }

  get nonConditionalMaxSanity() {
    return (
      this.baseSanity +
      this.allocatedSkillPoints.sanity * 5 +
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
    this.baseSanity + change;
  }

  //----------------------------------Strength-----------------------------------//
  get totalStrength() {
    // needs conditionals added to it, at time of righting no conditions affect this stat

    return (
      this.baseStrength +
      this.allocatedSkillPoints.strength +
      this.equipmentStats.strength
    );
  }

  get nonConditionalStrength() {
    return (
      this.baseStrength +
      this.allocatedSkillPoints.strength +
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
      this.allocatedSkillPoints.intelligence +
      this.equipmentStats.intelligence
    );
  }

  get nonConditionalIntelligence() {
    return (
      this.baseIntelligence +
      this.allocatedSkillPoints.intelligence +
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
      this.allocatedSkillPoints.dexterity +
      this.equipmentStats.dexterity
    );
  }

  get nonConditionalDexterity() {
    return (
      this.baseDexterity +
      this.allocatedSkillPoints.dexterity +
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
        continue; // arrows do not provide stats, only quiver accepts array
      } else {
        const stats = item?.stats;
        if (!stats || !item.playerHasRequirements(this)) continue;
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
    console.log("removing: ", item);
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
      itemClass: "weapon" as ItemClassType,
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
      this.clearMinions();
      //make sure state is aligned
      if (this.job !== title) {
        throw new Error("Requested Labor on unassigned profession");
      } else {
        if (cost.health) {
          this.damageHealth(cost.health);
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
    } else spellList = mageSpells;

    let spells: Spell[] = [];
    this.knownSpells.forEach((spell) => {
      const found = spellList.find((spellObj) => spell == spellObj.name);
      if (found) {
        const spell = new Spell({
          name: found.name,
          element: Element[found.element],
          proficiencyNeeded: found.proficiencyNeeded,
          manaCost: found.manaCost,
          duration: found.duration,
          effects: found.effects,
        });
        spells.push(spell);
      }
    });
    return spells;
  }

  public learnSpellStep(bookName: string, spell: string, element: string) {
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

  public removePartner(character: Character) {
    this.partners = this.partners.filter(
      (partner) => !character.equals(partner),
    );
    this.knownCharacters.push(character);
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
  //----------------------------------Conditions----------------------------------//
  public addCondition(condition?: Condition | null) {
    if (condition) {
      this.conditions.push(condition);
    }
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
  //----------------------------------Mage Only------------------------------------//
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
  //----------------------------------Necromancer Only------------------------------//
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
    let builtAttacks: Attack[] = [];
    if (this.equipment.mainHand) {
      let itemObj;
      itemObj = weapons.find(
        (weapon) => weapon.name == this.equipment.mainHand!.name,
      );
      if (!itemObj) {
        itemObj = wands.find(
          (weapon) => weapon.name == this.equipment.mainHand!.name,
        );
      }
      if (itemObj) {
        const attackStrings = itemObj.attacks;
        attacks.filter((attack) => {
          if (attackStrings.includes(attack.name)) {
            const builtAttack = new Attack({
              name: attack.name,
              hitChance: attack.hitChance,
              targets: attack.targets as "single" | "cleave" | "aoe",
              damageMult: attack.damageMult,
            });
            builtAttacks.push(builtAttack);
          }
        });
      } else {
        const punchObj = attacks.find(
          (attackObj) => attackObj.name == "punch",
        )!;
        const attack = new Attack({
          name: punchObj.name,
          damageMult: punchObj.damageMult,
          hitChance: punchObj.damageMult,
        });
        builtAttacks.push(attack);
      }
    } else {
      const punchObj = attacks.find((attackObj) => attackObj.name == "punch")!;
      const attack = new Attack({
        name: punchObj.name,
        damageMult: punchObj.damageMult,
        hitChance: punchObj.damageMult,
      });
      builtAttacks.push(attack);
    }
    return builtAttacks;
  }

  public pass({ voluntary = false }: { voluntary?: boolean }) {
    if (voluntary) {
      this.regenMana(); // if the user voluntarily passes the turn, their mana regen is doubled
    }
    this.endTurn();
  }

  private endTurn() {
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

  public currentMasteryLevel(
    school: string,
    asString: boolean = false,
  ): MasteryLevel | string {
    const schoolProficiency = this.magicProficiencies.find(
      (prof) => prof.school == school,
    )?.proficiency;
    return getMasteryLevel(schoolProficiency ?? 0, asString);
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
  playerClass: "mage" | "necromancer" | "paladin" | "ranger",
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
  const itemType = ItemClassType["Book"];

  switch (playerBlessing) {
    case "fire":
      return new Item({
        name: "book of fire bolt",
        baseValue: 2500,
        itemClass: itemType,
        icon: "Book",
      });
    case "water":
      return new Item({
        name: "book of frost",
        baseValue: 2500,
        itemClass: itemType,
        icon: "Book",
      });
    case "air":
      return new Item({
        name: "book of gust",
        baseValue: 2500,
        itemClass: itemType,
        icon: "Book",
      });
    case "earth":
      return new Item({
        name: "book of rock toss",
        baseValue: 2500,
        itemClass: itemType,
        icon: "Book",
      });
    case "blood":
      return new Item({
        name: "book of pull blood",
        baseValue: 2500,
        itemClass: itemType,
        icon: "Book",
      });
    case "summoning":
      return new Item({
        name: "book of the flying skull",
        baseValue: 2500,
        itemClass: itemType,
        icon: "Book",
      });
    case "pestilence":
      return new Item({
        name: "book of poison dart",
        baseValue: 2500,
        itemClass: itemType,
        icon: "Book",
      });
    case "bone":
      return new Item({
        name: "book of teeth",
        baseValue: 2500,
        itemClass: itemType,
        icon: "Book",
      });
    case "holy":
      return new Item({
        name: "book of flash heal",
        baseValue: 2500,
        itemClass: itemType,
        icon: "Book",
      });
    case "protection":
      return new Item({
        name: "book of blessed guard",
        baseValue: 2500,
        itemClass: itemType,
        icon: "Book",
      });
    case "vengeance":
      return new Item({
        name: "book of judgment",
        baseValue: 2500,
        itemClass: itemType,
        icon: "Book",
      });
    case "beastMastery":
      return new Item({
        name: "book of the raven",
        baseValue: 2500,
        itemClass: itemType,
        icon: "Book",
      });
    case "assassination":
      return new Item({
        name: "book of throw dagger",
        baseValue: 2500,
        itemClass: itemType,
        icon: "Book",
      });
    case "arcane":
      return new Item({
        name: "book of arcane shot",
        baseValue: 2500,
        itemClass: itemType,
        icon: "Book",
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

interface ShopProps {
  baseGold: number;
  currentGold?: number;
  lastStockRefresh: Date;
  inventory?: Item[];
  shopKeeper: Character;
  archetype: string;
}

export class Shop {
  baseGold: number;
  currentGold: number;
  lastStockRefresh: string;
  inventory: Item[];
  shopKeeper: Character;
  readonly archetype: string;

  constructor({
    baseGold,
    currentGold,
    lastStockRefresh,
    inventory,
    shopKeeper,
    archetype,
  }: ShopProps) {
    this.baseGold = baseGold;
    this.currentGold = currentGold ?? baseGold;
    this.lastStockRefresh =
      lastStockRefresh.toISOString() ?? new Date().toISOString();
    this.inventory = inventory ?? [];
    this.archetype = archetype;
    this.shopKeeper = shopKeeper;
    makeObservable(this, {
      shopKeeper: observable,
      baseGold: observable,
      currentGold: observable,
      lastStockRefresh: observable,
      refreshInventory: action,
      buyItem: action,
      sellItem: action,
    });
  }

  public refreshInventory(playerClass: "mage" | "necromancer" | "paladin") {
    const shopObj = shops.find((shop) => shop.type == this.archetype);
    if (shopObj) {
      const newCount = getRandomInt(
        shopObj.itemQuantityRange.minimum,
        shopObj.itemQuantityRange.maximum,
      );
      this.inventory = generateInventory(newCount, shopObj.trades, playerClass);
      this.lastStockRefresh = new Date().toISOString();
      this.currentGold = this.baseGold;
    } else {
      throw new Error("Shop not found on refreshInventory()");
    }
  }

  private changeAffection(change: number) {
    this.shopKeeper.affection += Math.floor(change * 4) / 4;
  }

  public buyItem(item: Item, buyPrice: number) {
    if (Math.floor(buyPrice) <= this.currentGold) {
      this.inventory.push(item);
      this.currentGold -= Math.floor(buyPrice);
      this.changeAffection(buyPrice / 1000);
    }
  }

  public sellItem(item: Item, sellPrice: number) {
    const idx = this.inventory.findIndex((invItem) => invItem.equals(item));
    if (idx !== -1) {
      this.inventory.splice(idx, 1);
      this.currentGold += Math.floor(sellPrice);
      this.changeAffection(sellPrice / 1000);
    }
  }

  static fromJSON(json: any): Shop {
    return new Shop({
      shopKeeper: Character.fromJSON(json.shopKeeper),
      baseGold: json.baseGold,
      currentGold: json.currentGold,
      lastStockRefresh: new Date(json.lastStockRefresh),
      inventory: json.inventory.map((item: any) => Item.fromJSON(item)),
      archetype: json.archetype,
    });
  }
}

//----------------------associated functions----------------------//

function getAnItemByType(
  type: string,
  playerClass: "mage" | "paladin" | "necromancer",
): Item {
  type = toTitleCase(type);

  const itemTypes: { [key: string]: any[] } = {
    Artifact: artifacts,
    BodyArmor: bodyArmor,
    Book:
      {
        mage: mageBooks,
        paladin: paladinBooks,
        necromancer: necroBooks,
      }[playerClass] || mageBooks,
    Focus: foci,
    Hat: hats,
    Helmet: helmets,
    Ingredient: ingredients,
    Junk: junk,
    Poison: poison,
    Potion: potions,
    Robe: robes,
    Shield: shields,
    Wand: wands,
    Weapon: weapons,
  };

  if (!(type in itemTypes)) {
    throw new Error(`Invalid type passed to getAnItemByType(): ${type}`);
  }

  const items = itemTypes[type];
  const idx = getRandomInt(0, items.length - 1);
  const itemObj = items[idx];

  return Item.fromJSON({
    ...itemObj,
    itemClass: type,
    stackable: isStackable(type as ItemClassType),
  });
}

export function generateInventory(
  inventoryCount: number,
  trades: string[],
  playerClass: "mage" | "necromancer" | "paladin",
) {
  let items: Item[] = [];
  for (let i = 0; i < inventoryCount; i++) {
    const type = trades[Math.floor(Math.random() * trades.length)];
    items.push(getAnItemByType(type, playerClass));
  }
  return items;
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
