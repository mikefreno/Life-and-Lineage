import { Element, PlayerClassOptions } from "./types";

export const DescriptionMap: Record<Element, string> = {
  [Element.fire]:
    "The School of Fire has its focus in all out damage, fire spells hit hard, and can leave enemies burnt.",
  [Element.water]:
    "The School of Water focuses on healing the caster and freezing opponents, at the highest levels it can even give the caster control over their enemies.",
  [Element.air]:
    "The School of Air channels lightning and terrifying winds, these spells can debilitate and defend.",
  [Element.earth]:
    "The School of Earth believes in defense. Prevent your enemies from moving and coat yourself in armor of stones.",
  [Element.summoning]:
    "With Summoning, you will bend the undead to your will, overwhelm your enemies.",
  [Element.pestilence]:
    "With Pesitilence, you will control an unseen force to cripple your enemies, or destroy them from within.",
  [Element.bone]: "With Bone, you will shield yourself or destroy your foes.",
  [Element.blood]:
    "With Blood, you will control the life force of enemies and yourself, sacrifice for ultimate power.",
  [Element.holy]:
    "The Holy School focus on channeling the force of light and life, to heal and repel death.",
  [Element.vengeance]:
    "The School of Vengeance focuses on amplifying the strength of weapons and turning the opponents strength against them.",
  [Element.protection]:
    "With Protection, you will shield yourself and others, become invulnerable.",
  [Element.beastMastery]:
    "The Beast Master controls the wilds will traps and allied beasts.",
  [Element.assassination]:
    "The School of Assassination focuses of killing before being seen.",
  [Element.arcane]:
    "The School of Arcane modifies archery with pure arcane magic.",
};

export const ClassDescriptionMap: Record<PlayerClassOptions, string> = {
  mage: `The Mage is the "default" class, it is well balanced, with a focus on casting elemental magic`,
  paladin:
    "The Paladin is skilled with arms and uses holy magic, which is especially powerful against the undead and protecting life.",
  necromancer:
    "The Necromancer controls the forces of death, they can summon minions, use blood, bone and poisonous magics.",
  ranger:
    "The Ranger has extreme versatility, a master at archery, assassination and commanding beasts",
};
