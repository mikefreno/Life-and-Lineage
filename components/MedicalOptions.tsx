import { View, Text, Pressable } from "react-native";
import Coins from "../assets/icons/CoinsIcon";
import Energy from "../assets/icons/EnergyIcon";
import Sanity from "../assets/icons/SanityIcon";
import HealthIcon from "../assets/icons/HealthIcon";
import { useDispatch, useSelector } from "react-redux";
import { selectGame, selectPlayerCharacter } from "../redux/selectors";
import { AppDispatch } from "../redux/store";
import ProgressBar from "./ProgressBar";
import { setPlayerCharacter } from "../redux/slice/game";
import { savePlayer } from "../utility/functions";

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
  const playerCharacter = useSelector(selectPlayerCharacter);
  const gameData = useSelector(selectGame);
  const dispatch: AppDispatch = useDispatch();

  if (!playerCharacter) {
    throw Error("No Player Character on Labor Task");
  }

  function visit() {
    if (playerCharacter) {
      playerCharacter.getMedicalService(
        cost,
        healthRestore,
        sanityRestore,
        manaRestore,
        removeDebuffs,
      );
      dispatch(setPlayerCharacter(playerCharacter));
      savePlayer(playerCharacter);
    }
  }

  return (
    <View className="mx-2 my-2 flex justify-between rounded-xl bg-zinc-200 px-4 py-2 text-zinc-950 dark:bg-zinc-800">
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
      <Pressable className="mx-auto mb-2 mt-4" onPress={visit}>
        {({ pressed }) => (
          <View
            className={`my-auto rounded-xl bg-sky-50 px-8 py-4 ${
              pressed ? "scale-95 opacity-30" : null
            }`}
          >
            <Text className="text-center">Visit</Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}
