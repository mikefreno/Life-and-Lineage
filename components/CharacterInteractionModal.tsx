import { observer } from "mobx-react-lite";
import { View } from "react-native";
import { Text } from "./Themed";
import { Character } from "../classes/character";
import GenericModal from "./GenericModal";
import { GameContext, PlayerCharacterContext } from "../app/_layout";
import { useContext } from "react";
import { CharacterImage } from "./CharacterImage";
import { calculateAge } from "../utility/functions/misc";
import ProgressBar from "./ProgressBar";
import AffectionIcon from "../assets/icons/AffectionIcon";
import GenericFlatButton from "./GenericFlatButton";
import GenericStrikeAround from "./GenericStrikeAround";
import { useVibration } from "../utility/customHooks";

interface CharacterInteractionModal {
  character: Character | null;
  closeFunction: () => void;
}
export const CharacterInteractionModal = observer(
  ({ character, closeFunction }: CharacterInteractionModal) => {
    const playerContext = useContext(PlayerCharacterContext);
    const gameContext = useContext(GameContext);
    if (!playerContext || !gameContext) {
      throw new Error("missing context");
    }
    const { playerState } = playerContext;
    const { gameState } = gameContext;

    const vibration = useVibration();

    return (
      <GenericModal
        isVisibleCondition={character != null}
        backdropCloses={false}
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
            {!playerState?.isKnownCharacter(character) && (
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
        )}
      </GenericModal>
    );
  },
);
