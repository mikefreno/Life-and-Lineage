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
const DEFAULT_FADE_STEPS = 20;

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
      debounce((current, previous) => {
        this.parseLocationForRelevantTrack(current, previous);
      }, 250),
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

      // if the track to play is currently being played, return
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
        this.activeTransition.trackOut.cancel();
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
          startVolume: currentVolume,
          soundName: this.currentTrack.name,
          directionality: "out",
          duration: DEFAULT_FADE,
        });
      }
      //start fade in of new track
      this.fadeSound({
        sound: newSound,
        soundCategory: "combatMusic",
        soundName: track,
        startVolume: 0,
        directionality: "in",
        duration: DEFAULT_FADE,
      });
      this.currentTrack = {
        name: track,
        sound: newSound,
        category: "combatMusic",
      };
    } catch (error) {
      console.error(`Failed to play combat track ${track}:`, error);
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
    let usingDefaults = duration === DEFAULT_FADE;
    const targetVolume =
      directionality === "in" ? this.getEffectiveVolume(soundCategory) : 0;

    return this.withTimeout<void>(
      new Promise(async (resolve, reject) => {
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

  cleanup() {
    this.activeTransition = { trackIn: null, trackOut: null };

    if (this.currentTrack) {
      this.currentTrack.sound.stopAsync().catch(console.error);
    }
    this.currentTrack = null;
  }
}
