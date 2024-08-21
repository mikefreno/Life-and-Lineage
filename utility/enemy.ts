import enemies from "../assets/json/enemy.json";
import { Enemy } from "../classes/creatures";
import { type beingType } from "./types";

function pickRandomEnemyJSON(instance: string, level: number | string) {
  const enemiesInThisInstance = enemies.filter((enemy) =>
    enemy.appearsIn.includes(instance),
  );
  const enemiesOnThisLevel = enemiesInThisInstance.filter((enemy) =>
    enemy.appearsOn.includes(level),
  );
  const randomIndex = Math.floor(Math.random() * enemiesOnThisLevel.length);
  return enemiesOnThisLevel[randomIndex];
}

export function getNumberInRange(minimum: number, maximum: number) {
  return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
}

export function enemyGenerator(instance: string, level: string | number) {
  const enemyJSON = pickRandomEnemyJSON(instance, level);
  if (enemyJSON) {
    const enemyHealth = getNumberInRange(
      enemyJSON.healthRange.minimum,
      enemyJSON.healthRange.maximum,
    );

    const enemyAttackPower = getNumberInRange(
      enemyJSON.attackPowerRange.minimum,
      enemyJSON.attackPowerRange.maximum,
    );

    const enemy = new Enemy({
      beingType: enemyJSON.beingType as beingType,
      creatureSpecies: enemyJSON.name,
      health: enemyHealth,
      healthMax: enemyHealth,
      sanity: enemyJSON.sanity ?? null,
      sanityMax: enemyJSON.sanity ?? null,
      baseArmor: enemyJSON.armorValue ?? undefined,
      attackPower: enemyAttackPower,
      energy: enemyJSON.energy?.maximum,
      energyMax: enemyJSON.energy?.maximum,
      energyRegen: enemyJSON.energy?.regen,
      attacks: enemyJSON.attacks,
    });
    return enemy;
  }
}
export function specifiedEnemyGenerator(name: string) {
  const enemyJSON = enemies.find((enemy) => enemy.name == name);
  if (enemyJSON) {
    const enemyHealth = getNumberInRange(
      enemyJSON.healthRange.minimum,
      enemyJSON.healthRange.maximum,
    );

    const enemyAttackPower = getNumberInRange(
      enemyJSON.attackPowerRange.minimum,
      enemyJSON.attackPowerRange.maximum,
    );

    const enemy = new Enemy({
      beingType: enemyJSON.beingType as beingType,
      creatureSpecies: enemyJSON.name,
      health: enemyHealth,
      healthMax: enemyHealth,
      sanity: enemyJSON.sanity ?? null,
      sanityMax: enemyJSON.sanity ?? null,
      baseArmor: enemyJSON.armorValue ?? undefined,
      attackPower: enemyAttackPower,
      energy: enemyJSON.energy?.maximum,
      energyMax: enemyJSON.energy?.maximum,
      energyRegen: enemyJSON.energy?.regen,
      attacks: enemyJSON.attacks,
    });
    return enemy;
  }
}

type ImageInfo = {
  source: any;
  width: number;
  height: number;
  heightOffset?: number;
};

export const EnemyImageMap: Record<string, ImageInfo> = {
  "air mage": {
    source: require("../assets/images/monsters/air_mage.png"),
    width: 160,
    height: 160,
  },
  bandit: {
    source: require("../assets/images/monsters/bandit.png"),
    width: 160,
    height: 160,
  },
  "bandit boss": {
    source: require("../assets/images/monsters/bandit_boss.png"),
    width: 180,
    height: 180,
  },
  bat: {
    source: require("../assets/images/monsters/bat.png"),
    width: 120,
    height: 120,
    heightOffset: -60,
  },
  "brood mother": {
    source: require("../assets/images/monsters/brood_mother.png"),
    width: 180,
    height: 180,
  },
  drunkard: {
    source: require("../assets/images/monsters/drunkard.png"),
    width: 160,
    height: 160,
  },
  "earth mage": {
    source: require("../assets/images/monsters/earth_mage.png"),
    width: 160,
    height: 160,
  },
  "fire mage": {
    source: require("../assets/images/monsters/fire_mage.png"),
    width: 160,
    height: 160,
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
  griffon: {
    source: require("../assets/images/monsters/griffon.png"),
    width: 180,
    height: 180,
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
  "water mage": {
    source: require("../assets/images/monsters/water_mage.png"),
    width: 160,
    height: 160,
  },
  worg: {
    source: require("../assets/images/monsters/worg.png"),
    width: 160,
    height: 160,
  },
  witch: {
    source: require("../assets/images/monsters/witch.png"),
    width: 150,
    height: 150,
  },
  "generic npc male": {
    source: require("../assets/images/monsters/generic_npc_male.png"),
    width: 60,
    height: 160,
  },
  "generic npc femaleA": {
    source: require("../assets/images/monsters/generic_npc_femaleA.png"),
    width: 100,
    height: 160,
  },
  "generic npc femaleB": {
    source: require("../assets/images/monsters/generic_npc_femaleB.png"),
    width: 100,
    height: 160,
  },
  zombie: {
    source: require("../assets/images/monsters/zombie.png"),
    width: 170,
    height: 170,
  },
};
