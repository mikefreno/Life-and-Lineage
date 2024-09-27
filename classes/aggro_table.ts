import type { PlayerCharacter } from "./character";
import type { Enemy, Minion } from "./creatures";

export class AggroTable {
  private aggroPoints: Map<string, number>;

  constructor() {
    this.aggroPoints = new Map();
  }

  public addAggro(attackerId: string, points: number) {
    if (!this.aggroPoints.has(attackerId)) {
      this.aggroPoints.set(attackerId, 0);
    }
    this.aggroPoints.set(
      attackerId,
      this.aggroPoints.get(attackerId)! + points,
    );
  }

  public getHighestAggroTarget(
    targets: (PlayerCharacter | Minion | Enemy)[],
  ): PlayerCharacter | Minion | Enemy {
    let highestAggroTarget: PlayerCharacter | Minion | Enemy | null = null;
    let highestAggroPoints = 0;

    for (const target of targets) {
      const targetId = target.id;
      const targetAggroPoints = this.aggroPoints.get(targetId) || 0;

      if (targetAggroPoints > highestAggroPoints) {
        highestAggroPoints = targetAggroPoints;
        highestAggroTarget = target;
      }
    }

    if (highestAggroTarget) {
      return highestAggroTarget;
    } else {
      return targets.find((target) => "fullName" in target)!;
    }
  }
}
