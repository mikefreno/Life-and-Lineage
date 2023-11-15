import { View, Text } from "../../components/Themed";
import enemies from "../../assets/monsters.json";
import { Monster } from "../../classes/creatures";
import { useContext, useEffect, useState } from "react";
import {
  BattleLogContext,
  DungeonMonsterContext,
  GameContext,
  PlayerCharacterContext,
} from "../_layout";
import { MonsterImage } from "../../components/MonsterImage";
import { Pressable } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import BattleTab from "../../components/BattleTab";
import { AttackObject } from "../../utility/types";
import { router } from "expo-router";
import { storeData } from "../../store";

export default function DungeonLevelScreen() {
  const playerContext = useContext(PlayerCharacterContext);
  const gameContext = useContext(GameContext);
  const monsterContext = useContext(DungeonMonsterContext);
  const battleLogContext = useContext(BattleLogContext);
  const { slug } = useLocalSearchParams();
  const id = slug[0];
  const instance = slug[1];
  let level: number;
  level = Number(id);
  const [battleTab, setBattleTab] = useState<
    "attacks" | "spells" | "equipment" | "log"
  >("log");

  if (!playerContext || !gameContext || !monsterContext || !battleLogContext) {
    throw new Error(
      "DungeonLevel must be used within a PlayerCharacterContext, DungeonMonsterContext, BattleLogContext & GameContext provider",
    );
  }

  const { setLogs } = battleLogContext;
  const { playerCharacter } = playerContext;
  const { gameData } = gameContext;
  const { monster, setMonster } = monsterContext;

  const thisInstance = gameData?.getInstance(instance);
  const thisDungeon = gameData?.getDungeon(instance, level);

  useEffect(() => {
    if (!monster) {
      enemyGenerator();
    }
  }, [monster]);

  function battleLogger(whatHappened: string) {
    const timeOfLog = new Date().toLocaleTimeString();
    const log = { logLine: `${timeOfLog}: ${whatHappened}` };
    setLogs((prevLogs) => {
      return [...prevLogs, log];
    });
  }

  function pickRandomEnemyJSON() {
    const enemiesOnThisLevel = enemies.filter((enemy) =>
      enemy.appearsOn.includes(level),
    );
    const randomIndex = Math.floor(Math.random() * enemiesOnThisLevel.length);
    return enemiesOnThisLevel[randomIndex];
  }

  function getNumberInRange(minimum: number, maximum: number) {
    return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
  }

  function enemyGenerator() {
    const enemyJSON = pickRandomEnemyJSON();
    const enemyHealth = getNumberInRange(
      enemyJSON.healthRange.minimum,
      enemyJSON.healthRange.maximum,
    );
    const enemyAttackPower = getNumberInRange(
      enemyJSON.attackPowerRange.minimum,
      enemyJSON.attackPowerRange.maximum,
    );

    const enemy = new Monster({
      creatureSpecies: enemyJSON.name,
      health: enemyHealth,
      sanity: enemyJSON.sanity ?? null,
      attackPower: enemyAttackPower,
      energy: enemyJSON.energy?.maximum,
      energyRegen: enemyJSON.energy?.regen,
      attacks: enemyJSON.attacks,
    });
    battleLogger(`You Found a ${enemy.creatureSpecies}!`);
    setMonster(enemy);
  }

  function useAttack(attack: AttackObject) {
    if (monster && playerCharacter) {
      let monsterDefeated = false;
      const attackRes = playerCharacter.doPhysicalAttack(
        attack,
        monster.healthMax,
      );
      if (attackRes !== "miss") {
        const hp = monster.damageHealth(attackRes.damage);
        const sanity = monster.damageSanity(attackRes.sanityDamage);
        monster.addCondition(attackRes.secondaryEffects);

        let line = `You ${attack.name}ed the ${monster.creatureSpecies} for ${attackRes.damage} heath damage`;
        if (attackRes.sanityDamage) {
          line += ` and ${attackRes.sanityDamage} sanity damage`;
        }
        if (attackRes.secondaryEffects) {
          line += ` and applied a ${attackRes.secondaryEffects.name} stack`;
        }
        battleLogger(line);
        if (hp <= 0 || (sanity && sanity <= 0)) {
          battleLogger(`You defeated the ${monster.creatureSpecies}`);
          monsterDefeated = true;
          thisDungeon?.incrementStep();
          setMonster(null);
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
        } else {
          battleLogger(
            `The ${monster?.creatureSpecies} was ${enemyAttackRes.attack}ed`,
          );
        }
      }
    }

    storeData("game", gameData);
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
        <Stack.Screen options={{ title: `Dungeon Level ${level}` }} />
        <View className="flex-1 px-4 py-6">
          <View className="flex h-1/3 flex-row justify-evenly">
            <View className="flex flex-col items-center justify-center">
              <Text className="text-3xl">{monster.creatureSpecies}</Text>
              <Text className="text-xl" style={{ color: "#ef4444" }}>
                {monster.health} / {monster.healthMax} health
              </Text>
            </View>
            <View>
              <MonsterImage monsterSpecies={monster.creatureSpecies} />
            </View>
          </View>
          <View>
            <Text className="text-center text-xl">
              {`Steps Completed: ${thisDungeon.getStep()} / ${
                thisDungeon.stepsBeforeBoss
              }`}
            </Text>
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
          <View className="flex flex-row justify-evenly">
            <Text
              className="text-xl"
              style={{ color: "#ef4444" }}
            >{`${playerCharacter.getHealth()} / ${playerCharacter.getMaxHealth()} Health`}</Text>
            <Text
              className="text-xl"
              style={{ color: "#60a5fa" }}
            >{`${playerCharacter.getMana()} / ${playerCharacter.getMaxMana()} Mana`}</Text>
            <Text
              className="text-xl"
              style={{ color: "#c084fc" }}
            >{`${playerCharacter.getSanity()} Sanity`}</Text>
          </View>
        </View>
      </>
    );
  }
}
