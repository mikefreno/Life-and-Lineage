import { View as ThemedView, Text } from "../../components/Themed";
import { Animated, View, Platform } from "react-native";
import { useContext, useRef, useEffect, useState } from "react";
import { Pressable } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import BattleTab from "../../components/DungeonComponents/BattleTab";
import { toTitleCase } from "../../utility/functions/misc/words";
import { enemyGenerator } from "../../utility/enemy";
import PlayerStatus from "../../components/PlayerStatus";
import ProgressBar from "../../components/ProgressBar";
import { DungeonInstance, DungeonLevel } from "../../classes/dungeon";
import { Item } from "../../classes/item";
import { useIsFocused } from "@react-navigation/native";
import {
  GameContext,
  LogsContext,
  EnemyContext,
  PlayerCharacterContext,
  PlayerStatusContext,
} from "../_layout";
import { observer } from "mobx-react-lite";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { Minion, Enemy } from "../../classes/creatures";
import SackIcon from "../../assets/icons/SackIcon";
import TutorialModal from "../../components/TutorialModal";
import GenericModal from "../../components/GenericModal";
import { AttackObj } from "../../utility/types";
import BattleTabControls from "../../components/DungeonComponents/BattleTabControls";
import DungeonEnemyDisplay from "../../components/DungeonComponents/DungeonEnemyDisplay";
import FleeModal from "../../components/DungeonComponents/FleeModal";
import TargetSelection from "../../components/DungeonComponents/TargetSelection";
import DroppedItemsModal from "../../components/DungeonComponents/DroppedItemsModal";
import { enemyTurnCheck } from "../../utility/functions/dungeonInteriorFunctions";
import LeftBehindItemsModal from "../../components/DungeonComponents/LeftBehindItemsModal";
import { SpellError } from "../../utility/errorTypes";
import {
  BoundingBox,
  DungeonMapControls,
  DungeonMapRender,
  Tile,
  generateTiles,
  getBoundingBox,
} from "../../components/DungeonMap";
import GenericFlatButton from "../../components/GenericFlatButton";
import { tapRef } from "../../utility/functions/misc/tap";
import { fullSave } from "../../utility/functions/save_load";
import { throttle } from "lodash";

const TILE_SIZE = 40;

