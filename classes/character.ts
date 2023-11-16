import { rollD20 } from "../utility/functions";
import { AttackObject } from "../utility/types";
import { Condition } from "./conditions";
import conditions from "../assets/conditions.json";

interface CharacterOptions {
  firstName: string;
  lastName: string;
  sex: "male" | "female";
  birthdate: Date;
  alive?: boolean;
  deathdate?: Date | null;
  job?: string;
  affection?: number;
  qualifications?: string[];
}

export class Character {
  readonly firstName: string;
  readonly lastName: string;
  readonly sex: "male" | "female";
  readonly birthdate: Date;
  protected alive: boolean;
  protected deathdate: Date | null;
  protected job: string;
  protected affection: number;
  protected qualifications: string[];

  constructor({
    firstName,
    lastName,
    sex,
    birthdate,
    alive,
    deathdate,
    job,
    affection,
    qualifications,
  }: CharacterOptions) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.sex = sex;
    this.birthdate = birthdate;
    this.alive = alive ?? true;
    this.deathdate = deathdate ?? null;
    this.job = job ?? "Unemployed";
    this.affection = affection ?? 0;
    this.qualifications = qualifications ?? [];
  }

  public getName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  public getJobTitle(): string {
    return this.job;
  }

  public getQualifications() {
    return this.qualifications;
  }

  public setJobTitle(newJobTitle: string) {
    this.job = newJobTitle;
  }

  public toJSON(): object {
    return {
      firstName: this.firstName,
      lastName: this.lastName,
      sex: this.sex,
      birthdate: this.birthdate.toISOString(),
      alive: this.alive,
      deathdate: this.deathdate ? this.deathdate.toISOString() : null,
      job: this.job,
      affection: this.affection,
      qualifications: this.qualifications,
    };
  }

  static fromJSON(json: any): Character {
    const character = new Character({
      firstName: json.firstName,
      lastName: json.lastName,
      sex: json.sex,
      birthdate: new Date(json.birthdate),
      alive: json.alive,
      deathdate: json.deathdate ? new Date(json.deathdate) : null,
      job: json.job,
      affection: json.affection,
      qualifications: json.qualifications,
    });
    return character;
  }
}

interface PlayerCharacterOptions {
  firstName: string;
  lastName: string;
  sex: "male" | "female";
  birthdate: Date;
  alive?: boolean;
  deathdate?: Date | null;
  job?: string;
  affection?: number;
  health?: number;
  healthMax?: number;
  sanity?: number;
  mana?: number;
  manaMax?: number;
  elementalProficiencies?: { element: string; proficiency: number }[];
  jobExperience?: {
    job: string;
    experience: number;
  }[];
  parents: Character[];
  children?: Character[];
  element: string;
  physicalAttacks?: string[];
  knownSpells?: string[];
  gold?: number;
  conditions?: Condition[];
  equipment?: {
    weapon: { name: string; baseDamage: number };
    head: {
      name: string;
      heathBonus: number;
      staminaBonus: number;
      manaBonus: number;
    };
    body: {
      name: string;
      heathBonus: number;
      staminaBonus: number;
      manaBonus: number;
    };
  };
}

export class PlayerCharacter extends Character {
  private health: number;
  private healthMax: number;
  private sanity: number;
  private mana: number;
  private manaMax: number;
  public jobExperience: { job: string; experience: number }[];
  private elementalProficiencies: { element: string; proficiency: number }[];
  private parents: Character[];
  private children: Character[] | null = null;
  private element: string;
  private knownSpells: string[];
  private physicalAttacks: string[];
  private conditions: Condition[];
  private gold: number;
  private equipment: {
    weapon: { name: string; baseDamage: number };
    head?: {
      name: string;
      heathBonus: number;
      staminaBonus: number;
      manaBonus: number;
    };
    body?: {
      name: string;
      heathBonus: number;
      staminaBonus: number;
      manaBonus: number;
    };
  };

