import { View, Text, Pressable } from "react-native";
import Coins from "../assets/icons/CoinsIcon";
import Energy from "../assets/icons/EnergyIcon";
import Sanity from "../assets/icons/SanityIcon";
import HealthIcon from "../assets/icons/HealthIcon";
import { useColorScheme } from "nativewind";
import { useIsFocused } from "@react-navigation/native";
import { GameContext, PlayerCharacterContext } from "../app/_layout";
import { useContext } from "react";
import { fullSave } from "../utility/functions";

interface MedicalOptionProps {
  title: string;
  cost: number;
  healthRestore?: number;
  sanityRestore?: number;
  manaRestore?: number;
  removeDebuffs?: number;
}

export default function MedicalOption({
  title,
  cost,
  healthRestore,
  sanityRestore,
  manaRestore,
  removeDebuffs,
}: MedicalOptionProps) {
  const playerCharacterData = useContext(PlayerCharacterContext);
  const gameData = useContext(GameContext);
  if (!playerCharacterData || !gameData) throw new Error("missing context");
  const { playerState } = playerCharacterData;
  const { gameState } = gameData;
  const { colorScheme } = useColorScheme();
  const isFocused = useIsFocused();

  function visit() {
    if (playerState && gameState && isFocused) {
      playerState.getMedicalService(
        cost,
        healthRestore,
        sanityRestore,
        manaRestore,
        removeDebuffs,
      );
      gameState.gameTick(playerState);
      fullSave(gameState, playerState);
    }
  }

  return (
    <View
      className="m-2 rounded-xl"
      style={{
        shadowColor: "#000",
        shadowOffset: {
          width: 3,
          height: 1,
        },
        elevation: 1,
        shadowOpacity: 0.2,
        backgroundColor: colorScheme == "light" ? "#fafafa" : "#27272a",
        shadowRadius: 3,
      }}
    >
      <View className="flex justify-between rounded-xl px-4 py-2 text-zinc-950 dark:border dark:border-zinc-500">
        <View className="flex flex-row justify-between">
          <Text className="bold my-auto w-2/3 text-xl dark:text-zinc-50">
            {title}
          </Text>
          <View className="my-auto -mb-8 mt-8 w-1/3">
            <View className="flex w-full flex-row items-center justify-evenly">
              {cost > 0 ? (
                <>
                  <Text className="dark:text-zinc-50">{cost}</Text>
                  <Coins width={14} height={14} style={{ marginLeft: 6 }} />
                </>
              ) : (
                <Text className="dark:text-zinc-50">Free</Text>
              )}
            </View>
            {healthRestore ? (
              <View className="flex w-full flex-row items-center justify-evenly">
                <Text className="dark:text-zinc-50">{healthRestore}</Text>
                <HealthIcon width={14} height={14} style={{ marginLeft: 6 }} />
              </View>
            ) : null}
            {manaRestore ? (
              <View className="flex w-full flex-row items-center justify-evenly">
                <Text className="dark:text-zinc-50">{manaRestore}</Text>
                <Energy width={14} height={14} style={{ marginLeft: 6 }} />
              </View>
            ) : null}
            {sanityRestore ? (
              <View className="flex w-full flex-row items-center justify-evenly">
                <Text className="dark:text-zinc-50">{sanityRestore}</Text>
                <Sanity width={14} height={14} style={{ marginLeft: 6 }} />
              </View>
            ) : null}
            {removeDebuffs ? (
              <View className="flex w-full flex-row items-center justify-evenly">
                <Text className="dark:text-zinc-50">
                  -{removeDebuffs} Debuffs
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        <Pressable
          className="mb-2 mt-4 active:scale-95 active:opacity-50"
          onPress={visit}
        >
          <View
            className="mx-auto rounded-xl"
            style={{
              shadowColor: "#000",
              elevation: 1,
              backgroundColor: colorScheme == "light" ? "white" : "#71717a",
              shadowOpacity: 0.1,
              shadowRadius: 5,
            }}
          >
            <View className="px-8 py-4">
              <Text className="text-center text-zinc-900 dark:text-zinc-50">
                Visit
              </Text>
            </View>
          </View>
        </Pressable>
      </View>
    </View>
  );
}
