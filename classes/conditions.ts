interface ConditionOptions {
  name: string;
  turns: number;
  effect: ("skip" | "accuracy halved" | "damage" | "sanity")[];
  damage: number;
}

export class Condition {
  readonly name: string;
  private turns: number;
  readonly effect: ("skip" | "accuracy halved" | "damage" | "sanity")[];
  readonly damage: number | null;
  constructor({ name, turns, effect, damage }: ConditionOptions) {
    this.name = name;
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

  static fromJSON(json: any): Condition {
    const condition = new Condition({
      name: json.name,
      turns: json.turns,
      effect: json.effect,
      damage: json.damage,
    });
    return condition;
  }
}
