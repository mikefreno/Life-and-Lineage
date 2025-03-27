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
import * as Sentry from "@sentry/react-native";

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
const DEFAULT_FADE_STEPS = 20;
const GLOBAL_MULT = 0.8;

const AUDIO_FOCUS_ERROR = "expo.modules.av.AudioFocusNotAcquiredException";
const BACKGROUND_ERROR_MESSAGE =
  "This experience is currently in the background";

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

  currentTrack: {
    name: string;
    sound: Sound;
    category: "ambientMusic" | "combatMusic";
  } | null = null;

  private activeTransition: {
    trackIn: { cancel: () => Promise<void>; sound: Sound; name: string } | null;
    trackOut: {
      cancel: () => Promise<void>;
      sound: Sound;
      name: string;
    } | null;
  } = { trackIn: null, trackOut: null };

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
      currentTrack: observable,
      isAmbientLoaded: observable,
      isCombatLoaded: observable,

      loadAudioResources: action,
      playAmbient: action,
      playCombat: action,
      playSfx: action,
      setMuteValue: action,
      setAudioLevel: action,
      cleanup: action,
    });

    this.initializeAudio();

    reaction(
      () => ({
        inDungeon: this.root.dungeonStore.isInDungeon,
        inMarket: this.root.shopsStore.inMarket,
        playerAge: this.root.playerState?.age ?? 0,
        inCombat: this.root.dungeonStore.inCombat,
      }),
      (current, previous) => {
        this.parseLocationForRelevantTrack(current, previous);
      },
    );
    reaction(
      () => this.currentTrack?.name,
      () => this.setMuteValue(this.muted),
    );
  }

  private parseLocationForRelevantTrack(current?: any, previous?: any) {
    if (!previous || !current) {
      if (this.root.dungeonStore.inCombat) {
        this.playCombat("basic");
      } else {
        this.playAmbient();
      }
    }
    if (current.inCombat !== previous?.inCombat) {
      if (current.inCombat) {
        this.playCombat("basic");
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
      this.cleanup();
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

  async playAmbient(track?: keyof typeof AMBIENT_TRACKS) {
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

      if (this.currentTrack?.name === selectedTrack) return;

      const newSound = this.ambientPlayers.get(selectedTrack);
      if (!newSound) {
        throw new Error(`Ambient track ${selectedTrack} not found`);
      }

      //checks for active transitions
      if (this.activeTransition.trackOut) {
        // nothing special here, we just cancel this to make room for the new fade out
        await this.activeTransition.trackOut.cancel();
      }
      // fade in tracks are the `this.currentTrack`, during transition, we use the transition cancel(which inits the special case) instead of starting a new fade directly
      if (this.activeTransition.trackIn) {
        this.activeTransition.trackIn.cancel();
      } else if (this.currentTrack) {
        const currentVolume = await this.getCurrentVolume(
          this.currentTrack.sound,
        );
        this.fadeSound({
          sound: this.currentTrack.sound,
          soundCategory: "ambientMusic",
          soundName: this.currentTrack.name,
          startVolume: currentVolume,
          directionality: "out",
          duration: DEFAULT_FADE,
        });
      }

      runInAction(() => {
        this.currentTrack = {
          name: selectedTrack,
          sound: newSound,
          category: "ambientMusic",
        };
      });

      //start fade in of new track
      this.fadeSound({
        sound: this.currentTrack!.sound,
        soundCategory: "ambientMusic",
        soundName: selectedTrack,
        startVolume: 0,
        directionality: "in",
        duration: DEFAULT_FADE,
      });
    } catch (error) {
      console.error(`Failed to play ambient track:`, error);
      await this.recoverFromError();
    }
  }

  async playCombat(track: keyof typeof COMBAT_TRACKS) {
    if (!this.isCombatLoaded) return;

    try {
      if (this.currentTrack?.name === track) return;

      const newSound = this.combatPlayers.get(track);
      if (!newSound) {
        throw new Error(`Combat track ${track} not found`);
      }

      //checks for active transitions
      if (this.activeTransition.trackOut) {
        // nothing special here, we just cancel this to make room for the new fade out
        await this.activeTransition.trackOut.cancel();
      }
      // fade in tracks are the `this.currentTrack`, during transition, we use the transition cancel(which inits the special case) instead of starting a new fade directly
      if (this.activeTransition.trackIn) {
        this.activeTransition.trackIn.cancel();
      } else if (this.currentTrack) {
        const currentVolume = await this.getCurrentVolume(
          this.currentTrack.sound,
        );
        this.fadeSound({
          sound: this.currentTrack.sound,
          soundCategory: "combatMusic",
          soundName: this.currentTrack.name,
          startVolume: currentVolume,
          directionality: "out",
          duration: DEFAULT_FADE,
        });
      }

      runInAction(() => {
        this.currentTrack = {
          name: track,
          sound: newSound,
          category: "combatMusic",
        };
      });

      //start fade in of new track
      this.fadeSound({
        sound: this.currentTrack!.sound,
        soundCategory: "combatMusic",
        soundName: track,
        startVolume: 0,
        directionality: "in",
        duration: DEFAULT_FADE,
      });
    } catch (error) {
      console.error(`Failed to play combat track:`, error);
      await this.recoverFromError();
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

  async getPlayingTracksCount() {
    let ambientCount = 0;
    let combatCount = 0;

    // Check ambient players
    for (const sound of this.ambientPlayers.values()) {
      const status = await sound.getStatusAsync();
      if (status.isLoaded && status.isPlaying) ambientCount++;
    }

    // Check combat players
    for (const sound of this.combatPlayers.values()) {
      const status = await sound.getStatusAsync();
      if (status.isLoaded && status.isPlaying) combatCount++;
    }

    return { ambientCount, combatCount };
  }

  private async getCurrentVolume(sound: Sound): Promise<number> {
    try {
      const status = await sound.getStatusAsync();
      return status.isLoaded ? status.volume : 0;
    } catch {
      return 0;
    }
  }

  private async fadeSound({
    sound,
    soundCategory,
    soundName,
    duration = DEFAULT_FADE,
    startVolume,
    directionality,
  }: {
    sound: Sound;
    soundCategory: "ambientMusic" | "combatMusic";
    soundName: string;
    duration: number;
    startVolume: number;
    directionality: "in" | "out";
  }) {
    // Check if sound is loaded before attempting to fade
    try {
      const status = await sound.getStatusAsync();
      if (!status.isLoaded) {
        console.warn(
          `Cannot fade ${soundCategory} ${soundName}: Sound not loaded`,
        );
        return;
      }
    } catch (error) {
      console.warn(
        `Error checking sound status for ${soundCategory} ${soundName}:`,
        error,
      );
      return;
    }

    let usingDefaults = duration === DEFAULT_FADE;
    const targetVolume =
      directionality === "in" ? this.getEffectiveVolume(soundCategory) : 0;

    return this.withTimeout<void>(
      new Promise(async (resolve, reject) => {
        try {
          if (directionality == "in") {
            await sound.setVolumeAsync(0);
            await sound.playAsync();
          }

          const steps = usingDefaults
            ? DEFAULT_FADE_STEPS
            : Math.max(Math.floor(duration / FADE_INTERVAL), 1);
          const volumeStep = (targetVolume - startVolume) / steps;
          let interrupt = false;
          let isCleanedUp = false;
          let currentStep = 0;

          // Create cancel promise resolver
          let cancelResolve: () => void;
          const cancelPromise = new Promise<void>((resolve) => {
            cancelResolve = resolve;
          });

          const interval = setInterval(async () => {
            if (interrupt) {
              clearInterval(interval);
              if (directionality === "in") {
                // If interrupted while fading in, start fading out from current volume
                const currentVolume = await this.getCurrentVolume(sound);
                await this.fadeSound({
                  sound,
                  soundCategory,
                  duration,
                  soundName,
                  startVolume: currentVolume,
                  directionality: "out",
                });
              } else {
                // If interrupted while fading out, just stop immediately
                await sound.setVolumeAsync(0);
                await sound.pauseAsync();
              }
              isCleanedUp = true;
              cancelResolve();
              resolve();
              return;
            }

            try {
              // Set up cancel function if this is the first interval
              if (currentStep === 0) {
                if (directionality === "in") {
                  this.activeTransition.trackIn = {
                    cancel: async () => {
                      interrupt = true;
                      await new Promise<void>((resolve) => {
                        const checkInterval = setInterval(() => {
                          if (isCleanedUp) {
                            clearInterval(checkInterval);
                            resolve();
                          }
                        }, 10);
                      });
                      await cancelPromise;
                    },
                    sound,
                    name: soundName,
                  };
                } else {
                  this.activeTransition.trackOut = {
                    cancel: async () => {
                      interrupt = true;
                      await new Promise<void>((resolve) => {
                        const checkInterval = setInterval(() => {
                          if (isCleanedUp) {
                            clearInterval(checkInterval);
                            resolve();
                          }
                        }, 10);
                      });
                      await cancelPromise;
                    },
                    sound,
                    name: soundName,
                  };
                }
              }

              // Calculate and set new volume
              currentStep++;
              const volume = startVolume + volumeStep * currentStep;
              const clampedVolume = Math.max(0, Math.min(1, volume));
              await sound.setVolumeAsync(clampedVolume);

              // Check if fade is complete
              if (currentStep >= steps) {
                clearInterval(interval);
                if (directionality === "in") {
                  this.activeTransition.trackIn = null;
                } else {
                  this.activeTransition.trackOut = null;
                  await sound.pauseAsync();
                }
                isCleanedUp = true;
                cancelResolve();
                resolve();
              }
            } catch (error) {
              clearInterval(interval);
              if (directionality === "in") {
                this.activeTransition.trackIn = null;
              } else {
                this.activeTransition.trackOut = null;
              }
              isCleanedUp = true;
              cancelResolve();
              reject(error);
            }
          }, FADE_INTERVAL);
        } catch (error) {
          reject(error);
        }
      }),
      duration * 3,
      `fade_${directionality}_${soundCategory}_${soundName}`,
    );
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
      : Math.min(1, Math.max(0, typeVolume * this.masterVolume * GLOBAL_MULT));
  }

  setMuteValue(muted: boolean) {
    this.muted = muted;

    if (muted) {
      if (this.currentTrack) {
        this.currentTrack.sound
          .pauseAsync()
          .catch((error) =>
            console.error("Error pausing current track:", error),
          );
      }
    } else {
      if (this.currentTrack) {
        this.currentTrack.sound
          .playAsync()
          .catch((error) =>
            console.error("Error resuming current track:", error),
          );
      }
    }

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
      if (this.currentTrack) {
        await this.currentTrack.sound.setVolumeAsync(
          this.getEffectiveVolume(this.currentTrack.category),
        );
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

  private async recoverFromError() {
    this.cleanup();
    await new Promise((resolve) => setTimeout(resolve, 1000));
    try {
      await this.initializeAudio();
    } catch (error) {
      console.error("Failed to recover audio system:", error);
    }
  }

  private async withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    operation: string,
  ) {
    let timeoutId: NodeJS.Timeout;

    const timeoutPromise = new Promise<T>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(
          new Error(
            `Audio operation "${operation}" timed out after ${timeoutMs}ms`,
          ),
        );
      }, timeoutMs);
    });

    try {
      const result = await Promise.race([promise, timeoutPromise]);
      clearTimeout(timeoutId!);
      return result;
    } catch (error) {
      clearTimeout(timeoutId!);
      console.error(`Audio operation "${operation}" failed:`, error);
      // Kill the hanging audio process
      this.cleanup();
      // Reset state
      this.currentTrack = null;
      this.parseLocationForRelevantTrack();
    }
  }

  private isBackgroundError(error: any): boolean {
    if (!error) return false;

    // Check for the specific error message about audio focus
    const errorMessage = error.message || error.toString();
    return (
      (typeof errorMessage === "string" &&
        (errorMessage.includes(AUDIO_FOCUS_ERROR) ||
          errorMessage.includes(BACKGROUND_ERROR_MESSAGE))) ||
      error.name === AUDIO_FOCUS_ERROR
    );
  }

  cleanup() {
    try {
      this.activeTransition = { trackIn: null, trackOut: null };

      // Clean up all sound objects
      const cleanupPromises: Promise<any>[] = [];

      if (this.currentTrack) {
        cleanupPromises.push(
          this.currentTrack.sound.stopAsync().catch((e) => {
            if (!this.isBackgroundError(e)) {
              this.logError(
                `Failed to stop current track: ${this.currentTrack?.name}`,
                e,
              );
            }
          }),
        );
      }

      // Unload all ambient tracks
      this.ambientPlayers.forEach((sound, id) => {
        cleanupPromises.push(
          sound.unloadAsync().catch((e) => {
            if (!this.isBackgroundError(e)) {
              this.logError(`Failed to unload ambient track: ${id}`, e);
            }
          }),
        );
      });

      // Unload all combat tracks
      this.combatPlayers.forEach((sound, id) => {
        cleanupPromises.push(
          sound.unloadAsync().catch((e) => {
            if (!this.isBackgroundError(e)) {
              this.logError(`Failed to unload combat track: ${id}`, e);
            }
          }),
        );
      });

      // Unload all sound effects
      this.soundEffects.forEach((sound, id) => {
        cleanupPromises.push(
          sound.unloadAsync().catch((e) => {
            if (!this.isBackgroundError(e)) {
              this.logError(`Failed to unload sound effect: ${id}`, e);
            }
          }),
        );
      });

      // Clear maps
      this.ambientPlayers.clear();
      this.combatPlayers.clear();
      this.soundEffects.clear();

      runInAction(() => {
        this.currentTrack = null;
        this.isAmbientLoaded = false;
        this.isCombatLoaded = false;
        this.isSoundEffectsLoaded = false;
      });

      Promise.all(cleanupPromises).catch((e) => {
        if (!this.isBackgroundError(e)) {
          this.logError("Error during audio cleanup", e);
        }
      });
    } catch (error) {
      if (!this.isBackgroundError(error)) {
        this.logError("Error during audio cleanup", error);
      }
    }
  }

  private logError(message: string, error: any) {
    console.warn(message, error);

    Sentry.withScope((scope) => {
      scope.setTag("component", "AudioStore");

      scope.setContext("audioState", {
        isAmbientLoaded: this.isAmbientLoaded,
        isCombatLoaded: this.isCombatLoaded,
        isSoundEffectsLoaded: this.isSoundEffectsLoaded,
        currentTrack: this.currentTrack?.name || "none",
      });

      if (error instanceof Error) {
        Sentry.captureException(error);
      } else {
        Sentry.captureMessage(`${message}: ${JSON.stringify(error)}`);
      }
    });
  }
}
