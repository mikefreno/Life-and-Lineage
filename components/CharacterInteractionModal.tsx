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
import { flex, useStyles } from "../hooks/styles";
import React from "react";

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
    const root = useRootStore();
    const styles = useStyles();
    const { playerState, uiStore } = root;
    const [showAssaultWarning, setShowAssaultWarning] =
      useState<boolean>(false);
    const [dateAvailable, setDateAvailable] = useState<boolean>(
      character?.dateCooldownStart
        ? character.dateCooldownStart.week !== root.time.week &&
            character.dateCooldownStart.year !== root.time.year
        : true,
    );

    const [pregnancyMessage, setPregnancyMessage] = useState<string | null>(
      null,
    );

    const router = useRouter();

    const vibration = useVibration();

    function setFight() {
      if (character && playerState) {
        root.gameTick();
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
          character.dateCooldownStart.week !== root.time.week &&
            character.dateCooldownStart.year !== root.time.year,
        );
      }
    }, [root.time.year, root.time.week, character?.dateCooldownStart]);

    function attemptPregnancy(character: Character) {
      if (playerState && character) {
        const mother = playerState.sex === "female" ? playerState : character;

        if (mother.initiatePregnancy()) {
          setPregnancyMessage(`${mother.firstName} is now pregnant!`);
          setTimeout(() => setPregnancyMessage(null), 3000);
        } else {
          setPregnancyMessage(
            `The attempt was unsuccessful. ${mother.firstName} might already be pregnant.`,
          );
          setTimeout(() => setPregnancyMessage(null), 3000);
        }

        root.gameTick();
      }
    }

    return (
      <GenericModal
        isVisibleCondition={character != null && secondaryRequirement}
        backdropCloses={backdropCloses}
        backFunction={closeFunction}
        size={100}
        scrollEnabled={true}
      >
        {character && (
          <>
            <Text style={{ textAlign: "center", ...styles["text-xl"] }}>
              {character.fullName}
            </Text>
            <CharacterImage character={character} />
            {!showAssaultWarning ? (
              <View>
                <View style={{ alignItems: "center" }}>
                  <Text>{character.age} years old</Text>
                  <Text style={{ paddingHorizontal: 40, textAlign: "center" }}>
                    Works as a {character.job}
                  </Text>
                  <View style={[flex.rowCenter, { width: "66%" }]}>
                    <View
                      style={{
                        width: "75%",
                        justifyContent: "center",
                        paddingRight: 4,
                      }}
                    >
                      <ProgressBar
                        value={Math.floor(character.affection * 4) / 4}
                        minValue={-100}
                        maxValue={100}
                        filledColor="#dc2626"
                        unfilledColor="#fca5a5"
                      />
                    </View>
                    <AffectionIcon
                      height={uiStore.iconSizeSmall}
                      width={uiStore.iconSizeSmall}
                    />
                  </View>
                </View>
                {playerState?.isKnownCharacter(character) ? (
                  <>
                    <GenericStrikeAround>Interactions</GenericStrikeAround>
                    <View style={[flex.rowEvenly, { marginTop: 8 }]}>
                      <GenericFlatButton
                        disabled={!dateAvailable}
                        onPress={() => {
                          vibration({ style: "light" });
                          character.setDateCooldownStart();
                          character.updateAffection(5);
                          root.gameTick();
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
                    <View style={{ paddingTop: 8 }}>
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
                                  attemptPregnancy(character);
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
                                style={{ marginTop: 8 }}
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
                              root.gameTick();
                            }}
                          >
                            Start Dating?
                          </GenericFlatButton>
                        ))}
                    </View>
                    {!playerState.characterIsChild({ character }) && (
                      <>
                        <View style={[flex.rowEvenly, { marginTop: 8 }]}>
                          <GenericFlatButton
                            disabled={!dateAvailable}
                            onPress={() => {
                              vibration({ style: "light" });
                              character.setDateCooldownStart();
                              character.updateAffection(-10);
                              root.gameTick();
                            }}
                          >
                            Spit in Face
                          </GenericFlatButton>
                        </View>
                        {character.affection > -25 && (
                          <View style={[flex.rowEvenly, { marginTop: 8 }]}>
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
                    <View style={[flex.rowEvenly, { marginTop: 8 }]}>
                      <GenericFlatButton
                        onPress={() => {
                          vibration({ style: "light" });
                          character.updateAffection(5);
                          if (playerState) {
                            playerState.addNewKnownCharacter(character);
                            root.gameTick();
                          }
                        }}
                      >
                        Friendly
                      </GenericFlatButton>
                      <GenericFlatButton
                        onPress={() => {
                          vibration({ style: "light" });
                          character.updateAffection(-5);
                          if (playerState) {
                            playerState.addNewKnownCharacter(character);
                            root.gameTick();
                          }
                        }}
                      >
                        Aggressive
                      </GenericFlatButton>
                    </View>
                  </>
                )}
                <View style={{ marginTop: 8 }}>
                  <GenericFlatButton onPress={closeFunction}>
                    Close
                  </GenericFlatButton>
                </View>
              </View>
            ) : (
              <View>
                <Text
                  style={{
                    textAlign: "center",
                    color: "#ef4444",
                    ...styles["text-2xl"],
                  }}
                >
                  Warning:{" "}
                </Text>
                <Text style={{ textAlign: "center", ...styles["text-lg"] }}>
                  Are you certain you want to do that? You will start a fight{" "}
                  <Text style={{ color: "#ef4444" }}>
                    that could end in {character.fullName}'s death.
                  </Text>
                </Text>
                <View style={[flex.rowEvenly, { marginTop: 8 }]}>
                  <View style={{ marginVertical: "auto" }}>
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
          </>
        )}
      </GenericModal>
    );
  },
);
