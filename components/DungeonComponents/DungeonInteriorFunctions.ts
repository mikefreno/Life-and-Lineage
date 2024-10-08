import type { PlayerCharacter } from "../../classes/character";
import { Enemy, type Minion } from "../../classes/creatures";
import { enemyGenerator } from "../../utility/enemy";
import { getMagnitude } from "../../utility/functions/conditions";
import { toTitleCase, wait } from "../../utility/functions/misc";
import { dungeonSave } from "../../utility/functions/save_load";
import {
  AttackUse,
  type AppContextType,
  type DungeonContextType,
  TutorialOption,
} from "../../utility/types";
import { Item } from "../../classes/item";
import { Spell } from "../../classes/spell";
import { Attack } from "../../classes/attack";

interface AddItemToPouch {
  items: Item[];
  dungeonData: DungeonContextType | undefined;
}
export function addItemToPouch({ items, dungeonData }: AddItemToPouch) {
  if (!dungeonData) throw new Error("missing context in addItemToPouch()");
  const { setLeftBehindDrops } = dungeonData;
  setLeftBehindDrops((prev) => [...prev, ...items]);
}

export interface ContextData {
  dungeonData: DungeonContextType | undefined;
  appData: AppContextType | undefined;
}

export function enemyTurnCheck({ dungeonData, appData }: ContextData) {
  if (!appData || !dungeonData)
    throw new Error("missing context in enemyTurnCheck()");
  const { enemyState, playerState, setEnemy, gameState } = appData;
  const {
    slug,
    fightingBoss,
    setDroppedItems,
    thisDungeon,
    thisInstance,
    setFightingBoss,
    setAttackAnimationOnGoing,
    battleLogger,
    setShouldShowFirstBossKillTutorialAfterItemDrops,
  } = dungeonData;
  if (enemyState && playerState && gameState) {
    if (
      enemyState.health <= 0 ||
      (enemyState.sanity && enemyState.sanity <= 0)
    ) {
      if (slug[0] == "Activities") {
        const drops = enemyState.getDrops(
          playerState.playerClass,
          fightingBoss,
        );
        if (drops != "already retrieved") {
          playerState.addGold(drops.gold);
          setDroppedItems(drops);
        }
        setEnemy(null);
        gameState.gameTick();
      } else if (slug[0] == "Personal") {
        const drops = enemyState.getDrops(
          playerState.playerClass,
          fightingBoss,
        );

        if (drops != "already retrieved") {
          playerState.addGold(drops.gold);
          setDroppedItems(drops);
          gameState.gameTick();
        }
        setEnemy(null);
      } else {
        battleLogger(
          `You defeated the ${toTitleCase(enemyState.creatureSpecies)}`,
        );

        const drops = enemyState.getDrops(
          playerState.playerClass,
          fightingBoss,
        );
        if (drops != "already retrieved") {
          playerState.addGold(drops.gold);
          setDroppedItems(drops);
          if (fightingBoss && gameState && thisDungeon) {
            setFightingBoss(false);
            thisDungeon.setBossDefeated();
            gameState.openNextDungeonLevel(thisInstance!.name);
            playerState.bossDefeated();
            if (!gameState.tutorialsShown[TutorialOption.firstBossKill]) {
              setShouldShowFirstBossKillTutorialAfterItemDrops(true);
            }
          }
          gameState.gameTick();
        }

        setEnemy(null);
      }
    } else {
      enemyTurn({ appData, dungeonData });
      setTimeout(() => setAttackAnimationOnGoing(false), 1000);
    }
  }
}

