import { action, makeObservable, observable } from "mobx";
import { v4 as uuidv4 } from "uuid";

interface ConditionOptions {
  id?: string;
  name: string;
  style: "debuff" | "buff";
  turns: number;
  effect: (
    | "skip"
    | "accuracy halved"
    | "damage"
    | "sanity"
    | "armor"
    | "health"
    | "weaken"
  )[];
  damage: number;
  icon?: string;
}

export class Condition {
  readonly id: string;
  readonly name: string;
  readonly style: "debuff" | "buff";
  turns: number;
  readonly effect: (
    | "skip"
    | "accuracy halved"
    | "damage"
    | "sanity"
    | "armor"
    | "health"
    | "weaken"
  )[];
  readonly damage: number | null;
  readonly icon: string | undefined;

  constructor({
    name,
    style,
    turns,
    effect,
    damage,
    id,
    icon,
  }: ConditionOptions) {
    this.id = id ?? uuidv4();
    this.name = name;
    this.style = style;
    this.turns = turns;
    this.effect = effect;
    this.damage = damage;
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
      damage: this.damage ? Math.round(this.damage * 4) / 4 : null,
      turns: this.turns,
    };
  }
  static fromJSON(json: any): Condition {
    const condition = new Condition({
      id: json.id,
      name: json.name,
      style: json.style,
      turns: json.turns,
      effect: json.effect,
      damage: json.damage,
    });
    return condition;
  }
}
const conditionIconMap: { [key: string]: any } = {
  blind: require("../assets/images/conditions/blind.png"),
  bleed: require("../assets/images/conditions/bleed.png"),
  stun: require("../assets/images/conditions/stun.png"),
  snowflake: require("../assets/images/conditions/snowflake.png"),
  "skull-and-crossbones": require("../assets/images/conditions/skull_crossbones.png"),
  viruses: require("../assets/images/conditions/viruses.png"),
  flame: require("../assets/images/conditions/flame.png"),
  scarecrow: require("../assets/images/conditions/scarecrow.png"),
  shield: require("../assets/images/conditions/shield.png"),
  holding_heart: require("../assets/images/conditions/holding_heart.png"),
  split_heart: require("../assets/images/conditions/split_heart.png"),
  distraught: require("../assets/images/conditions/distraught.png"),
  blank: require("../assets/images/conditions/blank.png"),
};
