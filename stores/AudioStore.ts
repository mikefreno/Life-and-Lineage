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
import {
  AMBIENT_TRACK_OPTIONS,
  AMBIENT_TRACKS,
  COMBAT_TRACK_OPTIONS,
  COMBAT_TRACKS,
  SFX_OPTIONS,
} from "@/utility/audio";
import { parse, stringify } from "flatted";

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

  ambientURIs: Partial<Record<AMBIENT_TRACK_OPTIONS, string>>;
  combatURIs: Partial<Record<COMBAT_TRACK_OPTIONS, string>>;

  currentAudioContext: AudioContext | undefined = undefined;
  currentPlayer: AudioBufferSourceNode | undefined = undefined;
  currentEnvelope: GainNode | undefined = undefined;
  storedTimeOnMute: number | undefined = undefined;
  currentlyPlayingTrack:
    | AMBIENT_TRACK_OPTIONS
    | COMBAT_TRACK_OPTIONS
    | undefined = undefined;

  outBoundAudioContext = new AudioContext();
  outBoundPlayer: AudioBufferSourceNode | undefined = undefined;
  //isInitializing: boolean = true;

  ambientTrackBuffers: Map<AMBIENT_TRACK_OPTIONS, AudioBuffer> = new Map();
  combatTrackBuffers: Map<COMBAT_TRACK_OPTIONS, AudioBuffer> = new Map();
  sfxTrackBuffers: Map<SFX_OPTIONS, AudioBuffer> = new Map();

  constructor({
    root,
    ambientURIs,
    combatURIs,
  }: {
    root: RootStore;
    ambientURIs: Partial<Record<AMBIENT_TRACK_OPTIONS, string>>;
    combatURIs: Partial<Record<COMBAT_TRACK_OPTIONS, string>>;
  }) {
    this.root = root;
    this.ambientURIs = ambientURIs;
    this.combatURIs = combatURIs;
    const { ambient, muted, master, sfx, combat } =
      this.loadPersistedSettings();
    this.muted = muted;
    this.ambientMusicVolume = ambient;
    this.masterVolume = master;
    this.soundEffectsVolume = sfx;
    this.combatMusicVolume = combat;
    //this.parseLocationForRelevantTrack();

    makeObservable(this, {
      masterVolume: observable,
      ambientMusicVolume: observable,
      soundEffectsVolume: observable,
      combatMusicVolume: observable,
      muted: observable,
      ambientTrackBuffers: observable,
      combatTrackBuffers: observable,
      currentAudioContext: observable,
      currentEnvelope: observable,
      storedTimeOnMute: observable,
      currentlyPlayingTrack: observable,
      outBoundAudioContext: observable,

      currentPlayer: observable,
      outBoundPlayer: observable,

      //isInitializing: observable,

      createBuffer: action,
      cleanup: action,
      crossFade: action,
      setAudioLevel: action,
      setMuteValue: action,
      getEffectiveVolume: action,
      updatePlayingAudioLevel: action,
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
          this.parseLocationForRelevantTrack(current, previous);
        } catch (error) {
          console.warn("Error in location reaction", error);
        }
      },
    );
  }

  async createBuffer({ type, newTrack }: CrossFadeOptions) {
    if (!this.currentAudioContext) {
      this.currentAudioContext = new AudioContext();
    }
    if (type === "ambient") {
      const buffer = await this.currentAudioContext.decodeAudioDataSource(
        this.ambientURIs[newTrack]!,
      );
      this.ambientTrackBuffers.set(newTrack, buffer);
      return buffer;
    } else if (type === "combat") {
      const buffer = await this.currentAudioContext.decodeAudioDataSource(
        this.combatURIs[newTrack]!,
      );
      this.combatTrackBuffers.set(newTrack, buffer);
      return buffer;
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

  /**
   * Currently only one combat track exists (basic), eventually, will select based on the current enemy or interface
   */
  playCombat() {
    this.crossFade({ type: "combat", newTrack: "combat" });
  }

  async crossFade({ type, newTrack }: CrossFadeOptions) {
    if (!this.currentAudioContext) {
      runInAction(() => (this.currentAudioContext = new AudioContext()));
    }
    let buffer: AudioBuffer | undefined;

    switch (
      type //sfx will not be crossfaded
    ) {
      case "ambient":
        buffer = this.ambientTrackBuffers.get(newTrack);
        if (!buffer) {
          await this.createBuffer({ type, newTrack });
          buffer = this.ambientTrackBuffers.get(newTrack);
        }
        break;
      case "combat":
        buffer = this.combatTrackBuffers.get(newTrack);
        if (!buffer) {
          await this.createBuffer({ type, newTrack });
          buffer = this.combatTrackBuffers.get(newTrack);
        }
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
      this.currentPlayer.start(0, this.storedTimeOnMute);
      this.storedTimeOnMute = undefined;
    } else {
      this.currentPlayer.start();
    }

    runInAction(() => (this.currentlyPlayingTrack = newTrack));
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

  updatePlayingAudioLevel() {
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
      this.currentAudioContext?.close();
      this.currentAudioContext = undefined;
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
