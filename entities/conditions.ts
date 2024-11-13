import { action, makeObservable, observable, reaction } from "mobx";
import * as Crypto from "expo-crypto";
import { ConditionType, EffectOptions, EffectStyle } from "../utility/types";
import type { PlayerCharacter } from "./character";
import type { Creature, Enemy, Minion } from "./creatures";

/**
 * Almost everything in this class is readonly. Everything is either pre-computed or is computed in totality with all Conditions at once.
 * The reason for this is there are different times where `Condition` effects need be evaluated, they can be evaluated at various points
 * in the turn of a `PlayerCharacter`, `Creature` depending on their effect, for instance total health damage is calculated at the end of a turn,
 * accuracy effects are calculated at the beginning, and attack damage buffs are calculated following a successful attack roll
 */
export class Condition {
  readonly id: string;
  readonly name: string;
  readonly style: "debuff" | "buff";
  turns: number;
  trapSetupTime: number | undefined;
  readonly aura: boolean;
  readonly placedby: string;
  readonly placedbyID: string;
  readonly effect: EffectOptions[];
  readonly healthDamage: number[];
  readonly sanityDamage: number[];
  readonly effectStyle: EffectStyle[];
  readonly effectMagnitude: number[];
  readonly icon: string;
  on: PlayerCharacter | Enemy | Minion | null;

  constructor({
    name,
    style,
    turns,
    effect,
    effectStyle,
    effectMagnitude,
    healthDamage,
    sanityDamage,
    trapSetupTime,
    placedby,
    placedbyID,
    id,
    aura,
    icon,
    on,
  }: ConditionType) {
    this.id = id ?? Crypto.randomUUID();
    this.name = name;
    this.style = style;
    this.turns = turns;
    this.trapSetupTime = trapSetupTime;
    this.effect = effect;
    this.healthDamage = healthDamage;
    this.sanityDamage = sanityDamage;
    this.effectStyle = effectStyle;
    this.effectMagnitude = effectMagnitude;
    this.placedby = placedby;
    this.placedbyID = placedbyID;
    this.aura = aura ?? false;
    this.icon = icon;
    this.on = on;
    makeObservable(this, {
      turns: observable,
      tick: action,
      destroyTrap: action,
    });

    reaction(
      () => [this.turns],
      () => {
        if (this.turns <= 0) {
          this.on?.removeCondition(this);
        }
      },
    );
  }

  public getConditionIcon() {
    if (this.icon) {
      return conditionIconMap[this.icon];
    } else {
      return ["Egg"];
    }
  }

  public getHealthDamage() {
    let totalHealthDmg: number | null = null;
    if (typeof this.healthDamage == "number") {
      totalHealthDmg = this.healthDamage;
    } else if (this.healthDamage) {
      totalHealthDmg = this.healthDamage.reduce(
        (acc, val) => (acc ?? 0) + (val ?? 0),
        0,
      );
    }
    return totalHealthDmg ? Math.round(totalHealthDmg * 4) / 4 : null;
  }

  public getSanityDamage() {
    let totalSanityDmg: number | null = null;
    if (typeof this.sanityDamage == "number") {
      totalSanityDmg = this.sanityDamage;
    } else if (this.sanityDamage) {
      totalSanityDmg = this.sanityDamage.reduce(
        (acc, val) => (acc ?? 0) + (val ?? 0),
        0,
      );
    }
    return totalSanityDmg ? Math.round(totalSanityDmg * 4) / 4 : null;
  }

  public reinstateParent(parent: PlayerCharacter | Enemy | Minion) {
    this.on = parent;
    return this;
  }

  /**
   * This will always return the turn count, which need be checked for removal, an effect is returned if it exists
   * If the condition only does sanity and/or health damage, no effect is returned
   */
  public tick(holder: PlayerCharacter | Creature) {
    if (!this.aura) {
      this.turns -= 1;
      if (this.trapSetupTime && this.trapSetupTime >= 0) {
        this.trapSetupTime -= 1;
      }
    }
    holder.damageHealth({
      attackerId: this.placedbyID,
      damage: this.getHealthDamage(),
    });
    holder.damageSanity(this.getSanityDamage());
    return { turns: this.turns, effect: this.effect };
  }

