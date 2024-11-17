import { ThemedView, Text } from "../Themed";
import {
  Pressable,
  FlatList,
  View,
  Platform,
  TouchableWithoutFeedback,
  ScrollView,
} from "react-native";
import { toTitleCase } from "../../utility/functions/misc";
import { useEffect, useState } from "react";
import { useColorScheme } from "nativewind";

import GenericModal from "../GenericModal";
import SpellDetails from "../SpellDetails";
import InventoryRender from "../InventoryRender";
import { DungeonMapControls } from "./DungeonMap";
import PlatformDependantBlurView from "../PlatformDependantBlurView";
import { Energy, Regen } from "../../assets/icons/SVGIcons";
import { elementalColorMap } from "../../constants/Colors";
import { useCombatState, useLootState } from "../../stores/DungeonData";
import { Attack } from "../../entities/attack";
import { Spell } from "../../entities/spell";
import { useCombatActions } from "../../hooks/combat";
import { Item } from "../../entities/item";
import { usePouch, useVibration } from "../../hooks/generic";
import { useDraggableStore, useRootStore } from "../../hooks/stores";
import { observer } from "mobx-react-lite";

const BattleTab = observer(
  ({
    battleTab,
    pouchRef,
    logs,
  }: {
    battleTab: "attacksOrNavigation" | "equipment" | "log";
    pouchRef: React.RefObject<View>;
    logs: string[];
  }) => {
    const { colorScheme } = useColorScheme();
    const [attackDetails, setAttackDetails] = useState<Attack | Spell | null>(
      null,
    );
    const [attackDetailsShowing, setAttackDetailsShowing] =
      useState<boolean>(false);

    const { playerState, enemyStore, dungeonStore } = useRootStore();

    const { useAttack } = useCombatActions();
    const { displayItem, setDisplayItem } = useLootState();
    const { setIconString } = useDraggableStore();
    const { setShowTargetSelection } = useCombatState();

    const [combinedData, setCombinedData] = useState<(Attack | Spell)[]>([]);
    const [hiddenDisplayItem, setHiddenDisplayItem] = useState<{
      item: Item[];
      position: {
        left: number;
        top: number;
      };
    } | null>();

    const vibration = useVibration();
    const { addItemToPouch } = usePouch();
    const { pass } = useCombatActions();

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
        setCombinedData([...playerState.weaponAttacks, ...playerState.spells]);
      }
    }, [playerState]);

    useEffect(() => {
      if (battleTab !== "equipment") {
        setHiddenDisplayItem(displayItem);
        setDisplayItem(null);
      } else {
        if (hiddenDisplayItem) {
          setDisplayItem(hiddenDisplayItem);
          setHiddenDisplayItem(null);
        }
      }
    }, [battleTab]);

    const attackHandler = (attackOrSpell: Attack | Spell) => {
      if (enemyStore.enemies.length > 0) {
        enemyStore.setAttackAnimationOngoing(true);
        vibration({ style: "light" });
        const enoughForDualToHitAll =
          enemyStore.enemies.length > 1 ||
          enemyStore.enemies[0].minions.length > 0;
        const attackHitsAllTargets =
          attackOrSpell.attackStyle == "aoe" || enoughForDualToHitAll;
        if (!attackHitsAllTargets) {
          setShowTargetSelection({
            showing: true,
            chosenAttack: attackOrSpell,
          });
        } else {
          useAttack({
            target: enemyStore.enemies[0],
            attackOrSpell,
          });
        }
      }
    };

    return (
      <>
        <GenericModal
          isVisibleCondition={attackDetailsShowing}
          backFunction={() => setAttackDetailsShowing(false)}
          size={attackDetails instanceof Spell ? 100 : undefined}
        >
          {attackDetails && (
            <View className="flex items-center">
              {attackDetails instanceof Spell ? (
                <SpellDetails spell={attackDetails} />
              ) : (
                attackDetails.AttackRender()
              )}
            </View>
          )}
        </GenericModal>

        {battleTab == "attacksOrNavigation" ? (
          !dungeonStore.inCombat ? (
            <DungeonMapControls />
          ) : (
            <View className="w-full h-full px-2">
              {!playerState.isStunned ? (
                <FlatList
                  data={combinedData}
                  inverted
                  renderItem={({ item: attackOrSpell, index }) => (
                    <>
                      <View
                        className="mt-2 rounded-lg border px-4 py-2"
                        style={{
                          backgroundColor:
                            attackOrSpell instanceof Spell
                              ? elementalColorMap[attackOrSpell.element].light
                              : undefined,
                          borderColor:
                            attackOrSpell instanceof Spell
                              ? elementalColorMap[attackOrSpell.element].dark
                              : "#52525b",
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
                                    attackOrSpell instanceof Spell
                                      ? elementalColorMap[attackOrSpell.element]
                                          .dark
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
                              !attackOrSpell.canBeUsed ||
                              enemyStore.attackAnimationsOnGoing
                            }
                            onPress={() => attackHandler(attackOrSpell)}
                            className="mx-2 my-auto rounded px-4 py-2 shadow-sm active:scale-95 active:opacity-50"
                            style={[
                              (!attackOrSpell.canBeUsed ||
                                enemyStore.attackAnimationsOnGoing) && {
                                opacity: 0.5,
                              },
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
                                : attackOrSpell instanceof Spell
                                ? playerState.currentMana >=
                                  attackOrSpell.manaCost
                                  ? "Cast"
                                  : "Not Enough Mana"
                                : "Attack"}
                            </Text>
                          </Pressable>
                        </View>
                      </View>
                      {index == combinedData.length - 1 && (
                        <View
                          className="flex flex-row mt-2 justify-between rounded-lg border px-4 py-2"
                          style={{
                            borderColor:
                              colorScheme == "light" ? "#71717a" : "#a1a1aa",
                          }}
                        >
                          <View className="flex flex-col justify-center">
                            <Text className="text-xl">Pass</Text>
                            <View className="items-center align-middle flex flex-row">
                              <Text>2x</Text>
                              <Regen width={12} height={12} />
                            </View>
                          </View>
                          <Pressable
                            disabled={enemyStore.attackAnimationsOnGoing}
                            onPress={() => {
                              enemyStore.setAttackAnimationOngoing(true);
                              vibration({ style: "light" });
                              pass({ voluntary: true });
                            }}
                            className="mx-2 my-auto rounded px-4 py-2 shadow-sm active:scale-95 active:opacity-50"
                            style={{
                              backgroundColor:
                                colorScheme == "light" ? "#d4d4d8" : "#27272a",
                              opacity:
                                playerState.isStunned ||
                                enemyStore.attackAnimationsOnGoing
                                  ? 0.5
                                  : 1.0,
                            }}
                          >
                            <Text className="text-xl">Use</Text>
                          </Pressable>
                        </View>
                      )}
                    </>
                  )}
                />
              ) : (
                <View className="my-auto px-4 py-2 shadow">
                  <Text className="text-center text-2xl tracking-wide">
                    Stunned!
                  </Text>
                  <View
                    className="flex flex-row justify-between rounded-lg border px-4 py-2"
                    style={{
                      borderColor:
                        colorScheme == "light" ? "#71717a" : "#a1a1aa",
                    }}
                  >
                    <View className="flex flex-col justify-center">
                      <Text className="text-xl">Pass</Text>
                    </View>
                    <Pressable
                      disabled={enemyStore.attackAnimationsOnGoing}
                      onPress={() => {
                        enemyStore.setAttackAnimationOngoing(true);
                        vibration({ style: "light" });
                        pass({ voluntary: true });
                      }}
                      className={`${
                        enemyStore.attackAnimationsOnGoing
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
          )
        ) : battleTab == "equipment" ? (
          <TouchableWithoutFeedback onPress={() => setDisplayItem(null)}>
            <PlatformDependantBlurView className="flex-1">
              <InventoryRender
                displayItem={displayItem}
                setDisplayItem={setDisplayItem}
                inventory={playerState.inventory}
                pouchTarget={pouchRef}
                addItemToPouch={addItemToPouch}
                setIconString={setIconString}
                keyItemInventory={
                  playerState.keyItems.length > 0
                    ? playerState.keyItems
                    : undefined
                }
              />
            </PlatformDependantBlurView>
          </TouchableWithoutFeedback>
        ) : (
          <PlatformDependantBlurView className="flex-1 px-2">
            <ThemedView
              className="flex-1 pl-1 rounded-lg border border-zinc-600"
              style={{
                backgroundColor: colorScheme == "dark" ? "#09090b" : "#fff",
              }}
            >
              {Platform.OS == "web" ? (
                <ScrollView>
                  {logs.map((text) => (
                    <Text>
                      {text
                        .replaceAll(`on the ${playerState.fullName}`, "")
                        .replaceAll(`on the ${playerState.fullName}`, "")
                        .replaceAll(`The ${playerState.fullName}`, "You")}
                    </Text>
                  ))}
                </ScrollView>
              ) : (
                <FlatList
                  inverted
                  data={logs}
                  renderItem={({ item }) => (
                    <Text className="py-1">
                      {item
                        .replaceAll(`${playerState.fullName}`, "You")
                        .replaceAll(`on the ${playerState.fullName}`, "")}
                    </Text>
                  )}
                />
              )}
            </ThemedView>
          </PlatformDependantBlurView>
        )}
      </>
    );
  },
);

export default BattleTab;
