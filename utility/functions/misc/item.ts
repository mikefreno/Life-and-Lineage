import artifacts from "../../../assets/json/items/artifacts.json";
import arrows from "../../../assets/json/items/arrows.json";
import bows from "../../../assets/json/items/bows.json";
import bodyArmor from "../../../assets/json/items/bodyArmor.json";
import mageBooks from "../../../assets/json/items/mageBooks.json";
import necroBooks from "../../../assets/json/items/necroBooks.json";
import paladinBooks from "../../../assets/json/items/paladinBooks.json";
import rangerBooks from "../../../assets/json/items/rangerBooks.json";
import foci from "../../../assets/json/items/foci.json";
import hats from "../../../assets/json/items/hats.json";
import helmets from "../../../assets/json/items/helmets.json";
import ingredients from "../../../assets/json/items/ingredients.json";
import junk from "../../../assets/json/items/junk.json";
import poison from "../../../assets/json/items/poison.json";
import potions from "../../../assets/json/items/potions.json";
import robes from "../../../assets/json/items/robes.json";
import shields from "../../../assets/json/items/shields.json";
import staves from "../../../assets/json/items/staves.json";
import weapons from "../../../assets/json/items/weapons.json";
import wands from "../../../assets/json/items/wands.json";
import { ItemClassType, PlayerClassOptions } from "../../types";

export function getItemJSONMap(
  playerClass: PlayerClassOptions,
): Record<ItemClassType, any[]> {
  return {
    artifact: artifacts,
    arrow: arrows,
    bodyArmor: bodyArmor,
    book:
      {
        mage: mageBooks,
        paladin: paladinBooks,
        necromancer: necroBooks,
        ranger: rangerBooks,
      }[playerClass] || mageBooks,
    bow: bows,
    focus: foci,
    hat: hats,
    helmet: helmets,
    ingredient: ingredients,
    junk: junk,
    poison: poison,
    potion: potions,
    robe: robes,
    staff: staves,
    shield: shields,
    wand: wands,
    weapon: weapons,
  };
}
