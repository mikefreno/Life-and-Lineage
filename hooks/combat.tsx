import { useCallback } from "react";
import { AttackUse, TutorialOption } from "../utility/types";
import { toTitleCase, wait } from "../utility/functions/misc";
import { useLootState, useTutorialState } from "../stores/DungeonData";
import {
  useDungeonStore,
  useEnemyStore,
  usePlayerStore,
  useRootStore,
} from "./stores";
import { Enemy, Minion } from "../entities/creatures";
import { PlayerCharacter } from "../entities/character";
import { Attack } from "../entities/attack";
import { getMagnitude } from "../utility/functions/conditions";
import { useIsFocused } from "@react-navigation/native";
import { Spell } from "../entities/spell";

export const useEnemyManagement = () => {
  const { enemyStore, playerState, gameState } = useRootStore();
  const {
    fightingBoss,
    currentInstance,
    currentLevel,
    addLog,
    setInBossFight,
    openNextDungeonLevel,
  } = useDungeonStore();
  const { setDroppedItems } = useLootState();
  const { setShouldShowFirstBossKillTutorialAfterItemDrops } =
    useTutorialState();

  const enemyDeathHandler = useCallback(
    (enemy: Enemy) => {
      if (!playerState || !gameState) return false;

      if (
        enemy.currentHealth <= 0 ||
        (enemy.currentSanity && enemy.currentSanity <= 0)
      ) {
        addLog(`You defeated the ${toTitleCase(enemy.creatureSpecies)}`);

        const { itemDrops, storyDrops, gold } = enemy.getDrops(
          playerState,
          fightingBoss,
        );

        if (itemDrops) {
          playerState.addGold(gold);
          playerState.addToKeyItems(storyDrops);
          setDroppedItems({ itemDrops, gold, storyDrops });
        }

        enemyStore.removeEnemy(enemy);

        // Check if this was the last enemy
        if (enemyStore.enemies.length === 0) {
          if (fightingBoss && currentLevel && currentInstance) {
            setInBossFight(false);
            currentLevel.setBossDefeated();
            openNextDungeonLevel(currentInstance);
            enemyStore.clearEnemyList();
            playerState.bossDefeated();
            if (!gameState.tutorialsShown[TutorialOption.firstBossKill]) {
              setShouldShowFirstBossKillTutorialAfterItemDrops(true);
            }
          }
          gameState.gameTick();
        }

        return true;
      }
      return false;
    },
    [playerState, gameState, fightingBoss, currentInstance, currentLevel],
  );

  const enemyMinionsTurn = (
    suppliedMinions: Minion[],
    enemyState: Enemy | null,
    playerState: PlayerCharacter,
  ) => {
    if (!enemyState || !playerState) return;

    suppliedMinions.forEach((minion, index) => {
      wait(1000 * index).then(() => {
        const res = minion.takeTurn({ target: playerState });
        addLog("(minion) " + res.logString);
      });
    });
  };

  const handleEnemyAction = useCallback(
    (
      enemy: Enemy,
      enemyAttackRes: {
        result: AttackUse;
        logString: string;
        attack?: Attack;
      },
      startOfTurnPlayerHP: number,
    ) => {
      const animationStore = enemyStore.getAnimationStore(enemy.id);
      if (!playerState || !animationStore) return;
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

          enemy.damageHealth({
            attackerId: revengeCondition.placedbyID,
            damage: revengeDamage,
          });
          addLog(`You dealt ${revengeDamage} revenge damage!`);
        }
      }

      const actions: Record<AttackUse, (playerHealthChange: number) => void> = {
        [AttackUse.success]: (playerHealthChange) => {
          if (enemyAttackRes.attack && playerHealthChange !== 0) {
            animationStore?.triggerAttack();

            wait(500).then(() => {
              if (
                enemyAttackRes.attack!.debuffStrings.length > 0 ||
                enemyAttackRes.attack!.buffStrings.length > 0
              ) {
                animationStore.setTextString(enemyAttackRes.attack!.name);
                animationStore.triggerText();
              }
            });
          }
        },

        [AttackUse.miss]: () => {
          animationStore.triggerAttack();
          wait(500).then(() => {
            animationStore.setTextString("miss");
            animationStore.triggerText();
          });
        },
        [AttackUse.block]: () => {
          animationStore.setTextString("blocked");
          animationStore.triggerText();
        },
        [AttackUse.stunned]: () => {
          animationStore.setTextString("stunned");
          animationStore.triggerText();
        },
        [AttackUse.lowEnergy]: () => {
          animationStore.setTextString("pass");
          animationStore.triggerText();
        },
      };

      actions[enemyAttackRes.result](playerHealthChange);
    },
    [playerState],
  );

  const enemyTurn = useCallback(() => {
    // Process each enemy's turn sequentially
    enemyStore.enemies.forEach((enemy, index) => {
      wait(1000 * index).then(() => {
        if (!enemyDeathHandler(enemy)) {
          const startOfTurnPlayerHP = { ...playerState }.currentHealth ?? 0;
          const enemyAttackRes = enemy.takeTurn({ player: playerState! });
          addLog(enemyAttackRes.logString);

          handleEnemyAction(enemy, enemyAttackRes, startOfTurnPlayerHP);
          enemyMinionsTurn(enemy.minions, enemy, playerState!);

          // Check for death after action
          setTimeout(() => {
            enemyDeathHandler(enemy);
            enemyStore.setAttackAnimationOngoing(false);
          }, 1000);
        }
      });
    });
  }, [enemyStore.enemies, playerState, handleEnemyAction, enemyDeathHandler]);

  return { enemyTurn, enemyDeathHandler };
};

