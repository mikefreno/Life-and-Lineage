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

  // First, get all matching results
  const results = codexData.filter(
    (entry) =>
      entry.title.toLowerCase().includes(lowercasedTerm) ||
      entry.content.toLowerCase().includes(lowercasedTerm) ||
      entry.tags.some((tag) => tag.toLowerCase().includes(lowercasedTerm)),
  );

  // Then, rank the results
  const rankedResults = results.map((entry) => {
    let score = 0;

    // Higher score for exact matches in title
    if (entry.title.toLowerCase().includes(lowercasedTerm)) {
      score += 3;
    }

    // Even higher score for starts-with matches in title
    if (entry.title.toLowerCase().startsWith(lowercasedTerm)) {
      score += 5;
    }

    // Score for matches in content
    if (entry.content.toLowerCase().includes(lowercasedTerm)) {
      score += 1;
    }

    // Score for matches in tags
    const tagMatches = entry.tags.filter((tag) =>
      tag.toLowerCase().includes(lowercasedTerm),
    ).length;
    score += tagMatches * 2;

    // Boost score for more specific entries (those with subcategories)
    if (entry.subcategory) {
      score += 2;
    }

    return { entry, score };
  });

  // Sort by score in descending order
  rankedResults.sort((a, b) => b.score - a.score);

  // Return only the entries, not the scores
  return rankedResults.map((result) => result.entry);
}

