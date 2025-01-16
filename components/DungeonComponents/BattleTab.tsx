import React from "react";
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
import GenericModal from "../GenericModal";
import SpellDetails from "../SpellDetails";
import InventoryRender from "../InventoryRender";
import { DungeonMapControls } from "./DungeonMap";
import { Energy, Regen } from "../../assets/icons/SVGIcons";
import { elementalColorMap } from "../../constants/Colors";
import { useCombatState, useLootState } from "../../providers/DungeonData";
import { Attack } from "../../entities/attack";
import { Spell } from "../../entities/spell";
import { useCombatActions } from "../../hooks/combat";
import { Item } from "../../entities/item";
import { usePouch, useVibration } from "../../hooks/generic";
import {
  useDraggableStore,
  usePlayerStore,
  useRootStore,
} from "../../hooks/stores";
import { observer } from "mobx-react-lite";
import { text, tw, useStyles } from "../../hooks/styles";

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

    const { enemyStore, dungeonStore, uiStore } = useRootStore();
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
        enemyStore.setAttackAnimationOngoing(true);
        vibration({ style: "light" });
        const enoughForDualToHitAll =
          enemyStore.enemies.length > 1 ||
          enemyStore.enemies[0].minions.length > 0;

        const attackHitsAllTargets =
          attackOrSpell.attackStyle == "aoe" ||
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
        {battleTab == "attacksOrNavigation" ? (
          !dungeonStore.inCombat ? (
            <DungeonMapControls />
          ) : (
            <View style={styles.battleTabContainer}>
              {!playerState.isStunned ? (
                <FlatList
                  data={combinedData}
                  inverted
                  renderItem={({ item: attackOrSpell, index }) => (
                    <>
                      <ThemedView
                        style={
                          attackOrSpell instanceof Spell && {
                            backgroundColor:
                              elementalColorMap[attackOrSpell.element].light,
                            borderColor:
                              elementalColorMap[attackOrSpell.element].dark,
                          }
                        }
                      >
                        <View style={styles.attackCardBase}>
                          <View style={styles.columnCenter}>
                            <Pressable
                              onPress={() => setAttackDetails(attackOrSpell)}
                            >
                              <Text
                                style={[
                                  text.xl,
                                  {
                                    color:
                                      attackOrSpell instanceof Spell
                                        ? elementalColorMap[
                                            attackOrSpell.element
                                          ].dark
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
                                <Text style={text.lg}>{`${
                                  attackOrSpell.baseHitChance * 100
                                }% hit chance`}</Text>
                              ) : (
                                attackOrSpell instanceof Spell && (
                                  <View style={{ flexDirection: "row" }}>
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
                                    <View
                                      style={{
                                        marginVertical: "auto",
                                        paddingLeft: 4,
                                      }}
                                    >
                                      <Energy
                                        height={14}
                                        width={14}
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
                          <Pressable
                            disabled={
                              !attackOrSpell.canBeUsed ||
                              enemyStore.attackAnimationsOnGoing
                            }
                            onPress={() => attackHandler(attackOrSpell)}
                            style={[
                              styles.actionButton,
                              {
                                opacity:
                                  !attackOrSpell.canBeUsed ||
                                  enemyStore.attackAnimationsOnGoing
                                    ? 0.5
                                    : 1,
                                backgroundColor:
                                  "element" in attackOrSpell
                                    ? elementalColorMap[attackOrSpell.element]
                                        .dark
                                    : uiStore.colorScheme == "light"
                                    ? "#d4d4d8"
                                    : "#27272a",
                              },
                            ]}
                          >
                            <Text style={text.xl}>
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
                      </ThemedView>
                      {index == combinedData.length - 1 && (
                        <ThemedView style={styles.attackCardBase}>
                          <View style={styles.columnCenter}>
                            <Text style={text.xl}>Pass</Text>
                            <View style={styles.rowItemsCenter}>
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
                            style={[
                              styles.actionButton,
                              {
                                backgroundColor:
                                  uiStore.colorScheme == "light"
                                    ? "#d4d4d8"
                                    : "#27272a",
                                opacity:
                                  playerState.isStunned ||
                                  enemyStore.attackAnimationsOnGoing
                                    ? 0.5
                                    : 1.0,
                              },
                            ]}
                          >
                            <Text style={text.xl}>Use</Text>
                          </Pressable>
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
                      <Text style={text.xl}>Pass</Text>
                    </View>
                    <Pressable
                      disabled={enemyStore.attackAnimationsOnGoing}
                      onPress={() => {
                        enemyStore.setAttackAnimationOngoing(true);
                        vibration({ style: "light" });
                        pass({ voluntary: true });
                      }}
                      style={[
                        styles.actionButton,
                        {
                          backgroundColor:
                            uiStore.colorScheme == "light"
                              ? "#d4d4d8"
                              : "#27272a",
                          opacity: enemyStore.attackAnimationsOnGoing ? 0.5 : 1,
                        },
                      ]}
                    >
                      <Text style={text.xl}>Use</Text>
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
              {Platform.OS == "web" ? (
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
