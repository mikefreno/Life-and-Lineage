import { Asset } from "expo-asset";

export const AMBIENT_TRACKS = {
  shops: require("../assets/music/shops.mp3"),
  ambient_old: require("../assets/music/ambient_old.mp3"),
  ambient_middle: require("../assets/music/ambient_middle.mp3"),
  ambient_young: require("../assets/music/ambient_young.mp3"),
  ambient_dungeon: require("../assets/music/ambient_dungeon.mp3"),
} as const;

export const COMBAT_TRACKS = {
  combat: require("../assets/music/combat.mp3"),
} as const;

export const SOUND_EFFECTS = {
  bossHit: require("../assets/sfx/boss_hit.mp3"),
  //normalHit: require("@/assets/sfx/hit.mp3"), // this track is causing errors
} as const;

export type AMBIENT_TRACK_OPTIONS = keyof typeof AMBIENT_TRACKS;

export type COMBAT_TRACK_OPTIONS = keyof typeof COMBAT_TRACKS;

export type SFX_OPTIONS = keyof typeof SOUND_EFFECTS;

export const getAmbientLocalURIs = async () => {
  let assets: Partial<Record<AMBIENT_TRACK_OPTIONS, string>> = {};

  await Promise.all(
    Object.entries(AMBIENT_TRACKS).map(async ([key, resource]) => {
      try {
        const asset = await Asset.fromModule(resource).downloadAsync();
        if (!asset.localUri) {
          throw new Error(`missing localUri for ${key}`);
        } else {
          assets[key as AMBIENT_TRACK_OPTIONS] = asset.localUri;
        }
      } catch (error) {
        console.error(`Error loading ambient track ${key}:`, error);
        throw error;
      }
    }),
  );

  return assets;
};

export const getCombatLocalURIs = async () => {
  let assets: Partial<Record<COMBAT_TRACK_OPTIONS, string>> = {};

  await Promise.all(
    Object.entries(COMBAT_TRACKS).map(async ([key, resource]) => {
      try {
        const asset = await Asset.fromModule(resource).downloadAsync();
        if (!asset.localUri) {
          throw new Error(`missing localUri for ${key}`);
        } else {
          assets[key as COMBAT_TRACK_OPTIONS] = asset.localUri;
        }
      } catch (error) {
        console.error(`Error loading combat track ${key}:`, error);
        throw error;
      }
    }),
  );

  return assets;
};
