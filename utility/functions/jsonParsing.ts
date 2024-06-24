import { SpellError } from "../errorTypes";
import { MasteryLevel, Spell } from "../types";

const masteryConversion = (asString: string) => {
  switch (asString) {
    case "novice":
      return MasteryLevel.Novice;
    case "apprentice":
      return MasteryLevel.Adept;
    case "adept":
      return MasteryLevel.Adept;
    case "expert":
      return MasteryLevel.Expert;
    case "master":
      return MasteryLevel.Master;
    case "legend":
      return MasteryLevel.Legend;
    default:
      return SpellError.InvalidMastery;
  }
};
export function parseSpell(json: any): Spell {
  const mastery = masteryConversion(json.proficiencyNeeded);
  if (mastery == SpellError.InvalidMastery) {
    throw Error(
      `Attempt to make incorrect from: ${json.proficiencyNeeded},\nSpell Name:${json.name}`,
    );
  }
  return {
    name: json.name,
    element: json.element,
    proficiencyNeeded: mastery,
    manaCost: json.manaCost,
    duration: json.duration,
    effects: {
      damage: json.effects.damage ?? undefined,
      buffs: json.effects.buffs ?? undefined,
      debuffs: json.effects.debuffs ?? undefined,
      summon: json.effects.summon ?? undefined,
      selfDamage: json.effects.selfDamage ?? undefined,
    },
  };
}
