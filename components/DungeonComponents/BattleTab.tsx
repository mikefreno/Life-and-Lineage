import React, { useCallback, useMemo, useRef } from "react";
import { ThemedView, Text } from "@/components/Themed";
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
import { Being } from "@/entities/being";

const BattleTab = observer(
  ({
    battleTab,
  }: {
    battleTab: "attacksOrNavigation" | "equipment" | "log";
  }) => {
    const [attackDetails, setAttackDetails] = useState<Attack | null>(null);
    const [attackDetailsShowing, setAttackDetailsShowing] =
      useState<boolean>(false);

    const { enemyStore, dungeonStore, uiStore, playerAnimationStore } =
      useRootStore();
    const playerState = usePlayerStore();

    const { useAttack } = useCombatActions();
    const { displayItem, setDisplayItem } = useLootState();
    const { draggableClassStore } = useDraggableStore();
    const { setShowTargetSelection } = useCombatState();
    const initialRenderRef = useRef(true);

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
      if (initialRenderRef.current) {
        initialRenderRef.current = false;

        const tempDisplayItem = displayItem;
        setHiddenDisplayItem(tempDisplayItem);
        setDisplayItem(null);

        setTimeout(() => {
          if (hiddenDisplayItem) {
            setDisplayItem(hiddenDisplayItem);
            setHiddenDisplayItem(null);
          } else if (tempDisplayItem) {
            setDisplayItem(tempDisplayItem);
          }
        }, 0);
      }
    }, []);

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

    const attackHandler = (attack: Attack) => {
      if (enemyStore.enemies.length > 0) {
        vibration({ style: "light" });
        let possibleTargets = enemyStore.enemies;
        enemyStore.enemies.forEach((enemy) => {
          if (enemy instanceof Enemy) {
            enemy.minions.forEach((minion) => minion as Being);
          }
        });

        const attackHitsAllTargets =
          attack.targets === "area" ||
          (attack.targets === "dual" && possibleTargets.length <= 2) ||
          (attack.targets === "single" && possibleTargets.length === 1);

        if (!attackHitsAllTargets) {
          setShowTargetSelection({
            showing: true,
            chosenAttack: attack,
          });
        } else {
          useAttack({
            targets: possibleTargets,
            attack,
          });
        }
      }
    };

    return (
      <View style={{ flex: 1 }}>
        <GenericModal
          isVisibleCondition={attackDetailsShowing}
          backFunction={() => setAttackDetailsShowing(false)}
          size={attackDetails && attackDetails.element ? 100 : undefined}
        >
          {attackDetails && (
            <View style={{ alignItems: "center" }}>
              {attackDetails && attackDetails.element ? (
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
              <View
                style={{
                  width: "100%",
                  height: "100%",
                  justifyContent: "center",
                  alignContent: "center",
                }}
              >
                <Text
                  style={{
                    ...styles["text-lg"],
                    textAlign: "center",
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
              </View>
            ) : (
              <DungeonMapControls />
            )
          ) : (
            <View style={styles.battleTabContainer}>
              {!playerState.isStunned ? (
                <FlatList
                  data={[...playerState.weaponAttacks, ...playerState.spells]}
                  inverted
                  indicatorStyle={"white"}
                  persistentScrollbar
                  contentContainerStyle={[
                    styles.notchAvoidingLanscapePad,
                    { paddingHorizontal: "2%" },
                  ]}
                  renderItem={({ item, index }) => (
                    <AttackItem
                      attack={item}
                      isLast={
                        index ==
                        playerState.weaponAttacks.length +
                          playerState.spells.length -
                          1
                      }
                      setAttackDetails={setAttackDetails}
                      attackHandler={attackHandler}
                      pass={pass}
                      vibration={vibration}
                    />
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
          <View
            style={{ flex: 1, ...tw.px2, ...styles.notchAvoidingLanscapePad }}
          >
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

const AttackItem = observer(
  ({
    attack,
    isLast,
    attackHandler,
    pass,
    vibration,
    setAttackDetails,
  }: {
    attack: Attack;
    isLast: boolean;
    setAttackDetails: (val: Attack) => void;
    attackHandler: (val: Attack) => void;
    pass: ({ voluntary }: { voluntary?: boolean }) => void;
    vibration: ({
      style,
      essential,
    }: {
      style: "light" | "medium" | "heavy" | "success" | "warning" | "error";
      essential?: boolean;
    }) => void;
  }) => {
    const { playerState, enemyStore, uiStore } = useRootStore();
    const styles = useStyles();

    if (!playerState) {
      throw new Error(
        "playerState should be checked before AttackOrSpellItem render",
      );
    }

    const canUse = useMemo(
      () => attack.canBeUsed,
      [attack, playerState.currentMana, playerState.isStunned],
    );

    const isDisabled = useMemo(
      () => !canUse.val || enemyStore.enemyTurnOngoing,
      [canUse, enemyStore.enemyTurnOngoing],
    );

    const handlePress = useCallback(() => {
      attackHandler(attack);
    }, [attackHandler, attack]);

    const handlePassPress = useCallback(() => {
      vibration({ style: "light" });
      pass({ voluntary: true });
    }, [pass, vibration]);

    const handleDetailsPress = useCallback(() => {
      setAttackDetails(attack);
    }, [setAttackDetails, attack]);

    const isSpell = !!attack.element;

    const buttonText = useMemo(() => {
      if (playerState.isStunned) return "Stunned!";
      if (isSpell) return canUse.val ? "Cast" : canUse.reason;
      return "Attack";
    }, [isSpell, canUse, playerState.isStunned]);

    const backgroundColor = useMemo(() => {
      if (isSpell) return elementalColorMap[attack.element].dark;
      return uiStore.colorScheme === "light" ? "#d4d4d8" : "#27272a";
    }, [isSpell, attack, uiStore.colorScheme]);

    const textColor = useMemo(() => {
      if (isSpell) return elementalColorMap[attack.element].dark;
      return uiStore.colorScheme === "dark" ? "#fafafa" : "#09090b";
    }, [isSpell, attack, uiStore.colorScheme]);

    return (
      <>
        <View
          style={[
            styles.attackCardBase,
            isSpell && {
              backgroundColor: elementalColorMap[attack.element].light,
            },
          ]}
        >
          <View style={styles.columnCenter}>
            <Pressable onPress={handleDetailsPress}>
              <Text style={[styles["text-xl"], { color: textColor }]}>
                {toTitleCase(attack.name)}
              </Text>
              {!isSpell && attack.baseHitChance ? (
                <Text style={styles["text-lg"]}>{`${
                  attack.baseHitChance * 100
                }% hit chance`}</Text>
              ) : (
                isSpell && (
                  <View style={{ flexDirection: "row" }}>
                    <Text
                      style={{
                        color: elementalColorMap[attack.element].dark,
                      }}
                    >
                      {attack.manaCost}
                    </Text>
                    <View style={{ marginVertical: "auto", paddingLeft: 4 }}>
                      <Energy
                        height={uiStore.iconSizeSmall}
                        width={uiStore.iconSizeSmall}
                        color={
                          uiStore.colorScheme === "dark" ? "#2563eb" : undefined
                        }
                      />
                    </View>
                  </View>
                )
              )}
            </Pressable>
          </View>
          <GenericRaisedButton
            disabled={isDisabled}
            onPress={handlePress}
            backgroundColor={backgroundColor}
            disableTopLevelStyling
            style={{ opacity: isDisabled ? 0.5 : 1 }}
            buttonStyle={styles.actionButton}
          >
            <Text style={styles["text-xl"]}>{buttonText}</Text>
          </GenericRaisedButton>
        </View>

        {isLast && <PassButton onPress={handlePassPress} />}
      </>
    );
  },
);

const PassButton = observer(({ onPress }: { onPress: () => void }) => {
  const { uiStore, enemyStore } = useRootStore();
  const styles = useStyles();

  return (
    <ThemedView style={styles.attackCardBase}>
      <View style={styles.columnCenter}>
        <Text style={styles["text-xl"]}>Pass</Text>
        <View style={styles.rowItemsCenter}>
          <Text>1.5x</Text>
          <Regen width={uiStore.iconSizeSmall} height={uiStore.iconSizeSmall} />
        </View>
      </View>
      <GenericRaisedButton
        disabled={enemyStore.enemyTurnOngoing}
        disableTopLevelStyling
        onPress={onPress}
        backgroundColor={uiStore.colorScheme == "light" ? "#d4d4d8" : "#27272a"}
        style={{ opacity: enemyStore.enemyTurnOngoing ? 0.5 : 1 }}
        buttonStyle={styles.actionButton}
      >
        <Text style={styles["text-xl"]}>Use</Text>
      </GenericRaisedButton>
    </ThemedView>
  );
});