export const codexData: CodexEntry[] = [
  // Player Category
  {
    id: "player-overview",
    title: "Player Classes Overview",
    category: "Player",
    content:
      "The player has 4 potential classes: The Mage, The Necromancer, The Paladin, and The Ranger. Each of these has schools, each housing different styles of magic.",
    tags: ["classes", "magic", "overview"],
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
    tags: ["paladin", "holy", "protection", "vengeance"],
    route: "/Options/Codex/Player/Paladin",
  },
  {
    id: "player-ranger",
    title: "Ranger Class",
    category: "Player",
    subcategory: "Classes",
    content:
      "The Ranger combines nature and stealth, using Beast Mastery, Arcane, and Assassination techniques.",
    tags: ["ranger", "beast master", "arcane", "assassination"],
    route: "/Options/Codex/Player/Ranger",
  },

  // Magic Schools
  {
    id: "magic-fire",
    title: "Fire Magic",
    category: "Magic",
    subcategory: "Mage Schools",
    content: "Fire magic focuses on dealing damage and area control.",
    tags: ["fire", "mage", "damage", "elemental"],
    route: "/Options/Codex/Player/Fire",
  },
  {
    id: "magic-water",
    title: "Water Magic",
    category: "Magic",
    subcategory: "Mage Schools",
    content: "Water magic specializes in healing and defensive abilities.",
    tags: ["water", "mage", "healing", "elemental"],
    route: "/Options/Codex/Player/Water",
  },
  {
    id: "magic-earth",
    title: "Earth Magic",
    category: "Magic",
    subcategory: "Mage Schools",
    content: "Earth magic provides defensive and crowd control capabilities.",
    tags: ["earth", "mage", "defense", "elemental"],
    route: "/Options/Codex/Player/Earth",
  },
  {
    id: "magic-air",
    title: "Air Magic",
    category: "Magic",
    subcategory: "Mage Schools",
    content: "Air magic offers mobility and ranged attack options.",
    tags: ["air", "mage", "mobility", "elemental"],
    route: "/Options/Codex/Player/Air",
  },

  // Necromancer Schools
  {
    id: "magic-blood",
    title: "Blood Magic",
    category: "Magic",
    subcategory: "Necromancer Schools",
    content: "Blood magic harnesses life force for powerful effects.",
    tags: ["blood", "necromancer", "life force"],
    route: "/Options/Codex/Player/Blood",
  },
  {
    id: "magic-pestilence",
    title: "Pestilence Magic",
    category: "Magic",
    subcategory: "Necromancer Schools",
    content: "Pestilence magic spreads disease and decay.",
    tags: ["pestilence", "necromancer", "disease", "decay"],
    route: "/Options/Codex/Player/Pestilence",
  },
  {
    id: "magic-bone",
    title: "Bone Magic",
    category: "Magic",
    subcategory: "Necromancer Schools",
    content: "Bone magic manipulates skeletal remains for various purposes.",
    tags: ["bone", "necromancer", "skeletal"],
    route: "/Options/Codex/Player/Bone",
  },
  {
    id: "magic-summoning",
    title: "Summoning Magic",
    category: "Magic",
    subcategory: "Necromancer Schools",
    content: "Summoning magic calls forth undead minions.",
    tags: ["summoning", "necromancer", "undead"],
    route: "/Options/Codex/Player/Summoner",
  },

  // Paladin Schools
  {
    id: "magic-protection",
    title: "Protection Magic",
    category: "Magic",
    subcategory: "Paladin Schools",
    content: "Protection magic focuses on defense and shielding.",
    tags: ["protection", "paladin", "defense", "shield"],
    route: "/Options/Codex/Player/Protection",
  },
  {
    id: "magic-holy",
    title: "Holy Magic",
    category: "Magic",
    subcategory: "Paladin Schools",
    content: "Holy magic channels divine power for various effects.",
    tags: ["holy", "paladin", "divine"],
    route: "/Options/Codex/Player/Holy",
  },
  {
    id: "magic-vengeance",
    title: "Vengeance Magic",
    category: "Magic",
    subcategory: "Paladin Schools",
    content: "Vengeance magic turns damage taken into powerful counterattacks.",
    tags: ["vengeance", "paladin", "counterattack"],
    route: "/Options/Codex/Player/Vengeance",
  },

  // Ranger Schools
  {
    id: "magic-beast-mastery",
    title: "Beast Mastery",
    category: "Magic",
    subcategory: "Ranger Schools",
    content: "Beast Mastery allows control and cooperation with animals.",
    tags: ["beast mastery", "ranger", "animals"],
    route: "/Options/Codex/Player/BeastMastery",
  },
  {
    id: "magic-assassination",
    title: "Assassination",
    category: "Magic",
    subcategory: "Ranger Schools",
    content: "Assassination focuses on stealth and critical strikes.",
    tags: ["assassination", "ranger", "stealth"],
    route: "/Options/Codex/Player/Assassination",
  },
  {
    id: "magic-arcane",
    title: "Arcane",
    category: "Magic",
    subcategory: "Ranger Schools",
    content:
      "Arcane magic enhances the Ranger's abilities with mystical power.",
    tags: ["arcane", "ranger", "mystical"],
    route: "/Options/Codex/Player/Arcane",
  },

  // Gear Category
  {
    id: "gear-basics",
    title: "Gear Basics",
    category: "Gear",
    content:
      "At its core, gear (equipable items) is the culmination of 3 factors: bases (which are the specific item variant), rarity ('Normal', 'Magic' or 'Rare') and affixes.",
    tags: ["equipment", "items", "basics"],
    route: "/Options/Codex/Gear",
  },

  // Labor Category
  {
    id: "labor-overview",
    title: "Labor System",
    category: "Labor",
    content:
      "Labors are a way to earn gold in a (mostly) safe way. There are a number of jobs you can take, some require no qualifications, but most have some.",
    tags: ["jobs", "gold", "money", "work"],
    route: "/Options/Codex/Labor",
  },

  // Relationships Category
  {
    id: "relationships-overview",
    title: "Relationships System",
    category: "Relationships",
    content: "You can meet new people through various activities.",
    tags: ["social", "npc", "friendship"],
    route: "/Options/Codex/Relationships",
  },

  // Combat Category
  {
    id: "combat-overview",
    title: "Combat System",
    category: "Combat",
    content:
      "Combat involves various types of attacks and equipment management.",
    tags: ["fighting", "battles", "dungeon"],
    route: "/Options/Codex/Combat",
  },
];
