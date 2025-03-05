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
import { Platform, InteractionManager } from "react-native";
import * as Device from "expo-device";

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

const runOnMainThread = (
  operation: () => Promise<any> | void,
): Promise<any> => {
  if (Platform.OS === "android") {
    return new Promise((resolve, reject) => {
      InteractionManager.runAfterInteractions(() => {
        try {
          const result = operation();
          if (result instanceof Promise) {
            result.then(resolve).catch(reject);
          } else {
            resolve(result);
          }
        } catch (error) {
          reject(error);
        }
      });
    });
  } else {
    return Promise.resolve(operation());
  }
};

const GLOBAL_VOLUME_MULTIPLIER = 0.7;

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

  private isDestroying: boolean = false;

  audioOverride = Device.isDevice;

  constructor({ root }: { root: RootStore }) {
    this.root = root;
    this.loadPersistedSettings();
    this.initializeAudio();

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
      audioOverride: observable,

      toggleAudioOverride: action,
      loadAudioResources: action,
      playAmbient: action,
      playCombat: action,
      playSfx: action,
      setMuteValue: action,
      setAudioLevel: action,
      cleanup: action,
      prepareForDestroy: action,
    });

    this.root.addDevAction({
      action: () => this.toggleAudioOverride(),
      name: "Toggle Audio Override",
    });

    reaction(
      () => ({
        inDungeon: this.root.dungeonStore.isInDungeon,
        inMarket: this.root.shopsStore.inMarket,
        playerAge: this.root.playerState?.age ?? 0,
        inCombat: this.root.dungeonStore.inCombat,
      }),
      debounce((current, previous) => {
        if (!this.isDestroying) {
          this.parseLocationForRelevantTrack(current, previous);
        }
      }, 250),
    );
  }

  toggleAudioOverride() {
    if (__DEV__) {
      if (this.audioOverride) {
        this.audioOverride = false;
        this.cleanup();
      } else {
        this.audioOverride = true;
        this.initializeAudio();
      }
    }
  }

  prepareForDestroy() {
    this.isDestroying = true;
    this.cleanup();
  }

  private parseLocationForRelevantTrack(current?: any, previous?: any) {
    if (current === undefined || this.isDestroying || !this.audioOverride)
      return;
    try {
      if (previous === undefined) {
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
    } catch {
      this.recoverFromError();
    }
  }

  private async initializeAudio() {
    if (this.isDestroying) return;

    try {
      await runOnMainThread(async () => {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
        });
      });

      await this.loadAudioResources();
    } catch (error) {
      console.error("Failed to initialize audio:", error);
    }
  }

  async loadAudioResources() {
    if (this.isDestroying) return;

    try {
      await Promise.all([
        this.loadSoundEffects().then(() => {
          if (!this.isDestroying) {
            runInAction(() => (this.isSoundEffectsLoaded = true));
          }
        }),
        this.loadAmbientTracks().then(() => {
          if (!this.isDestroying) {
            runInAction(() => {
              this.isAmbientLoaded = true;
              this.root.uiStore.markStoreAsLoaded("ambient");
            });
          }
        }),
        this.loadCombatTracks().then(() => {
          if (!this.isDestroying) {
            runInAction(() => (this.isCombatLoaded = true));
          }
        }),
      ]);

      if (this.isAmbientLoaded && !this.isDestroying) {
        setTimeout(() => this.parseLocationForRelevantTrack(), 1000);
      }
    } catch (error) {
      console.error("Failed to load audio resources:", error);
    }
  }

  private async loadSoundEffects() {
    if (this.isDestroying) return;

    const loadPromises = Object.entries(SOUND_EFFECTS).map(
      async ([id, source]) => {
        if (this.isDestroying) return;

        const { sound } = await runOnMainThread(() =>
          Audio.Sound.createAsync(source, {
            volume: this.getEffectiveVolume("soundEffects"),
          }),
        );

        if (!this.isDestroying) {
          this.soundEffects.set(id, sound);
        } else {
          // If we're destroying, unload the sound immediately
          await sound.unloadAsync().catch(() => {});
        }
      },
    );

    await Promise.all(loadPromises);
  }

  private async loadAmbientTracks() {
    if (this.isDestroying) return;

    const loadPromises = Object.entries(AMBIENT_TRACKS).map(
      async ([id, source]) => {
        if (this.isDestroying) return;

        const { sound } = await runOnMainThread(() =>
          Audio.Sound.createAsync(source, {
            volume: 0,
            isLooping: true,
          }),
        );

        if (!this.isDestroying) {
          this.ambientPlayers.set(id, sound);
        } else {
          // If we're destroying, unload the sound immediately
          await sound.unloadAsync().catch(() => {});
        }
      },
    );

    await Promise.all(loadPromises);
  }

  private async loadCombatTracks() {
    if (this.isDestroying) return;

    const loadPromises = Object.entries(COMBAT_TRACKS).map(
      async ([id, source]) => {
        if (this.isDestroying) return;

        const { sound } = await runOnMainThread(() =>
          Audio.Sound.createAsync(source, {
            volume: 0,
            isLooping: true,
          }),
        );

        if (!this.isDestroying) {
          this.combatPlayers.set(id, sound);
        } else {
          await sound.unloadAsync().catch(() => {});
        }
      },
    );

    await Promise.all(loadPromises);
  }

  async playAmbient(track?: keyof typeof AMBIENT_TRACKS) {
    if (!this.isAmbientLoaded || this.isDestroying) return;

    try {
      let selectedTrack = track;
      if (!selectedTrack) {
        // select correct default track
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

      await runOnMainThread(async () => {
        if (this.isDestroying) return;

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
      });

      if (this.isDestroying) return;

      runInAction(() => {
        this.currentTrack = {
          name: selectedTrack,
          sound: newSound,
          category: "ambientMusic",
        };
      });

      await runOnMainThread(() => {
        if (!this.isDestroying && this.currentTrack) {
          return this.fadeSound({
            sound: this.currentTrack.sound,
            soundCategory: "ambientMusic",
            soundName: selectedTrack,
            startVolume: 0,
            directionality: "in",
            duration: DEFAULT_FADE,
          });
        }
      });
    } catch (error) {
      console.error(`Failed to play ambient track:`, error);
      await this.recoverFromError();
    }
  }

  async playCombat(track: keyof typeof COMBAT_TRACKS) {
    if (!this.isCombatLoaded || this.isDestroying) return;

    try {
      if (this.currentTrack?.name === track) return;

      const newSound = this.combatPlayers.get(track);
      if (!newSound) {
        throw new Error(`Combat track ${track} not found`);
      }

      // Run on main thread for Android
      await runOnMainThread(async () => {
        if (this.isDestroying) return;

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
      });

      if (this.isDestroying) return;

      runInAction(() => {
        this.currentTrack = {
          name: track,
          sound: newSound,
          category: "combatMusic",
        };
      });

      await runOnMainThread(() => {
        if (!this.isDestroying && this.currentTrack) {
          return this.fadeSound({
            sound: this.currentTrack.sound,
            soundCategory: "combatMusic",
            soundName: track,
            startVolume: 0,
            directionality: "in",
            duration: DEFAULT_FADE,
          });
        }
      });
    } catch (error) {
      console.error(`Failed to play combat track:`, error);
      await this.recoverFromError();
    }
  }

  async playSfx(id: keyof typeof SOUND_EFFECTS) {
    if (!this.isSoundEffectsLoaded || this.isDestroying) return;

    try {
      const sound = this.soundEffects.get(id);
      if (sound) {
        await runOnMainThread(async () => {
          if (this.isDestroying) return;
          await sound.setVolumeAsync(this.getEffectiveVolume("soundEffects"));
          await sound.replayAsync();
        });
      } else {
        console.error(`Sound effect ${id} not found`);
      }
    } catch (error) {
      console.error(`Failed to play sound effect ${id}:`, error);
    }
  }

  async getPlayingTracksCount() {
    if (this.isDestroying) return { ambientCount: 0, combatCount: 0 };

    let ambientCount = 0;
    let combatCount = 0;

    try {
      // Run on main thread for Android
      await runOnMainThread(async () => {
        // Check ambient players
        for (const sound of this.ambientPlayers.values()) {
          if (this.isDestroying) break;
          try {
            const status = await sound.getStatusAsync();
            if (status.isLoaded && status.isPlaying) ambientCount++;
          } catch (e) {
            // Ignore errors during status check
          }
        }

        // Check combat players
        for (const sound of this.combatPlayers.values()) {
          if (this.isDestroying) break;
          try {
            const status = await sound.getStatusAsync();
            if (status.isLoaded && status.isPlaying) combatCount++;
          } catch (e) {
            // Ignore errors during status check
          }
        }
      });
    } catch (error) {
      console.error("Error getting playing tracks count:", error);
    }

    return { ambientCount, combatCount };
  }

  private async getCurrentVolume(sound: Sound): Promise<number> {
    if (this.isDestroying) return 0;

    try {
      return await runOnMainThread(async () => {
        try {
          const status = await sound.getStatusAsync();
          return status.isLoaded ? status.volume : 0;
        } catch {
          return 0;
        }
      });
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
    if (this.isDestroying) return;

    let usingDefaults = duration === DEFAULT_FADE;
    const targetVolume =
      directionality === "in" ? this.getEffectiveVolume(soundCategory) : 0;

    return this.withTimeout<void>(
      new Promise(async (resolve, reject) => {
        if (this.isDestroying) {
          resolve();
          return;
        }

        if (directionality == "in") {
          await runOnMainThread(async () => {
            if (this.isDestroying) return;
            await sound.setVolumeAsync(0);
            await sound.playAsync();
          });
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
          if (interrupt || this.isDestroying) {
            clearInterval(interval);
            if (directionality === "in") {
              // If interrupted while fading in, start fading out from current volume
              if (!this.isDestroying) {
                const currentVolume = await this.getCurrentVolume(sound);
                await this.fadeSound({
                  sound,
                  soundCategory,
                  duration,
                  soundName,
                  startVolume: currentVolume,
                  directionality: "out",
                });
              }
            } else {
              // If interrupted while fading out, just stop immediately
              await runOnMainThread(async () => {
                try {
                  await sound.setVolumeAsync(0);
                  await sound.pauseAsync();
                } catch (e) {
                  // Ignore errors during cleanup
                }
              });
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

            await runOnMainThread(async () => {
              if (this.isDestroying) return;
              try {
                await sound.setVolumeAsync(clampedVolume);
              } catch (e) {
                // Ignore errors during volume change
              }
            });

            // Check if fade is complete
            if (currentStep >= steps) {
              clearInterval(interval);
              if (directionality === "in") {
                this.activeTransition.trackIn = null;
              } else {
                this.activeTransition.trackOut = null;
                await runOnMainThread(async () => {
                  if (this.isDestroying) return;
                  try {
                    await sound.pauseAsync();
                  } catch (e) {
                    // Ignore errors during pause
                  }
                });
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
      : Math.min(
          1,
          Math.max(
            0,
            typeVolume * this.masterVolume * GLOBAL_VOLUME_MULTIPLIER,
          ),
        );
  }

  setMuteValue(muted: boolean) {
    if (this.isDestroying) return;

    this.muted = muted;
    this.updateAllVolumes();
    this.persistSettings();
  }

  setAudioLevel(type: "master" | "ambient" | "sfx" | "combat", level: number) {
    if (this.isDestroying) return;

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
    if (this.isDestroying) return;

    try {
      await runOnMainThread(async () => {
        if (this.isDestroying) return;

        if (this.currentTrack) {
          try {
            await this.currentTrack.sound.setVolumeAsync(
              this.getEffectiveVolume(this.currentTrack.category),
            );
          } catch (e) {}
        }

        for (const sound of this.soundEffects.values()) {
          if (this.isDestroying) break;
          try {
            await sound.setVolumeAsync(this.getEffectiveVolume("soundEffects"));
          } catch (e) {}
        }
      });
    } catch (error) {
      console.error("Error updating volumes:", error);
    }
  }

  private loadPersistedSettings() {
    const stored = storage.getString("audio_settings");
    if (stored) {
      try {
        const settings = JSON.parse(stored);
        this.masterVolume = settings.master ?? 1;
        this.ambientMusicVolume = settings.ambient ?? 1;
        this.soundEffectsVolume = settings.sfx ?? 1;
        this.combatMusicVolume = settings.combat ?? 1;
        this.muted = settings.muted ?? false;
      } catch (e) {
        console.error("Error loading audio settings:", e);
      }
    }
  }

  private persistSettings() {
    if (this.isDestroying) return;

    const settings = {
      master: this.masterVolume,
      ambient: this.ambientMusicVolume,
      sfx: this.soundEffectsVolume,
      combat: this.combatMusicVolume,
      muted: this.muted,
    };

    try {
      storage.set("audio_settings", JSON.stringify(settings));
    } catch (e) {
      console.error("Error persisting audio settings:", e);
    }
  }

  private async recoverFromError() {
    if (this.isDestroying) return;

    this.cleanup();
    await new Promise((resolve) => setTimeout(resolve, 20000));

    if (!this.isDestroying) {
      try {
        await this.initializeAudio();
      } catch (error) {
        console.error("Failed to recover audio system:", error);
      }
    }
  }

  private async withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    operation: string,
  ) {
    if (this.isDestroying) return null as any;

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

      if (!this.isDestroying) {
        this.parseLocationForRelevantTrack();
      }

      return null as any;
    }
  }

  cleanup() {
    this.activeTransition = { trackIn: null, trackOut: null };

    const cleanupSound = async (sound: Sound) => {
      try {
        await runOnMainThread(async () => {
          try {
            await sound.stopAsync();
            await sound.unloadAsync();
          } catch (e) {}
        });
      } catch (e) {}
    };

    if (this.currentTrack) {
      cleanupSound(this.currentTrack.sound).catch(() => {});
      this.currentTrack = null;
    }

    this.ambientPlayers.forEach((sound) => {
      cleanupSound(sound).catch(() => {});
    });

    this.combatPlayers.forEach((sound) => {
      cleanupSound(sound).catch(() => {});
    });

    this.soundEffects.forEach((sound) => {
      cleanupSound(sound).catch(() => {});
    });

    if (this.isDestroying) {
      this.ambientPlayers.clear();
      this.combatPlayers.clear();
      this.soundEffects.clear();
    }
  }
}
