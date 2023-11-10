import { getData } from "../store";
import { Game } from "./game";

export interface familiar {
  name: string;
  age: number;
}

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
  protected firstName: string;
  protected lastName: string;
  protected sex: "male" | "female";
  protected birthdate: Date;
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
    return this.firstName + " " + this.lastName;
  }
  public getSex(): "male" | "female" {
    return this.sex;
  }
  public getBirthdate(): Date {
    return this.birthdate;
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
  elementalProficiencies?: { element: string; proficiency: number }[];
  jobExperience?: {
    job: string;
    experience: number;
  }[];
  parents: Character[];
  children?: Character[];
  element: string;
  knownSpells?: string[];
}

export class PlayerCharacter extends Character {
  private health: number;
  private sanity: number;
  private jobExperience: { job: string; experience: number }[];
  private elementalProficiencies: { element: string; proficiency: number }[];
  private parents: Character[];
  private children: Character[] | null = null;
  private element: string;
  private knownSpells: string[];

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
    jobExperience,
    elementalProficiencies,
    parents,
    children,
    element,
    knownSpells,
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
    this.sanity = sanity ?? 50;
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
  }

  public getHealth(): number {
    return this.health;
  }

  public getSanity(): number {
    return this.sanity;
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

  public removeHealth(damage: number): number | "Player Death" {
    if (damage > this.health) {
      return "Player Death";
    } else {
      this.health -= damage;
      return this.health;
    }
  }

  static fromJSON(json: any): PlayerCharacter {
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
      jobExperience: json.jobExperience,
      parents: json.parents.map((parent: any) => Character.fromJSON(parent)),
      children: json.children
        ? json.children.map((child: any) => Character.fromJSON(child))
        : null,
      element: json.element,
      knownSpells: json.knownSpells,
    });
    return player;
  }
}

const fetchGameData = async () => {
  let gameData = await getData("game");
  return gameData;
};
