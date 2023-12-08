import { View, Text } from "../../components/Themed";
import { Image, View as NonThemedView } from "react-native";
import { useContext, useEffect, useState } from "react";
import { MonsterImage } from "../../components/MonsterImage";
import { Pressable, Modal } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import BattleTab from "../../components/BattleTab";
import { flipCoin, toTitleCase } from "../../utility/functions";
import { enemyGenerator } from "../../utility/monster";
import PlayerStatus from "../../components/PlayerStatus";
import ProgressBar from "../../components/ProgressBar";
import monsterObjects from "../../assets/json/monsters.json";
import { DungeonInstance, DungeonLevel } from "../../classes/dungeon";
import { Item } from "../../classes/item";
import Coins from "../../assets/icons/CoinsIcon";
import { Condition } from "../../classes/conditions";
import { Minion } from "../../classes/creatures";
import { useIsFocused } from "@react-navigation/native";
import {
  GameContext,
  LogsContext,
  MonsterContext,
  PlayerCharacterContext,
} from "../_layout";
import { observer } from "mobx-react-lite";
import { EvilIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";

const DungeonLevelScreen = observer(() => {
  const playerCharacterData = useContext(PlayerCharacterContext);
  if (!playerCharacterData) throw new Error("missing player context");
  const { playerState } = playerCharacterData;
  const gameData = useContext(GameContext);
  if (!gameData) throw new Error("missing game context");
  const { gameState } = gameData;
  const monsterData = useContext(MonsterContext);
  if (!monsterData) throw new Error("missing monster context");
  const { monsterState, setMonster } = monsterData;
  const logsData = useContext(LogsContext);
  if (!logsData) throw new Error("missing logs context");
  const { logsState } = logsData;

  const { slug } = useLocalSearchParams();
  const [fightingBoss, setFightingBoss] = useState<boolean>(false);
  const [firstLoad, setFirstLoad] = useState<boolean>(true);
  const [instanceName, setInstanceName] = useState<string>(slug[0]);
  const [level, setLevel] = useState<number>(Number(slug[1]));
  const [battleTab, setBattleTab] = useState<
    "attacks" | "spells" | "equipment" | "log"
  >("log");
  const [thisInstance, setThisInstance] = useState<DungeonInstance>();
  const [thisDungeon, setThisDungeon] = useState<DungeonLevel>();
  const [droppedItems, setDroppedItems] = useState<{
    itemDrops: Item[];
    gold: number;
  } | null>(null);
  const [fleeModalShowing, setFleeModalShowing] = useState<boolean>(false);
  const [fleeRollFailure, setFleeRollFailure] = useState<boolean>(false);
  const { colorScheme } = useColorScheme();

  const isFocused = useIsFocused();

  const router = useRouter();

  useEffect(() => {
    setInstanceName(slug[0]);
    setLevel(Number(slug[1]));
  }, [slug]);

  if (!playerState || !gameState) {
    throw new Error("No player character or game data on dungeon level");
  }

  useEffect(() => {
    setThisDungeon(gameState.getDungeon(instanceName, level));
    setThisInstance(gameState.getInstance(instanceName));
  }, [level, instanceName]);

  const loadBoss = async () => {
    setFightingBoss(true);
    await new Promise((resolve) => setTimeout(resolve, 0));

    if (thisDungeon && thisInstance && playerState) {
      setMonster(null);
      const boss = thisDungeon.getBoss(thisInstance.name)[0];
      setMonster(boss);
      battleLogger(`You found the boss!`);
    }
  };

  useEffect(() => {
    if (!fightingBoss) {
      if (!monsterState) {
        getEnemy();
      } else if (firstLoad) {
        appropriateEnemyCheck();
        setFirstLoad(false);
      }
    }
  }, [monsterState]);

  function battleLogger(whatHappened: string) {
    const timeOfLog = new Date().toLocaleTimeString();
    const log = `${timeOfLog}: ${whatHappened}`;
    logsState.push(log);
  }

  function getEnemy() {
    const enemy = enemyGenerator(instanceName, level);
    setMonster(enemy);
    battleLogger(`You found a ${toTitleCase(enemy.creatureSpecies)}!`);
  }

  function appropriateEnemyCheck() {
    if (monsterState && !fightingBoss)
      monsterObjects.forEach((monsterObject) => {
        if (
          monsterObject.name == monsterState.creatureSpecies &&
          !(
            monsterObject.appearsOn.includes(level) &&
            monsterObject.appearsIn.includes(instanceName)
          )
        ) {
          getEnemy();
          return;
        }
      });
  }

  function takeItem(item: Item) {
    if (playerState && droppedItems) {
      playerState.addToInventory(item);
      setDroppedItems((prevState) => {
        const updatedDrops = prevState!.itemDrops.filter(
          (itemDrop) => !itemDrop.equals(item),
        );
        if (updatedDrops.length == 0) {
          return null;
        }
        return {
          ...prevState,
          gold: prevState!.gold,
          itemDrops: updatedDrops,
        };
      });
    }
  }

  function takeAllItems() {
    if (playerState && droppedItems) {
      droppedItems.itemDrops.forEach((item) =>
        playerState.addToInventory(item),
      );
      setDroppedItems(null);
    }
  }

  function flee() {
    const roll = flipCoin();
    if (
      playerState &&
      (roll == "Heads" || monsterState?.creatureSpecies == "training dummy")
    ) {
      router.push("/dungeon");
      setFleeRollFailure(false);
      setTimeout(() => {
        setFleeModalShowing(false);
      }, 300);
      setTimeout(() => {
        playerState.clearMinions();
        setMonster(null);
      }, 300);
    } else {
      setFleeRollFailure(true);
      battleLogger("You failed to flee!");

      let monsterDefeated = false;
      if (playerState && monsterState && playerState.minions.length > 0) {
        const res = playerMinionAttacks(
          monsterState.healthMax,
          playerState.minions,
        );
        const hp = monsterState.damageHealth(res.totalHPDamage);
        const sanity = monsterState.damageSanity(res.totalSanityDamage);
        res.debuffs.forEach((debuff) => monsterState.addCondition(debuff));
        if (hp <= 0 || (sanity && sanity <= 0)) {
          gameState?.gameTick(playerState);
          if (thisDungeon?.level != 0) {
            thisDungeon?.incrementStep();
          }
          battleLogger(
            `You defeated the ${toTitleCase(monsterState.creatureSpecies)}`,
          );
          monsterDefeated = true;
          const drops = monsterState.getDrops(playerState.playerClass);
          playerState.addGold(drops.gold);
          setDroppedItems(drops);
          if (fightingBoss && gameState && thisDungeon) {
            setFightingBoss(false);
            thisDungeon.setBossDefeated();
            gameState.openNextDungeonLevel(thisInstance!.name);
          }
          setMonster(null);
        }
      }
      if (!monsterDefeated) {
        enemyTurn();
      }
    }
  }

  const enemyTurn = () => {
    if (monsterState) {
      const enemyAttackRes = monsterState.takeTurn(
        playerState.getMaxHealth(),
        playerState.getDamageReduction(),
      );
      if (
        enemyAttackRes.attack !== "miss" &&
        enemyAttackRes.attack !== "stun" &&
        enemyAttackRes.attack !== "pass"
      ) {
        const hp = playerState.damageHealth(enemyAttackRes.attack.damage);
        const sanity = playerState.damageSanity(
          enemyAttackRes.attack.sanityDamage,
        );
        enemyAttackRes.attack.debuffs?.forEach((debuff) =>
          playerState.addCondition(debuff),
        );
        if (hp <= 0 || sanity <= 0) {
          router.back();
          router.replace("/DeathScreen");
        }
        let array = [];
        let line = `The ${toTitleCase(monsterState.creatureSpecies)} used ${
          enemyAttackRes.attack.name
        } dealing ${enemyAttackRes.attack.damage} health damage`;

        if (enemyAttackRes.attack.heal) {
          array.push(`healing for ${enemyAttackRes.attack.heal} health`);
        }

        if (enemyAttackRes.attack.sanityDamage > 0) {
          array.push(
            `dealing ${enemyAttackRes.attack.sanityDamage} sanity damage`,
          );
        }

        if (enemyAttackRes.attack.debuffs) {
          enemyAttackRes.attack.debuffs.forEach((debuff) =>
            array.push(`it applied a ${debuff.name} stack`),
          );
        }

        if (array.length) {
          line +=
            ", " +
            array.slice(0, -1).join(", ") +
            (array.length > 1 ? ", and " : " and ") +
            array.slice(-1);
        }
        battleLogger(line);
      } else if (enemyAttackRes.attack == "pass") {
        battleLogger(
          `The ${toTitleCase(monsterState.creatureSpecies)} did nothing`,
        );
      } else {
        battleLogger(
          `The ${toTitleCase(monsterState.creatureSpecies)} ${
            enemyAttackRes.attack == "stun" ? "was " : ""
          }${enemyAttackRes.attack}ed`,
        );
      }
    }
  };

  function useAttack(attack: {
    name: string;
    targets: string;
    hitChance: number;
    damageMult: number;
    sanityDamage: number;
    debuffs: { name: string; chance: number }[] | null;
  }) {
    if (monsterState && playerState && isFocused) {
      let monsterDefeated = false;
      const attackRes = playerState.doPhysicalAttack(
        attack,
        monsterState.healthMax,
      );
      if (attackRes !== "miss") {
        let hp = monsterState.damageHealth(attackRes.damage);
        let sanity = monsterState.damageSanity(attackRes.sanityDamage);
        attackRes.debuffs?.forEach((effect) =>
          monsterState.addCondition(effect),
        );
        let line = `You ${attack.name == "cast" ? "used " : ""}${toTitleCase(
          attack.name,
        )}${
          attack.name !== "cast"
            ? attack.name.charAt(attack.name.length - 1) == "e"
              ? "d"
              : "ed"
            : " on"
        } the ${toTitleCase(monsterState.creatureSpecies)} for ${
          attackRes.damage
        } heath damage`;
        if (attackRes.sanityDamage) {
          line += ` and ${attackRes.sanityDamage} sanity damage`;
        }
        if (attackRes.debuffs) {
          attackRes.debuffs.forEach(
            (effect) => (line += ` and applied a ${effect.name} stack`),
          );
        }
        battleLogger(line);
        if (playerState.minions.length > 0) {
          const res = playerMinionAttacks(
            monsterState.healthMax,
            playerState.minions,
          );
          hp = monsterState.damageHealth(res.totalHPDamage);
          sanity = monsterState.damageSanity(res.totalSanityDamage);
          res.debuffs.forEach((debuff) => monsterState.addCondition(debuff));
        }
        if (hp <= 0 || (sanity && sanity <= 0)) {
          gameState?.gameTick(playerState);
          if (thisDungeon?.level != 0) {
            thisDungeon?.incrementStep();
          }

          battleLogger(
            `You defeated the ${toTitleCase(monsterState.creatureSpecies)}`,
          );
          monsterDefeated = true;
          const drops = monsterState.getDrops(playerState.playerClass);
          playerState.addGold(drops.gold);
          setDroppedItems(drops);
          if (fightingBoss && gameState && thisDungeon) {
            setFightingBoss(false);
            thisDungeon.setBossDefeated();
            gameState.openNextDungeonLevel(thisInstance!.name);
          }
          setMonster(null);
        }
      } else {
        battleLogger(
          `You ${attackRes}ed the ${toTitleCase(monsterState.creatureSpecies)}`,
        );
      }
      if (!monsterDefeated) {
        enemyTurn();
      }
    }
  }

  const useSpell = (spell: {
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
  }) => {
    if (monsterState && playerState && isFocused) {
      let monsterDefeated = false;
      const spellRes = playerState.useSpell(spell, monsterState.healthMax);
      let hp = monsterState.damageHealth(spellRes.damage);
      let sanity = monsterState.damageSanity(spellRes.sanityDamage);
      spellRes.debuffs?.forEach((debuff) => monsterState.addCondition(debuff));
      let line = "";
      if (spell.effects.summon) {
        let summons = spell.effects.summon.map((summon) => toTitleCase(summon));
        if (summons.length > 1) {
          let last = summons[summons.length - 1];
          let others = summons.slice(0, summons.length - 1);
          line = `You summoned ${others.join(", ")} and ${toTitleCase(last)}`;
        } else if (summons.length === 1) {
          line = `You summoned ${summons[0]}`;
        }
      } else {
        line = `You ${toTitleCase(spell.name)}${
          spell.name.charAt(spell.name.length - 1) == "e" ? "d" : "ed"
        } the ${toTitleCase(monsterState.creatureSpecies)} for ${
          spellRes.damage
        } heath damage`;
        if (spellRes.sanityDamage) {
          line += ` and ${spellRes.sanityDamage} sanity damage`;
        }
        if (spellRes.debuffs) {
          spellRes.debuffs.forEach(
            (effect) => (line += ` and applied a ${effect.name} stack`),
          );
        }
      }
      battleLogger(line);
      if (playerState.minions.length > 0) {
        const res = playerMinionAttacks(
          monsterState.healthMax,
          playerState.minions,
        );
        hp = monsterState.damageHealth(res.totalHPDamage);
        sanity = monsterState.damageSanity(res.totalSanityDamage);
        res.debuffs.forEach((debuff) => monsterState.addCondition(debuff));
      }
      if (hp <= 0 || (sanity && sanity <= 0)) {
        gameState.gameTick(playerState);
        if (thisDungeon?.level != 0) {
          thisDungeon?.incrementStep();
        }
        battleLogger(
          `You defeated the ${toTitleCase(monsterState.creatureSpecies)}`,
        );
        monsterDefeated = true;
        const drops = monsterState.getDrops(playerState.playerClass);
        playerState.addGold(drops.gold);
        setDroppedItems(drops);
        if (fightingBoss && thisDungeon) {
          setFightingBoss(false);
          thisDungeon.setBossDefeated();
          gameState.openNextDungeonLevel(thisInstance!.name);
        }
        setMonster(null);
      }
      if (!monsterDefeated) {
        enemyTurn();
      }
    }
  };

  function playerMinionAttacks(enemyMaxHP: number, providedMinions: Minion[]) {
    let totalHPDamage = 0;
    let totalSanityDamage = 0;
    let debuffs: Condition[] = [];
    if (playerState && providedMinions.length > 0) {
      providedMinions.forEach((minion) => {
        const res = minion.attack(enemyMaxHP);
        if (res == "miss") {
          battleLogger(
            `${playerState.getFullName()}'s ${toTitleCase(
              minion.creatureSpecies,
            )} missed!`,
          );
        } else {
          let str = `${playerState.getFullName()}'s ${toTitleCase(
            minion.creatureSpecies,
          )} used ${toTitleCase(res.name)} dealing ${res.damage} damage`;
          totalHPDamage += res.damage;
          if (res.heal && res.heal > 0) {
            str += ` and healed for ${res.heal} damage`;
          }
          if (res.sanityDamage > 0) {
            str += ` and ${res.sanityDamage} sanity damage`;
            totalSanityDamage += res.sanityDamage;
          }
          if (res.debuffs) {
            res.debuffs.forEach((effect) => {
              str += ` and applied a ${effect.name} stack`;
              debuffs.push(effect);
            });
          }
          battleLogger(str);
        }
        if (minion.turnsLeftAlive <= 0) {
          playerState.removeMinion(minion);
        }
      });
    }
    return {
      totalHPDamage: totalHPDamage,
      totalSanityDamage: totalSanityDamage,
      debuffs: debuffs,
    };
  }

  const pass = () => {
    if (monsterState && playerState && isFocused) {
      let monsterDefeated = false;
      playerState.pass();
      let hp: number | undefined = undefined;
      let sanity: number | undefined = undefined;
      battleLogger("You passed!");
      if (playerState.minions.length > 0) {
        const res = playerMinionAttacks(
          monsterState.healthMax,
          playerState.minions,
        );
        hp = monsterState.damageHealth(res.totalHPDamage);
        sanity = monsterState.damageSanity(res.totalSanityDamage);
        res.debuffs.forEach((debuff) => monsterState.addCondition(debuff));
      }
      if ((hp && hp <= 0) || (sanity && sanity <= 0)) {
        if (thisDungeon?.level != 0) {
          thisDungeon?.incrementStep();
        }
        battleLogger(
          `You defeated the ${toTitleCase(monsterState.creatureSpecies)}`,
        );
        monsterDefeated = true;
        const drops = monsterState.getDrops(playerState.playerClass);
        playerState.addGold(drops.gold);
        setDroppedItems(drops);
        if (fightingBoss && gameState && thisDungeon) {
          setFightingBoss(false);
          thisDungeon.setBossDefeated();
          gameState.openNextDungeonLevel(thisInstance!.name);
        }
        setMonster(null);
      }
      if (!monsterDefeated) {
        enemyTurn();
      }
    }
  };

  while (!monsterState) {
    return (
      <View>
        <Text>Loading enemy...</Text>
      </View>
    );
  }

  if (thisDungeon && playerState) {
    return (
      <>
        <Stack.Screen
          options={{
            headerLeft: () => (
              <Pressable
                onPress={() => {
                  setFleeRollFailure(false);
                  setFleeModalShowing(true);
                }}
              >
                {({ pressed }) => (
                  <MaterialCommunityIcons
                    name="run-fast"
                    size={28}
                    color={colorScheme == "light" ? "#18181b" : "#fafafa"}
                    style={{ opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            ),
            title:
              level == 0
                ? "Training Grounds"
                : `${toTitleCase(thisInstance?.name as string)} Level ${level}`,
          }}
        />
        <Modal
          animationType="slide"
          transparent={true}
          visible={fleeModalShowing}
          onRequestClose={() => setFleeModalShowing(false)}
        >
          <NonThemedView className="flex-1 items-center justify-center">
            <View
              className=" w-2/3 rounded-xl bg-zinc-50 px-6 py-4 dark:border dark:border-zinc-50 dark:bg-zinc-700"
              style={{
                shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 5,
              }}
            >
              <Pressable
                className="-ml-2 -mt-2"
                onPress={() => {
                  setFleeModalShowing(false);
                  setFleeRollFailure(false);
                }}
              >
                <EvilIcons
                  name="close"
                  size={28}
                  color={colorScheme == "dark" ? "#fafafa" : "#18181b"}
                />
              </Pressable>
              <View className="flex items-center justify-evenly">
                <Text className="text-center text-lg">Attempt to Flee?</Text>
                <Pressable
                  onPress={flee}
                  className="mb-4 mt-8 rounded-xl border border-zinc-900 px-4 py-2 active:scale-95 active:opacity-50 dark:border-zinc-50"
                >
                  <Text className="text-lg">Run!</Text>
                </Pressable>
                {fleeRollFailure ? (
                  <Text className="text-center" style={{ color: "#ef4444" }}>
                    Roll Failure!
                  </Text>
                ) : null}
              </View>
            </View>
          </NonThemedView>
        </Modal>
        <Modal
          animationType="slide"
          transparent={true}
          visible={droppedItems ? true : false}
          onRequestClose={() => setDroppedItems(null)}
        >
          <NonThemedView className="flex-1 items-center justify-center">
            <View
              className="w-2/3 rounded-xl bg-zinc-50 px-6 py-4 dark:bg-zinc-700"
              style={{
                shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: 2,
                },

                shadowOpacity: 0.25,
                shadowRadius: 5,
              }}
            >
              <NonThemedView>
                <NonThemedView className="mb-2 flex flex-row justify-center">
                  <Text className="italic">
                    You picked up {droppedItems?.gold}
                  </Text>
                  <Coins width={16} height={16} style={{ marginLeft: 6 }} />
                </NonThemedView>
                {droppedItems?.itemDrops.map((item) => (
                  <NonThemedView
                    key={item.id}
                    className="my-2 flex flex-row justify-between"
                  >
                    <NonThemedView className="flex flex-row">
                      <Image source={item.getItemIcon()} />
                      <Text className="my-auto">{item.name}</Text>
                    </NonThemedView>
                    <Pressable
                      onPress={() => {
                        takeItem(item);
                      }}
                      className="rounded-xl border border-zinc-900 px-4 py-2 active:scale-95 active:opacity-50 dark:border-zinc-50"
                    >
                      <Text>Take</Text>
                    </Pressable>
                  </NonThemedView>
                ))}
                {droppedItems && droppedItems.itemDrops.length > 0 ? (
                  <Pressable
                    className="mx-auto mt-4 rounded-xl border border-zinc-900 px-4 py-2 active:scale-95 active:opacity-50 dark:border-zinc-50"
                    onPress={() => {
                      takeAllItems();
                    }}
                  >
                    <Text>Take All</Text>
                  </Pressable>
                ) : null}

                <Pressable
                  className="mx-auto mt-4 rounded-xl border border-zinc-900 px-4 py-2 active:scale-95 active:opacity-50 dark:border-zinc-50"
                  onPress={() => setDroppedItems(null)}
                >
                  <Text>Done Looting</Text>
                </Pressable>
              </NonThemedView>
            </View>
          </NonThemedView>
        </Modal>
        <View className="flex-1 px-4 pt-4">
          <View className="flex h-1/3 flex-row justify-evenly">
            <View className="flex w-2/5 flex-col items-center justify-center">
              <Text className="text-3xl">
                {toTitleCase(monsterState.creatureSpecies)}
              </Text>
              <ProgressBar
                value={monsterState.health}
                maxValue={monsterState.healthMax}
                filledColor="#ef4444"
                unfilledColor="#fee2e2"
              />
            </View>
            <View className="">
              <MonsterImage monsterSpecies={monsterState.creatureSpecies} />
            </View>
          </View>
          {thisDungeon.stepsBeforeBoss !== 0 && !fightingBoss ? (
            <View className="-mt-7 flex flex-row justify-evenly border-b border-zinc-900 pb-1 dark:border-zinc-50">
              <Text className="my-auto text-xl">
                {`Steps Completed: ${thisDungeon.step} / ${thisDungeon.stepsBeforeBoss}`}
              </Text>
              {thisDungeon.step >= thisDungeon.stepsBeforeBoss &&
              !thisDungeon.bossDefeated ? (
                <Pressable
                  onPress={loadBoss}
                  className="my-auto rounded bg-red-500 px-4 py-2 active:scale-95 active:opacity-50"
                >
                  <Text style={{ color: "white" }}>Fight Boss</Text>
                </Pressable>
              ) : null}
            </View>
          ) : fightingBoss ? (
            <View className="-mt-7">
              <Text className="my-auto text-center text-xl">
                Fighting Boss!
              </Text>
            </View>
          ) : null}
          <View className="flex-1 justify-between">
            <View className="flex-1">
              <BattleTab
                useAttack={useAttack}
                battleTab={battleTab}
                useSpell={useSpell}
                pass={pass}
              />
            </View>
            <View className="">
              <View className="-mx-4">
                <View className="flex w-full flex-row justify-evenly border-t border-zinc-200 dark:border-zinc-700">
                  <Pressable
                    className={`px-6 py-4 rounded ${
                      battleTab == "attacks"
                        ? "bg-zinc-100 dark:bg-zinc-800"
                        : "active:bg-zinc-200 dark:active:bg-zinc-700"
                    }`}
                    onPress={() => setBattleTab("attacks")}
                  >
                    <Text className="text-xl">Attacks</Text>
                  </Pressable>
                  <Pressable
                    className={`px-6 py-4 rounded ${
                      battleTab == "spells"
                        ? "bg-zinc-100 dark:bg-zinc-800"
                        : "active:bg-zinc-200 dark:active:bg-zinc-700"
                    }`}
                    onPress={() => setBattleTab("spells")}
                  >
                    <Text className="text-xl">Spells</Text>
                  </Pressable>
                  <Pressable
                    className={`px-6 py-4 rounded ${
                      battleTab == "equipment"
                        ? "border-zinc-200 bg-zinc-100 dark:border-zinc-900 dark:bg-zinc-800"
                        : "active:bg-zinc-200 dark:active:bg-zinc-700"
                    }`}
                    onPress={() => setBattleTab("equipment")}
                  >
                    <Text className="text-xl">Equipment</Text>
                  </Pressable>
                  <Pressable
                    className={`px-6 py-4 rounded ${
                      battleTab == "log"
                        ? "bg-zinc-100 dark:bg-zinc-800"
                        : "active:bg-zinc-200 dark:active:bg-zinc-700"
                    }`}
                    onPress={() => setBattleTab("log")}
                  >
                    <Text className="text-xl">Log</Text>
                  </Pressable>
                </View>
              </View>
              {playerState.minions.length > 0
                ? playerState.minions.map((minion) => (
                    <View key={minion.creatureID} className="py-1">
                      <Text>{toTitleCase(minion.creatureSpecies)}</Text>
                      <ProgressBar
                        filledColor="#ef4444"
                        unfilledColor="#fee2e2"
                        value={minion.health}
                        maxValue={minion.healthMax}
                      />
                    </View>
                  ))
                : null}
              <View className="-mx-4 pb-4">
                <PlayerStatus />
              </View>
            </View>
          </View>
        </View>
      </>
    );
  }
});
export default DungeonLevelScreen;
