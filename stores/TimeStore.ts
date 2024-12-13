import { action, computed, makeObservable, observable, reaction } from "mobx";
import { RootStore } from "./RootStore";
import { storage } from "../utility/functions/storage";
import { parse, stringify } from "flatted";

export class TimeStore {
  week: number;
  year: number;
  root: RootStore;

  constructor({ root }: { root: RootStore }) {
    const { week, year } = this.hydrate();
    this.week = week;
    this.year = year;
    this.root = root;

    makeObservable(this, {
      week: observable,
      year: observable,
      tick: action,
      currentDate: computed,
      fromCheckpointData: action,
    });

    reaction(
      () => [this.week, this.year],
      () =>
        storage.set("time", stringify({ week: this.week, year: this.year })),
    );
  }

  tick() {
    this.week = (this.week + 1) % 52;
    if (this.week === 0) this.year++;
  }

  get currentDate() {
    return { year: this.year, week: this.week };
  }

  generateBirthDateInRange(minAge: number, maxAge: number) {
    const year =
      this.year - maxAge + Math.floor(Math.random() * (maxAge - minAge));
    const week = Math.floor(Math.random() * 52);

    return { year, week };
  }

  generateBirthDateForAge(targetAge: number) {
    const year = this.year - targetAge;
    const week = Math.floor(Math.random() * 52);

    if (week > this.week) {
      return { year: year - 1, week };
    }
    return { year, week };
  }

  hydrate() {
    const timeStr = storage.getString("time");
    if (!timeStr) {
      return { week: 0, year: 1300 }; // new game time
    }
    return parse(timeStr) as { week: number; year: number };
  }

  toCheckpointData() {
    return {
      week: this.week,
      year: this.year,
    };
  }

  fromCheckpointData(data: any) {
    this.week = data.week;
    this.year = data.year;
  }
}
