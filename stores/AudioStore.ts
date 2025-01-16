import {
  makeObservable,
  observable,
  action,
  reaction,
  runInAction,
} from "mobx";
import { storage } from "../utility/functions/storage";
import { RootStore } from "./RootStore";
import { Audio } from "expo-av";
import { Sound } from "expo-av/build/Audio/Sound";
import { debounce } from "lodash";

const AMBIENT_TRACKS = {
  shops: require("../assets/music/shops.m4a"),
  combat: require("../assets/music/combat.m4a"),
  old: require("../assets/music/ambient-old.m4a"),
  middle: require("../assets/music/amibent-middle.m4a"),
  young: require("../assets/music/ambient-young.m4a"),
  dungeon: require("../assets/music/ambient-dungeon.m4a"),
};

const COMBAT_TRACKS = {
  basic: require("../assets/music/combat.m4a"),
};

const SOUND_EFFECTS = {
  bossHit: require("../assets/sfx/bossHit1.wav"),
  hit: require("../assets/sfx/hitDamage1.wav"),
};

const DEFAULT_FADE = 1000;
const FADE_INTERVAL = 50;

export class AudioStore {
  root: RootStore;

  masterVolume: number = 1;
  ambientMusicVolume: number = 1;
  soundEffectsVolume: number = 1;
  combatMusicVolume: number = 1;
  muted: boolean = false;

  isSoundEffectsLoaded: boolean = false;
  isAmbientLoaded: boolean = false;
  isCombatLoaded: boolean = false;

  private ambientPlayers: Map<string, Sound> = new Map();
  private combatPlayers: Map<string, Sound> = new Map();
  private soundEffects: Map<string, Sound> = new Map();

  private currentAmbientTrack: string | null = null;
  private currentCombatTrack: string | null = null;

  private audioQueue: Array<{
    type: "ambient" | "combat";
    params?: any;
  }> = [];
  private isProcessingQueue = false;
  private activeTransitions: Map<string, { cancel: () => void }> = new Map();

