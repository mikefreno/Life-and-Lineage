import { View, Text } from "../../components/Themed";
import enemies from "../../assets/monsters.json";
import { Monster } from "../../classes/creatures";
import { useContext, useEffect, useState } from "react";
import { GameContext, PlayerCharacterContext } from "../_layout";
import { MonsterImage } from "../../components/MonsterImage";
import { Pressable } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";

export default function DungeonLevel() {
  const playerContext = useContext(PlayerCharacterContext);
  const gameContext = useContext(GameContext);
  const { id } = useLocalSearchParams();
  let level: number;
  level = Number(id);

  const [currentEnemy, setCurrentEnemy] = useState<Monster | null>(null);

  if (!playerContext || !gameContext) {
    throw new Error(
      "DungeonLevel must be used within a PlayerCharacterContext, DungeonMonsterContext & GameContext provider",
    );
  }

  const { playerCharacter } = playerContext;
  const { gameData, setGameData } = gameContext;

  const dungeons = gameData?.getDungeon();
  const thisDungeon = dungeons?.find((dungeon) => dungeon.level == level);

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

  useEffect(() => {
    if (!currentEnemy) {
      enemyGenerator();
    }
  }, [currentEnemy]);

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

    setCurrentEnemy(enemy);
  }

  const punchHisAss = () => {
    if (currentEnemy) {
      const hp = currentEnemy.damageHealth(5);
      if (hp <= 0) {
        setCurrentEnemy(null);
      } else {
        //@ts-ignore
        setCurrentEnemy({ ...currentEnemy });
      }
    }
  };

  while (!currentEnemy) {
    return (
      <View>
        <Text>Loading enemy...</Text>
      </View>
    );
  }

  if (thisDungeon) {
    return (
      <>
        <Stack.Screen options={{ title: `Dungeon Level ${level}` }} />
        <View className="flex-1 justify-evenly px-4 py-6">
          <View className="flex flex-row justify-evenly">
            <View className="flex flex-col items-center justify-center">
              <Text className="text-3xl">{currentEnemy.creatureSpecies}</Text>
              <Text className="text-xl">
                {currentEnemy.health} / {currentEnemy.healthMax} health
              </Text>
            </View>
            <View>
              <MonsterImage monsterSpecies={currentEnemy.creatureSpecies} />
            </View>
          </View>
          <View>
            <Text className="text-center text-2xl">
              Current Level: {thisDungeon?.level}
            </Text>
            <View className="flex justify-center">
              <Pressable
                onPress={punchHisAss}
                disabled={!currentEnemy}
                className="mx-auto rounded bg-blue-400 px-4 py-2 active:scale-95 active:opacity-50"
              >
                <Text style={{ color: "white" }}>Punch Tester</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </>
    );
  }
}
