import { action, computed, makeObservable, observable, reaction } from "mobx";
import { RootStore } from "@/stores/RootStore";
import { storage } from "@/utility/functions/storage";
import { parse, stringify } from "flatted";

export enum Season {
  WINTER = "winter",
  SPRING = "spring",
  SUMMER = "summer",
  AUTUMN = "autumn",
}

export class TimeStore {
  week: number;
  year: number;
  root: RootStore;

  constructor({ root }: { root: RootStore }) {
    const { week, year } = this.hydrate();
    this.week = week;
    this.year = year;
    this.root = root;

    __DEV__ && this.setupDevActions();

    makeObservable(this, {
      week: observable,
      year: observable,

      tick: action,
      fromCheckpointData: action,
      devSetter: action,

      currentMonth: computed,
      currentDate: computed,
    });

    reaction(
      () => [this.week, this.year],
      () =>
        storage.set("time", stringify({ week: this.week, year: this.year })),
    );
  }

  private setupDevActions() {
    this.root.addDevAction([
      {
        action: (value: number) => this.devSetter("year", value),
        name: "Set Game Year",
        min: 1_300,
        max: 2_000,
        step: 1,
        initVal: this.year,
      },
      {
        action: (value: number) => this.devSetter("week", value),
        name: "Set Game Week",
        max: 51,
        step: 1,
        initVal: this.week,
      },
    ]);
  }

  tick() {
    this.week = (this.week + 1) % 52;
    if (this.week === 0) this.year++;
  }

  devSetter(field: "year" | "week", value: number) {
    if (__DEV__) {
      if (field == "year") {
        this.year = value;
      } else if (field == "week") {
        this.week = value;
      }
    }
  }

  get currentDate() {
    return { year: this.year, week: this.week };
  }

  get currentMonth(): string {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const monthStartWeeks = [0, 4, 9, 13, 17, 22, 26, 30, 35, 39, 43, 48];

    let monthIndex = 0;
    for (let i = 1; i < monthStartWeeks.length; i++) {
      if (this.week >= monthStartWeeks[i]) {
        monthIndex = i;
      } else {
        break;
      }
    }

    return months[monthIndex];
  }

  get currentSeason() {
    if (this.week >= 9 && this.week <= 21) {
      return Season.SPRING;
    } else if (this.week >= 22 && this.week <= 34) {
      return Season.SUMMER;
    } else if (this.week >= 35 && this.week <= 47) {
      return Season.AUTUMN;
    } else {
      return Season.WINTER;
    }
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
    if (!data) {
      console.warn("Time data is undefined in checkpoint");
      return;
    }

    // Ensure we have valid data before setting properties
    if (typeof data.week === "number" && typeof data.year === "number") {
      this.week = data.week;
      this.year = data.year;
    } else {
      console.warn("Invalid time data in checkpoint, using defaults");
      this.week = 0;
      this.year = 1300;
    }
  }
}
