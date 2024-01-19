import {
  createBuff,
  createDebuff,
  damageReduction,
  getConditionEffectsOnAttacks,
  getConditionEffectsOnDefenses,
  rollD20,
} from "../utility/functions";
import { Condition } from "./conditions";
import { Item } from "./item";
import weapons from "../assets/json/items/weapons.json";
import wands from "../assets/json/items/wands.json";
import mageSpells from "../assets/json/mageSpells.json";
import paladinSpells from "../assets/json/paladinSpells.json";
import necroSpells from "../assets/json/necroSpells.json";
import { Minion } from "./creatures";
import summons from "../assets/json/summons.json";
import { action, makeObservable, observable } from "mobx";
import { Investment } from "./investment";
import { AttackObj, InvestmentType, InvestmentUpgrade } from "../utility/types";

interface CharacterOptions {
  firstName: string;
  lastName: string;
  sex: "male" | "female";
  birthdate?: string;
  alive?: boolean;
  deathdate: string | null;
  job?: string;
  affection?: number;
  qualifications?: string[];
}

export class Character {
  readonly firstName: string;
  readonly lastName: string;
  readonly sex: "male" | "female";
  alive: boolean;
  readonly birthdate: string;
  deathdate: string | null;
  job: string;
  affection: number;
  qualifications: string[];

  constructor({
    firstName,
    lastName,
    sex,
    alive,
    birthdate,
    deathdate,
    job,
    affection,
    qualifications,
  }: CharacterOptions) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.sex = sex;
    this.alive = alive ?? true;
    this.birthdate = birthdate ?? new Date().toISOString();
    this.deathdate = deathdate ?? null;
    this.job = job ?? "Unemployed";
    this.affection = affection ?? 0;
    this.qualifications = qualifications ?? [];
    makeObservable(this, {
      alive: observable,
      deathdate: observable,
      job: observable,
      affection: observable,
      qualifications: observable,
      getFullName: action,
      setJob: action,
    });
  }

  public getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
  public addQualification(qual: string) {
    this.qualifications.push(qual);
  }

  public setJob(job: string) {
    this.job = job;
  }

  static fromJSON(json: any): Character {
    const character = new Character({
      firstName: json.firstName,
      lastName: json.lastName,
      sex: json.sex,
      birthdate: json.birthdate ?? undefined,
      alive: json.alive,
      deathdate: json.deathdate ?? null,
      job: json.job,
      affection: json.affection,
      qualifications: json.qualifications,
    });
    return character;
  }
}

