import { useCallback } from "react";
import { AttackUse, TutorialOption } from "../utility/types";
import { toTitleCase, wait } from "../utility/functions/misc";
import { useLootState, useTutorialState } from "../providers/DungeonData";
import { useRootStore } from "./stores";
import { Enemy, Minion } from "../entities/creatures";
import { PlayerCharacter } from "../entities/character";
import { Attack } from "../entities/attack";
import { useIsFocused } from "@react-navigation/native";
import { Spell } from "../entities/spell";
import { AnimationOptions, EnemyImageMap } from "@/utility/enemyHelpers";
import { useAnimatedImage } from "@shopify/react-native-skia";

export const useEnemyManagement = () => {
  const root = useRootStore();
  const {
    enemyStore,
    playerState,
    dungeonStore,
    tutorialStore,
    playerAnimationStore,
  } = root;
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

          // probably want to move this into the enemystore, triggered from animation
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

  const enemyTurn = useCallback(() => {
    enemyStore.enemies.forEach((enemy, index) => {
      wait(1000 * index).then(() => {
        if (!enemyDeathHandler(enemy)) {
          const enemyAttackRes = enemy.takeTurn({ player: playerState! });
          for (const res of enemyAttackRes.result) {
            const animStore = enemyStore.getAnimationStore(enemy.id);
            let animationForAttack: AnimationOptions = "attack_1";

            if (enemyAttackRes.attack && enemyAttackRes.attack.name) {
              animationForAttack =
                (enemy.animationStrings[
                  enemyAttackRes.attack.name
                ] as AnimationOptions) ?? "attack_1";
            }

            console.log(
              `${enemy.creatureSpecies} used ${enemyAttackRes.attack?.name}, -> animation: ${animationForAttack}`,
            );

            setTimeout(
              () => {
                if (res.damages) {
                  playerState?.damageHealth({
                    damage: res.damages.total,
                    attackerId: enemy.id,
                  });
                  playerState?.damageSanity(res.damages.sanity);
                }
              },
              animStore?.movementDuration ?? 500,
            );

            switch (res.result) {
              case AttackUse.success:
                animStore?.addToAnimationQueue(
                  animStore.getAttackQueue(animationForAttack),
                );
                break;
              case AttackUse.miss:
                animStore?.addToAnimationQueue(
                  animStore.getAttackQueue(animationForAttack),
                );
                playerAnimationStore.setTextString("DODGE!");
                break;
              case AttackUse.block:
                animStore?.addToAnimationQueue(
                  animStore.getAttackQueue(animationForAttack),
                );
                playerAnimationStore.setTextString("BLOCKED!");
                break;
              case AttackUse.stunned:
                animStore?.setTextString("STUNNED!");
                break;
              case AttackUse.lowEnergy:
                animStore?.setTextString("EXHAUSTED!");
                break;
            }
          }

          dungeonStore.addLog(enemyAttackRes.logString);

          enemyMinionsTurn(enemy.minions, enemy, playerState!);

          setTimeout(() => {
            enemyDeathHandler(enemy);
          }, 1000);
        }
      });
    });
  }, [enemyStore.enemies, playerState, enemyDeathHandler]);

  return { enemyTurn, enemyMinionsTurn, enemyDeathHandler };
};

export const useCombatActions = () => {
  const { enemyStore, playerState, dungeonStore, playerAnimationStore } =
    useRootStore();
  const { enemyTurn, enemyDeathHandler } = useEnemyManagement();
  const isFocused = useIsFocused();

  const playerMinionsTurn = useCallback(
    (callback: () => void) => {
      const minions = playerState?.minionsAndPets;

      minions?.forEach((minion) => {
        const result = minion.takeTurn({ target: enemyStore.enemies });
        for (const res of result.result) {
          const animStore = enemyStore.getAnimationStore(res.target.id);
          switch (res.result) {
            case AttackUse.success:
              animStore?.addToAnimationQueue("hurt");
              break;
            case AttackUse.miss:
              animStore?.addToAnimationQueue("dodge");
              break;
            case AttackUse.block:
              animStore?.addToAnimationQueue("block");
              break;
            case AttackUse.stunned:
              break;
            case AttackUse.lowEnergy:
              break;
          }
        }
        dungeonStore.addLog(`(minion) ${result.logString}`);
      });
      callback();
    },
    [playerState, enemyStore.enemies.length],
  );

  const handleAttackResult = useCallback(
    (attackOrSpell: Attack | Spell, targets: (Enemy | Minion)[]) => {
      if (attackOrSpell instanceof Attack) {
        const { result, logString } = attackOrSpell.use({ targets });
        for (const res of result) {
          const animStore = enemyStore.getAnimationStore(res.target.id);
          switch (res.result) {
            case AttackUse.success:
              if ((res.damages?.total ?? 0) >= res.target.currentHealth) {
                animStore?.addToAnimationQueue("death");
              } else {
                animStore?.addToAnimationQueue("hurt");
              }
              res.target.damageHealth({
                damage: res.damages?.total ?? 0,
                attackerId: attackOrSpell.user.id,
              });
              res.target.damageSanity(res.damages?.sanity);
              break;
            case AttackUse.miss:
              animStore?.addToAnimationQueue("dodge");
              playerAnimationStore.setTextString("MISS!");
              break;
            case AttackUse.block:
              animStore?.addToAnimationQueue("block");
              playerAnimationStore.setTextString("BLOCKED!");
              break;
            case AttackUse.stunned:
              //should not enter, if the player is stunned, they shouldn't be able to attack
              console.error("Player attack use returned stunned fail");
              break;
            case AttackUse.lowEnergy:
              //should not enter, blocked if mana is low
              console.error("Player attack use returned lowEnergy fail");
              break;
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
      playerAnimationStore.setPassed(true);

      playerState.pass({ voluntary });
      dungeonStore.addLog("You passed!");

      playerMinionsTurn(() => {
        setTimeout(() => {
          enemyTurn();
        }, 750);
      });
    },
    [playerState, playerMinionsTurn, enemyTurn, enemyStore.enemyTurnOngoing],
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

      const continueAttackFlow = () => {
        const logString = handleAttackResult(attackOrSpell, [target]);
        dungeonStore.addLog(logString);

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
      };

      // If there's an animation, set it up and continue after it completes
      if (attackOrSpell.animation) {
        playerAnimationStore
          .setAnimation(attackOrSpell.animation, target.id)
          .then(() => {
            // Animation completed, continue with attack flow
            continueAttackFlow();
          });
      } else {
        // No animation, continue immediately
        continueAttackFlow();
      }
    },
    [
      enemyStore.enemies,
      playerState,
      handleAttackResult,
      playerMinionsTurn,
      enemyTurn,
      playerAnimationStore,
    ],
  );

  return {
    pass,
    useAttack,
    playerMinionsTurn,
  };
};
