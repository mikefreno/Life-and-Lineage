import { View, Text } from "../../components/Themed";
import { useEffect, useState } from "react";
import { MonsterImage } from "../../components/MonsterImage";
import { Pressable } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import BattleTab from "../../components/BattleTab";
import { AttackObject } from "../../utility/types";
import { router } from "expo-router";
import { fullSave, toTitleCase } from "../../utility/functions";
import { enemyGenerator } from "../../utility/monster";
import { useDispatch, useSelector } from "react-redux";
import {
  selectGame,
  selectMonster,
  selectPlayerCharacter,
} from "../../redux/selectors";
import { setMonster } from "../../redux/slice/game";
import { AppDispatch } from "../../redux/store";
import { appendLogs } from "../../redux/slice/game";
import PlayerStatus from "../../components/PlayerStatus";
import ProgressBar from "../../components/ProgressBar";
import monsterObjects from "../../assets/json/monsters.json";

export default function DungeonLevelScreen() {
  const playerCharacter = useSelector(selectPlayerCharacter);
  const gameData = useSelector(selectGame);

  const monster = useSelector(selectMonster);

  const dispatch: AppDispatch = useDispatch();

  const { slug } = useLocalSearchParams();
  const instance = slug[0];
  const id = slug[1];
  let level: number;
  level = Number(id);
  const [battleTab, setBattleTab] = useState<
    "attacks" | "spells" | "equipment" | "log"
  >("log");

  if (!playerCharacter || !gameData) {
    throw new Error("No player character or game data on dungeon level");
  }

  const thisInstance = gameData.getInstance(instance);
  const thisDungeon = gameData.getDungeon(instance, level);

  useEffect(() => {
    if (!monster) {
      getEnemy();
    } else {
      appropriateEnemyCheck();
    }
  }, [monster]);

  function battleLogger(whatHappened: string) {
    const timeOfLog = new Date().toLocaleTimeString();
    const log = { logLine: `${timeOfLog}: ${whatHappened}` };
    dispatch(appendLogs(log));
  }

  function getEnemy() {
    const enemy = enemyGenerator(instance, level);

    battleLogger(`You Found a ${enemy.creatureSpecies}!`);
    dispatch(setMonster(enemy));
  }

  function appropriateEnemyCheck() {
    if (monster)
      monsterObjects.forEach((monsterObject) => {
        if (
          monsterObject.name == monster.creatureSpecies &&
          !(
            monsterObject.appearsOn.includes(level) &&
            monsterObject.appearsIn.includes(instance)
          )
        ) {
          getEnemy();
          return;
        }
      });
  }

  function useAttack(attack: AttackObject) {
    if (monster && playerCharacter) {
      let monsterDefeated = false;
      const attackRes = playerCharacter.doPhysicalAttack(
        attack,
        monster.getMaxHealth(),
      );
      if (attackRes !== "miss") {
        const hp = monster.damageHealth(attackRes.damage);
        const sanity = monster.damageSanity(attackRes.sanityDamage);
        attackRes.secondaryEffects?.forEach((effect) =>
          monster.addCondition(effect),
        );
        let line = `You ${attack.name}ed the ${monster.creatureSpecies} for ${attackRes.damage} heath damage`;
        if (attackRes.sanityDamage) {
          line += ` and ${attackRes.sanityDamage} sanity damage`;
        }
        if (attackRes.secondaryEffects) {
          attackRes.secondaryEffects.forEach(
            (effect) => (line += ` and applied a ${effect.name} stack`),
          );
        }
        battleLogger(line);
        if (hp <= 0 || (sanity && sanity <= 0)) {
          battleLogger(`You defeated the ${monster.creatureSpecies}`);
          monsterDefeated = true;
          if (thisDungeon?.level != 0) {
            thisDungeon?.incrementStep();
          }
          dispatch(setMonster(null));
        } else {
          dispatch(setMonster(monster));
        }
      } else {
        battleLogger(`You ${attackRes}ed the ${monster.creatureSpecies}`);
      }
      if (!monsterDefeated) {
        const enemyAttackRes = monster.takeTurn(playerCharacter.getMaxHealth());
        if (
          enemyAttackRes.attack !== "miss" &&
          enemyAttackRes.attack !== "stun" &&
          enemyAttackRes.attack !== "pass"
        ) {
          const hp = playerCharacter.damageHealth(enemyAttackRes.attack.damage);
          const sanity = playerCharacter.damageSanity(
            enemyAttackRes.attack.sanityDamage,
          );
          playerCharacter.addCondition(enemyAttackRes.attack.secondaryEffects);
          if (hp <= 0 || sanity <= 0) {
            router.back();
            router.replace("/DeathScreen");
          }
          let array = [];
          let line = `The ${monster.creatureSpecies} used ${enemyAttackRes.attack.name} dealing ${enemyAttackRes.attack.damage} health damage`;

          if (enemyAttackRes.attack.heal) {
            array.push(`healing for ${enemyAttackRes.attack.heal} health`);
          }

          if (enemyAttackRes.attack.sanityDamage > 0) {
            array.push(
              `dealing ${enemyAttackRes.attack.sanityDamage} sanity damage`,
            );
          }

          if (enemyAttackRes.attack.secondaryEffects) {
            array.push(
              `it applied a ${enemyAttackRes.attack.secondaryEffects.name} stack`,
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
          battleLogger(`The ${monster.creatureSpecies} did nothing`);
        } else {
          battleLogger(
            `The ${monster?.creatureSpecies} was ${enemyAttackRes.attack}ed`,
          );
        }
      }
    }
    fullSave(gameData, playerCharacter);
  }

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
            <View>
              <MonsterImage monsterSpecies={monster.creatureSpecies} />
            </View>
          </View>
          <View>
            {thisDungeon.stepsBeforeBoss !== 0 ? (
              <View className="-mt-7 mb-1 flex flex-row justify-evenly">
                <Text className="my-auto text-xl">
                  {`Steps Completed: ${thisDungeon.getStep()} / ${
                    thisDungeon.stepsBeforeBoss
                  }`}
                </Text>
                {thisDungeon.getStep() == thisDungeon.stepsBeforeBoss ? (
                  <Pressable className="rounded bg-red-400 px-4 py-2 active:scale-95 active:opacity-50">
                    <Text>Fight Boss</Text>
                  </Pressable>
                ) : null}
              </View>
            ) : null}
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
          <View className="h-1/2">
            <BattleTab useAttack={useAttack} battleTab={battleTab} />
          </View>
          <PlayerStatus />
        </View>
      </>
    );
  }
}