  static effectExplanationString({
    effect,
    effectStyle,
    effectMagnitude,
    trapSetupTime,
  }: {
    effect: EffectOptions;
    effectStyle: EffectStyle;
    effectMagnitude: number;
    trapSetupTime: number | undefined;
  }) {
    switch (effect) {
      case "stun":
        return "Stunned";
      case "silenced":
        return "Silenced";
      case "accuracy reduction":
        return `Accuracy reduced by ${
          effectStyle == "percentage" ? effectMagnitude * 100 : effectMagnitude
        }${effectStyle !== "flat" ? "%" : ""}`;
      case "accuracy increase":
        return `Accuracy increased by ${
          effectStyle == "percentage" ? effectMagnitude * 100 : effectMagnitude
        }${effectStyle !== "flat" ? "%" : ""}`;
      case "sanity heal":
        return "";
      case "sanity damage":
        return "";
      case "sanityMax increase":
        return `Increase max sanity by ${
          effectStyle == "percentage" ? effectMagnitude * 100 : effectMagnitude
        }${effectStyle !== "flat" ? "%" : ""}`;
      case "sanityMax decrease":
        return `Decrease max sanity by ${
          effectStyle == "percentage" ? effectMagnitude * 100 : effectMagnitude
        }${effectStyle !== "flat" ? "%" : ""}`;
      case "heal":
        return "";
      case "health damage":
        return "";
      case "healthMax increase":
        return `Increases max health by ${
          effectStyle == "percentage" ? effectMagnitude * 100 : effectMagnitude
        }${effectStyle !== "flat" ? "%" : ""}`;
      case "healthMax decrease":
        return `Decreases max health by ${
          effectStyle == "percentage" ? effectMagnitude * 100 : effectMagnitude
        }${effectStyle !== "flat" ? "%" : ""}`;
      case "mana regen":
        return `Increases mana regen by ${
          effectStyle == "percentage" ? effectMagnitude * 100 : effectMagnitude
        }${effectStyle !== "flat" ? "%" : ""} each turn`;
      case "mana drain":
        return `Drains mana by ${
          effectStyle == "percentage" ? effectMagnitude * 100 : effectMagnitude
        }${effectStyle !== "flat" ? "%" : ""} each turn`;
      case "manaMax increase":
        return `Increase max mana by ${
          effectStyle == "percentage" ? effectMagnitude * 100 : effectMagnitude
        }${effectStyle !== "flat" ? "%" : ""}`;
      case "manaMax decrease":
        return `Decrease max mana by ${
          effectStyle == "percentage" ? effectMagnitude * 100 : effectMagnitude
        }${effectStyle !== "flat" ? "%" : ""}`;
      case "armor increase":
        return `Increase armor by ${
          effectStyle == "percentage" ? effectMagnitude * 100 : effectMagnitude
        }${effectStyle !== "flat" ? "%" : ""}`;
      case "armor decrease":
        return `Decreases armor by ${
          effectStyle == "percentage" ? effectMagnitude * 100 : effectMagnitude
        }${effectStyle !== "flat" ? "%" : ""}`;
      case "weaken":
        return `Decreases attack damage by ${
          effectStyle == "percentage" ? effectMagnitude * 100 : effectMagnitude
        }${effectStyle !== "flat" ? "%" : ""}`;
      case "strengthen":
        return `Increases attack damage by ${
          effectStyle == "percentage" ? effectMagnitude * 100 : effectMagnitude
        }${effectStyle !== "flat" ? "%" : ""}`;
      case "destroy undead":
        return `Destroy undead under ${effectMagnitude} health (accumulates)`;
      case "undead cower":
        return "Stunned";
      case "blur":
        return `Increased dodge chance by ${
          effectStyle == "percentage" ? effectMagnitude * 100 : effectMagnitude
        }${effectStyle !== "flat" ? "%" : ""}`;
      case "thorns":
        return `Damages attacker for ${effectMagnitude} health damage`;
      case "trap":
        if (trapSetupTime && trapSetupTime > 0) {
          return `Setting up for ${trapSetupTime} more turns`;
        } else {
          return `Hits next attacker for ${effectMagnitude} health damage`;
        }
      case "revenge":
        return "Will strike next attacker";
      case "blood magic consumable":
        return "Empowers ";
      case "execute":
        return "Will die at end of next turn";
      case "stealth":
        return "Prevents detection, allows for certain attacks to be performed";
    }
  }

  /**
   * Removes the trap - to be used when the holder(defender) is first attacked
   */
  public destroyTrap() {
    if (this.effect.includes("trap")) {
      this.turns = 0;
    }
  }

  static fromJSON(json: any): Condition {
    const condition = new Condition({
      id: json.id,
      icon: json.icon,
      name: json.name,
      style: json.style,
      turns: json.turns,
      trapSetupTime: json.trapSetupTime,
      effect: json.effect,
      healthDamage: json.healthDamage,
      sanityDamage: json.sanityDamage,
      effectMagnitude: json.effectMagnitude,
      effectStyle: json.effectStyle,
      placedby: json.placedby,
      aura: json.aura,
      placedbyID: json.placedByID,
      on: null,
    });
    return condition;
  }
}
const conditionIconMap: { [key: string]: any } = {
  anger: require("../assets/images/conditions/anger.png"),
  blank: require("../assets/images/conditions/blank.png"),
  bleed: require("../assets/images/conditions/bleed.png"),
  blind: require("../assets/images/conditions/blind.png"),
  distraught: require("../assets/images/conditions/distraught.png"),
  eagle: require("../assets/images/conditions/eagle.png"),
  flame: require("../assets/images/conditions/flame.png"),
  glow_star: require("../assets/images/conditions/glow_star.png"),
  holding_heart: require("../assets/images/conditions/holding_heart.png"),
  pray_hands: require("../assets/images/conditions/pray_hands.png"),
  scarecrow: require("../assets/images/conditions/scarecrow.png"),
  shield: require("../assets/images/conditions/shield.png"),
  skull_and_crossbones: require("../assets/images/conditions/skull_crossbones.png"),
  snowflake: require("../assets/images/conditions/snowflake.png"),
  split_heart: require("../assets/images/conditions/split_heart.png"),
  stun: require("../assets/images/conditions/stun.png"),
  viruses: require("../assets/images/conditions/viruses.png"),
  blood_orb: require("../assets/images/conditions/blood_orb.png"),
  hollow_disk: require("../assets/images/conditions/hollow_disk.png"),
  rock_hands: require("../assets/images/conditions/rock_hands.png"),
  dagger_ring: require("../assets/images/conditions/dagger_ring.png"),
  trap: require("../assets/images/conditions/trap.png"),
};
