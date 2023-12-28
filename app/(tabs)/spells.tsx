import { ScrollView, Text, View } from "../../components/Themed";
import SpellDetails from "../../components/SpellDetails";
import { GameContext, PlayerCharacterContext } from "../_layout";
import { useContext, useEffect, useState } from "react";
import { useColorScheme } from "nativewind";
import { StyleSheet } from "react-native";
import { observer } from "mobx-react-lite";
import ProgressBar from "../../components/ProgressBar";
import { elementalColorMap } from "../../utility/elementColors";
import PlayerStatus from "../../components/PlayerStatus";

const SpellsScreen = observer(() => {
  const playerCharacterData = useContext(PlayerCharacterContext);
  const gameData = useContext(GameContext);
  const { colorScheme } = useColorScheme();

  if (!playerCharacterData || !gameData) throw new Error("missing contexts");

  const { playerState } = playerCharacterData;
  const [spells, setSpells] = useState(playerState?.getSpells());

  useEffect(() => {
    setSpells(playerState?.getSpells());
  }, [playerState?.knownSpells]);

  function magicProficiencySection(
    proficiencies:
      | {
          school: string;
          proficiency: number;
        }[]
      | undefined,
  ) {
    if (!proficiencies) return;
    return proficiencies.map((magicProficiency, idx) => {
      const color =
        elementalColorMap[
          magicProficiency.school as
            | "fire"
            | "water"
            | "air"
            | "earth"
            | "blood"
            | "summoning"
            | "pestilence"
            | "bone"
            | "holy"
            | "vengeance"
            | "protection"
        ];
      return (
        <View className="my-4 flex w-full flex-col" key={idx}>
          <Text
            className="mx-auto"
            style={{
              color:
                magicProficiency.school == "air" && colorScheme == "light"
                  ? "#71717a"
                  : color.dark,
            }}
          >
            {magicProficiency.school}
          </Text>
          <ProgressBar
            value={magicProficiency.proficiency}
            maxValue={500}
            unfilledColor={color.light}
            filledColor={color.dark}
            borderColor={color.dark}
          />
        </View>
      );
    });
  }

  return (
    <View className="flex-1">
      <PlayerStatus onTop={true} />
      <Text className="py-8 text-center text-xl tracking-wide">
        Known Spells
      </Text>
      <View className="flex-1 justify-evenly px-4">
        {spells && spells.length > 0 ? (
          <ScrollView className="h-1/2">
            {spells.map((spell) => (
              <SpellDetails spell={spell} key={spell.name} />
            ))}
          </ScrollView>
        ) : (
          <View className="h-1/2 items-center justify-center">
            <Text className="text-xl italic tracking-wide">
              No Known Spells.
            </Text>
            <Text className="text-center italic tracking-wide">
              (Books can be studied on the top right)
            </Text>
          </View>
        )}
        <View className="h-1/2">
          <View style={styles.container}>
            <View style={styles.line} />
            <View style={styles.content}>
              <Text className="text-lg">Proficiencies</Text>
            </View>
            <View style={styles.line} />
          </View>
          <View className="flex items-center px-12 pb-4">
            {magicProficiencySection(playerState?.magicProficiencies)}
          </View>
        </View>
      </View>
    </View>
  );
});
export default SpellsScreen;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  content: {
    marginHorizontal: 10,
  },
  line: {
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
});
