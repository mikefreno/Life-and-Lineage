import enemies from "../assets/json/monsters.json";
import { Monster } from "../classes/creatures";

function pickRandomEnemyJSON(instance: string, level: number) {
  const enemiesInThisInstance = enemies.filter((enemy) =>
    enemy.appearsIn.includes(instance),
  );
  const enemiesOnThisLevel = enemiesInThisInstance.filter((enemy) =>
    enemy.appearsOn.includes(level),
  );
  const randomIndex = Math.floor(Math.random() * enemiesOnThisLevel.length);
  return enemiesOnThisLevel[randomIndex];
}

function getNumberInRange(minimum: number, maximum: number) {
  return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
}

export function enemyGenerator(instance: string, level: number) {
  const enemyJSON = pickRandomEnemyJSON(instance, level);
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
    healthMax: enemyHealth,
    sanity: enemyJSON.sanity ?? null,
    sanityMax: enemyJSON.sanity ?? null,
    attackPower: enemyAttackPower,
    energy: enemyJSON.energy?.maximum,
    energyMax: enemyJSON.energy?.maximum,
    energyRegen: enemyJSON.energy?.regen,
    attacks: enemyJSON.attacks,
  });
  return enemy;
}

const nameToImageMap: Record<string, any> = {
  bandit: require("../assets/images/monsters/bandit.png"),
  bat: require("../assets/images/monsters/bat.png"),
  "giant rat": require("../assets/images/monsters/giant_rat.png"),
  goblin: require("../assets/images/monsters/goblin.png"),
  ghost: require("../assets/images/monsters/ghost.png"),
  necromancer: require("../assets/images/monsters/necromancer.png"),
  skeleton: require("../assets/images/monsters/skeleton.png"),
  "training dummy": require("../assets/images/monsters/training_dummy.png"),
  witch: require("../assets/images/monsters/witch.png"),
};

export function getMonsterImage(monsterName: string) {
  return nameToImageMap[monsterName]
    ? nameToImageMap[monsterName]
    : require("../assets/images/monsters/training_dummy.png");
}