  constructor({
    firstName,
    lastName,
    sex,
    birthdate,
    alive,
    deathdate,
    job,
    affection,
    health,
    healthMax,
    sanity,
    mana,
    manaMax,
    jobExperience,
    elementalProficiencies,
    parents,
    children,
    element,
    knownSpells,
    physicalAttacks,
    gold,
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
    this.health = health ?? 100;
    this.healthMax = healthMax ?? 100;
    this.sanity = sanity ?? 50;
    this.mana = mana ?? 100;
    this.manaMax = manaMax ?? 100;
    this.jobExperience = jobExperience ?? [];
    this.elementalProficiencies = elementalProficiencies ?? [
      { element: "fire", proficiency: element == "Fire" ? 50 : 0 },
      { element: "water", proficiency: element == "Water" ? 50 : 0 },
      { element: "air", proficiency: element == "Air" ? 50 : 0 },
      { element: "earth", proficiency: element == "Earth" ? 50 : 0 },
    ];
    this.parents = parents;
    this.children = children ?? null;
    this.element = element;
    this.knownSpells = knownSpells ?? [];
    this.conditions = [];
    this.physicalAttacks = physicalAttacks ?? ["punch"];
    this.gold = gold ?? 25;
    this.equipment = equipment ?? {
      weapon: { name: "unarmored", baseDamage: 1 },
    };
  }

  //----------------------------------Health----------------------------------//
  public getHealth() {
    return this.health;
  }

  public getMaxHealth() {
    return this.healthMax;
  }

  public damageHealth(damage: number | null) {
    this.health -= damage ?? 0;
    return this.health;
  }

  //----------------------------------Mana----------------------------------//
  public getMana(): number {
    return this.mana;
  }

  public getMaxMana(): number {
    return this.manaMax;
  }
  private useMana(mana: number) {
    this.mana -= mana;
  }
  //----------------------------------Sanity----------------------------------//
  public getSanity(): number {
    return this.sanity;
  }

  public effectSanity(damage: number | null) {
    this.sanity += damage ?? 0;
    return this.sanity;
  }

  //----------------------------------Gold----------------------------------//
  public getGold() {
    return this.gold;
  }

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
      //make sure state is aligned
      if (this.job !== title) {
        throw new Error("Requested Labor on unassigned profession");
      } else {
        if (cost.health) {
          this.damageHealth(cost.health);
        }
        if (cost.sanity) {
          this.effectSanity(cost.sanity);
        }
        this.useMana(cost.mana);
        this.addGold(goldReward);
        this.gainExperience();
      }
    }
  }

  private gainExperience() {
    let jobWasFoundAndIncremented = false;

    //console.log(Object.isFrozen(this.jobExperience))
    //to understand why this is necessary, uncomment the above line before calling
    let newJobExperience = this.jobExperience.map((job) => {
      if (job.job === this.job) {
        const newExp = job.experience + 1;
        jobWasFoundAndIncremented = true;
        return { job: job.job, experience: newExp };
      }
      return job;
    });

    if (!jobWasFoundAndIncremented) {
      newJobExperience.push({ job: this.job, experience: 1 });
    }

    this.jobExperience = newJobExperience;
  }

  //----------------------------------Relationships----------------------------------//
  public getParents(): Character[] {
    return this.parents;
  }

  public getChildren(): Character[] | null {
    return this.children;
  }
  private addGold(gold: number) {
    this.gold += gold;
  }

  //----------------------------------Combat----------------------------------//

  public getPhysicalAttacks(): string[] {
    return this.physicalAttacks;
  }

  public addCondition(condition: Condition | null) {
    if (condition) {
      this.conditions.push(condition);
    }
  }

  public doPhysicalAttack(attack: AttackObject, monsterMaxHP: number) {
    const rollToHit = 20 - (attack.hitChance * 100) / 5;
    const roll = rollD20();
    if (roll >= rollToHit) {
      const hpDamage = attack.damageMult * this.equipment.weapon.baseDamage;
      const sanityDamage = attack.sanityDamage;
      const effectChance = attack.secondaryEffectChance;
      if (effectChance) {
        let effect: Condition | null = null;
        const rollToEffect = 20 - (effectChance * 100) / 5;
        const roll = rollD20();
        if (roll > rollToEffect) {
          const conditionJSON = conditions.find(
            (condition) => condition.name == attack.secondaryEffect,
          );
          if (conditionJSON?.damageAmount) {
            let damage = conditionJSON.damageAmount;
            if (conditionJSON.damageStyle == "multiplier") {
              damage *= hpDamage;
            } else if (conditionJSON.damageStyle == "percentage") {
              damage *= monsterMaxHP;
            }
            effect = new Condition({
              name: conditionJSON.name,
              style: conditionJSON.style as "debuff" | "buff",
              turns: conditionJSON.turns,
              effect: conditionJSON.effect as (
                | "skip"
                | "accuracy halved"
                | "damage"
                | "sanity"
              )[],
              damage: damage,
            });
            return {
              damage: hpDamage,
              sanityDamage: sanityDamage,
              secondaryEffects: effect,
            };
          }
        }
      }
      return {
        damage: hpDamage,
        sanityDamage: sanityDamage,
        secondaryEffects: null,
      };
    } else return "miss";
  }

  public conditionTicker() {
    for (let i = this.conditions.length - 1; i >= 0; i--) {
      const { effect, damage, turns } = this.conditions[i].tick();

      effect.forEach((eff) => {
        if (eff == "sanity") {
          this.effectSanity(damage);
        } else if (eff == "damage") {
          this.damageHealth(damage);
        }
      });

      if (turns == 0) {
        this.conditions.splice(i, 1);
      }
    }
  }

  //-----------------Misc-----------------//

  public getElementalProficiencies() {
    return this.elementalProficiencies;
  }

  public toJSON(): object {
    return {
      ...super.toJSON(),
      health: this.health,
      healthMax: this.healthMax,
      sanity: this.sanity,
      mana: this.mana,
      manaMax: this.manaMax,
      jobExperience: this.jobExperience,
      elementalProficiencies: this.elementalProficiencies,
      parents: this.parents.map((parent) => parent.toJSON()),
      children: this.children?.map((child) => child.toJSON()),
      conditions: this.conditions.map((condition) => condition.toJSON()),
      element: this.element,
      knownSpells: this.knownSpells,
      physicalAttacks: this.physicalAttacks,
      gold: this.gold,
      equipment: this.equipment,
    };
  }

  static fromJSON(json: any): PlayerCharacter {
    const player = new PlayerCharacter({
      firstName: json.firstName,
      lastName: json.lastName,
      sex: json.sex,
      birthdate: new Date(json.birthdate),
      alive: json.alive,
      deathdate: json.deathdate ? new Date(json.deathdate) : null,
      job: json.job,
      affection: json.affection,
      health: json.health,
      healthMax: json.healthMax,
      sanity: json.sanity,
      mana: json.mana,
      manaMax: json.manaMax,
      jobExperience: json.jobExperience,
      elementalProficiencies: json.elementalProficiencies,
      parents: json.parents.map((parent: any) => Character.fromJSON(parent)),
      children: json.children
        ? json.children.map((child: any) => Character.fromJSON(child))
        : null,
      element: json.element,
      knownSpells: json.knownSpells,
      physicalAttacks: json.physicalAttacks,
      gold: json.gold,
      equipment: json.equipment,
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
