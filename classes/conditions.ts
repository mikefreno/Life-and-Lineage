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
  )[];
  damage: number;
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
  )[];
  readonly damage: number | null;

  constructor({ name, style, turns, effect, damage, id }: ConditionOptions) {
    this.id = id ?? uuidv4();
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
