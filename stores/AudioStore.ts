import {
  action,
  makeObservable,
  observable,
  reaction,
  runInAction,
} from "mobx";
import { RootStore } from "./RootStore";
import { storage } from "@/utility/functions/storage";
import {
  AudioBuffer,
  AudioBufferSourceNode,
  AudioContext,
  GainNode,
} from "react-native-audio-api";
import { Asset } from "expo-asset";

const AMBIENT_TRACKS = {
  shops: require("@/assets/music/shops.mp3"),
  old: require("@/assets/music/ambient_old.mp3"),
  middle: require("@/assets/music/ambient_middle.mp3"),
  young: require("@/assets/music/ambient_young.mp3"),
  dungeon: require("@/assets/music/ambient_dungeon.mp3"),
};

type AMBIENT_TRACK_OPTIONS = keyof typeof AMBIENT_TRACKS;

const COMBAT_TRACKS = {
  basic: require("@/assets/music/combat.mp3"),
};

type COMBAT_TRACK_OPTIONS = keyof typeof COMBAT_TRACKS;

const SOUND_EFFECTS = {
  bossHit: require("@/assets/sfx/boss_hit.mp3"),
  //normalHit: require("@/assets/sfx/hit.mp3"), // this track is causing errors
};

type SFX_OPTIONS = keyof typeof SOUND_EFFECTS;

type CrossFadeOptions =
  | {
      type: "ambient";
      newTrack: AMBIENT_TRACK_OPTIONS;
    }
  | {
      type: "combat";
      newTrack: COMBAT_TRACK_OPTIONS;
    };

const DEFAULT_FADE = 2000;
const GLOBAL_MULT = 0.8;

type TrackType = "ambient" | "combat" | "sfx";

export class AudioStore {
  root: RootStore;

  masterVolume: number = 1;
  ambientMusicVolume: number = 1;
  soundEffectsVolume: number = 1;
  combatMusicVolume: number = 1;
  muted: boolean = false;

  currentAudioContext = new AudioContext();
  currentPlayer: AudioBufferSourceNode | undefined = undefined;
  currentEnvelope: GainNode | undefined = undefined;
  storedTimeOnMute: number | undefined;
  currentlyPlayingTrack:
    | AMBIENT_TRACK_OPTIONS
    | COMBAT_TRACK_OPTIONS
    | undefined = undefined;

  outBoundAudioContext = new AudioContext();
  outBoundPlayer: AudioBufferSourceNode | undefined = undefined;

  ambientTrackBuffers: Map<AMBIENT_TRACK_OPTIONS, AudioBuffer> = new Map();
  combatTrackBuffers: Map<COMBAT_TRACK_OPTIONS, AudioBuffer> = new Map();
  sfxTrackBuffers: Map<SFX_OPTIONS, AudioBuffer> = new Map();

  constructor({ root }: { root: RootStore }) {
    this.root = root;
    this.loadPersistedSettings();
    this.initializeAudio().then(() =>
      this.root.uiStore.markStoreAsLoaded("audio"),
    );

    makeObservable(this, {
      masterVolume: observable,
      ambientMusicVolume: observable,
      soundEffectsVolume: observable,
      combatMusicVolume: observable,
      muted: observable,

      currentPlayer: observable,
      outBoundPlayer: observable,

      cleanup: action,
      crossFade: action,
      setAudioLevel: action,
      setMuteValue: action,
      getEffectiveVolume: action,
    });

    reaction(
      () => [
        this.masterVolume,
        this.ambientMusicVolume,
        this.soundEffectsVolume,
        this.combatMusicVolume,
        this.muted,
      ],
      () => this.persistSettings(),
    );

    reaction(
      () => ({
        inDungeon: this.root.dungeonStore.isInDungeon,
        inMarket: this.root.shopsStore.inMarket,
        playerAge: this.root.playerState?.age ?? 0,
        inCombat: this.root.dungeonStore.inCombat,
      }),
      (current, previous) => {
        try {
          this.parseLocationForRelevantTrack(current, previous);
        } catch (error) {
          console.warn("Error in location reaction", error);
        }
      },
    );
  }

