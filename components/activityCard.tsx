import { Pressable, ScrollView, View } from "react-native";
import { View as ThemedView, Text } from "../components/Themed";
import { Activity, BadOutcome, GoodOutcome } from "../utility/types";
import { useColorScheme } from "nativewind";
import { flipCoin, rollD20 } from "../utility/functions/roll";
import { generateNewCharacter } from "../utility/functions/characterAid";
import { useContext, useState } from "react";
import {
  EnemyContext,
  GameContext,
  PlayerCharacterContext,
} from "../app/_layout";
import Coins from "../assets/icons/CoinsIcon";
import { toTitleCase } from "../utility/functions/misc/words";
import GenericModal from "./GenericModal";
import { Character } from "../classes/character";
import GenericRaisedButton from "./GenericRaisedButton";
import GenericFlatButton from "./GenericFlatButton";
import Sanity from "../assets/icons/SanityIcon";
import HealthIcon from "../assets/icons/HealthIcon";
import { EnemyImage } from "./EnemyImage";
import GenericStrikeAround from "./GenericStrikeAround";
import { router } from "expo-router";
import { getNumberInRange } from "../utility/enemy";
import { Enemy } from "../classes/creatures";
import enemies from "../assets/json/enemy.json";
import { observer } from "mobx-react-lite";
import { useVibration } from "../utility/customHooks";
import { CharacterInteractionModal } from "./CharacterInteractionModal";
import { calculateAge } from "../utility/functions/misc/age";
import { CharacterImage } from "./CharacterImage";
import ProgressBar from "./ProgressBar";
import AffectionIcon from "../assets/icons/AffectionIcon";

interface ActivityCardProps {
  activity: Activity;
}

