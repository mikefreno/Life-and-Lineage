import { action, makeObservable, observable } from "mobx";
import * as Crypto from "expo-crypto";

interface ConditionOptions {
  id?: string;
  name: string;
  style: "debuff" | "buff";
  turns: number;
  effect: (
    | "turn skip"
    | "accuracy reduction"
    | "accuracy increase"
    | "sanity heal"
    | "sanity damage"
    | "sanityMax increase"
    | "sanityMax decrease"
    | "heal"
    | "health damage"
    | "healthMax increase"
    | "healthMax decrease"
    | "mana regen"
    | "mana drain"
    | "manaMax increase"
    | "manaMax decrease"
    | "armor increase"
    | "armor decrease"
    | "weaken"
    | "strengthen"
  )[];
  effectStyle: "flat" | "multiplier" | null;
  effectMagnitude: number | null;
  healthDamage: number | null;
  sanityDamage: number | null;
  placedby: string;
  icon?: string;
}

export class Condition {
  readonly id: string;
  readonly name: string;
  readonly style: "debuff" | "buff";
  turns: number;
  readonly placedby: string;
  readonly effect: (
    | "turn skip"
    | "accuracy reduction"
    | "accuracy increase"
    | "sanity heal"
    | "sanity damage"
    | "sanityMax increase"
    | "sanityMax decrease"
    | "heal"
    | "health damage"
    | "healthMax increase"
    | "healthMax decrease"
    | "mana regen"
    | "mana drain"
    | "manaMax increase"
    | "manaMax decrease"
    | "armor increase"
    | "armor decrease"
    | "weaken"
    | "strengthen"
  )[];
  readonly healthDamage: number | null;
  readonly sanityDamage: number | null;
  readonly effectStyle: "flat" | "multiplier" | null;
  readonly effectMagnitude: number | null;
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
    icon,
  }: ConditionOptions) {
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

  public tick() {
    this.turns -= 1;
    return {
      effect: this.effect,
      healthDamage: this.healthDamage
        ? Math.round(this.healthDamage * 4) / 4
        : null,
      sanityDamage: this.sanityDamage
        ? Math.round(this.sanityDamage * 4) / 4
        : null,
      turns: this.turns,
    };
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
};