export const useCombatActions = () => {
  const enemyStore = useEnemyStore();
  const playerState = usePlayerStore();
  const { addLog } = useDungeonStore();
  const { enemyTurn, enemyDeathHandler } = useEnemyManagement();
  const isFocused = useIsFocused();

  const handleMinionTurns = useCallback(
    async (minions: Minion[], target: Enemy[], callback: () => void) => {
      let completedTurns = 0;

      for (let i = 0; i < minions.length; i++) {
        await wait(1000 * i);
        const res = minions[i].takeTurn({ target });
        addLog(`(minion) ${res.logString}`);
        completedTurns++;
        if (completedTurns === minions.length) {
          callback();
        }
      }
    },
    [addLog],
  );

  const playerMinionsTurn = useCallback(
    (callback: () => void) => {
      const minions = playerState?.minionsAndPets;

      if (playerState && minions?.length) {
        handleMinionTurns(minions, enemyStore.enemies, callback);
      } else {
        callback();
      }
    },
    [playerState, enemyStore.enemies.length, handleMinionTurns],
  );

  const handleAttackResult = useCallback(
    (attackOrSpell: Attack | Spell, targets: (Enemy | Minion)[]) => {
      if (attackOrSpell instanceof Attack) {
        const { result, logString } = attackOrSpell.use({ targets });
        if (result === AttackUse.miss) {
          //setEnemyDodgeDummy((prev) => prev + 1);
        }
        return logString;
      }

      const { logString } = attackOrSpell.use({
        targets,
        user: playerState!,
      });
      return logString;
    },
    [playerState],
  );

  const pass = useCallback(
    ({ voluntary = false }: { voluntary?: boolean }) => {
      if (!playerState || !isFocused) return;

      playerState.pass({ voluntary });
      addLog("You passed!");

      playerMinionsTurn(() => {
        setTimeout(() => {
          enemyTurn();
          enemyStore.setAttackAnimationOngoing(false);
        }, 750);
      });
    },
    [
      playerState,
      addLog,
      playerMinionsTurn,
      enemyTurn,
      enemyStore.attackAnimationsOnGoing,
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
      if (!playerState || !isFocused) return;

      const logString = handleAttackResult(attackOrSpell, [target]);
      addLog(logString);

      // Check if target died and handle it
      const targetEnemy = enemyStore.enemies.find((e) => e.id === target.id);
      if (targetEnemy && targetEnemy.currentHealth <= 0) {
        enemyDeathHandler(targetEnemy);
      }

      setTimeout(() => {
        playerMinionsTurn(() => {
          setTimeout(() => {
            if (enemyStore.enemies.length > 0) {
              enemyTurn();
            }
          }, 500);
        });
      }, 500);
    },
    [
      enemyStore.enemies,
      playerState,
      handleAttackResult,
      addLog,
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
