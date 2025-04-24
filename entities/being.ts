import {
  AttackUse,
  Attribute,
  BeingType,
  DamageType,
  ItemClassType,
  Modifier,
  parseDamageTypeObject,
  Rarity,
} from "@/utility/types";
import { Condition } from "@/entities/conditions";
import * as Crypto from "expo-crypto";
import { ThreatTable } from "@/entities/threatTable";
import {
  action,
  computed,
  makeObservable,
  observable,
  reaction,
  runInAction,
} from "mobx";
import { RootStore } from "@/stores/RootStore";
import { Item } from "@/entities/item";
import {
  damageReduction,
  statRounding,
  toTitleCase,
} from "@/utility/functions/misc";
import {
  getConditionEffectsOnAttacks,
  getConditionEffectsOnDefenses,
  getConditionEffectsOnMisc,
  getMagnitude,
} from "@/utility/functions/conditions";
import { BeingOptions } from "@/entities/entityTypes";
import { Attack, PerTargetUse } from "@/entities/attack";
import { Character, PlayerCharacter } from "@/entities/character";
import { Creature, Enemy } from "@/entities/creatures";
import {
  AnimationOptions,
  EnemyImageKeyOption,
} from "@/utility/animation/enemy";
import { jsonServiceStore } from "@/stores/SingletonSource";

export class Being {
  id: string;
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
  debilitations: Condition[];

  attackStrings: string[];
  animationStrings: { [key: string]: string };
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

  allocatedSkillPoints: Record<Attribute, number> | null | undefined;

  activeAuraConditionIds: { attackName: string; conditionIDs: string[] }[];

  root: RootStore;

  constructor(props: BeingOptions) {
    this.id = props.id ?? Crypto.randomUUID(); // Assign a random UUID if id is not provided
    this.beingType = props.beingType;

    this.baseHealth = props.baseHealth;
    this.currentHealth = props.currentHealth ?? props.baseHealth;

    this.baseSanity = props.baseSanity ?? null; // Initialize baseSanity to null if not provided
    this.currentSanity = props.currentSanity ?? this.baseSanity;

    this.baseMana = props.baseMana ?? 0;
    this.currentMana = props.currentMana ?? this.baseMana;
    this.baseManaRegen = props.baseManaRegen ?? 0;
    this.debilitations = props.debilitations ?? [];

    this.baseStrength = props.baseStrength ?? 0;
    this.baseIntelligence = props.baseIntelligence ?? 0;
    this.baseDexterity = props.baseDexterity ?? 0;

    this.conditions = props.conditions ?? []; // Initialize conditions to an empty array if not provided

    this.sprite = props.sprite ?? ("" as EnemyImageKeyOption); // for simplicity - minion or player

    this.baseArmor = props.baseArmor ?? 0; // Default base armor to 0 if not provided
    this.baseResistanceTable = parseDamageTypeObject(props.baseResistanceTable);

    this.activeAuraConditionIds = props.activeAuraConditionIds ?? [];
    this.attackStrings = props.attackStrings ?? ["punch"];
    this.animationStrings = props.animationStrings;
    this.baseDamageTable = parseDamageTypeObject(props.baseDamageTable);

    this.alive = props.alive ?? true;
    this.deathdate = props.deathdate ?? null;

    this.allocatedSkillPoints = props.isPlayerCharacter
      ? props.allocatedSkillPoints ?? {
          [Attribute.health]: 0,
          [Attribute.mana]: 0,
          [Attribute.sanity]: 0,
          [Attribute.strength]: 0,
          [Attribute.dexterity]: 0,
          [Attribute.intelligence]: 0,
          [Attribute.manaRegen]: 0,
        }
      : null;

    this.equipment = props.equipment
      ? props.equipment
      : props.isPlayerCharacter
      ? {
          mainHand: new Item({
            rarity: Rarity.NORMAL,
            prefix: null,
            suffix: null,
            name: "unarmored",
            slot: "one-hand",
            stats: { [Modifier.PhysicalDamage]: 1 },
            baseValue: 0,
            itemClass: ItemClassType.NULL,
            attacks: ["punch"],
            root: props.root,
          }),
          offHand: null,
          head: null,
          body: null,
          quiver: null,
        }
      : null;

    this.root = props.root;

    makeObservable(this, {
      id: observable,
      currentHealth: observable,
      currentSanity: observable,
      currentMana: observable,
      conditions: observable,
      alive: observable,
      deathdate: observable,
      allocatedSkillPoints: observable,
      activeAuraConditionIds: observable.deep,

      damageHealth: action,
      damageMana: action,
      damageSanity: action,
      restoreHealth: action,
      restoreMana: action,
      restoreSanity: action,
      regenHealth: action,
      regenMana: action,

      addCondition: action,
      addToActiveAuraConditionIds: action,
      removeCondition: action,
      removeConditionById: action,
      conditionTicker: action,
      removeDebuffs: action,
      debilitations: observable,

      changeBaseSanity: action,
      useMana: action,
      deactivateAuras: action,

      damageTypeCalculation: action,
      calculateAttackDamage: action,
      equipment: observable,

      baseDamageTable: observable,
      baseResistanceTable: observable,
      attackStrings: observable,
      animationStrings: observable,
      baseArmor: observable,
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

      physicalDamageReduction: computed,
      physicalDamage: computed,
      physicalDamageNoWeapon: computed,

      fireDamage: computed,
      coldDamage: computed,
      lightningDamage: computed,
      poisonDamage: computed,
      holyDamage: computed,
      magicDamage: computed,
      fireDamageNoWeapon: computed,
      coldDamageNoWeapon: computed,
      lightningDamageNoWeapon: computed,
      poisonDamageNoWeapon: computed,
      holyDamageNoWeapon: computed,
      magicDamageNoWeapon: computed,
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

      attacks: computed,
      totalArmor: computed,
      dodgeChance: computed,
      blockChance: computed,
      isStunned: computed,
      isSilenced: computed,
      totalHealthRegen: computed,
      totalManaRegen: computed,
      nonConditionalManaRegen: computed,
    });

    reaction(
      () => this.maxMana,
      () => {
        if (this.maxMana < this.currentMana) {
          runInAction(() => (this.currentMana = this.maxMana));
        }
      },
    );
    reaction(
      () => this.maxSanity,
      () => {
        if (
          this.maxSanity &&
          this.currentSanity !== null &&
          this.maxSanity < this.currentSanity
        ) {
          runInAction(() => (this.currentSanity = this.maxSanity));
        }
      },
    );
    reaction(
      () => this.maxHealth,
      () => {
        if (this.maxHealth < this.currentHealth) {
          runInAction(() => (this.currentHealth = this.maxHealth));
        }
      },
    );
  }

