import { action, computed, makeObservable, observable } from "mobx";
import { RootStore } from "./RootStore";

export class TimeStore {
  week: number;
  year: number;
  root: RootStore;

  constructor({
    week,
    year,
    root,
  }: {
    week: number;
    year: number;
    root: RootStore;
  }) {
    this.week = week;
    this.year = year;
    this.root = root;

    makeObservable(this, {
      week: observable,
      year: observable,
      tick: action,
      currentDate: computed,
    });
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

  generateBirthDateForAge(age: number) {
    const year = this.year - age;
    const week = Math.floor(Math.random() * 52);

    return { year, week };
  }

  generateBirthDateInRange(minYear: number, maxYear: number) {
    const year = minYear + Math.floor(Math.random() * (maxYear - minYear + 1));
    const week = Math.floor(Math.random() * 52);

    return { year, week };
  }

  static fromJSON(json: any): TimeStore {
    return new TimeStore({ week: json.week, year: json.year, root: json.root });
  }
}
