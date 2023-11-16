import enemies from "../assets/monsters.json";
import { Monster } from "../classes/creatures";

function pickRandomEnemyJSON(level: number) {
  const enemiesOnThisLevel = enemies.filter((enemy) =>
    enemy.appearsOn.includes(level),
  );
  const randomIndex = Math.floor(Math.random() * enemiesOnThisLevel.length);
  return enemiesOnThisLevel[randomIndex];
}

function getNumberInRange(minimum: number, maximum: number) {
  return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
}

export function enemyGenerator(level: number) {
  const enemyJSON = pickRandomEnemyJSON(level);
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
