import { View, Text } from "./Themed";
import enemies from "../assets/monsters.json";
import { Monster } from "../classes/creatures";
import { useContext, useEffect, useState } from "react";
import { PlayerCharacterContext } from "../app/_layout";

interface DungeonLevelInterface {
  level: number;
}

export default function DungeonLevel({ level }: DungeonLevelInterface) {
  const playerContext = useContext(PlayerCharacterContext);
  const [currentEnemy, setCurrentEnemy] = useState<Monster>();

  if (!playerContext) {
    throw new Error(
      "DungeonLevel must be used within a PlayerCharacterContext provider",
    );
  }

  const { playerCharacter } = playerContext;

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
    enemyGenerator();
  }, []);

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

    console.log("generating");

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

  function enemyBlock() {
    if (!currentEnemy) {
      return (
        <View>
          <Text style={{}}>Loading enemy...</Text>
        </View>
      );
    }

    return (
      <View className="flex flex-row">
        <View className="flex flex-col">
          <Text>{currentEnemy.creatureSpecies}</Text>
          <Text></Text>
          <Text></Text>
        </View>
      </View>
    );
  }

  function playerBlock() {
    return (
      <View>
        <View>
          <Text>Player view</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex justify-evenly px-4 py-6">
      {enemyBlock()}
      {playerBlock()}
    </View>
  );
}
