import { View, Text } from "../../components/Themed";
import { useEffect, useState } from "react";
import { MonsterImage } from "../../components/MonsterImage";
import { Pressable } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import BattleTab from "../../components/BattleTab";
import { router } from "expo-router";
import { fullSave, toTitleCase } from "../../utility/functions";
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
import { debounce } from "lodash";

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
  const [showingLoot, setShowingLoot] = useState<boolean>(false);

  const monster = useSelector(selectMonster);

  const dispatch: AppDispatch = useDispatch();

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

  const useAttack = debounce(
    (attack: {
      name: string;
      targets: string;
      hitChance: number;
      damageMult: number;
      sanityDamage: number;
      debuffs: { name: string; chance: number }[] | null;
    }) => {
      if (monster && playerCharacter) {
        let monsterDefeated = false;
        const attackRes = playerCharacter.doPhysicalAttack(
          attack,
          monster.getMaxHealth(),
        );
        if (attackRes !== "miss") {
          const hp = monster.damageHealth(attackRes.damage);
          const sanity = monster.damageSanity(attackRes.sanityDamage);
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
            setShowingLoot(true);
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
      }
      if (playerCharacter) {
        dispatch(setPlayerCharacter(playerCharacter));
      }
      fullSave(gameData, playerCharacter);
    },
    100,
  );

  const useSpell = debounce(
    (spell: {
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
      if (monster && playerCharacter) {
        let monsterDefeated = false;
        const spellRes = playerCharacter.useSpell(
          spell,
          monster.getMaxHealth(),
        );
        const hp = monster.damageHealth(spellRes.damage);
        const sanity = monster.damageSanity(spellRes.sanityDamage);
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
          if (fightingBoss && gameData) {
            setFightingBoss(false);
            thisDungeon?.setBossDefeated();
            gameData.openNextDungeonLevel(thisInstance!.name);
            dispatch(setGameData(gameData));
          }
          setShowingLoot(true);
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
        fullSave(gameData, playerCharacter);
      }
    },
    100,
  );

  function lootDrop() {}

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
        {LootDrop()}
        <View className="flex-1 px-4 py-6">
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
            <View className="my-auto">
              <MonsterImage monsterSpecies={monster.creatureSpecies} />
            </View>
          </View>
          {thisDungeon.stepsBeforeBoss !== 0 && !fightingBoss ? (
            <View className="-mt-7 flex flex-row justify-evenly border-b border-zinc-900 dark:border-zinc-50">
              <Text className="my-auto text-xl">
                {`Steps Completed: ${thisDungeon.getStep()} / ${
                  thisDungeon.stepsBeforeBoss
                }`}
              </Text>
              {thisDungeon.getStep() >= thisDungeon.stepsBeforeBoss &&
              !thisDungeon.bossDefeatedCheck() ? (
                <Pressable
                  onPress={loadBoss}
                  className="rounded bg-red-500 px-4 py-2 active:scale-95 active:opacity-50"
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
          <View className="h-1/2">
            <BattleTab
              useAttack={useAttack}
              battleTab={battleTab}
              useSpell={useSpell}
            />
          </View>
          <View>
            <View className="flex w-full flex-row justify-evenly border-y border-zinc-200">
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
          <PlayerStatus />
        </View>
      </>
    );
  }
}
