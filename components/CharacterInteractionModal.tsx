import { observer } from "mobx-react-lite";
import { View } from "react-native";
import { Text } from "./Themed";
import GenericModal from "./GenericModal";
import { useEffect, useState } from "react";
import { CharacterImage } from "./CharacterImage";
import { wait } from "../utility/functions/misc";
import ProgressBar from "./ProgressBar";
import GenericFlatButton from "./GenericFlatButton";
import GenericStrikeAround from "./GenericStrikeAround";
import GenericRaisedButton from "./GenericRaisedButton";
import { useRouter } from "expo-router";
import { AffectionIcon } from "../assets/icons/SVGIcons";
import { Character } from "../entities/character";
import { useRootStore } from "../hooks/stores";
import { useVibration } from "../hooks/generic";

interface CharacterInteractionModal {
  character: Character | null;
  closeFunction: () => void;
  secondaryRequirement?: boolean;
  backdropCloses?: boolean;
  showGiftModal: () => void;
  showAdoptionModal: (partnerName?: string) => void;
}

export const CharacterInteractionModal = observer(
  ({
    character,
    closeFunction,
    secondaryRequirement = true,
    backdropCloses = false,
    showGiftModal,
    showAdoptionModal,
  }: CharacterInteractionModal) => {
    const { playerState, gameState } = useRootStore();
    const [showAssaultWarning, setShowAssaultWarning] =
      useState<boolean>(false);
    const [dateAvailable, setDateAvailable] = useState<boolean>(
      character?.dateCooldownStart
        ? character.dateCooldownStart.week !== gameState?.timeStore.week &&
            character.dateCooldownStart.year !== gameState?.timeStore.year
        : true,
    );
    const router = useRouter();

    const vibration = useVibration();

    function setFight() {
      if (character && playerState && gameState) {
        gameState.gameTick();
        //TODO: Setup dungeon level and instance
        closeFunction();
        wait(500).then(() => {
          router.dismissAll();
          router.replace(`/DungeonLevel/`);
        });
      }
    }

    useEffect(() => {
      if (character?.dateCooldownStart) {
        setDateAvailable(
          character.dateCooldownStart.week !== gameState?.timeStore.week &&
            character.dateCooldownStart.year !== gameState?.timeStore.year,
        );
      }
    }, [
      gameState?.timeStore.year,
      gameState?.timeStore.week,
      character?.dateCooldownStart,
    ]);

    function showPregnancyInfo() {}

    return (
      <GenericModal
        isVisibleCondition={character != null && secondaryRequirement}
        backdropCloses={backdropCloses}
        backFunction={closeFunction}
        size={100}
      >
        {character && gameState && (
          <View className="">
            <Text className="text-center text-xl">{character.fullName}</Text>
            <View className="mx-auto">
              <CharacterImage
                characterAge={character.age}
                characterSex={character.sex == "male" ? "M" : "F"}
              />
            </View>
            {!showAssaultWarning ? (
              <View>
                <View className="items-center">
                  <Text>{character.age} years old</Text>
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
                        disabled={!dateAvailable}
                        onPress={() => {
                          vibration({ style: "light" });
                          character.setDateCooldownStart();
                          character.updateAffection(5);
                          gameState.gameTick();
                        }}
                      >
                        Chat
                      </GenericFlatButton>
                      <GenericFlatButton
                        disabled={!dateAvailable}
                        onPress={() => {
                          vibration({ style: "light" });
                          showGiftModal();
                        }}
                      >
                        Give a Gift
                      </GenericFlatButton>
                    </View>
                    <View className="pt-2">
                      {character.age >= 18 &&
                        playerState.canDate({
                          character,
                          characterAge: character.age,
                        }) &&
                        (playerState.partners.find((partner) =>
                          partner.equals(character),
                        ) ? (
                          character.sex !== playerState.sex ? (
                            <>
                              <GenericFlatButton
                                disabled={!dateAvailable}
                                onPress={() => {
                                  vibration({ style: "light" });
                                  showPregnancyInfo();
                                }}
                              >
                                Try for a Baby
                              </GenericFlatButton>
                              <GenericFlatButton
                                disabled={!dateAvailable}
                                onPress={() => {
                                  vibration({ style: "light" });
                                  showAdoptionModal(character.fullName);
                                }}
                                className="mt-2"
                              >
                                Suggest Adoption
                              </GenericFlatButton>
                            </>
                          ) : (
                            <GenericFlatButton
                              disabled={!dateAvailable}
                              onPress={() => {
                                vibration({ style: "light" });
                                showAdoptionModal(character.fullName);
                              }}
                            >
                              Suggest Adoption
                            </GenericFlatButton>
                          )
                        ) : (
                          <GenericFlatButton
                            disabled={!dateAvailable}
                            onPress={() => {
                              vibration({ style: "light" });
                              character.setDateCooldownStart();
                              playerState.askForPartner(character);
                              gameState.gameTick();
                            }}
                          >
                            Start Dating?
                          </GenericFlatButton>
                        ))}
                    </View>
                    {!playerState.characterIsChild({ character }) && (
                      <>
                        <View className="mt-2 flex flex-row justify-evenly">
                          <GenericFlatButton
                            disabled={!dateAvailable}
                            onPress={() => {
                              vibration({ style: "light" });
                              character.setDateCooldownStart();
                              character.updateAffection(-10);
                              gameState.gameTick();
                            }}
                          >
                            Spit in Face
                          </GenericFlatButton>
                        </View>
                        {character.affection > -25 && (
                          <View className="mt-2 flex flex-row justify-evenly">
                            <GenericFlatButton
                              onPress={() => {
                                vibration({
                                  style: "warning",
                                  essential: true,
                                });
                                setShowAssaultWarning(true);
                              }}
                            >
                              Assault
                            </GenericFlatButton>
                          </View>
                        )}
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <GenericStrikeAround>Greetings</GenericStrikeAround>
                    <View className="mt-2 flex flex-row justify-evenly">
                      <GenericFlatButton
                        onPress={() => {
                          vibration({ style: "light" });
                          character.updateAffection(5);
                          if (playerState && gameState) {
                            playerState.addNewKnownCharacter(character);
                            gameState.gameTick();
                          }
                        }}
                      >
                        Friendly
                      </GenericFlatButton>
                      <GenericFlatButton
                        onPress={() => {
                          vibration({ style: "light" });
                          character.updateAffection(-5);
                          if (playerState && gameState) {
                            playerState.addNewKnownCharacter(character);
                            gameState.gameTick();
                          }
                        }}
                      >
                        Aggressive
                      </GenericFlatButton>
                    </View>
                  </>
                )}
                <View className="mt-2">
                  <GenericFlatButton onPress={closeFunction}>
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
                  <Text style={{ color: "#ef4444" }}>
                    that could end in {character.fullName}'s death.
                  </Text>
                </Text>
                <View className="mt-2 flex flex-row justify-evenly">
                  <View className="my-auto">
                    <GenericFlatButton
                      backgroundColor={"#450a0a"}
                      textColor={"#a1a1aa"}
                      onPress={() => {
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
                    onPress={() => {
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
