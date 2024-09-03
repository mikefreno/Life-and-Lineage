import { View as ThemedView, Text, ScrollView } from "../Themed";
import {
  Pressable,
  FlatList,
  View,
  Platform,
  TouchableWithoutFeedback,
} from "react-native";
import { toTitleCase } from "../../utility/functions/misc/words";
import { useContext, useEffect, useState } from "react";
import { useColorScheme } from "nativewind";
import { useVibration } from "../../utility/customHooks";
import { elementalColorMap } from "../../utility/elementColors";
import GenericModal from "../GenericModal";
import SpellDetails from "../SpellDetails";
import GenericStrikeAround from "../GenericStrikeAround";
import InventoryRender from "../InventoryRender";
import { AppContext } from "../../app/_layout";
import { DungeonContext } from "./DungeonContext";
import { addItemToPouch, pass, use } from "./DungeonInteriorFunctions";
import { DungeonMapControls } from "./DungeonMap";
import PlatformDependantBlurView from "../PlatformDependantBlurView";
import { useIsFocused } from "@react-navigation/native";
import { Energy } from "../../assets/icons/SVGIcons";
import { Attack } from "../../classes/attack";
import { Spell } from "../../classes/spell";

interface BattleTabProps {
  battleTab: "attacksOrNavigation" | "equipment" | "log";
  pouchRef: React.RefObject<View>;
}

