import { useSelector } from "react-redux";
import ProgressBar from "./ProgressBar";
import { View, Text } from "./Themed";
import { selectPlayerCharacter } from "../redux/selectors";

export default function PlayerStatus() {
  const playerCharacter = useSelector(selectPlayerCharacter);
  if (playerCharacter) {
    return (
      <View className="flex flex-row justify-evenly">
        <View className="flex w-[30%]">
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
        <View className="flex w-[30%]">
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
        <View className="flex w-[30%]">
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
    );
  }
}
