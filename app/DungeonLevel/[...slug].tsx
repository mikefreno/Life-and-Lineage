import { View, Text } from "../../components/Themed";
import { Animated, Image, View as NonThemedView, Platform } from "react-native";
import { useContext, useEffect, useState } from "react";
import { EnemyImage } from "../../components/EnemyImage";
import { Pressable, Modal as NativeModal } from "react-native";
import { Stack, useLocalSearchParams, router } from "expo-router";
import BattleTab from "../../components/BattleTab";
import { toTitleCase } from "../../utility/functions/misc/words";
import { enemyGenerator } from "../../utility/enemy";
import PlayerStatus from "../../components/PlayerStatus";
import ProgressBar from "../../components/ProgressBar";
import { DungeonInstance, DungeonLevel } from "../../classes/dungeon";
import { Item } from "../../classes/item";
import Coins from "../../assets/icons/CoinsIcon";
import { useIsFocused } from "@react-navigation/native";
import {
  GameContext,
  LogsContext,
  EnemyContext,
  PlayerCharacterContext,
} from "../_layout";
import { observer } from "mobx-react-lite";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import FadeOutText from "../../components/FadeOutText";
import { useVibration } from "../../utility/customHooks";
import { EnemyHealingAnimationBox } from "../../components/EnemyHealingAnimationBox";
import { Minion, Enemy } from "../../classes/creatures";
import SackIcon from "../../assets/icons/SackIcon";
import TutorialModal from "../../components/TutorialModal";
import GenericModal from "../../components/GenericModal";
import { AttackObj } from "../../utility/types";
import { flipCoin } from "../../utility/functions/roll";
import GenericStrikeAround from "../../components/GenericStrikeAround";
import GenericFlatButton from "../../components/GenericFlatButton";

