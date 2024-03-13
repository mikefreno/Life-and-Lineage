import { observer } from "mobx-react-lite";
import { View } from "react-native";
import { Text } from "./Themed";
import { Character } from "../classes/character";
import GenericModal from "./GenericModal";
import {
  EnemyContext,
  GameContext,
  PlayerCharacterContext,
} from "../app/_layout";
import { useContext, useEffect, useState } from "react";
import { CharacterImage } from "./CharacterImage";
import { calculateAge } from "../utility/functions/misc/age";
import ProgressBar from "./ProgressBar";
import AffectionIcon from "../assets/icons/AffectionIcon";
import GenericFlatButton from "./GenericFlatButton";
import GenericStrikeAround from "./GenericStrikeAround";
import { useVibration } from "../utility/customHooks";
import GenericRaisedButton from "./GenericRaisedButton";
import { Enemy } from "../classes/creatures";
import { useRouter } from "expo-router";
import { getDaysBetweenDates } from "../utility/functions/misc/date";

interface CharacterInteractionModal {
  character: Character | null;
  closeFunction: () => void;
  secondaryRequirement?: boolean;
  backdropCloses?: boolean;
  showGiftModal: () => void;
}
export const CharacterInteractionModal = observer(
  ({
    character,
    closeFunction,
    secondaryRequirement = true,
    backdropCloses = false,
    showGiftModal,
  }: CharacterInteractionModal) => {
    const playerContext = useContext(PlayerCharacterContext);
    const gameContext = useContext(GameContext);
    const enemyContext = useContext(EnemyContext);
    if (!playerContext || !gameContext || !enemyContext) {
      throw new Error("missing context");
    }
    const { playerState } = playerContext;
    const { gameState } = gameContext;
    const [showAssaultWarning, setShowAssaultWarning] =
      useState<boolean>(false);
    const [dateAvailable, setDateAvailable] = useState<boolean>(
      character?.dateCooldownStart && gameState?.date
        ? getDaysBetweenDates(
            new Date(character.dateCooldownStart),
            new Date(gameState.date),
          ) > 7
        : true,
    );

    const router = useRouter();

    const { setEnemy } = enemyContext;
    const vibration = useVibration();
    const characterAge =
      character && gameState
        ? calculateAge(new Date(character.birthdate), new Date(gameState.date))
        : 0;

    function setFight() {
      if (character && playerState && gameState) {
        const enemy = new Enemy({
          creatureSpecies: character.getFullName(),
          health: 75 - characterAge / 5,
          healthMax: 75 - characterAge / 5,
          sanity: 50,
          sanityMax: 50,
          baseArmor: 75 - characterAge ?? undefined,
          attackPower: 10,
          energy: 50,
          energyMax: 50,
          energyRegen: 10,
          attacks: ["stab"],
        });
        playerState.setInDungeon({
          state: true,
          instance: "Personal",
          level: "Personal Assault",
        });
        setEnemy(enemy);
        playerState.setSavedEnemy(enemy);
        gameState.gameTick(playerState);
        router.push(`/DungeonLevel/Personal/Personal\ Assault`);
      }
    }

    useEffect(() => {
      if (character?.dateCooldownStart && gameState?.date) {
        setDateAvailable(
          getDaysBetweenDates(
            new Date(character.dateCooldownStart),
            new Date(gameState.date),
          ) > 7,
        );
      }
    }, [gameState?.date, character?.dateCooldownStart]);

    return (
      <GenericModal
        isVisibleCondition={character != null && secondaryRequirement}
        backdropCloses={backdropCloses}
        backFunction={closeFunction}
        size={100}
      >
        {character && gameState && (
          <View className="">
            <Text className="text-center text-xl">
              {character.getFullName()}
            </Text>
            <View className="mx-auto">
              <CharacterImage
                characterAge={characterAge}
                characterSex={character.sex == "male" ? "M" : "F"}
              />
            </View>
            {!showAssaultWarning ? (
              <View>
                <View className="items-center">
                  <Text>{characterAge} years old</Text>
                  <Text className="px-10 text-center">
                    Works as a {character.job}
                  </Text>
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
                {playerState?.isKnownCharacter(character) ? (
                  <>
                    <GenericStrikeAround text={"Interactions"} />
                    <View className="mt-2 flex flex-row justify-evenly">
                      <GenericFlatButton
                        text="Chat"
                        disabledCondition={!dateAvailable}
                        onPressFunction={() => {
                          vibration({ style: "light" });
                          character.setDateCooldownStart(gameState.date);
                          character.updateAffection(5);
                          gameState.gameTick(playerState);
                        }}
                      />
                      <GenericFlatButton
                        text="Give a Gift"
                        disabledCondition={!dateAvailable}
                        onPressFunction={() => {
                          vibration({ style: "light" });
                          showGiftModal();
                        }}
                      />
                    </View>
                    <View className="mt-2 flex flex-row justify-evenly">
                      <GenericFlatButton
                        text="Spit in Face"
                        disabledCondition={!dateAvailable}
                        onPressFunction={() => {
                          vibration({ style: "light" });
                          character.setDateCooldownStart(gameState.date);
                          character.updateAffection(-10);
                          gameState.gameTick(playerState);
                        }}
                      />
                    </View>
                    {character.affection > -25 && (
                      <View className="mt-2 flex flex-row justify-evenly">
                        <GenericFlatButton
                          text="Assault"
                          onPressFunction={() => {
                            vibration({ style: "warning", essential: true });
                            setShowAssaultWarning(true);
                          }}
                        />
                      </View>
                    )}
                  </>
                ) : (
                  <>
                    <GenericStrikeAround text={"Greetings"} />
                    <View className="mt-2 flex flex-row justify-evenly">
                      <GenericFlatButton
                        text="Friendly"
                        onPressFunction={() => {
                          vibration({ style: "light" });
                          character.updateAffection(5);
                          if (playerState && gameState) {
                            playerState.addNewKnownCharacter(character);
                            gameState.gameTick(playerState);
                          }
                        }}
                      />
                      <GenericFlatButton
                        text="Aggressive"
                        onPressFunction={() => {
                          vibration({ style: "light" });
                          character.updateAffection(-5);
                          if (playerState && gameState) {
                            playerState.addNewKnownCharacter(character);
                            gameState.gameTick(playerState);
                          }
                        }}
                      />
                    </View>
                  </>
                )}
                <View className="mt-2">
                  <GenericFlatButton
                    text={"Close"}
                    onPressFunction={closeFunction}
                  />
                </View>
              </View>
            ) : (
              <View>
                <Text
                  className="text-center text-2xl"
                  style={{ color: "#ef4444" }}
                >
                  Warning:{" "}
                </Text>
                <Text className="text-center text-lg">
                  Are you certain you want to do that? You will start a fight{" "}
                  <Text className="italic" style={{ color: "#ef4444" }}>
                    that could end in {character.getFullName()}'s death.
                  </Text>
                </Text>
                <View className="mt-2 flex flex-row justify-evenly">
                  <View className="my-auto">
                    <GenericFlatButton
                      text="I'm sure."
                      backgroundColor={"#450a0a"}
                      onPressFunction={() => {
                        vibration({ style: "warning", essential: true });
                        setFight();
                      }}
                    />
                  </View>
                  <GenericRaisedButton
                    text="Take me back!"
                    backgroundColor={"#3b82f6"}
                    disableTopLevelStyling
                    onPressFunction={() => {
                      vibration({ style: "light" });
                      setShowAssaultWarning(false);
                    }}
                  />
                </View>
              </View>
            )}
          </View>
        )}
      </GenericModal>
    );
  },
);
