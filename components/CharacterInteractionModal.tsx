import { observer } from "mobx-react-lite";
import { View } from "react-native";
import { Text } from "./Themed";
import { Character } from "../classes/character";
import GenericModal from "./GenericModal";
import { useContext, useEffect, useState } from "react";
import { CharacterImage } from "./CharacterImage";
import { calculateAge } from "../utility/functions/misc/age";
import ProgressBar from "./ProgressBar";
import AffectionIcon from "../assets/icons/AffectionIcon";
import GenericFlatButton from "./GenericFlatButton";
import GenericStrikeAround from "./GenericStrikeAround";
import { useVibration } from "../utility/customHooks";
import GenericRaisedButton from "./GenericRaisedButton";
import { useRouter } from "expo-router";
import { getDaysBetweenDates } from "../utility/functions/misc/date";
import { AppContext } from "../app/_layout";

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
    const appData = useContext(AppContext);
    if (!appData) {
      throw new Error("missing context");
    }
    const { playerState, gameState } = appData;
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

    const vibration = useVibration();
    const characterAge =
      character && gameState
        ? calculateAge(new Date(character.birthdate), new Date(gameState.date))
        : 0;

    function setFight() {
      if (character && playerState && gameState) {
        gameState.gameTick(playerState);
        router.push(
          `/DungeonLevel/Personal/Personal\ Assault/${character.getFullName()}`,
        );
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
                    <GenericStrikeAround>Interactions</GenericStrikeAround>
                    <View className="mt-2 flex flex-row justify-evenly">
                      <GenericFlatButton
                        disabledCondition={!dateAvailable}
                        onPressFunction={() => {
                          vibration({ style: "light" });
                          character.setDateCooldownStart(gameState.date);
                          character.updateAffection(5);
                          gameState.gameTick(playerState);
                        }}
                      >
                        Chat
                      </GenericFlatButton>
                      <GenericFlatButton
                        disabledCondition={!dateAvailable}
                        onPressFunction={() => {
                          vibration({ style: "light" });
                          showGiftModal();
                        }}
                      >
                        Give a Gift
                      </GenericFlatButton>
                    </View>
                    <View className="mt-2 flex flex-row justify-evenly">
                      <GenericFlatButton
                        disabledCondition={!dateAvailable}
                        onPressFunction={() => {
                          vibration({ style: "light" });
                          character.setDateCooldownStart(gameState.date);
                          character.updateAffection(-10);
                          gameState.gameTick(playerState);
                        }}
                      >
                        Spit in Face
                      </GenericFlatButton>
                    </View>
                    {character.affection > -25 && (
                      <View className="mt-2 flex flex-row justify-evenly">
                        <GenericFlatButton
                          onPressFunction={() => {
                            vibration({ style: "warning", essential: true });
                            setShowAssaultWarning(true);
                          }}
                        >
                          Assault
                        </GenericFlatButton>
                      </View>
                    )}
                  </>
                ) : (
                  <>
                    <GenericStrikeAround>Greetings</GenericStrikeAround>
                    <View className="mt-2 flex flex-row justify-evenly">
                      <GenericFlatButton
                        onPressFunction={() => {
                          vibration({ style: "light" });
                          character.updateAffection(5);
                          if (playerState && gameState) {
                            playerState.addNewKnownCharacter(character);
                            gameState.gameTick(playerState);
                          }
                        }}
                      >
                        Friendly
                      </GenericFlatButton>
                      <GenericFlatButton
                        onPressFunction={() => {
                          vibration({ style: "light" });
                          character.updateAffection(-5);
                          if (playerState && gameState) {
                            playerState.addNewKnownCharacter(character);
                            gameState.gameTick(playerState);
                          }
                        }}
                      >
                        Aggressive
                      </GenericFlatButton>
                    </View>
                  </>
                )}
                <View className="mt-2">
                  <GenericFlatButton onPressFunction={closeFunction}>
                    Close
                  </GenericFlatButton>
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
                      backgroundColor={"#450a0a"}
                      onPressFunction={() => {
                        vibration({ style: "warning", essential: true });
                        setFight();
                      }}
                    >
                      I'm sure.
                    </GenericFlatButton>
                  </View>
                  <GenericRaisedButton
                    backgroundColor={"#3b82f6"}
                    disableTopLevelStyling
                    onPressFunction={() => {
                      vibration({ style: "light" });
                      setShowAssaultWarning(false);
                    }}
                  >
                    Take me back!
                  </GenericRaisedButton>
                </View>
              </View>
            )}
          </View>
        )}
      </GenericModal>
    );
  },
);