  async initializeAudio() {
    try {
      const loadedAmbientBuffers = await Promise.all(
        Object.entries(AMBIENT_TRACKS).map(async ([key, source]) => {
          try {
            const asset = Asset.fromModule(source);
            if (!asset.downloaded) {
              await asset.downloadAsync();
            }
            const buffer = await this.currentAudioContext.decodeAudioDataSource(
              asset.localUri!,
            );
            return [key as AMBIENT_TRACK_OPTIONS, buffer] as const;
          } catch (error) {
            throw new Error(`Failed to decode ambient track: ${key}-${error}`);
          }
        }),
      );
      this.ambientTrackBuffers = new Map(loadedAmbientBuffers);
      this.root.uiStore.markStoreAsLoaded("ambient");

      const loadedCombatBuffers = await Promise.all(
        Object.entries(COMBAT_TRACKS).map(async ([key, source]) => {
          try {
            const asset = Asset.fromModule(source);
            if (!asset.downloaded) {
              await asset.downloadAsync();
            }
            const buffer = await this.currentAudioContext.decodeAudioDataSource(
              asset.localUri!,
            );
            return [key as COMBAT_TRACK_OPTIONS, buffer] as const;
          } catch (error) {
            throw new Error(`Failed to decode ambient track: ${key}-${error}`);
          }
        }),
      );
      this.ambientTrackBuffers = new Map(loadedAmbientBuffers);
      this.combatTrackBuffers = new Map(loadedCombatBuffers);

      this.parseLocationForRelevantTrack();
    } catch (error) {
      console.warn("Failed to initialize audio buffers", error);
    }
  }

  private parseLocationForRelevantTrack(current?: any, previous?: any) {
    if (this.muted) return;
    try {
      if (!previous || !current) {
        if (this.root.dungeonStore.inCombat) {
          this.playCombat();
        } else {
          this.playAmbient();
        }
      } else if (current.inCombat !== previous?.inCombat) {
        if (current.inCombat) {
          this.playCombat();
        } else {
          this.playAmbient();
        }
      } else if (
        current.inDungeon !== previous?.inDungeon ||
        current.inMarket !== previous?.inMarket ||
        (!current.inDungeon &&
          !current.inMarket &&
          current.playerAge !== previous?.playerAge)
      ) {
        this.playAmbient();
      }
    } catch (error) {
      console.warn("Error parsing location for track", error);
    }
  }

  playAmbient() {
    let selectedTrack: keyof typeof AMBIENT_TRACKS;
    const playerAge = this.root.playerState?.age ?? 0;
    if (this.root.dungeonStore.isInDungeon) {
      selectedTrack = "dungeon";
    } else if (this.root.shopsStore.inMarket) {
      selectedTrack = "shops";
    } else {
      selectedTrack =
        playerAge < 30 ? "young" : playerAge < 60 ? "middle" : "old";
    }
    this.crossFade({ type: "ambient", newTrack: selectedTrack });
  }

  /**
   * Currently only one combat track exists (basic), eventually, will select based on the current enemy or interface
   */
  playCombat() {
    this.crossFade({ type: "combat", newTrack: "basic" });
  }

  async crossFade({ type, newTrack }: CrossFadeOptions) {
    try {
      let buffer: AudioBuffer | undefined;

      switch (
        type //sfx will not be crossfaded
      ) {
        case "ambient":
          buffer = this.ambientTrackBuffers.get(newTrack);
          break;
        case "combat":
          buffer = this.combatTrackBuffers.get(newTrack);
          break;
      }

      if (!buffer) {
        throw new Error(`No buffer found for ${type} track: ${newTrack}`);
      }

      if (this.currentPlayer && this.currentEnvelope) {
        this.outBoundPlayer = this.currentPlayer;
        const outboundEnvelope = this.currentEnvelope;

        const tNow = this.currentAudioContext.currentTime;
        outboundEnvelope.gain.linearRampToValueAtTime(
          0,
          tNow + DEFAULT_FADE / 1000,
        );

        setTimeout(() => {
          runInAction(() => {
            outboundEnvelope.disconnect();
            this.outBoundPlayer?.stop();
            this.outBoundPlayer?.disconnect();
            this.outBoundPlayer = undefined;
          });
        }, DEFAULT_FADE);
      }
      this.currentPlayer = this.currentAudioContext.createBufferSource();
      this.currentPlayer.buffer = buffer;

      this.currentEnvelope = this.currentAudioContext.createGain();
      this.currentPlayer.connect(this.currentEnvelope);
      this.currentEnvelope.connect(this.currentAudioContext.destination);

      const tNow = this.currentAudioContext.currentTime;
      this.currentEnvelope.gain.setValueAtTime(0, tNow);
      this.currentEnvelope.gain.linearRampToValueAtTime(
        this.getEffectiveVolume(type),
        tNow + DEFAULT_FADE / 1000,
      );
      this.currentPlayer.loop = true;

      if (this.storedTimeOnMute && newTrack == this.currentlyPlayingTrack) {
        __DEV__ && console.log("skippin to:", this.storedTimeOnMute);
        this.currentPlayer.start(0, this.storedTimeOnMute);
        //clear stored info
        this.storedTimeOnMute = undefined;
      } else {
        this.currentPlayer.start();
      }

      this.currentlyPlayingTrack = newTrack;
    } catch (error) {
      console.warn("Error during crossfade:", error);
    }
  }

