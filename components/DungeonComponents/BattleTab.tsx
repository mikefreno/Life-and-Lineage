import React, { useCallback, useRef } from "react";
import { ThemedView, Text } from "@/components/Themed";
import {
  Pressable,
  FlatList,
  View,
  Platform,
  TouchableWithoutFeedback,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { useEffect, useState } from "react";
import GenericModal from "@/components/GenericModal";
import SpellDetails from "@/components/SpellDetails";
import InventoryRender from "@/components/InventoryRender";
import { DungeonMapControls } from "./DungeonMap";
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
import { Enemy, Minion } from "@/entities/creatures";
import GenericRaisedButton from "@/components/GenericRaisedButton";
import { runInAction } from "mobx";
import { Being } from "@/entities/being";
import AttacksList from "./AttacksList";
import { useScaling } from "@/hooks/scaling";
import { toTitleCase } from "@/utility/functions/misc";
import ProgressBar from "@/components/ProgressBar";
import ThemedCard from "@/components/ThemedCard";
import Colors from "@/constants/Colors";
import { ClockIcon } from "@/assets/icons/SVGIcons";

const BattleTab = observer(
  ({
    battleTab,
  }: {
    battleTab: "attacksOrNavigation" | "equipment" | "log" | "minions";
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
    const [rect, setRect] = useState<{ width: number; height: number }>();

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
            enemy.minions.forEach((minion) =>
              possibleTargets.push(minion as Being),
            );
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
      <View
        style={{ flex: 1 }}
        onLayout={(e) => {
          const rect = e.nativeEvent.layout;
          setRect({ width: rect.width, height: rect.height });
        }}
      >
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
                <AttacksList
                  setAttackDetails={setAttackDetails}
                  attackHandler={attackHandler}
                  vibration={vibration}
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
        ) : battleTab == "log" ? (
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
        ) : (
          rect && <PlayerMinionSection rect={rect} />
        )}
      </View>
    );
  },
);

export default BattleTab;

const PlayerMinionSection = observer(
  ({
    rect,
  }: {
    rect: {
      width: number;
      height: number;
    };
  }) => {
    const { playerState, uiStore } = useRootStore();
    const vibration = useVibration();

    const { getNormalizedSize } = useScaling();

    const [currentMinionPage, setCurrentMinionPage] = useState(0);
    const minionScrollViewRef = useRef<ScrollView>(null);
    if (!playerState || playerState.minionsAndPets.length == 0) {
      return null;
    }

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (uiStore.isLandscape) {
        const contentOffsetX = event.nativeEvent.contentOffset.x;
        const pageIndex = Math.round(contentOffsetX / rect.width);
        setCurrentMinionPage(pageIndex);
      } else {
        const contentOffsetY = event.nativeEvent.contentOffset.y;
        const pageIndex = Math.round(contentOffsetY / rect.height);
        setCurrentMinionPage(pageIndex);
      }
    };

    return (
      <View
        style={{
          flex: 1,
          flexDirection: uiStore.isLandscape ? "column" : "row",
        }}
      >
        <ScrollView
          ref={minionScrollViewRef}
          horizontal={uiStore.isLandscape}
          pagingEnabled
          scrollEnabled={playerState.minionsAndPets.length > 2}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            alignItems: "center",
          }}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {Array.from({
            length: Math.ceil(playerState.minionsAndPets.length / 2),
          }).map((_, pageIndex) => {
            const leftMinion = playerState.minionsAndPets[pageIndex * 2];
            const rightMinion = playerState.minionsAndPets[pageIndex * 2 + 1];

            return (
              <View
                key={leftMinion.id}
                style={{
                  width:
                    rect.width -
                    (uiStore.isLandscape ? 0 : getNormalizedSize(16)),
                  height:
                    rect.height -
                    (uiStore.isLandscape ? getNormalizedSize(16) : 0),
                  flexDirection: uiStore.isLandscape ? "row" : "column",
                  justifyContent: "space-between",
                  paddingHorizontal: getNormalizedSize(10),
                }}
              >
                <MinionCard minion={leftMinion} noRight={!rightMinion} />
                <MinionCard minion={rightMinion} />
              </View>
            );
          })}
        </ScrollView>
        <View
          style={{
            flexDirection: uiStore.isLandscape ? "row" : "column",
            justifyContent: "center",
            alignContent: "center",
            width: uiStore.isLandscape ? "100%" : getNormalizedSize(16),
            height: uiStore.isLandscape ? getNormalizedSize(16) : "100%",
          }}
        >
          {playerState.minionsAndPets.length > 2 &&
            Array.from({
              length: Math.ceil(playerState.minionsAndPets.length / 2),
            }).map((_, index) => (
              <Pressable
                onPress={() => {
                  vibration({ style: "light" });
                  minionScrollViewRef.current?.scrollTo(
                    uiStore.isLandscape
                      ? {
                          x: index * rect.width,
                          animated: true,
                        }
                      : { y: index * rect.height },
                  );
                }}
                key={`indicator-${index}`}
                style={[
                  uiStore.isLandscape
                    ? { marginHorizontal: 4 }
                    : { marginVertical: 4 },
                  {
                    width: getNormalizedSize(14),
                    height: getNormalizedSize(14),
                    borderRadius: 9999,
                    backgroundColor:
                      currentMinionPage === index
                        ? "#ffffff"
                        : "rgba(255,255,255,0.3)",
                  },
                ]}
              />
            ))}
        </View>
      </View>
    );
  },
);

