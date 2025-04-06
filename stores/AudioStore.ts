import {
  action,
  computed,
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

const scheduleTask =
  typeof requestIdleCallback !== "undefined"
    ? requestIdleCallback
    : (callback: (deadline: any) => void) =>
        setTimeout(() => {
          callback({
            timeRemaining: () => Number.MAX_VALUE,
          });
        }, 1);

export class AudioStore {
  root: RootStore;
  masterVolume: number = 1;
  ambientMusicVolume: number = 1;
  soundEffectsVolume: number = 1;
  combatMusicVolume: number = 1;
  muted: boolean = false;
  private initializationPromise: Promise<void> | null = null;
  isInitializing: boolean = false;

  currentAudioContext: AudioContext | undefined = undefined;
  currentPlayer: AudioBufferSourceNode | undefined = undefined;
  currentEnvelope: GainNode | undefined = undefined;
  storedTimeOnMute: number | undefined;
  currentlyPlayingTrack:
    | AMBIENT_TRACK_OPTIONS
    | COMBAT_TRACK_OPTIONS
    | undefined = undefined;

  outBoundAudioContext: AudioContext | undefined = undefined;
  outBoundPlayer: AudioBufferSourceNode | undefined = undefined;

  ambientTrackBuffers: Map<AMBIENT_TRACK_OPTIONS, AudioBuffer> = new Map();
  combatTrackBuffers: Map<COMBAT_TRACK_OPTIONS, AudioBuffer> = new Map();
  sfxTrackBuffers: Map<SFX_OPTIONS, AudioBuffer> = new Map();

  ranMutedStart: boolean;

  constructor({ root }: { root: RootStore }) {
    this.root = root;
    const { muted, master, ambient, combat, sfx } =
      this.loadPersistedSettings();
    this.muted = muted;
    this.masterVolume = master;
    this.ambientMusicVolume = ambient;
    this.combatMusicVolume = combat;
    this.soundEffectsVolume = sfx;

    if (!this.muted) {
      this.ranMutedStart = false;
      this.initializeAudio();
      this.root.uiStore.markStoreAsLoaded("audio");
    } else {
      this.mutedStartOverride();
      this.ranMutedStart = true;
    }

    makeObservable(this, {
      masterVolume: observable,
      ambientMusicVolume: observable,
      soundEffectsVolume: observable,
      combatMusicVolume: observable,
      muted: observable,
      isInitializing: observable,
      currentPlayer: observable,
      outBoundPlayer: observable,
      cleanup: action,
      crossFade: action,
      setAudioLevel: action,
      setMuteValue: action,
      getEffectiveVolume: action,
      initializationInProgress: computed,
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

  get initializationInProgress(): boolean {
    return this.isInitializing;
  }

  mutedStartOverride() {
    this.root.uiStore.markStoreAsLoaded("audio");
    this.root.uiStore.markStoreAsLoaded("ambient");
  }

  initializeAudio() {
    if (this.muted || this.initializationPromise) {
      return;
    }

    runInAction(() => {
      this.isInitializing = true;
    });

    this.initializationPromise = new Promise((resolve) => {
      scheduleTask(() => {
        const loadTracks = async () => {
          try {
            const loadedAmbientPromises = Object.entries(AMBIENT_TRACKS).map(
              async ([key, source]) => {
                const asset = Asset.fromModule(source);
                if (!asset.downloaded) {
                  await asset.downloadAsync();
                }
                if (!this.currentAudioContext) {
                  this.currentAudioContext = new AudioContext();
                }
                const buffer =
                  await this.currentAudioContext.decodeAudioDataSource(
                    asset.localUri!,
                  );
                return [key as AMBIENT_TRACK_OPTIONS, buffer] as const;
              },
            );

            const loadedCombatPromises = Object.entries(COMBAT_TRACKS).map(
              async ([key, source]) => {
                const asset = Asset.fromModule(source);
                if (!asset.downloaded) {
                  await asset.downloadAsync();
                }
                if (!this.currentAudioContext) {
                  this.currentAudioContext = new AudioContext();
                }
                const buffer =
                  await this.currentAudioContext.decodeAudioDataSource(
                    asset.localUri!,
                  );
                return [key as COMBAT_TRACK_OPTIONS, buffer] as const;
              },
            );

            const [loadedAmbientBuffers, loadedCombatBuffers] =
              await Promise.all([
                Promise.all(loadedAmbientPromises),
                Promise.all(loadedCombatPromises),
              ]);

            runInAction(() => {
              this.ambientTrackBuffers = new Map(loadedAmbientBuffers);
              this.combatTrackBuffers = new Map(loadedCombatBuffers);
            });

            this.root.uiStore.markStoreAsLoaded("ambient");
            this.parseLocationForRelevantTrack();
          } catch (error) {
            console.warn("Failed to initialize audio buffers", error);
          } finally {
            this.initializationPromise = null;
            runInAction(() => {
              this.isInitializing = false;
            });
            resolve();
          }
        };

        loadTracks();
      });
    });

    return this.initializationPromise;
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

  crossFade({ type, newTrack }: CrossFadeOptions) {
    try {
      let buffer: AudioBuffer | undefined;

      switch (type) {
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

        const tNow = this.currentAudioContext!.currentTime;
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

      this.currentPlayer = this.currentAudioContext!.createBufferSource();
      this.currentPlayer.buffer = buffer;
      this.currentEnvelope = this.currentAudioContext!.createGain();
      this.currentPlayer.connect(this.currentEnvelope);
      this.currentEnvelope.connect(this.currentAudioContext!.destination);

      const tNow = this.currentAudioContext!.currentTime;
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

    const tNow = this.currentAudioContext!.currentTime;
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

  async setMuteValue(val: boolean) {
    if (this.initializationPromise) {
      await this.initializationPromise;
    }

    runInAction(() => {
      this.muted = val;
    });

    if (val) {
      this.storedTimeOnMute = this.currentAudioContext?.currentTime;
      await this.currentAudioContext?.close();
      if (this.currentPlayer) {
        this.currentPlayer.stop();
        this.currentPlayer.disconnect();
        runInAction(() => (this.currentPlayer = undefined));
      }
    } else {
      this.currentAudioContext = new AudioContext();
      if (this.ranMutedStart) {
        await this.initializeAudio();
      } else {
        this.parseLocationForRelevantTrack();
      }
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
        const settings = JSON.parse(stored);
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
