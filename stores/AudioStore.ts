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
  AudioManager,
  GainNode,
} from "react-native-audio-api";

import { Asset } from "expo-asset";
import { parse, stringify } from "flatted";
import { wait } from "@/utility/functions/misc";

const AMBIENT_TRACKS = {
  shops: require("../assets/music/shops.mp3"),
  ambient_old: require("../assets/music/ambient_old.mp3"),
  ambient_middle: require("../assets/music/ambient_middle.mp3"),
  ambient_young: require("../assets/music/ambient_young.mp3"),
  ambient_dungeon: require("../assets/music/ambient_dungeon.mp3"),
} as const;

const COMBAT_TRACKS = {
  combat: require("../assets/music/combat.mp3"),
} as const;

const SOUND_EFFECTS = {
  bossHit: require("../assets/sfx/boss_hit.mp3"),
} as const;

type AMBIENT_TRACK_OPTIONS = keyof typeof AMBIENT_TRACKS;
type COMBAT_TRACK_OPTIONS = keyof typeof COMBAT_TRACKS;
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
  isInitializing: boolean = true;

  ambientTrackURIs: Map<AMBIENT_TRACK_OPTIONS, string> = new Map();
  combatTrackURIs: Map<COMBAT_TRACK_OPTIONS, string> = new Map();
  sfxTrackURIs: Map<SFX_OPTIONS, string> = new Map();

  ambientTrackBuffers: Map<AMBIENT_TRACK_OPTIONS, AudioBuffer> = new Map();
  combatTrackBuffers: Map<COMBAT_TRACK_OPTIONS, AudioBuffer> = new Map();
  sfxTrackBuffers: Map<SFX_OPTIONS, AudioBuffer> = new Map();

  private isCrossFading = false;
  private hasPendingCrossFade = false;
  private crossFadeTimeout: NodeJS.Timeout | null = null;

  constructor({ root }: { root: RootStore }) {
    this.root = root;
    const { ambient, muted, master, sfx, combat } =
      this.loadPersistedSettings();
    this.muted = muted;
    this.ambientMusicVolume = ambient;
    this.masterVolume = master;
    this.soundEffectsVolume = sfx;
    this.combatMusicVolume = combat;

    this.initializeAudio()
      .then(() => this.parseLocationForRelevantTrack())
      .catch((error) => {
        console.error("Failed to initialize audio:", error);
        try {
          this.parseLocationForRelevantTrack();
        } catch (parseError) {
          console.error(
            "Failed to parse location after audio init error:",
            parseError,
          );
        }
      });

    makeObservable(this, {
      masterVolume: observable,
      ambientMusicVolume: observable,
      soundEffectsVolume: observable,
      combatMusicVolume: observable,
      muted: observable,
      ambientTrackBuffers: observable,
      combatTrackBuffers: observable,
      sfxTrackBuffers: observable,
      isInitializing: observable,
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
        playerAge: this.root.playerState?.age,
        inCombat: this.root.dungeonStore.inCombat,
      }),
      (current, previous) => {
        try {
          wait(100).then(() =>
            this.parseLocationForRelevantTrack(current, previous),
          );
        } catch (error) {
          console.warn("Error in location reaction", error);
        }
      },
    );
  }

  async initializeAudio() {
    try {
      if (this.ambientTrackURIs.size < Object.entries(AMBIENT_TRACKS).length) {
        runInAction(() => (this.isInitializing = true));

        for (const k of Object.keys(AMBIENT_TRACKS)) {
          try {
            const [{ localUri }] = await Asset.loadAsync(
              k === "shops"
                ? require("../assets/music/shops.mp3")
                : k === "ambient_dungeon"
                ? require("../assets/music/ambient_dungeon.mp3")
                : k === "ambient_young"
                ? require("../assets/music/ambient_young.mp3")
                : k === "ambient_middle"
                ? require("../assets/music/ambient_middle.mp3")
                : require("../assets/music/ambient_old.mp3"),
            );

            if (localUri) {
              this.ambientTrackURIs.set(k as AMBIENT_TRACK_OPTIONS, localUri);
            }

            await wait(50);
          } catch (error) {
            console.error(`Failed to load ambient track URI: ${k}`, error);
          }
        }
      }

      if (this.combatTrackURIs.size < Object.entries(COMBAT_TRACKS).length) {
        for (const k of Object.keys(COMBAT_TRACKS)) {
          try {
            const [{ localUri }] = await Asset.loadAsync(
              COMBAT_TRACKS[k as COMBAT_TRACK_OPTIONS],
            );

            if (localUri) {
              this.combatTrackURIs.set(k as COMBAT_TRACK_OPTIONS, localUri);
            }

            await wait(50);
          } catch (error) {
            console.error(`Failed to load combat track URI: ${k}`, error);
          }
        }
      }

      await this.preloadCommonBuffers();

      runInAction(() => {
        this.isInitializing = false;
      });
    } catch (error) {
      console.error("Audio initialization failed:", error);
      runInAction(() => {
        this.isInitializing = false;
      });
    }
  }

  async preloadCommonBuffers() {
    try {
      const playerAge = this.root.playerState?.age ?? 0;
      const defaultAmbient =
        playerAge < 30
          ? "ambient_young"
          : playerAge < 60
          ? "ambient_middle"
          : "ambient_old";

      await this.getOrCreateBuffer({
        type: "ambient",
        newTrack: defaultAmbient,
      });
      await this.getOrCreateBuffer({ type: "ambient", newTrack: "shops" });
    } catch (error) {
      console.error("Error preloading common buffers:", error);
    }
  }

  async getOrCreateBuffer({
    type,
    newTrack,
  }: CrossFadeOptions): Promise<AudioBuffer> {
    let buffer: AudioBuffer | undefined;

    if (type === "ambient") {
      buffer = this.ambientTrackBuffers.get(newTrack);
    } else if (type === "combat") {
      buffer = this.combatTrackBuffers.get(newTrack);
    }

    if (buffer) {
      return buffer;
    }

    let uri: string | undefined | null;

    if (type === "ambient") {
      uri = this.ambientTrackURIs.get(newTrack);

      if (!uri) {
        const [{ localUri }] = await Asset.loadAsync(
          newTrack === "shops"
            ? require("../assets/music/shops.mp3")
            : newTrack === "ambient_dungeon"
            ? require("../assets/music/ambient_dungeon.mp3")
            : newTrack === "ambient_young"
            ? require("../assets/music/ambient_young.mp3")
            : newTrack === "ambient_middle"
            ? require("../assets/music/ambient_middle.mp3")
            : require("../assets/music/ambient_old.mp3"),
        );

        uri = localUri;
        if (uri) {
          this.ambientTrackURIs.set(newTrack, uri);
        }
      }
    } else if (type === "combat") {
      uri = this.combatTrackURIs.get(newTrack);

      if (!uri) {
        const [{ localUri }] = await Asset.loadAsync(COMBAT_TRACKS[newTrack]);
        uri = localUri;
        if (uri) {
          this.combatTrackURIs.set(newTrack, uri);
        }
      }
    }

    if (!uri) {
      throw new Error(`No URI found for ${type} track: ${newTrack}`);
    }

    buffer = await this.currentAudioContext.decodeAudioDataSource(uri);

    if (type === "ambient") {
      runInAction(() => this.ambientTrackBuffers.set(newTrack, buffer!));
    } else if (type === "combat") {
      runInAction(() => this.combatTrackBuffers.set(newTrack, buffer!));
    }

    return buffer;
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
    let selectedTrack: AMBIENT_TRACK_OPTIONS;
    const playerAge = this.root.playerState?.age ?? 0;
    if (this.root.dungeonStore.isInDungeon) {
      selectedTrack = "ambient_dungeon";
    } else if (this.root.shopsStore.inMarket) {
      selectedTrack = "shops";
    } else {
      selectedTrack =
        playerAge < 30
          ? "ambient_young"
          : playerAge < 60
          ? "ambient_middle"
          : "ambient_old";
    }
    this.crossFade({ type: "ambient", newTrack: selectedTrack });
  }

  playCombat() {
    this.crossFade({ type: "combat", newTrack: "combat" });
  }

  async crossFade({ type, newTrack }: CrossFadeOptions) {
    if (this.currentlyPlayingTrack === newTrack) {
      return;
    }

    if (this.isCrossFading) {
      this.hasPendingCrossFade = true;
      return;
    }

    try {
      this.isCrossFading = true;

      const buffer = await this.getOrCreateBuffer({ type, newTrack });

      if (this.currentPlayer && this.currentEnvelope) {
        this.outBoundPlayer = this.currentPlayer;
        const outboundEnvelope = this.currentEnvelope;

        const tNow = this.currentAudioContext.currentTime;
        outboundEnvelope.gain.linearRampToValueAtTime(
          0,
          tNow + DEFAULT_FADE / 1000,
        );

        if (this.crossFadeTimeout) {
          clearTimeout(this.crossFadeTimeout);
        }

        this.crossFadeTimeout = setTimeout(() => {
          runInAction(() => {
            try {
              outboundEnvelope.disconnect();
              this.outBoundPlayer?.stop();
              this.outBoundPlayer?.disconnect();
              this.outBoundPlayer = undefined;
            } catch (error) {
              console.warn("Error cleaning up outbound player:", error);
            }

            this.processPendingCrossFade();
          });
        }, DEFAULT_FADE);
      } else {
        setTimeout(() => this.processPendingCrossFade(), DEFAULT_FADE);
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
        this.currentPlayer.start(0, this.storedTimeOnMute);
        this.storedTimeOnMute = undefined;
      } else {
        this.currentPlayer.start();
      }

      this.currentlyPlayingTrack = newTrack;
    } catch (error) {
      console.error(`Failed to crossfade to ${type} track ${newTrack}:`, error);
      this.isCrossFading = false;
    }
  }

  private processPendingCrossFade() {
    this.isCrossFading = false;

    if (this.hasPendingCrossFade) {
      this.hasPendingCrossFade = false;

      setTimeout(() => {
        try {
          this.parseLocationForRelevantTrack();
        } catch (error) {
          console.error("Error processing pending crossfade:", error);
        }
      }, 50);
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
    if (!this.currentlyPlayingTrack || !this.currentAudioContext) return;

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
      this.storedTimeOnMute = this.currentAudioContext?.currentTime;
      this.currentPlayer?.stop();
      this.currentPlayer?.disconnect();
      this.currentPlayer = undefined;
      this.currentlyPlayingTrack = undefined;
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
    let master = 1;
    let ambient = 1;
    let sfx = 1;
    let combat = 1;
    let muted = false;

    try {
      const stored = storage.getString("audio_settings");
      if (stored) {
        const settings = parse(stored);
        master = settings.master ?? 1;
        ambient = settings.ambient ?? 1;
        sfx = settings.sfx ?? 1;
        combat = settings.combat ?? 1;
        muted = settings.muted ?? false;
      }
    } catch (error) {
      console.warn("Error loading persisted settings", error);
    }
    return { master, ambient, sfx, combat, muted };
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
      storage.set("audio_settings", stringify(settings));
    } catch (error) {
      console.warn("Error persisting settings", error);
    }
  }

  cleanup() {
    try {
      this.hasPendingCrossFade = false;

      if (this.crossFadeTimeout) {
        clearTimeout(this.crossFadeTimeout);
        this.crossFadeTimeout = null;
      }

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

      this.isCrossFading = false;
    } catch (error) {
      console.warn("Error cleaning up audio store:", error);
    }
  }
}
