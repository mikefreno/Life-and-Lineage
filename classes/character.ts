import { createDebuff, damageReduction, rollD20 } from "../utility/functions";
import { Condition } from "./conditions";
import conditions from "../assets/json/conditions.json";
import { Item } from "./item";
import weapons from "../assets/json/items/weapons.json";
import wands from "../assets/json/items/wands.json";
import mageSpells from "../assets/json/mageSpells.json";
import paladinSpells from "../assets/json/paladinSpells.json";
import necroSpells from "../assets/json/necroSpells.json";
import { Minion } from "./creatures";
import summons from "../assets/json/summons.json";
import { action, makeObservable, observable } from "mobx";

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
  affection?: number;
  health?: number;
  healthMax?: number;
  sanity?: number;
  mana?: number;
  manaMax?: number;
  manaRegen?: number;
  magicProficiencies?: { school: string; proficiency: number }[];
  jobExperience?: {
    job: string;
    experience: number;
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
  equipment?: {
    mainHand: Item;
    offHand: Item | null;
    head: Item | null;
    body: Item | null;
  };
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
  mana: number;
  manaMax: number;
  manaRegen: number;
  jobExperience: { job: string; experience: number }[];
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
  equipment: {
    mainHand: Item;
    offHand: Item | null;
    head: Item | null;
    body: Item | null;
  };

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
    affection,
    health,
    healthMax,
    sanity,
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
    equipment,
  }: PlayerCharacterOptions) {
    super({
      firstName,
      lastName,
      sex,
      birthdate,
      alive,
      deathdate,
      job,
      affection,
    });
    this.playerClass = playerClass;
    this.blessing = blessing;
    this.health = health ?? 100;
    this.healthMax = healthMax ?? 100;
    this.sanity = sanity ?? 50;
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
    this.gold = gold ?? 100;
    this.inventory = inventory ?? [];
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
      equipment: observable,
      getMaxHealth: action,
      damageHealth: action,
      getSpecifiedQualificationProgress: action,
      getMaxMana: action,
      damageSanity: action,
      addToInventory: action,
      buyItem: action,
      removeFromInventory: action,
      sellItem: action,
      equipItem: action,
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
      addBuff: action,
      createMinion: action,
      clearMinions: action,
      removeMinion: action,
      getMedicalService: action,
    });
  }
  //----------------------------------Health----------------------------------//
  public getMaxHealth() {
    let gearBuffs = 0;
    gearBuffs += this.equipment.mainHand.stats?.health ?? 0;
    gearBuffs += this.equipment.offHand?.stats?.health ?? 0;
    gearBuffs += this.equipment.body?.stats?.health ?? 0;
    gearBuffs += this.equipment.head?.stats?.health ?? 0;
    return this.healthMax + gearBuffs;
  }

  public damageHealth(damage: number | null) {
    if (damage && this.health - damage > this.healthMax) {
      this.health = this.healthMax;
      return this.health;
    }
    this.health -= damage ?? 0;
    return this.health;
  }

  private restoreHealth(amount: number) {
    if (this.health + amount < this.healthMax) {
      this.health += amount;
    } else {
      this.health = this.healthMax;
    }
  }

  //----------------------------------Mana----------------------------------//
  public getMaxMana(): number {
    let gearBuffs = 0;
    gearBuffs += this.equipment.mainHand.stats?.mana ?? 0;
    gearBuffs += this.equipment.offHand?.stats?.mana ?? 0;
    gearBuffs += this.equipment.body?.stats?.mana ?? 0;
    gearBuffs += this.equipment.head?.stats?.mana ?? 0;
    return this.manaMax;
  }

  private useMana(mana: number) {
    this.mana -= mana;
  }

  private restoreMana(amount: number) {
    if (this.mana + amount < this.manaMax) {
      this.mana += amount;
    } else {
      this.mana = this.manaMax;
    }
  }
  private regenMana() {
    if (this.mana + this.manaRegen > this.manaMax) {
      this.mana = this.manaMax;
    } else {
      this.mana += this.manaRegen;
    }
  }
  //----------------------------------Sanity----------------------------------//
  public damageSanity(damage: number | null) {
    this.sanity -= damage ?? 0;
    return this.sanity;
  }

  private restoreSanity(amount: number) {
    if (this.sanity + amount < 50) {
      this.sanity += amount;
    } else {
      this.sanity = 50;
    }
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

  private gainExperience() {
    let jobFound = false;

    this.jobExperience.forEach((job) => {
      if (job.job === this.job && job.experience < 50) {
        jobFound = true;
        job.experience++;
      }
    });

    if (!jobFound) {
      this.jobExperience.push({ job: this.job, experience: 1 });
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
        if (ticksToProgress > qual.progress) {
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
  public addCondition(condition: Condition | null) {
    if (condition) {
      this.conditions.push(condition);
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

  public doPhysicalAttack(
    attack: {
      name: string;
      targets: string;
      hitChance: number;
      damageMult: number;
      sanityDamage: number;
      debuffs: { name: string; chance: number }[] | null;
    },
    monsterMaxHP: number,
  ) {
    this.regenMana();
    const rollToHit = 20 - (attack.hitChance * 100) / 5;
    const roll = rollD20();
    if (roll >= rollToHit) {
      let hpDamage =
        attack.damageMult * (this.equipment.mainHand?.stats?.["damage"] ?? 1);

      const offHandDamage = this.equipment.offHand?.stats?.["damage"];
      if (offHandDamage) {
        hpDamage += offHandDamage * 0.5;
      }
      const sanityDamage = attack.sanityDamage;
      this.conditionTicker();
      if (attack.debuffs) {
        let debuffs: Condition[] = [];
        attack.debuffs.forEach((debuff) => {
          const debuffRes = createDebuff(
            debuff.name,
            debuff.chance,
            monsterMaxHP,
            hpDamage ?? 0,
          );
          if (debuffRes) debuffs.push(debuffRes);
        });
        return {
          damage: hpDamage,
          sanityDamage: sanityDamage,
          debuffs: debuffs,
        };
      }
      return {
        damage: hpDamage,
        sanityDamage: sanityDamage,
        debuffs: null,
      };
    } else return "miss";
  }
  //----------------------------------Magical Combat----------------------------------//
  public useSpell(
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
    },
    monsterMaxHP: number,
  ) {
    if (chosenSpell.manaCost <= this.mana) {
      this.mana -= chosenSpell.manaCost;
      this.regenMana();
      if (chosenSpell.effects.summon) {
        chosenSpell.effects.summon.map((summon) => this.createMinion(summon));
      }
      const enemyDamage = chosenSpell.effects.damage;
      const selfDamage = chosenSpell.effects.selfDamage;
      if (selfDamage) {
        this.damageHealth(selfDamage);
      }
      const buffs = chosenSpell.effects.buffs;
      if (buffs) {
        buffs.forEach((buff) => this.addBuff(buff));
      }
      this.conditionTicker();
      if (chosenSpell.effects.debuffs) {
        let debuffs: Condition[] = [];
        chosenSpell.effects.debuffs.forEach((debuff) => {
          const debuffObj = conditions.find(
            (condition) => condition.name == debuff.name,
          );
          if (!debuffObj)
            throw new Error(
              "no debuff found in debuff lookup loop in PlayerCharacter.useSpell()",
            );
          const debuffRes = createDebuff(
            debuff.name,
            debuff.chance,
            monsterMaxHP,
            chosenSpell.effects.damage ?? 0,
          );
          if (debuffRes) debuffs.push(debuffRes);
        });
        return {
          damage: enemyDamage,
          sanityDamage: chosenSpell.effects.sanityDamage ?? 0,
          debuffs: debuffs,
        };
      } else
        return {
          damage: enemyDamage,
          sanityDamage: chosenSpell.effects.sanityDamage ?? 0,
          debuffs: null,
        };
    }
    throw new Error(
      "not enough mana to useSpell(), this should be prevented on frontend",
    );
  }

  public addBuff(buffName: string) {
    const buffObj = conditions.find((condition) => (condition.name = buffName));
    if (buffObj) {
      let damage = buffObj.effectAmount;
      if (damage && buffObj.effectStyle == "percentage") {
        damage *= this.healthMax;
      }
      this.conditions.push(
        new Condition({
          name: buffObj.name,
          style: buffObj.style as "buff" | "debuff",
          turns: buffObj.turns,
          effect: buffObj.effect as (
            | "skip"
            | "accuracy halved"
            | "damage"
            | "sanity"
            | "health"
            | "armor"
          )[],
          damage: damage ?? 0,
        }),
      );
    }
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
      if (!minion.equals(minionToRemove)) {
        newList.push(minion);
      }
    });
    this.minions = newList;
  }
  private addMinion(minion: Minion) {
    this.minions.push(minion);
  }
  //----------------------------------Conditions----------------------------------//
  private conditionTicker() {
    for (let i = this.conditions.length - 1; i >= 0; i--) {
      const { effect, damage, turns } = this.conditions[i].tick();

      effect.forEach((eff) => {
        if (eff == "sanity") {
          this.damageSanity(damage);
        } else if (eff == "damage") {
          this.damageHealth(damage);
        }
      });

      if (turns == 0) {
        this.conditions.splice(i, 1);
      }
    }
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

  static fromJSON(json: any): PlayerCharacter {
    const player = new PlayerCharacter({
      firstName: json.firstName,
      lastName: json.lastName,
      sex: json.sex,
      alive: json.alive,
      birthdate: json.birthdate ?? undefined,
      deathdate: json.deathdate ?? null,
      job: json.job,
      affection: json.affection,
      playerClass: json.playerClass,
      blessing: json.blessing,
      health: json.health,
      healthMax: json.healthMax,
      sanity: json.sanity,
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
