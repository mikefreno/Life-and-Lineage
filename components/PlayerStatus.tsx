import ProgressBar from "./ProgressBar";
import { View, Text } from "./Themed";
import { View as NonThemedView, ScrollView } from "react-native";
import Coins from "../assets/icons/CoinsIcon";
import { useContext, useEffect, useState } from "react";
import { PlayerCharacterContext } from "../app/_layout";
import { observer } from "mobx-react-lite";
import { useFonts } from "expo-font";
import { FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import { rollD20 } from "../utility/functions";
import { Condition } from "../classes/conditions";

interface PlayerStatusOptions {
  displayGoldBottom?: boolean;
  displayGoldTop?: boolean;
  onTop?: boolean;
}

const PlayerStatus = observer(
  ({ displayGoldBottom, displayGoldTop, onTop }: PlayerStatusOptions) => {
    const playerCharacterData = useContext(PlayerCharacterContext);
    if (!playerCharacterData) throw new Error("missing context");
    const { playerState } = playerCharacterData;
    const [readableGold, setReadableGold] = useState(
      playerState?.getReadableGold(),
    );
    const [loaded, error] = useFonts({
      SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
      ...FontAwesome.font,
    });

    useEffect(() => {
      if (error) throw error;
    }, [error]);

    useEffect(() => {
      if (
        loaded &&
        playerState &&
        (playerState.sanity <= -50 || playerState.health <= 0)
      ) {
        while (router.canGoBack()) {
          router.back();
        }
        router.replace("/DeathScreen");
      }
    }, [playerState?.sanity, playerState?.health]);

    useEffect(() => {}, [playerState?.sanity]);

    useEffect(() => {
      setReadableGold(playerState?.getReadableGold());
    }, [playerState?.gold]);

    function conditionRenderer() {
      if (playerState) {
        const conditionMap = new Map<string, number>();
        playerState.conditions.forEach((condition) => {
          if (conditionMap.has(condition.name)) {
            let value = conditionMap.get(condition.name);
            if (value) {
              conditionMap.set(condition.name, value + 1);
            }
          } else {
            conditionMap.set(condition.name, 1);
          }
        });
        const conditionObject = Object.fromEntries(conditionMap);

        return (
          <ScrollView horizontal>
            <View className="my-1 flex flex-row justify-around">
              {Object.entries(conditionObject).map(([key, value]) => (
                <View key={key} className="mx-2 flex align-middle">
                  <NonThemedView className="mx-auto w-2 rounded-md bg-zinc-200 p-2" />
                  <Text>
                    {key} x {value}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        );
      }
    }

    if (playerState) {
      return (
        <NonThemedView
          className={`${
            onTop ? "border-b" : "border-t pb-3"
          } border-zinc-200 dark:border-zinc-700 flex bg-zinc-50 dark:bg-zinc-900 py-2`}
        >
          {displayGoldTop ? (
            <View className="flex flex-row justify-center">
              <Text>{readableGold}</Text>
              <Coins width={16} height={16} style={{ marginLeft: 6 }} />
            </View>
          ) : null}
          {!onTop ? conditionRenderer() : null}
          <View className="flex flex-row justify-evenly">
            <View className="flex w-[31%]">
              <Text className="mx-auto" style={{ color: "#ef4444" }}>
                Health
              </Text>
              <ProgressBar
                value={playerState.health}
                maxValue={playerState.getMaxHealth()}
                filledColor="#ef4444"
                unfilledColor="#fca5a5"
              />
            </View>
            <View className="flex w-[31%]">
              <Text className="mx-auto" style={{ color: "#60a5fa" }}>
                Mana
              </Text>
              <ProgressBar
                value={playerState.mana}
                maxValue={playerState.getMaxMana()}
                filledColor="#60a5fa"
                unfilledColor="#bfdbfe"
              />
            </View>
            <View className="flex w-[31%]">
              <Text className="mx-auto" style={{ color: "#c084fc" }}>
                Sanity
              </Text>
              <ProgressBar
                value={playerState.sanity}
                minValue={-50}
                maxValue={50}
                filledColor="#c084fc"
                unfilledColor="#e9d5ff"
              />
            </View>
          </View>
          {onTop ? conditionRenderer() : null}
          {displayGoldBottom ? (
            <View className="flex flex-row justify-center pt-2">
              <Text>{readableGold}</Text>
              <Coins width={16} height={16} style={{ marginLeft: 6 }} />
            </View>
          ) : null}
        </NonThemedView>
      );
    }
  },
);
export default PlayerStatus;
