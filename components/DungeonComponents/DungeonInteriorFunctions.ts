import type { PlayerCharacter } from "../../classes/character";
import { Enemy, type Minion } from "../../classes/creatures";
import { enemyGenerator } from "../../utility/enemy";
import { getMagnitude } from "../../utility/functions/conditions";
import { toTitleCase } from "../../utility/functions/misc/words";
import { dungeonSave } from "../../utility/functions/save_load";
import type {
  AppContextType,
  AttackObj,
  DungeonContextType,
  SpellObj,
} from "../../utility/types";
import { SpellError } from "../../utility/errorTypes";
import { Item } from "../../classes/item";

interface addItemToPouch {
  item: Item;
  dungeonData: DungeonContextType | undefined;
}
export function addItemToPouch({ item, dungeonData }: addItemToPouch) {
  if (!dungeonData) throw new Error("missing context in addItemToPouch()");
  const { setLeftBehindDrops } = dungeonData;
  setLeftBehindDrops((prev) => [...prev, item]);
}

export interface contextData {
  dungeonData: DungeonContextType | undefined;
  appData: AppContextType | undefined;
}

export function enemyTurnCheck({ dungeonData, appData }: contextData) {
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
    setShouldShowFirstBossKillTutorial,
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
            setShouldShowFirstBossKillTutorial(true);
          }
        }
        setEnemy(null);
        gameState.gameTick(playerState);
      }
    } else {
      enemyTurn({ appData, dungeonData });
      setTimeout(() => setAttackAnimationOnGoing(false), 1000);
    }
  }
}

