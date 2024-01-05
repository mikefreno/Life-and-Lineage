import ProgressBar from "./ProgressBar";
import { Text } from "./Themed";
import { View, ScrollView, Animated, Image } from "react-native";
import Coins from "../assets/icons/CoinsIcon";
import { useContext, useEffect, useState } from "react";
import { GameContext, PlayerCharacterContext } from "../app/_layout";
import { observer } from "mobx-react-lite";
import { useFonts } from "expo-font";
import { FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import { toTitleCase } from "../utility/functions";
import FadeOutText from "./FadeOutText";

interface PlayerStatusOptions {
  displayGoldBottom?: boolean;
  displayGoldTop?: boolean;
  onTop?: boolean;
}

const PlayerStatus = observer(
  ({ displayGoldBottom, displayGoldTop, onTop }: PlayerStatusOptions) => {
    const playerCharacterData = useContext(PlayerCharacterContext);
    const gameData = useContext(GameContext);
    if (!playerCharacterData || !gameData) throw new Error("missing context");
    const { playerState } = playerCharacterData;
    const { gameState } = gameData;
    const [readableGold, setReadableGold] = useState(
      playerState?.getReadableGold(),
    );
    const [loaded, error] = useFonts({
      SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
      ...FontAwesome.font,
    });
    const [healthRecord, setHealthRecord] = useState<number | undefined>(
      playerState?.health,
    );
    const [sanityRecord, setSanityRecord] = useState<number | undefined>(
      playerState?.sanity,
    );
    const [manaRecord, setManaRecord] = useState<number | undefined>(
      playerState?.mana,
    );
    const [goldRecord, setGoldRecord] = useState<number | undefined>(
      playerState?.gold,
    );
    const [healthDiff, setHealthDiff] = useState<number>(0);
    const [sanityDiff, setSanityDiff] = useState<number>(0);
    const [manaDiff, setManaDiff] = useState<number>(0);
    const [goldDiff, setGoldDiff] = useState<number>(0);
    const [showingHealthChange, setShowingHealthChange] =
      useState<boolean>(false);
    const [showingSanityChange, setShowingSanityChange] =
      useState<boolean>(false);
    const [showingManaChange, setShowingManaChange] = useState<boolean>(false);
    const [showingGoldChange, setShowingGoldChange] = useState<boolean>(false);
    const [animationCycler, setAnimationCycler] = useState<number>(0);
    const [showingHealthWarningPulse, setShowingHealthWarningPulse] =
      useState<boolean>(false);
    const healthDamageFlash = useState(new Animated.Value(0))[0];
    const animatedValue = useState(new Animated.Value(0))[0];

    useEffect(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: false,
          }),
        ]),
        {
          iterations: -1,
        },
      ).start();
    }, []);

    const backgroundColorInterpolation = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: ["rgba(205,20,20,0.6)", "rgba(127,29,29,0.2)"],
    });

    useEffect(() => {
      (playerState &&
        gameState &&
        playerState.health / playerState.healthMax <=
          gameState.healthWarning) ??
      0.2
        ? setShowingHealthWarningPulse(true)
        : setShowingHealthWarningPulse(false);
    }, [playerState?.health, gameState?.healthWarning]);

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

    useEffect(() => {
      if (playerState && healthRecord && playerState.health != healthRecord) {
        if (playerState?.health - healthRecord < 0) {
          Animated.sequence([
            Animated.timing(healthDamageFlash, {
              toValue: 1,
              duration: 200,
              useNativeDriver: false,
            }),
            Animated.timing(healthDamageFlash, {
              toValue: 0,
              duration: 200,
              useNativeDriver: false,
            }),
          ]).start();
        }
        setHealthDiff(playerState?.health - healthRecord);
        setShowingHealthChange(true);
        setAnimationCycler(animationCycler + 1);
      } else {
        setHealthDiff(0);
        setShowingHealthChange(false);
      }
      if (playerState && sanityRecord && playerState.sanity != sanityRecord) {
        setSanityDiff(playerState?.sanity - sanityRecord);
        setShowingSanityChange(true);
        setAnimationCycler(animationCycler + 1);
      } else {
        setSanityDiff(0);
        setShowingSanityChange(false);
      }
      if (playerState && manaRecord && playerState.mana != manaRecord) {
        setManaDiff(playerState?.mana - manaRecord);
        setShowingManaChange(true);
        setAnimationCycler(animationCycler + 1);
      } else {
        setManaDiff(0);
        setShowingManaChange(false);
      }
      if (playerState && goldRecord && playerState.gold != manaRecord) {
        setGoldDiff(playerState?.gold - goldRecord);
        setShowingGoldChange(true);
        setAnimationCycler(animationCycler + 1);
      } else {
        setGoldDiff(0);
        setShowingGoldChange(false);
      }

      setHealthRecord(playerState?.health);
      setSanityRecord(playerState?.sanity);
      setManaRecord(playerState?.mana);
      setGoldRecord(playerState?.gold);
    }, [
      playerState?.health,
      playerState?.sanity,
      playerState?.mana,
      playerState?.gold,
    ]);

    useEffect(() => {
      setReadableGold(playerState?.getReadableGold());
    }, [playerState?.gold]);

    function conditionRenderer() {
      if (playerState) {
        let simplifiedConditionsMap: Map<
          string,
          {
            name: string;
            icon: any;
            count: number;
          }
        > = new Map();

        playerState.conditions.forEach((condition) => {
          if (simplifiedConditionsMap.has(condition.name)) {
            let existingCondition = simplifiedConditionsMap.get(
              condition.name,
            )!;
            existingCondition.count += 1;
            simplifiedConditionsMap.set(condition.name, existingCondition);
          } else {
            simplifiedConditionsMap.set(condition.name, {
              name: condition.name,
              icon: condition.getConditionIcon(),
              count: 1,
            });
          }
        });
        let simplifiedConditions: {
          name: string;
          icon: any;
          count: number;
        }[] = Array.from(simplifiedConditionsMap.values());

        return (
          <ScrollView horizontal>
            <View className="my-1 flex flex-row justify-around">
              {simplifiedConditions.map((cond) => (
                <View key={cond.name} className="mx-2 flex align-middle">
                  <View className="mx-auto rounded-md bg-zinc-200">
                    <Image
                      source={cond.icon}
                      style={{ width: 32, height: 32 }}
                    />
                  </View>
                  <Text>
                    {toTitleCase(cond.name)} x {cond.count}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        );
      }
    }

    function healthChangePopUp() {
      if (healthDiff != 0) {
        return (
          <View className="absolute ml-2">
            <FadeOutText
              className={"text-red-400"}
              text={`${healthDiff > 0 ? "+" : ""}${healthDiff.toString()}`}
              animationCycler={animationCycler}
            />
          </View>
        );
      }
    }
    function sanityChangePopUp() {
      if (sanityDiff != 0) {
        return (
          <View className="absolute ml-2">
            <FadeOutText
              className={"text-purple-400"}
              text={`${sanityDiff > 0 ? "+" : ""}${sanityDiff.toString()}`}
              animationCycler={animationCycler}
            />
          </View>
        );
      }
    }
    function manaChangePopUp() {
      if (manaDiff != 0) {
        return (
          <View className="absolute ml-2">
            <FadeOutText
              className={"text-blue-400"}
              text={`${manaDiff > 0 ? "+" : ""}${manaDiff.toString()}`}
              animationCycler={animationCycler}
            />
          </View>
        );
      }
    }
    function goldChangePopUp() {
      if (goldDiff != 0) {
        return (
          <View className="absolute -mt-3">
            <FadeOutText
              className={"text-zinc-900 dark:text-zinc-50"}
              text={`${goldDiff > 0 ? "+" : ""}${goldDiff.toString()}`}
              animationCycler={animationCycler}
            />
          </View>
        );
      }
    }

    if (playerState) {
      return (
        <Animated.View
          style={{
            display: "flex",
            backgroundColor: showingHealthWarningPulse
              ? backgroundColorInterpolation
              : healthDamageFlash.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["transparent", "rgba(180,30,30,0.4)"],
                }),
          }}
        >
          <View
            className={`${
              onTop ? "border-b" : "border-t pb-3"
            } border-zinc-200 dark:border-zinc-700 flex py-2`}
          >
            {displayGoldTop ? (
              <View className="flex flex-row justify-center">
                <Text>{readableGold}</Text>
                <Coins width={16} height={16} style={{ marginLeft: 6 }} />
                {showingGoldChange ? goldChangePopUp() : null}
              </View>
            ) : null}
            {!onTop ? conditionRenderer() : null}
            <View className="flex flex-row justify-evenly">
              <View className="flex w-[31%]">
                {!onTop && showingHealthChange ? healthChangePopUp() : null}
                <Text className="mx-auto" style={{ color: "#ef4444" }}>
                  Health
                </Text>
                <ProgressBar
                  value={playerState.health}
                  maxValue={playerState.getMaxHealth()}
                  filledColor="#ef4444"
                  unfilledColor="#fca5a5"
                />
                {onTop && showingHealthChange ? healthChangePopUp() : null}
              </View>
              <View className="flex w-[31%]">
                {!onTop && showingManaChange ? manaChangePopUp() : null}
                <Text className="mx-auto" style={{ color: "#60a5fa" }}>
                  Mana
                </Text>
                <ProgressBar
                  value={playerState.mana}
                  maxValue={playerState.getMaxMana()}
                  filledColor="#60a5fa"
                  unfilledColor="#bfdbfe"
                />
                {onTop && showingManaChange ? manaChangePopUp() : null}
              </View>
              <View className="flex w-[31%]">
                {!onTop && showingSanityChange ? sanityChangePopUp() : null}
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
                {onTop && showingSanityChange ? sanityChangePopUp() : null}
              </View>
            </View>
            {onTop ? conditionRenderer() : null}
            {displayGoldBottom ? (
              <View className="mt-2 flex flex-row justify-center">
                <Text>{readableGold}</Text>
                <Coins width={16} height={16} style={{ marginLeft: 6 }} />
                {showingGoldChange ? goldChangePopUp() : null}
              </View>
            ) : null}
          </View>
        </Animated.View>
      );
    }
  },
);
export default PlayerStatus;
