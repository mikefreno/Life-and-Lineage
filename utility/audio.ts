export const TrackMap = {
  AcrossTheMarsh: require("@/assets/SoundTrack/AcrossTheMarsh.m4a"),
  ADarkPassage: require("@/assets/SoundTrack/ADarkPassage.m4a"),
  AnEeriePassageI: require("@/assets/SoundTrack/AnEeriePassageI.m4a"),
  AnEeriePassageII: require("@/assets/SoundTrack/AnEeriePassageII.m4a"),
  AGE_MIDDLE: require("@/assets/SoundTrack/AGE_MIDDLE.m4a"),
  AGE_OLD: require("@/assets/SoundTrack/AGE_OLD.m4a"),
  AGE_YOUNG: require("@/assets/SoundTrack/AGE_YOUNG.m4a"),
  ARoguesEndeavor: require("@/assets/SoundTrack/ARoguesEndeavor.m4a"),
  ASunlessPassageI: require("@/assets/SoundTrack/ASunlessPassageI.m4a"),
  ASunlessPassageII: require("@/assets/SoundTrack/ASunlessPassageII.m4a"),
  ASunlessPassageIII: require("@/assets/SoundTrack/ASunlessPassageIII.m4a"),
  Battlefield: require("@/assets/SoundTrack/Battlefield(loop)(130).m4a"),
  Campfire: require("@/assets/SoundTrack/Campfire.m4a"),
  Cursed: require("@/assets/SoundTrack/Cursed.m4a"),
  DreamsOfBeltane: require("@/assets/SoundTrack/DreamsOfBeltane.m4a"),
  ExploringTheDungeonI: require("@/assets/SoundTrack/ExploringTheDungeonI.m4a"),
  FinalBattle: require("@/assets/SoundTrack/FinalBattle.m4a"),
  IronWorks: require("@/assets/SoundTrack/Ironworks.m4a"),
  Nocturne: require("@/assets/SoundTrack/Nocturne.m4a"),
  PianoInterludeII: require("@/assets/SoundTrack/PianoInterludeII.m4a"),
  TheAncientForest: require("@/assets/SoundTrack/TheAncientForest.m4a"),
  TheDepthsOfEarth: require("@/assets/SoundTrack/TheDepthsOfEarth.m4a"),
  TheOldAlley: require("@/assets/SoundTrack/TheOldAlley.m4a"),
  WieldingSword: require("@/assets/SoundTrack/WieldingSword.m4a"),
};

export type TrackType = "dungeon" | "ambient" | "sfx";

export type TrackName = keyof typeof TrackMap;

export type DungeonTrackDef = {
  general: TrackName[];
  finalBossTrack?: TrackName;
};

export const AgeBasedSoundTrack: TrackName[] = [
  "AGE_YOUNG",
  "AGE_MIDDLE",
  "AGE_OLD",
];
export const AgeSoundTrackTimingsMS = {
  // This is not the exact length of the track, gives time for fade to occur + safety pad to make sure we don't hit the hard cut
  AGE_YOUNG: 70_000,
  AGE_MIDDLE: 70_000,
  AGE_OLD: 90_000,
} as const;

export const GeneralSoundTrack = [
  "ASunlessPassageI",
  "ASunlessPassageII",
  "ASunlessPassageIII",
  "Campfire",
  "DreamsOfBeltane",
  "Nocturne",
  "PianoInterludeII",
  "TheOldAlley",
] as const;

export const DungeonSoundTrack: Record<string, DungeonTrackDef | undefined> = {
  "training grounds": {
    general: ["DreamsOfBeltane"],
  },
  "nearby cave": {
    general: ["ExploringTheDungeonI", "Cursed"],
    finalBossTrack: "FinalBattle",
  },
  "goblin cave": {
    general: ["IronWorks", "ADarkPassage"],
  },
  "bandit hideout": {
    general: ["ARoguesEndeavor", "TheAncientForest"],
    finalBossTrack: "WieldingSword",
  },
  "frost spire fortress": {
    general: ["AcrossTheMarsh"],
    finalBossTrack: "Battlefield",
  },
  infestation: {
    general: ["AnEeriePassageI", "AnEeriePassageII"],
    finalBossTrack: "Cursed",
  },
  "dark forest": { general: ["TheDepthsOfEarth", "TheAncientForest"] },
  "ancient arena": { general: ["TheDepthsOfEarth"] },
  ///----TODO-----//
  "crystal labyrinthine - first excavation": undefined,
  "crystal labyrinthine - second excavation": undefined,
  "crystal labyrinthine - third excavation": undefined,
  "crystal labyrinthine - fourth excavation": undefined,
  "corrupted temple - outer terrace": undefined,
  "corrupted temple - ramparts": undefined,
  "corrupted temple - hall": undefined,
  "corrupted temple - atrium": undefined,
  "ronin's redoubt": undefined,
  "kōtetsu moses": undefined,
};