const ActivityCard = observer(({ activity }: ActivityCardProps) => {
  const playerContext = useContext(PlayerCharacterContext);
  const enemyContext = useContext(EnemyContext);
  const gameContext = useContext(GameContext);
  if (!playerContext || !enemyContext || !gameContext) {
    throw new Error("missing context");
  }
  const { playerState } = playerContext;
  const { setEnemy } = enemyContext;
  const { gameState } = gameContext;
  const { colorScheme } = useColorScheme();
  const [metCharacter, setMetCharacter] = useState<Character | null>(null);
  const [nothingHappened, setNothingHappened] = useState<boolean>(false);
  const [badOutCome, setBadOutcome] = useState<BadOutcome | null>(null);
  const [goodOutcome, setGoodOutcome] = useState<GoodOutcome | null>(null);
  const [showDatePartnerSelection, setShowDatePartnerSelection] =
    useState<boolean>(false);
  const [dateDestination, setDateDestination] = useState<string>("");

  const vibration = useVibration();

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
    if (playerState && activity.alone && gameState) {
      let chosenOutcome = activityRoller(activity.alone);
      switch (chosenOutcome) {
        case "meetingSomeone":
          const flipRes = flipCoin();
          if (flipRes == "Heads" || playerState.knownCharacters.length == 0) {
            const res = generateNewCharacter();
            setMetCharacter(res);
          } else {
            let knownChar = playerState.getAdultCharacter(
              new Date(gameState.date),
            );
            setMetCharacter(knownChar);
          }
          setGoodOutcome(null);
          setBadOutcome(null);
          setNothingHappened(false);
          gameState?.gameTick(playerState);
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
          gameState?.gameTick(playerState);
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
          if (
            randomBadOutcome &&
            randomBadOutcome.fight &&
            randomBadOutcome.dungeonTitle
          ) {
            setFight(randomBadOutcome.fight, randomBadOutcome.dungeonTitle);
          }
          setMetCharacter(null);
          setGoodOutcome(null);
          setNothingHappened(false);
          gameState?.gameTick(playerState);
          return setBadOutcome(randomBadOutcome);
        default:
          setMetCharacter(null);
          setBadOutcome(null);
          setNothingHappened(false);
          gameState?.gameTick(playerState);
          return setNothingHappened(true);
      }
    }
  }

  function date(character: Character) {
    if (playerState && activity.date && gameState && character) {
      let chosenOutcome = activityRoller({
        decreaseAffection: activity.date.decreaseAffection,
        increaseAffection: activity.date.increaseAffection,
      });
      if (chosenOutcome == "increaseAffection") {
        const range = activity.date.increaseAffectionRange;
        const res =
          Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
        console.log(res);
      } else {
        const range = activity.date.decreaseAffectionRange;
        const res =
          Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
        console.log(res);
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
      playerState?.damageHealth(effect.healthDamage);
    }
    if (effect?.sanityDamage) {
      playerState?.damageSanity(effect.sanityDamage);
    }
  }

  function setFight(fight: string, dungeonTitle: string) {
    const enemyJSON = enemies.find((enemy) => enemy.name == fight);
    if (enemyJSON) {
      const enemyHealth = getNumberInRange(
        enemyJSON.healthRange.minimum,
        enemyJSON.healthRange.maximum,
      );

      const enemyAttackPower = getNumberInRange(
        enemyJSON.attackPowerRange.minimum,
        enemyJSON.attackPowerRange.maximum,
      );

      const enemy = new Enemy({
        creatureSpecies: enemyJSON.name,
        health: enemyHealth,
        healthMax: enemyHealth,
        sanity: enemyJSON.sanity ?? null,
        sanityMax: enemyJSON.sanity ?? null,
        baseArmor: enemyJSON.armorValue ?? undefined,
        attackPower: enemyAttackPower,
        energy: enemyJSON.energy?.maximum,
        energyMax: enemyJSON.energy?.maximum,
        energyRegen: enemyJSON.energy?.regen,
        attacks: enemyJSON.attacks,
      });
      setNothingHappened(false);
      setGoodOutcome(null);

      setEnemy(enemy);
      playerState?.setInDungeon({
        state: true,
        instance: "Activities",
        level: dungeonTitle,
      });
      playerState?.setSavedEnemy(enemy);
    }
  }

  function renderCharacter(character: Character) {
    if (gameState) {
      const characterAge = calculateAge(
        new Date(character.birthdate),
        character.deathdate
          ? new Date(character.deathdate)
          : new Date(gameState.date),
      );

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
              <Text className="text-center text-2xl">
                {character.getFullName()}
              </Text>
              <View className="mx-auto">
                <CharacterImage
                  characterAge={characterAge}
                  characterSex={character.sex == "male" ? "M" : "F"}
                />
              </View>
              <Text className="text-xl">
                {character.deathdate && "Died at "}
                {characterAge} Years Old
              </Text>
              <Text className="text-center text-xl">
                {character.getFullName()}
              </Text>
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
  }

  function goToFight() {
    setBadOutcome(null);
    setTimeout(() => {
      if (badOutCome && badOutCome.fight && badOutCome.dungeonTitle) {
        while (router.canGoBack()) {
          router.back();
        }
        router.replace(`/DungeonLevel/Activities/${badOutCome?.dungeonTitle}`);
      } else {
        throw new Error("missing enemy object!");
      }
    }, 500);
  }

  function payOff(gold: number) {
    playerState?.spendGold(gold);
    setBadOutcome(null);
    playerState?.setInDungeon({ state: false });
    playerState?.setSavedEnemy(null);
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
          {playerState && gameState && (
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
                  .getAllAdultCharacters(new Date(gameState.date))
                  .map((character) => renderCharacter(character))}
              </View>
            </ScrollView>
          )}
          <View className="mt-4">
            <GenericFlatButton
              text={"Cancel"}
              onPressFunction={() => setShowDatePartnerSelection(false)}
            />
          </View>
        </View>
      </GenericModal>
      <CharacterInteractionModal
        character={metCharacter}
        closeFunction={() => setMetCharacter(null)}
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
            <GenericFlatButton
              text={"Close"}
              onPressFunction={() => setGoodOutcome(null)}
            />
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
                        onPressFunction={() => payOff(badOutCome.buyOff!.price)}
                        textNode={
                          <View className="flex flex-row">
                            <Text>
                              Save yourself for{" "}
                              {badOutCome.buyOff.price <= playerState?.gold
                                ? badOutCome.buyOff.price
                                : playerState.gold}{" "}
                            </Text>
                            <Coins height={14} width={14} />
                          </View>
                        }
                      />
                      <GenericStrikeAround
                        textNode={<Text className="my-2 text-lg">Or</Text>}
                      />
                    </>
                  )}
                <GenericFlatButton
                  onPressFunction={goToFight}
                  text={"Fight!"}
                />
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
              <GenericFlatButton
                onPressFunction={() => setBadOutcome(null)}
                text={"Close"}
              />
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
            <GenericFlatButton
              text={"Close"}
              onPressFunction={() => setNothingHappened(false)}
            />
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
                disabledCondition={
                  playerState && playerState.gold < activity.cost
                }
                onPressFunction={visit}
                text={"Visit Alone"}
              />
            )}
            {activity.date && gameState && (
              <GenericRaisedButton
                disabledCondition={
                  playerState?.getAllAdultCharacters(new Date(gameState.date))
                    .length == 0
                }
                onPressFunction={() => dateSelect(activity.name)}
                text={"Go on Date"}
              />
            )}
          </View>
        </View>
      </ThemedView>
    </>
  );
});
export default ActivityCard;
