import { getData } from "../store";
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

  constructor({
    firstName,
    lastName,
    sex,
    birthdate,
    alive,
    deathdate,
    job,
    affection,
  }: CharacterOptions) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.sex = sex;
    this.birthdate = birthdate;
    this.alive = alive ?? true;
    this.deathdate = deathdate ?? null;
    this.job = job ?? "unemployed";
    this.affection = affection ?? 0;
  }

  public getName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  public getJobTitle(): string {
    return this.job;
  }

  public getStatus() {
    return {
      name: this.firstName + " " + this.lastName,
      sex: this.sex,
      birthdate: this.birthdate,
      deathdate: this.deathdate,
      alive: this.alive,
      job: this.job,
    };
  }

  static fromJSON(json: any): Character {
    const character = new Character({
      firstName: json.firstName,
      lastName: json.lastName,
      sex: json.sex,
      birthdate: new Date(json.birthdate),
      alive: json.alive,
      deathdate: new Date(json.deathdate),
      job: json.job,
      affection: json.affection,
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
  sanity?: number;
  mana?: number;
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
  private jobExperience: { job: string; experience: number }[];
  private elementalProficiencies: { element: string; proficiency: number }[];
  private parents: Character[];
  private children: Character[] | null = null;
  private element: string;
  private knownSpells: string[];
  private physicalAttacks: string[];
  private conditions: Condition[];
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
    sanity,
    mana,
    jobExperience,
    elementalProficiencies,
    parents,
    children,
    element,
    knownSpells,
    physicalAttacks,
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
    this.healthMax = health ?? 100;
    this.sanity = sanity ?? 50;
    this.mana = mana ?? 100;
    this.manaMax = mana ?? 100;
    this.jobExperience = jobExperience ?? [];
    this.elementalProficiencies = elementalProficiencies ?? [
      { element: "fire", proficiency: element == "fire" ? 25 : 0 },
      { element: "water", proficiency: element == "water" ? 25 : 0 },
      { element: "air", proficiency: element == "air" ? 25 : 0 },
      { element: "earth", proficiency: element == "earth" ? 25 : 0 },
    ];
    this.parents = parents;
    this.children = children ?? null;
    this.element = element;
    this.knownSpells = knownSpells ?? [];
    this.conditions = [];
    this.physicalAttacks = physicalAttacks ?? ["punch"];
    this.equipment = equipment ?? {
      weapon: { name: "unarmored", baseDamage: 1 },
    };
  }

  public getHealth() {
    return this.health;
  }

  public getMaxHealth() {
    return this.healthMax;
  }

  public getSanity(): number {
    return this.sanity;
  }

  public getMana(): number {
    return this.mana;
  }

  public getMaxMana(): number {
    return this.mana;
  }

  public getPhysicalAttacks(): string[] {
    return this.physicalAttacks;
  }

  public getCurrentJobAndExperience() {
    const job = this.jobExperience.find((job) => job.job == this.job);
    return { title: this.job, experience: job?.experience ?? 0 };
  }

  public getElementalProficiencies() {
    return this.elementalProficiencies;
  }

  public getJobExperience(title: string): number {
    const job = this.jobExperience.find((job) => job.job === title);
    return job ? job.experience : 0;
  }

  public getParents(): Character[] {
    return this.parents;
  }
  public getChildren(): Character[] | null {
    return this.children;
  }

  public damageHealth(damage: number | null) {
    this.health -= damage ?? 0;
    return this.health;
  }

  public damageSanity(damage: number | null) {
    this.sanity -= damage ?? 0;
    return this.sanity;
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

  static fromJSON(json: any): PlayerCharacter {
    let conditions: Condition[] = [];
    if (json.conditions) {
      json.conditions.forEach((condition: any) => {
        const cond = new Condition(condition);
        conditions.push(cond);
      });
    }
    const player = new PlayerCharacter({
      firstName: json.firstName,
      lastName: json.lastName,
      sex: json.sex,
      birthdate: new Date(json.birthdate),
      alive: json.alive,
      deathdate: new Date(json.deathdate),
      job: json.job,
      affection: json.affection,
      health: json.health,
      sanity: json.sanity,
      mana: json.mana,
      jobExperience: json.jobExperience,
      parents: json.parents.map((parent: any) => Character.fromJSON(parent)),
      children: json.children
        ? json.children.map((child: any) => Character.fromJSON(child))
        : null,
      element: json.element,
      knownSpells: json.knownSpells,
      physicalAttacks: json.physicalAttacks,
    });
    return player;
  }
}

const fetchGameData = async () => {
  let gameData = await getData("game");
  return gameData;
};
