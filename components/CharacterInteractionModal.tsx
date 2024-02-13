import { observer } from "mobx-react-lite";
import { View } from "react-native";
import { Text } from "./Themed";
import { Character } from "../classes/character";
import GenericModal from "./GenericModal";
import { GameContext, PlayerCharacterContext } from "../app/_layout";
import { useContext, useState } from "react";
import { CharacterImage } from "./CharacterImage";
import { calculateAge } from "../utility/functions/misc/age";
import ProgressBar from "./ProgressBar";
import AffectionIcon from "../assets/icons/AffectionIcon";
import GenericFlatButton from "./GenericFlatButton";
import GenericStrikeAround from "./GenericStrikeAround";
import { useVibration } from "../utility/customHooks";
import GenericRaisedButton from "./GenericRaisedButton";

interface CharacterInteractionModal {
  character: Character | null;
  closeFunction: () => void;
  secondaryRequirement?: boolean;
  backdropCloses?: boolean;
}
export const CharacterInteractionModal = observer(
  ({
    character,
    closeFunction,
    secondaryRequirement = true,
    backdropCloses = false,
  }: CharacterInteractionModal) => {
    const playerContext = useContext(PlayerCharacterContext);
    const gameContext = useContext(GameContext);
    if (!playerContext || !gameContext) {
      throw new Error("missing context");
    }
    const { playerState } = playerContext;
    const { gameState } = gameContext;
    const [showAssaultWarning, setShowAssaultWarning] =
      useState<boolean>(false);

    const vibration = useVibration();

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
                characterAge={calculateAge(
                  new Date(character.birthdate),
                  new Date(gameState.date),
                )}
                characterSex={character.sex == "male" ? "M" : "F"}
              />
            </View>
            {!showAssaultWarning ? (
              <View>
                <View className="items-center">
                  <Text>
                    {calculateAge(
                      new Date(character.birthdate),
                      new Date(gameState.date),
                    )}{" "}
                    years old
                  </Text>
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
                        backgroundColor={"#60a5fa"}
                        onPressFunction={() => {
                          vibration({ style: "light" });
                          character.updateAffection(5);
                        }}
                      />
                      <GenericFlatButton
                        backgroundColor={"#3b82f6"}
                        text="Give a Gift"
                        onPressFunction={() => {
                          vibration({ style: "light" });
                        }}
                      />
                    </View>
                    <View className="mt-2 flex flex-row justify-evenly">
                      <GenericFlatButton
                        text="Spit in Face"
                        backgroundColor={"#dc2626"}
                        onPressFunction={() => {
                          vibration({ style: "light" });
                          character.updateAffection(-10);
                        }}
                      />
                    </View>
                    {character.affection > -25 && (
                      <View className="mt-2 flex flex-row justify-evenly">
                        <GenericFlatButton
                          text="Assault"
                          backgroundColor={"#450a0a"}
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
                          playerState?.addNewKnownCharacter(character);
                        }}
                      />
                      <GenericFlatButton
                        text="Aggressive"
                        onPressFunction={() => {
                          vibration({ style: "light" });
                          character.updateAffection(-5);
                          playerState?.addNewKnownCharacter(character);
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
