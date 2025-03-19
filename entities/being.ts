import {
  Attribute,
  BeingType,
  DamageType,
  ItemClassType,
  Modifier,
  parseDamageTypeObject,
  Rarity,
} from "@/utility/types";
import { Condition } from "./conditions";
import * as Crypto from "expo-crypto";
import { ThreatTable } from "./threatTable";
import { action, computed, makeObservable, observable } from "mobx";
import { RootStore } from "@/stores/RootStore";
import { EnemyImageKeyOption } from "@/utility/enemyHelpers";
import { Item } from "./item";
import { damageReduction } from "@/utility/functions/misc";
import {
  getConditionEffectsOnDefenses,
  getConditionEffectsOnMisc,
  getMagnitude,
} from "@/utility/functions/conditions";
import { BeingOptions } from "./entityTypes";

export class Being {
  readonly id: string;
  readonly beingType: BeingType;
  sprite: EnemyImageKeyOption;

  currentHealth: number;
  baseHealth: number;

  currentSanity: number | null;
  baseSanity: number | null;

  baseMana: number;
  baseManaRegen: number;
  currentMana: number;

  baseStrength: number;
  baseIntelligence: number;
  baseDexterity: number;

  threatTable: ThreatTable = new ThreatTable();

  baseArmor: number;
  baseResistanceTable: { [key in DamageType]?: number };

  conditions: Condition[];

  attackStrings: string[];
  baseDamageTable: { [key in DamageType]?: number };

  alive: boolean;
  deathdate: { year: number; week: number } | null;

  equipment: {
    mainHand: Item;
    offHand: Item | null;
    head: Item | null;
    body: Item | null;
    quiver: Item[] | null;
  } | null;

  allocatedSkillPoints?: Record<Attribute, number> | null;

  root: RootStore;

  constructor(props: BeingOptions) {
    this.id = props.id ?? Crypto.randomUUID(); // Assign a random UUID if id is not provided
    this.beingType = props.beingType;
    this.currentHealth = props.currentHealth ?? props.baseHealth;
    this.currentSanity = props.currentSanity ?? null; // Initialize sanity to null if not provided

    this.baseSanity = props.baseSanity ?? null; // Initialize baseSanity to null if not provided
    this.baseHealth = props.baseHealth;

    this.baseMana = props.baseMana ?? 0;
    this.currentMana = props.currentMana ?? this.baseMana;
    this.baseManaRegen = props.baseManaRegen ?? 0;

    this.baseStrength = props.baseStrength ?? 0;
    this.baseIntelligence = props.baseIntelligence ?? 0;
    this.baseDexterity = props.baseDexterity ?? 0;

    this.conditions = props.conditions ?? []; // Initialize conditions to an empty array if not provided

    this.sprite = props.sprite ?? ("" as EnemyImageKeyOption); // for simplicity - minion or player

    this.baseArmor = props.baseArmor ?? 0; // Default base armor to 0 if not provided
    this.baseResistanceTable = parseDamageTypeObject(props.baseResistanceTable);

    this.attackStrings = props.attackStrings ?? [];
    this.baseDamageTable = parseDamageTypeObject(props.baseDamageTable);

    this.alive = props.alive ?? true;
    this.deathdate = props.deathdate ?? null;

    this.allocatedSkillPoints =
      props.allocatedSkillPoints ?? props.isPlayerCharacter
        ? {
            [Attribute.health]: 0,
            [Attribute.mana]: 0,
            [Attribute.sanity]: 0,
            [Attribute.strength]: 0,
            [Attribute.dexterity]: 0,
            [Attribute.intelligence]: 0,
            [Attribute.manaRegen]: 0,
          }
        : null;

    this.equipment = props.equipment ?? {
      mainHand: new Item({
        rarity: Rarity.NORMAL,
        prefix: null,
        suffix: null,
        name: "unarmored",
        slot: "one-hand",
        stats: { [Modifier.PhysicalDamage]: 1 },
        baseValue: 0,
        itemClass: ItemClassType.Melee,
        attacks: ["punch"],
        root: props.root,
      }),
      offHand: null,
      head: null,
      body: null,
      quiver: null,
    };

    this.root = props.root;

    makeObservable(this, {
      currentHealth: observable,
      currentSanity: observable,
      currentMana: observable,
      conditions: observable,
      alive: observable,
      deathdate: observable,
      allocatedSkillPoints: observable,

      damageHealth: action,
      damageMana: action,
      damageSanity: action,
      restoreHealth: action,
      restoreMana: action,
      restoreSanity: action,
      regenHealth: action,
      regenMana: action,

      addCondition: action,
      removeCondition: action,
      conditionTicker: action,

      changeBaseSanity: action,
      useMana: action,

      maxHealth: computed,
      maxMana: computed,
      maxSanity: computed,
      nonConditionalMaxHealth: computed,
      nonConditionalMaxMana: computed,
      nonConditionalMaxSanity: computed,

      fireResistance: computed,
      coldResistance: computed,
      lightningResistance: computed,
      poisonResistance: computed,
      holyResistance: computed,
      magicResistance: computed,

      fireDamage: computed,
      coldDamage: computed,
      lightningDamage: computed,
      poisonDamage: computed,
      holyDamage: computed,
      magicDamage: computed,
      equipmentStats: computed,

      totalStrength: computed,
      nonConditionalStrength: computed,
      attackPower: computed,

      totalIntelligence: computed,
      nonConditionalIntelligence: computed,
      magicPower: computed,

      totalDexterity: computed,
      nonConditionalDexterity: computed,
      criticalChance: computed,

      totalArmor: computed,
      dodgeChance: computed,
      blockChance: computed,
      physicalDamage: computed,
      isStunned: computed,
      totalHealthRegen: computed,
      totalManaRegen: computed,
      nonConditionalManaRegen: computed,
    });
  }

