import { useCallback } from "react";
import { AttackUse, TutorialOption } from "@/utility/types";
import { toTitleCase, wait } from "@/utility/functions/misc";
import { useLootState, useTutorialState } from "@/providers/DungeonData";
import { useRootStore } from "./stores";
import { Creature, Enemy, Minion } from "@/entities/creatures";
import { Character, PlayerCharacter } from "@/entities/character";
import { Attack, PerTargetUse } from "@/entities/attack";
import { useIsFocused } from "@react-navigation/native";
import { AnimationOptions } from "@/utility/animation/enemy";
import { type Condition } from "@/entities/conditions";
import { Being } from "@/entities/being";

const attackHandler = ({
  attackResults,
  user,
}: {
  attackResults: {
    attack: Attack | null;
    targetResults:
      | {
          target: Being;
          use: PerTargetUse;
        }[]
      | null;
    buffs: Condition[] | null;
    log: string;
  };
  user: Being;
}) => {
  if (attackResults.buffs) {
    attackResults.buffs.forEach((buff) => user.addCondition(buff));
  }
  if (!attackResults.targetResults) return;
  for (const res of attackResults.targetResults) {
    if ("damages" in res.use && res.use.damages) {
      res.target.damageHealth({
        damage:
          res.use.damages.total -
          (res.target.healsFromPoison ? res.use.damages.poison : 0),
        attackerId: user.id,
      });
      if (res.target.healsFromPoison) {
        res.target.restoreHealth(res.use.damages.poison);
      }
      res.target.damageSanity(res.use.damages.sanity);
      if (res.use.debuffs) {
        res.use.debuffs.forEach((debuff) => res.target.addCondition(debuff));
      }
    }
  }
};

