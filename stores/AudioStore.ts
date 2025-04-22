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
  Audio,
  AVPlaybackStatus,
  InterruptionModeAndroid,
  InterruptionModeIOS,
} from "expo-av";
import {
  TrackName,
  TrackType,
  GeneralSoundTrack,
  DungeonSoundTrack,
  TrackMap,
} from "@/utility/audio";
import { getRandomInt } from "@/utility/functions/misc";

const DEFAULT_FADE_TIMEOUT = 50;
const DEFAULT_FADE_STEPS = 20;
const GLOBAL_MULT = 0.8;

type MusicInfo = {
  trackName: TrackName;
  trackRequire: any;
  type: "dungeon" | "ambient";
  sound: Audio.Sound;
  fade: NodeJS.Timeout | null;
} | null;

export class AudioStore {
  root: RootStore;

  masterVolume: number = 1;
  ambientMusicVolume: number = 1;
  dungeonMusicVolume: number = 1;
  soundEffectsVolume: number = 1;
  muted: boolean = false;

  storedPositionOnMute: number | undefined;

  currentlyPlayingMusic: MusicInfo = null;
  outboundMusic: MusicInfo = null;

  nextTrackStartTimeout: NodeJS.Timeout | null = null;

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
      dungeonMusicVolume: observable,
      muted: observable,