const DungeonLevelScreen = observer(() => {
  const { colorScheme } = useColorScheme();
  const playerCharacterContext = useContext(PlayerCharacterContext);
  const gameContext = useContext(GameContext);
  const enemyContext = useContext(EnemyContext);
  const logsContext = useContext(LogsContext);
  if (!playerCharacterContext || !gameContext || !enemyContext || !logsContext)
    throw new Error("missing context");
  const { playerState } = playerCharacterContext;
  const { gameState } = gameContext;
  const { enemyState, setEnemy } = enemyContext;
  const { logsState } = logsContext;

  const { slug } = useLocalSearchParams();
  const [fightingBoss, setFightingBoss] = useState<boolean>(false);
  const [firstLoad, setFirstLoad] = useState<boolean>(true);
  const [instanceName, setInstanceName] = useState<string>(slug[0]);
  const [level, setLevel] = useState<number>(Number(slug[1]));
  const [battleTab, setBattleTab] = useState<"attacks" | "equipment" | "log">(
    "log",
  );
  const [thisInstance, setThisInstance] = useState<DungeonInstance>();
  const [thisDungeon, setThisDungeon] = useState<DungeonLevel>();
  const [droppedItems, setDroppedItems] = useState<{
    itemDrops: Item[];
    gold: number;
  } | null>(null);
  const [enemyAttacked, setEnemyAttacked] = useState<boolean>(false);
  const [leftBehindDrops, setLeftBehindDrops] = useState<Item[]>([]);
  const [showLeftBehindItemsScreen, setShowLeftBehindItemsScreen] =
    useState<boolean>(false);
  const [inventoryFullNotifier, setInventoryFullNotifier] =
    useState<boolean>(false);
  const [fleeModalShowing, setFleeModalShowing] = useState<boolean>(false);
  const [fleeRollFailure, setFleeRollFailure] = useState<boolean>(false);
  const [showTargetSelection, setShowTargetSelection] = useState<{
    showing: boolean;
    chosenAttack: any;
    spell: boolean | null;
  }>({ showing: false, chosenAttack: null, spell: null });

  const [enemyHealthRecord, setEnemyHealthRecord] = useState<
    number | undefined
  >(enemyState?.health);
  const [enemyHealthDiff, setEnemyHealthDiff] = useState<number>(0);
  const [showingEnemyHealthChange, setShowingEnemyHealthChange] =
    useState<boolean>(false);
  const [animationCycler, setAnimationCycler] = useState<number>(0);
  const [attackAnimationOnGoing, setAttackAnimationOnGoing] =
    useState<boolean>(false);

  const enemyAttackAnimationValue = useState(new Animated.Value(0))[0];
  const enemyDamagedAnimationValue = useState(new Animated.Value(1))[0];

  const [enemyTextString, setEnemyTextString] = useState<string>();
  const enemyTextFadeAnimation = useState(new Animated.Value(1))[0];
  const enemyTextTranslateAnimation = useState(new Animated.Value(0))[0];

  const [enemyAttackDummy, setEnemyAttackDummy] = useState<number>(0);
  const [enemyHealDummy, setEnemyHealDummy] = useState<number>(0);
  const [enemyTextDummy, setEnemyTextDummy] = useState<number>(0);

  const isFocused = useIsFocused();
  const vibration = useVibration();

  if (!playerState || !gameState) {
    throw new Error("No player character or game data on dungeon level");
  }

  //------------dungeon/Enemy state setting---------//
  useEffect(() => {
    setInstanceName(slug[0]);
    if (slug[0] !== "Activities" && slug[0] !== "Personal") {
      setLevel(Number(slug[1]));
    } else {
      setEnemyAttacked(true);
      setFirstLoad(false);
    }
  }, [slug]);

  useEffect(() => {
    if (!fightingBoss && !enemyState) {
      getEnemy();
    }
  }, [enemyState]);

  useEffect(() => {
    if (
      enemyState &&
      enemyHealthRecord &&
      enemyState.health != enemyHealthRecord
    ) {
      setEnemyHealthDiff(enemyState.health - enemyHealthRecord);
      setAnimationCycler(animationCycler + 1);
      setShowingEnemyHealthChange(true);
    } else {
      setEnemyHealthDiff(0);
      setShowingEnemyHealthChange(false);
    }
    setEnemyHealthRecord(enemyState?.health);
  }, [enemyState?.health]);

  useEffect(() => {
    if (slug[0] == "Activities" || slug[0] == "Personal") {
      const tempDungeon = new DungeonLevel({
        level: 0,
        bosses: [],
        stepsBeforeBoss: 0,
        bossDefeated: true,
      });
      const tempInstance = new DungeonInstance({
        name: slug[1],
        levels: [tempDungeon],
      });
      setThisDungeon(tempDungeon);
      setThisInstance(tempInstance);
    } else {
      setThisDungeon(gameState.getDungeon(instanceName, level));
      setThisInstance(gameState.getInstance(instanceName));
    }
  }, [level, instanceName]);

  //-----------animations---------//
  useEffect(() => {
    if (!firstLoad) {
      Animated.sequence([
        Animated.timing(enemyAttackAnimationValue, {
          toValue: -50,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(enemyAttackAnimationValue, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [enemyAttackDummy]);

  useEffect(() => {
    if (enemyHealthDiff < 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(enemyDamagedAnimationValue, {
            toValue: 0.5,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(enemyDamagedAnimationValue, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
        { iterations: 2 },
      ).start(() => {
        setTimeout(() => {
          setShowingEnemyHealthChange(false);
          setEnemyHealthDiff(0);
        }, 500);
      });
    }
  }, [enemyHealthDiff]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(enemyTextFadeAnimation, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(enemyTextTranslateAnimation, {
        toValue: -100,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start(() => {
      enemyTextFadeAnimation.setValue(1);
      enemyTextTranslateAnimation.setValue(0);
      setEnemyTextString(undefined);
    });
  }, [enemyTextDummy]);

  //------------Enemy combat functions------------//
  const enemyTurnCheck = () => {
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
            thisDungeon.setBossDefeated();
            gameState.openNextDungeonLevel(thisInstance!.name);
            playerState.bossDefeated();
          }
          setEnemy(null);
          gameState.gameTick(playerState);
        }
      } else {
        enemyTurn();
        setTimeout(() => setAttackAnimationOnGoing(false), 1000);
      }
    }
  };

  const enemyTurn = () => {
    if (enemyState) {
      setEnemyAttacked(true);
      const enemyAttackRes = enemyState.takeTurn({
        defenderMaxHealth: playerState.getNonBuffedMaxHealth(),
        defenderMaxSanity: playerState.getNonBuffedMaxSanity(),
        defenderDR: playerState.getDamageReduction(),
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
        enemyMinionsTurn(enemyState.minions);
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

  function EnemyHealthChangePopUp() {
    return (
      <NonThemedView className="h-6">
        <FadeOutText
          className={"text-red-400"}
          text={`${
            enemyHealthDiff > 0 ? "+" : ""
          }${enemyHealthDiff.toString()}`}
          animationCycler={animationCycler}
        />
      </NonThemedView>
    );
  }

  function EnemyConditionRender() {
    if (enemyState) {
      let simplifiedConditionsMap: Map<
        string,
        {
          name: string;
          icon: any;
          count: number;
        }
      > = new Map();

      enemyState.conditions.forEach((condition) => {
        if (simplifiedConditionsMap.has(condition.name)) {
          let existingCondition = simplifiedConditionsMap.get(condition.name)!;
          existingCondition.count += 1;
          simplifiedConditionsMap.set(condition.name, existingCondition);
        } else {
          simplifiedConditionsMap.set(condition.name, {
            name: condition.name,
            icon: condition.getConditionIcon(),
            count: 1,
          });
        }
      });
      let simplifiedConditions: {
        name: string;
        icon: any;
        count: number;
      }[] = Array.from(simplifiedConditionsMap.values());

      return (
        <NonThemedView className="flex h-8 flex-row">
          {simplifiedConditions.map((cond) => (
            <View key={cond.name} className="mx-2 flex align-middle">
              <NonThemedView className="mx-auto rounded-md bg-[rgba(0,0,0,0.4)] p-0.5 dark:bg-[rgba(255,255,255,0.4)]">
                <Image source={cond.icon} style={{ width: 22, height: 24 }} />
              </NonThemedView>
              <Text className="text-sm">
                {toTitleCase(cond.name)} x {cond.count}
              </Text>
            </View>
          ))}
        </NonThemedView>
      );
    }
  }
  //-----------minion loading-------//
  function getEnemy() {
    const enemy = enemyGenerator(instanceName, level);
    setTimeout(
      () => {
        setEnemy(enemy);
        setEnemyAttacked(false);
        battleLogger(`You found a ${toTitleCase(enemy.creatureSpecies)}!`);
        setAttackAnimationOnGoing(false);
        if (firstLoad) {
          setFirstLoad(false);
        }
      },
      firstLoad ? 0 : 500,
    );
  }

  const loadBoss = () => {
    setFightingBoss(true);
    setEnemy(null);
    setTimeout(() => {
      if (thisDungeon && thisInstance && playerState) {
        const boss = thisDungeon.getBoss(thisInstance.name)[0];
        setEnemy(boss);
        battleLogger(`You found the boss!`);
      }
    }, 250);
  };

  //------------player combat functions------------//
  const useAttack = (attack: AttackObj, target: Enemy | Minion) => {
    if (target && playerState && isFocused) {
      const attackRes = playerState.doPhysicalAttack({
        chosenAttack: attack,
        enemyMaxHP: target.getMaxHealth(),
        enemyMaxSanity: target.getMaxSanity(),
        enemyDR: target.getDamageReduction(),
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
            enemyTurnCheck();
          }, 1000);
        } else {
          setTimeout(() => {
            playerMinionsTurn(playerState.minions, target.id);
            setTimeout(
              () => {
                enemyTurnCheck();
              },
              1000 * playerState.minions.length + 1,
            );
          }, 1000);
        }
      } else {
        setTimeout(() => {
          playerMinionsTurn(playerState.minions, target.id);
          setTimeout(() => {
            enemyTurnCheck();
          }, 1000 * playerState.minions.length);
        }, 1000);
      }
    }
  };

  const useSpell = (
    spell: {
      name: string;
      element: string;
      proficiencyNeeded: number;
      manaCost: number;
      effects: {
        damage: number | null;
        buffs: string[] | null;
        debuffs: { name: string; chance: number }[] | null;
        summon?: string[];
        selfDamage?: number;
      };
    },
    target: Enemy | Minion,
  ) => {
    if (playerState && isFocused) {
      const spellRes = playerState.useSpell({
        chosenSpell: spell,
        enemyMaxHP: target.getMaxHealth(),
        enemyMaxSanity: target.getMaxSanity(),
      });
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
            enemyTurnCheck();
          }, 1000);
        } else {
          setTimeout(() => {
            playerMinionsTurn(playerState.minions, target.id);
            setTimeout(() => {
              enemyTurnCheck();
            }, 1000 * playerState.minions.length);
          }, 1000);
        }
      } else {
        setTimeout(() => {
          playerMinionsTurn(playerState.minions, target.id);
          setTimeout(() => {
            enemyTurnCheck();
          }, 1000 * playerState.minions.length);
        }, 1000);
      }
    }
  };

  const pass = () => {
    if (enemyState && playerState && isFocused) {
      playerState.pass();
      battleLogger("You passed!");
      playerMinionsTurn(playerState.minions, enemyState.id);
      setTimeout(() => {
        enemyTurnCheck();
      }, 1000 * playerState.minions.length);
    }
  };

  const flee = () => {
    if (playerState && enemyState) {
      const roll = flipCoin();
      const secondaryRoll = flipCoin();
      if (
        playerState &&
        ((roll == "Heads" &&
          (slug[0] !== "Activities" || secondaryRoll == "Heads")) ||
          enemyState?.creatureSpecies == "training dummy" ||
          !enemyAttacked)
      ) {
        vibration({ style: "light" });
        setFleeRollFailure(false);
        setFleeModalShowing(false);
        setTimeout(() => {
          playerState.clearMinions();
          while (router.canGoBack()) {
            router.back();
          }
          if (slug[0] == "Activities") {
            router.replace("/shops");
          } else {
            router.replace("/dungeon");
          }
          playerState.setInDungeon({ state: false });
          setEnemy(null);
          playerState.setSavedEnemy(null);
          if (slug[0] == "Activities") {
            router.push("/Activities");
          }
        }, 200);
      } else {
        setFleeRollFailure(true);
        vibration({ style: "error" });
        battleLogger("You failed to flee!");
        playerMinionsTurn(playerState.minions, enemyState.id);
        setTimeout(() => {
          enemyTurnCheck();
        }, 1000 * playerState.minions.length);
      }
    }
  };

  //------------minion functions------------//
  function playerMinionsTurn(
    suppliedMinions: Minion[],
    startOfTurnEnemyID: string,
  ) {
    if (enemyState && playerState) {
      for (
        let i = 0;
        i < suppliedMinions.length &&
        enemyState.equals(startOfTurnEnemyID) &&
        enemyState.health > 0;
        i++
      ) {
        setTimeout(() => {
          const res = suppliedMinions[i].takeTurn({
            defenderMaxHealth: enemyState.healthMax,
            defenderMaxSanity: enemyState.healthMax,
            defenderDR: enemyState.getDamageReduction(),
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

  function enemyMinionsTurn(suppliedMinions: Minion[]) {
    if (enemyState && playerState) {
      for (let i = 0; i < suppliedMinions.length; i++) {
        setTimeout(() => {
          const res = suppliedMinions[i].takeTurn({
            defenderMaxHealth: playerState.getNonBuffedMaxHealth(),
            defenderMaxSanity: playerState.getNonBuffedMaxSanity(),
            defenderDR: playerState.getDamageReduction(),
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
            let str = `${toTitleCase(
              enemyState.creatureSpecies,
            )}'s ${toTitleCase(
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

  //--------misc functions------//
  function battleLogger(whatHappened: string) {
    const timeOfLog = new Date().toLocaleTimeString();
    const log = `${timeOfLog}: ${whatHappened}`;
    logsState.push(log);
  }

  function takeItem(item: Item) {
    if (playerState && droppedItems) {
      if (playerState.inventory.length < 24) {
        playerState.addToInventory(item);
        setDroppedItems((prevState) => {
          const updatedDrops = prevState!.itemDrops.filter(
            (itemDrop) => !itemDrop.equals(item),
          );
          if (updatedDrops.length == 0) {
            return null;
          }
          return {
            ...prevState,
            gold: prevState!.gold,
            itemDrops: updatedDrops,
          };
        });
      } else {
        setInventoryFullNotifier(true);
      }
    }
  }

  function addItemToPouch(item: Item) {
    setLeftBehindDrops((prev) => [...prev, item]);
  }

  function takeItemFromPouch(item: Item) {
    if (playerState) {
      if (playerState.inventory.length < 24) {
        playerState.addToInventory(item);
        setLeftBehindDrops((prev) =>
          prev.filter((dropItem) => !dropItem.equals(item)),
        );
      } else {
        setInventoryFullNotifier(true);
      }
    }
  }

  function takeAllItems() {
    if (playerState && droppedItems) {
      const availableSpace = 24 - playerState.inventory.length;
      if (availableSpace === 0) {
        setInventoryFullNotifier(true);
        return;
      }
      droppedItems.itemDrops
        .slice(0, availableSpace)
        .forEach((item) => playerState.addToInventory(item));
      setDroppedItems((prevState) => {
        const remainingDrops = prevState!.itemDrops.slice(availableSpace);
        if (remainingDrops.length > 0) setInventoryFullNotifier(true);
        return remainingDrops.length > 0
          ? {
              ...prevState,
              gold: prevState!.gold,
              itemDrops: remainingDrops,
            }
          : null;
      });
    }
  }

  function takeAllItemsFromPouch() {
    if (playerState) {
      const availableSpace = 24 - playerState.inventory.length;
      if (availableSpace === 0) {
        setInventoryFullNotifier(true);
        return;
      }
      leftBehindDrops
        .slice(0, availableSpace)
        .forEach((item) => playerState.addToInventory(item));
      setLeftBehindDrops((prev) => {
        const remainingItems = prev.slice(availableSpace);
        if (remainingItems.length > 0) setInventoryFullNotifier(true);
        return remainingItems;
      });
    }
  }

  function closeImmediateItemDrops() {
    if (droppedItems && droppedItems.itemDrops.length > 0) {
      setLeftBehindDrops((prev) => [...prev, ...droppedItems.itemDrops]);
    }
    setDroppedItems(null);
  }

  useEffect(() => {
    if (inventoryFullNotifier) {
      setTimeout(() => setInventoryFullNotifier(false), 2000);
    }
  }, [inventoryFullNotifier]);

  useEffect(() => {
    setInventoryFullNotifier(false);
  }, [showLeftBehindItemsScreen]);

  //-----------tutorial---------//
  const [showDungeonInteriorTutorial, setShowDungeonInteriorTutorial] =
    useState<boolean>(
      (gameState && !gameState.getTutorialState("dungeonInterior")) ?? false,
    );

  useEffect(() => {
    if (!showDungeonInteriorTutorial && gameState) {
      gameState.updateTutorialState("dungeonInterior", true);
    }
  }, [showDungeonInteriorTutorial]);

  //-----------render---------//
  function targetSelectionRender() {
    if (enemyState) {
      let targets: (Enemy | Minion)[] = [];
      targets.push(enemyState);
      enemyState.minions.forEach((minion) => {
        targets.push(minion);
      });

      return (
        <View>
          {targets.map((target) => (
            <Pressable
              key={target.id}
              onPress={() => {
                const attack = { ...showTargetSelection.chosenAttack };
                const spell = showTargetSelection.spell;
                setShowTargetSelection({
                  showing: false,
                  chosenAttack: null,
                  spell: null,
                });
                if (spell) {
                  useSpell(attack, target);
                } else {
                  useAttack(attack, target);
                }
              }}
              className="m-4 rounded-lg border border-zinc-400 px-4 py-2 shadow-lg active:scale-95 active:opacity-50 dark:border-zinc-700"
            >
              <NonThemedView className="flex flex-row justify-evenly">
                <NonThemedView className="my-auto">
                  <EnemyImage
                    creatureSpecies={target.creatureSpecies}
                    widthOverride={60}
                    heightOverride={60}
                  />
                </NonThemedView>
                <NonThemedView className="my-auto flex w-1/2">
                  <NonThemedView className="">
                    <Text className="text-center">
                      {toTitleCase(target.creatureSpecies)}
                    </Text>
                    <ProgressBar
                      filledColor="#ef4444"
                      unfilledColor="#fee2e2"
                      value={target.health}
                      maxValue={target.healthMax}
                      displayNumber={false}
                    />
                  </NonThemedView>
                </NonThemedView>
              </NonThemedView>
            </Pressable>
          ))}
        </View>
      );
    }
  }

  while (!enemyState) {
    return (
      <>
        <Stack.Screen
          options={{
            animationTypeForReplace: "push",
            title:
              level == 0 || slug[0] == "Activities"
                ? slug[0] == "Activities"
                  ? slug[1]
                  : "Training Grounds"
                : `${toTitleCase(thisInstance?.name as string)} Level ${level}`,

            headerLeft: () => (
              <Pressable
                onPress={() => {
                  setFleeRollFailure(false);
                  setFleeModalShowing(true);
                }}
              >
                {({ pressed }) => (
                  <MaterialCommunityIcons
                    name="run-fast"
                    size={28}
                    color={colorScheme == "light" ? "#18181b" : "#fafafa"}
                    style={{
                      opacity: pressed ? 0.5 : 1,
                      marginRight: Platform.OS == "android" ? 8 : 0,
                    }}
                  />
                )}
              </Pressable>
            ),
          }}
        />
        <View className="flex-1 px-2" style={{ paddingBottom: 88 }}>
          <NonThemedView className="flex h-[40%]" />
          {thisDungeon?.stepsBeforeBoss !== 0 && !fightingBoss ? (
            <View className="flex flex-row justify-evenly border-b border-zinc-900 pb-1 dark:border-zinc-50">
              <Text className="my-auto text-xl">
                {`Steps Completed: ${thisDungeon?.step} / ${thisDungeon?.stepsBeforeBoss}`}
              </Text>
              {thisDungeon &&
              thisDungeon?.step >= thisDungeon.stepsBeforeBoss &&
              !thisDungeon.bossDefeated ? (
                <Pressable
                  onPress={loadBoss}
                  className="my-auto rounded bg-red-500 px-4 py-2 active:scale-95 active:opacity-50"
                >
                  <Text style={{ color: "white" }}>Fight Boss</Text>
                </Pressable>
              ) : null}
            </View>
          ) : fightingBoss ? (
            <View className="">
              <Text className="my-auto text-center text-xl">
                Fighting Boss!
              </Text>
            </View>
          ) : (
            <View className="flex flex-row justify-evenly border-b border-zinc-900 pb-1 dark:border-zinc-50" />
          )}
          <Pressable
            className="absolute ml-4 mt-4"
            onPress={() => setShowLeftBehindItemsScreen(true)}
          >
            <SackIcon height={32} width={32} />
          </Pressable>
          <View className="flex-1 justify-between">
            <View className="flex-1">
              <BattleTab
                useAttack={useAttack}
                battleTab={battleTab}
                useSpell={useSpell}
                pass={pass}
                setAttackAnimationOnGoing={setAttackAnimationOnGoing}
                attackAnimationOnGoing={attackAnimationOnGoing}
                setShowTargetSelection={setShowTargetSelection}
                addItemToPouch={addItemToPouch}
              />
            </View>
            <View className="flex w-full flex-row justify-around">
              <Pressable
                className={`py-4 w-32 mx-2 rounded ${
                  battleTab == "attacks"
                    ? "bg-zinc-100 dark:bg-zinc-800"
                    : "active:bg-zinc-200 dark:active:bg-zinc-700"
                }`}
                onPress={() => {
                  vibration({ style: "light" });
                  setBattleTab("attacks");
                }}
              >
                <Text className="text-center text-xl">Attacks</Text>
              </Pressable>
              <Pressable
                className={`py-4 w-32 mx-2 rounded ${
                  battleTab == "equipment"
                    ? "border-zinc-200 bg-zinc-100 dark:border-zinc-900 dark:bg-zinc-800"
                    : "active:bg-zinc-200 dark:active:bg-zinc-700"
                }`}
                onPress={() => {
                  vibration({ style: "light" });
                  setBattleTab("equipment");
                }}
              >
                <Text className="text-center text-xl">Equipment</Text>
              </Pressable>
              <Pressable
                className={`py-4 w-32 mx-2 rounded align ${
                  battleTab == "log"
                    ? "bg-zinc-100 dark:bg-zinc-800"
                    : "active:bg-zinc-200 dark:active:bg-zinc-700"
                }`}
                onPress={() => {
                  vibration({ style: "light" });
                  setBattleTab("log");
                }}
              >
                <Text className="text-center text-xl">Log</Text>
              </Pressable>
            </View>
          </View>
        </View>
        <NonThemedView className="absolute z-50 w-full" style={{ bottom: 85 }}>
          <PlayerStatus hideGold />
        </NonThemedView>
      </>
    );
  }

  if (thisDungeon && playerState) {
    return (
      <>
        <Stack.Screen
          options={{
            headerLeft: () => (
              <Pressable
                onPress={() => {
                  setFleeRollFailure(false);
                  setFleeModalShowing(true);
                }}
              >
                {({ pressed }) => (
                  <MaterialCommunityIcons
                    name="run-fast"
                    size={28}
                    color={colorScheme == "light" ? "#18181b" : "#fafafa"}
                    style={{
                      opacity: pressed ? 0.5 : 1,
                      marginRight: Platform.OS == "android" ? 8 : 0,
                    }}
                  />
                )}
              </Pressable>
            ),
            title:
              level == 0 || slug[0] == "Activities"
                ? slug[0] == "Activities"
                  ? slug[1]
                  : "Training Grounds"
                : `${toTitleCase(thisInstance?.name as string)} Level ${level}`,
          }}
        />
        <TutorialModal
          isVisibleCondition={
            (showDungeonInteriorTutorial && gameState?.tutorialsEnabled) ??
            false
          }
          backFunction={() => setShowDungeonInteriorTutorial(false)}
          onCloseFunction={() => setShowDungeonInteriorTutorial(false)}
          pageOne={{
            title: "Watch Your Health",
            body: "Your situation can change rapidly.",
          }}
          pageTwo={{
            title: "Advance by killing the boss.",
            body: "The first boss becomes availible after 10 Enemys defeated for the first dungeon.",
          }}
          pageThree={{
            title: "Good Luck.",
            body: "And remember fleeing (top left) can save you.",
          }}
        />
        {Platform.OS == "ios" ? (
          <NonThemedView>
            <NativeModal
              animationType="slide"
              transparent={true}
              visible={fleeModalShowing}
              onRequestClose={() => setFleeModalShowing(false)}
            >
              <Pressable
                onPress={() => setFleeModalShowing(false)}
                className="-mt-[100vh] h-[200vh] w-screen items-center justify-center bg-[rgba(0,0,0,.2)]"
              >
                <Pressable
                  onPress={(e) => e.stopPropagation()}
                  className="mt-[100vh] w-full py-4"
                >
                  <View
                    className="mx-auto w-2/3 rounded-xl bg-zinc-50 px-6 py-4 dark:border dark:border-zinc-500 dark:bg-zinc-700"
                    style={{
                      shadowColor: "#000",
                      shadowOffset: {
                        width: 0,
                        height: 2,
                      },
                      shadowOpacity: 0.25,
                      shadowRadius: 5,
                    }}
                  >
                    <View className="flex items-center justify-evenly">
                      <Text className="text-center text-lg">
                        Attempt to Flee?
                      </Text>
                      {playerState.isStunned() ? (
                        <Text className="italic" style={{ color: "#ef4444" }}>
                          You are stunned!
                        </Text>
                      ) : null}
                      <View className="flex w-full flex-row justify-evenly pt-8">
                        <GenericFlatButton
                          onPressFunction={flee}
                          text={"Run!"}
                          disabledCondition={
                            attackAnimationOnGoing || playerState.isStunned()
                          }
                        />
                        <GenericFlatButton
                          onPressFunction={() => {
                            setFleeModalShowing(false);
                            setFleeRollFailure(false);
                          }}
                          text={"Cancel"}
                        />
                      </View>
                      {fleeRollFailure ? (
                        <Text
                          className="text-center"
                          style={{ color: "#ef4444" }}
                        >
                          Roll Failure!
                        </Text>
                      ) : null}
                    </View>
                  </View>
                </Pressable>
              </Pressable>
            </NativeModal>
          </NonThemedView>
        ) : (
          <GenericModal
            isVisibleCondition={fleeModalShowing}
            backFunction={() => setFleeModalShowing(false)}
          >
            <View className="flex items-center justify-evenly">
              <Text className="text-center text-lg">Attempt to Flee?</Text>
              <View className="flex w-full flex-row justify-evenly">
                <Pressable
                  disabled={attackAnimationOnGoing}
                  onPress={flee}
                  className="mb-4 mt-8 rounded-xl border border-zinc-900 px-4 py-2 active:scale-95 active:opacity-50 dark:border-zinc-50"
                >
                  <Text className="text-lg">Run!</Text>
                </Pressable>
                <Pressable
                  className="mb-4 mt-8 rounded-xl border border-zinc-900 px-4 py-2 active:scale-95 active:opacity-50 dark:border-zinc-50"
                  onPress={(e) => {
                    e.stopPropagation();
                    setFleeModalShowing(false);
                    setFleeRollFailure(false);
                  }}
                >
                  <Text className="text-lg">Cancel</Text>
                </Pressable>
              </View>
              {fleeRollFailure ? (
                <Text className="text-center" style={{ color: "#ef4444" }}>
                  Roll Failure!
                </Text>
              ) : null}
            </View>
          </GenericModal>
        )}
        <GenericModal
          isVisibleCondition={droppedItems ? true : false}
          backFunction={() => {
            if (slug[0] == "Activities") {
              while (router.canGoBack()) {
                router.back();
              }
              router.replace("/shops");
              router.push("/Activities");
            } else {
              closeImmediateItemDrops();
            }
          }}
        >
          <>
            <NonThemedView className="mt-4 flex flex-row justify-center">
              <Text className="italic">You picked up {droppedItems?.gold}</Text>
              <Coins width={16} height={16} style={{ marginLeft: 6 }} />
            </NonThemedView>
            <Text
              className="text-center text-lg"
              style={{
                color: "#ef4444",
                opacity: inventoryFullNotifier ? 1 : 0,
              }}
            >
              Inventory is full!
            </Text>
            {droppedItems?.itemDrops.map((item) => (
              <NonThemedView
                key={item.id}
                className="mt-2 flex flex-row justify-between"
              >
                <NonThemedView className="flex flex-row">
                  <Image source={item.getItemIcon()} />
                  <Text className="my-auto ml-2">{toTitleCase(item.name)}</Text>
                </NonThemedView>
                <Pressable
                  onPress={() => {
                    takeItem(item);
                  }}
                  className="rounded-xl border border-zinc-900 px-4 py-2 active:scale-95 active:opacity-50 dark:border-zinc-50"
                >
                  <Text>Take</Text>
                </Pressable>
              </NonThemedView>
            ))}
            {droppedItems && droppedItems.itemDrops.length > 0 ? (
              <Pressable
                className="mx-auto mt-4 rounded-xl border border-zinc-900 px-4 py-2 active:scale-95 active:opacity-50 dark:border-zinc-50"
                onPress={() => {
                  takeAllItems();
                }}
              >
                <Text>Take All</Text>
              </Pressable>
            ) : null}
            <Pressable
              className="mx-auto my-4 rounded-xl border border-zinc-900 px-4 py-2 active:scale-95 active:opacity-50 dark:border-zinc-50"
              onPress={() => {
                if (slug[0] == "Activities") {
                  while (router.canGoBack()) {
                    router.back();
                  }
                  router.replace("/shops");
                  router.push("/Activities");
                } else {
                  closeImmediateItemDrops();
                }
              }}
            >
              <Text>Done Looting</Text>
            </Pressable>
          </>
        </GenericModal>
        <GenericModal
          isVisibleCondition={showLeftBehindItemsScreen}
          backFunction={() => setShowLeftBehindItemsScreen(false)}
        >
          <>
            <Text
              className="text-center text-lg"
              style={{
                color: "#ef4444",
                opacity: inventoryFullNotifier ? 1 : 0,
              }}
            >
              Inventory is full!
            </Text>
            {leftBehindDrops.length > 0 ? (
              <>
                {leftBehindDrops.map((item) => (
                  <NonThemedView
                    key={item.id}
                    className="my-2 flex flex-row justify-between"
                  >
                    <NonThemedView className="flex flex-row">
                      <Image source={item.getItemIcon()} />
                      <Text className="my-auto">{item.name}</Text>
                    </NonThemedView>
                    <Pressable
                      onPress={() => {
                        takeItemFromPouch(item);
                      }}
                      className="rounded-xl border border-zinc-900 px-4 py-2 active:scale-95 active:opacity-50 dark:border-zinc-50"
                    >
                      <Text>Take</Text>
                    </Pressable>
                  </NonThemedView>
                ))}
                <Pressable
                  className="mx-auto mt-4 rounded-xl border border-zinc-900 px-4 py-2 active:scale-95 active:opacity-50 dark:border-zinc-50"
                  onPress={takeAllItemsFromPouch}
                >
                  <Text>Take All</Text>
                </Pressable>
              </>
            ) : (
              <View>
                <Text className="text-center italic">
                  You find no items on the ground
                </Text>
              </View>
            )}
            <Pressable
              className="mx-auto mt-4 rounded-xl border border-zinc-900 px-4 py-2 active:scale-95 active:opacity-50 dark:border-zinc-50"
              onPress={() => setShowLeftBehindItemsScreen(false)}
            >
              <Text>Close</Text>
            </Pressable>
          </>
        </GenericModal>
        <GenericModal
          isVisibleCondition={showTargetSelection.showing}
          backFunction={() =>
            setShowTargetSelection({
              showing: false,
              chosenAttack: null,
              spell: null,
            })
          }
        >
          <>
            <Text className="text-center text-2xl">Choose Your Target</Text>
            {targetSelectionRender()}
          </>
        </GenericModal>
        <View className="flex-1 px-2" style={{ paddingBottom: 88 }}>
          <NonThemedView className="flex h-[40%] pt-8">
            <NonThemedView className="flex-1 flex-row justify-evenly">
              <NonThemedView
                className="flex flex-col items-center justify-center"
                style={{ minWidth: "40%" }}
              >
                <Text className="text-center text-3xl">
                  {toTitleCase(enemyState.creatureSpecies).replace(" ", "\n")}
                </Text>
                <ProgressBar
                  value={enemyState.health >= 0 ? enemyState.health : 0}
                  maxValue={enemyState.healthMax}
                  filledColor="#ef4444"
                  unfilledColor="#fee2e2"
                  displayNumber={
                    enemyState.creatureSpecies.toLowerCase() == "training dummy"
                      ? true
                      : false
                  }
                  removeAtZero={true}
                />
                {showingEnemyHealthChange ? (
                  <EnemyHealthChangePopUp />
                ) : (
                  <NonThemedView className="h-6" />
                )}
                {EnemyConditionRender()}
              </NonThemedView>
              <NonThemedView className="my-auto">
                <Animated.View
                  style={{
                    transform: [
                      { translateX: enemyAttackAnimationValue },
                      {
                        translateY: Animated.multiply(
                          enemyAttackAnimationValue,
                          -1.5,
                        ),
                      },
                    ],
                    opacity: enemyDamagedAnimationValue,
                  }}
                >
                  <EnemyImage creatureSpecies={enemyState.creatureSpecies} />
                </Animated.View>
                <Animated.View
                  style={{
                    transform: [{ translateY: enemyTextTranslateAnimation }],
                    opacity: enemyTextFadeAnimation,
                    position: "absolute",
                    marginLeft: 48,
                    marginTop: 48,
                  }}
                >
                  {enemyTextString ? (
                    <Text className="text-center text-xl tracking-wide">
                      *{toTitleCase(enemyTextString)}*
                    </Text>
                  ) : null}
                </Animated.View>
                <View className="-mr-8">
                  <EnemyHealingAnimationBox
                    showHealAnimationDummy={enemyHealDummy}
                  />
                </View>
              </NonThemedView>
            </NonThemedView>
            {enemyState.minions.length > 0 ? (
              <NonThemedView className="mx-4">
                <GenericStrikeAround
                  textNode={<Text className="text-sm">Enemy Minions</Text>}
                />
                <View className="mx-4 flex flex-row flex-wrap">
                  {enemyState.minions.map((minion) => (
                    <View
                      key={minion.id}
                      className="flex-grow px-2 py-1"
                      style={{ flexBasis: "50%" }}
                    >
                      <Text>{toTitleCase(minion.creatureSpecies)}</Text>
                      <ProgressBar
                        filledColor="#ef4444"
                        unfilledColor="#fee2e2"
                        value={minion.health}
                        maxValue={minion.healthMax}
                        displayNumber={false}
                      />
                    </View>
                  ))}
                </View>
              </NonThemedView>
            ) : null}
          </NonThemedView>
          {thisDungeon.stepsBeforeBoss !== 0 && !fightingBoss ? (
            <View className="flex flex-row justify-evenly border-b border-zinc-900 pb-1 dark:border-zinc-50">
              <Text className="my-auto text-xl">
                {`Steps Completed: ${thisDungeon.step} / ${thisDungeon.stepsBeforeBoss}`}
              </Text>
              {thisDungeon.step >= thisDungeon.stepsBeforeBoss &&
              !thisDungeon.bossDefeated ? (
                <Pressable
                  onPress={loadBoss}
                  className="my-auto rounded bg-red-500 px-4 py-2 active:scale-95 active:opacity-50"
                >
                  <Text style={{ color: "white" }}>Fight Boss</Text>
                </Pressable>
              ) : null}
            </View>
          ) : fightingBoss ? (
            <View className="flex flex-row justify-evenly border-b border-zinc-900 pb-1 dark:border-zinc-50">
              <Text className="my-auto text-center text-xl">
                Fighting Boss!
              </Text>
            </View>
          ) : (
            <View className="flex flex-row justify-evenly border-b border-zinc-900 pb-1 dark:border-zinc-50" />
          )}
          <Pressable
            className="absolute ml-4 mt-4"
            onPress={() => setShowLeftBehindItemsScreen(true)}
          >
            <SackIcon height={32} width={32} />
          </Pressable>
          <View className="flex-1 justify-between">
            <View className="flex-1">
              <BattleTab
                useAttack={useAttack}
                battleTab={battleTab}
                useSpell={useSpell}
                pass={pass}
                setAttackAnimationOnGoing={setAttackAnimationOnGoing}
                attackAnimationOnGoing={attackAnimationOnGoing}
                setShowTargetSelection={setShowTargetSelection}
                addItemToPouch={addItemToPouch}
              />
            </View>
            {playerState.minions.length > 0 ? (
              <View className="flex flex-row flex-wrap justify-evenly">
                {playerState.minions.map((minion, index) => (
                  <View
                    key={minion.id}
                    className={`${
                      index == playerState.minions.length - 1 &&
                      playerState.minions.length % 2 !== 0
                        ? "w-full"
                        : "w-2/5"
                    } py-1`}
                  >
                    <Text>{toTitleCase(minion.creatureSpecies)}</Text>
                    <ProgressBar
                      filledColor="#ef4444"
                      unfilledColor="#fee2e2"
                      value={minion.health}
                      maxValue={minion.healthMax}
                    />
                  </View>
                ))}
              </View>
            ) : null}
            <View className="flex w-full flex-row justify-around">
              <Pressable
                className={`py-4 w-32 mx-2 rounded ${
                  battleTab == "attacks"
                    ? "bg-zinc-100 dark:bg-zinc-800"
                    : "active:bg-zinc-200 dark:active:bg-zinc-700"
                }`}
                onPress={() => {
                  vibration({ style: "light" });
                  setBattleTab("attacks");
                }}
              >
                <Text className="text-center text-xl">Attacks</Text>
              </Pressable>
              <Pressable
                className={`py-4 w-32 mx-2 rounded ${
                  battleTab == "equipment"
                    ? "border-zinc-200 bg-zinc-100 dark:border-zinc-900 dark:bg-zinc-800"
                    : "active:bg-zinc-200 dark:active:bg-zinc-700"
                }`}
                onPress={() => {
                  vibration({ style: "light" });
                  setBattleTab("equipment");
                }}
              >
                <Text className="text-center text-xl">Equipment</Text>
              </Pressable>
              <Pressable
                className={`py-4 w-32 mx-2 rounded align ${
                  battleTab == "log"
                    ? "bg-zinc-100 dark:bg-zinc-800"
                    : "active:bg-zinc-200 dark:active:bg-zinc-700"
                }`}
                onPress={() => {
                  vibration({ style: "light" });
                  setBattleTab("log");
                }}
              >
                <Text className="text-center text-xl">Log</Text>
              </Pressable>
            </View>
          </View>
        </View>
        <NonThemedView className="absolute z-50 w-full" style={{ bottom: 85 }}>
          <PlayerStatus hideGold />
        </NonThemedView>
      </>
    );
  }
});
export default DungeonLevelScreen;