type PlayerCharacterBase = {
  firstName: string;
  lastName: string;
  sex: "male" | "female";
  alive?: boolean;
  birthdate?: string;
  deathdate: string | null;
  job?: string;
  qualifications?: string[];
  affection?: number;
  health?: number;
  healthMax?: number;
  sanity?: number;
  sanityMax?: number;
  mana?: number;
  manaMax?: number;
  manaRegen?: number;
  magicProficiencies?: { school: string; proficiency: number }[];
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
  parents: Character[];
  children?: Character[];
  physicalAttacks?: string[];
  knownSpells?: string[];
  gold?: number;
  conditions?: Condition[];
  inventory?: Item[];
  minions?: Minion[];
  currentDungeon?: { instance: string; level: number };
  equipment?: {
    mainHand: Item;
    offHand: Item | null;
    head: Item | null;
    body: Item | null;
  };
  investments?: Investment[];
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

type PlayerCharacterOptions =
  | MageCharacter
  | NecromancerCharacter
  | PaladinCharacter;

export class PlayerCharacter extends Character {
  readonly playerClass: "mage" | "necromancer" | "paladin";
  readonly blessing:
    | "fire"
    | "water"
    | "air"
    | "earth"
    | "blood"
    | "summoning"
    | "pestilence"
    | "bone"
    | "holy"
    | "vengeance"
    | "protection";
  health: number;
  healthMax: number;
  sanity: number;
  sanityMax: number;
  mana: number;
  manaMax: number;
  manaRegen: number;
  jobExperience: { job: string; experience: number; rank: number }[];
  learningSpells: {
    bookName: string;
    spellName: string;
    experience: number;
    element: string;
  }[];
  magicProficiencies: { school: string; proficiency: number }[];
  qualificationProgress: {
    name: string;
    progress: number;
    completed: boolean;
  }[];
  minions: Minion[];
  readonly parents: Character[];
  children: Character[];
  knownSpells: string[];
  physicalAttacks: string[];
  conditions: Condition[];
  gold: number;
  inventory: Item[];
  currentDungeon: { instance: string; level: number } | null;
  equipment: {
    mainHand: Item;
    offHand: Item | null;
    head: Item | null;
    body: Item | null;
  };
  investments: Investment[];

  constructor({
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
    affection,
    health,
    healthMax,
    sanity,
    sanityMax,
    mana,
    manaMax,
    manaRegen,
    minions,
    jobExperience,
    learningSpells,
    qualificationProgress,
    magicProficiencies,
    parents,
    children,
    knownSpells,
    physicalAttacks,
    gold,
    inventory,
    currentDungeon,
    equipment,
    investments,
  }: PlayerCharacterOptions) {
    super({
      firstName,
      lastName,
      sex,
      birthdate,
      alive,
      deathdate,
      job,
      qualifications,
      affection,
    });
    this.playerClass = playerClass;
    this.blessing = blessing;
    this.health = health ?? 100;
    this.healthMax = healthMax ?? 100;
    this.sanity = sanity ?? 50;
    this.sanityMax = sanityMax ?? 50;
    this.mana = mana ?? 100;
    this.manaMax = manaMax ?? 100;
    this.manaRegen = manaRegen ?? 3;
    this.minions = minions ?? [];
    this.jobExperience = jobExperience ?? [];
    this.learningSpells = learningSpells ?? [];
    this.qualificationProgress = qualificationProgress ?? [];
    this.magicProficiencies =
      magicProficiencies ?? getStartingProficiencies(playerClass, blessing);
    this.parents = parents;
    this.children = children ?? [];
    this.knownSpells = knownSpells ?? [];
    this.conditions = [];
    this.physicalAttacks = physicalAttacks ?? ["punch"];
    this.gold = gold ?? 5000000;
    this.inventory = inventory ?? [];
    this.currentDungeon = currentDungeon ?? null;
    this.equipment = equipment ?? {
      mainHand: new Item({
        name: "unarmored",
        slot: "one-hand",
        stats: { baseDamage: 1 },
        baseValue: 0,
        itemClass: "weapon",
      }),
      offHand: null,
      head: null,
      body: null,
    };
    this.investments = investments ?? [];
    makeObservable(this, {
      health: observable,
      healthMax: observable,
      sanity: observable,
      mana: observable,
      manaMax: observable,
      manaRegen: observable,
      minions: observable,
      jobExperience: observable,
      learningSpells: observable,
      magicProficiencies: observable,
      qualificationProgress: observable,
      children: observable,
      knownSpells: observable,
      conditions: observable,
      physicalAttacks: observable,
      gold: observable,
      inventory: observable,
      currentDungeon: observable,
      equipment: observable,
      investments: observable,
      getMaxHealth: action,
      damageHealth: action,
      getSpecifiedQualificationProgress: action,
      getMaxMana: action,
      damageSanity: action,
      getMaxSanity: action,
      addToInventory: action,
      buyItem: action,
      removeFromInventory: action,
      sellItem: action,
      equipItem: action,
      unEquipItem: action,
      removeEquipment: action,
      getArmorValue: action,
      getDamageReduction: action,
      getReadableGold: action,
      spendGold: action,
      addGold: action,
      getCurrentJobAndExperience: action,
      incrementQualificationProgress: action,
      getJobExperience: action,
      performLabor: action,
      learnSpellStep: action,
      getSpells: action,
      addCondition: action,
      doPhysicalAttack: action,
      useSpell: action,
      createMinion: action,
      clearMinions: action,
      removeMinion: action,
      getMedicalService: action,
      isStunned: action,
      pass: action,
      conditionTicker: action,
      setInDungeon: action,
      changeMaxSanity: action,
      purchaseInvestmentBase: action,
      purchaseInvestmentUpgrade: action,
      collectFromInvestment: action,
      tickAllInvestments: action,
      getInvestment: action,
    });
  }
  //----------------------------------Health----------------------------------//
  public getMaxHealth() {
    let gearBuffs = 0;
    gearBuffs += this.equipment.mainHand.stats?.health ?? 0;
    gearBuffs += this.equipment.offHand?.stats?.health ?? 0;
    gearBuffs += this.equipment.body?.stats?.health ?? 0;
    gearBuffs += this.equipment.head?.stats?.health ?? 0;
    const { healthMult, healthFlat } = getConditionEffectsOnDefenses(
      this.conditions,
    );
    return (this.healthMax + gearBuffs) * healthMult + healthFlat;
  }

  public getNonBuffedMaxHealth() {
    let gearBuffs = 0;
    gearBuffs += this.equipment.mainHand.stats?.health ?? 0;
    gearBuffs += this.equipment.offHand?.stats?.health ?? 0;
    gearBuffs += this.equipment.body?.stats?.health ?? 0;
    gearBuffs += this.equipment.head?.stats?.health ?? 0;
    return this.healthMax + gearBuffs;
  }

  public damageHealth(damage?: number | null) {
    if (damage) {
      if (this.health - damage > this.healthMax) {
        this.health = this.healthMax;
        return this.health;
      }
      this.health -= damage;
    }
    return this.health;
  }

  private restoreHealth(amount: number) {
    if (this.health + amount < this.getMaxHealth()) {
      this.health += amount;
    } else {
      this.health = this.getMaxHealth();
    }
  }

  //----------------------------------Mana----------------------------------//
  public getMaxMana(): number {
    let withGearBuffs = this.manaMax;
    withGearBuffs += this.equipment.mainHand.stats?.mana ?? 0;
    withGearBuffs += this.equipment.offHand?.stats?.mana ?? 0;
    withGearBuffs += this.equipment.body?.stats?.mana ?? 0;
    withGearBuffs += this.equipment.head?.stats?.mana ?? 0;
    return withGearBuffs;
  }

  private useMana(mana: number) {
    this.mana -= mana;
  }

  private restoreMana(amount: number) {
    if (this.mana + amount < this.getMaxMana()) {
      this.mana += amount;
    } else {
      this.mana = this.getMaxMana();
    }
  }

  public getManaRegen() {
    let withGearBuffs = this.manaRegen;
    withGearBuffs += this.equipment.mainHand.stats?.regen ?? 0;
    withGearBuffs += this.equipment.offHand?.stats?.regen ?? 0;
    withGearBuffs += this.equipment.body?.stats?.regen ?? 0;
    withGearBuffs += this.equipment.head?.stats?.regen ?? 0;
    return withGearBuffs;
  }

  private regenMana() {
    if (this.mana + this.getManaRegen() < this.getMaxMana()) {
      this.mana += this.getManaRegen();
    } else {
      this.mana = this.getMaxMana();
    }
  }
  //----------------------------------Sanity----------------------------------//
  public damageSanity(damage?: number | null) {
    if (damage) {
      this.sanity -= damage;
    }
    return this.sanity;
  }

  private restoreSanity(amount: number) {
    if (this.sanity + amount < 50) {
      this.sanity += amount;
    } else {
      this.sanity = 50;
    }
  }

  public changeMaxSanity(change: number) {
    this.sanity + change;
  }

  public getNonBuffedMaxSanity() {
    let gearBuffs = 0;
    gearBuffs += this.equipment.mainHand.stats?.sanity ?? 0;
    gearBuffs += this.equipment.offHand?.stats?.sanity ?? 0;
    gearBuffs += this.equipment.body?.stats?.sanity ?? 0;
    gearBuffs += this.equipment.head?.stats?.sanity ?? 0;
    return 50 + gearBuffs;
  }

  public getMaxSanity() {
    let withGearBuffs = 50;
    withGearBuffs += this.equipment.mainHand.stats?.sanity ?? 0;
    withGearBuffs += this.equipment.offHand?.stats?.sanity ?? 0;
    withGearBuffs += this.equipment.body?.stats?.sanity ?? 0;
    withGearBuffs += this.equipment.head?.stats?.sanity ?? 0;
    return withGearBuffs;
  }

  //----------------------------------Inventory----------------------------------//
  public addToInventory(item: Item | null) {
    if (item && item.name !== "unarmored") {
      this.inventory.push(item);
    }
  }

  public buyItem(item: Item, buyPrice: number) {
    if (buyPrice <= this.gold) {
      this.inventory.push(item);
      this.gold -= buyPrice;
    }
  }

  public removeFromInventory(item: Item) {
    const idx = this.inventory.findIndex((invItem) => invItem.equals(item));

    if (idx !== -1) {
      this.inventory.splice(idx, 1);
    }
  }

  public sellItem(item: Item, sellPrice: number) {
    const idx = this.inventory.findIndex((invItem) => invItem.equals(item));
    if (idx !== -1) {
      this.inventory.splice(idx, 1);
      this.gold += sellPrice;
    }
  }

  public getCurrentEquipmentStats(): Record<string, number> {
    let armor = 0;
    let damage = 0;
    let mana = 0;
    let regen = 0;
    let health = 0;
    let blockChance = 0;

    if (this.equipment.head) {
      const stats = this.equipment.head.stats;
      if (stats) {
        if (stats.armor) {
          armor += stats.armor;
        }
        if (stats.mana) {
          mana += stats.mana;
        }
        if (stats.regen) {
          regen += stats.regen;
        }
        if (stats.health) {
          health += stats.health;
        }
      }
    }
    if (this.equipment.body) {
      const stats = this.equipment.body.stats;
      if (stats) {
        if (stats.armor) {
          armor += stats.armor;
        }
        if (stats.mana) {
          mana += stats.mana;
        }
        if (stats.regen) {
          regen += stats.regen;
        }
        if (stats.health) {
          health += stats.health;
        }
      }
    }
    if (this.equipment.mainHand) {
      const stats = this.equipment.mainHand.stats;
      if (stats) {
        if (stats.damage) {
          damage += stats.damage;
        }
        if (stats.mana) {
          mana += stats.mana;
        }
        if (stats.regen) {
          regen += stats.regen;
        }
        if (stats.health) {
          health += stats.health;
        }
      }
    }
    if (this.equipment.offHand) {
      const stats = this.equipment.offHand.stats;
      if (stats) {
        if (stats.damage) {
          damage += stats.damage * 0.5;
        }
        if (stats.armor) {
          armor += stats.armor;
        }
        if (stats.mana) {
          mana += stats.mana;
        }
        if (stats.regen) {
          regen += stats.regen;
        }
        if (stats.health) {
          health += stats.health;
        }
        if (stats.blockChance) {
          blockChance = stats.blockChance;
        }
      }
    }

    return {
      armor: armor,
      damage: damage,
      mana: mana,
      regen: regen,
      health: health,
      blockChance: blockChance,
    };
  }

  public equipItem(item: Item) {
    switch (item.slot) {
      case "head":
        this.removeEquipment("head");
        this.equipment.head = item;
        this.removeFromInventory(item);
        break;
      case "body":
        this.removeEquipment("body");
        this.equipment.body = item;
        this.removeFromInventory(item);
        break;
      case "off-hand":
        this.removeEquipment("offHand");
        if (this.equipment.mainHand.slot == "two-hand") {
          this.removeEquipment("mainHand");
          this.setUnarmored();
        }
        this.equipment.offHand = item;
        this.removeFromInventory(item);
        break;
      case "two-hand":
        this.removeEquipment("mainHand");
        this.removeEquipment("offHand");
        this.equipment.mainHand = item;
        this.removeFromInventory(item);
        break;
      case "one-hand":
        if (this.equipment.mainHand.name == "unarmored") {
          this.equipment.mainHand = item;
        } else if (this.equipment.mainHand.slot == "two-hand") {
          this.removeEquipment("mainHand");
          this.equipment.mainHand = item;
        } else {
          if (this.equipment.offHand?.slot == "off-hand") {
            this.removeEquipment("mainHand");
            this.equipment.mainHand = item;
          } else {
            this.removeEquipment("offHand");
            this.equipment.offHand = item;
          }
        }
        this.removeFromInventory(item);
        break;
    }
    this.setPhysicalAttacks();
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

  public unEquipItem(item: Item) {
    if (this.equipment.body?.equals(item)) {
      this.removeEquipment("body");
    } else if (this.equipment.head?.equals(item)) {
      this.removeEquipment("head");
    } else if (this.equipment.mainHand.equals(item)) {
      this.removeEquipment("mainHand");
    } else if (this.equipment.offHand?.equals(item)) {
      this.removeEquipment("offHand");
    }
  }

  public removeEquipment(slot: "mainHand" | "offHand" | "body" | "head") {
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
    }
  }

  public getArmorValue() {
    let armorValue = 0;
    armorValue += this.equipment.mainHand.stats?.armor ?? 0;
    armorValue += this.equipment.offHand?.stats?.armor ?? 0;
    armorValue += this.equipment.body?.stats?.armor ?? 0;
    armorValue += this.equipment.head?.stats?.armor ?? 0;
    return armorValue;
  }

  public getDamageReduction() {
    return damageReduction(this.getArmorValue());
  }

  private setUnarmored() {
    this.equipment.mainHand = new Item({
      name: "unarmored",
      slot: "one-hand",
      stats: { baseDamage: 1 },
      baseValue: 0,
      itemClass: "weapon",
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
    this.gold -= amount;
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
    if (this.mana >= cost.mana) {
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

  public getSpells() {
    let spellList: {
      name: string;
      element: string;
      proficiencyNeeded: number;
      manaCost: number;
      effects: {
        damage: number | null;
        buffs: string[] | null;
        debuffs:
          | {
              name: string;
              chance: number;
            }[]
          | null;
        summon?: string[];
        selfDamage?: number;
      };
    }[];
    if (this.playerClass == "paladin") {
      spellList = paladinSpells;
    } else if (this.playerClass == "necromancer") {
      spellList = necroSpells;
    } else spellList = mageSpells;

    let spells: {
      name: string;
      element: string;
      proficiencyNeeded: number;
      manaCost: number;
      effects: {
        damage: number | null;
        buffs: string[] | null;
        debuffs:
          | {
              name: string;
              chance: number;
            }[]
          | null;
        summon?: string[];
        selfDamage?: number;
      };
    }[] = [];
    this.knownSpells.forEach((spell) => {
      const found = spellList.find((spellObj) => spell == spellObj.name);
      if (found) {
        spells.push(found);
      }
    });
    return spells;
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
  //----------------------------------Conditions----------------------------------//
  public addCondition(condition?: Condition | null) {
    if (condition) {
      this.conditions.push(condition);
    }
  }
  public isStunned() {
    const exists = this.conditions.find(
      (condition) => condition.name == "stun",
    );
    return exists ? true : false;
  }

  public conditionTicker() {
    for (let i = this.conditions.length - 1; i >= 0; i--) {
      const { effect, healthDamage, sanityDamage, turns } =
        this.conditions[i].tick();

      if (sanityDamage) {
        this.damageSanity(sanityDamage);
      }
      if (healthDamage) {
        this.damageHealth(healthDamage);
      }
      if (turns == 0) {
        this.conditions.splice(i, 1);
      }
    }
  }

  private removeDebuffs(amount: number) {
    for (let i = 0; i < amount; i++) {
      this.conditions.shift();
    }
  }
  //----------------------------------Physical Combat----------------------------------//
  private setPhysicalAttacks() {
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
        this.physicalAttacks = itemObj.attacks;
      }
    }
  }

  public pass() {
    this.endTurn();
  }

  private endTurn() {
    this.regenMana();
    this.conditionTicker();
  }

  public doPhysicalAttack({
    chosenAttack,
    enemyMaxSanity,
    enemyMaxHP,
    enemyDR,
  }: playerAttackDeps) {
    let rollToHit: number;
    const { hitChanceMultiplier, damageMult, damageFlat } =
      getConditionEffectsOnAttacks(this.conditions);
    if (chosenAttack.hitChance) {
      rollToHit = 20 - (chosenAttack.hitChance * 100 * hitChanceMultiplier) / 5;
    } else {
      rollToHit = 0;
    }
    const roll = rollD20();
    let damagePreDR: number = 0;
    if (roll >= rollToHit) {
      if (chosenAttack.damageMult) {
        damagePreDR =
          chosenAttack.damageMult *
          (this.equipment.mainHand?.stats?.["damage"] ?? 1);
        const offHandDamage = this.equipment.offHand?.stats?.["damage"];
        if (offHandDamage) {
          damagePreDR += offHandDamage * 0.5 * chosenAttack.damageMult;
        }
      } else if (chosenAttack.flatHealthDamage) {
        damagePreDR = chosenAttack.flatHealthDamage;
      }
      let damage = damagePreDR * (1 - enemyDR);
      damage *= damageMult; // from conditions
      damage += damageFlat; // from conditions
      const unRoundedDamage = damage;
      damage = Math.round(damage * 4) / 4;
      const sanityDamage = chosenAttack.flatSanityDamage;
      let debuffs: Condition[] = [];
      let healedFor: number = 0;
      if (chosenAttack.debuffs) {
        chosenAttack.debuffs.forEach((debuff) => {
          if (debuff.name == "lifesteal") {
            const roll = rollD20();
            if (roll * 5 >= 100 - debuff.chance * 100) {
              const heal = Math.round(unRoundedDamage * 0.5 * 4) / 4;
              if (this.health + heal >= this.healthMax) {
                healedFor = this.healthMax - this.health;
                this.health = this.healthMax;
              } else {
                healedFor = heal;
                this.health += heal;
              }
            }
          } else {
            const res = createDebuff({
              debuffName: debuff.name,
              debuffChance: debuff.chance,
              enemyMaxHP: enemyMaxHP,
              enemyMaxSanity: enemyMaxSanity,
              primaryAttackDamage: damagePreDR,
            });
            if (res) debuffs.push(res);
          }
        });
      }
      let buffsForLogs: Condition[] = [];
      if (chosenAttack.buffs) {
        chosenAttack.buffs.forEach((buff) => {
          const res = createBuff({
            buffName: buff.name,
            buffChance: buff.chance,
            attackPower: damagePreDR,
            maxHealth: this.getNonBuffedMaxHealth(),
            maxSanity: this.getNonBuffedMaxSanity(),
            armor: this.getArmorValue(),
          });
          if (res) {
            this.addCondition(res);
            buffsForLogs.push(res);
          }
        });
      }
      this.endTurn();
      return {
        name: chosenAttack.name,
        damage: damage,
        heal: healedFor,
        sanityDamage: sanityDamage,
        debuffs: debuffs.length > 0 ? debuffs : undefined,
        buffs: buffsForLogs.length > 0 ? buffsForLogs : undefined,
      };
    } else {
      this.endTurn();
      return "miss";
    }
  }
  //----------------------------------Magical Combat----------------------------------//
  public useSpell({
    chosenSpell,
    enemyMaxHP,
    enemyMaxSanity,
  }: playerSpellDeps) {
    if (chosenSpell.manaCost <= this.mana) {
      this.mana -= chosenSpell.manaCost;

      if (chosenSpell.effects.summon) {
        chosenSpell.effects.summon.map((summon) => this.createMinion(summon));
      }

      const selfDamage = chosenSpell.effects.selfDamage;
      if (selfDamage) {
        this.damageHealth(selfDamage);
      }

      let buffs: Condition[] = [];
      if (chosenSpell.effects.buffs) {
        chosenSpell.effects.buffs.forEach((buff) => {
          const res = createBuff({
            buffName: buff,
            buffChance: 1.0,
            attackPower: chosenSpell.effects.damage ?? 0,
            armor: this.getArmorValue(),
            maxHealth: this.getNonBuffedMaxHealth(),
            maxSanity: this.getNonBuffedMaxSanity(),
          });
          if (res) {
            this.addCondition(res);
            buffs.push(res);
          }
        });
      }
      let debuffs: Condition[] = [];
      if (chosenSpell.effects.debuffs) {
        chosenSpell.effects.debuffs.forEach((debuff) => {
          const debuffRes = createDebuff({
            debuffName: debuff.name,
            debuffChance: debuff.chance,
            enemyMaxHP: enemyMaxHP,
            enemyMaxSanity: enemyMaxSanity,
            primaryAttackDamage: chosenSpell.effects.damage ?? 0,
          });
          if (debuffRes) debuffs.push(debuffRes);
        });
      }
      this.endTurn();
      return {
        name: chosenSpell.name,
        damage: chosenSpell.effects.damage,
        selfDamage: selfDamage,
        sanityDamage: chosenSpell.effects.sanityDamage,
        debuffs: debuffs.length > 0 ? debuffs : undefined,
        buffs: buffs.length > 0 ? buffs : undefined,
      };
    }
    throw new Error(
      "not enough mana to useSpell(), this should be prevented on frontend",
    );
  }
  //----------------------------------Minions----------------------------------//
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
    });
    this.addMinion(minion);
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
      this.currentDungeon = { instance: props.instance, level: props.level };
    } else {
      this.currentDungeon = null;
    }
  }

  static fromJSON(json: any): PlayerCharacter {
    const player = new PlayerCharacter({
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
      health: json.health,
      healthMax: json.healthMax,
      sanity: json.sanity,
      sanityMax: json.sanityMax,
      mana: json.mana,
      manaMax: json.manaMax,
      manaRegen: json.manaRegen,
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
      minions: json.minions
        ? json.minions.map((minion: any) => Minion.fromJSON(minion))
        : [],
      knownSpells: json.knownSpells,
      physicalAttacks: json.physicalAttacks,
      gold: json.gold,
      inventory: json.inventory
        ? json.inventory.map((item: any) => Item.fromJSON(item))
        : [],
      currentDungeon: json.currentDungeon,
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

interface playerAttackDeps {
  chosenAttack: AttackObj;
  enemyMaxHP: number;
  enemyMaxSanity: number | null;
  enemyDR: number;
}

interface playerSpellDeps {
  chosenSpell: {
    name: string;
    element: string;
    proficiencyNeeded: number;
    manaCost: number;
    effects: {
      damage: number | null;
      sanityDamage?: number;
      buffs: string[] | null;
      debuffs: { name: string; chance: number }[] | null;
      summon?: string[];
      selfDamage?: number;
    };
  };
  enemyMaxHP: number;
  enemyMaxSanity: number | null;
}

function getStartingProficiencies(
  playerClass: "mage" | "necromancer" | "paladin",
  blessing: string,
) {
  if (playerClass == "paladin") {
    const starter = [
      { school: "holy", proficiency: blessing == "holy" ? 50 : 0 },
      { school: "protection", proficiency: blessing == "protection" ? 50 : 0 },
      { school: "vengeance", proficiency: blessing == "vengeance" ? 50 : 0 },
    ];
    return starter;
  } else if (playerClass == "necromancer") {
    const starter = [
      { school: "blood", proficiency: blessing == "blood" ? 50 : 0 },
      { school: "summoning", proficiency: blessing == "summoning" ? 50 : 0 },
      { school: "pestilence", proficiency: blessing == "pestilence" ? 50 : 0 },
      { school: "bone", proficiency: blessing == "bone" ? 50 : 0 },
    ];
    return starter;
  } else {
    const starter = [
      { school: "fire", proficiency: blessing == "fire" ? 50 : 0 },
      { school: "water", proficiency: blessing == "water" ? 50 : 0 },
      { school: "air", proficiency: blessing == "air" ? 50 : 0 },
      { school: "earth", proficiency: blessing == "earth" ? 50 : 0 },
    ];
    return starter;
  }
}

export function getStartingBook(
  playerBlessing:
    | "fire"
    | "water"
    | "air"
    | "earth"
    | "blood"
    | "summoning"
    | "pestilence"
    | "bone"
    | "holy"
    | "vengeance"
    | "protection",
) {
  if (playerBlessing == "fire") {
    return new Item({
      name: "book of fire bolt",
      baseValue: 2500,
      itemClass: "book",
      icon: "Book",
    });
  }
  if (playerBlessing == "water") {
    return new Item({
      name: "book of frost",
      baseValue: 2500,
      itemClass: "book",
      icon: "Book",
    });
  }
  if (playerBlessing == "air") {
    return new Item({
      name: "book of gust",
      baseValue: 2500,
      itemClass: "book",
      icon: "Book",
    });
  }
  if (playerBlessing == "earth") {
    return new Item({
      name: "book of rock toss",
      baseValue: 2500,
      itemClass: "book",
      icon: "Book",
    });
  }
  if (playerBlessing == "blood") {
    return new Item({
      name: "book of pull blood",
      baseValue: 2500,
      itemClass: "book",
      icon: "Book",
    });
  }
  if (playerBlessing == "summoning") {
    return new Item({
      name: "book of the flying skull",
      baseValue: 2500,
      itemClass: "book",
      icon: "Book",
    });
  }
  if (playerBlessing == "pestilence") {
    return new Item({
      name: "book of poison dart",
      baseValue: 2500,
      itemClass: "book",
      icon: "Book",
    });
  }
  if (playerBlessing == "bone") {
    return new Item({
      name: "book of teeth",
      baseValue: 2500,
      itemClass: "book",
      icon: "Book",
    });
  }
  if (playerBlessing == "holy") {
    return new Item({
      name: "book of flash heal",
      baseValue: 2500,
      itemClass: "book",
      icon: "Book",
    });
  }
  if (playerBlessing == "protection") {
    return new Item({
      name: "book of blessed guard",
      baseValue: 2500,
      itemClass: "book",
      icon: "Book",
    });
  }
  if (playerBlessing == "vengeance") {
    return new Item({
      name: "book of judgment",
      baseValue: 2500,
      itemClass: "book",
      icon: "Book",
    });
  } else throw new Error("Invalid player blessing in getStartingBook()");
}

type enterDungeonProps = {
  state: true;
  instance: string;
  level: number;
};
type leaveDungeonProps = {
  state: false;
};
type inDungeonProps = enterDungeonProps | leaveDungeonProps;