const MinionCard = observer(
  ({ minion, noRight }: { minion: Minion | null; noRight?: boolean }) => {
    const { uiStore } = useRootStore();
    const styles = useStyles();
    if (!minion) return;
    return (
      <ThemedCard
        style={{
          width: uiStore.isLandscape ? (noRight ? "100%" : "48%") : "100%",
          height: "100%",
          justifyContent: "center",
          paddingVertical: 6,
          alignSelf: "center",
        }}
      >
        <View
          style={[
            uiStore.isLandscape ? styles.rowBetween : styles.columnBetween,
            { paddingBottom: 4 },
          ]}
        >
          <View
            style={
              !uiStore.isLandscape && {
                width: "100%",
                flexDirection: "row",
                justifyContent: "center",
              }
            }
          >
            <Text style={styles["text-xl"]}>
              {toTitleCase(minion.creatureSpecies)}
            </Text>
            {minion.turnsLeftAlive < 100 && (
              <View
                style={{
                  flexDirection: "row",
                  alignSelf: "flex-end",
                  paddingLeft: 4,
                }}
              >
                <Text>{minion.turnsLeftAlive}</Text>
                <ClockIcon
                  height={uiStore.iconSizeSmall}
                  width={uiStore.iconSizeSmall}
                  color={Colors.dark.text}
                />
              </View>
            )}
          </View>
          <ScrollView
            horizontal
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
            }}
          >
            {minion.attacks.map((attack) => (
              <View
                key={attack.name}
                style={{
                  padding: 2,
                  borderColor: Colors[uiStore.colorScheme].border,
                  borderWidth: 1,
                  borderRadius: 4,
                }}
              >
                <Text>{toTitleCase(attack.name)}</Text>
                <Text>Damage: {attack.displayDamage.cumulativeDamage}</Text>
                <Text>{attack.baseHitChance * 100}% chance to hit.</Text>
                {attack.debuffNames &&
                  attack.debuffNames.map((debuff) => (
                    <Text key={debuff.name}>
                      {toTitleCase(debuff.name)} - {debuff.chance * 100}% Chance
                    </Text>
                  ))}
              </View>
            ))}
          </ScrollView>
        </View>
        <ProgressBar
          filledColor="#ef4444"
          unfilledColor="#fee2e2"
          value={minion.currentHealth}
          maxValue={minion.maxHealth}
        />
      </ThemedCard>
    );
  },
);
