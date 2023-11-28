import { useSelector } from "react-redux";
import ProgressBar from "./ProgressBar";
import { View, Text } from "./Themed";
import { selectPlayerCharacter } from "../redux/selectors";
import { View as NonThemedView } from "react-native";
import Coins from "../assets/icons/CoinsIcon";

interface PlayerStatusOptions {
  displayGoldBottom?: boolean;
  displayGoldTop?: boolean;
  onTop?: boolean;
}

export default function PlayerStatus({
  displayGoldBottom,
  displayGoldTop,
  onTop,
}: PlayerStatusOptions) {
  const playerCharacter = useSelector(selectPlayerCharacter);
  if (playerCharacter) {
    return (
      <NonThemedView
        className={`${
          onTop ? "border-b" : "border-t"
        } border-zinc-200 dark:border-zinc-700 flex bg-zinc-50 dark:bg-zinc-900 py-2`}
      >
        {displayGoldTop ? (
          <View className="flex flex-row justify-center">
            <Text>{playerCharacter.getReadableGold()}</Text>
            <Coins width={16} height={16} style={{ marginLeft: 6 }} />
          </View>
        ) : null}
        <View className="flex flex-row justify-evenly">
          <View className="flex w-[31%]">
            <Text className="mx-auto" style={{ color: "#ef4444" }}>
              Health
            </Text>
            <ProgressBar
              value={playerCharacter.getHealth()}
              maxValue={playerCharacter.getMaxHealth()}
              filledColor="#ef4444"
              unfilledColor="#fee2e2"
            />
          </View>
          <View className="flex w-[31%]">
            <Text className="mx-auto" style={{ color: "#60a5fa" }}>
              Mana
            </Text>
            <ProgressBar
              value={playerCharacter.getMana()}
              maxValue={playerCharacter.getMaxMana()}
              filledColor="#60a5fa"
              unfilledColor="#dbeafe"
            />
          </View>
          <View className="flex w-[31%]">
            <Text className="mx-auto" style={{ color: "#c084fc" }}>
              Sanity
            </Text>
            <ProgressBar
              value={playerCharacter.getSanity()}
              minValue={-50}
              maxValue={50}
              filledColor="#c084fc"
              unfilledColor="#f3e8ff"
            />
          </View>
        </View>
        {displayGoldBottom ? (
          <View className="flex flex-row justify-center pt-2">
            <Text>{playerCharacter.getReadableGold()}</Text>
            <Coins width={16} height={16} style={{ marginLeft: 6 }} />
          </View>
        ) : null}
      </NonThemedView>
    );
  }
}