export const enemyTurn = ({ appData, dungeonData }: ContextData) => {
  if (!appData || !dungeonData)
    throw new Error("missing context in enemyTurnCheck()");
  const { enemyState, playerState, setEnemy, gameState } = appData;
  const {
    slug,
    fightingBoss,
    setDroppedItems,
    thisDungeon,
    thisInstance,
    setFightingBoss,
    setEnemyAttacked,
    setEnemyHealDummy,
    setEnemyAttackDummy,
    setEnemyTextString,
    setEnemyTextDummy,
    battleLogger,
    setAttackAnimationOnGoing,
  } = dungeonData;
  if (enemyState && playerState && gameState) {
    setEnemyAttacked(true);
    const startOfTurnPlayerState = { ...playerState };
    const startOfTurnEnemyState = { ...enemyState };
    const enemyAttackRes = enemyState.takeTurn({ player: playerState }); // this should be updated to allow the enemy to target player minions
    battleLogger(enemyAttackRes.logString);
    let action: () => void;
    switch (enemyAttackRes.result) {
      case AttackUse.success:
        const playerHealthChange =
          startOfTurnPlayerState.currentHealth - playerState.currentHealth;
        const enemyHealthChange =
          startOfTurnEnemyState.health - enemyState.health;
        const playerSanityChange =
          startOfTurnPlayerState.currentSanity - playerState.currentSanity;
        if (playerHealthChange > 0) {
          const revengeCondition = playerState.conditions.find((condition) =>
            condition.effect.includes("revenge"),
          );
          if (revengeCondition) {
            const effectMagnitudeValue = getMagnitude(
              revengeCondition.effectMagnitude,
            );
            const revengeDamage =
              playerHealthChange * 5 > effectMagnitudeValue * 10
                ? effectMagnitudeValue * 10
                : playerHealthChange * 5;
            enemyState.damageHealth({
              attackerId: revengeCondition.placedbyID,
              damage: revengeDamage,
            });
            battleLogger(`You dealt ${revengeDamage} revenge damage!`);
          }
        }
        action = () => {
          if (playerHealthChange > 0 || playerSanityChange > 0) {
            setEnemyAttackDummy((prev) => prev + 1);
          }
          wait(500).then(() => {
            if (enemyHealthChange < 0) {
              setEnemyHealDummy((prev) => prev + 1);
            }
            if (
              enemyAttackRes.chosenAttack.debuffs.length > 0 ||
              enemyAttackRes.chosenAttack.debuffs.length > 0
            ) {
              setEnemyTextString(enemyAttackRes.chosenAttack.name);
              setEnemyTextDummy((prev) => prev + 1);
            }
          });
        };
        break;
      case AttackUse.miss:
        action = () => {
          setEnemyAttackDummy((prev) => prev + 1);
          wait(500).then(() => {
            setEnemyTextString("miss");
            setEnemyTextDummy((prev) => prev + 1);
          });
        };
        break;
      case AttackUse.block:
        action = () => {
          setEnemyTextString("blocked");
          setEnemyTextDummy((prev) => prev + 1);
        };
        break;
      case AttackUse.stunned:
        action = () => {
          setEnemyTextString("stunned");
          setEnemyTextDummy((prev) => prev + 1);
        };
        break;
      case AttackUse.lowEnergy:
        action = () => {
          setEnemyTextString("pass");
          setEnemyTextDummy((prev) => prev + 1);
        };
        break;
    }
    action();
    playerState.conditionResolver();
    enemyMinionsTurn(enemyState.minions, enemyState, playerState, battleLogger);
    playerState.conditionResolver();
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
          if (drops != "already retrieved") {
            playerState.addGold(drops.gold);
            setDroppedItems(drops);

            gameState.gameTick();
          }
          setEnemy(null);
        } else {
          battleLogger(
            `You defeated the ${toTitleCase(enemyState.creatureSpecies)}`,
          );
          const drops = enemyState.getDrops(
            playerState.playerClass,
            fightingBoss,
          );

          if (drops != "already retrieved") {
            playerState.addGold(drops.gold);
            setDroppedItems(drops);
            gameState.gameTick();
            if (fightingBoss && gameState && thisDungeon) {
              setFightingBoss(false);
              playerState.bossDefeated();
              thisDungeon.setBossDefeated();
              gameState.openNextDungeonLevel(thisInstance!.name);
            }
          }

          setEnemy(null);
        }
      }
      setAttackAnimationOnGoing(false);
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
      wait(1000).then(() => {
        const res = suppliedMinions[i].takeTurn({ target: playerState });
        battleLogger("(minion) " + res.logString);
      });
    }
  }
}