export default function BattleTab({ battleTab, pouchRef }: BattleTabProps) {
  const { colorScheme } = useColorScheme();
  const [attackDetails, setAttackDetails] = useState<Attack | Spell | null>(
    null,
  );
  const [attackDetailsShowing, setAttackDetailsShowing] =
    useState<boolean>(false);

  const appData = useContext(AppContext);
  const dungeonData = useContext(DungeonContext);
  if (!appData || !dungeonData) throw new Error("missing context");
  const { playerState, logsState, enemyState } = appData;
  const {
    inCombat,
    attackAnimationOnGoing,
    setAttackAnimationOnGoing,
    displayItem,
    setDisplayItem,
  } = dungeonData;
  const [combinedData, setCombinedData] = useState<(Attack | Spell)[]>([]);

  const vibration = useVibration();
  const isFocused = useIsFocused();

  if (!playerState) return;

  useEffect(() => {
    if (attackDetails) {
      setAttackDetailsShowing(true);
    }
  }, [attackDetails]);

  useEffect(() => {
    if (!attackDetailsShowing) {
      setTimeout(() => setAttackDetails(null), 250);
    }
  }, [attackDetailsShowing]);

  useEffect(() => {
    if (playerState) {
      setCombinedData([...playerState.physicalAttacks, ...playerState.spells]);
    }
  }, [playerState]);

  useEffect(() => {}, [inCombat]);

  const TabRender = () => {
    if (playerState) {
      switch (battleTab) {
        case "attacksOrNavigation":
          if (!inCombat) {
            return <DungeonMapControls />;
          } else {
            return (
              <View className="w-full h-full px-2">
                {!playerState.isStunned ? (
                  Platform.OS != "web" && (
                    <FlatList
                      data={combinedData}
                      inverted
                      renderItem={({ item: attackOrSpell }) => (
                        <View
                          className="my-1 rounded border px-4 py-2"
                          style={{
                            backgroundColor:
                              attackOrSpell instanceof Spell
                                ? elementalColorMap[attackOrSpell.element].light
                                : undefined,
                            borderColor:
                              attackOrSpell instanceof Spell
                                ? elementalColorMap[attackOrSpell.element].dark
                                : colorScheme == "light"
                                ? "#71717a"
                                : "#a1a1aa",
                          }}
                        >
                          <View className="flex flex-row justify-between">
                            <View className="flex flex-col justify-center">
                              <Pressable
                                onPress={() => {
                                  setAttackDetails(attackOrSpell);
                                }}
                              >
                                <Text
                                  className="text-xl"
                                  style={{
                                    color:
                                      "element" in attackOrSpell
                                        ? elementalColorMap[
                                            attackOrSpell.element
                                          ].dark
                                        : colorScheme == "dark"
                                        ? "#fafafa"
                                        : "#09090b",
                                  }}
                                >
                                  {toTitleCase(attackOrSpell.name)}
                                </Text>
                                {attackOrSpell instanceof Attack &&
                                attackOrSpell.baseHitChance ? (
                                  <Text className="text-lg">{`${
                                    attackOrSpell.baseHitChance * 100
                                  }% hit chance`}</Text>
                                ) : (
                                  attackOrSpell instanceof Spell && (
                                    <View className="flex flex-row">
                                      <Text
                                        style={{
                                          color:
                                            elementalColorMap[
                                              attackOrSpell.element
                                            ].dark,
                                        }}
                                      >
                                        {attackOrSpell.manaCost}
                                      </Text>
                                      <View className="my-auto pl-1">
                                        <Energy
                                          height={14}
                                          width={14}
                                          color={
                                            colorScheme == "dark"
                                              ? "#2563eb"
                                              : undefined
                                          }
                                        />
                                      </View>
                                    </View>
                                  )
                                )}
                              </Pressable>
                            </View>
                            <Pressable
                              disabled={
                                (attackOrSpell instanceof Spell &&
                                  attackOrSpell.manaCost >=
                                    playerState.currentMana) ||
                                playerState.isStunned ||
                                attackAnimationOnGoing
                              }
                              onPress={() => {
                                setAttackAnimationOnGoing(true);
                                vibration({ style: "light" });
                                use({
                                  target: enemyState!,
                                  attackOrSpell,
                                  appData,
                                  dungeonData,
                                  isFocused,
                                });
                              }}
                              className="mx-2 my-auto rounded px-4 py-2 shadow-sm active:scale-95 active:opacity-50"
                              style={[
                                (("element" in attackOrSpell &&
                                  attackOrSpell.manaCost >=
                                    playerState.currentMana) ||
                                  playerState.isStunned ||
                                  attackAnimationOnGoing) && { opacity: 0.5 },
                                {
                                  backgroundColor:
                                    "element" in attackOrSpell
                                      ? elementalColorMap[attackOrSpell.element]
                                          .dark
                                      : colorScheme == "light"
                                      ? "#d4d4d8"
                                      : "#27272a",
                                },
                              ]}
                            >
                              <Text className="text-xl">
                                {playerState.isStunned
                                  ? "Stunned!"
                                  : "element" in attackOrSpell
                                  ? playerState.currentMana >=
                                    attackOrSpell.manaCost
                                    ? "Cast"
                                    : "Not Enough Mana"
                                  : "Attack"}
                              </Text>
                            </Pressable>
                          </View>
                        </View>
                      )}
                    />
                  )
                ) : (
                  <View className="my-auto px-4 py-2 shadow">
                    <Text className="text-center text-2xl tracking-wide">
                      Stunned!
                    </Text>
                    <View
                      className="flex flex-row justify-between rounded border px-4 py-2"
                      style={{
                        borderColor:
                          colorScheme == "light" ? "#71717a" : "#a1a1aa",
                      }}
                    >
                      <View className="flex flex-col justify-center">
                        <Text className="text-xl">Pass</Text>
                      </View>
                      <Pressable
                        disabled={attackAnimationOnGoing}
                        onPress={() => {
                          setAttackAnimationOnGoing(true);
                          vibration({ style: "light" });
                          pass({ appData, dungeonData, isFocused });
                        }}
                        className={`${
                          attackAnimationOnGoing
                            ? ""
                            : "bg-zinc-300 dark:bg-zinc-700"
                        } mx-2 my-auto rounded px-4 py-2 active:scale-95 active:opacity-50`}
                      >
                        <Text className="text-xl">Use</Text>
                      </Pressable>
                    </View>
                  </View>
                )}
              </View>
            );
          }
        case "equipment":
          return (
            <TouchableWithoutFeedback onPress={() => setDisplayItem(null)}>
              <PlatformDependantBlurView className="flex-1 px-2">
                <InventoryRender
                  displayItem={displayItem}
                  setDisplayItem={setDisplayItem}
                  inventory={playerState.getInventory()}
                  pouchTarget={pouchRef}
                  addItemToPouch={(item) =>
                    addItemToPouch({ item, dungeonData })
                  }
                />
              </PlatformDependantBlurView>
            </TouchableWithoutFeedback>
          );
        case "log":
          return (
            <PlatformDependantBlurView className="flex-1 px-2">
              <ThemedView
                className="flex-1 pl-1 rounded-lg border border-zinc-600"
                style={{
                  backgroundColor: colorScheme == "dark" ? "#09090b" : "#fff",
                }}
              >
                {Platform.OS == "web" ? (
                  <ScrollView>
                    {logsState
                      .slice()
                      .reverse()
                      .map((text) => (
                        <Text>{text}</Text>
                      ))}
                  </ScrollView>
                ) : (
                  <FlatList
                    inverted
                    data={logsState.slice().reverse()}
                    renderItem={({ item }) => (
                      <Text className="py-1">{item}</Text>
                    )}
                  />
                )}
              </ThemedView>
            </PlatformDependantBlurView>
          );
      }
    }
  };

  return (
    <>
      <GenericModal
        isVisibleCondition={attackDetailsShowing}
        backFunction={() => setAttackDetailsShowing(false)}
      >
        {attackDetails && (
          <View className="flex items-center">
            {"element" in attackDetails ? (
              <SpellDetails spell={attackDetails} />
            ) : (
              <>
                <Text className="text-xl">
                  {toTitleCase(attackDetails?.name)}
                </Text>
                <Text>
                  {toTitleCase(attackDetails.attackStyle)}{" "}
                  {attackDetails.attackStyle == "single" && "Target"}
                </Text>
                {attackDetails.attackStyle && (
                  <Text>{attackDetails.baseHitChance * 100}% hit chance</Text>
                )}
                {attackDetails.buffs && (
                  <>
                    <GenericStrikeAround>Buffs</GenericStrikeAround>
                    {attackDetails.buffs.map((buff) => (
                      <View>
                        <Text>{buff.name}</Text>
                        <Text>{buff.chance * 100}% effect chance</Text>
                      </View>
                    ))}
                  </>
                )}
                {attackDetails.debuffs && (
                  <>
                    <GenericStrikeAround>Debuffs</GenericStrikeAround>
                    {attackDetails.debuffs.map((debuff) => (
                      <View>
                        <Text>{debuff.name}</Text>
                        <Text>{debuff.chance * 100}% effect chance</Text>
                      </View>
                    ))}
                  </>
                )}
                <View className="my-1 w-2/3 items-center rounded-md border border-zinc-800 px-2 py-1 dark:border-zinc-100">
                  <Text className="text-center">
                    {attackDetails.baseDamage} base attack damage
                  </Text>
                  <Text className="text-center">
                    (before enemy damage reduction)
                  </Text>
                </View>
              </>
            )}
          </View>
        )}
      </GenericModal>

      <TabRender />
    </>
  );
}
