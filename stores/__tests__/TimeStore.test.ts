import { RootStore } from "../RootStore";
import { TimeStore } from "../TimeStore";

describe("TimeStore", () => {
  let timeStore: TimeStore;
  let mockRootStore: RootStore;

  beforeEach(() => {
    mockRootStore = {} as RootStore;
    timeStore = new TimeStore({ root: mockRootStore });
  });

  test("initialization", () => {
    expect(timeStore.week).toBeDefined();
    expect(timeStore.year).toBeDefined();
  });

  test("tick", () => {
    const initialWeek = timeStore.week;
    const initialYear = timeStore.year;

    timeStore.tick();

    if (initialWeek === 51) {
      expect(timeStore.week).toBe(0);
      expect(timeStore.year).toBe(initialYear + 1);
    } else {
      expect(timeStore.week).toBe(initialWeek + 1);
      expect(timeStore.year).toBe(initialYear);
    }
  });

  test("currentDate", () => {
    const date = timeStore.currentDate;
    expect(date).toEqual({ year: timeStore.year, week: timeStore.week });
  });

  test("generateBirthDateInRange", () => {
    const minAge = 20;
    const maxAge = 30;
    const birthDate = timeStore.generateBirthDateInRange(minAge, maxAge);

    expect(birthDate.year).toBeGreaterThanOrEqual(timeStore.year - maxAge);
    expect(birthDate.year).toBeLessThanOrEqual(timeStore.year - minAge);
    expect(birthDate.week).toBeGreaterThanOrEqual(0);
    expect(birthDate.week).toBeLessThan(52);
  });

  test("generateBirthDateForAge", () => {
    const targetAge = 25;
    const birthDate = timeStore.generateBirthDateForAge(targetAge);

    expect(birthDate.year).toBeGreaterThanOrEqual(
      timeStore.year - targetAge - 1,
    );
    expect(birthDate.year).toBeLessThanOrEqual(timeStore.year - targetAge);
    expect(birthDate.week).toBeGreaterThanOrEqual(0);
    expect(birthDate.week).toBeLessThan(52);
  });
});
