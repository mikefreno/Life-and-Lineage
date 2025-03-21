import React from "react";
import { Pressable, ScrollView, View } from "react-native";
import { ThemedView, Text } from "@/components/Themed";
import { Activity, BadOutcome, GoodOutcome } from "@/utility/types";
import { flipCoin, toTitleCase, wait } from "@/utility/functions/misc";
import { generateNewCharacter } from "@/utility/functions/characterAid";
import { useState } from "react";
import GenericModal from "@/components/GenericModal";
import GenericRaisedButton from "@/components/GenericRaisedButton";
import GenericFlatButton from "@/components/GenericFlatButton";
import GenericStrikeAround from "@/components/GenericStrikeAround";
import { useRouter } from "expo-router";
import { observer } from "mobx-react-lite";
import { CharacterInteractionModal } from "@/components/CharacterInteractionModal";
import { CharacterImage } from "@/components/CharacterImage";
import ProgressBar from "@/components/ProgressBar";
import {
  AffectionIcon,
  Coins,
  HealthIcon,
  Sanity,
} from "@/assets/icons/SVGIcons";
import { useRootStore } from "@/hooks/stores";
import type { Character } from "@/entities/character";
import { useStyles } from "@/hooks/styles";
import { DungeonLevel } from "@/entities/dungeon";
import { AnimatedSprite } from "@/components/AnimatedSprite";
import { Enemy } from "@/entities/creatures";

interface ActivityCardProps {
  activity: Activity;
}