  constructor({ root }: { root: RootStore }) {
    this.root = root;
    this.loadPersistedSettings();

    makeObservable(this, {
      masterVolume: observable,
      ambientMusicVolume: observable,
      soundEffectsVolume: observable,
      combatMusicVolume: observable,
      muted: observable,
      isSoundEffectsLoaded: observable,
      isAmbientLoaded: observable,
      isCombatLoaded: observable,
      loadAudioResources: action,
      playAmbient: action,
      playCombat: action,
      playSfx: action,
      setMuteValue: action,
      setAudioLevel: action,
    });

    this.initializeAudio();

    reaction(
      () => ({
        inDungeon: this.root.dungeonStore.isInDungeon,
        inMarket: this.root.shopsStore.inMarket,
        playerAge: this.root.playerState?.age ?? 0,
        inCombat: this.root.dungeonStore.inCombat,
      }),
      debounce((current, previous) => {
        if (current.inCombat !== previous?.inCombat) {
          if (current.inCombat) {
            this.playCombat({ track: "basic" });
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
      }, 250),
    );
  }

  private async initializeAudio() {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });
      await this.loadAudioResources();
    } catch (error) {
      console.error("Failed to initialize audio:", error);
    }
  }

  async loadAudioResources() {
    try {
      await Promise.all([
        this.loadSoundEffects().then(() =>
          runInAction(() => (this.isSoundEffectsLoaded = true)),
        ),
        this.loadAmbientTracks().then(() =>
          runInAction(() => {
            this.isAmbientLoaded = true;
            this.root.uiStore.markStoreAsLoaded("ambient");
          }),
        ),
        this.loadCombatTracks().then(() =>
          runInAction(() => (this.isCombatLoaded = true)),
        ),
      ]);

      if (this.isAmbientLoaded) {
        this.playAmbient();
      }
    } catch (error) {
      console.error("Failed to load audio resources:", error);
    }
  }

  private async loadSoundEffects() {
    const loadPromises = Object.entries(SOUND_EFFECTS).map(
      async ([id, source]) => {
        const { sound } = await Audio.Sound.createAsync(source, {
          volume: this.getEffectiveVolume("soundEffects"),
        });
        this.soundEffects.set(id, sound);
      },
    );
    await Promise.all(loadPromises);
  }

  private async loadAmbientTracks() {
    const loadPromises = Object.entries(AMBIENT_TRACKS).map(
      async ([id, source]) => {
        const { sound } = await Audio.Sound.createAsync(source, {
          volume: 0,
          isLooping: true,
        });
        this.ambientPlayers.set(id, sound);
      },
    );
    await Promise.all(loadPromises);
  }

  private async loadCombatTracks() {
    const loadPromises = Object.entries(COMBAT_TRACKS).map(
      async ([id, source]) => {
        const { sound } = await Audio.Sound.createAsync(source, {
          volume: 0,
          isLooping: true,
        });
        this.combatPlayers.set(id, sound);
      },
    );
    await Promise.all(loadPromises);
  }

  playAmbient(params?: {
    track?: keyof typeof AMBIENT_TRACKS;
    duration?: number;
    disableFadeOut?: boolean;
  }) {
    if (!this.isAmbientLoaded) {
      return;
    }
    this.audioQueue.push({ type: "ambient", params });
    this.processAudioQueue();
  }

  playCombat(params: {
    track: keyof typeof COMBAT_TRACKS;
    duration?: number;
    disableFadeOut?: boolean;
  }) {
    if (!this.isCombatLoaded) {
      return;
    }
    this.audioQueue.push({ type: "combat", params });
    this.processAudioQueue();
  }

  private async processAudioQueue() {
    if (this.isProcessingQueue || this.audioQueue.length === 0) return;

    this.isProcessingQueue = true;
    const { type, params } = this.audioQueue.pop()!;
    this.audioQueue = [];

    try {
      if (type === "ambient") {
        await this.playAmbientInternal(params);
      } else if (type === "combat") {
        await this.playCombatInternal(params);
      }
    } catch (error) {
      console.error("Error processing audio queue:", error);
    } finally {
      this.isProcessingQueue = false;
      if (this.audioQueue.length > 0) {
        this.processAudioQueue();
      }
    }
  }

  private get hasActiveTransition(): boolean {
    return this.activeTransitions.size > 0;
  }

  private async playAmbientInternal(params?: {
    track?: keyof typeof AMBIENT_TRACKS;
    duration?: number;
    disableFadeOut?: boolean;
  }) {
    const {
      track,
      duration = DEFAULT_FADE,
      disableFadeOut = false,
    } = params ?? {};

    if (!this.isAmbientLoaded) return;

    try {
      let selectedTrack = track;
      if (!selectedTrack) {
        const playerAge = this.root.playerState?.age ?? 0;
        if (this.root.dungeonStore.isInDungeon) {
          selectedTrack = "dungeon";
        } else if (this.root.shopsStore.inMarket) {
          selectedTrack = "shops";
        } else {
          selectedTrack =
            playerAge < 30 ? "young" : playerAge < 60 ? "middle" : "old";
        }
      }

      if (this.currentAmbientTrack === selectedTrack) return;

      const newSound = this.ambientPlayers.get(selectedTrack!);
      if (!newSound)
        throw new Error(`Ambient track ${selectedTrack} not found`);

      const hadActiveTransition = this.hasActiveTransition;
      this.cancelAllTransitions();

      // Handle current tracks
      if (hadActiveTransition) {
        // Immediate stop if we were in a transition
        if (this.currentAmbientTrack) {
          const currentSound = this.ambientPlayers.get(
            this.currentAmbientTrack,
          );
          if (currentSound) {
            await currentSound.setVolumeAsync(0);
            await currentSound.stopAsync();
          }
        }
        if (this.currentCombatTrack) {
          const combatSound = this.combatPlayers.get(this.currentCombatTrack);
          if (combatSound) {
            await combatSound.setVolumeAsync(0);
            await combatSound.stopAsync();
          }
        }
      } else if (!disableFadeOut) {
        // Start fadeout for current tracks
        if (this.currentAmbientTrack) {
          const currentSound = this.ambientPlayers.get(
            this.currentAmbientTrack,
          );
          if (currentSound) {
            this.fadeSound(
              currentSound,
              await this.getCurrentVolume(currentSound),
              0,
              duration / 2,
              "fadeout",
            )
              .then(() => currentSound.stopAsync())
              .catch(console.error);
          }
        }
        if (this.currentCombatTrack) {
          const combatSound = this.combatPlayers.get(this.currentCombatTrack);
          if (combatSound) {
            this.fadeSound(
              combatSound,
              await this.getCurrentVolume(combatSound),
              0,
              duration / 2,
              "fadeout",
            )
              .then(() => combatSound.stopAsync())
              .catch(console.error);
          }
        }
      }

      // Start new track
      const targetVolume = this.getEffectiveVolume("ambientMusic");
      await newSound.setVolumeAsync(0);
      await newSound.playAsync();
      this.fadeSound(newSound, 0, targetVolume, duration, "fadein").catch(
        console.error,
      );

      this.currentCombatTrack = null;
      this.currentAmbientTrack = selectedTrack;
    } catch (error) {
      console.error(`Failed to play ambient track:`, error);
    }
  }

  private async playCombatInternal(params: {
    track: keyof typeof COMBAT_TRACKS;
    duration?: number;
    disableFadeOut?: boolean;
  }) {
    const { track, duration = DEFAULT_FADE, disableFadeOut = false } = params;

    if (!this.isCombatLoaded) return;

    try {
      if (this.currentCombatTrack === track) return;

      const newSound = this.combatPlayers.get(track);
      if (!newSound) throw new Error(`Combat track ${track} not found`);

      const hadActiveTransition = this.hasActiveTransition;
      this.cancelAllTransitions();

      // Handle current tracks
      if (hadActiveTransition) {
        if (this.currentAmbientTrack) {
          const ambientSound = this.ambientPlayers.get(
            this.currentAmbientTrack,
          );
          if (ambientSound) {
            await ambientSound.setVolumeAsync(0);
            await ambientSound.stopAsync();
          }
        }
        if (this.currentCombatTrack) {
          const currentSound = this.combatPlayers.get(this.currentCombatTrack);
          if (currentSound) {
            await currentSound.setVolumeAsync(0);
            await currentSound.stopAsync();
          }
        }
      } else if (!disableFadeOut) {
        if (this.currentAmbientTrack) {
          const ambientSound = this.ambientPlayers.get(
            this.currentAmbientTrack,
          );
          if (ambientSound) {
            this.fadeSound(
              ambientSound,
              await this.getCurrentVolume(ambientSound),
              0,
              duration / 2,
              "fadeout",
            )
              .then(() => ambientSound.stopAsync())
              .catch(console.error);
          }
        }
        if (this.currentCombatTrack) {
          const currentSound = this.combatPlayers.get(this.currentCombatTrack);
          if (currentSound) {
            this.fadeSound(
              currentSound,
              await this.getCurrentVolume(currentSound),
              0,
              duration / 2,
              "fadeout",
            )
              .then(() => currentSound.stopAsync())
              .catch(console.error);
          }
        }
      }

      // Start new track
      const targetVolume = this.getEffectiveVolume("combatMusic");
      await newSound.setVolumeAsync(0);
      await newSound.playAsync();
      this.fadeSound(newSound, 0, targetVolume, duration, "fadein").catch(
        console.error,
      );

      this.currentAmbientTrack = null;
      this.currentCombatTrack = track;
    } catch (error) {
      console.error(`Failed to play combat track ${track}:`, error);
    }
  }

  async playSfx(id: keyof typeof SOUND_EFFECTS) {
    if (!this.isSoundEffectsLoaded) return;

    try {
      const sound = this.soundEffects.get(id);
      if (sound) {
        await sound.setVolumeAsync(this.getEffectiveVolume("soundEffects"));
        await sound.replayAsync();
      } else {
        console.error(`Sound effect ${id} not found`);
      }
    } catch (error) {
      console.error(`Failed to play sound effect ${id}:`, error);
    }
  }

  private async getCurrentVolume(sound: Sound): Promise<number> {
    try {
      const status = await sound.getStatusAsync();
      return status.isLoaded ? status.volume : 0;
    } catch {
      return 0;
    }
  }
  private async fadeSound(
    sound: Sound,
    startVolume: number,
    endVolume: number,
    duration: number,
    transitionId: string,
  ): Promise<void> {
    this.cancelTransition(transitionId);

    return new Promise((resolve) => {
      const steps = Math.max(duration / FADE_INTERVAL, 1);
      const volumeStep = (endVolume - startVolume) / steps;
      let currentStep = 0;
      let isCancelled = false;

      const interval = setInterval(() => {
        if (isCancelled) {
          clearInterval(interval);
          resolve();
          return;
        }

        currentStep++;
        const volume = startVolume + volumeStep * currentStep;
        sound
          .setVolumeAsync(Math.max(0, Math.min(1, volume)))
          .catch(console.error);

        if (currentStep >= steps) {
          clearInterval(interval);
          this.activeTransitions.delete(transitionId);
          resolve();
        }
      }, FADE_INTERVAL);

      this.activeTransitions.set(transitionId, {
        cancel: () => {
          isCancelled = true;
          this.activeTransitions.delete(transitionId);
        },
      });
    });
  }

  private cancelTransition(transitionId: string) {
    const transition = this.activeTransitions.get(transitionId);
    if (transition) {
      transition.cancel();
      this.activeTransitions.delete(transitionId);
    }
  }

  private cancelAllTransitions() {
    for (const transition of this.activeTransitions.values()) {
      transition.cancel();
    }
    this.activeTransitions.clear();
  }

  private getEffectiveVolume(
    type: "ambientMusic" | "combatMusic" | "soundEffects",
  ): number {
    const typeVolume =
      type === "ambientMusic"
        ? this.ambientMusicVolume
        : type === "combatMusic"
        ? this.combatMusicVolume
        : this.soundEffectsVolume;
    return this.muted
      ? 0
      : Math.min(1, Math.max(0, typeVolume * this.masterVolume));
  }

  setMuteValue(muted: boolean) {
    this.muted = muted;
    this.updateAllVolumes();
    this.persistSettings();
  }

  setAudioLevel(type: "master" | "ambient" | "sfx" | "combat", level: number) {
    if (level >= 0 && level <= 1) {
      switch (type) {
        case "master":
          this.masterVolume = level;
          break;
        case "ambient":
          this.ambientMusicVolume = level;
          break;
        case "sfx":
          this.soundEffectsVolume = level;
          break;
        case "combat":
          this.combatMusicVolume = level;
          break;
      }
      this.updateAllVolumes();
      this.persistSettings();
    }
  }

  private async updateAllVolumes() {
    try {
      if (this.currentAmbientTrack) {
        const sound = this.ambientPlayers.get(this.currentAmbientTrack);
        if (sound)
          await sound.setVolumeAsync(this.getEffectiveVolume("ambientMusic"));
      }
      if (this.currentCombatTrack) {
        const sound = this.combatPlayers.get(this.currentCombatTrack);
        if (sound)
          await sound.setVolumeAsync(this.getEffectiveVolume("combatMusic"));
      }
      for (const sound of this.soundEffects.values()) {
        await sound.setVolumeAsync(this.getEffectiveVolume("soundEffects"));
      }
    } catch (error) {
      console.error("Error updating volumes:", error);
    }
  }

  private loadPersistedSettings() {
    const stored = storage.getString("audio_settings");
    if (stored) {
      const settings = JSON.parse(stored);
      this.masterVolume = settings.master ?? 1;
      this.ambientMusicVolume = settings.ambient ?? 1;
      this.soundEffectsVolume = settings.sfx ?? 1;
      this.combatMusicVolume = settings.combat ?? 1;
      this.muted = settings.muted ?? false;
    }
  }

  private persistSettings() {
    const settings = {
      master: this.masterVolume,
      ambient: this.ambientMusicVolume,
      sfx: this.soundEffectsVolume,
      combat: this.combatMusicVolume,
      muted: this.muted,
    };
    storage.set("audio_settings", JSON.stringify(settings));
  }

  cleanup() {
    this.cancelAllTransitions();
    this.audioQueue = [];
    this.isProcessingQueue = false;

    if (this.currentAmbientTrack) {
      const sound = this.ambientPlayers.get(this.currentAmbientTrack);
      if (sound) {
        sound.stopAsync().catch(console.error);
      }
    }
    if (this.currentCombatTrack) {
      const sound = this.combatPlayers.get(this.currentCombatTrack);
      if (sound) {
        sound.stopAsync().catch(console.error);
      }
    }

    this.currentAmbientTrack = null;
    this.currentCombatTrack = null;
  }
}
