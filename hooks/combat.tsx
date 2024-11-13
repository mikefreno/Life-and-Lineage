import { useCallback } from "react";
import { AttackUse, TutorialOption } from "../utility/types";
import { toTitleCase, wait } from "../utility/functions/misc";
import {
  useEnemyAnimation,
  useLootState,
  useTutorialState,
} from "../stores/DungeonData";
import { useEnemyStore, usePlayerStore, useRootStore } from "./stores";
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

  const enemyDeathHandler = useCallback(
    (enemy: Enemy) => {
      if (!playerState || !gameState) return false;

      if (
        enemy.currentHealth <= 0 ||
        (enemy.currentSanity && enemy.currentSanity <= 0)
      ) {
        battleLogger(`You defeated the ${toTitleCase(enemy.creatureSpecies)}`);

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
            dungeonStore.setInBossFight(false);
            currentLevel.setBossDefeated();
            dungeonStore.openNextDungeonLevel(currentInstance);
            playerState.bossDefeated();
            if (!gameState.tutorialsShown[TutorialOption.firstBossKill]) {
              setShouldShowFirstBossKillTutorialAfterItemDrops(true);
            }
          }

          setEnemyAttackDummy(0);
          setEnemyDodgeDummy(0);
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
        battleLogger("(minion) " + res.logString);
      });
    });
  };

  const handleEnemyAction = useCallback(
    (
      enemy: Enemy,
      enemyAttackRes: {
        result: AttackUse;
        logString: string;
        chosenAttack?: Attack;
      },
      startOfTurnPlayerHP: number,
    ) => {
      if (!playerState) return;

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
          battleLogger(`You dealt ${revengeDamage} revenge damage!`);
        }
      }

      const actions: Record<AttackUse, () => void> = {
        [AttackUse.success]: () => {
          if (
            enemyAttackRes.chosenAttack &&
            enemyAttackRes.chosenAttack.baseDamage > 0
          ) {
            setEnemyAttackDummy((prev) => prev + 1);
            wait(500).then(() => {
              if (
                enemyAttackRes.chosenAttack!.debuffStrings.length > 0 ||
                enemyAttackRes.chosenAttack!.buffStrings.length > 0
              ) {
                setEnemyTextString(enemyAttackRes.chosenAttack!.name);
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
    [playerState],
  );

  const enemyTurn = useCallback(() => {
    // Process each enemy's turn sequentially
    enemyStore.enemies.forEach((enemy, index) => {
      wait(1000 * index).then(() => {
        if (!enemyDeathHandler(enemy)) {
          const startOfTurnPlayerHP = playerState?.currentHealth ?? 0;
          const enemyAttackRes = enemy.takeTurn({ player: playerState! });

          handleEnemyAction(enemy, enemyAttackRes, startOfTurnPlayerHP);
          enemyMinionsTurn(enemy.minions, enemy, playerState!);

          // Check for death after action
          setTimeout(() => {
            enemyDeathHandler(enemy);
            setAttackAnimationOnGoing(false);
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
  const { setAttackAnimationOnGoing, setEnemyDodgeDummy } = useEnemyAnimation();
  const { battleLogger } = useBattleLogger();
  const { enemyTurn, enemyDeathHandler } = useEnemyManagement();
  const isFocused = useIsFocused();

  const handleMinionTurns = useCallback(
    async (minions: Minion[], target: Enemy[], callback: () => void) => {
      let completedTurns = 0;

      for (let i = 0; i < minions.length; i++) {
        await wait(1000 * i);
        const res = minions[i].takeTurn({ target });
        battleLogger(`(minion) ${res.logString}`);
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
          setEnemyDodgeDummy((prev) => prev + 1);
        }
        return logString;
      }

      const { logString } = attackOrSpell.use({
        targets,
        user: playerState!,
      });
      return logString;
    },
    [playerState, setEnemyDodgeDummy],
  );

  const pass = useCallback(
    ({ voluntary = false }: { voluntary?: boolean }) => {
      if (!playerState || !isFocused) return;

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
      if (!playerState || !isFocused) return;

      const logString = handleAttackResult(attackOrSpell, [target]);
      battleLogger(logString);

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
