import { useCallback } from "react";
import { enemyGenerator } from "../utility/enemyHelpers";
import { AttackUse, TutorialOption } from "../utility/types";
import { toTitleCase, wait } from "../utility/functions/misc";
import {
  useCombatState,
  useEnemyAnimation,
  useLootState,
  useTutorialState,
} from "../stores/DungeonData";
import { useRootStore } from "./stores";
import { useBattleLogger } from "./generic";
import { Enemy, Minion } from "../entities/creatures";
import { PlayerCharacter } from "../entities/character";
import { Attack } from "../entities/attack";
import { getMagnitude } from "../utility/functions/conditions";
import { useIsFocused } from "@react-navigation/native";
import { Spell } from "../entities/spell";

export const useEnemyManagement = () => {
  const { enemyStore, playerState, gameState, dungeonStore } = useRootStore();
  const { fightingBoss, currentInstance, currentLevel } = dungeonStore;

  const {
    setEnemyAttackDummy,
    setEnemyTextString,
    setEnemyTextDummy,
    setAttackAnimationOnGoing,
    setEnemyDodgeDummy,
  } = useEnemyAnimation();
  const { battleLogger } = useBattleLogger();
  const { setDroppedItems } = useLootState();
  const { setShouldShowFirstBossKillTutorialAfterItemDrops } =
    useTutorialState();

  const enemyDeathHandler = useCallback(() => {
    if (enemyStore.enemies.length == 0 || !playerState || !gameState)
      return false;

    if (
      enemyState.health <= 0 ||
      (enemyState.sanity && enemyState.sanity <= 0)
    ) {
      battleLogger(
        `You defeated the ${toTitleCase(enemyState.creatureSpecies)}`,
      );

      const { itemDrops, storyDrops, gold } = enemyState.getDrops(
        playerState,
        fightingBoss,
      );

      if (itemDrops) {
        playerState.addGold(gold);
        playerState.addToKeyItems(storyDrops);
        setDroppedItems({ itemDrops, gold, storyDrops });
      }

      if (fightingBoss && gameState && currentLevel && currentInstance) {
        dungeonStore.setInBossFight(false);
        currentLevel.setBossDefeated();
        dungeonStore.openNextDungeonLevel(currentInstance);
        playerState.bossDefeated();
        if (!gameState.tutorialsShown[TutorialOption.firstBossKill]) {
          setShouldShowFirstBossKillTutorialAfterItemDrops(true);
        }
      }

      //if (currentInstance=== "Personal") {
      //playerState.killCharacter({ name: slug[2] });
      //}

      enemyStore.enemies = [];
      setEnemyAttackDummy(0);
      setEnemyDodgeDummy(0);
      gameState.gameTick();
      return true;
    }
    return false;
  }, [
    enemyStore.enemies,
    playerState,
    gameState,
    fightingBoss,
    thisInstance,
    instanceName,
    slug,
  ]);

  const enemyMinionsTurn = (
    suppliedMinions: Minion[],
    enemyState: Enemy | null,
    playerState: PlayerCharacter,
  ) => {
    if (!enemyState || !playerState) return;

    suppliedMinions.forEach((minion, index) => {
      wait(1000 * index).then(() => {
        const res = minion.takeTurn({ target: playerState });
        battleLogger("(minion) " + res.logString);
      });
    });
  };

  const handleEnemyAction = useCallback(
    (
      enemyAttackRes:
        | {
            result: AttackUse.success;
            logString: string;
            chosenAttack: Attack;
          }
        | {
            result:
              | AttackUse.miss
              | AttackUse.block
              | AttackUse.stunned
              | AttackUse.lowEnergy;
            logString: string;
          },
      startOfTurnPlayerHP: number,
    ) => {
      if (!enemyState || !playerState) return;

      const playerHealthChange =
        startOfTurnPlayerHP - playerState.currentHealth;

      if (playerHealthChange > 0) {
        const revengeCondition = playerState.conditions.find((condition) =>
          condition.effect.includes("revenge"),
        );

        if (revengeCondition) {
          const effectMagnitudeValue = getMagnitude(
            revengeCondition.effectMagnitude,
          );
          const revengeDamage = Math.min(
            playerHealthChange * 5,
            effectMagnitudeValue * 10,
          );

          enemyState.damageHealth({
            attackerId: revengeCondition.placedbyID,
            damage: revengeDamage,
          });
          battleLogger(`You dealt ${revengeDamage} revenge damage!`);
        }
      }

      const actions: Record<AttackUse, () => void> = {
        [AttackUse.success]: () => {
          if ("chosenAttack" in enemyAttackRes) {
            if (enemyAttackRes.chosenAttack.baseDamage > 0) {
              setEnemyAttackDummy((prev) => prev + 1);
            }
            wait(500).then(() => {
              if (
                enemyAttackRes.chosenAttack.debuffStrings.length > 0 ||
                enemyAttackRes.chosenAttack.buffStrings.length > 0
              ) {
                setEnemyTextString(enemyAttackRes.chosenAttack.name);
                setEnemyTextDummy((prev) => prev + 1);
              }
            });
          }
        },

        [AttackUse.miss]: () => {
          setEnemyAttackDummy((prev) => prev + 1);
          wait(500).then(() => {
            setEnemyTextString("miss");
            setEnemyTextDummy((prev) => prev + 1);
          });
        },
        [AttackUse.block]: () => {
          setEnemyTextString("blocked");
          setEnemyTextDummy((prev) => prev + 1);
        },
        [AttackUse.stunned]: () => {
          setEnemyTextString("stunned");
          setEnemyTextDummy((prev) => prev + 1);
        },
        [AttackUse.lowEnergy]: () => {
          setEnemyTextString("pass");
          setEnemyTextDummy((prev) => prev + 1);
        },
      };

      actions[enemyAttackRes.result]();
    },
    [enemyStore.enemies, playerState],
  );

  const enemyAction = () => {
    if (!enemyState || !playerState || !gameState) return;

    const startOfTurnPlayerHP = playerState.currentHealth;
    const enemyAttackRes = enemyState.takeTurn({ player: playerState });
    battleLogger(enemyAttackRes.logString);

    handleEnemyAction(enemyAttackRes, startOfTurnPlayerHP);

    enemyMinionsTurn(enemyState.minions, enemyState, playerState);

    setTimeout(() => {
      enemyDeathHandler();
      setAttackAnimationOnGoing(false);
    }, 1000);
  };

  const enemyTurn = useCallback(() => {
    const dead = enemyDeathHandler();
    if (!dead) {
      enemyAction();
    }
    setTimeout(() => setAttackAnimationOnGoing(false), 1000);
  }, [enemyDeathHandler, enemyAction]);

  const getEnemy = useCallback(() => {
    const enemy = enemyGenerator(instanceName, level, enem);
    if (enemy) {
      enemyStore.enemies.push(enemy);
      battleLogger(`You found a ${toTitleCase(enemy.creatureSpecies)}!`);
      setAttackAnimationOnGoing(false);
      dungeonSave({
        playerState,
        enemyState,
        instanceName,
        slug,
        tiles,
        mapDimensions,
        currentPosition,
        gameState,
        fightingBoss,
      });
    }
  }, [instanceName, level, thisDungeon, thisInstance, fightingBoss]);

  const loadBoss = useCallback(() => {
    setFightingBoss(true);
    setAttackAnimationOnGoing(false);

    if (thisDungeon && thisInstance && playerState) {
      const boss = thisDungeon.getBoss(thisInstance.name);
      setEnemy(boss);
      battleLogger(`You found the boss!`);
    }
  }, [thisDungeon, thisInstance, playerState]);

  return {
    getEnemy,
    loadBoss,
    enemyTurn,
  };
};

