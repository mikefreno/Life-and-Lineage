import { View as ThemedView, Text, ScrollView } from "../Themed";
import { Pressable, FlatList, View, Platform } from "react-native";
import attacks from "../../assets/json/playerAttacks.json";
import { toTitleCase } from "../../utility/functions/misc/words";
import { Item } from "../../classes/item";
import { useContext, useEffect, useState } from "react";
import { useColorScheme } from "nativewind";
import { useVibration } from "../../utility/customHooks";
import { Minion, Enemy } from "../../classes/creatures";
import { AttackObj, Spell } from "../../utility/types";
import { elementalColorMap } from "../../utility/elementColors";
import Energy from "../../assets/icons/EnergyIcon";
import GenericModal from "../GenericModal";
import SpellDetails from "../SpellDetails";
import GenericStrikeAround from "../GenericStrikeAround";
import InventoryRender from "../InventoryRender";
import { AppContext } from "../../app/_layout";

interface BattleTabProps {
  battleTab: "attacksOrNavigation" | "equipment" | "log";
  pass: () => void;
  useAttack: (attack: AttackObj, target: Enemy | Minion) => void;
  useSpell: (
    spell: {
      name: string;
      element: string;
      proficiencyNeeded: number;
      manaCost: number;
      effects: {
        damage: number | null;
        buffs: string[] | null;
        debuffs: { name: string; chance: number }[] | null;
        summon?: string[];
        selfDamage?: number;
      };
    },
    target: Enemy | Minion,
  ) => void;
  pouchRef: React.RefObject<View>;
  setAttackAnimationOnGoing: React.Dispatch<React.SetStateAction<boolean>>;
  attackAnimationOnGoing: boolean;
  setShowTargetSelection: React.Dispatch<
    React.SetStateAction<{
      showing: boolean;
      chosenAttack: any;
      spell: boolean | null;
    }>
  >;
  addItemToPouch: (item: Item) => void;
  inCombat: boolean;
  DungeonMapControls: JSX.Element;
}

export default function BattleTab({
  battleTab,
  useAttack,
  useSpell,
  pass,
  setAttackAnimationOnGoing,
  attackAnimationOnGoing,
  setShowTargetSelection,
  pouchRef,
  addItemToPouch,
  inCombat,
  DungeonMapControls,
}: BattleTabProps) {
  const { colorScheme } = useColorScheme();
  const [attackDetails, setAttackDetails] = useState<AttackObj | Spell | null>(
    null,
  );
  const [attackDetailsShowing, setAttackDetailsShowing] =
    useState<boolean>(false);

  const appData = useContext(AppContext);
  if (!appData) throw new Error("missing context");
  const { playerState, logsState, enemyState } = appData;

  const playerAttacks = playerState?.physicalAttacks;
  const playerSpells = playerState?.getSpells();
  const vibration = useVibration();

  let attackObjects: AttackObj[] = [];

  playerAttacks?.forEach((plAttack) =>
    attacks.filter((attack) => {
      if (attack.name == plAttack) {
        attackObjects.push(attack as AttackObj);
      }
    }),
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

  let combinedData: (AttackObj | Spell)[] = attackObjects.map((attack) => ({
    ...attack,
  }));

  if (playerSpells) {
    combinedData = combinedData.concat(
      playerSpells.map((spell) => ({ ...spell })),
    );
  }

  useEffect(() => {}, [inCombat]);

  const TabRender = () => {
    if (playerState) {
      switch (battleTab) {
        case "attacksOrNavigation":
          if (!inCombat) {
            return DungeonMapControls;
          } else {
            return (
              <>
                {!playerState.isStunned() ? (
                  Platform.OS != "web" && (
                    <FlatList
                      data={combinedData}
                      inverted
                      renderItem={({ item: attackOrSpell }) => (
                        <View
                          className="my-1 rounded border px-4 py-2"
                          style={{
                            backgroundColor:
                              "element" in attackOrSpell
                                ? elementalColorMap[attackOrSpell.element].light
                                : undefined,
                            borderColor:
                              "element" in attackOrSpell
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
                                {"hitChance" in attackOrSpell &&
                                attackOrSpell.hitChance ? (
                                  <Text className="text-lg">{`${
                                    attackOrSpell.hitChance * 100
                                  }% hit chance`}</Text>
                                ) : (
                                  "element" in attackOrSpell && (
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
                                ("element" in attackOrSpell &&
                                  attackOrSpell.manaCost >= playerState.mana) ||
                                playerState.isStunned() ||
                                attackAnimationOnGoing
                              }
                              onPress={() => {
                                vibration({ style: "light" });
                                if (
                                  enemyState &&
                                  enemyState.minions.length == 0
                                ) {
                                  setAttackAnimationOnGoing(true);
                                  if ("element" in attackOrSpell) {
                                    useSpell(attackOrSpell, enemyState);
                                  } else {
                                    useAttack(attackOrSpell, enemyState);
                                  }
                                } else {
                                  setShowTargetSelection({
                                    showing: true,
                                    chosenAttack: attackOrSpell,
                                    spell:
                                      "element" in attackOrSpell ? true : false,
                                  });
                                }
                              }}
                              className="mx-2 my-auto rounded px-4 py-2 shadow-sm active:scale-95 active:opacity-50"
                              style={[
                                (("element" in attackOrSpell &&
                                  attackOrSpell.manaCost >= playerState.mana) ||
                                  playerState.isStunned() ||
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
                                {playerState.isStunned()
                                  ? "Stunned!"
                                  : "element" in attackOrSpell
                                  ? playerState.mana >= attackOrSpell.manaCost
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
                          pass();
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
              </>
            );
          }
        case "equipment":
          return (
            <View className="my-1 flex-1">
              <InventoryRender
                selfRef={null}
                inventory={playerState.getInventory()}
                pouchTarget={pouchRef}
                addItemToPouch={addItemToPouch}
              />
            </View>
          );
        case "log":
          return (
            <ThemedView
              className="my-1 flex-1 rounded-lg border border-zinc-600 px-4"
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
                  {toTitleCase(attackDetails.targets)}{" "}
                  {attackDetails.targets == "single" && "Target"}
                </Text>
                {attackDetails.hitChance && (
                  <Text>{attackDetails.hitChance * 100}% hit chance</Text>
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
                    {playerState?.calculateBaseAttackDamage(attackDetails)} base
                    attack damage
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
