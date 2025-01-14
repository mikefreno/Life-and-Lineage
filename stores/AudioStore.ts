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

  private isTransitioning: boolean = false;

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
      () => this.isAmbientLoaded,
      (val) => {
        if (val) {
          this.playAmbient();
        }
      },
    );

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
        playsInSilentModeIOS: false,
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

  async playAmbient(params?: {
    track?: keyof typeof AMBIENT_TRACKS;
    duration?: number;
    disableFadeOut?: boolean;
  }) {
    const {
      track,
      duration = DEFAULT_FADE,
      disableFadeOut = false,
    } = params ?? {};

    if (!this.isAmbientLoaded || this.isTransitioning) return;

    try {
      this.isTransitioning = true;
      let selectedTrack = track;
      if (!selectedTrack) {
        const playerAge = this.root.playerState?.age ?? 0;

        if (this.root.dungeonStore.isInDungeon) {
          selectedTrack = "dungeon";
        } else if (this.root.shopsStore.inMarket) {
          selectedTrack = "shops";
        } else {
          if (playerAge < 30) {
            selectedTrack = "young";
          } else if (playerAge < 60) {
            selectedTrack = "middle";
          } else {
            selectedTrack = "old";
          }
        }
      }

      if (this.currentAmbientTrack === selectedTrack) {
        this.isTransitioning = false;
        return;
      }

      const newSound = this.ambientPlayers.get(selectedTrack);
      if (!newSound)
        throw new Error(`Ambient track ${selectedTrack} not found`);

      const targetVolume = this.getEffectiveVolume("ambientMusic");

      // Fade out current ambient or combat track if playing
      if (this.currentAmbientTrack && !disableFadeOut) {
        const currentSound = this.ambientPlayers.get(this.currentAmbientTrack);
        if (currentSound) {
          await this.fadeSound(
            currentSound,
            this.getEffectiveVolume("ambientMusic"),
            0,
            duration,
          );
          await currentSound.stopAsync();
        }
      } else if (this.currentCombatTrack && !disableFadeOut) {
        const currentSound = this.combatPlayers.get(this.currentCombatTrack);
        if (currentSound) {
          await this.fadeSound(
            currentSound,
            this.getEffectiveVolume("combatMusic"),
            0,
            duration,
          );
          await currentSound.stopAsync();
        }
        this.currentCombatTrack = null;
      }

      // Play and fade in new track
      await newSound.setVolumeAsync(0);
      await newSound.playAsync();
      await this.fadeSound(newSound, 0, targetVolume, duration);

      this.currentAmbientTrack = selectedTrack;
    } catch (error) {
      console.error(`Failed to play ambient track:`, error);
    } finally {
      this.isTransitioning = false;
    }
  }

  async playCombat({
    track,
    duration = DEFAULT_FADE,
    disableFadeOut = false,
  }: {
    track: keyof typeof COMBAT_TRACKS;
    duration?: number;
    disableFadeOut?: boolean;
  }) {
    if (!this.isCombatLoaded || this.isTransitioning) return;

    try {
      this.isTransitioning = true;
      const newSound = this.combatPlayers.get(track);
      if (!newSound) throw new Error(`Combat track ${track} not found`);

      const targetVolume = this.getEffectiveVolume("combatMusic");

      // Fade out current ambient or combat track if playing
      if (this.currentAmbientTrack && !disableFadeOut) {
        const currentSound = this.ambientPlayers.get(this.currentAmbientTrack);
        if (currentSound) {
          await this.fadeSound(
            currentSound,
            this.getEffectiveVolume("ambientMusic"),
            0,
            duration,
          );
          await currentSound.stopAsync();
        }
        this.currentAmbientTrack = null;
      } else if (this.currentCombatTrack && !disableFadeOut) {
        const currentSound = this.combatPlayers.get(this.currentCombatTrack);
        if (currentSound) {
          await this.fadeSound(currentSound, targetVolume, 0, duration);
          await currentSound.stopAsync();
        }
      }

      // Play and fade in new track
      await newSound.setVolumeAsync(0);
      await newSound.playAsync();
      await this.fadeSound(newSound, 0, targetVolume, duration);

      this.currentCombatTrack = track;
    } catch (error) {
      console.error(`Failed to play combat track ${track}:`, error);
    } finally {
      this.isTransitioning = false;
    }
  }

  async playSfx(id: keyof typeof SOUND_EFFECTS) {
    if (!this.isSoundEffectsLoaded) return;

    try {
      const sound = this.soundEffects.get(id);
      if (sound) {
        // Set the volume and play immediately
        await sound.setVolumeAsync(this.getEffectiveVolume("soundEffects"));
        await sound.replayAsync();
      } else {
        console.error(`Sound effect ${id} not found`);
      }
    } catch (error) {
      console.error(`Failed to play sound effect ${id}:`, error);
    }
  }

  private async fadeSound(
    sound: Sound,
    startVolume: number,
    endVolume: number,
    duration: number,
  ): Promise<void> {
    const steps = Math.max(duration / FADE_INTERVAL, 1);
    const volumeStep = (endVolume - startVolume) / steps;

    for (let i = 0; i <= steps; i++) {
      const volume = startVolume + volumeStep * i;
      await sound.setVolumeAsync(Math.max(0, Math.min(1, volume)));
      if (i < steps) {
        await new Promise((resolve) => setTimeout(resolve, FADE_INTERVAL));
      }
    }
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
}
