import { makeObservable, observable, action } from "mobx";
import { storage } from "../utility/functions/storage";
import { RootStore } from "./RootStore";
import { audioPlayersStore } from "../providers/AudioData";

interface AudioLevels {
  master: number;
  ambientMusic: number;
  soundEffects: number;
  combatMusic: number;
  combatSoundEffects: number;
  muted: boolean;
}

export class AudioStore {
  root: RootStore;
  levels: AudioLevels = {
    master: 1.0,
    ambientMusic: 1.0,
    soundEffects: 1.0,
    combatMusic: 1.0,
    combatSoundEffects: 1.0,
    muted: false,
  };

  constructor({ root }: { root: RootStore }) {
    this.root = root;
    makeObservable(this, {
      levels: observable,
      setAudioLevel: action,
      toggleMute: action,
      updateAllVolumes: action,
    });
    this.hydrateAudioSettings();
  }

  updateAllVolumes() {
    const ambientPlayer = audioPlayersStore.getPlayer("ambient");
    const combatPlayer = audioPlayersStore.getPlayer("combat");

    if (ambientPlayer) {
      ambientPlayer.volume = this.getEffectiveVolume("ambientMusic");
    }
    if (combatPlayer) {
      combatPlayer.volume = this.getEffectiveVolume("combatMusic");
    }
  }

  async playBackgroundMusic() {
    const ambientPlayer = audioPlayersStore.getPlayer("ambient");
    if (ambientPlayer && !this.levels.muted) {
      ambientPlayer.volume = this.getEffectiveVolume("ambientMusic");
      ambientPlayer.play();
    }
  }

  async stopBackgroundMusic() {
    const ambientPlayer = audioPlayersStore.getPlayer("ambient");
    if (ambientPlayer) {
      ambientPlayer.pause();
    }
  }

  setAudioLevel(type: keyof AudioLevels, level: number) {
    if (typeof level === "number" && level >= 0 && level <= 1) {
      this.levels[type] = level;
      this.updateAllVolumes();
      this.persistAudioSettings();
    }
  }

  toggleMute() {
    this.levels.muted = !this.levels.muted;
    this.updateAllVolumes();
    this.persistAudioSettings();
  }

  private getEffectiveVolume(type: keyof AudioLevels): number {
    if (this.levels.muted) return 0;
    return this.levels[type] * this.levels.master;
  }

  private hydrateAudioSettings() {
    const stored = storage.getString("audio_settings");
    if (stored) {
      this.levels = JSON.parse(stored);
    }
  }

  private persistAudioSettings() {
    storage.set("audio_settings", JSON.stringify(this.levels));
  }
}