  setAudioLevel(type: "master" | TrackType, value: number): void {
    switch (type) {
      case "master":
        this.masterVolume = value;
        break;
      case "ambient":
        this.ambientMusicVolume = value;
        break;
      case "sfx":
        this.soundEffectsVolume = value;
        break;
      case "combat":
        this.combatMusicVolume = value;
        break;
    }
    this.updatePlayingAudioLevel();
  }

  private updatePlayingAudioLevel() {
    if (!this.currentlyPlayingTrack) return;

    const tNow = this.currentAudioContext.currentTime;
    this.currentEnvelope?.gain.setValueAtTime(
      this.getEffectiveVolume(
        this.currentlyPlayingTrack in AMBIENT_TRACKS
          ? "ambient"
          : this.currentlyPlayingTrack in COMBAT_TRACKS
          ? "combat"
          : "sfx",
      ),
      tNow,
    );
  }

  setMuteValue(val: boolean) {
    this.muted = val;
    if (val) {
      this.storedTimeOnMute = this.currentAudioContext.currentTime;
      this.currentPlayer?.stop();
      this.currentPlayer?.disconnect();
      this.currentPlayer = undefined;
    } else {
      this.parseLocationForRelevantTrack();
    }
  }

  getEffectiveVolume(type: TrackType): number {
    try {
      const typeVolume =
        type === "ambient"
          ? this.ambientMusicVolume
          : type === "combat"
          ? this.combatMusicVolume
          : this.soundEffectsVolume;
      return this.muted
        ? 0
        : Math.min(
            1,
            Math.max(0, typeVolume * this.masterVolume * GLOBAL_MULT),
          );
    } catch (error) {
      console.warn("Error calculating effective volume", error);
      return 0;
    }
  }

  private loadPersistedSettings() {
    try {
      const stored = storage.getString("audio_settings");
      if (stored) {
        const settings = JSON.parse(stored);
        this.masterVolume = settings.master ?? 1;
        this.ambientMusicVolume = settings.ambient ?? 1;
        this.soundEffectsVolume = settings.sfx ?? 1;
        this.combatMusicVolume = settings.combat ?? 1;
        this.muted = settings.muted ?? false;
      }
    } catch (error) {
      console.warn("Error loading persisted settings", error);
      this.masterVolume = 1;
      this.ambientMusicVolume = 1;
      this.soundEffectsVolume = 1;
      this.combatMusicVolume = 1;
      this.muted = false;
    }
  }

  private persistSettings() {
    try {
      const settings = {
        master: this.masterVolume,
        ambient: this.ambientMusicVolume,
        sfx: this.soundEffectsVolume,
        combat: this.combatMusicVolume,
        muted: this.muted,
      };
      storage.set("audio_settings", JSON.stringify(settings));
    } catch (error) {
      console.warn("Error persisting settings", error);
    }
  }
  cleanup() {
    try {
      if (this.currentPlayer) {
        this.currentPlayer.stop();
        this.currentPlayer.disconnect();
        this.currentPlayer = undefined;
      }

      if (this.currentEnvelope) {
        this.currentEnvelope.disconnect();
        this.currentEnvelope = undefined;
      }

      if (this.outBoundPlayer) {
        this.outBoundPlayer.stop();
        this.outBoundPlayer.disconnect();
        this.outBoundPlayer = undefined;
      }

      this.ambientTrackBuffers.clear();
      this.combatTrackBuffers.clear();
      this.sfxTrackBuffers.clear();
    } catch (error) {
      console.warn("Error cleaning up audio store:", error);
    }
  }
}
