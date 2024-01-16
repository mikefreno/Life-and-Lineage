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

type ImageInfo = {
  source: any;
  width: number;
  height: number;
  heightOffset?: number;
};

export const MonsterImageMap: Record<string, ImageInfo> = {
  bandit: {
    source: require("../assets/images/monsters/bandit.png"),
    width: 160,
    height: 160,
  },
  bat: {
    source: require("../assets/images/monsters/bat.png"),
    width: 120,
    height: 120,
    heightOffset: -60,
  },
  "giant rat": {
    source: require("../assets/images/monsters/giant_rat.png"),
    width: 180,
    height: 180,
  },
  goblin: {
    source: require("../assets/images/monsters/goblin.png"),
    width: 140,
    height: 140,
  },
  "goblin shaman": {
    source: require("../assets/images/monsters/goblin_shaman.png"),
    width: 140,
    height: 140,
  },
  ghost: {
    source: require("../assets/images/monsters/ghost.png"),
    width: 140,
    height: 140,
  },
  hobgoblin: {
    source: require("../assets/images/monsters/hobgoblin.png"),
    width: 150,
    height: 150,
  },
  necromancer: {
    source: require("../assets/images/monsters/necromancer.png"),
    width: 150,
    height: 150,
  },
  skeleton: {
    source: require("../assets/images/monsters/skeleton.png"),
    width: 160,
    height: 160,
  },
  "skeleton archer": {
    source: require("../assets/images/monsters/skeleton_archer.png"),
    width: 160,
    height: 160,
  },
  "giant spider": {
    source: require("../assets/images/monsters/giant_spider.png"),
    width: 160,
    height: 160,
  },
  "training dummy": {
    source: require("../assets/images/monsters/training_dummy.png"),
    width: 150,
    height: 150,
  },
  witch: {
    source: require("../assets/images/monsters/witch.png"),
    width: 150,
    height: 150,
  },
  zombie: {
    source: require("../assets/images/monsters/zombie.png"),
    width: 170,
    height: 170,
  },
};
