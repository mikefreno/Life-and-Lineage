import { Being } from "./being";

export class ThreatTable {
  private baseThreatPoints: Map<string, number>;

  constructor() {
    this.baseThreatPoints = new Map();
  }

  public addThreat(attackerId: string, points: number) {
    if (!this.baseThreatPoints.has(attackerId)) {
      this.baseThreatPoints.set(attackerId, 0);
    }
    this.baseThreatPoints.set(
      attackerId,
      this.baseThreatPoints.get(attackerId)! + points,
    );
  }

  public getHighestThreatTargets(
    targets: Being[],
    numTargets: number,
  ): Being[] {
    if (!targets.length) {
      throw new Error("No targets provided");
    }

    // Ensure numTargets doesn't exceed available targets
    numTargets = Math.min(numTargets, targets.length);

    const highestHP = targets.sort(
      (a, b) => b.currentHealth - a.currentHealth,
    )[0].currentHealth;
    const highestAP = targets.sort((a, b) => b.attackPower - a.attackPower)[0]
      .attackPower;

    // Calculate threat points for all targets
    const targetsWithThreat = targets.map((target) => ({
      target,
      points: this.totalThreatPoints(target, highestHP, highestAP),
    }));

    // Sort by threat points in descending order
    const sortedTargets = targetsWithThreat.sort((a, b) => b.points - a.points);

    // If we have targets with threat points, return top N
    const validThreatTargets = sortedTargets.filter((t) => t.points > 0);
    if (validThreatTargets.length > 0) {
      return validThreatTargets.slice(0, numTargets).map((t) => t.target);
    }

    // Fallback logic: prioritize players, then enemies with minions
    const fallbackTargets = [
      ...targets.filter((target) => "fullName" in target),
      ...targets.filter((target) => "minions" in target),
      ...targets,
    ];

    return [...new Set(fallbackTargets)] // Remove duplicates
      .slice(0, numTargets);
  }

  public totalThreatPoints(
    target: Being,
    highestHP: number,
    highestAttackPower: number,
  ): number {
    const targetId = target.id;
    let points = this.baseThreatPoints.get(targetId) || 0;

    if (!points) return 0;

    const relativeHP = target.currentHealth / highestHP;
    const relativeAttackPower = target.attackPower / highestAttackPower;

    let hpMultiplier =
      relativeHP > 0.95
        ? 0.5
        : relativeHP < 0.1
        ? 4.0
        : relativeHP < 0.25
        ? 2.0
        : relativeHP < 0.5
        ? 1.5
        : 1.0;

    let apMultiplier =
      relativeAttackPower > 0.95
        ? 4.0
        : relativeAttackPower < 0.1
        ? 0.25
        : relativeAttackPower < 0.25
        ? 0.5
        : relativeAttackPower < 0.5
        ? 0.75
        : 1.0;

    return points * hpMultiplier * apMultiplier;
  }
}
