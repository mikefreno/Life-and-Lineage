import { ExternalPathString } from "expo-router";

export type CodexEntry = {
  id: string;
  title: string;
  category: string;
  subcategory?: string;
  content: string;
  tags: string[];
  route: ExternalPathString;
};

export function searchCodex(searchTerm: string): CodexEntry[] {
  const lowercasedTerm = searchTerm.toLowerCase();

  const results = codexData.filter(
    (entry) =>
      entry.title.toLowerCase().includes(lowercasedTerm) ||
      entry.content.toLowerCase().includes(lowercasedTerm) ||
      entry.tags.some((tag) => tag.toLowerCase().includes(lowercasedTerm)),
  );

  const rankedResults = results.map((entry) => {
    let score = 0;

    if (entry.title.toLowerCase().includes(lowercasedTerm)) {
      score += 3;
    }

    if (entry.title.toLowerCase().startsWith(lowercasedTerm)) {
      score += 5;
    }

    if (entry.content.toLowerCase().includes(lowercasedTerm)) {
      score += 1;
    }

    const tagMatches = entry.tags.filter((tag) =>
      tag.toLowerCase().includes(lowercasedTerm),
    ).length;
    score += tagMatches * 2;

    if (entry.subcategory) {
      score += 2;
    }

    return { entry, score };
  });

  rankedResults.sort((a, b) => b.score - a.score);

  return rankedResults.map((result) => result.entry);
}

