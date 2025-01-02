import { makeAutoObservable } from "mobx";
import { useAudioPlayer } from "expo-audio";
import { observer } from "mobx-react-lite";
import { useRootStore } from "../hooks/stores";
import { useEffect } from "react";

type AudioPlayer = ReturnType<typeof useAudioPlayer>;

export class AudioPlayersStore {
  players: Map<string, AudioPlayer> = new Map();

  constructor() {
    makeAutoObservable(this);
  }

  addPlayer(key: string, player: AudioPlayer) {
    this.players.set(key, player);
  }

  removePlayer(key: string) {
    this.players.delete(key);
  }

  getPlayer(key: string): AudioPlayer | undefined {
    return this.players.get(key);
  }
}

export const audioPlayersStore = new AudioPlayersStore();

export const AudioManager: React.FC = observer(() => {
  const { audioStore } = useRootStore();

  const ambientPlayer = useAudioPlayer(audioStore.ambientMusicSource);
  const combatPlayer = useAudioPlayer(audioStore.combatMusicSource);

  useEffect(() => {
    audioPlayersStore.addPlayer("ambient", ambientPlayer);
    audioPlayersStore.addPlayer("combat", combatPlayer);

    return () => {
      audioPlayersStore.removePlayer("ambient");
      audioPlayersStore.removePlayer("combat");
    };
  }, [ambientPlayer, combatPlayer]);

  useEffect(() => {
    audioStore.updateAllVolumes();
  }, [audioStore.levels]);

  return null;
});
