import { View as ThemedView, Text } from "../../components/Themed";
import { View, Platform } from "react-native";
import { useContext, useRef, useEffect, useState } from "react";
import { Pressable } from "react-native";
import { Stack } from "expo-router";
import BattleTab from "../../components/DungeonComponents/BattleTab";
import { toTitleCase } from "../../utility/functions/misc/words";
import { enemyGenerator } from "../../utility/enemy";
import PlayerStatus from "../../components/PlayerStatus";
import ProgressBar from "../../components/ProgressBar";
import { Item } from "../../classes/item";
import { useIsFocused } from "@react-navigation/native";
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
import { enemyTurnCheck } from "./DungeonInteriorFunctions";
import LeftBehindItemsModal from "../../components/DungeonComponents/LeftBehindItemsModal";
import { SpellError } from "../../utility/errorTypes";
import GenericFlatButton from "../../components/GenericFlatButton";
import { tapRef } from "../../utility/functions/misc/tap";
import { fullSave } from "../../utility/functions/save_load";
import { throttle } from "lodash";
import D20Die from "../../components/DieRollAnim";
import { AppContext } from "../../app/_layout";
import { DungeonContext, TILE_SIZE } from "./DungeonContext";
import { DungeonMapControls, DungeonMapRender } from "./DungeonMap";

const DungeonLevelScreen = observer(() => {
  const { colorScheme } = useColorScheme();
  const appData = useContext(AppContext);
  const dungeonData = useContext(DungeonContext);
  if (!appData || !dungeonData) throw new Error("missing context");
  const { playerState, gameState, enemyState, setEnemy, playerStatusRef } =
    appData;

  const {
    slug,
    fightingBoss,
    tiles,
    currentPosition,
    setInventoryFullNotifier,
    setAttackAnimationOnGoing,
    thisInstance,
    thisDungeon,
    setFightingBoss,
    setEnemyAttacked,
    setLeftBehindDrops,
    level,
    instanceName,
    inCombat,
    mapDimensions,
    battleLogger,
    setShowFirstBossKillTutorial,
    showFirstBossKillTutorial,
    droppedItems,
  } = dungeonData;

  const [battleTab, setBattleTab] = useState<
    "attacksOrNavigation" | "equipment" | "log"
  >("attacksOrNavigation");
  const [showLeftBehindItemsScreen, setShowLeftBehindItemsScreen] =
    useState<boolean>(false);
  const [showTargetSelection, setShowTargetSelection] = useState<{
    showing: boolean;
    chosenAttack: any;
    spell: boolean | null;
  }>({ showing: false, chosenAttack: null, spell: null });

  const [fleeModalShowing, setFleeModalShowing] = useState<boolean>(false);

  const pouchRef = useRef<View>(null);

  const isFocused = useIsFocused();

  if (!playerState || !gameState) {
    throw new Error("No player character or game data on dungeon level");
  }

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
            playerMinionsTurn(playerState.minions, target.id);
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
          playerMinionsTurn(playerState.minions, target.id);
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
            playerMinionsTurn(playerState.minions, target.id);
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
          playerMinionsTurn(playerState.minions, target.id);
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

  const pass = () => {
    if (enemyState && playerState && isFocused) {
      playerState.pass();
      battleLogger("You passed!");
      playerMinionsTurn(playerState.minions, enemyState.id);
      setTimeout(() => {
        enemyTurnCheck({
          appData,
          dungeonData,
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

  function addItemToPouch(item: Item) {
    setLeftBehindDrops((prev) => [...prev, item]);
  }

  function dungeonSave(enemy: Enemy | null) {
    if (playerState && gameState) {
      if (tiles.length > 0) {
        playerState.setInDungeon({
          state: true,
          instance: instanceName,
          level: level,
          dungeonMap: tiles,
          currentPosition: currentPosition ?? tiles[0],
          mapDimensions: mapDimensions,
          enemy: enemy,
          fightingBoss: fightingBoss,
        });
        fullSave(gameState, playerState);
      }
    }
  }

  useEffect(() => {
    setInventoryFullNotifier(false);
  }, [showLeftBehindItemsScreen]);

  const throttledDungeonSave = throttle((state) => {
    dungeonSave(state);
  }, 250);

  useEffect(() => {
    throttledDungeonSave(enemyState);
  }, [enemyState?.health, playerState.health]);

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

  if (thisDungeon && playerState) {
    return (
      <>
        <Stack.Screen
          options={{
            headerLeft: () => (
              <Pressable
                onPress={() => {
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
          isVisibleCondition={showFirstBossKillTutorial && !droppedItems}
          backFunction={() => setShowFirstBossKillTutorial(false)}
        >
          <View>
            <Text className="text-3xl text-center">Well Fought!</Text>
            <Text className="text-center">
              You have defeated the first boss! Every boss will reward you with
              stats points to distribute as you wish.
            </Text>
            <GenericFlatButton
              onPressFunction={() => {
                setShowFirstBossKillTutorial(false);
                setTimeout(() => tapRef(playerStatusRef), 500);
              }}
              className="py-2"
            >
              <Text>Show Me</Text>
            </GenericFlatButton>
            <Text className="text-center">
              <Text className="text-xl">Note:</Text> Bosses do not respawn.
            </Text>
          </View>
        </GenericModal>
        <FleeModal
          fleeModalShowing={fleeModalShowing}
          setFleeModalShowing={setFleeModalShowing}
          playerMinionsTurn={playerMinionsTurn}
        />
        <DroppedItemsModal />
        <LeftBehindItemsModal
          showLeftBehindItemsScreen={showLeftBehindItemsScreen}
          setShowLeftBehindItemsScreen={setShowLeftBehindItemsScreen}
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
              useAttack={useAttack}
              useSpell={useSpell}
              setShowTargetSelection={setShowTargetSelection}
              showTargetSelection={showTargetSelection}
            />
          </>
        </GenericModal>
        <ThemedView className="flex-1" style={{ paddingBottom: 100 }}>
          {!inCombat ? (
            <DungeonMapRender
              tiles={tiles}
              mapDimensions={mapDimensions}
              currentPosition={currentPosition}
              tileSize={TILE_SIZE}
            />
          ) : enemyState ? (
            <DungeonEnemyDisplay />
          ) : (
            <View className="flex h-[40%] pt-8">
              <D20Die />
            </View>
          )}
          <Pressable
            ref={pouchRef}
            className="absolute ml-4 mt-4"
            onPress={() => setShowLeftBehindItemsScreen(true)}
          >
            <SackIcon height={32} width={32} />
          </Pressable>
          <View className="flex-1 justify-between">
            <View className="flex-1 px-2">
              <BattleTab
                useAttack={useAttack}
                battleTab={battleTab}
                useSpell={useSpell}
                pass={pass}
                setShowTargetSelection={setShowTargetSelection}
                addItemToPouch={addItemToPouch}
                pouchRef={pouchRef}
                DungeonMapControls={DungeonMapControls({
                  tileSize: TILE_SIZE,
                  getEnemy,
                  loadBoss,
                })}
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
        <PlayerStatus positioning={"absolute"} classname="bottom-0" />
      </>
    );
  }
});

export default DungeonLevelScreen;
