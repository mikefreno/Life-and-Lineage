import { View, Text } from "../../components/Themed";
import { Image, View as NonThemedView } from "react-native";
import { useEffect, useState } from "react";
import { MonsterImage } from "../../components/MonsterImage";
import { Pressable, Modal } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import BattleTab from "../../components/BattleTab";
import { router } from "expo-router";
import { toTitleCase } from "../../utility/functions";
import { enemyGenerator } from "../../utility/monster";
import { useDispatch, useSelector } from "react-redux";
import {
  selectGame,
  selectMonster,
  selectPlayerCharacter,
} from "../../redux/selectors";
import {
  setGameData,
  setMonster,
  setPlayerCharacter,
} from "../../redux/slice/game";
import { AppDispatch } from "../../redux/store";
import { appendLogs } from "../../redux/slice/game";
import PlayerStatus from "../../components/PlayerStatus";
import ProgressBar from "../../components/ProgressBar";
import monsterObjects from "../../assets/json/monsters.json";
import { DungeonInstance, DungeonLevel } from "../../classes/dungeon";
import { Item } from "../../classes/item";
import Coins from "../../assets/icons/CoinsIcon";
import { Condition } from "../../classes/conditions";
import { Minion } from "../../classes/creatures";

export default function DungeonLevelScreen() {
  const { slug } = useLocalSearchParams();
  const playerCharacter = useSelector(selectPlayerCharacter);
  const gameData = useSelector(selectGame);
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
  const [loading, setLoading] = useState(false);

  const monster = useSelector(selectMonster);

  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    console.log(playerCharacter?.getMinions());
  }, [playerCharacter]);

  useEffect(() => {
    setInstanceName(slug[0]);
    setLevel(Number(slug[1]));
  }, [slug]);

  if (!playerCharacter || !gameData) {
    throw new Error("No player character or game data on dungeon level");
  }

  useEffect(() => {
    setThisDungeon(gameData.getDungeon(instanceName, level));
    setThisInstance(gameData.getInstance(instanceName));
  }, [level, instanceName]);

  const loadBoss = async () => {
    setFightingBoss(true);
    await new Promise((resolve) => setTimeout(resolve, 0));

    if (thisDungeon && thisInstance && playerCharacter) {
      dispatch(setMonster(null));
      const boss = thisDungeon.getBoss(thisInstance.name)[0];
      dispatch(setMonster(boss));
      battleLogger(`You found the boss!`);
    }
  };

  useEffect(() => {
    if (!fightingBoss) {
      if (!monster) {
        getEnemy();
      } else if (firstLoad) {
        appropriateEnemyCheck();
        setFirstLoad(false);
      }
    }
  }, [monster]);

  function battleLogger(whatHappened: string) {
    const timeOfLog = new Date().toLocaleTimeString();
    const log = { logLine: `${timeOfLog}: ${whatHappened}` };
    dispatch(appendLogs(log));
  }

  function getEnemy() {
    const enemy = enemyGenerator(instanceName, level);

    battleLogger(`You found a ${toTitleCase(enemy.creatureSpecies)}!`);
    dispatch(setMonster(enemy));
  }

  function appropriateEnemyCheck() {
    if (monster && !fightingBoss)
      monsterObjects.forEach((monsterObject) => {
        if (
          monsterObject.name == monster.creatureSpecies &&
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

  //TODO: (fix needed) adding in removed items
  function takeItem(item: Item) {
    if (playerCharacter && droppedItems) {
      playerCharacter.addToInventory(item);
      dispatch(setPlayerCharacter(playerCharacter));
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
    if (playerCharacter && droppedItems) {
      droppedItems.itemDrops.forEach((item) =>
        playerCharacter.addToInventory(item),
      );
      setDroppedItems(null);
      dispatch(setPlayerCharacter(playerCharacter));
    }
  }

  const enemyTurn = () => {
    if (monster) {
      const enemyAttackRes = monster.takeTurn(
        playerCharacter.getMaxHealth(),
        playerCharacter.getDamageReduction(),
      );
      if (
        enemyAttackRes.attack !== "miss" &&
        enemyAttackRes.attack !== "stun" &&
        enemyAttackRes.attack !== "pass"
      ) {
        const hp = playerCharacter.damageHealth(enemyAttackRes.attack.damage);
        const sanity = playerCharacter.damageSanity(
          enemyAttackRes.attack.sanityDamage,
        );
        enemyAttackRes.attack.debuffs?.forEach((debuff) =>
          playerCharacter.addCondition(debuff),
        );
        if (hp <= 0 || sanity <= 0) {
          router.back();
          router.replace("/DeathScreen");
        }
        let array = [];
        let line = `The ${toTitleCase(monster.creatureSpecies)} used ${
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
        battleLogger(`The ${toTitleCase(monster.creatureSpecies)} did nothing`);
      } else {
        battleLogger(
          `The ${toTitleCase(monster?.creatureSpecies)} ${
            enemyAttackRes.attack == "stun" ? "was " : ""
          }${enemyAttackRes.attack}ed`,
        );
      }
    }
  };

  const useAttack = (attack: {
    name: string;
    targets: string;
    hitChance: number;
    damageMult: number;
    sanityDamage: number;
    debuffs: { name: string; chance: number }[] | null;
  }) => {
    if (monster && playerCharacter && !loading) {
      setLoading(true);
      const startOfTurnMinions = [...playerCharacter.getMinions()];
      let monsterDefeated = false;
      const attackRes = playerCharacter.doPhysicalAttack(
        attack,
        monster.getMaxHealth(),
      );
      if (attackRes !== "miss") {
        let hp = monster.damageHealth(attackRes.damage);
        let sanity = monster.damageSanity(attackRes.sanityDamage);
        attackRes.debuffs?.forEach((effect) => monster.addCondition(effect));
        let line = `You ${attack.name == "cast" ? "used " : ""}${toTitleCase(
          attack.name,
        )}${
          attack.name !== "cast"
            ? attack.name.charAt(attack.name.length - 1) == "e"
              ? "d"
              : "ed"
            : " on"
        } the ${toTitleCase(monster.creatureSpecies)} for ${
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
        if (startOfTurnMinions.length > 0) {
          const res = playerMinionAttacks(
            monster.getMaxHealth(),
            startOfTurnMinions,
          );
          hp = monster.damageHealth(res.totalHPDamage);
          sanity = monster.damageSanity(res.totalSanityDamage);
          res.debuffs.forEach((debuff) => monster.addCondition(debuff));
        }
        if (hp <= 0 || (sanity && sanity <= 0)) {
          gameData.gameTick();
          if (thisDungeon?.level != 0) {
            thisDungeon?.incrementStep();
          }
          battleLogger(
            `You defeated the ${toTitleCase(monster.creatureSpecies)}`,
          );
          monsterDefeated = true;
          const drops = monster.getDrops(playerCharacter.playerClass);
          playerCharacter.addGold(drops.gold);
          setDroppedItems(drops);
          if (fightingBoss && gameData) {
            setFightingBoss(false);
            thisDungeon?.setBossDefeated();
            gameData.openNextDungeonLevel(thisInstance!.name);
            dispatch(setGameData(gameData));
          }
          dispatch(setMonster(null));
        } else {
          dispatch(setMonster(monster));
        }
      } else {
        battleLogger(
          `You ${attackRes}ed the ${toTitleCase(monster.creatureSpecies)}`,
        );
        dispatch(setMonster(monster));
      }
      if (!monsterDefeated) {
        enemyTurn();
      }
      if (playerCharacter) {
        dispatch(setPlayerCharacter(playerCharacter));
      }
      setLoading(false);
    }
  };

  function playerMinionAttacks(enemyMaxHP: number, providedMinions: Minion[]) {
    let totalHPDamage = 0;
    let totalSanityDamage = 0;
    let debuffs: Condition[] = [];
    if (playerCharacter && providedMinions.length > 0) {
      providedMinions.forEach((minion) => {
        if (minion.turnsLeftAlive <= 0) {
          playerCharacter.removeMinion(minion);
        } else {
          const res = minion.attack(enemyMaxHP);
          if (res == "miss") {
            battleLogger(
              `${playerCharacter.getName()}'s ${toTitleCase(
                minion.creatureSpecies,
              )} missed!`,
            );
          } else {
            let str = `${playerCharacter.getName()}'s ${toTitleCase(
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
        }
      });
    }
    return {
      totalHPDamage: totalHPDamage,
      totalSanityDamage: totalSanityDamage,
      debuffs: debuffs,
    };
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
    if (monster && playerCharacter && !loading) {
      setLoading(true);
      const startOfTurnMinions = [...playerCharacter.getMinions()];
      let monsterDefeated = false;
      const spellRes = playerCharacter.useSpell(spell, monster.getMaxHealth());
      let hp = monster.damageHealth(spellRes.damage);
      let sanity = monster.damageSanity(spellRes.sanityDamage);
      spellRes.debuffs?.forEach((debuff) => monster.addCondition(debuff));
      let line = `You ${toTitleCase(spell.name)}${
        spell.name.charAt(spell.name.length - 1) == "e" ? "d" : "ed"
      } the ${toTitleCase(monster.creatureSpecies)} for ${
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
      battleLogger(line);
      if (startOfTurnMinions.length > 0) {
        const res = playerMinionAttacks(
          monster.getMaxHealth(),
          startOfTurnMinions,
        );
        hp = monster.damageHealth(res.totalHPDamage);
        sanity = monster.damageSanity(res.totalSanityDamage);
        res.debuffs.forEach((debuff) => monster.addCondition(debuff));
      }
      if (hp <= 0 || (sanity && sanity <= 0)) {
        gameData.gameTick();
        if (thisDungeon?.level != 0) {
          thisDungeon?.incrementStep();
        }
        battleLogger(
          `You defeated the ${toTitleCase(monster.creatureSpecies)}`,
        );
        monsterDefeated = true;
        const drops = monster.getDrops(playerCharacter.playerClass);
        playerCharacter.addGold(drops.gold);
        setDroppedItems(drops);
        if (fightingBoss && gameData) {
          setFightingBoss(false);
          thisDungeon?.setBossDefeated();
          gameData.openNextDungeonLevel(thisInstance!.name);
          dispatch(setGameData(gameData));
        }
        dispatch(setMonster(null));
      } else {
        dispatch(setMonster(monster));
      }
      if (!monsterDefeated) {
        enemyTurn();
      }
      if (playerCharacter) {
        dispatch(setPlayerCharacter(playerCharacter));
      }
      setLoading(false);
    }
  };

  while (!monster) {
    return (
      <View>
        <Text>Loading enemy...</Text>
      </View>
    );
  }

  if (thisDungeon && playerCharacter) {
    return (
      <>
        <Stack.Screen
          options={{
            title:
              level == 0
                ? "Training Grounds"
                : `${toTitleCase(thisInstance?.name as string)} Level ${level}`,
          }}
        />
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
                {toTitleCase(monster.creatureSpecies)}
              </Text>
              <ProgressBar
                value={monster.getHealth()}
                maxValue={monster.getMaxHealth()}
                filledColor="#ef4444"
                unfilledColor="#fee2e2"
              />
            </View>
            <View className="">
              <MonsterImage monsterSpecies={monster.creatureSpecies} />
            </View>
          </View>
          {thisDungeon.stepsBeforeBoss !== 0 && !fightingBoss ? (
            <View className="-mt-7 flex flex-row justify-evenly border-b border-zinc-900 pb-1 dark:border-zinc-50">
              <Text className="my-auto text-xl">
                {`Steps Completed: ${thisDungeon.getStep()} / ${
                  thisDungeon.stepsBeforeBoss
                }`}
              </Text>
              {thisDungeon.getStep() >= thisDungeon.stepsBeforeBoss &&
              !thisDungeon.bossDefeatedCheck() ? (
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
              {playerCharacter.getMinions().length > 0
                ? playerCharacter.getMinions().map((minion) => (
                    <View key={minion.creatureID} className="py-1">
                      <Text>{toTitleCase(minion.creatureSpecies)}</Text>
                      <ProgressBar
                        filledColor="#ef4444"
                        unfilledColor="#fee2e2"
                        value={minion.getHealth()}
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
}
