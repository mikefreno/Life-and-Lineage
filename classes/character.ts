import { damageReduction, rollD20 } from "../utility/functions";
import { AttackObject } from "../utility/types";
import { Condition } from "./conditions";
import conditions from "../assets/json/conditions.json";
import { Item } from "./item";
import weapons from "../assets/json/items/weapons.json";

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
  protected alive: boolean;
  readonly birthdate: Date;
  protected deathdate: Date | null;
  protected job: string;
  protected affection: number;
  protected qualifications: string[];

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
    this.birthdate = birthdate;
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

type PlayerCharacterBase = {
  firstName: string;
  lastName: string;
  sex: "male" | "female";
  alive?: boolean;
  birthdate: Date;
  deathdate: Date | null;
  job?: string;
  affection?: number;
  health?: number;
  healthMax?: number;
  sanity?: number;
  mana?: number;
  manaMax?: number;
  magicProficiencies?: { school: string; proficiency: number }[];
  jobExperience?: {
    job: string;
    experience: number;
  }[];
  parents: Character[];
  children?: Character[];
  physicalAttacks?: string[];
  knownSpells?: string[];
  gold?: number;
  conditions?: Condition[];
  inventorySize?: number;
  inventory?: Item[];
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
  blessing: "blood" | "summons" | "pestilence" | "bone";
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
    | "summons"
    | "pestilence"
    | "bone"
    | "holy"
    | "vengeance"
    | "protection";
  private health: number;
  private healthMax: number;
  private sanity: number;
  private mana: number;
  private manaMax: number;
  public jobExperience: { job: string; experience: number }[];
  private magicProficiencies: { school: string; proficiency: number }[];
  private parents: Character[];
  private children: Character[] | null = null;
  private knownSpells: string[];
  private physicalAttacks: string[];
  private conditions: Condition[];
  private gold: number;
  private inventorySize: number;
  private inventory: Item[];
  private equipment: {
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
    jobExperience,
    magicProficiencies,
    parents,
    children,
    knownSpells,
    physicalAttacks,
    gold,
    inventorySize,
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
    this.jobExperience = jobExperience ?? [];
    this.magicProficiencies =
      magicProficiencies ?? getStartingProficiencies(playerClass, blessing);
    this.parents = parents;
    this.children = children ?? null;
    this.knownSpells = knownSpells ?? [];
    this.conditions = [];
    this.physicalAttacks = physicalAttacks ?? ["punch"];
    this.gold = gold ?? 100000;
    this.inventorySize = inventorySize ?? 20;
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
  }

  //----------------------------------Health----------------------------------//
  public getHealth() {
    return this.health;
  }

  public getMaxHealth() {
    let gearBuffs = 0;
    gearBuffs += this.equipment.mainHand.stats?.health ?? 0;
    gearBuffs += this.equipment.offHand?.stats?.health ?? 0;
    gearBuffs += this.equipment.body?.stats?.health ?? 0;
    gearBuffs += this.equipment.head?.stats?.health ?? 0;
    return this.healthMax + gearBuffs;
  }

  public damageHealth(damage: number | null) {
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
  public getMana(): number {
    return this.mana;
  }

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
  //----------------------------------Sanity----------------------------------//
  public getSanity(): number {
    return this.sanity;
  }

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
  public getInventory() {
    return this.inventory;
  }

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

  public getEquipment() {
    return this.equipment;
  }

  public getHeadItem() {
    return this.equipment.head;
  }

  public getBodyItem() {
    return this.equipment.body;
  }

  public getOffHandItem() {
    return this.equipment.offHand;
  }

  public getMainHandItem() {
    return this.equipment.mainHand;
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
          this.removeEquipment("offHand");
          this.equipment.offHand = item;
        }
        this.removeFromInventory(item);
        break;
    }
    this.setPhysicalAttacks();
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

  public spendGold(amount: number) {
    this.gold -= amount;
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
          this.damageSanity(cost.sanity);
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
        if (job.experience < 50) {
          const newExp = job.experience + 1;
          jobWasFoundAndIncremented = true;
          return { job: job.job, experience: newExp };
        }
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
  //----------------------------------Combat----------------------------------//

  private setPhysicalAttacks() {
    if (this.equipment.mainHand) {
      const itemObj = weapons.find(
        (weapon) => weapon.name == this.equipment.mainHand!.name,
      );
      if (itemObj) {
        this.physicalAttacks = itemObj.attacks;
      }
    }
  }

  public getPhysicalAttacks(): string[] {
    return this.physicalAttacks;
  }

  public doPhysicalAttack(attack: AttackObject, monsterMaxHP: number) {
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
      const effectChance = attack.secondaryEffectChance;

      if (effectChance) {
        let effects: Condition[] = [];
        for (let j = 0; j < attack.secondaryEffectChance.length; j++) {
          let effect: Condition | null = null;
          const rollToEffect = 20 - (effectChance[j] * 100) / 5;
          const roll = rollD20();
          if (roll > rollToEffect) {
            const conditionJSON = conditions.find(
              (condition) => condition.name == attack.secondaryEffect[j],
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
              effects.push(effect);
            }
          }
        }
        return {
          damage: hpDamage,
          sanityDamage: sanityDamage,
          secondaryEffects: effects,
        };
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

  //-----------------Misc-----------------//
  public getMedicalService(
    cost: number,
    healthRestore?: number,
    sanityRestore?: number,
    manaRestore?: number,
    removeDebuffs?: number,
  ) {
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

  public getMagicalProficiencies() {
    return this.magicProficiencies;
  }

  public toJSON(): object {
    return {
      ...super.toJSON(),
      playerClass: this.playerClass,
      blessing: this.blessing,
      health: this.health,
      healthMax: this.healthMax,
      sanity: this.sanity,
      mana: this.mana,
      manaMax: this.manaMax,
      jobExperience: this.jobExperience,
      magicProficiencies: this.magicProficiencies,
      parents: this.parents.map((parent) => parent.toJSON()),
      children: this.children?.map((child) => child.toJSON()),
      conditions: this.conditions.map((condition) => condition.toJSON()),
      knownSpells: this.knownSpells,
      physicalAttacks: this.physicalAttacks,
      gold: this.gold,
      inventorySize: this.inventorySize,
      inventory: this.inventory.map((item) => item.toJSON()),
      equipment: {
        mainHand: this.equipment.mainHand?.toJSON(),
        offHand: this.equipment.offHand?.toJSON(),
        head: this.equipment.head?.toJSON(),
        body: this.equipment.body?.toJSON(),
      },
    };
  }

  static fromJSON(json: any): PlayerCharacter {
    const player = new PlayerCharacter({
      firstName: json.firstName,
      lastName: json.lastName,
      sex: json.sex,
      alive: json.alive,
      birthdate: new Date(json.birthdate),
      deathdate: json.deathdate ? new Date(json.deathdate) : null,
      job: json.job,
      affection: json.affection,
      playerClass: json.playerClass,
      blessing: json.blessing,
      health: json.health,
      healthMax: json.healthMax,
      sanity: json.sanity,
      mana: json.mana,
      manaMax: json.manaMax,
      jobExperience: json.jobExperience,
      magicProficiencies: json.magicProficiencies,
      parents: json.parents.map((parent: any) => Character.fromJSON(parent)),
      children: json.children
        ? json.children.map((child: any) => Character.fromJSON(child))
        : null,
      knownSpells: json.knownSpells,
      physicalAttacks: json.physicalAttacks,
      gold: json.gold,
      inventorySize: json.inventorySize,
      inventory: json.inventory.map((item: any) => Item.fromJSON(item)),
      equipment: {
        mainHand: Item.fromJSON(json.equipment.mainHand),
        offHand: json.equipment.offHand
          ? Item.fromJSON(json.equipment.offHand)
          : null,
        body: json.equipment.body ? Item.fromJSON(json.equipment.body) : null,
        head: json.equipment.head ? Item.fromJSON(json.equipment.head) : null,
      },
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
  if (playerClass == "mage") {
    const starter = [
      { school: "fire", proficiency: blessing == "fire" ? 50 : 0 },
      { school: "water", proficiency: blessing == "water" ? 50 : 0 },
      { school: "air", proficiency: blessing == "air" ? 50 : 0 },
      { school: "earth", proficiency: blessing == "earth" ? 50 : 0 },
    ];
    return starter;
  } else if (playerClass == "necromancer") {
    const starter = [
      { school: "blood", proficiency: blessing == "blood" ? 50 : 0 },
      { school: "summons", proficiency: blessing == "summons" ? 50 : 0 },
      { school: "pestilence", proficiency: blessing == "pestilence" ? 50 : 0 },
      { school: "bone", proficiency: blessing == "bone" ? 50 : 0 },
    ];
    return starter;
  } else {
    const starter = [
      { school: "holy", proficiency: blessing == "holy" ? 50 : 0 },
      { school: "protection", proficiency: blessing == "protection" ? 50 : 0 },
      { school: "vengeance", proficiency: blessing == "vengeance" ? 50 : 0 },
    ];
    return starter;
  }
}