export const codexData: CodexEntry[] = [
  // --- Time ---
  {
    id: "time-overview",
    title: "Time",
    category: "Time",
    content:
      "Nearly every action in Life and Lineage advances the game clock by 1 week, aging every character. This happens when working, receiving medical services, talking to characters, collecting from investments, or leaving a dungeon. Aging increases the chance of gaining Conditions starting at age 45.",
    tags: ["time", "aging", "game clock", "conditions"],
    route: "/Options/Codex/Time",
  },

  // --- Conditions ---
  {
    id: "condition-overview",
    title: "Conditions & Debilitations",
    category: "Conditions",
    content:
      "Conditions are temporary effects from attacks, low sanity, or old age. They tick each combat turn or game time tick. Debilitations are permanent, unique conditions often gained from old age.",
    tags: [
      "conditions",
      "combat",
      "effects",
      "status",
      "debuffs",
      "debilitations",
      "aging",
      "sanity",
    ],
    route: "/Options/Codex/Conditions",
  },
  // Placeholder for specific Debilitation page if needed later
  // {
  //   id: "condition-debilitation",
  //   title: "Debilitations",
  //   category: "Conditions",
  //   subcategory: "Types",
  //   content: "Debilitations are permanent, unique conditions, often gained from old age, with severe effects.",
  //   tags: ["debilitations", "permanent", "aging", "conditions"],
  //   route: "/Options/Codex/Conditions/Debilitation", // Matches link in TimeCodex
  // },

  // --- Player & Classes ---
  {
    id: "player-overview",
    title: "Player Classes Overview",
    category: "Player",
    content:
      "The player has 4 potential classes: The Mage, The Necromancer, The Paladin, and The Ranger. Each class has unique magic schools. Magic of any school can be learned by a player of the parent class.",
    tags: ["classes", "magic", "overview", "player", "progression"],
    route: "/Options/Codex/Player",
  },
  {
    id: "player-mage",
    title: "Mage Class",
    category: "Player",
    subcategory: "Classes",
    content:
      "The Mage is a master of elemental magic, commanding Fire, Water, Earth, and Air.",
    tags: ["mage", "wizard", "elemental", "fire", "water", "earth", "air"],
    route: "/Options/Codex/Player/Mage",
  },
  {
    id: "player-necromancer",
    title: "Necromancer Class",
    category: "Player",
    subcategory: "Classes",
    content:
      "The Necromancer uses dark magic, specializing in Blood, Pestilence, Bone, and Summoning.",
    tags: [
      "necromancer",
      "dark magic",
      "blood",
      "pestilence",
      "bone",
      "summoning",
      "undead",
    ],
    route: "/Options/Codex/Player/Necromancer",
  },
  {
    id: "player-paladin",
    title: "Paladin Class",
    category: "Player",
    subcategory: "Classes",
    content:
      "The Paladin wields holy power through Protection, Vengeance, and Holy magic.",
    tags: ["paladin", "holy", "protection", "vengeance", "divine", "tank"],
    route: "/Options/Codex/Player/Paladin",
  },
  {
    id: "player-ranger",
    title: "Ranger Class",
    category: "Player",
    subcategory: "Classes",
    content:
      "The Ranger combines nature and stealth, using Beast Mastery, Arcane, and Assassination techniques.",
    tags: [
      "ranger",
      "beast master",
      "arcane",
      "assassination",
      "stealth",
      "bow",
    ],
    route: "/Options/Codex/Player/Ranger",
  },

  // --- Magic & Schools ---
  {
    id: "magic-overview",
    title: "Magic & Proficiency",
    category: "Magic",
    content:
      "Magic is learned skill tied to schools specific to your class. Gaining access to stronger spells requires using known spells to gain Proficiency (Novice → Apprentice → Adept → Expert → Master → Legend). You cannot learn/use spells of a higher proficiency than your current rank in that school.",
    tags: [
      "magic",
      "spells",
      "proficiency",
      "learning",
      "schools",
      "progression",
    ],
    route: "/Options/Codex/Magic", // Added route for general magic overview
  },
  // Mage Schools
  {
    id: "magic-fire",
    title: "Fire Magic",
    category: "Magic",
    subcategory: "Mage Schools",
    content: "Fire magic focuses on dealing damage and area control.",
    tags: ["fire", "mage", "damage", "elemental", "aoe"],
    route: "/Options/Codex/Player/Fire",
  },
  {
    id: "magic-water",
    title: "Water Magic",
    category: "Magic",
    subcategory: "Mage Schools",
    content: "Water magic specializes in healing and defensive abilities.",
    tags: ["water", "mage", "healing", "defense", "elemental", "support"],
    route: "/Options/Codex/Player/Water",
  },
  {
    id: "magic-earth",
    title: "Earth Magic",
    category: "Magic",
    subcategory: "Mage Schools",
    content: "Earth magic provides defensive and crowd control capabilities.",
    tags: ["earth", "mage", "defense", "elemental", "control", "tank"],
    route: "/Options/Codex/Player/Earth",
  },
  {
    id: "magic-air",
    title: "Air Magic",
    category: "Magic",
    subcategory: "Mage Schools",
    content: "Air magic offers mobility and ranged attack options.",
    tags: ["air", "mage", "mobility", "elemental", "ranged", "damage"],
    route: "/Options/Codex/Player/Air",
  },
  // Necromancer Schools
  {
    id: "magic-blood",
    title: "Blood Magic",
    category: "Magic",
    subcategory: "Necromancer Schools",
    content:
      "Blood magic harnesses life force for powerful effects, often at a cost.",
    tags: [
      "blood",
      "necromancer",
      "life force",
      "dark magic",
      "damage",
      "sacrifice",
    ],
    route: "/Options/Codex/Player/Blood",
  },
  {
    id: "magic-pestilence",
    title: "Pestilence Magic",
    category: "Magic",
    subcategory: "Necromancer Schools",
    content:
      "Pestilence magic spreads disease and decay, often dealing damage over time.",
    tags: [
      "pestilence",
      "necromancer",
      "disease",
      "decay",
      "dot",
      "dark magic",
    ],
    route: "/Options/Codex/Player/Pestilence",
  },
  {
    id: "magic-bone",
    title: "Bone Magic",
    category: "Magic",
    subcategory: "Necromancer Schools",
    content:
      "Bone magic manipulates skeletal remains for shields, prisons, or projectiles.",
    tags: [
      "bone",
      "necromancer",
      "skeletal",
      "defense",
      "control",
      "dark magic",
    ],
    route: "/Options/Codex/Player/Bone",
  },
  {
    id: "magic-summoning",
    title: "Summoning Magic",
    category: "Magic",
    subcategory: "Necromancer Schools",
    content:
      "Summoning magic calls forth undead minions to fight alongside the Necromancer.",
    tags: [
      "summoning",
      "necromancer",
      "undead",
      "minions",
      "pets",
      "dark magic",
    ],
    route: "/Options/Codex/Player/Summoning", // Corrected route from Summoner
  },
  // Paladin Schools
  {
    id: "magic-protection",
    title: "Protection Magic",
    category: "Magic",
    subcategory: "Paladin Schools",
    content:
      "Protection magic focuses on defense, shielding allies, and mitigating damage.",
    tags: [
      "protection",
      "paladin",
      "defense",
      "shield",
      "holy",
      "tank",
      "support",
    ],
    route: "/Options/Codex/Player/Protection",
  },
  {
    id: "magic-holy",
    title: "Holy Magic",
    category: "Magic",
    subcategory: "Paladin Schools",
    content:
      "Holy magic channels divine power for healing, smiting enemies, and buffs.",
    tags: [
      "holy",
      "paladin",
      "divine",
      "healing",
      "damage",
      "buffs",
      "support",
    ],
    route: "/Options/Codex/Player/Holy",
  },
  {
    id: "magic-vengeance",
    title: "Vengeance Magic",
    category: "Magic",
    subcategory: "Paladin Schools",
    content:
      "Vengeance magic focuses on retaliatory damage, punishing attackers.",
    tags: [
      "vengeance",
      "paladin",
      "counterattack",
      "retaliation",
      "damage",
      "holy",
    ],
    route: "/Options/Codex/Player/Vengeance",
  },
  // Ranger Schools
  {
    id: "magic-beast-mastery",
    title: "Beast Mastery",
    category: "Magic", // Or could be 'Skills' depending on game terminology
    subcategory: "Ranger Schools",
    content:
      "Beast Mastery allows summoning, commanding, and cooperating with animal companions.",
    tags: [
      "beast mastery",
      "ranger",
      "animals",
      "pets",
      "summoning",
      "companions",
    ],
    route: "/Options/Codex/Player/BeastMastery",
  },
  {
    id: "magic-assassination",
    title: "Assassination",
    category: "Magic", // Or 'Skills'
    subcategory: "Ranger Schools",
    content:
      "Assassination focuses on stealth, critical strikes, poisons, and debuffs.",
    tags: [
      "assassination",
      "ranger",
      "stealth",
      "critical",
      "damage",
      "poison",
      "debuffs",
    ],
    route: "/Options/Codex/Player/Assassination",
  },
  {
    id: "magic-arcane",
    title: "Arcane Magic (Ranger)",
    category: "Magic",
    subcategory: "Ranger Schools",
    content:
      "Arcane magic enhances the Ranger's arrows and abilities with mystical power.",
    tags: [
      "arcane",
      "ranger",
      "mystical",
      "enhancement",
      "magic arrow",
      "utility",
    ],
    route: "/Options/Codex/Player/Arcane",
  },

  // --- Gear ---
  {
    id: "gear-basics",
    title: "Gear Basics",
    category: "Gear",
    content:
      "Gear (equipable items) combines 3 factors: Bases (item type with base stats/requirements), Rarity (Normal, Magic, Rare), and Affixes (Prefixes for attributes/defense, Suffixes for offense). Magic items have one affix, Rare items have two.",
    tags: [
      "equipment",
      "items",
      "basics",
      "gear",
      "armor",
      "weapons",
      "rarity",
      "affixes",
      "prefixes",
      "suffixes",
    ],
    route: "/Options/Codex/Gear",
  },

  // --- Labor ---
  {
    id: "labor-overview",
    title: "Labor System",
    category: "Labor",
    content:
      "Labors are a way to earn gold, but advance game time. Some jobs require qualifications, which can be gained via Education (which may cost sanity). Be careful not to let life pass you by!",
    tags: [
      "jobs",
      "gold",
      "money",
      "work",
      "labor",
      "time",
      "qualifications",
      "education",
      "sanity",
    ],
    route: "/Options/Codex/Labor",
  },

  // --- Relationships ---
  //{
  //id: "relationships-overview",
  //title: "Relationships System",
  //category: "Relationships",
  //content: "You can meet new people and build relationships through various activities.",
  //tags: ["social", "npc", "friendship", "romance", "activities", "people"],
  //route: "/Options/Codex/Relationships",
  //},

  // --- Combat ---
  {
    id: "combat-overview",
    title: "Combat System",
    category: "Combat",
    content:
      "Combat is turn-based. Prepare with gear and spells. Damage is elemental (Physical, Fire, Water, Air, Earth, Poison, Holy, Raw). Raw damage ignores resistance and scales with your highest power (Attack or Magic). Select targets for single-target attacks if multiple enemies exist. You, then minions/pets act, followed by enemies. Fleeing is possible, chance based on dungeon difficulty and Dexterity.",
    tags: [
      "fighting",
      "battles",
      "dungeon",
      "combat",
      "turn-based",
      "damage types",
      "elemental",
      "raw damage",
      "targeting",
      "fleeing",
      "preparation",
    ],
    route: "/Options/Codex/Combat",
  },

  // --- Dungeon ---
  {
    id: "dungeon-overview",
    title: "Dungeons",
    category: "Dungeon",
    content:
      "Dungeons are the core gameplay loop, consisting of multiple floors with increasing difficulty. Clearing a floor's boss unlocks the next floor or dungeon, potentially providing rewards like Investments. Floors are randomized mazes with combat encounters (normal/boss) and Special Encounters (non-combat events with varying outcomes). A Training Grounds is available to test builds.",
    tags: [
      "dungeon",
      "floors",
      "bosses",
      "maze",
      "combat",
      "special encounters",
      "rewards",
      "training grounds",
      "exploration",
    ],
    route: "/Options/Codex/Dungeon", // Added entry for DungeonCodex
  },

  // --- Stats ---
  {
    id: "stats-overview",
    title: "Stats",
    category: "Stats",
    content:
      "Primary stats: Health (survival), Mana (spellcasting), Sanity (mental state, low/negative causes conditions/death). Secondary stats: Strength (melee gear/damage), Dexterity (bows, physical damage, crit, dodge, flee), Intelligence (magic gear/damage), Regen (mana recovery per combat turn). Derived stats: Attack Power (from Str/Dex), Magic Power (from Int). Stats are affected by Gear and Conditions.",
    tags: [
      "stats",
      "attributes",
      "health",
      "mana",
      "sanity",
      "strength",
      "dexterity",
      "intelligence",
      "regen",
      "attack power",
      "magic power",
      "character",
      "progression",
    ],
    route: "/Options/Codex/Stats", // Added entry for StatsCodex
  },

  // --- Investments ---
  {
    id: "investments-overview",
    title: "Investments",
    category: "Investing",
    content:
      "Investments, unlocked by clearing dungeons, generate gold over time when collected (advances game time). They have upgrades, some straightforward (increase yield), others complex (mutually exclusive choices, potential Sanity costs for morally questionable options).",
    tags: [
      "investing",
      "gold",
      "money",
      "passive income",
      "upgrades",
      "time",
      "sanity",
      "economy",
    ],
    route: "/Options/Codex/Investment", // Added entry for InvestmentsCodex
  },

  // --- Shops ---
  //{
  //id: "shops-overview",
  //title: "Shops",
  //category: "Shops",
  //content: "Various shops exist where you can buy and sell items. (Details TBD)", // Placeholder content
  //tags: ["shops", "vendors", "buying", "selling", "items", "economy", "trade"],
  //route: "/Options/Codex/Shops", // Added placeholder entry for ShopsCodex
  //},

  // --- PvP ---
  //{
  //id: "pvp-overview",
  //title: "Player vs Player (PvP)",
  //category: "PvP",
  //content: "Engage in combat against other players. (Coming Soon)", // Placeholder content
  //tags: ["pvp", "player versus player", "combat", "multiplayer", "coming soon"],
  //route: "/Options/Codex/PvP", // Added placeholder entry for PvPCodex
  //},
];
