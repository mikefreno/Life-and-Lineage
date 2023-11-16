interface ConditionOptions {
  name: string;
  style: "debuff" | "buff";
  turns: number;
  effect: ("skip" | "accuracy halved" | "damage" | "sanity")[];
  damage: number;
}

export class Condition {
  readonly name: string;
  readonly style: "debuff" | "buff";
  private turns: number;
  readonly effect: ("skip" | "accuracy halved" | "damage" | "sanity")[];
  readonly damage: number | null;
  constructor({ name, style, turns, effect, damage }: ConditionOptions) {
    this.name = name;
    this.style = style;
    this.turns = turns;
    this.effect = effect;
    this.damage = damage;
  }
  public getRemaingTurns() {
    return this.turns;
  }
  public tick() {
    this.turns -= 1;
    return {
      effect: this.effect,
      damage: this.damage,
      turns: this.turns,
    };
  }

  public toJSON(): object {
    return {
      name: this.name,
      turns: this.turns,
      effect: this.effect,
      damage: this.damage,
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