  //----------------------------------PlayerCharacter Specific----------------------------------//
  get equipmentStats(): Map<Modifier, number> {
    const aggregatedStats = new Map<Modifier, number>();

    if (!this.equipment) {
      return aggregatedStats;
    }

    const addStatsFromItem = (item: Item | null) => {
      if (item?.stats && item.playerHasRequirements) {
        item.stats.forEach((value, key) => {
          aggregatedStats.set(key, (aggregatedStats.get(key) ?? 0) + value);
        });
      }
    };

    addStatsFromItem(this.equipment.mainHand);
    addStatsFromItem(this.equipment.offHand);
    addStatsFromItem(this.equipment.head);
    addStatsFromItem(this.equipment.body);

    // --- Quiver Handling ---
    const mainHand = this.equipment.mainHand;
    const quiver = this.equipment.quiver;
    if (
      mainHand?.itemClass === ItemClassType.Bow &&
      quiver &&
      quiver.length > 0
    ) {
      addStatsFromItem(quiver[0]);
    }
    return aggregatedStats;
  }

  //----------------------------------Health----------------------------------//
  get maxHealth() {
    const { healthFlat, healthMult } = getConditionEffectsOnDefenses([
      ...(this.conditions ?? []),
      ...(this.debilitations ?? []),
    ]);
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
    const { healthRegenFlat, healthRegenMult } = getConditionEffectsOnMisc([
      ...this.conditions,
      ...this.debilitations,
    ]);
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
    attackerId,
  }: {
    attackerId: string;
    damage: number | null;
  }) {
    if (damage) {
      let rounded = statRounding(damage); // 0.05 rounding
      // negative damage overflow protection
      if (this.currentHealth - rounded > this.maxHealth) {
        this.currentHealth = this.maxHealth;
        return this.currentHealth;
      }
      this.currentHealth = statRounding(this.currentHealth - rounded);
      if (this.id !== attackerId) {
        this.threatTable.addThreat(attackerId, rounded);
      }
    }
    return this.currentHealth;
  }

  public restoreHealth(amount: number) {
    if (this.currentHealth === this.maxHealth) {
      return 0;
    }
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
    const { manaMaxFlat, manaMaxMult } = getConditionEffectsOnMisc([
      ...this.conditions,
      ...this.debilitations,
    ]);

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
    const { manaRegenFlat, manaRegenMult } = getConditionEffectsOnMisc([
      ...this.conditions,
      ...this.debilitations,
    ]);
    const allocated = this.allocatedSkillPoints
      ? this.allocatedSkillPoints[Attribute.manaRegen]
      : 0;
    const fromEquipment = this.equipment
      ? this.equipmentStats?.get(Modifier.ManaRegen) ?? 0
      : 0;

    return (
      (this.baseManaRegen + allocated) * manaRegenMult +
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

  public restoreMana(amount: number): number {
    const initialMana = this.currentMana;
    if (this.currentMana + amount < this.maxMana) {
      this.currentMana += amount;
      return amount;
    } else {
      const restored = this.maxMana - initialMana;
      this.currentMana = this.maxMana;
      return restored;
    }
  }

  public regenMana(halfRegen?: boolean) {
    if (
      this.currentMana +
        (halfRegen ? this.totalManaRegen / 2 : this.totalManaRegen) <
      this.maxMana
    ) {
      this.currentMana += halfRegen
        ? this.totalManaRegen / 2
        : this.totalManaRegen;
    } else {
      this.currentMana = this.maxMana;
    }
  }
  //----------------------------------Sanity----------------------------------//
  get maxSanity(): number | null {
    if (!this.baseSanity) return null;
    const { sanityFlat, sanityMult } = getConditionEffectsOnDefenses([
      ...this.conditions,
      ...this.debilitations,
    ]);
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

  public restoreSanity(amount: number): number {
    if (this.currentSanity === null || !this.maxSanity) return 0;

    const initialSanity = this.currentSanity;
    if (this.currentSanity + amount < this.maxSanity) {
      this.currentSanity += amount;
      return amount;
    } else {
      const restored = this.maxSanity - initialSanity;
      this.currentSanity = this.maxSanity;
      return restored;
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
    const baseMultiplier = 1.0;

    let strengthContribution = 0;
    if (this.totalStrength <= 50) {
      strengthContribution = this.totalStrength * 0.02;
    } else {
      const firstTier = 50 * 0.02;
      const additionalPoints = this.totalStrength - 50;
      const diminishedValue =
        (0.02 * additionalPoints) / (1 + Math.log1p(additionalPoints / 50));
      strengthContribution = firstTier + diminishedValue;
    }

    let dexterityContribution = 0;
    if (this.totalDexterity <= 50) {
      dexterityContribution = this.totalDexterity * 0.005;
    } else {
      const firstTier = 50 * 0.01;
      const additionalPoints = this.totalStrength - 50;
      const diminishedValue =
        (0.01 * additionalPoints) / (1 + Math.log1p(additionalPoints / 50));
      dexterityContribution = firstTier + diminishedValue;
    }

    return baseMultiplier + strengthContribution + dexterityContribution;
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
    const baseMultiplier = 1.0;

    let intelligenceContribution = 0;
    if (this.totalIntelligence <= 50) {
      intelligenceContribution = this.totalIntelligence * 0.02;
    } else {
      const firstTier = 50 * 0.02;
      const additionalPoints = this.totalIntelligence - 50;
      const diminishedValue =
        (0.02 * additionalPoints) / (1 + Math.log1p(additionalPoints / 50));
      intelligenceContribution = firstTier + diminishedValue;
    }
    return baseMultiplier + intelligenceContribution;
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

  get physicalDamageReduction() {
    const { armorMult, armorFlat } = getConditionEffectsOnDefenses([
      ...this.conditions,
      ...this.debilitations,
    ]);
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
    return Math.min(resistance, 75) / 100;
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
    usesWeapon?: boolean,
    forceItem?: Item,
  ): number {
    let baseDamage = base;
    let addedDamage = 0;
    let multiplier = 1;

    if (this.equipment) {
      for (const [_, item] of Object.entries(this.equipment)) {
        if (Array.isArray(item)) {
          baseDamage += usesWeapon
            ? item[0].stats?.get(baseDamageModifier) ?? 0 // the base damage of an item is not added for spells that do not use weapons
            : 0;
        } else if (item && item.stats) {
          if (forceItem && item.equals(this.equipment.mainHand)) {
            baseDamage += forceItem.stats?.get(baseDamageModifier) ?? 0;
            addedDamage += forceItem.stats?.get(addedDamageModifier) || 0;
            multiplier += forceItem.stats?.get(multiplierModifier) || 0;
          } else if (
            forceItem &&
            forceItem?.slot == "two-hand" &&
            this.equipment.offHand &&
            item.equals(this.equipment.offHand)
          ) {
            //skip it, included in main hand calc
          } else {
            baseDamage += usesWeapon
              ? item.stats.get(baseDamageModifier) ?? 0
              : 0; // the base damage of an item is not added for spells that do not use weapons
            addedDamage += item.stats.get(addedDamageModifier) || 0;
            multiplier += item.stats.get(multiplierModifier) || 0;
          }
        }
      }
    }

    return (baseDamage + addedDamage) * multiplier;
  }

  get physicalDamage(): number {
    const calc = this.calculateTotalDamage(
      Modifier.PhysicalDamage,
      Modifier.PhysicalDamageAdded,
      Modifier.PhysicalDamageMultiplier,
      this.baseDamageTable[DamageType.PHYSICAL] ?? 0,
      true,
    );

    return calc;
  }

  get fireDamage(): number {
    return this.calculateTotalDamage(
      Modifier.FireDamage,
      Modifier.FireDamageAdded,
      Modifier.FireDamageMultiplier,
      this.baseDamageTable[DamageType.FIRE] ?? 0,
      true,
    );
  }

  get coldDamage(): number {
    return this.calculateTotalDamage(
      Modifier.ColdDamage,
      Modifier.ColdDamageAdded,
      Modifier.ColdDamageMultiplier,
      this.baseDamageTable[DamageType.COLD] ?? 0,
      true,
    );
  }

  get lightningDamage(): number {
    return this.calculateTotalDamage(
      Modifier.LightningDamage,
      Modifier.LightningDamageAdded,
      Modifier.LightningDamageMultiplier,
      this.baseDamageTable[DamageType.LIGHTNING] ?? 0,
      true,
    );
  }

  get poisonDamage(): number {
    return this.calculateTotalDamage(
      Modifier.PoisonDamage,
      Modifier.PoisonDamageAdded,
      Modifier.PoisonDamageMultiplier,
      this.baseDamageTable[DamageType.POISON] ?? 0,
      true,
    );
  }

  get holyDamage(): number {
    return this.calculateTotalDamage(
      Modifier.HolyDamage,
      Modifier.HolyDamageAdded,
      Modifier.HolyDamageMultiplier,
      this.baseDamageTable[DamageType.HOLY] ?? 0,
      true,
    );
  }

  get magicDamage(): number {
    return this.calculateTotalDamage(
      Modifier.MagicDamage,
      Modifier.MagicDamageAdded,
      Modifier.MagicDamageMultiplier,
      this.baseDamageTable[DamageType.MAGIC] ?? 0,
      true,
    );
  }

  get physicalDamageNoWeapon(): number {
    return this.calculateTotalDamage(
      Modifier.PhysicalDamage,
      Modifier.PhysicalDamageAdded,
      Modifier.PhysicalDamageMultiplier,
      this.baseDamageTable[DamageType.PHYSICAL] ?? 0,
      false,
    );
  }

  get fireDamageNoWeapon(): number {
    return this.calculateTotalDamage(
      Modifier.FireDamage,
      Modifier.FireDamageAdded,
      Modifier.FireDamageMultiplier,
      this.baseDamageTable[DamageType.FIRE] ?? 0,
      false,
    );
  }

  get coldDamageNoWeapon(): number {
    return this.calculateTotalDamage(
      Modifier.ColdDamage,
      Modifier.ColdDamageAdded,
      Modifier.ColdDamageMultiplier,
      this.baseDamageTable[DamageType.COLD] ?? 0,
      false,
    );
  }

  get lightningDamageNoWeapon(): number {
    return this.calculateTotalDamage(
      Modifier.LightningDamage,
      Modifier.LightningDamageAdded,
      Modifier.LightningDamageMultiplier,
      this.baseDamageTable[DamageType.LIGHTNING] ?? 0,
      false,
    );
  }

  get poisonDamageNoWeapon(): number {
    return this.calculateTotalDamage(
      Modifier.PoisonDamage,
      Modifier.PoisonDamageAdded,
      Modifier.PoisonDamageMultiplier,
      this.baseDamageTable[DamageType.POISON] ?? 0,
      false,
    );
  }

  get holyDamageNoWeapon(): number {
    return this.calculateTotalDamage(
      Modifier.HolyDamage,
      Modifier.HolyDamageAdded,
      Modifier.HolyDamageMultiplier,
      this.baseDamageTable[DamageType.HOLY] ?? 0,
      false,
    );
  }

  get magicDamageNoWeapon(): number {
    return this.calculateTotalDamage(
      Modifier.MagicDamage,
      Modifier.MagicDamageAdded,
      Modifier.MagicDamageMultiplier,
      this.baseDamageTable[DamageType.MAGIC] ?? 0,
      false,
    );
  }
  public physicalDamageForceItem(item: Item): number {
    return this.calculateTotalDamage(
      Modifier.PhysicalDamage,
      Modifier.PhysicalDamageAdded,
      Modifier.PhysicalDamageMultiplier,
      this.baseDamageTable[DamageType.PHYSICAL] ?? 0,
      true,
      item,
    );
  }

  public fireDamageForceItem(item: Item): number {
    return this.calculateTotalDamage(
      Modifier.FireDamage,
      Modifier.FireDamageAdded,
      Modifier.FireDamageMultiplier,
      this.baseDamageTable[DamageType.FIRE] ?? 0,
      true,
      item,
    );
  }

  public coldDamageForceItem(item: Item): number {
    return this.calculateTotalDamage(
      Modifier.ColdDamage,
      Modifier.ColdDamageAdded,
      Modifier.ColdDamageMultiplier,
      this.baseDamageTable[DamageType.COLD] ?? 0,
      true,
      item,
    );
  }

  public lightningForceItem(item: Item): number {
    return this.calculateTotalDamage(
      Modifier.LightningDamage,
      Modifier.LightningDamageAdded,
      Modifier.LightningDamageMultiplier,
      this.baseDamageTable[DamageType.LIGHTNING] ?? 0,
      true,
      item,
    );
  }

  public poisonDamageForceItem(item: Item): number {
    return this.calculateTotalDamage(
      Modifier.PoisonDamage,
      Modifier.PoisonDamageAdded,
      Modifier.PoisonDamageMultiplier,
      this.baseDamageTable[DamageType.POISON] ?? 0,
      true,
      item,
    );
  }

  public holyDamageForceItem(item: Item): number {
    return this.calculateTotalDamage(
      Modifier.HolyDamage,
      Modifier.HolyDamageAdded,
      Modifier.HolyDamageMultiplier,
      this.baseDamageTable[DamageType.HOLY] ?? 0,
      true,
      item,
    );
  }

  public magicDamageForceItem(item: Item): number {
    return this.calculateTotalDamage(
      Modifier.MagicDamage,
      Modifier.MagicDamageAdded,
      Modifier.MagicDamageMultiplier,
      this.baseDamageTable[DamageType.MAGIC] ?? 0,
      true,
      item,
    );
  }

  //---------------------------Conditions---------------------------//
  /**
   * Adds a condition to the creature's list of conditions. Sets the `on` property.
   * @param condition - The condition to add. If null, does nothing.
   */
  public addCondition(condition?: Condition | null) {
    if (condition) {
      this.conditions.push(condition);
    }
  }

  public removeCondition(condition: Condition) {
    this.conditions = this.conditions.filter(
      (cond) => cond.id !== condition.id,
    );
  }

  public removeConditionById(conditionID: string, attackName: string) {
    const filteredConds = this.conditions.filter(
      (cond) => cond.id !== conditionID,
    );
    this.conditions = filteredConds;
    this.activeAuraConditionIds = this.activeAuraConditionIds.filter(
      (obj) => obj.attackName !== attackName,
    );
  }

  public removeDebuffs(amount: number): number {
    const debuffArray = this.conditions.filter(
      (condition) =>
        condition.style == "debuff" && condition.placedby !== "age",
    );
    const initialLength = debuffArray.length;

    for (let i = 0; i < amount && debuffArray.length > 0; i++) {
      debuffArray.shift();
    }
    this.conditions = debuffArray;

    return initialLength - debuffArray.length;
  }

  /**
   * Updates the list of conditions, removing those that have expired.
   */
  public conditionTicker() {
    let undeadDeathCheck = -1;
    for (let i = this.conditions.length - 1; i >= 0; i--) {
      const { effect } = this.conditions[i].tick(this);
      if (this.conditions[i].turns <= 0 && !this.conditions[i].aura) {
        this.removeCondition(this.conditions[i]);
      }

      if (effect.includes("destroy undead")) {
        undeadDeathCheck = getMagnitude(this.conditions[i].effectMagnitude);
      }
    }
    if (this.currentHealth <= undeadDeathCheck) {
      this.currentHealth = 0;
    }
    for (let i = this.debilitations.length - 1; i >= 0; i--) {
      const { effect } = this.debilitations[i].tick(this);

      if (effect.includes("destroy undead")) {
        undeadDeathCheck = getMagnitude(this.debilitations[i].effectMagnitude);
      }
    }
    if (this.currentHealth <= undeadDeathCheck) {
      this.currentHealth = 0;
    }
  }

  public deactivateAuras() {
    this.attacks.forEach((attack) => attack.deactivateAura);
  }

  public addToActiveAuraConditionIds({
    attackName,
    conditionIDs,
  }: {
    attackName: string;
    conditionIDs: string[];
  }) {
    this.activeAuraConditionIds.push({ attackName, conditionIDs });
  }

  get isStunned() {
    const isStunned = getConditionEffectsOnMisc([
      ...this.conditions,
      ...this.debilitations,
    ]).isStunned;
    return isStunned;
  }

  get isSilenced() {
    return this.conditions.some((condition) =>
      condition.effect.includes("silenced"),
    );
  }

  get healsFromPoison() {
    return !!this.conditions.some((cond) =>
      cond.effect.includes("siphon poison"),
    );
  }

  //--------------------Combat-------------------//
  /**
   * The built Attacks of the Creature
   */
  get attacks() {
    const builtAttacks: Attack[] = [];
    this.attackStrings.forEach((attackName) => {
      const foundAttack = jsonServiceStore
        .readJsonFileSync("enemyAttacks")
        .find((attackObj) => attackObj.name == attackName);
      if (!foundAttack)
        throw new Error(
          `No matching attack found for ${attackName} on ${
            (this as unknown as Character | Creature).nameReference
          }`,
        );
      const animationSet = this.animationStrings
        ? (this.animationStrings[attackName] as AnimationOptions)
        : undefined;
      const builtAttack = new Attack({
        ...foundAttack,
        targets: foundAttack.targets as "area" | "single" | "dual",
        animation: animationSet,
        user: this as unknown as Character | Creature,
      });
      builtAttacks.push(builtAttack);
    });
    return builtAttacks;
  }

  get attacksHeldActive() {
    return this.attacks.filter(
      (attack) =>
        attack.remainingTurnsActive && attack.remainingTurnsActive > 0,
    );
  }
  //---------------------------Equivalency---------------------------//
  public equals(otherBeingID: string) {
    return this.id === otherBeingID;
  }
  //---------------------------Battle---------------------------//
  /**
   * This method is meant to be overridden by derived classes. It currently chooses a random attack.
   * @param {Object} params - An object containing the target to attack.
   * @param {PlayerCharacter | Minion | Enemy} params.target - The target to attack.
   * @returns {Object} - An object indicating the result of the turn, including the chosen attack.
   */
  protected _takeTurn({
    targets,
    nameReference,
  }: {
    targets: Being[];
    nameReference: string;
  }): {
    attack: Attack | null;
    targetResults:
      | {
          target: Being;
          use: PerTargetUse;
        }[]
      | null;
    buffs: Condition[] | null;
    selfDamage: number;
    log: string;
  } {
    const execute = this.conditions.find((cond) =>
      cond.effect.includes("execute"),
    );
    if (execute) {
      this.damageHealth({ attackerId: execute.placedbyID, damage: 9999 });
      return {
        attack: null,
        targetResults: null,
        buffs: null,
        selfDamage: 0,
        log: `${toTitleCase(nameReference)} was executed!`,
      };
    }
    if (this.isStunned) {
      const allStunSources = this.conditions.filter((cond) =>
        cond.effect.includes("stun"),
      );
      allStunSources.forEach((stunSource) => {
        this.threatTable.addThreat(stunSource.placedbyID, 10);
      });
      return {
        attack: null,
        buffs: null,
        targetResults: targets.map((enemy) => ({
          target: enemy,
          use: { result: AttackUse.stunned },
        })),
        selfDamage: 0,
        log: `${toTitleCase(nameReference)} was stunned!`,
      };
    }
    const allTargets = targets.reduce((acc: Being[], currentTarget) => {
      acc.push(currentTarget);
      if (currentTarget instanceof PlayerCharacter) {
        acc.push(...(currentTarget.minionsAndPets || []));
      } else if (currentTarget instanceof Enemy) {
        acc.push(...(currentTarget.minions || []));
      }
      return acc;
    }, []);

    const availableAttacks = this.attacks.filter(
      (attack) => attack.canBeUsed.val,
    );
    runInAction(() => (this.currentMana = this.maxMana));
    if (availableAttacks.length > 0) {
      const { attack, numTargets } = this.chooseAttack(
        availableAttacks,
        allTargets.length,
      );

      const bestTargets = this.threatTable.getHighestThreatTargets(
        allTargets,
        numTargets,
      );

      const res = attack.use(bestTargets);
      return { ...res, attack };
    } else {
      return {
        attack: null,
        buffs: null,
        targetResults: targets.map((enemy) => ({
          target: enemy,
          use: { result: AttackUse.lowMana },
        })),
        selfDamage: 0,
        log: `${toTitleCase(nameReference)} passed (low energy)!`,
      };
    }
  }

  //TODO: needs to be re-evaluated
  protected chooseAttack(
    availableAttacks: Attack[],
    numberOfPotentialTargets: number,
  ): { attack: Attack; numTargets: number } {
    const scoredAttacks = availableAttacks.map((attack) => {
      const numTargets =
        attack.targets === "area"
          ? numberOfPotentialTargets
          : attack.targets === "dual"
          ? numberOfPotentialTargets > 1
            ? 2
            : 1
          : 1;
      const totalDamage = attack.displayDamage.cumulativeDamage * numTargets;
      const heal = attack.buffs?.filter((buff) => buff.effect.includes("heal"));
      const nonHealBuffCount =
        attack.buffs?.filter((buff) => !buff.effect.includes("heal")).length ??
        0;
      const debuffCount = attack.debuffNames?.length ?? 0;
      const summonCount = attack.summonNames?.length ?? 0;
      const healthPercentage = this.currentHealth / this.baseHealth;

      let priorityScore = totalDamage * attack.baseHitChance;

      priorityScore += nonHealBuffCount * 1.25;
      priorityScore += debuffCount * 1.25;

      if (heal && healthPercentage < 0.85) {
        if (healthPercentage > 0.5) {
          priorityScore * 5;
        } else {
          priorityScore * 10;
        }
      }
      if (summonCount > 0 && this instanceof Enemy) {
        if (healthPercentage > 0.75) {
          if (this.minions.length === 0) {
            priorityScore *= 5;
          } else if (this.minions.length === 1) {
            priorityScore *= 1.5;
          } else if (this.minions.length >= 2) {
            priorityScore /= 2;
          }
        } else if (healthPercentage > 0.5) {
          if (this.minions.length === 0) {
            priorityScore *= 2;
          } else if (this.minions.length === 1) {
            priorityScore /= 2;
          } else if (this.minions.length >= 2) {
            priorityScore /= 3;
          }
        } else {
          priorityScore /= 4;
        }
      }

      // Add a small random factor to introduce randomness
      priorityScore += (Math.random() / 5) * priorityScore;

      return { attack, priorityScore, numTargets };
    });

    // Sort the attacks by priority score in descending order
    scoredAttacks.sort((a, b) => b.priorityScore - a.priorityScore);

    // Return the attack with the highest priority score
    return {
      attack: scoredAttacks[0].attack,
      numTargets: scoredAttacks[0].numTargets,
    };
  }

  public endTurn() {
    this.conditionTicker();
    this.regenMana();
    this.regenHealth();
  }

  public damageTypeCalculation(
    type: DamageType,
    attackDamage: number,
    isSpell: boolean,
    usesWeapon: boolean,
    target?: Being,
    item?: Item,
  ) {
    switch (type) {
      case DamageType.PHYSICAL:
        return this.damageTypeCalc({
          userWeaponDependantDamage: item
            ? this.physicalDamageForceItem(item)
            : usesWeapon
            ? this.physicalDamage
            : this.physicalDamageNoWeapon,
          userWeaponIndependantDamageModifier: this.attackPower,
          attackIntrensicDamage: attackDamage,
          targetResistanceModifier: target?.physicalDamageReduction ?? 0,
        });
      case DamageType.FIRE:
        return this.damageTypeCalc({
          userWeaponDependantDamage: item
            ? this.fireDamageForceItem(item)
            : usesWeapon
            ? this.fireDamage
            : this.fireDamageNoWeapon,
          userWeaponIndependantDamageModifier: this.magicPower,
          attackIntrensicDamage: attackDamage,
          targetResistanceModifier: target?.fireResistance ?? 0,
        });
      case DamageType.COLD:
        return this.damageTypeCalc({
          userWeaponDependantDamage: item
            ? this.coldDamageForceItem(item)
            : usesWeapon
            ? this.coldDamage
            : this.coldDamageNoWeapon,
          userWeaponIndependantDamageModifier: this.magicPower,
          attackIntrensicDamage: attackDamage,
          targetResistanceModifier: target?.coldResistance ?? 0,
        });
      case DamageType.LIGHTNING:
        return this.damageTypeCalc({
          userWeaponDependantDamage: usesWeapon
            ? this.lightningDamage
            : this.lightningDamageNoWeapon,
          userWeaponIndependantDamageModifier: this.magicPower,
          attackIntrensicDamage: attackDamage,
          targetResistanceModifier: target?.lightningResistance ?? 0,
        });
      case DamageType.POISON:
        return this.damageTypeCalc({
          userWeaponDependantDamage: usesWeapon
            ? this.poisonDamage
            : this.poisonDamageNoWeapon,
          userWeaponIndependantDamageModifier: this.magicPower,
          attackIntrensicDamage: attackDamage,
          targetResistanceModifier: target?.poisonResistance ?? 0,
        });
      case DamageType.HOLY:
        return this.damageTypeCalc({
          userWeaponDependantDamage: usesWeapon
            ? this.holyDamage
            : this.holyDamageNoWeapon,
          userWeaponIndependantDamageModifier: this.magicPower,
          attackIntrensicDamage: attackDamage,
          targetResistanceModifier: target?.holyResistance ?? 0,
        });
      case DamageType.MAGIC:
        return this.damageTypeCalc({
          userWeaponDependantDamage: usesWeapon
            ? this.magicDamage
            : this.magicDamageNoWeapon,
          userWeaponIndependantDamageModifier: this.magicPower,
          attackIntrensicDamage: attackDamage,
          targetResistanceModifier: target?.magicResistance ?? 0,
        });
      case DamageType.RAW:
        return this.damageTypeCalc({
          userWeaponIndependantDamageModifier: isSpell
            ? this.magicPower
            : this.attackPower,
          attackIntrensicDamage: attackDamage,
          targetResistanceModifier: 0,
        });
    }
  }

  private damageTypeCalc({
    userWeaponDependantDamage = 0,
    userWeaponIndependantDamageModifier,
    attackIntrensicDamage,
    targetResistanceModifier,
  }: {
    userWeaponDependantDamage?: number;
    userWeaponIndependantDamageModifier: number;
    attackIntrensicDamage: number;
    targetResistanceModifier: number;
  }) {
    return (
      (userWeaponDependantDamage * userWeaponIndependantDamageModifier +
        attackIntrensicDamage) *
      (1 - targetResistanceModifier)
    );
  }

  public calculateAttackDamage({
    baseDamageMap,
    isSpell,
    usesWeapon,
    target,
    item,
    selfTargeting,
  }: {
    baseDamageMap: { [key in DamageType]?: number } | null;
    isSpell: boolean;
    usesWeapon: boolean;
    target?: Being;
    item?: Item;
    selfTargeting: boolean;
  }) {
    let cumulativeDamage = 0;
    const { damageFlat, damageMult } = getConditionEffectsOnAttacks({
      selfConditions: [...this.conditions, ...this.debilitations],
      enemyConditions: [
        ...(target?.conditions ?? []),
        ...(target?.debilitations ?? []),
      ],
    });

    if (baseDamageMap == null)
      return { cumulativeDamage, damageMap: baseDamageMap };
    let damageMap: Record<DamageType, number> = {
      [DamageType.PHYSICAL]: baseDamageMap
        ? baseDamageMap[DamageType.PHYSICAL] ?? 0
        : 0,
      [DamageType.FIRE]: baseDamageMap
        ? baseDamageMap[DamageType.FIRE] ?? 0
        : 0,
      [DamageType.COLD]: baseDamageMap
        ? baseDamageMap[DamageType.COLD] ?? 0
        : 0,
      [DamageType.LIGHTNING]: baseDamageMap
        ? baseDamageMap[DamageType.LIGHTNING] ?? 0
        : 0,
      [DamageType.POISON]: baseDamageMap
        ? baseDamageMap[DamageType.POISON] ?? 0
        : 0,
      [DamageType.HOLY]: baseDamageMap
        ? baseDamageMap[DamageType.HOLY] ?? 0
        : 0,
      [DamageType.MAGIC]: baseDamageMap
        ? baseDamageMap[DamageType.MAGIC] ?? 0
        : 0,
      [DamageType.RAW]: baseDamageMap ? baseDamageMap[DamageType.RAW] ?? 0 : 0,
    };
    if (selfTargeting && damageMap[DamageType.RAW] < 0) {
      const val = damageMap[DamageType.RAW] * this.magicPower;
      damageMap[DamageType.RAW] = val;
      cumulativeDamage += val;
      return { cumulativeDamage, damageMap };
    }

    Object.entries(damageMap).forEach(([typeKey, amount]) => {
      const damageType = parseInt(typeKey) as DamageType;
      let calculatedDamage = amount;
      calculatedDamage =
        this.damageTypeCalculation(
          damageType,
          amount,
          isSpell,
          usesWeapon,
          target,
          item,
        ) *
          damageMult +
        damageFlat;

      damageMap[damageType] = calculatedDamage;
      cumulativeDamage += calculatedDamage;
    });

    return { cumulativeDamage, damageMap };
  }

  public static fromJSON(json: any): Being {
    return new Being({
      id: json.id,
      beingType: json.beingType,
      sprite: json.sprite,
      currentHealth: json.currentHealth,
      baseHealth: json.baseHealth,
      currentSanity: json.currentSanity,
      baseSanity: json.baseSanity,
      baseMana: json.baseMana,
      currentMana: json.currentMana,
      baseManaRegen: json.baseManaRegen,
      baseStrength: json.baseStrength,
      baseIntelligence: json.baseIntelligence,
      baseDexterity: json.baseDexterity,
      baseArmor: json.baseArmor,
      baseResistanceTable: json.baseResistanceTable,
      attackStrings: json.attackStrings,
      animationStrings: json.animationString,
      baseDamageTable: json.baseDamageTable,
      alive: json.alive,
      deathdate: json.deathdate,
      allocatedSkillPoints: json.allocatedSkillPoints,
      equipment: json.equipment,
      conditions: json.conditions
        ? json.conditions.map((condition: any) => Condition.fromJSON(condition))
        : [],
      activeAuraConditionIds: json.activeAuraConditionIds,
      root: json.root,
    });
  }
}
