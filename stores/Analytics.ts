import { makeObservable, observable } from "mobx";
import { RootStore } from "./RootStore";
import { API_BASE_URL } from "@/config/config";
import { storage } from "@/utility/functions/storage";
import { DamageType } from "@/utility/types";

const TEN_MIN = 600_000;
export class Analytics {
  root: RootStore;
  optedOut: boolean;
  sendInterval: NodeJS.Timeout;

  constructor({ root }: { root: RootStore }) {
    this.root = root;
    const { optedOut } = this.hydrate();
    this.optedOut = optedOut;

    this.sendDataToAPI();
    this.sendInterval = setInterval(() => this.sendDataToAPI(), TEN_MIN);

    makeObservable(this, { optedOut: observable });
  }

  async sendDataToAPI() {
    const player = this.root.playerState;
    if (!player || this.optedOut) {
      return;
    }
    const furthestInst = this.root.dungeonStore.dungeonInstances.sort(
      (a, b) => b.difficulty - a.difficulty,
    )[0];

    const resistanceTable: Record<DamageType, number> = {
      [DamageType.PHYSICAL]: player.physicalDamageReduction,
      [DamageType.FIRE]: player.fireResistance,
      [DamageType.COLD]: player.coldResistance,
      [DamageType.LIGHTNING]: player.lightningResistance,
      [DamageType.POISON]: player.poisonResistance,
      [DamageType.HOLY]: player.holyResistance,
      [DamageType.MAGIC]: player.magicResistance,
      [DamageType.RAW]: 0,
    };

    const damageTable: Record<DamageType, number> = {
      [DamageType.PHYSICAL]: player.physicalDamage,
      [DamageType.FIRE]: player.fireDamage,
      [DamageType.COLD]: player.coldDamage,
      [DamageType.LIGHTNING]: player.lightningResistance,
      [DamageType.POISON]: player.poisonDamage,
      [DamageType.HOLY]: player.holyResistance,
      [DamageType.MAGIC]: player.magicResistance,
      [DamageType.RAW]: 0,
    };

    const jobs = Object.fromEntries(player.jobs);
    const data = {
      playerID: player.id,
      dungeonProgression: {
        name: furthestInst.name,
        completedFloors:
          furthestInst.levels.filter((levels) => levels.bossDefeated).length /
          furthestInst.levels.length,
      },
      playerClass: player.playerClass,
      spellCount: player.spells.length,
      proficiencies: player.magicProficiencies,
      jobs,
      resistanceTable,
      damageTable,
    };
    await fetch(`${API_BASE_URL}/analytics`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  setOptOut(val: boolean) {
    this.optedOut = val;
    this.serialize();
  }

  cleanUp() {
    clearInterval(this.sendInterval);
  }

  private serialize() {
    storage.set("optedOut", this.optedOut);
  }

  private hydrate() {
    const optedOut = storage.getBoolean("optedOut") ?? false;
    return { optedOut };
  }
}
