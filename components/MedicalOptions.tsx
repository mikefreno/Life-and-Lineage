import { View } from "react-native";
import Coins from "../assets/icons/CoinsIcon";
import Energy from "../assets/icons/EnergyIcon";
import Sanity from "../assets/icons/SanityIcon";
import HealthIcon from "../assets/icons/HealthIcon";
import { Text } from "./Themed";
import { useColorScheme } from "nativewind";
import { useIsFocused } from "@react-navigation/native";
import { GameContext, PlayerCharacterContext } from "../app/_layout";
import { useContext } from "react";
import GenericRaisedButton from "./GenericRaisedButton";
import { observer } from "mobx-react-lite";

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
      <View
        className="m-2 rounded-xl"
        style={{
          shadowColor: "#000",
          shadowOffset: {
            width: 3,
            height: 1,
          },
          elevation: 3,
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
                  <HealthIcon
                    width={14}
                    height={14}
                    style={{ marginLeft: 6 }}
                  />
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
            text={"Visit"}
            onPressFunction={visit}
            disabledCondition={getDisabled()}
          />
        </View>
      </View>
    );
  },
);
export default MedicalOption;
