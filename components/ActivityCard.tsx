import { Pressable, ScrollView, View } from "react-native";
import { ThemedView, Text } from "../components/Themed";
import { Activity, BadOutcome, GoodOutcome } from "../utility/types";
import { useColorScheme } from "nativewind";
import { flipCoin, toTitleCase, wait } from "../utility/functions/misc";
import { generateNewCharacter } from "../utility/functions/characterAid";
import { useState } from "react";
import GenericModal from "./GenericModal";
import GenericRaisedButton from "./GenericRaisedButton";
import GenericFlatButton from "./GenericFlatButton";
import { EnemyImage } from "./EnemyImage";
import GenericStrikeAround from "./GenericStrikeAround";
import { router } from "expo-router";
import { observer } from "mobx-react-lite";
import { CharacterInteractionModal } from "./CharacterInteractionModal";
import { CharacterImage } from "./CharacterImage";
import ProgressBar from "./ProgressBar";
import {
  AffectionIcon,
  Coins,
  HealthIcon,
  Sanity,
} from "../assets/icons/SVGIcons";
import { useRootStore } from "../hooks/stores";
import type { Character } from "../entities/character";

interface ActivityCardProps {
  activity: Activity;
}

const ActivityCard = observer(({ activity }: ActivityCardProps) => {
  const root = useRootStore();
  const { playerState, enemyStore } = root;
  const { colorScheme } = useColorScheme();
  const [metCharacter, setMetCharacter] = useState<Character | null>(null);
  const [nothingHappened, setNothingHappened] = useState<boolean>(false);
  const [badOutCome, setBadOutcome] = useState<BadOutcome | null>(null);
  const [goodOutcome, setGoodOutcome] = useState<GoodOutcome | null>(null);
  const [showDatePartnerSelection, setShowDatePartnerSelection] =
    useState<boolean>(false);
  const [dateDestination, setDateDestination] = useState<string>("");

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
    setNothingHappened(false);
    setGoodOutcome(null);

    //TODO: Setup instance / fight
  }

  function renderCharacter(character: Character) {
    return (
      <Pressable
        key={character.id}
        onPress={() => date(character)}
        className="w-[48%]"
      >
        {({ pressed }) => (
          <View
            className={`${
              pressed && "scale-95"
            } my-2 flex w-full items-center rounded border border-zinc-400`}
          >
            <Text className="text-center text-2xl">{character.fullName}</Text>
            <View className="mx-auto">
              <CharacterImage
                characterAge={character.age}
                characterSex={character.sex == "male" ? "M" : "F"}
              />
            </View>
            <Text className="text-xl">
              {character.deathdate && "Died at "}
              {character.age} Years Old
            </Text>
            <Text className="text-center text-xl">{character.fullName}</Text>
            <View className="mx-auto">
              <Text className="flex flex-wrap text-center text-lg">
                {character.deathdate && "Was a "}
                {character.job}
              </Text>
            </View>
            <View className="flex w-2/3 flex-row justify-center">
              <View className="w-3/4">
                <ProgressBar
                  value={Math.floor(character.affection * 4) / 4}
                  minValue={-100}
                  maxValue={100}
                  filledColor="#dc2626"
                  unfilledColor="#fca5a5"
                />
              </View>
              <View className="my-auto ml-1">
                <AffectionIcon height={14} width={14} />
              </View>
            </View>
          </View>
        )}
      </Pressable>
    );
  }

  function goToFight() {
    setBadOutcome(null);
    wait(500).then(() => {
      if (badOutCome && badOutCome.fight && badOutCome.dungeonTitle) {
        router.dismissAll();
        router.replace(`/DungeonLevel/Activities/${badOutCome?.dungeonTitle}`);
      } else {
        throw new Error("missing enemy object!");
      }
    });
  }

  function payOff(gold: number) {
    playerState?.spendGold(gold);
    setBadOutcome(null);
    enemyStore.enemies = [];
    // set up instance and level
    setTimeout(() => setBadOutcome(null), 350);
  }

  return (
    <>
      <GenericModal
        isVisibleCondition={showDatePartnerSelection}
        backFunction={() => setShowDatePartnerSelection(false)}
        size={100}
      >
        <View className="items-center">
          <Text className="px-4 text-center text-2xl">
            Who would you like to {dateDestination} with?
          </Text>
          {playerState && (
            <ScrollView className="w-full">
              <View
                style={{
                  paddingVertical: 12,
                  flexDirection: "row",
                  flexWrap: "wrap",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                }}
              >
                {playerState
                  .getAllAdultCharacters()
                  .map((character) => renderCharacter(character))}
              </View>
            </ScrollView>
          )}
          <View className="mt-4">
            <GenericFlatButton
              onPress={() => setShowDatePartnerSelection(false)}
            >
              Cancel
            </GenericFlatButton>
          </View>
        </View>
      </GenericModal>
      <CharacterInteractionModal
        character={metCharacter}
        closeFunction={() => setMetCharacter(null)}
        showGiftModal={() => null}
      />
      <GenericModal
        isVisibleCondition={goodOutcome != null}
        backdropCloses={false}
        backFunction={() => setGoodOutcome(null)}
      >
        <View className="items-center">
          <Text className="text-center text-lg">{goodOutcome?.name}</Text>
          {goodOutcome?.effect.gold && (
            <View className="flex flex-row items-center">
              <Text>{goodOutcome?.effect.gold} </Text>
              <Coins width={14} height={14} />
            </View>
          )}
          {goodOutcome?.effect.sanityRestore && (
            <View className="flex flex-row items-center">
              <Text>{goodOutcome?.effect.sanityRestore} </Text>
              <Sanity width={14} height={14} />
            </View>
          )}
          {goodOutcome?.effect.healthRestore && (
            <View className="flex flex-row items-center">
              <Text>{goodOutcome?.effect.healthRestore} </Text>
              <HealthIcon width={14} height={14} />
            </View>
          )}
          <View className="mt-4">
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
        <View className="items-center">
          <Text className="pb-2 text-2xl">{badOutCome?.name}</Text>
          {badOutCome?.fight ? (
            <>
              <EnemyImage creatureSpecies={badOutCome.fight} />
              <View className="mt-4 flex justify-evenly">
                {badOutCome.buyOff &&
                  playerState &&
                  playerState.gold >= 0.25 * badOutCome.buyOff.price && (
                    <>
                      <GenericFlatButton
                        onPress={() => payOff(badOutCome.buyOff!.price)}
                      >
                        <View className="flex flex-row">
                          <Text>
                            Save yourself for{" "}
                            {badOutCome.buyOff.price <= playerState?.gold
                              ? badOutCome.buyOff.price
                              : playerState.gold}{" "}
                          </Text>
                          <Coins height={14} width={14} />
                        </View>
                      </GenericFlatButton>
                      <GenericStrikeAround>
                        <Text className="my-2 text-lg">Or</Text>
                      </GenericStrikeAround>
                    </>
                  )}
                <GenericFlatButton onPress={goToFight}>Fight</GenericFlatButton>
              </View>
            </>
          ) : (
            <>
              <View className="pb-4">
                {badOutCome?.effect?.healthDamage && (
                  <View className="flex flex-row items-center">
                    <Text>- {badOutCome.effect.healthDamage}</Text>
                    <HealthIcon height={14} width={14} />
                  </View>
                )}
                {badOutCome?.effect?.sanityDamage && (
                  <View className="flex flex-row items-center">
                    <Text>- {badOutCome.effect.sanityDamage} </Text>
                    <Sanity height={14} width={14} />
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
        <View className="items-center">
          <Text className="pb-2 text-xl">Nothing of note happened</Text>
          <Text>Could have been worse</Text>
          <View className="mt-4">
            <GenericFlatButton onPress={() => setNothingHappened(false)}>
              Close
            </GenericFlatButton>
          </View>
        </View>
      </GenericModal>
      <ThemedView
        className="m-2 rounded-xl"
        style={{
          shadowColor: "#000",
          shadowOffset: {
            width: 3,
            height: 1,
          },
          elevation: 3,
          shadowOpacity: 0.2,
          backgroundColor: colorScheme == "light" ? "#fafafa" : "#27272a",
          shadowRadius: 3,
        }}
      >
        <View className="flex justify-between rounded-xl px-4 py-2 text-zinc-950 dark:border dark:border-zinc-500">
          <View className="flex flex-row justify-between">
            <Text className="bold w-3/4 text-xl dark:text-zinc-50">
              {toTitleCase(activity.name)}
            </Text>
            <View className="flex flex-row items-center">
              <Text className="bold text-xl dark:text-zinc-50">
                {activity.cost == 0 ? "free" : activity.cost}{" "}
              </Text>
              {activity.cost !== 0 && <Coins height={14} width={14} />}
            </View>
          </View>
          <View className="flex flex-row ">
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
