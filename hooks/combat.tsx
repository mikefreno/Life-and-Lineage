import { useCallback } from "react";
import { AttackUse, TutorialOption } from "../utility/types";
import { toTitleCase, wait } from "../utility/functions/misc";
import { useLootState, useTutorialState } from "../providers/DungeonData";
import { useRootStore } from "./stores";
import { Enemy, Minion } from "../entities/creatures";
import { PlayerCharacter } from "../entities/character";
import { Attack } from "../entities/attack";
import { getMagnitude } from "../utility/functions/conditions";
import { useIsFocused } from "@react-navigation/native";
import { Spell } from "../entities/spell";

export const useEnemyManagement = () => {
  const root = useRootStore();
  const { enemyStore, playerState, dungeonStore, tutorialStore } = root;
  const { setDroppedItems } = useLootState();
  const { setShouldShowFirstBossKillTutorialAfterItemDrops } =
    useTutorialState();

  const enemyDeathHandler = useCallback(
    (enemy: Enemy) => {
      if (!playerState) return false;

      if (
        enemy.currentHealth <= 0 ||
        (enemy.currentSanity && enemy.currentSanity <= 0)
      ) {
        dungeonStore.addLog(
          `You defeated the ${toTitleCase(enemy.creatureSpecies)}`,
        );

        const { itemDrops, storyDrops, gold } = enemy.getDrops(
          playerState,
          dungeonStore.fightingBoss,
        );
        wait(500).then(() => {
          if (itemDrops) {
            playerState.addGold(gold);
            playerState.addToKeyItems(storyDrops);
            setDroppedItems({ itemDrops, gold, storyDrops });
          }

          enemyStore.removeEnemy(enemy);
          if (enemyStore.enemies.length === 0) {
            if (
              dungeonStore.fightingBoss &&
              dungeonStore.currentLevel &&
              dungeonStore.currentInstance
            ) {
              dungeonStore.setInBossFight(false);
              dungeonStore.currentLevel.setBossDefeated();
              dungeonStore.openNextDungeonLevel(dungeonStore.currentInstance);
              enemyStore.clearEnemyList();
              playerState.bossDefeated();
              if (!tutorialStore.tutorialsShown[TutorialOption.firstBossKill]) {
                setShouldShowFirstBossKillTutorialAfterItemDrops(true);
              }
            }
          }
        });

        return true;
      }
      return false;
    },
    [
      playerState,
      dungeonStore.fightingBoss,
      dungeonStore.currentInstance,
      dungeonStore.currentLevel,
    ],
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
        dungeonStore.addLog("(minion) " + res.logString);
      });
    });
  };

  const handleEnemyAction = useCallback(
    (
      enemy: Enemy,
      enemyAttackRes: {
        attack?: Attack | undefined;
        result: {
          target: string;
          result: AttackUse;
        }[];
        logString: string;
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
          dungeonStore.addLog(`You dealt ${revengeDamage} revenge damage!`);
        }
      }

      const actions: Record<AttackUse, (playerHealthChange: number) => void> = {
        [AttackUse.success]: (playerHealthChange) => {
          animationStore.triggerAttack();

          wait(500).then(() => {
            if (
              playerHealthChange > 0 ||
              enemyAttackRes.attack!.debuffStrings.length > 0 ||
              enemyAttackRes.attack!.buffStrings.length > 0
            ) {
              animationStore.setTextString(enemyAttackRes.attack!.name);
              animationStore.triggerText();
            }
          });
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

      if (!enemyAttackRes.attack) {
        actions[enemyAttackRes.result[0].result](playerHealthChange);
      } else {
        const playerAsTarget = enemyAttackRes.result.find(
          ({ target }) => target === playerState.id,
        );
        if (playerAsTarget) {
          actions[playerAsTarget.result](playerHealthChange);
        } else {
          actions[enemyAttackRes.result[0].result](playerHealthChange);
        }
      }
      //const playerRes =
      //actions[enemyAttackRes.find((res)=>res.target == playerState.id)(playerHealthChange);
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
          dungeonStore.addLog(enemyAttackRes.logString);

          handleEnemyAction(enemy, enemyAttackRes, startOfTurnPlayerHP);
          enemyMinionsTurn(enemy.minions, enemy, playerState!);

          // Check for death after action
          setTimeout(() => {
            enemyDeathHandler(enemy);
          }, 1000);
        }
      });
    });
  }, [enemyStore.enemies, playerState, handleEnemyAction, enemyDeathHandler]);

  return { enemyTurn, enemyDeathHandler };
};

export const useCombatActions = () => {
  const { enemyStore, playerState, dungeonStore } = useRootStore();
  const { enemyTurn, enemyDeathHandler } = useEnemyManagement();
  const isFocused = useIsFocused();

  const handleMinionTurns = useCallback(
    async (minions: Minion[], target: Enemy[], callback: () => void) => {
      let completedTurns = 0;

      for (let i = 0; i < minions.length; i++) {
        await wait(1000 * i);
        const res = minions[i].takeTurn({ target });
        dungeonStore.addLog(`(minion) ${res.logString}`);
        completedTurns++;
        if (completedTurns === minions.length) {
          callback();
        }
      }
    },
    [],
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
        for (const res of result) {
          if (res.result == AttackUse.miss) {
            const animStore = enemyStore.getAnimationStore(res.target);
            animStore?.triggerDodge();
          }
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
      dungeonStore.addLog("You passed!");

      playerMinionsTurn(() => {
        setTimeout(() => {
          enemyTurn();
        }, 750);
      });
    },
    [
      playerState,
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
      dungeonStore.addLog(logString);

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
