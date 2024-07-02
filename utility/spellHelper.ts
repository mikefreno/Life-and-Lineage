import { MasteryLevel } from "./types";

export function getMasteryLevel(
  proficiency: number,
  asString: boolean = false,
): MasteryLevel | string {
  if (asString) {
    if (proficiency >= 500) {
      return "Legend";
    }
    if (proficiency >= 350) {
      return "Master";
    }
    if (proficiency >= 250) {
      return "Expert";
    }
    if (proficiency >= 150) {
      return "Adept";
    }
    if (proficiency >= 50) {
      return "Apprentice";
    }
    return "Novice";
  }
  if (proficiency >= 500) {
    return MasteryLevel.Legend;
  }
  if (proficiency >= 350) {
    return MasteryLevel.Master;
  }
  if (proficiency >= 250) {
    return MasteryLevel.Expert;
  }
  if (proficiency >= 150) {
    return MasteryLevel.Adept;
  }
  if (proficiency >= 50) {
    return MasteryLevel.Apprentice;
  }
  return MasteryLevel.Novice;
}

type MasteryNumberConversion = {
  [key in MasteryLevel]: number;
};

export const convertMasteryToNumber: MasteryNumberConversion = {
  [MasteryLevel.Novice]: 0,
  [MasteryLevel.Apprentice]: 50,
  [MasteryLevel.Adept]: 100,
  [MasteryLevel.Expert]: 250,
  [MasteryLevel.Master]: 350,
  [MasteryLevel.Legend]: 500,
};

type MasteryStringConversion = {
  [key in MasteryLevel]: string;
};

export const convertMasteryToString: MasteryStringConversion = {
  [MasteryLevel.Novice]: "Novice",
  [MasteryLevel.Apprentice]: "Apprentice",
  [MasteryLevel.Adept]: "Adept",
  [MasteryLevel.Expert]: "Expert",
  [MasteryLevel.Master]: "Master",
  [MasteryLevel.Legend]: "Legend",
};
