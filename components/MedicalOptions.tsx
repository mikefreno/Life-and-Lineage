import { View } from "react-native";
import { Text } from "./Themed";
import GenericRaisedButton from "./GenericRaisedButton";
import ThemedCard from "./ThemedCard";
import { Coins, Energy, HealthIcon, Sanity } from "../assets/icons/SVGIcons";
import { observer } from "mobx-react-lite";
import { useGameState } from "../stores/AppData";

interface MedicalOptionProps {
  title: string;
  cost: number;
  healthRestore?: number | "fill";
  sanityRestore?: number | "fill";
  manaRestore?: number | "fill";
  removeDebuffs?: number | "all";
  focused: boolean;
}

const MedicalOption = observer(
  ({
    title,
    cost,
    healthRestore,
    sanityRestore,
    manaRestore,
    removeDebuffs,
    focused,
  }: MedicalOptionProps) => {
    const { playerState, gameState } = useGameState();

    function visit() {
      if (playerState && gameState && focused) {
        playerState.getMedicalService(
          cost,
          healthRestore == "fill" ? playerState.maxHealth : healthRestore,
          sanityRestore == "fill" ? playerState.maxSanity : sanityRestore,
          manaRestore == "fill" ? playerState.maxMana : manaRestore,
          removeDebuffs == "all"
            ? playerState.conditions.length
            : removeDebuffs,
        );
        gameState.gameTick({ playerState });
      }
    }

    function getDisabled() {
      if (playerState) {
        if (cost > playerState.gold) {
          return true;
        }
        if (healthRestore) {
          if (playerState.maxHealth - playerState.currentHealth == 0) {
            return true;
          }
        }
        if (manaRestore) {
          if (playerState.maxMana - playerState.currentMana == 0) {
            return true;
          }
        }
        if (sanityRestore) {
          if (playerState.maxSanity - playerState.currentSanity == 0) {
            return true;
          }
        }
        if (removeDebuffs) {
          if (playerState.conditions.length == 0) {
            return true;
          }
        }
      }
      return false;
    }

    return (
      <ThemedCard>
        <View className="flex flex-row justify-between">
          <Text className="bold my-auto w-2/3 text-xl dark:text-zinc-50">
            {title}
          </Text>
          <View className="-mb-4 mt-4 w-[40%]">
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
                <Text className="dark:text-zinc-50">
                  {healthRestore == "fill"
                    ? playerState?.maxHealth
                    : healthRestore}
                </Text>
                <HealthIcon width={14} height={14} style={{ marginLeft: 6 }} />
              </View>
            ) : null}
            {manaRestore ? (
              <View className="flex w-full flex-row items-center justify-evenly">
                <Text className="dark:text-zinc-50">
                  {manaRestore == "fill" ? playerState?.maxMana : manaRestore}
                </Text>
                <Energy width={14} height={14} style={{ marginLeft: 6 }} />
              </View>
            ) : null}
            {sanityRestore ? (
              <View className="flex w-full flex-row items-center justify-evenly">
                <Text className="dark:text-zinc-50">
                  {sanityRestore == "fill"
                    ? (playerState?.maxSanity ?? 50) * 2
                    : sanityRestore}
                </Text>
                <Sanity width={14} height={14} style={{ marginLeft: 6 }} />
              </View>
            ) : null}
            {removeDebuffs ? (
              <View className="flex w-full flex-row items-center justify-evenly">
                <Text className="text-center">
                  {`Remove ${removeDebuffs} ${
                    removeDebuffs !== 1 ? "debuffs" : "debuff"
                  }`}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
        <GenericRaisedButton onPress={visit} disabled={getDisabled()}>
          Visit
        </GenericRaisedButton>
      </ThemedCard>
    );
  },
);
export default MedicalOption;