  //----------------------------------PlayerCharacter Specific----------------------------------//
  get equipmentStats() {
    if (!this.equipment) return;

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

  //----------------------------------Health----------------------------------//
  get maxHealth() {
    const { healthFlat, healthMult } = getConditionEffectsOnDefenses(
      this.conditions,
    );
    const allocated = this.allocatedSkillPoints
      ? this.allocatedSkillPoints[Attribute.health]
      : 0;
    const fromEquipment = this.equipment
      ? this.equipmentStats?.get(Modifier.Health) ?? 0
      : 0;
    return (
      (this.baseHealth + allocated * 10) * healthMult +
      fromEquipment +
      healthFlat
    );
  }

  get nonConditionalMaxHealth() {
    const allocated = this.allocatedSkillPoints
      ? this.allocatedSkillPoints[Attribute.health]
      : 0;
    const fromEquipment = this.equipment
      ? this.equipmentStats?.get(Modifier.Health) ?? 0
      : 0;
    return this.baseHealth + allocated * 10 + fromEquipment;
  }

  get totalHealthRegen() {
    const { healthRegenFlat, healthRegenMult } = getConditionEffectsOnMisc(
      this.conditions,
    );
    const fromEquipment = this.equipment
      ? this.equipmentStats?.get(Modifier.HealthRegen) ?? 0
      : 0;
    return healthRegenFlat * healthRegenMult + fromEquipment;
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

    const allocated = this.allocatedSkillPoints
      ? this.allocatedSkillPoints[Attribute.mana]
      : 0;
    const fromEquipment = this.equipment
      ? this.equipmentStats?.get(Modifier.Mana) ?? 0
      : 0;
    return (
      (this.baseMana + allocated * 10) * manaMaxMult +
      fromEquipment +
      manaMaxFlat
    );
  }

  get nonConditionalMaxMana() {
    const allocated = this.allocatedSkillPoints
      ? this.allocatedSkillPoints[Attribute.mana]
      : 0;
    const fromEquipment = this.equipment
      ? this.equipmentStats?.get(Modifier.Mana) ?? 0
      : 0;
    return this.baseMana + allocated * 10 + fromEquipment;
  }

  get totalManaRegen() {
    const { manaRegenFlat, manaRegenMult } = getConditionEffectsOnMisc(
      this.conditions,
    );
    const allocated = this.allocatedSkillPoints
      ? this.allocatedSkillPoints[Attribute.manaRegen]
      : 0;
    const fromEquipment = this.equipment
      ? this.equipmentStats?.get(Modifier.ManaRegen) ?? 0
      : 0;

    return (
      (this.baseManaRegen + allocated * 10) * manaRegenMult +
      fromEquipment +
      manaRegenFlat
    );
  }

  get nonConditionalManaRegen() {
    const allocated = this.allocatedSkillPoints
      ? this.allocatedSkillPoints[Attribute.manaRegen]
      : 0;
    const fromEquipment = this.equipment
      ? this.equipmentStats?.get(Modifier.ManaRegen) ?? 0
      : 0;

    return this.baseManaRegen + allocated * 10 + fromEquipment;
  }

  public useMana(mana: number) {
    if (this.currentMana) {
      this.currentMana -= mana;
    }
  }

  public damageMana(damage: number) {
    if (this.currentMana) {
      if (this.currentMana < damage) {
        this.currentMana = 0;
      } else {
        this.currentMana -= damage;
      }
    }
  }

  public restoreMana(amount: number) {
    if (this.currentMana) {
      if (this.currentMana + amount < this.maxMana) {
        this.currentMana += amount;
      } else {
        this.currentMana = this.maxMana;
      }
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
    if (!this.baseSanity) return null;
    const { sanityFlat, sanityMult } = getConditionEffectsOnDefenses(
      this.conditions,
    );
    const allocated = this.allocatedSkillPoints
      ? this.allocatedSkillPoints[Attribute.sanity]
      : 0;
    const fromEquipment = this.equipment
      ? this.equipmentStats?.get(Modifier.Sanity) ?? 0
      : 0;
    return (
      (this.baseSanity + allocated * 5) * sanityMult +
      fromEquipment +
      sanityFlat
    );
  }

  get nonConditionalMaxSanity() {
    if (!this.baseSanity) return null;
    const allocated = this.allocatedSkillPoints
      ? this.allocatedSkillPoints[Attribute.sanity]
      : 0;
    const fromEquipment = this.equipment
      ? this.equipmentStats?.get(Modifier.Sanity) ?? 0
      : 0;
    return this.baseSanity + allocated * 5 + fromEquipment;
  }

  public damageSanity(damage?: number | null) {
    if (damage && this.currentSanity) {
      this.currentSanity -= damage;
    }
    return this.currentSanity;
  }

  public restoreSanity(amount: number) {
    if (!this.currentSanity || !this.maxSanity) return;
    if (this.currentSanity + amount < this.maxSanity) {
      this.currentSanity += amount;
    } else {
      this.currentSanity = this.maxSanity;
    }
  }

  public changeBaseSanity(change: number) {
    if (!this.baseSanity || !this.currentSanity) return;

    this.baseSanity += change;
    if (this.currentSanity > this.baseSanity) {
      this.currentSanity = this.baseSanity;
    }
  }

  //----------------------------------Strength-----------------------------------//
  get totalStrength() {
    // needs conditionals added to it, at time of righting no conditions affect this stat
    const allocated = this.allocatedSkillPoints
      ? this.allocatedSkillPoints[Attribute.strength]
      : 0;
    const fromEquipment = this.equipment
      ? this.equipmentStats?.get(Modifier.Strength) ?? 0
      : 0;
    return this.baseStrength + allocated + fromEquipment;
  }

  get nonConditionalStrength() {
    const allocated = this.allocatedSkillPoints
      ? this.allocatedSkillPoints[Attribute.strength]
      : 0;
    const fromEquipment = this.equipment
      ? this.equipmentStats?.get(Modifier.Strength) ?? 0
      : 0;
    return this.baseStrength + allocated + fromEquipment;
  }

  get attackPower() {
    return this.totalStrength * 0.5 + this.totalDexterity * 0.25;
  }
  //----------------------------------Intelligence-------------------------------//
  get totalIntelligence() {
    // needs conditionals added to it, at time of righting no conditions affect this stat

    const allocated = this.allocatedSkillPoints
      ? this.allocatedSkillPoints[Attribute.intelligence]
      : 0;
    const fromEquipment = this.equipment
      ? this.equipmentStats?.get(Modifier.Intelligence) ?? 0
      : 0;
    return this.baseIntelligence + allocated + fromEquipment;
  }

  get nonConditionalIntelligence() {
    const allocated = this.allocatedSkillPoints
      ? this.allocatedSkillPoints[Attribute.intelligence]
      : 0;
    const fromEquipment = this.equipment
      ? this.equipmentStats?.get(Modifier.Intelligence) ?? 0
      : 0;
    return this.baseIntelligence + allocated + fromEquipment;
  }

  get magicPower() {
    return this.totalIntelligence * 0.5;
  }
  //----------------------------------Dexterity-------------------------------//
  get totalDexterity() {
    // needs conditionals added to it, at time of righting no conditions affect this stat

    const allocated = this.allocatedSkillPoints
      ? this.allocatedSkillPoints[Attribute.dexterity]
      : 0;
    const fromEquipment = this.equipment
      ? this.equipmentStats?.get(Modifier.Dexterity) ?? 0
      : 0;
    return this.baseDexterity + allocated + fromEquipment;
  }

  get nonConditionalDexterity() {
    const allocated = this.allocatedSkillPoints
      ? this.allocatedSkillPoints[Attribute.dexterity]
      : 0;
    const fromEquipment = this.equipment
      ? this.equipmentStats?.get(Modifier.Dexterity) ?? 0
      : 0;
    return this.baseDexterity + allocated + fromEquipment;
  }

  get criticalChance() {
    return this.totalDexterity * 0.1;
  }

  //---------------------------Physical defenses---------------------------//
  get totalArmor(): number {
    let baseArmor = this.baseArmor;
    let addedArmor = 0;
    if (this.equipment) {
      for (const [_, item] of Object.entries(this.equipment)) {
        if (Array.isArray(item)) {
          // arrows - no mods
          continue;
        } else if (item && item.stats) {
          baseArmor += item.stats.get(Modifier.Armor) || 0;
          addedArmor += item.stats.get(Modifier.ArmorAdded) || 0;
        }
      }
    }
    return baseArmor + addedArmor;
  }

  public getPhysicalDamageReduction() {
    const { armorMult, armorFlat } = getConditionEffectsOnDefenses(
      this.conditions,
    );
    return damageReduction(this.totalArmor * armorMult + armorFlat);
  }

  get dodgeChance(): number {
    let dodgeChance = 0;
    if (this.equipment) {
      for (const [_, item] of Object.entries(this.equipment)) {
        if (Array.isArray(item)) {
          // arrows - no mods
          continue;
        } else if (item && item.stats) {
          dodgeChance += item.stats.get(Modifier.DodgeChance) || 0;
        }
      }
    }
    this.conditions.forEach((cond) => {
      const index = cond.effect.indexOf("blur");
      if (index) {
        const effectMagnitude = cond.effectMagnitude[index];
        const effectStyle = cond.effectStyle[index];
        switch (effectStyle) {
          case "multiplier":
            dodgeChance *= 1 + effectMagnitude;
          case "percentage":
          case "flat":
            dodgeChance += effectMagnitude;
        }
      }
    });
    // Base dodge chance from dexterity (assuming 1 dexterity = 0.1% dodge chance)
    const baseDodgeChance = this.totalDexterity * 0.1;
    // Cap dodge chance at 75%
    return Math.min(dodgeChance + baseDodgeChance, 75);
  }

  get blockChance(): number {
    let blockChance = 0;
    if (this.equipment) {
      for (const [_, item] of Object.entries(this.equipment)) {
        if (Array.isArray(item)) {
          // arrows - no mods
          continue;
        } else if (item && item.stats) {
          blockChance += item.stats.get(Modifier.BlockChance) || 0;
        }
      }
    }
    // Cap block chance at 75%
    return Math.min(blockChance, 75);
  }

  //---------------------------Resistances---------------------------//
  private calculateTotalResistance(
    resistanceModifier: Modifier,
    base: number,
  ): number {
    let resistance = base;
    if (this.equipment) {
      for (const [_, item] of Object.entries(this.equipment)) {
        if (Array.isArray(item)) {
          // arrows - no mods
          continue;
        } else if (item && item.stats) {
          resistance += item.stats.get(resistanceModifier) || 0;
        }
      }
    }
    // Cap resistance at 75%
    return Math.min(resistance, 75);
  }

  get fireResistance() {
    return this.calculateTotalResistance(
      Modifier.FireResistance,
      this.baseResistanceTable[DamageType.FIRE] ?? 0,
    );
  }

  get coldResistance() {
    return this.calculateTotalResistance(
      Modifier.ColdResistance,
      this.baseResistanceTable[DamageType.COLD] ?? 0,
    );
  }

  get lightningResistance() {
    return this.calculateTotalResistance(
      Modifier.LightningResistance,
      this.baseResistanceTable[DamageType.LIGHTNING] ?? 0,
    );
  }

  get poisonResistance() {
    return this.calculateTotalResistance(
      Modifier.PoisonResistance,
      this.baseResistanceTable[DamageType.POISON] ?? 0,
    );
  }

  get holyResistance() {
    return this.calculateTotalResistance(
      Modifier.HolyResistance,
      this.baseResistanceTable[DamageType.HOLY] ?? 0,
    );
  }

  get magicResistance() {
    return this.calculateTotalResistance(
      Modifier.MagicResistance,
      this.baseResistanceTable[DamageType.MAGIC] ?? 0,
    );
  }

  //---------------------------Damage Types---------------------------//
  private calculateTotalDamage(
    baseDamageModifier: Modifier,
    addedDamageModifier: Modifier,
    multiplierModifier: Modifier,
    base: number,
  ): number {
    let baseDamage = base;
    let addedDamage = 0;
    let multiplier = 1;

    if (this.equipment) {
      for (const [_, item] of Object.entries(this.equipment)) {
        if (Array.isArray(item)) {
          baseDamage += item[0].stats?.get(baseDamageModifier) || 0;
        } else if (item && item.stats) {
          baseDamage += item.stats.get(baseDamageModifier) || 0;
          addedDamage += item.stats.get(addedDamageModifier) || 0;
          multiplier += item.stats.get(multiplierModifier) || 0;
        }
      }
    }

    return (baseDamage + addedDamage) * multiplier;
  }

  get physicalDamage(): number {
    return (
      this.calculateTotalDamage(
        Modifier.PhysicalDamage,
        Modifier.PhysicalDamageAdded,
        Modifier.PhysicalDamageMultiplier,
        this.baseDamageTable[DamageType.PHYSICAL] ?? 0,
      ) + this.attackPower
    );
  }

  get fireDamage(): number {
    return (
      this.calculateTotalDamage(
        Modifier.FireDamage,
        Modifier.FireDamageAdded,
        Modifier.FireDamageMultiplier,
        this.baseDamageTable[DamageType.FIRE] ?? 0,
      ) + this.magicPower
    );
  }

  get coldDamage(): number {
    return (
      this.calculateTotalDamage(
        Modifier.ColdDamage,
        Modifier.ColdDamageAdded,
        Modifier.ColdDamageMultiplier,
        this.baseDamageTable[DamageType.COLD] ?? 0,
      ) + this.magicPower
    );
  }

  get lightningDamage(): number {
    return (
      this.calculateTotalDamage(
        Modifier.LightningDamage,
        Modifier.LightningDamageAdded,
        Modifier.LightningDamageMultiplier,
        this.baseDamageTable[DamageType.LIGHTNING] ?? 0,
      ) + this.magicPower
    );
  }

  get poisonDamage(): number {
    return (
      this.calculateTotalDamage(
        Modifier.PoisonDamage,
        Modifier.PoisonDamageAdded,
        Modifier.PoisonDamageMultiplier,
        this.baseDamageTable[DamageType.POISON] ?? 0,
      ) + this.attackPower
    );
  }

  get holyDamage(): number {
    return (
      this.calculateTotalDamage(
        Modifier.HolyDamage,
        Modifier.HolyDamageAdded,
        Modifier.HolyDamageMultiplier,
        this.baseDamageTable[DamageType.HOLY] ?? 0,
      ) + this.magicPower
    );
  }

  get magicDamage(): number {
    return (
      this.calculateTotalDamage(
        Modifier.MagicDamage,
        Modifier.MagicDamageAdded,
        Modifier.MagicDamageMultiplier,
        this.baseDamageTable[DamageType.MAGIC] ?? 0,
      ) + this.magicPower
    );
  }

  //---------------------------Conditions---------------------------//
  /**
   * Adds a condition to the creature's list of conditions. Sets the `on` property.
   * @param condition - The condition to add. If null, does nothing.
   */
  public addCondition(condition?: Condition | null) {
    if (condition) {
      condition.on = this;
      this.conditions.push(condition);
    }
  }

  public removeCondition(condition: Condition) {
    this.conditions = this.conditions.filter((cond) => cond !== condition);
  }

  /**
   * Updates the list of conditions, removing those that have expired.
   */
  public conditionTicker() {
    let undeadDeathCheck = -1;
    for (let i = this.conditions.length - 1; i >= 0; i--) {
      const { effect } = this.conditions[i].tick(this);

      if (effect.includes("destroy undead")) {
        undeadDeathCheck = getMagnitude(this.conditions[i].effectMagnitude);
      }
    }
    if (this.currentHealth <= undeadDeathCheck) {
      this.currentHealth = 0;
    }
  }

  get isStunned() {
    const isStunned = getConditionEffectsOnMisc(this.conditions).isStunned;
    return isStunned;
  }
}
