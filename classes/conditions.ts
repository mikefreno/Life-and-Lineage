import { action, makeObservable, observable } from "mobx";
import * as Crypto from "expo-crypto";
import { ConditionType, effectOptions } from "../utility/types";
import { PlayerCharacter } from "./character";
import { Creature } from "./creatures";

export class Condition {
  readonly id: string;
  readonly name: string;
  readonly style: "debuff" | "buff";
  turns: number;
  readonly aura: boolean;
  readonly placedby: string;
  readonly effect: effectOptions[] | effectOptions;
  readonly healthDamage: (number | null)[] | number | null;
  readonly sanityDamage: (number | null)[] | number | null;
  readonly effectStyle:
    | ("flat" | "multiplier" | null)[]
    | "flat"
    | "multiplier"
    | null;
  readonly effectMagnitude: (number | null)[] | number | null;
  readonly icon: string | undefined;

  constructor({
    name,
    style,
    turns,
    effect,
    effectStyle,
    effectMagnitude,
    healthDamage,
    sanityDamage,
    placedby,
    id,
    aura,
    icon,
  }: ConditionType) {
    this.id = id ?? Crypto.randomUUID();
    this.name = name;
    this.style = style;
    this.turns = turns;
    this.effect = effect;
    this.healthDamage = healthDamage;
    this.sanityDamage = sanityDamage;
    this.effectStyle = effectStyle;
    this.effectMagnitude = effectMagnitude;
    this.placedby = placedby;
    this.aura = aura ?? false;
    this.icon = icon;
    makeObservable(this, { turns: observable, tick: action });
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

  public tick(holder: PlayerCharacter | Creature) {
    if (!this.aura) {
      this.turns -= 1;
    }
    holder.damageHealth(this.getHealthDamage());
    holder.damageSanity(this.getSanityDamage());
    return { turns: this.turns, effect: this.effect };
  }

  static fromJSON(json: any): Condition {
    const condition = new Condition({
      id: json.id,
      icon: json.icon,
      name: json.name,
      style: json.style,
      turns: json.turns,
      effect: json.effect,
      healthDamage: json.healthDamage,
      sanityDamage: json.sanityDamage,
      effectMagnitude: json.effectMagnitude,
      effectStyle: json.effectStyle,
      placedby: json.placedby,
      aura: json.aura,
      simple: json.simple,
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
};