export function getEnemy({ appData, dungeonData }: ContextData) {
  if (!appData || !dungeonData)
    throw new Error("missing context in getEnemy()");
  const { setEnemy } = appData;
  const {
    level,
    instanceName,
    setEnemyAttacked,
    battleLogger,
    setAttackAnimationOnGoing,
  } = dungeonData;
  const enemy = enemyGenerator(instanceName, level);
  if (enemy) {
    setEnemy(enemy);
    setEnemyAttacked(false);
    battleLogger(`You found a ${toTitleCase(enemy.creatureSpecies)}!`);
    setAttackAnimationOnGoing(false);
    dungeonSave({ enemy, dungeonData, appData });
  }
}

export const loadBoss = ({ appData, dungeonData }: ContextData) => {
  if (!appData || !dungeonData)
    throw new Error("missing context in loadBoss()");
  const {
    setFightingBoss,
    setAttackAnimationOnGoing,
    thisDungeon,
    thisInstance,
    battleLogger,
  } = dungeonData;
  const { playerState, setEnemy } = appData;
  setFightingBoss(true);
  setAttackAnimationOnGoing(false);
  if (thisDungeon && thisInstance && playerState) {
    const boss = thisDungeon.getBoss(thisInstance.name);
    setEnemy(boss);
    battleLogger(`You found the boss!`);
  }
};

export interface use {
  attackOrSpell: Attack | Spell;
  target: Enemy | Minion;
  dungeonData: DungeonContextType | undefined;
  appData: AppContextType | undefined;
  isFocused: boolean;
}
export const use = ({
  attackOrSpell,
  target,
  dungeonData,
  appData,
  isFocused,
}: use) => {
  if (!appData || !dungeonData) throw new Error("missing context in pass()");
  const { battleLogger, setEnemyDodgeDummy } = dungeonData;
  const { playerState, enemyState } = appData;

  if (enemyState && playerState && isFocused) {
    if (attackOrSpell instanceof Attack) {
      const { result, logString } = attackOrSpell.use({
        target,
        user: playerState,
      });
      if (result == AttackUse.miss) {
        setEnemyDodgeDummy((prev) => prev + 1);
      }
      battleLogger(logString);
    } else {
      const { logString } = attackOrSpell.use({ target, user: playerState });
      battleLogger(logString);
    }

    setTimeout(() => {
      playerMinionsTurn({ dungeonData, appData }, () => {
        setTimeout(() => {
          enemyTurnCheck({
            appData,
            dungeonData,
          });
        }, 500);
      });
    }, 500);
  }
};

export interface pass {
  dungeonData: DungeonContextType | undefined;
  appData: AppContextType | undefined;
  isFocused: boolean;
  voluntary?: boolean;
}
export const pass = ({
  appData,
  dungeonData,
  isFocused,
  voluntary = false,
}: pass) => {
  if (!appData || !dungeonData) throw new Error("missing context in pass()");
  const { battleLogger, setAttackAnimationOnGoing } = dungeonData;
  const { playerState, enemyState } = appData;

  if (enemyState && playerState && isFocused) {
    playerState.pass({ voluntary });
    battleLogger("You passed!");
    enemyState.conditionResolver();

    playerMinionsTurn({ dungeonData, appData }, () => {
      enemyState.conditionResolver();
      setTimeout(() => {
        enemyTurnCheck({
          appData,
          dungeonData,
        });
        setAttackAnimationOnGoing(false);
      }, 750);
    });
  }
};

export function playerMinionsTurn(
  { dungeonData, appData }: ContextData,
  callback: () => void,
) {
  if (!appData || !dungeonData)
    throw new Error("missing context in playerMinionsTurn()");
  const { battleLogger } = dungeonData;
  const { playerState, enemyState } = appData;

  const suppliedMinions = playerState?.minionsAndPets;
  if (
    enemyState &&
    playerState &&
    suppliedMinions &&
    suppliedMinions.length > 0
  ) {
    let completedTurns = 0;

    suppliedMinions.forEach((minion, i) => {
      setTimeout(() => {
        if (enemyState.equals(enemyState.id) && enemyState.health > 0) {
          const res = minion.takeTurn({ target: enemyState });
          battleLogger(res.logString);
        }
        completedTurns++;
        if (completedTurns === suppliedMinions.length) {
          callback();
        }
      }, 1000 * i);
    });
  } else {
    callback();
  }
}
