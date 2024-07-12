import { PlayerCharacter } from "../../classes/character";
import { Enemy, Minion } from "../../classes/creatures";
import { DungeonInstance, DungeonLevel } from "../../classes/dungeon";
import { Game } from "../../classes/game";
import { Item } from "../../classes/item";
import { getMagnitude } from "./conditions";
import { toTitleCase } from "./misc/words";

export interface enemyTurnCheckProps {
  enemyState: Enemy | null;
  slug: string | string[];
  playerState: PlayerCharacter;
  fightingBoss: boolean;
  setDroppedItems: (
    value: React.SetStateAction<{
      itemDrops: Item[];
      gold: number;
    } | null>,
  ) => void;
  setEnemy: (value: React.SetStateAction<Enemy | null>) => void;
  gameState: Game;
  battleLogger: (whatHappened: string) => void;
  setFightingBoss: (value: React.SetStateAction<boolean>) => void;
  setAttackAnimationOnGoing: (value: React.SetStateAction<boolean>) => void;
  thisDungeon: DungeonLevel | undefined;
  thisInstance: DungeonInstance | undefined;
  setEnemyAttacked: (value: React.SetStateAction<boolean>) => void;
  setEnemyHealDummy: React.Dispatch<React.SetStateAction<number>>;
  setEnemyAttackDummy: React.Dispatch<React.SetStateAction<number>>;
  setEnemyTextDummy: React.Dispatch<React.SetStateAction<number>>;
  setEnemyTextString: React.Dispatch<React.SetStateAction<string | undefined>>;
  toggleFirstBossKillTutorial: () => void;
}

export function enemyTurnCheck({
  enemyState,
  slug,
  playerState,
  fightingBoss,
  setDroppedItems,
  setEnemy,
  gameState,
  battleLogger,
  setFightingBoss,
  setAttackAnimationOnGoing,
  thisDungeon,
  thisInstance,
  setEnemyAttacked,
  setEnemyHealDummy,
  setEnemyTextDummy,
  setEnemyTextString,
  setEnemyAttackDummy,
  toggleFirstBossKillTutorial,
}: enemyTurnCheckProps) {
  if (enemyState) {
    if (
      enemyState.health <= 0 ||
      (enemyState.sanity && enemyState.sanity <= 0)
    ) {
      if (slug[0] == "Activities") {
        const drops = enemyState.getDrops(
          playerState.playerClass,
          fightingBoss,
        );
        playerState.addGold(drops.gold);
        setDroppedItems(drops);
        setEnemy(null);
        gameState.gameTick(playerState);
      } else if (slug[0] == "Personal") {
        const drops = enemyState.getDrops(
          playerState.playerClass,
          fightingBoss,
        );
        playerState.addGold(drops.gold);
        setDroppedItems(drops);
        setEnemy(null);
        gameState.gameTick(playerState);
      } else {
        battleLogger(
          `You defeated the ${toTitleCase(enemyState.creatureSpecies)}`,
        );
        const drops = enemyState.getDrops(
          playerState.playerClass,
          fightingBoss,
        );
        playerState.addGold(drops.gold);
        setDroppedItems(drops);
        if (fightingBoss && gameState && thisDungeon) {
          setFightingBoss(false);
          thisDungeon.setBossDefeated();
          gameState.openNextDungeonLevel(thisInstance!.name);
          playerState.bossDefeated();
          if (!gameState.tutorialsShown["First Boss Kill"]) {
            toggleFirstBossKillTutorial();
          }
        }
        setEnemy(null);
        gameState.gameTick(playerState);
      }
    } else {
      enemyTurn(
        enemyState,
        slug,
        playerState,
        fightingBoss,
        setDroppedItems,
        setEnemy,
        gameState,
        battleLogger,
        setFightingBoss,
        thisDungeon,
        thisInstance,
        setEnemyAttacked,
        setEnemyHealDummy,
        setEnemyAttackDummy,
        setEnemyTextDummy,
        setEnemyTextString,
      );
      setTimeout(() => setAttackAnimationOnGoing(false), 1000);
    }
  }
}