export const enemyTurn = ({ appData, dungeonData }: contextData) => {
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
  } = dungeonData;
  if (enemyState && playerState && gameState) {
    setEnemyAttacked(true);
    const enemyAttackRes = enemyState.takeTurn({
      defenderMaxHealth: playerState.nonConditionalMaxHealth,
      defenderMaxSanity: playerState.nonConditionalMaxSanity,
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
          defenderMaxHealth: playerState.nonConditionalMaxHealth,
          defenderMaxSanity: playerState.nonConditionalMaxSanity,
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

export function getEnemy({ appData, dungeonData }: contextData) {
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

export const loadBoss = ({ appData, dungeonData }: contextData) => {
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
    const boss = thisDungeon.getBoss(thisInstance.name)[0];
    setEnemy(boss);
    battleLogger(`You found the boss!`);
  }
};

export interface useAttack {
  dungeonData: DungeonContextType | undefined;
  appData: AppContextType | undefined;
  attack: AttackObj;
  target: Enemy | Minion;
  isFocused: boolean;
}
export const useAttack = ({
  dungeonData,
  appData,
  attack,
  target,
  isFocused,
}: useAttack) => {
  if (!appData || !dungeonData)
    throw new Error("missing context in useAttack()");
  const { battleLogger } = dungeonData;
  const { playerState } = appData;
  if (target && playerState && isFocused) {
    const attackRes = playerState.doPhysicalAttack({
      chosenAttack: attack,
      enemyMaxHP: target.getMaxHealth(),
      enemyMaxSanity: target.getMaxSanity(),
      enemyDR: target.getDamageReduction(),
      enemyConditions: target.conditions,
    });
    if (attackRes !== "miss") {
      target.damageHealth(attackRes.damage);
      target.damageSanity(attackRes.sanityDamage);
      attackRes.debuffs?.forEach((effect) => target.addCondition(effect));
      let line = `You ${attack.name == "cast" ? "used " : ""}${toTitleCase(
        attack.name,
      )}${
        attack.name !== "cast"
          ? attack.name.charAt(attack.name.length - 1) == "e"
            ? "d"
            : "ed"
          : " on"
      } the ${toTitleCase(target.creatureSpecies)} for ${
        attackRes.damage
      } heath damage`;
      if (attackRes.sanityDamage) {
        line += ` and ${attackRes.sanityDamage} sanity damage`;
      }
      if (attackRes.debuffs) {
        attackRes.debuffs.forEach(
          (effect) => (line += ` and applied a ${effect.name} stack`),
        );
      }
      battleLogger(line);
    } else {
      battleLogger(
        `You ${attackRes}ed the ${toTitleCase(target.creatureSpecies)}`,
      );
    }

    if (target instanceof Enemy) {
      if (target.health <= 0 || (target.sanity && target.sanity <= 0)) {
        setTimeout(() => {
          enemyTurnCheck({
            appData,
            dungeonData,
          });
        }, 1000);
      } else {
        setTimeout(() => {
          playerMinionsTurn({ appData, dungeonData });
          setTimeout(
            () => {
              enemyTurnCheck({
                appData,
                dungeonData,
              });
            },
            1000 * playerState.minions.length + 1,
          );
        }, 1000);
      }
    } else {
      setTimeout(() => {
        playerMinionsTurn({ appData, dungeonData });
        setTimeout(() => {
          enemyTurnCheck({
            appData,
            dungeonData,
          });
        }, 1000 * playerState.minions.length);
      }, 1000);
    }
  }
};

export interface useSpell {
  dungeonData: DungeonContextType | undefined;
  appData: AppContextType | undefined;
  spell: SpellObj;
  target: Enemy | Minion;
  isFocused: boolean;
}
export const useSpell = ({
  dungeonData,
  appData,
  spell,
  target,
  isFocused,
}: useSpell) => {
  if (!appData || !dungeonData)
    throw new Error("missing context in useSpell()");
  const { battleLogger } = dungeonData;
  const { playerState } = appData;
  if (playerState && isFocused) {
    const spellRes = playerState.attemptSpellUse({
      chosenSpell: spell,
      enemyMaxHP: target.getMaxHealth(),
      enemyMaxSanity: target.getMaxSanity(),
    });
    if (spellRes == SpellError.NotEnoughMana) {
      // update to indicate error to user
      console.log("Not enough mana!");
      return;
    }
    if (spellRes == SpellError.ProficencyDeficit) {
      // update to indicate error to user
      console.log("Proficiency is too low!");
      return;
    }
    target.damageHealth(spellRes.damage);
    target.damageSanity(spellRes.sanityDamage);
    spellRes.debuffs?.forEach((debuff) => target.addCondition(debuff));
    let line = "";
    if (spell.effects.summon) {
      let summons = spell.effects.summon.map((summon) => toTitleCase(summon));
      if (summons.length > 1) {
        let last = summons[summons.length - 1];
        let others = summons.slice(0, summons.length - 1);
        line = `You summoned ${others.join(", ")} and ${toTitleCase(last)}`;
      } else if (summons.length === 1) {
        line = `You summoned ${summons[0]}`;
      }
    } else {
      line = `You ${toTitleCase(spell.name)}${
        spell.name.charAt(spell.name.length - 1) == "e" ? "d" : "ed"
      } the ${toTitleCase(target.creatureSpecies)} for ${
        spellRes.damage
      } heath damage`;
      if (spellRes.sanityDamage) {
        line += ` and ${spellRes.sanityDamage} sanity damage`;
      }
      if (spellRes.debuffs) {
        spellRes.debuffs.forEach(
          (effect) => (line += ` and applied a ${effect.name} stack`),
        );
      }
    }
    battleLogger(line);

    if (target instanceof Enemy) {
      if (target.health <= 0 || (target.sanity && target.sanity <= 0)) {
        setTimeout(() => {
          enemyTurnCheck({
            appData,
            dungeonData,
          });
        }, 1000);
      } else {
        setTimeout(() => {
          playerMinionsTurn({ appData, dungeonData });
          setTimeout(() => {
            enemyTurnCheck({
              appData,
              dungeonData,
            });
          }, 1000 * playerState.minions.length);
        }, 1000);
      }
    } else {
      setTimeout(() => {
        playerMinionsTurn({ appData, dungeonData });
        setTimeout(() => {
          enemyTurnCheck({
            appData,
            dungeonData,
          });
        }, 1000 * playerState.minions.length);
      }, 1000);
    }
  }
};

export interface pass {
  dungeonData: DungeonContextType | undefined;
  appData: AppContextType | undefined;
  isFocused: boolean;
}
export const pass = ({ appData, dungeonData, isFocused }: pass) => {
  if (!appData || !dungeonData) throw new Error("missing context in pass()");
  const { battleLogger } = dungeonData;
  const { playerState, enemyState } = appData;
  if (enemyState && playerState && isFocused) {
    playerState.pass();
    battleLogger("You passed!");
    playerMinionsTurn({ dungeonData, appData });
    setTimeout(() => {
      enemyTurnCheck({
        appData,
        dungeonData,
      });
    }, 1000 * playerState.minions.length);
  }
};

export function playerMinionsTurn({ dungeonData, appData }: contextData) {
  if (!appData || !dungeonData)
    throw new Error("missing context in playerMinionsTurn()");
  const { battleLogger } = dungeonData;
  const { playerState, enemyState } = appData;
  if (enemyState && playerState) {
    const suppliedMinions = playerState.minions;
    for (
      let i = 0;
      i < suppliedMinions.length &&
      enemyState.equals(enemyState.id) &&
      enemyState.health > 0;
      i++
    ) {
      setTimeout(() => {
        const res = suppliedMinions[i].takeTurn({
          defenderMaxHealth: enemyState.healthMax,
          defenderMaxSanity: enemyState.healthMax,
          defenderDR: enemyState.getDamageReduction(),
          defenderConditions: enemyState.conditions,
        });
        if (res == "miss") {
          battleLogger(
            `${playerState.getFullName()}'s ${toTitleCase(
              suppliedMinions[i].creatureSpecies,
            )} missed!`,
          );
        } else if (res == "stun") {
          battleLogger(
            `${playerState.getFullName()}'s ${toTitleCase(
              suppliedMinions[i].creatureSpecies,
            )} was stunned!`,
          );
        } else if (res == "pass") {
          battleLogger(
            `${playerState.getFullName()}'s ${toTitleCase(
              suppliedMinions[i].creatureSpecies,
            )} passed!`,
          );
        } else {
          let str = `${playerState.getFullName()}'s ${toTitleCase(
            suppliedMinions[i].creatureSpecies,
          )} used ${toTitleCase(res.name)} dealing ${res.damage} damage`;
          enemyState.damageHealth(res.damage);
          if (res.heal && res.heal > 0) {
            str += ` and healed for ${res.heal} damage`;
          }
          if (res.sanityDamage && res.sanityDamage > 0) {
            str += ` and ${res.sanityDamage} sanity damage`;
            enemyState.damageSanity(res.sanityDamage);
          }
          if (res.debuffs) {
            res.debuffs.forEach((effect) => {
              str += ` and applied a ${effect.name} stack`;
              enemyState.addCondition(effect);
            });
          }
          battleLogger(str);
        }
        if (suppliedMinions[i].turnsLeftAlive <= 0) {
          playerState.removeMinion(suppliedMinions[i]);
        }
      }, 1000 * i);
    }
  }
}

//old function
//interface playerMinionsTurnBackup {
//suppliedMinions: Minion[];
//startOfTurnEnemyID: string;
//dungeonData: DungeonContextType | undefined;
//appData: AppContextType | undefined;
//}
//function playerMinionsTurnBackup({
//suppliedMinions,
//startOfTurnEnemyID,
//dungeonData,
//appData,
//}: playerMinionsTurn) {
//if (enemyState && playerState) {
//for (
//let i = 0;
//i < suppliedMinions.length &&
//enemyState.equals(startOfTurnEnemyID) &&
//enemyState.health > 0;
//i++
//) {
//setTimeout(() => {
//const res = suppliedMinions[i].takeTurn({
//defenderMaxHealth: enemyState.healthMax,
//defenderMaxSanity: enemyState.healthMax,
//defenderDR: enemyState.getDamageReduction(),
//defenderConditions: enemyState.conditions,
//});
//if (res == "miss") {
//battleLogger(
//`${playerState.getFullName()}'s ${toTitleCase(
//suppliedMinions[i].creatureSpecies,
//)} missed!`,
//);
//} else if (res == "stun") {
//battleLogger(
//`${playerState.getFullName()}'s ${toTitleCase(
//suppliedMinions[i].creatureSpecies,
//)} was stunned!`,
//);
//} else if (res == "pass") {
//battleLogger(
//`${playerState.getFullName()}'s ${toTitleCase(
//suppliedMinions[i].creatureSpecies,
//)} passed!`,
//);
//} else {
//let str = `${playerState.getFullName()}'s ${toTitleCase(
//suppliedMinions[i].creatureSpecies,
//)} used ${toTitleCase(res.name)} dealing ${res.damage} damage`;
//enemyState.damageHealth(res.damage);
//if (res.heal && res.heal > 0) {
//str += ` and healed for ${res.heal} damage`;
//}
//if (res.sanityDamage && res.sanityDamage > 0) {
//str += ` and ${res.sanityDamage} sanity damage`;
//enemyState.damageSanity(res.sanityDamage);
//}
//if (res.debuffs) {
//res.debuffs.forEach((effect) => {
//str += ` and applied a ${effect.name} stack`;
//enemyState.addCondition(effect);
//});
//}
//battleLogger(str);
//}
//if (suppliedMinions[i].turnsLeftAlive <= 0) {
//playerState.removeMinion(suppliedMinions[i]);
//}
//}, 1000 * i);
//}
//}
//}