const DungeonLevelScreen = observer(() => {
  const { colorScheme } = useColorScheme();
  const playerCharacterContext = useContext(PlayerCharacterContext);
  const gameContext = useContext(GameContext);
  const enemyContext = useContext(EnemyContext);
  const logsContext = useContext(LogsContext);
  const playerStatusContext = useContext(PlayerStatusContext);
  if (
    !playerCharacterContext ||
    !gameContext ||
    !enemyContext ||
    !logsContext ||
    !playerStatusContext
  )
    throw new Error("missing context");
  const { playerState } = playerCharacterContext;
  const { gameState } = gameContext;
  const { enemyState, setEnemy } = enemyContext;
  const { logsState } = logsContext;
  const { playerStatusRef } = playerStatusContext;

  const { slug } = useLocalSearchParams();
  if (!slug) {
    return <View>Missing params...</View>;
  }
  const [fightingBoss, setFightingBoss] = useState<boolean>(false);
  const [firstLoad, setFirstLoad] = useState<boolean>(true);
  const [instanceName, setInstanceName] = useState<string>(slug[0]);
  const [level, setLevel] = useState<number>(Number(slug[1]));
  const [battleTab, setBattleTab] = useState<
    "attacksOrNavigation" | "equipment" | "log"
  >("attacksOrNavigation");
  const [thisInstance, setThisInstance] = useState<DungeonInstance>();
  const [thisDungeon, setThisDungeon] = useState<DungeonLevel>();
  const [enemyAttacked, setEnemyAttacked] = useState<boolean>(false);
  const [leftBehindDrops, setLeftBehindDrops] = useState<Item[]>([]);
  const [showLeftBehindItemsScreen, setShowLeftBehindItemsScreen] =
    useState<boolean>(false);
  const [inventoryFullNotifier, setInventoryFullNotifier] =
    useState<boolean>(false);
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

  const [fleeModalShowing, setFleeModalShowing] = useState<boolean>(false);
  const [fleeRollFailure, setFleeRollFailure] = useState<boolean>(false);

  const enemyAttackAnimationValue = useState(new Animated.Value(0))[0];
  const enemyDamagedAnimationValue = useState(new Animated.Value(1))[0];

  const [enemyTextString, setEnemyTextString] = useState<string>();
  const enemyTextFadeAnimation = useState(new Animated.Value(1))[0];
  const enemyTextTranslateAnimation = useState(new Animated.Value(0))[0];
  const [droppedItems, setDroppedItems] = useState<{
    itemDrops: Item[];
    gold: number;
  } | null>(null);
  const [enemyAttackDummy, setEnemyAttackDummy] = useState<number>(0);
  const [enemyHealDummy, setEnemyHealDummy] = useState<number>(0);
  const [enemyTextDummy, setEnemyTextDummy] = useState<number>(0);
  const [inCombat, setInCombat] = useState<boolean>(false);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [mapDimensions, setMapDimensions] = useState<BoundingBox>({
    width: TILE_SIZE,
    height: TILE_SIZE,
    offsetX: 0,
    offsetY: 0,
  });

  const [currentPosition, setCurrentPosition] = useState<Tile | null>(null);
  const pouchRef = useRef<View>(null);

  const isFocused = useIsFocused();

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
    if (playerState.currentDungeon) {
      setTiles(playerState.currentDungeon.dungeonMap);
      setCurrentPosition(playerState.currentDungeon.currentPosition);
      setMapDimensions(playerState.currentDungeon.mapDimensions);
      setEnemy(playerState.currentDungeon.enemy);
      setInCombat(true);
      setEnemyAttacked(true);
    } else if (thisDungeon) {
      const generatedTiles = generateTiles({
        numTiles: thisDungeon.tiles,
        tileSize: TILE_SIZE,
        bossDefeated: thisDungeon.bossDefeated ?? false,
      });
      setTiles(generatedTiles);
      const dimensions = getBoundingBox(generatedTiles, TILE_SIZE);
      setMapDimensions(dimensions);
      setCurrentPosition(generatedTiles[0]);
    }
  }, [thisDungeon]);

  useEffect(() => {
    if (slug[0] !== "Activities" && slug[0] !== "Personal") {
      if (!fightingBoss && !enemyState) {
        tiles.map((tile) => {
          if (tile.x == currentPosition?.x && tile.y == currentPosition.y) {
            tile.clearedRoom = true;
            return tile;
          }
          return tile;
        });
      }
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
        tiles: 0,
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

  //-----------minion loading-------/
  function getEnemy() {
    const enemy = enemyGenerator(instanceName, level);
    if (enemy) {
      setEnemy(enemy);
      setEnemyAttacked(false);
      battleLogger(`You found a ${toTitleCase(enemy.creatureSpecies)}!`);
      setAttackAnimationOnGoing(false);
      dungeonSave(enemy);
    }
  }

  const loadBoss = () => {
    setFightingBoss(true);
    setAttackAnimationOnGoing(false);
    if (thisDungeon && thisInstance && playerState) {
      const boss = thisDungeon.getBoss(thisInstance.name)[0];
      setEnemy(boss);
      battleLogger(`You found the boss!`);
    }
  };

  //------------player combat functions------------//
  const useAttack = (attack: AttackObj, target: Enemy | Minion) => {
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
      let obj = {
        enemyState: enemyState,
        slug: slug,
        playerState: playerState,
        fightingBoss: fightingBoss,
        setDroppedItems: setDroppedItems,
        setEnemy: setEnemy,
        gameState: gameState,
        battleLogger: battleLogger,
        setFightingBoss: setFightingBoss,
        setAttackAnimationOnGoing: setAttackAnimationOnGoing,
        thisDungeon: thisDungeon,
        thisInstance: thisInstance,
        setEnemyAttacked: setEnemyAttacked,
        setEnemyHealDummy: setEnemyHealDummy,
        setEnemyAttackDummy: setEnemyAttackDummy,
        setEnemyTextDummy: setEnemyTextDummy,
        setEnemyTextString: setEnemyTextString,
        triggerFirstBossKillTutorial: () => setShowFirstBossKillTutorial(true),
      };
      if (target instanceof Enemy) {
        if (target.health <= 0 || (target.sanity && target.sanity <= 0)) {
          setTimeout(() => {
            enemyTurnCheck(obj);
          }, 1000);
        } else {
          setTimeout(() => {
            playerMinionsTurn(playerState.minions, target.id);
            setTimeout(
              () => {
                enemyTurnCheck(obj);
              },
              1000 * playerState.minions.length + 1,
            );
          }, 1000);
        }
      } else {
        setTimeout(() => {
          playerMinionsTurn(playerState.minions, target.id);
          setTimeout(() => {
            enemyTurnCheck(obj);
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

      let obj = {
        enemyState: enemyState,
        slug: slug,
        playerState: playerState,
        fightingBoss: fightingBoss,
        setDroppedItems: setDroppedItems,
        setEnemy: setEnemy,
        gameState: gameState,
        battleLogger: battleLogger,
        setFightingBoss: setFightingBoss,
        setAttackAnimationOnGoing: setAttackAnimationOnGoing,
        thisDungeon: thisDungeon,
        thisInstance: thisInstance,
        setEnemyAttacked: setEnemyAttacked,
        setEnemyHealDummy: setEnemyHealDummy,
        setEnemyAttackDummy: setEnemyAttackDummy,
        setEnemyTextDummy: setEnemyTextDummy,
        setEnemyTextString: setEnemyTextString,
        triggerFirstBossKillTutorial: () => setShowFirstBossKillTutorial(true),
      };

      if (target instanceof Enemy) {
        if (target.health <= 0 || (target.sanity && target.sanity <= 0)) {
          setTimeout(() => {
            enemyTurnCheck(obj);
          }, 1000);
        } else {
          setTimeout(() => {
            playerMinionsTurn(playerState.minions, target.id);
            setTimeout(() => {
              enemyTurnCheck(obj);
            }, 1000 * playerState.minions.length);
          }, 1000);
        }
      } else {
        setTimeout(() => {
          playerMinionsTurn(playerState.minions, target.id);
          setTimeout(() => {
            enemyTurnCheck(obj);
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
        enemyTurnCheck({
          enemyState: enemyState,
          slug: slug,
          playerState: playerState,
          fightingBoss: fightingBoss,
          setDroppedItems: setDroppedItems,
          setEnemy: setEnemy,
          gameState: gameState,
          battleLogger: battleLogger,
          setFightingBoss: setFightingBoss,
          setAttackAnimationOnGoing: setAttackAnimationOnGoing,
          thisDungeon: thisDungeon,
          thisInstance: thisInstance,
          setEnemyAttacked: setEnemyAttacked,
          setEnemyHealDummy: setEnemyHealDummy,
          setEnemyAttackDummy: setEnemyAttackDummy,
          setEnemyTextDummy: setEnemyTextDummy,
          setEnemyTextString: setEnemyTextString,
          triggerFirstBossKillTutorial: () =>
            setShowFirstBossKillTutorial(true),
        });
      }, 1000 * playerState.minions.length);
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
  //--------misc functions------//
  function battleLogger(whatHappened: string) {
    const timeOfLog = new Date().toLocaleTimeString();
    const log = `${timeOfLog}: ${whatHappened}`;
    logsState.push(log);
  }

  function addItemToPouch(item: Item) {
    setLeftBehindDrops((prev) => [...prev, item]);
  }

  function dungeonSave(enemy: Enemy | null) {
    if (playerState && gameState) {
      playerState.setInDungeon({
        state: true,
        instance: instanceName,
        level: level,
        tiles: tiles,
        currentPosition: currentPosition ?? tiles[0],
        mapDimensions: mapDimensions,
        enemy: enemy,
      });
      fullSave(gameState, playerState);
    }
  }

  useEffect(() => {
    if (inventoryFullNotifier) {
      setTimeout(() => setInventoryFullNotifier(false), 2000);
    }
  }, [inventoryFullNotifier]);

  useEffect(() => {
    setInventoryFullNotifier(false);
  }, [showLeftBehindItemsScreen]);

  const throttledDungeonSave = throttle(
    (state) => {
      dungeonSave(state);
    },
    3000,
    { leading: false, trailing: true },
  );

  useEffect(() => {
    throttledDungeonSave(enemyState);
  }, [enemyState?.health, playerState.health]);

  useEffect(() => {
    if (!firstLoad && !enemyState) {
      setInCombat(false);
    } else {
      setFirstLoad(false);
    }
  }, [enemyState]);

  //-----------tutorial---------//
  const [showDungeonInteriorTutorial, setShowDungeonInteriorTutorial] =
    useState<boolean>(
      (gameState && !gameState.getTutorialState("dungeonInterior")) ?? false,
    );

  const [showFirstBossKillTutorial, setShowFirstBossKillTutorial] =
    useState<boolean>(false);

  useEffect(() => {
    if (!showDungeonInteriorTutorial && gameState) {
      gameState.updateTutorialState("dungeonInterior", true);
    }
  }, [showDungeonInteriorTutorial]);

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
            body: "The first boss becomes available after 10 Enemys defeated for the first dungeon.",
          }}
          pageThree={{
            title: "Good Luck.",
            body: "And remember fleeing (top left) can save you.",
          }}
        />
        <GenericModal
          isVisibleCondition={showFirstBossKillTutorial}
          backFunction={() => setShowFirstBossKillTutorial(false)}
        >
          <View>
            <Text></Text>
            <GenericFlatButton
              onPressFunction={() => {
                setShowFirstBossKillTutorial(false);
                setTimeout(() => tapRef(playerStatusRef), 500);
              }}
            >
              <Text>Show Me</Text>
            </GenericFlatButton>
          </View>
        </GenericModal>
        <FleeModal
          playerState={playerState}
          enemyState={enemyState}
          setEnemy={setEnemy}
          slug={slug}
          enemyAttacked={enemyAttacked}
          battleLogger={battleLogger}
          playerMinionsTurn={playerMinionsTurn}
          attackAnimationOnGoing={attackAnimationOnGoing}
          fleeModalShowing={fleeModalShowing}
          fleeRollFailure={fleeRollFailure}
          setFleeModalShowing={setFleeModalShowing}
          setFleeRollFailure={setFleeRollFailure}
          fightingBoss={fightingBoss}
          setDroppedItems={setDroppedItems}
          gameState={gameState}
          setFightingBoss={setFightingBoss}
          setAttackAnimationOnGoing={setAttackAnimationOnGoing}
          thisDungeon={thisDungeon}
          thisInstance={thisInstance}
          setEnemyAttacked={setEnemyAttacked}
          setEnemyHealDummy={setEnemyHealDummy}
          setEnemyAttackDummy={setEnemyAttackDummy}
          setEnemyTextDummy={setEnemyTextDummy}
          setEnemyTextString={setEnemyTextString}
          triggerFirstBossKillTutorial={() =>
            setShowFirstBossKillTutorial(true)
          }
        />
        <DroppedItemsModal
          setLeftBehindDrops={setLeftBehindDrops}
          playerState={playerState}
          slug={slug}
          inventoryFullNotifier={inventoryFullNotifier}
          setInventoryFullNotifier={setInventoryFullNotifier}
          setDroppedItems={setDroppedItems}
          droppedItems={droppedItems}
        />
        <LeftBehindItemsModal
          showLeftBehindItemsScreen={showLeftBehindItemsScreen}
          setShowLeftBehindItemsScreen={setShowLeftBehindItemsScreen}
          inventoryFullNotifier={inventoryFullNotifier}
          leftBehindDrops={leftBehindDrops}
          playerState={playerState}
          setInventoryFullNotifier={setInventoryFullNotifier}
          setLeftBehindDrops={setLeftBehindDrops}
        />
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
            <TargetSelection
              enemyState={enemyState}
              useAttack={useAttack}
              useSpell={useSpell}
              setShowTargetSelection={setShowTargetSelection}
              showTargetSelection={showTargetSelection}
            />
          </>
        </GenericModal>
        {
          <ThemedView className="flex-1 px-2" style={{ paddingBottom: 88 }}>
            {!inCombat ? (
              <DungeonMapRender
                tiles={tiles}
                mapDimensions={mapDimensions}
                currentPosition={currentPosition}
                tileSize={TILE_SIZE}
              />
            ) : enemyState ? (
              <DungeonEnemyDisplay
                enemyState={enemyState}
                showingEnemyHealthChange={showingEnemyHealthChange}
                enemyHealthDiff={enemyHealthDiff}
                animationCycler={animationCycler}
                enemyAttackAnimationValue={enemyAttackAnimationValue}
                enemyHealDummy={enemyHealDummy}
                enemyDamagedAnimationValue={enemyDamagedAnimationValue}
                enemyTextTranslateAnimation={enemyTextTranslateAnimation}
                enemyTextString={enemyTextString}
                enemyTextFadeAnimation={enemyTextFadeAnimation}
              />
            ) : (
              <View className="flex h-[40%] pt-8" /> // TODO: Add loading animation
            )}
            <Pressable
              ref={pouchRef}
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
                  pouchRef={pouchRef}
                  DungeonMapControls={DungeonMapControls({
                    tiles,
                    currentPosition,
                    tileSize: TILE_SIZE,
                    setCurrentPosition,
                    setInCombat,
                    loadBoss,
                    getEnemy,
                  })}
                  inCombat={inCombat}
                />
              </View>
            </View>
            <BattleTabControls
              battleTab={battleTab}
              setBattleTab={setBattleTab}
              inCombat={inCombat}
            />
            {playerState.minions.length > 0 ? (
              <ThemedView className="flex flex-row flex-wrap justify-evenly">
                {playerState.minions.map((minion, index) => (
                  <ThemedView
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
                  </ThemedView>
                ))}
              </ThemedView>
            ) : null}
          </ThemedView>
        }
        <View className="absolute z-50 w-full" style={{ bottom: 95 }}>
          <PlayerStatus />
        </View>
      </>
    );
  }
});

export default DungeonLevelScreen;