export const enemyTurn = (
  enemyState: Enemy | null,
  slug: string | string[],
  playerState: PlayerCharacter,
  fightingBoss: boolean,
  setDroppedItems: (
    value: React.SetStateAction<{
      itemDrops: Item[];
      gold: number;
    } | null>,
  ) => void,
  setEnemy: (value: React.SetStateAction<Enemy | null>) => void,
  gameState: Game,
  battleLogger: (whatHappened: string) => void,
  setFightingBoss: (value: React.SetStateAction<boolean>) => void,
  thisDungeon: DungeonLevel | undefined,
  thisInstance: DungeonInstance | undefined,
  setEnemyAttacked: (value: React.SetStateAction<boolean>) => void,
  setEnemyHealDummy: React.Dispatch<React.SetStateAction<number>>,
  setEnemyAttackDummy: React.Dispatch<React.SetStateAction<number>>,
  setEnemyTextDummy: React.Dispatch<React.SetStateAction<number>>,
  setEnemyTextString: React.Dispatch<React.SetStateAction<string | undefined>>,
) => {
  if (enemyState) {
    setEnemyAttacked(true);
    const enemyAttackRes = enemyState.takeTurn({
      defenderMaxHealth: playerState.getNonBuffedMaxHealth(),
      defenderMaxSanity: playerState.getNonBuffedMaxSanity(),
      defenderDR: playerState.getDamageReduction(),
      defenderConditions: playerState.conditions,
    });
    if (
      enemyAttackRes !== "miss" &&
      enemyAttackRes !== "stun" &&
      enemyAttackRes !== "pass"
    ) {
      playerState.damageHealth(enemyAttackRes.damage);
      playerState.damageSanity(enemyAttackRes.sanityDamage);
      if (enemyAttackRes.debuffs) {
        enemyAttackRes.debuffs.forEach((debuff) =>
          playerState.addCondition(debuff),
        );
      }
      let array = [];
      let line = `The ${toTitleCase(
        enemyState.creatureSpecies,
      )} used ${toTitleCase(enemyAttackRes.name)}${
        enemyAttackRes.damage
          ? ` dealing ${enemyAttackRes.damage} health damage`
          : ""
      }`;

      if (enemyAttackRes.heal) {
        array.push(`healing for ${enemyAttackRes.heal} health`);
        setTimeout(() => {
          setEnemyHealDummy((prev) => prev + 1);
        }, 250);
      }

      if (enemyAttackRes.sanityDamage && enemyAttackRes.sanityDamage > 0) {
        array.push(`dealing ${enemyAttackRes.sanityDamage} sanity damage`);
      }

      if (enemyAttackRes.debuffs) {
        enemyAttackRes.debuffs.forEach((debuff) =>
          array.push(`it applied a ${debuff.name} stack`),
        );
      }
      if (enemyAttackRes.summons) {
        const counts: { summon: string; count: number }[] = [];
        enemyAttackRes.summons.forEach((summon) => {
          const preExisting = counts.find((obj) => obj.summon == summon);
          if (preExisting) {
            preExisting.count += 1;
          } else {
            counts.push({ summon: summon, count: 1 });
          }
        });
      }
      if (array.length) {
        line +=
          ", " +
          array.slice(0, -1).join(", ") +
          (array.length > 1 ? ", and " : " and ") +
          array.slice(-1);
      }
      battleLogger(line);
      if (enemyAttackRes.damage > 0) {
        const revengeCondition = playerState.conditions.find((condition) =>
          condition.effect.includes("revenge"),
        );
        if (revengeCondition) {
          const effectMagnitudeValue = getMagnitude(
            revengeCondition.effectMagnitude,
          );
          const revengeDamage =
            enemyAttackRes.damage * 5 > effectMagnitudeValue * 10
              ? effectMagnitudeValue * 10
              : enemyAttackRes.damage * 5;
          enemyState.damageHealth(revengeDamage);
          battleLogger(`You dealt ${revengeDamage} revenge damage!`);
        }
      }
      if (
        enemyAttackRes.damage > 0 ||
        (enemyAttackRes.sanityDamage && enemyAttackRes.sanityDamage > 0)
      ) {
        setEnemyAttackDummy((prev) => prev + 1);
      }
      if (enemyAttackRes.debuffs || enemyAttackRes.buffs) {
        setEnemyTextString(enemyAttackRes.name);
        setEnemyTextDummy((prev) => prev + 1);
      }
    } else if (enemyAttackRes == "pass") {
      battleLogger(
        `The ${toTitleCase(enemyState.creatureSpecies)} did nothing`,
      );
      setEnemyTextString(enemyAttackRes);
      setEnemyTextDummy((prev) => prev + 1);
    } else {
      battleLogger(
        `The ${toTitleCase(enemyState.creatureSpecies)} ${
          enemyAttackRes == "stun" ? "was " : ""
        }${enemyAttackRes}ed`,
      );
      if (enemyAttackRes == "miss") {
        setEnemyAttackDummy((prev) => prev + 1);
      }
      setTimeout(
        () => {
          setEnemyTextString(enemyAttackRes as "miss" | "stun");
          setEnemyTextDummy((prev) => prev + 1);
        },
        enemyAttackRes == "miss" ? 500 : 0,
      );
    }
    if (enemyState.minions.length > 0) {
      enemyMinionsTurn(
        enemyState.minions,
        enemyState,
        playerState,
        battleLogger,
      );
    }
    setTimeout(() => {
      if (
        enemyState.health <= 0 ||
        (enemyState.sanity && enemyState.sanity <= 0)
      ) {
        if (slug[0] == "Activities") {
          const drops = enemyState.getDrops(
            playerState.playerClass,
            fightingBoss,
          );
          playerState.addGold(drops.gold);
          setDroppedItems(drops);
          setEnemy(null);
          gameState.gameTick(playerState);
        } else {
          if (thisDungeon?.level != 0) {
            thisDungeon?.incrementStep();
          }
          battleLogger(
            `You defeated the ${toTitleCase(enemyState.creatureSpecies)}`,
          );
          const drops = enemyState.getDrops(
            playerState.playerClass,
            fightingBoss,
          );
          playerState.addGold(drops.gold);
          setDroppedItems(drops);
          if (fightingBoss && gameState && thisDungeon) {
            setFightingBoss(false);
            playerState.bossDefeated();
            thisDungeon.setBossDefeated();
            gameState.openNextDungeonLevel(thisInstance!.name);
          }
          setEnemy(null);
          gameState.gameTick(playerState);
        }
      }
    }, 1000);
  }
};

