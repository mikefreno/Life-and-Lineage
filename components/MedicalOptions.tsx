import { View } from "react-native";
import { Text } from "./Themed";
import { useIsFocused } from "@react-navigation/native";
import { useContext } from "react";
import GenericRaisedButton from "./GenericRaisedButton";
import { observer } from "mobx-react-lite";
import ThemedCard from "./ThemedCard";
import { AppContext } from "../app/_layout";
import { Coins, Energy, HealthIcon, Sanity } from "../assets/icons/SVGIcons";

interface MedicalOptionProps {
  title: string;
  cost: number;
  healthRestore?: number | "fill";
  sanityRestore?: number | "fill";
  manaRestore?: number | "fill";
  removeDebuffs?: number | "all";
}

const MedicalOption = observer(
  ({
    title,
    cost,
    healthRestore,
    sanityRestore,
    manaRestore,
    removeDebuffs,
  }: MedicalOptionProps) => {
    const appData = useContext(AppContext);
    if (!appData) throw new Error("missing context");
    const { playerState, gameState } = appData;
    const isFocused = useIsFocused();

    function visit() {
      if (playerState && gameState && isFocused) {
        playerState.getMedicalService(
          cost,
          healthRestore == "fill" ? playerState.getMaxHealth() : healthRestore,
          sanityRestore == "fill" ? playerState.getMaxSanity() : sanityRestore,
          manaRestore == "fill" ? playerState.getMaxMana() : manaRestore,
          removeDebuffs == "all"
            ? playerState.conditions.length
            : removeDebuffs,
        );
        gameState.gameTick(playerState);
      }
    }

    function getDisabled() {
      if (playerState) {
        if (cost > playerState.gold) {
          return true;
        }
        if (healthRestore) {
          if (playerState.getMaxHealth() - playerState.health == 0) {
            return true;
          }
        }
        if (manaRestore) {
          if (playerState.getMaxMana() - playerState.mana == 0) {
            return true;
          }
        }
        if (sanityRestore) {
          if (playerState.getMaxSanity() - playerState.sanity == 0) {
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
                    ? playerState?.getMaxHealth()
                    : healthRestore}
                </Text>
                <HealthIcon width={14} height={14} style={{ marginLeft: 6 }} />
              </View>
            ) : null}
            {manaRestore ? (
              <View className="flex w-full flex-row items-center justify-evenly">
                <Text className="dark:text-zinc-50">
                  {manaRestore == "fill"
                    ? playerState?.getMaxMana()
                    : manaRestore}
                </Text>
                <Energy width={14} height={14} style={{ marginLeft: 6 }} />
              </View>
            ) : null}
            {sanityRestore ? (
              <View className="flex w-full flex-row items-center justify-evenly">
                <Text className="dark:text-zinc-50">
                  {sanityRestore == "fill"
                    ? (playerState?.getMaxSanity() ?? 50) * 2
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
        <GenericRaisedButton
          onPressFunction={visit}
          disabledCondition={getDisabled()}
        >
          Visit
        </GenericRaisedButton>
      </ThemedCard>
    );
  },
);
export default MedicalOption;