export const useCombatActions = () => {
  const { playerState, enemyState } = useRootStore();
  const { setAttackAnimationOnGoing, setEnemyDodgeDummy } = useEnemyAnimation();
  const { battleLogger } = useBattleLogger();
  const { enemyTurn } = useEnemyManagement();
  const isFocused = useIsFocused();

  const handleMinionTurns = useCallback(
    async (minions: Minion[], target: Enemy, callback: () => void) => {
      let completedTurns = 0;

      for (let i = 0; i < minions.length; i++) {
        await wait(1000 * i);
        if (target.equals(target.id) && target.currentHealth > 0) {
          const res = minions[i].takeTurn({ target });
          battleLogger(`(minion) ${res.logString}`);
        }
        completedTurns++;
        if (completedTurns === minions.length) {
          callback();
        }
      }
    },
    [battleLogger],
  );

  const playerMinionsTurn = useCallback(
    (callback: () => void) => {
      const minions = playerState?.minionsAndPets;

      if (enemyState && playerState && minions?.length) {
        handleMinionTurns(minions, enemyState, callback);
      } else {
        callback();
      }
    },
    [playerState, enemyState, handleMinionTurns],
  );

  const handleAttackResult = useCallback(
    (attackOrSpell: Attack | Spell, target: Enemy | Minion) => {
      if (attackOrSpell instanceof Attack) {
        const { result, logString } = attackOrSpell.use({ target });
        if (result === AttackUse.miss) {
          setEnemyDodgeDummy((prev) => prev + 1);
        }
        return logString;
      }

      const { logString } = attackOrSpell.use({
        target,
        user: playerState!,
      });
      return logString;
    },
    [playerState, setEnemyDodgeDummy],
  );

  const pass = useCallback(
    ({ voluntary = false }: { voluntary?: boolean }) => {
      if (!enemyState || !playerState || !isFocused) return;

      playerState.pass({ voluntary });
      battleLogger("You passed!");

      playerMinionsTurn(() => {
        setTimeout(() => {
          enemyTurn();
          setAttackAnimationOnGoing(false);
        }, 750);
      });
    },
    [
      enemyState,
      playerState,
      battleLogger,
      playerMinionsTurn,
      enemyTurn,
      setAttackAnimationOnGoing,
    ],
  );

  const useAttack = useCallback(
    ({
      attackOrSpell,
      target,
    }: {
      attackOrSpell: Attack | Spell;
      target: Enemy | Minion;
    }) => {
      if (!enemyState || !playerState || !isFocused) return;

      const logString = handleAttackResult(attackOrSpell, target);
      battleLogger(logString);

      setTimeout(() => {
        playerMinionsTurn(() => {
          setTimeout(() => {
            enemyTurn();
          }, 500);
        });
      }, 500);
    },
    [
      enemyState,
      playerState,
      handleAttackResult,
      battleLogger,
      playerMinionsTurn,
      enemyTurn,
    ],
  );

  return {
    pass,
    useAttack,
    playerMinionsTurn,
  };
};
