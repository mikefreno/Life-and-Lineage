import { useEffect, useState } from "react";
import { TextInput, View, Text, StyleSheet } from "react-native";
import GenericRaisedButton from "../components/GenericRaisedButton";
import { fullLoad } from "../utility/functions/save_load";
import { PlayerCharacter } from "../classes/character";
import { Game } from "../classes/game";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { encode, decode } from "react-native-msgpack";
import * as FileSystem from "expo-file-system";
import { fromByteArray, toByteArray } from "react-native-quick-base64";

export default function SaveLoadPerformance() {
  const [newTime, setNewTime] = useState<number>();
  const [oldTime, setOldTime] = useState<number>();
  const [settingUp, setSettingUp] = useState<boolean>();
  const [turns, setTurns] = useState<string>("10");
  const [testPlayer, setTestPlayer] = useState<PlayerCharacter>();
  const [testGame, setTestGame] = useState<Game>();
  const [runningOLDTest, setRunningOLDTest] = useState<boolean>(false);
  const [runningNEWTest, setRunningNEWTest] = useState<boolean>(false);

  useEffect(() => {
    setup();
  }, []);

  const setup = async () => {
    setSettingUp(true);
    const { game, player } = await fullLoad();
    if (!game || !player) throw new Error("load failure");
    setTestPlayer(player);
    setTestGame(game);
    setSettingUp(false);
  };

  const performOLDTest = async () => {
    if (testGame && testPlayer) {
      setRunningOLDTest(true);
      const startTime = Date.now();
      for (let i = 0; i < parseInt(turns); i++) {
        await test_fullSave(testGame, testPlayer);
        await test_fullLoad();
      }
      const endTime = Date.now();
      setOldTime(endTime - startTime);
      setRunningOLDTest(false);
    }
  };

  const performNEWTest = async () => {
    if (testGame && testPlayer) {
      setRunningNEWTest(true);
      const startTime = Date.now();
      for (let i = 0; i < parseInt(turns); i++) {
        await test_fullSave_new(testGame, testPlayer);
        await test_fullLoad_new();
      }
      const endTime = Date.now();
      setNewTime(endTime - startTime);
      setRunningNEWTest(false);
    }
  };

  return (
    <View style={styles.container} className="mt-24">
      <TextInput
        style={styles.input}
        value={turns}
        onChangeText={(v) => setTurns(v)}
        keyboardType="numeric"
      />
      <GenericRaisedButton
        onPressFunction={performOLDTest}
        disabledCondition={runningNEWTest || runningOLDTest || settingUp}
      >
        Begin test - OLD
      </GenericRaisedButton>
      <GenericRaisedButton
        onPressFunction={performNEWTest}
        disabledCondition={runningNEWTest || runningOLDTest || settingUp}
      >
        Begin test - NEW
      </GenericRaisedButton>
      {oldTime && (
        <Text style={styles.result}>Old method time: {oldTime}ms</Text>
      )}
      {newTime && (
        <Text style={styles.result}>New method time: {newTime}ms</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
  },
  input: {
    width: 100,
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    textAlign: "center",
  },
  result: {
    marginTop: 20,
    fontSize: 16,
  },
});

const test_fullSave = async (
  game: Game | null,
  player: PlayerCharacter | null,
) => {
  if (game && player) {
    try {
      const jsonGame = JSON.stringify(game);
      const jsonPlayer = JSON.stringify(player);
      await Promise.all([
        AsyncStorage.setItem("game_test", jsonGame),
        AsyncStorage.setItem("player_test", jsonPlayer),
      ]);
    } catch (e) {
      console.error(e);
    }
  }
};

const test_fullLoad = async (): Promise<{
  game: Game | null;
  player: PlayerCharacter | null;
}> => {
  try {
    const [gameData, playerData] = await Promise.all([
      AsyncStorage.getItem("game_test"),
      AsyncStorage.getItem("player_test"),
    ]);

    const parseData = (data: string | null) => {
      console.log(JSON.parse(data));
      return data ? JSON.parse(data) : null;
    };

    return {
      game: parseData(gameData) as Game | null,
      player: parseData(playerData) as PlayerCharacter | null,
    };
  } catch (e) {
    console.error(e);
    return { game: null, player: null };
  }
};

const test_fullSave_new = async (
  game: Game | null,
  player: PlayerCharacter | null,
) => {
  if (game && player) {
    try {
      const packedGame = encode(game);
      const packedPlayer = encode(player);
      await Promise.all([
        FileSystem.writeAsStringAsync(
          FileSystem.documentDirectory + "game_test.bin",
          fromByteArray(packedGame),
        ),
        FileSystem.writeAsStringAsync(
          FileSystem.documentDirectory + "player_test.bin",
          fromByteArray(packedPlayer),
        ),
      ]);
    } catch (e) {
      console.error(e);
    }
  }
};

const test_fullLoad_new = async (): Promise<{
  game: Game | null;
  player: PlayerCharacter | null;
}> => {
  try {
    const [gameData, playerData] = await Promise.all([
      FileSystem.readAsStringAsync(
        FileSystem.documentDirectory + "game_test.bin",
      ),
      FileSystem.readAsStringAsync(
        FileSystem.documentDirectory + "player_test.bin",
      ),
    ]);

    let game;
    let player;

    if (gameData) {
      const gameBuffer = toByteArray(gameData);
      game = decode(gameBuffer);
    }

    if (playerData) {
      const playerBuffer = toByteArray(playerData);
      player = decode(playerBuffer);
    }
    console.log(typeof new PlayerCharacter(player));
    console.log(typeof game);

    return { game, player };
  } catch (e) {
    console.error(e);
    return { game: null, player: null };
  }
};
