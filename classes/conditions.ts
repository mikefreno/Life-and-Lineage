import { action, makeObservable, observable } from "mobx";

interface ConditionOptions {
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
  )[];
  damage: number;
}

export class Condition {
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
  )[];
  readonly damage: number | null;

  constructor({ name, style, turns, effect, damage }: ConditionOptions) {
    this.name = name;
    this.style = style;
    this.turns = turns;
    this.effect = effect;
    this.damage = damage;
    makeObservable(this, { turns: observable, tick: action });
  }

  public tick() {
    this.turns -= 1;
    return {
      effect: this.effect,
      damage: this.damage,
      turns: this.turns,
    };
  }
  static fromJSON(json: any): Condition {
    const condition = new Condition({
      name: json.name,
      style: json.style,
      turns: json.turns,
      effect: json.effect,
      damage: json.damage,
    });
    return condition;
  }
}