function enemyMinionsTurn(
  suppliedMinions: Minion[],
  enemyState: Enemy | null,
  playerState: PlayerCharacter,
  battleLogger: (whatHappened: string) => void,
) {
  if (enemyState && playerState) {
    for (let i = 0; i < suppliedMinions.length; i++) {
      setTimeout(() => {
        const res = suppliedMinions[i].takeTurn({
          defenderMaxHealth: playerState.getNonBuffedMaxHealth(),
          defenderMaxSanity: playerState.getNonBuffedMaxSanity(),
          defenderDR: playerState.getDamageReduction(),
          defenderConditions: playerState.conditions,
        });
        if (res == "miss") {
          battleLogger(
            `${toTitleCase(enemyState.creatureSpecies)}'s ${toTitleCase(
              suppliedMinions[i].creatureSpecies,
            )} missed!`,
          );
        } else if (res == "stun") {
          battleLogger(
            `${toTitleCase(enemyState.creatureSpecies)}'s ${toTitleCase(
              suppliedMinions[i].creatureSpecies,
            )} was stunned!`,
          );
        } else if (res == "pass") {
          battleLogger(
            `${toTitleCase(enemyState.creatureSpecies)}'s ${toTitleCase(
              suppliedMinions[i].creatureSpecies,
            )} passed!`,
          );
        } else {
          let str = `${toTitleCase(enemyState.creatureSpecies)}'s ${toTitleCase(
            suppliedMinions[i].creatureSpecies,
          )} used ${toTitleCase(res.name)} dealing ${res.damage} damage`;
          playerState.damageHealth(res.damage);
          if (res.heal && res.heal > 0) {
            str += ` and healed for ${res.heal} damage`;
          }
          if (res.sanityDamage && res.sanityDamage > 0) {
            str += ` and ${res.sanityDamage} sanity damage`;
            playerState.damageSanity(res.sanityDamage);
          }
          if (res.debuffs) {
            res.debuffs.forEach((effect) => {
              str += ` and applied a ${effect.name} stack`;
              playerState.addCondition(effect);
            });
          }
          battleLogger(str);
        }
        if (suppliedMinions[i].turnsLeftAlive <= 0) {
          enemyState.removeMinion(suppliedMinions[i]);
        }
      }, 1000 * i);
    }
  }
}