export const useEnemyManagement = () => {
  const root = useRootStore();
  const { enemyStore, playerState, dungeonStore, tutorialStore } = root;
  const { setDroppedItems } = useLootState();
  const { setShouldShowFirstBossKillTutorialAfterItemDrops } =
    useTutorialState();

  const enemyDeathHandler = useCallback(
    (enemy: Being) => {
      if (!playerState || enemy instanceof Minion) return false;

      if (
        enemy.currentHealth <= 0 ||
        (enemy.currentSanity && enemy.currentSanity <= 0)
      ) {
        dungeonStore.addLog(
          `You defeated ${enemy instanceof Creature ? "the" : ""} ${toTitleCase(
            ((enemy as Creature) || Character).nameReference,
          )}`,
        );

        const { itemDrops, storyDrops, gold } = (
          enemy as Enemy | Character
        ).getDrops(playerState, dungeonStore.fightingBoss);

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
        const results = minion.takeTurn({ targets: [playerState] });
        attackHandler({ attackResults: results, user: minion });
        dungeonStore.addLog("(minion) " + results.log);
      });
    });
  };

  const enemyTurn = useCallback(() => {
    enemyStore.enemies.forEach((enemy, index) => {
      wait(1000 * index).then(() => {
        if (!enemyDeathHandler(enemy)) {
          const enemyAttackRes = (enemy as Enemy).takeTurn({
            player: playerState!,
          });
          const animStore = enemyStore.getAnimationStore(enemy.id);
          let animationForAttack: AnimationOptions = "attack_1";
          if (enemyAttackRes.attack && enemyAttackRes.attack.name) {
            animationForAttack =
              (enemyAttackRes.attack.animation as AnimationOptions | null) ??
              "attack_1";
          }

          if (enemyAttackRes.selfDamage != 0) {
            enemy?.damageHealth({
              damage: enemyAttackRes.selfDamage,
              attackerId: enemy.id,
            });
          }

          setTimeout(
            () => {
              attackHandler({ attackResults: enemyAttackRes, user: enemy });
              setTimeout(
                () => enemy.endTurn(),
                animStore?.movementDuration ?? 1000,
              );
            },
            animStore?.movementDuration ?? 1000,
          );

          //Indicates an attack took place (could be a miss!) (Null indicates a failure - either had an execution condition or was stunned)
          if (enemyAttackRes.targetResults) {
            let potentialPoisonHeal = 0;
            for (const res of enemyAttackRes.targetResults) {
              switch (res.use.result) {
                case AttackUse.success:
                  setTimeout(
                    () => {
                      if (res.target.id === playerState?.id) {
                        if (
                          (res.use.damages?.total ?? 0) >=
                            res.target.maxHealth &&
                          dungeonStore.screenShaker
                        ) {
                          dungeonStore.screenShaker(300);
                        } else if (
                          (res.use.damages?.total ?? 0) >=
                            res.target.maxHealth / 2 &&
                          dungeonStore.screenShaker
                        ) {
                          dungeonStore.screenShaker(150);
                        }
                      }
                    },
                    animStore?.movementDuration ?? 1000,
                  );
                  potentialPoisonHeal += res.use.damages?.poison ?? 0;
                  enemy.restoreHealth(res.use.healed ?? 0);
                  animStore?.addToAnimationQueue(
                    animStore.getAttackQueue(
                      (enemyAttackRes.attack
                        ?.animation as AnimationOptions | null) ?? "attack_1",
                    ),
                  );
                  break;
                case AttackUse.miss:
                  animStore?.addToAnimationQueue(
                    animStore.getAttackQueue(
                      (enemyAttackRes.attack
                        ?.animation as AnimationOptions | null) ?? "attack_1",
                    ),
                  );
                  break;
                case AttackUse.block:
                  animStore?.addToAnimationQueue(
                    animStore.getAttackQueue(
                      (enemyAttackRes.attack
                        ?.animation as AnimationOptions | null) ?? "attack_1",
                    ),
                  );

                  break;
                case AttackUse.stunned:
                  animStore?.setTextString("STUNNED!");
                  break;
                case AttackUse.lowMana:
                  animStore?.setTextString(
                    (enemy as Enemy | Character).nameReference !==
                      "training dummy"
                      ? "EXHAUSTED!"
                      : "*STARE*",
                  );
                  break;
              }
            }
            if (enemy.healsFromPoison) {
              enemy.restoreHealth(potentialPoisonHeal);
            }
          }

          dungeonStore.addLog(enemyAttackRes.log);

          if (enemy instanceof Enemy) {
            enemy.checkPhaseTransitions();
          }
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

      minions?.forEach(async (minion, idx) => {
        await wait(1000 * idx);
        const result = minion.takeTurn({ targets: enemyStore.enemies });
        attackHandler({ attackResults: result, user: minion });
        if (!result.targetResults) return;
        for (const res of result.targetResults) {
          const animStore = enemyStore.getAnimationStore(res.target.id);
          switch (res.use.result) {
            case AttackUse.success:
              minion.restoreHealth(res.use.healed ?? 0);
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
            case AttackUse.lowMana:
              break;
          }
        }
        dungeonStore.addLog(`(minion) ${result.log}`);
      });
      callback();
    },
    [playerState, enemyStore.enemies.length],
  );

  const handleAttackResult = useCallback(
    (attack: Attack, targets: Being[]) => {
      const { targetResults, log, buffs, selfDamage } = attack.use(targets);

      buffs?.forEach((buff) => playerState?.addCondition(buff));
      if (selfDamage != 0) {
        playerState?.damageHealth({
          damage: selfDamage,
          attackerId: playerState.id,
        });
      }

      let potentialPoisonHeal = 0;
      for (const res of targetResults) {
        const animStore = enemyStore.getAnimationStore(res.target.id);
        switch (res.use.result) {
          case AttackUse.success:
            if (
              (res.use.damages?.total ?? 0) >= res.target.maxHealth &&
              dungeonStore.screenShaker
            ) {
              dungeonStore.screenShaker(300);
            } else if (
              (res.use.damages?.total ?? 0) >= res.target.maxHealth / 2 &&
              dungeonStore.screenShaker
            ) {
              dungeonStore.screenShaker(150);
            }
            if ((res.use.damages?.total ?? 0) >= res.target.currentHealth) {
              animStore?.addToAnimationQueue("death");
            } else if (res.use.damages && res.use.damages.total > 0) {
              animStore?.addToAnimationQueue("hurt");
            }
            potentialPoisonHeal += res.use.damages?.poison ?? 0;
            res.target.damageHealth({
              damage: res.use.damages?.total ?? 0,
              attackerId: attack.user.id,
            });

            res.target.damageSanity(res.use.damages?.sanity);
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
          case AttackUse.lowMana:
            //should not enter, blocked if mana is low
            console.error("Player attack use returned lowEnergy fail");
            break;
        }
      }
      if (playerState?.healsFromPoison) {
        playerState.restoreHealth(potentialPoisonHeal);
      }
      return log;
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
    ({ attack, targets }: { attack: Attack; targets: Being[] }) => {
      if (!playerState || !isFocused) return;

      const continueAttackFlow = () => {
        const logString = handleAttackResult(attack, targets);
        dungeonStore.addLog(logString);
        if (playerState.attacksHeldActive.length > 0) {
          playerState.attacksHeldActive.forEach((heldActive) => {
            if (heldActive.heldActiveTargets) {
              const log = handleAttackResult(
                heldActive,
                heldActive.heldActiveTargets,
              );
              dungeonStore.addLog(log);
            }
          });
        }

        // skip in case of killed enemy
        targets.forEach((target) => {
          if (target.currentHealth <= 0) {
            if (target instanceof Enemy) {
              const transitionHappened = target.checkPhaseTransitions(); // this will catch 0 hp phase transitions
              if (!transitionHappened) {
                enemyDeathHandler(target);
              }
            } else if (target instanceof Creature) {
              enemyDeathHandler(target);
            }
          }
        });

        setTimeout(() => {
          playerMinionsTurn(() => {
            setTimeout(() => {
              if (enemyStore.enemies.length > 0) {
                enemyTurn();
              }
            }, playerState.minionsAndPets.length * 1000);
          });
          playerState.endTurn();
        }, 1000);
      };

      if (attack.animation && typeof attack.animation !== "string") {
        const targetIDs: string[] = [];
        targets.forEach((target) => {
          if (target instanceof Enemy || target instanceof Character) {
            targetIDs.push(target.id);
          }
        });

        playerAnimationStore
          .setAnimation({ set: attack.animation, enemyIDs: targetIDs })
          .then(() => {
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