      setCurrentlyPlayingMusic: action,
      cleanup: action,
      crossFade: action,
      setAudioLevel: action,
      setMuteValue: action,
      getEffectiveVolume: action,
    });
  }

  initializeReactions() {
    reaction(
      () => [
        this.masterVolume,
        this.ambientMusicVolume,
        this.soundEffectsVolume,
        this.dungeonMusicVolume,
        this.muted,
      ],
      () => this.persistSettings(),
    );

    reaction(
      () => ({
        inDungeon: this.root.dungeonStore.isInDungeon,
        playerAge: this.root.playerState?.age ?? 0,
        inCombat: this.root.dungeonStore.inCombat,
        inBossFight: this.root.dungeonStore.fightingBoss,
      }),
      () => {
        try {
          if (!this.muted) {
            this.headliner();
          }
        } catch (error) {
          console.warn("Error in location reaction", error);
        }
      },
    );
  }

  async initializeAudio() {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        interruptionModeIOS: InterruptionModeIOS.MixWithOthers,
        interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
        shouldDuckAndroid: true,
      }).then(() => {
        this.headliner();
      });
    } catch (error) {
      console.warn("Failed to initialize audio", error);
    }
  }

  headliner() {
    const { trackName, type } = this.getCorrectTrack();
    if (
      !this.root.dungeonStore.isFightingFinalInstanceBoss &&
      (trackName === this.currentlyPlayingMusic?.trackName ||
        type === this.currentlyPlayingMusic?.type)
    ) {
      return;
    }
    // crossfade if a track is currently being played
    if (this.currentlyPlayingMusic) {
      this.crossFade(trackName, type);
    } else {
      //just play it
      this.fadeInTrack(trackName, type);
    }
  }

  getCorrectTrack(): { trackName: TrackName; type: "ambient" | "dungeon" } {
    if (!this.root.playerState) {
      return { trackName: "Campfire", type: "ambient" }; // a nice song to into player with
    }
    if (this.root.dungeonStore.isInDungeon) {
      return { trackName: this.getDungeonTrack(), type: "dungeon" };
    }
    return { trackName: this.getNonDungeonTrack(), type: "ambient" };
  }

  private getNonDungeonTrack(): TrackName {
    const shouldPlayAgeTrack = Math.random() > 0.8;
    if (shouldPlayAgeTrack) {
      const age = this.root.playerState?.age ?? 0;
      if (age <= 25) {
        return "AGE_YOUNG";
      }
      if (age <= 60) {
        return "AGE_MIDDLE";
      }
      return "AGE_OLD";
    } else {
      const idx = getRandomInt(0, GeneralSoundTrack.length - 1);
      return GeneralSoundTrack[idx];
    }
  }

  private getDungeonTrack(): TrackName {
    if (this.root.dungeonStore.currentInstance) {
      const dungeonName = this.root.dungeonStore.currentInstance.name;
      const trackSet = DungeonSoundTrack[dungeonName];
      if (trackSet) {
        if (
          trackSet.finalBossTrack &&
          this.root.dungeonStore.isFightingFinalInstanceBoss
        ) {
          return trackSet.finalBossTrack;
        }
        const idx = getRandomInt(0, trackSet.general.length - 1);
        return trackSet.general[idx];
      }
    }
    // just a precaution, shouldn't land here
    return this.getNonDungeonTrack();
  }

  startNextTrackTimeout() {
    //start a countdown of 45-180 seconds, then start a new track
    const delay = getRandomInt(45_000, 180_000);

    this.nextTrackStartTimeout = setTimeout(() => {
      runInAction(() => {
        this.nextTrackStartTimeout = null;
      });

      const { trackName, type } = this.getCorrectTrack();

      this.fadeInTrack(trackName, type);
      runInAction(() => (this.nextTrackStartTimeout = null));
    }, delay);
  }

  private async getSound(trackRequire: any) {
    if (!trackRequire) {
      console.error(
        `Attempted to load null track: ${JSON.stringify(
          this.getCorrectTrack(),
        )}`,
      );
      throw new Error("Cannot load audio from null source");
    }

    const onPlaybackStautusUpdate: (status: AVPlaybackStatus) => void = (
      status,
    ) => {
      if (status.isLoaded) {
        if (status.didJustFinish) {
          this.startNextTrackTimeout();
        }
      }
    };

    try {
      const { sound } = await Audio.Sound.createAsync(
        trackRequire,
        { volume: 0, isLooping: false, shouldPlay: true },
        onPlaybackStautusUpdate,
      );
      return sound;
    } catch (error) {
      console.error("Failed to create audio:", error);
      throw error;
    }
  }

  setCurrentlyPlayingMusic(info: MusicInfo) {
    this.currentlyPlayingMusic = info;
  }

  setOutboundMusic(info: MusicInfo) {
    this.outboundMusic = info;
  }

  clearFadeIn() {
    if (this.currentlyPlayingMusic?.fade) {
      clearInterval(this.currentlyPlayingMusic?.fade);
    }
  }

  async fadeInTrack(trackName: TrackName, type: "dungeon" | "ambient") {
    try {
      const trackRequire = TrackMap[trackName];
      if (!trackRequire) {
        console.error(`Track not found in TrackMap: ${trackName}`);
        return;
      }

      const sound = await this.getSound(trackRequire);
      let currentStep = 0;
      const fadeInInterval = setInterval(async () => {
        try {
          currentStep++;
          const progress = currentStep / DEFAULT_FADE_STEPS;
          const newVolume = this.getEffectiveVolume(type) * progress;
          await sound.setVolumeAsync(newVolume);
          if (currentStep >= DEFAULT_FADE_STEPS) {
            clearInterval(fadeInInterval);
            await sound.setVolumeAsync(this.getEffectiveVolume(type));
          }
        } catch (error) {
          console.warn("Error during fade in:", error);
          clearInterval(fadeInInterval);
          if (this.currentlyPlayingMusic?.trackName == trackName) {
            sound.setVolumeAsync(this.getEffectiveVolume(type));
          }
        }
      }, DEFAULT_FADE_TIMEOUT);

      this.setCurrentlyPlayingMusic({
        sound,
        trackRequire,
        trackName,
        type,
        fade: fadeInInterval,
      });
    } catch (error) {
      console.error(`Failed to fade in track ${trackName}:`, error);
      //try again
      this.headliner();
    }
  }

  async fadeOutCurrentTrack(currentTrack: MusicInfo) {
    if (currentTrack) {
      const type = currentTrack?.type;
      const status = await currentTrack.sound.getStatusAsync();
      let startVolume = status.isLoaded
        ? status.volume
        : this.getEffectiveVolume(type);
      let currentStep = 0;
      const fadeOutInterval = setInterval(async () => {
        try {
          currentStep++;
          const progress = currentStep / DEFAULT_FADE_STEPS;
          const newVolumeRatio = startVolume * (1 - progress);
          const currentEffectiveVolume = this.getEffectiveVolume(type);
          const adjustedVolume = Math.max(
            0,
            newVolumeRatio * (currentEffectiveVolume / startVolume),
          );
          await currentTrack.sound.setVolumeAsync(adjustedVolume);
          if (currentStep >= DEFAULT_FADE_STEPS) {
            clearInterval(fadeOutInterval);
            await currentTrack.sound.setVolumeAsync(0);
            this.cleanUpOutBound();
          }
        } catch (error) {
          console.warn("Error during fade out:", error);
          clearInterval(fadeOutInterval);
          this.cleanUpOutBound();
        }
      }, DEFAULT_FADE_TIMEOUT);

      // Set the fade interval on the outbound music
      runInAction(() => {
        if (this.outboundMusic) {
          this.outboundMusic.fade = fadeOutInterval;
        }
      });
    }
  }

  async cleanUpOutBound() {
    if (this.outboundMusic) {
      await this.outboundMusic.sound.stopAsync();
      await this.outboundMusic.sound.unloadAsync();
      runInAction(() => (this.outboundMusic = null));
    }
  }

  async crossFade(trackName: TrackName, type: "dungeon" | "ambient") {
    this.clearFadeIn();

    runInAction(() => {
      this.outboundMusic = this.currentlyPlayingMusic;
    });

    await Promise.all([
      this.fadeOutCurrentTrack(this.outboundMusic),
      this.fadeInTrack(trackName, type),
    ]);
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
      case "dungeon":
        this.dungeonMusicVolume = value;
        break;
    }
    this.updatePlayingAudioLevel();
  }

  private async updatePlayingAudioLevel() {
    if (!this.currentlyPlayingMusic || !this.currentlyPlayingMusic) return;

    const trackType = this.currentlyPlayingMusic.type;

    const volume = this.getEffectiveVolume(trackType);
    await this.currentlyPlayingMusic.sound.setVolumeAsync(volume);
  }

  async setMuteValue(val: boolean) {
    runInAction(() => {
      this.muted = val;
    });

    if (val) {
      if (this.currentlyPlayingMusic) {
        const status = await this.currentlyPlayingMusic.sound.getStatusAsync();
        if (status.isLoaded) {
          runInAction(() => {
            this.storedPositionOnMute = status.positionMillis;
          });
          await this.currentlyPlayingMusic.sound.pauseAsync();
        }
      }

      if (this.outboundMusic) {
        await this.outboundMusic.sound.pauseAsync();
      }
    } else {
      if (
        this.currentlyPlayingMusic &&
        this.currentlyPlayingMusic.type === this.getCorrectTrack().type
      ) {
        if (this.storedPositionOnMute !== undefined) {
          await this.currentlyPlayingMusic.sound.setPositionAsync(
            this.storedPositionOnMute,
          );
          runInAction(() => {
            this.storedPositionOnMute = undefined;
          });
        }

        const volume = this.getEffectiveVolume(this.currentlyPlayingMusic.type);
        await this.currentlyPlayingMusic.sound.setVolumeAsync(volume);
        await this.currentlyPlayingMusic.sound.playAsync();
      } else {
        this.headliner();
      }
    }
  }

  getEffectiveVolume(type: "dungeon" | "ambient" | "sfx"): number {
    try {
      const typeVolume =
        type === "ambient"
          ? this.ambientMusicVolume
          : type === "dungeon"
          ? this.dungeonMusicVolume
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
        this.dungeonMusicVolume = settings.combat ?? 1;
        this.muted = settings.muted ?? false;
      }
    } catch (error) {
      console.warn("Error loading persisted settings", error);
      this.masterVolume = 1;
      this.ambientMusicVolume = 1;
      this.soundEffectsVolume = 1;
      this.dungeonMusicVolume = 1;
      this.muted = false;
    }
  }

  private persistSettings() {
    try {
      const settings = {
        master: this.masterVolume,
        ambient: this.ambientMusicVolume,
        sfx: this.soundEffectsVolume,
        combat: this.dungeonMusicVolume,
        muted: this.muted,
      };
      storage.set("audio_settings", JSON.stringify(settings));
    } catch (error) {
      console.warn("Error persisting settings", error);
    }
  }

  async cleanup() {
    try {
      this.nextTrackStartTimeout = null;

      if (this.currentlyPlayingMusic) {
        await this.currentlyPlayingMusic.sound.stopAsync();
        await this.currentlyPlayingMusic.sound.unloadAsync();
        this.currentlyPlayingMusic = null;
      }

      if (this.outboundMusic) {
        await this.outboundMusic.sound.stopAsync();
        await this.outboundMusic.sound.unloadAsync();
        this.currentlyPlayingMusic = null;
      }
    } catch (error) {
      console.warn("Error cleaning up audio store:", error);
    }
  }
}
