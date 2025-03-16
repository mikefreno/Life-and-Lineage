import React, { useCallback } from "react";
import { ThemedView, Text } from "../Themed";
import {
  Pressable,
  FlatList,
  View,
  Platform,
  TouchableWithoutFeedback,
  ScrollView,
} from "react-native";
import { toTitleCase } from "@/utility/functions/misc";
import { useEffect, useState } from "react";
import GenericModal from "@/components/GenericModal";
import SpellDetails from "@/components/SpellDetails";
import InventoryRender from "@/components/InventoryRender";
import { DungeonMapControls } from "./DungeonMap";
import { Energy, Regen } from "@/assets/icons/SVGIcons";
import { elementalColorMap } from "@/constants/Colors";
import { useCombatState, useLootState } from "@/providers/DungeonData";
import { Attack } from "@/entities/attack";
import { Spell } from "@/entities/spell";
import { useCombatActions } from "@/hooks/combat";
import { Item } from "@/entities/item";
import { usePouch, useVibration } from "@/hooks/generic";
import {
  useDraggableStore,
  usePlayerStore,
  useRootStore,
} from "@/hooks/stores";
import { observer } from "mobx-react-lite";
import { tw, useStyles } from "@/hooks/styles";
import { Enemy } from "@/entities/creatures";
import GenericRaisedButton from "@/components/GenericRaisedButton";
import { runInAction } from "mobx";

