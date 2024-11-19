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
    });

    reaction(
      () => [this.week, this.year],
      () =>
        storage.set("time", stringify({ week: this.week, year: this.year })),
    );
  }

  tick() {
    if (this.week == 51) {
      this.year++;
      this.week = 0;
    } else {
      this.week++;
    }
  }

  get currentDate() {
    return { year: this.year, week: this.week };
  }

  calculateAge({
    birthYear,
    birthWeek,
  }: {
    birthYear: number;
    birthWeek: number;
  }): number {
    const yearDiff = this.year - birthYear;
    const weekDiff = this.week - birthWeek;

    if (weekDiff < 0) {
      return yearDiff - 1;
    }

    return yearDiff;
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
}