const ActivityCard = observer(({ activity }: ActivityCardProps) => {
  const root = useRootStore();
  const { playerState, uiStore } = root;
  const [metCharacter, setMetCharacter] = useState<Character | null>(null);
  const [nothingHappened, setNothingHappened] = useState<boolean>(false);
  const [badOutCome, setBadOutcome] = useState<BadOutcome | null>(null);
  const [goodOutcome, setGoodOutcome] = useState<GoodOutcome | null>(null);
  const [showDatePartnerSelection, setShowDatePartnerSelection] =
    useState<boolean>(false);
  const [dateDestination, setDateDestination] = useState<string>("");
  const styles = useStyles();
  const router = useRouter();
  const [enemyObjects, setEnemyObjects] = useState<Enemy[] | null>();

  function activityRoller(outcomes: { [key: string]: number }) {
    const keys = Object.keys(outcomes);
    let accum = 0;
    let roll = Math.random();
    for (let key of keys) {
      accum += outcomes[key];
      if (roll <= accum) {
        return key;
      }
    }
  }

  function visit() {
    if (playerState && activity.alone) {
      let chosenOutcome = activityRoller(activity.alone);
      switch (chosenOutcome) {
        case "meetingSomeone":
          const flipRes = flipCoin();
          if (flipRes == "Heads" || playerState.knownCharacters.length == 0) {
            const res = generateNewCharacter(root);
            setMetCharacter(res);
          } else {
            let knownChar = playerState.getAdultCharacter();
            setMetCharacter(knownChar);
          }
          setGoodOutcome(null);
          setBadOutcome(null);
          setNothingHappened(false);
          root.gameTick();
          return;
        case "randomGood":
          if (!activity.randomGood) {
            throw new Error(
              `rolled a randomGood outcome and ${activity.name} has none!`,
            );
          }
          const goodIdx = Math.floor(
            Math.random() * activity.randomGood.length,
          );
          const randomGoodOutcome = activity.randomGood[goodIdx];
          if (randomGoodOutcome.effect) {
            handleGoodOutcome(randomGoodOutcome.effect);
          }
          setMetCharacter(null);
          setBadOutcome(null);
          setNothingHappened(false);
          root.gameTick();
          return setGoodOutcome(randomGoodOutcome);
        case "randomBad":
          if (!activity.randomBad) {
            throw new Error(
              `rolled a randomBad outcome and ${activity.name} has none!`,
            );
          }
          const idx = Math.floor(Math.random() * activity.randomBad.length);
          const randomBadOutcome = activity.randomBad[idx];
          if (randomBadOutcome.effect) {
            handleNonFightBadOutcome(randomBadOutcome.effect);
          }
          if (randomBadOutcome.fight) {
            setFight(randomBadOutcome);
          }
          setMetCharacter(null);
          setGoodOutcome(null);
          setNothingHappened(false);
          root.gameTick();
          return setBadOutcome(randomBadOutcome);
        default:
          setMetCharacter(null);
          setBadOutcome(null);
          setNothingHappened(false);
          root.gameTick();
          return setNothingHappened(true);
      }
    }
  }

  function date(character: Character) {
    if (playerState && activity.date && character) {
      let chosenOutcome = activityRoller({
        decreaseAffection: activity.date.decreaseAffection,
        increaseAffection: activity.date.increaseAffection,
      });
      if (chosenOutcome == "increaseAffection") {
        const range = activity.date.increaseAffectionRange;
        const res =
          Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
      } else {
        const range = activity.date.decreaseAffectionRange;
        const res =
          Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
      }
    }
  }

  function dateSelect(selection: string) {
    setDateDestination(selection);
    setShowDatePartnerSelection(true);
  }

  function handleGoodOutcome(effect: {
    gold?: number | undefined;
    healthRestore?: number | undefined;
    sanityRestore?: number | undefined;
  }) {
    if (effect?.gold) {
      playerState?.addGold(effect.gold);
    }
    if (effect?.healthRestore) {
      playerState?.restoreHealth(effect.healthRestore);
    }
    if (effect?.sanityRestore) {
      playerState?.restoreSanity(effect.sanityRestore);
    }
  }

  function handleNonFightBadOutcome(effect: {
    healthDamage?: number | undefined;
    sanityDamage?: number | undefined;
  }) {
    if (effect?.healthDamage) {
      playerState?.damageHealth({
        damage: effect.healthDamage,
        attackerId: "bad!",
      });
    }
    if (effect?.sanityDamage) {
      playerState?.damageSanity(effect.sanityDamage);
    }
  }

  function setFight(outcome: BadOutcome) {
    if (!outcome.fight || !outcome.dungeonTitle) return;

    const activityInstance = root.dungeonStore.initActivityDungeon(
      outcome.background ?? "AutumnForest",
    );

    const enemies = outcome.fight.enemies
      .map((enemy) =>
        Array(enemy.count).fill({
          name: enemy.name,
          scaler: enemy.scaler,
        }),
      )
      .flat();

    const activityDungeon = new DungeonLevel({
      level: 0,
      bossEncounter: [],
      normalEncounters: [enemies],
      tiles: 1,
      bossDefeated: true,
      unlocked: true,
      dungeonStore: root.dungeonStore,
      specialEncounters: [],
      parent: activityInstance,
      isActivity: true,
      nameOverride: outcome.dungeonTitle,
    });

    const enemyObj = activityDungeon.generateNormalEncounter;
    setEnemyObjects(enemyObj);
    root.enemyStore.clearEnemyList();
    enemyObj.forEach((enemy) => root.enemyStore.addToEnemyList(enemy));

    activityInstance.setLevels([activityDungeon]);

    root.dungeonStore.setUpActivity(activityInstance, activityDungeon);
    root.dungeonStore.setEncounter(false);
  }

  function renderCharacter(character: Character) {
    return (
      <Pressable
        key={character.id}
        onPress={() => date(character)}
        style={({ pressed }) => [
          styles.characterCard,
          pressed && { transform: [{ scale: 0.95 }] },
        ]}
      >
        <Text style={[styles["text-2xl"], styles.textCenter]}>
          {character.fullName}
        </Text>
        <View style={styles.itemsCenter}>
          <CharacterImage character={character} />
        </View>
        <Text style={styles["text-xl"]}>
          {character.deathdate && "Died at "}
          {character.age} Years Old
        </Text>
        <Text style={[styles["text-xl"], styles.textCenter]}>
          {character.fullName}
        </Text>
        <View style={styles.itemsCenter}>
          <Text style={[styles["text-lg"], styles.textCenter, styles.wrap]}>
            {character.deathdate && "Was a "}
            {character.job}
          </Text>
        </View>
        <View style={[styles.rowCenter, { width: "66%" }]}>
          <View style={{ width: "75%" }}>
            <ProgressBar
              value={Math.floor(character.affection * 4) / 4}
              minValue={-100}
              maxValue={100}
              filledColor="#dc2626"
              unfilledColor="#fca5a5"
            />
          </View>
          <View style={[styles.itemsCenter, { marginLeft: 4 }]}>
            <AffectionIcon
              height={uiStore.iconSizeSmall}
              width={uiStore.iconSizeSmall}
            />
          </View>
        </View>
      </Pressable>
    );
  }

  function goToFight() {
    setBadOutcome(null);
    wait(500).then(() => {
      if (badOutCome?.dungeonTitle) {
        router.dismissAll();
        router.replace(`/DungeonLevel`);
      }
    });
  }

  function payOff(gold: number) {
    if (!playerState) return;
    playerState.spendGold(gold);
    setBadOutcome(null);
    setEnemyObjects(null);
    root.enemyStore.clearEnemyList();
    root.dungeonStore.clearDungeonState();
    wait(350).then(() => setBadOutcome(null));
  }

  return (
    <>
      <GenericModal
        isVisibleCondition={showDatePartnerSelection}
        backFunction={() => setShowDatePartnerSelection(false)}
        scrollEnabled={true}
        size={100}
      >
        <View style={{ alignItems: "center" }}>
          <Text
            style={[
              styles["text-2xl"],
              styles.textCenter,
              { paddingHorizontal: 16 },
            ]}
          >
            Who would you like to {dateDestination} with?
          </Text>
          {playerState && (
            <ScrollView style={{ width: "100%" }}>
              <View style={styles.characterGrid}>
                {playerState
                  .getAllAdultCharacters()
                  .map((character) => renderCharacter(character))}
              </View>
            </ScrollView>
          )}
          <View style={{ marginTop: 16 }}>
            <GenericFlatButton
              onPress={() => setShowDatePartnerSelection(false)}
            >
              Cancel
            </GenericFlatButton>
          </View>
        </View>
      </GenericModal>
      <CharacterInteractionModal
        showAdoptionModal={() => null}
        character={metCharacter}
        closeFunction={() => setMetCharacter(null)}
        showGiftModal={() => null}
      />
      <GenericModal
        isVisibleCondition={goodOutcome != null}
        backdropCloses={false}
        backFunction={() => setGoodOutcome(null)}
      >
        <View style={{ alignItems: "center" }}>
          <Text style={[styles["text-lg"], styles.textCenter]}>
            {goodOutcome?.name}
          </Text>
          {goodOutcome?.effect.gold && (
            <View style={styles.rowCenter}>
              <Text>{goodOutcome?.effect.gold} </Text>
              <Coins
                width={uiStore.iconSizeSmall}
                height={uiStore.iconSizeSmall}
              />
            </View>
          )}
          {goodOutcome?.effect.sanityRestore && (
            <View style={styles.rowCenter}>
              <Text>{goodOutcome?.effect.sanityRestore} </Text>
              <Sanity
                width={uiStore.iconSizeSmall}
                height={uiStore.iconSizeSmall}
              />
            </View>
          )}
          {goodOutcome?.effect.healthRestore && (
            <View style={styles.rowCenter}>
              <Text>{goodOutcome?.effect.healthRestore} </Text>
              <HealthIcon
                width={uiStore.iconSizeSmall}
                height={uiStore.iconSizeSmall}
              />
            </View>
          )}
          <View style={{ marginTop: 16 }}>
            <GenericFlatButton onPress={() => setGoodOutcome(null)}>
              Close
            </GenericFlatButton>
          </View>
        </View>
      </GenericModal>
      <GenericModal
        isVisibleCondition={badOutCome != null}
        backdropCloses={false}
        backFunction={() => setBadOutcome(null)}
      >
        <View style={{ alignItems: "center" }}>
          <Text style={[styles["text-2xl"], { paddingBottom: 8 }]}>
            {badOutCome?.name}
          </Text>
          {badOutCome?.fight ? (
            <>
              <View style={[styles.columnEvenly, { paddingTop: 16 }]}>
                <View
                  style={{
                    height: uiStore.dimensions.height * 0.45,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {enemyObjects?.map((enemy) => (
                    <AnimatedSprite enemy={enemy} key={enemy.id} />
                  ))}
                </View>
                {badOutCome.buyOff &&
                  playerState &&
                  playerState.gold >= 0.25 * badOutCome.buyOff.price && (
                    <>
                      <GenericFlatButton
                        onPress={() => payOff(badOutCome.buyOff!.price)}
                      >
                        <View style={{ flexDirection: "row" }}>
                          <Text>
                            Save yourself for{" "}
                            {badOutCome.buyOff.price <= playerState?.gold
                              ? badOutCome.buyOff.price
                              : playerState.gold}{" "}
                          </Text>
                          <Coins
                            height={uiStore.iconSizeSmall}
                            width={uiStore.iconSizeSmall}
                          />
                        </View>
                      </GenericFlatButton>
                      <GenericStrikeAround>
                        <Text
                          style={[styles["text-lg"], { marginVertical: 8 }]}
                        >
                          Or
                        </Text>
                      </GenericStrikeAround>
                    </>
                  )}
                <GenericFlatButton onPress={goToFight}>Fight</GenericFlatButton>
              </View>
            </>
          ) : (
            <>
              <View style={{ paddingBottom: 16 }}>
                {badOutCome?.effect?.healthDamage && (
                  <View style={styles.rowCenter}>
                    <Text>- {badOutCome.effect.healthDamage}</Text>
                    <HealthIcon
                      height={uiStore.iconSizeSmall}
                      width={uiStore.iconSizeSmall}
                    />
                  </View>
                )}
                {badOutCome?.effect?.sanityDamage && (
                  <View style={styles.rowCenter}>
                    <Text>- {badOutCome.effect.sanityDamage} </Text>
                    <Sanity
                      height={uiStore.iconSizeSmall}
                      width={uiStore.iconSizeSmall}
                    />
                  </View>
                )}
              </View>
              <GenericFlatButton onPress={() => setBadOutcome(null)}>
                Close
              </GenericFlatButton>
            </>
          )}
        </View>
      </GenericModal>
      <GenericModal
        isVisibleCondition={nothingHappened}
        backdropCloses={false}
        backFunction={() => setNothingHappened(false)}
      >
        <View style={{ alignItems: "center" }}>
          <Text style={[styles["text-xl"], { paddingBottom: 8 }]}>
            Nothing of note happened
          </Text>
          <Text>Could have been worse</Text>
          <View style={{ marginTop: 16 }}>
            <GenericFlatButton onPress={() => setNothingHappened(false)}>
              Close
            </GenericFlatButton>
          </View>
        </View>
      </GenericModal>
      <ThemedView style={styles.activityCard}>
        <View style={styles.activityCardInner}>
          <View style={styles.rowBetween}>
            <Text style={[styles["text-xl"], styles.bold, { width: "75%" }]}>
              {toTitleCase(activity.name)}
            </Text>
            <View style={styles.rowCenter}>
              <Text style={[styles["text-xl"], styles.bold]}>
                {activity.cost == 0 ? "free" : activity.cost}{" "}
              </Text>
              {activity.cost !== 0 && (
                <Coins
                  height={uiStore.iconSizeSmall}
                  width={uiStore.iconSizeSmall}
                />
              )}
            </View>
          </View>
          <View style={{ flexDirection: "row" }}>
            {activity.alone && (
              <GenericRaisedButton
                disabled={!!playerState && playerState.gold < activity.cost}
                onPress={visit}
              >
                Visit Alone
              </GenericRaisedButton>
            )}
            {activity.date && (
              <GenericRaisedButton
                disabled={playerState?.getAllAdultCharacters().length == 0}
                onPress={() => dateSelect(activity.name)}
              >
                Go on Date
              </GenericRaisedButton>
            )}
          </View>
        </View>
      </ThemedView>
    </>
  );
});

export default ActivityCard;