const BattleTab = observer(
  ({
    battleTab,
  }: {
    battleTab: "attacksOrNavigation" | "equipment" | "log";
  }) => {
    const [attackDetails, setAttackDetails] = useState<Attack | Spell | null>(
      null,
    );
    const [attackDetailsShowing, setAttackDetailsShowing] =
      useState<boolean>(false);

    const { enemyStore, dungeonStore, uiStore, playerAnimationStore } =
      useRootStore();
    const playerState = usePlayerStore();

    const { useAttack } = useCombatActions();
    const { displayItem, setDisplayItem } = useLootState();
    const { draggableClassStore } = useDraggableStore();
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
    const styles = useStyles();

    const [showEncounterResultModal, setShowEncounterResultModal] =
      useState(false);
    const [encounterResult, setEncounterResult] = useState<{
      message: string;
      health?: number;
      sanity?: number;
      mana?: number;
      drops?: Item[];
      gold?: number;
      enemies?: Enemy[];
    } | null>(null);

    const handleSpecialEncounter = useCallback(
      (action: "activate" | "ignore") => {
        if (action === "activate" && dungeonStore.currentSpecialEncounter) {
          const result = dungeonStore.currentSpecialEncounter.activate();
          setEncounterResult(result);
          setShowEncounterResultModal(true);
          if (result.drops) {
            result.drops.forEach((item) => addItemToPouch({ items: [item] }));
          }
        }
        dungeonStore.leaveSpecialEncounterRoom();
      },
      [dungeonStore.currentSpecialEncounter],
    );

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
      setCombinedData([...playerState.weaponAttacks, ...playerState.spells]);
    }, [playerState.weaponAttacks, playerState.spells]);

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
        vibration({ style: "light" });
        const enoughForDualToHitAll =
          enemyStore.enemies.length > 1 ||
          enemyStore.enemies[0].minions.length > 0;

        const attackHitsAllTargets =
          attackOrSpell.attackStyle == "area" ||
          (attackOrSpell.attackStyle == "dual" && enoughForDualToHitAll) ||
          enemyStore.enemies.length === 1;

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
      <View style={{ flex: 1 }}>
        <GenericModal
          isVisibleCondition={attackDetailsShowing}
          backFunction={() => setAttackDetailsShowing(false)}
          size={attackDetails instanceof Spell ? 100 : undefined}
        >
          {attackDetails && (
            <View style={{ alignItems: "center" }}>
              {attackDetails instanceof Spell ? (
                <SpellDetails spell={attackDetails} />
              ) : (
                attackDetails.AttackRender(styles)
              )}
            </View>
          )}
        </GenericModal>

        <GenericModal
          isVisibleCondition={showEncounterResultModal}
          backFunction={() => {
            setShowEncounterResultModal(false);
            dungeonStore.setCurrentSpecialEncounter(null);
          }}
          size={80}
        >
          <ThemedView
            style={{
              width: "100%",
              height: "100%",
              padding: 8,
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                fontSize: 20,
                textAlign: "center",
                marginBottom: 16,
              }}
            >
              {encounterResult?.message}
            </Text>
            {encounterResult?.health && (
              <Text>Health: {encounterResult.health}</Text>
            )}
            {encounterResult?.sanity && (
              <Text>Sanity: {encounterResult.sanity}</Text>
            )}
            {encounterResult?.mana && <Text>Mana: {encounterResult.mana}</Text>}
            {encounterResult?.gold && <Text>Gold: {encounterResult.gold}</Text>}
            {encounterResult?.drops && (
              <Text>
                Items:{" "}
                {encounterResult.drops.map((item) => item.name).join(", ")}
              </Text>
            )}
          </ThemedView>
        </GenericModal>
        {battleTab == "attacksOrNavigation" ? (
          !dungeonStore.inCombat ? (
            dungeonStore.currentSpecialEncounter ? (
              <ThemedView
                style={{
                  width: "100%",
                  height: "100%",
                  padding: 8,
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 20,
                    textAlign: "center",
                    marginBottom: 16,
                  }}
                >
                  {dungeonStore.currentSpecialEncounter.prompt}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-around",
                  }}
                >
                  <GenericRaisedButton
                    onPress={() => handleSpecialEncounter("activate")}
                  >
                    Activate
                  </GenericRaisedButton>
                  <GenericRaisedButton
                    onPress={() => handleSpecialEncounter("ignore")}
                  >
                    Ignore
                  </GenericRaisedButton>
                </View>
              </ThemedView>
            ) : (
              <DungeonMapControls />
            )
          ) : (
            <View style={styles.battleTabContainer}>
              {!playerState.isStunned ? (
                <FlatList
                  data={combinedData}
                  inverted
                  persistentScrollbar
                  renderItem={({ item: attackOrSpell, index }) => (
                    <>
                      <View
                        style={[
                          styles.attackCardBase,
                          attackOrSpell instanceof Spell && {
                            backgroundColor:
                              elementalColorMap[attackOrSpell.element].light,
                          },
                        ]}
                      >
                        <View style={styles.columnCenter}>
                          <Pressable
                            onPress={() => setAttackDetails(attackOrSpell)}
                          >
                            <Text
                              style={[
                                styles["text-xl"],
                                {
                                  color:
                                    attackOrSpell instanceof Spell
                                      ? elementalColorMap[attackOrSpell.element]
                                          .dark
                                      : uiStore.colorScheme == "dark"
                                      ? "#fafafa"
                                      : "#09090b",
                                },
                              ]}
                            >
                              {toTitleCase(attackOrSpell.name)}
                            </Text>
                            {attackOrSpell instanceof Attack &&
                            attackOrSpell.baseHitChance ? (
                              <Text style={styles["text-lg"]}>{`${
                                attackOrSpell.baseHitChance * 100
                              }% hit chance`}</Text>
                            ) : (
                              attackOrSpell instanceof Spell && (
                                <View style={{ flexDirection: "row" }}>
                                  <Text
                                    style={{
                                      color:
                                        elementalColorMap[attackOrSpell.element]
                                          .dark,
                                    }}
                                  >
                                    {attackOrSpell.manaCost}
                                  </Text>
                                  <View
                                    style={{
                                      marginVertical: "auto",
                                      paddingLeft: 4,
                                    }}
                                  >
                                    <Energy
                                      height={uiStore.iconSizeSmall}
                                      width={uiStore.iconSizeSmall}
                                      color={
                                        uiStore.colorScheme == "dark"
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
                        <GenericRaisedButton
                          disabled={
                            !attackOrSpell.canBeUsed ||
                            enemyStore.enemyTurnOngoing
                          }
                          onPress={() => attackHandler(attackOrSpell)}
                          backgroundColor={
                            "element" in attackOrSpell
                              ? elementalColorMap[attackOrSpell.element].dark
                              : uiStore.colorScheme == "light"
                              ? "#d4d4d8"
                              : "#27272a"
                          }
                          disableTopLevelStyling
                          buttonStyle={[
                            styles.actionButton,
                            {
                              opacity:
                                !attackOrSpell.canBeUsed ||
                                enemyStore.enemyTurnOngoing
                                  ? 0.5
                                  : 1,
                            },
                          ]}
                        >
                          <Text style={styles["text-xl"]}>
                            {playerState.isStunned
                              ? "Stunned!"
                              : attackOrSpell instanceof Spell
                              ? playerState.currentMana >=
                                attackOrSpell.manaCost
                                ? "Cast"
                                : "Not Enough Mana"
                              : "Attack"}
                          </Text>
                        </GenericRaisedButton>
                      </View>
                      {index == combinedData.length - 1 && (
                        <ThemedView style={styles.attackCardBase}>
                          <View style={styles.columnCenter}>
                            <Text style={styles["text-xl"]}>Pass</Text>
                            <View style={styles.rowItemsCenter}>
                              <Text>2x</Text>
                              <Regen
                                width={uiStore.iconSizeSmall}
                                height={uiStore.iconSizeSmall}
                              />
                            </View>
                          </View>
                          <GenericRaisedButton
                            disabled={enemyStore.enemyTurnOngoing}
                            disableTopLevelStyling
                            onPress={() => {
                              vibration({ style: "light" });
                              pass({ voluntary: true });
                            }}
                            backgroundColor={
                              uiStore.colorScheme == "light"
                                ? "#d4d4d8"
                                : "#27272a"
                            }
                            buttonStyle={[
                              styles.actionButton,
                              {
                                opacity:
                                  playerState.isStunned ||
                                  enemyStore.enemyTurnOngoing
                                    ? 0.5
                                    : 1.0,
                              },
                            ]}
                          >
                            <Text style={styles["text-xl"]}>Use</Text>
                          </GenericRaisedButton>
                        </ThemedView>
                      )}
                    </>
                  )}
                />
              ) : (
                <View style={styles.stunnedContainer}>
                  <Text style={styles.stunnedText}>Stunned!</Text>
                  <View style={styles.attackCardBase}>
                    <View style={styles.columnCenter}>
                      <Text style={styles["text-xl"]}>Pass</Text>
                    </View>
                    <Pressable
                      disabled={enemyStore.enemyTurnOngoing}
                      onPress={() => {
                        vibration({ style: "light" });
                        runInAction(() => {
                          playerAnimationStore.usedPass = true;
                          setTimeout(
                            () => (playerAnimationStore.usedPass = false),
                            1000,
                          );
                        });
                        pass({ voluntary: true });
                      }}
                      style={[
                        styles.actionButton,
                        {
                          backgroundColor:
                            uiStore.colorScheme == "light"
                              ? "#d4d4d8"
                              : "#27272a",
                          opacity: enemyStore.enemyTurnOngoing ? 0.5 : 1,
                        },
                      ]}
                    >
                      <Text style={styles["text-xl"]}>Use</Text>
                    </Pressable>
                  </View>
                </View>
              )}
            </View>
          )
        ) : battleTab == "equipment" ? (
          <TouchableWithoutFeedback onPress={() => setDisplayItem(null)}>
            <View style={{ flex: 1 }}>
              <InventoryRender
                screen="dungeon"
                displayItem={displayItem}
                setDisplayItem={setDisplayItem}
                targetBounds={[
                  draggableClassStore.ancillaryBoundsMap.get("pouch") ?? null,
                ]}
              />
            </View>
          </TouchableWithoutFeedback>
        ) : (
          <View style={{ flex: 1, ...tw.px2 }}>
            <View style={styles.logContent}>
              {dungeonStore.logs.length === 0 ? (
                <View style={{ marginVertical: "auto" }}>
                  <Text style={[styles["text-lg"], { textAlign: "center" }]}>
                    Combat logs will appear here.
                  </Text>
                </View>
              ) : Platform.OS == "web" ? (
                <ScrollView>
                  {dungeonStore.reversedLogs.map((text) => (
                    <Text style={{ paddingVertical: 4 }}>
                      {text
                        .replaceAll(`on the ${playerState.fullName}`, "")
                        .replaceAll(`on the ${playerState.fullName}`, "")
                        .replaceAll(`The ${playerState.fullName}`, "You")}
                    </Text>
                  ))}
                </ScrollView>
              ) : (
                <FlatList
                  style={{ width: "100%" }}
                  inverted
                  data={dungeonStore.reversedLogs}
                  renderItem={({ item }) => (
                    <Text style={{ paddingVertical: 4 }}>
                      {item
                        .replaceAll(`${playerState.fullName}`, "You")
                        .replaceAll(`on the ${playerState.fullName}`, "")}
                    </Text>
                  )}
                />
              )}
            </View>
          </View>
        )}
      </View>
    );
  },
);

export default BattleTab;
