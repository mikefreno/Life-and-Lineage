import { observer } from "mobx-react-lite";
import { View } from "react-native";
import { Text } from "@/components/Themed";
import GenericModal from "@/components/GenericModal";
import { useState } from "react";
import { CharacterImage } from "@/components/CharacterImage";
import { toTitleCase, wait } from "@/utility/functions/misc";
import ProgressBar from "@/components/ProgressBar";
import GenericFlatButton from "./GenericFlatButton";
import GenericStrikeAround from "@/components/GenericStrikeAround";
import GenericRaisedButton from "@/components/GenericRaisedButton";
import { useRouter } from "expo-router";
import { AffectionIcon } from "@/assets/icons/SVGIcons";
import { Character } from "@/entities/character";
import { usePlayerStore, useRootStore } from "@/hooks/stores";
import { useVibration } from "@/hooks/generic";
import { flex, useStyles } from "@/hooks/styles";
import React from "react";
import { DungeonLevel } from "@/entities/dungeon";

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

    const [pregnancyMessage, setPregnancyMessage] = useState<string | null>(
      null,
    );
    const [dateRequestResult, setDateRequestResult] = useState<
      "success" | "failure" | null
    >(null);

    const router = useRouter();
    const vibration = useVibration();

    function setFight() {
      if (character && playerState) {
        const activityInstance =
          root.dungeonStore.initActivityDungeon("AutumnForest");

        const activityDungeon = new DungeonLevel({
          level: 0,
          bossEncounter: [],
          normalEncounters: [],
          tiles: 1,
          bossDefeated: true,
          unlocked: true,
          dungeonStore: root.dungeonStore,
          specialEncounters: [],
          parent: activityInstance,
          isActivity: true,
          nameOverride: "Assault",
        });
        activityInstance.setLevels([activityDungeon]);
        root.enemyStore.clearEnemyList();
        root.enemyStore.addToEnemyList(character);

        root.dungeonStore.setUpActivity(activityInstance, activityDungeon);
        root.dungeonStore.setEncounter(false);
        closeFunction();
        wait(500).then(() => {
          router.dismissAll();
          router.replace(`/DungeonLevel/`);
        });
      }
    }

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
      }
    }

    return (
      <GenericModal
        isVisibleCondition={character != null && secondaryRequirement}
        backdropCloses={
          showAssaultWarning || dateRequestResult ? false : backdropCloses
        }
        backFunction={closeFunction}
        size={100}
        scrollEnabled={true}
      >
        {character && (
          <>
            <Text style={{ textAlign: "center", ...styles["text-xl"] }}>
              {character.fullName}
            </Text>
            <View
              style={{
                width: uiStore.dimensions.lesser * 0.3,
                height: uiStore.dimensions.lesser * 0.3,
                alignSelf: "center",
              }}
            >
              <CharacterImage character={character} />
            </View>
            {showAssaultWarning ? (
              <AssaultWarningSection
                character={character}
                setFight={setFight}
                setShowAssaultWarning={setShowAssaultWarning}
                vibration={vibration}
              />
            ) : dateRequestResult ? (
              <DatingRequestResultSection
                dateRequestResult={dateRequestResult}
                clear={() => setDateRequestResult(null)}
                firstName={character.firstName}
              />
            ) : (
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
                  <KnownCharacterInteractions
                    character={character}
                    showGiftModal={showGiftModal}
                    attemptPregnancy={attemptPregnancy}
                    showAdoptionModal={showAdoptionModal}
                    setDateRequestResult={setDateRequestResult}
                    setShowAssaultWarning={setShowAssaultWarning}
                  />
                ) : (
                  <FirstMeetingInteractions character={character} />
                )}
                <View style={{ marginTop: 8 }}>
                  <GenericFlatButton onPress={closeFunction}>
                    Close
                  </GenericFlatButton>
                </View>
              </View>
            )}
          </>
        )}
      </GenericModal>
    );
  },
);

const AssaultWarningSection = React.memo(
  ({
    character,
    setFight,
    setShowAssaultWarning,
    vibration,
  }: {
    character: Character;
    setFight: () => void;
    setShowAssaultWarning: React.Dispatch<React.SetStateAction<boolean>>;
    vibration: ({
      style,
      essential,
    }: {
      style: "light" | "medium" | "heavy" | "success" | "warning" | "error";
      essential?: boolean;
    }) => void;
  }) => {
    const styles = useStyles();
    return (
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
    );
  },
);

const DatingRequestResultSection = ({
  dateRequestResult,
  clear,
  firstName,
}: {
  dateRequestResult: "success" | "failure";
  clear: () => void;
  firstName: string;
}) => {
  const styles = useStyles();
  if (dateRequestResult === "failure") {
    return (
      <View>
        <Text style={{ ...styles["text-3xl"], textAlign: "center" }}>
          REJECTED!
        </Text>
        <Text style={{ ...styles["text-lg"], textAlign: "center" }}>
          That's tough, {toTitleCase(firstName)} is more likely to say yes if
          you have a better relationship.
        </Text>
        <GenericFlatButton onPress={clear}>Back</GenericFlatButton>
      </View>
    );
  } else {
    return (
      <View>
        <Text style={{ ...styles["text-3xl"], textAlign: "center" }}>
          They said yes!
        </Text>
        <Text style={{ ...styles["text-lg"], textAlign: "center" }}>
          Where will this relationship lead...?
        </Text>
        <GenericFlatButton onPress={clear}>Back</GenericFlatButton>
      </View>
    );
  }
};

const KnownCharacterInteractions = observer(
  ({
    character,
    showGiftModal,
    attemptPregnancy,
    showAdoptionModal,
    setDateRequestResult,
    setShowAssaultWarning,
  }: {
    character: Character;
    showGiftModal: () => void;
    attemptPregnancy: (char: Character) => void;
    showAdoptionModal: (name: string) => void;
    setDateRequestResult: React.Dispatch<
      React.SetStateAction<"success" | "failure" | null>
    >;
    setShowAssaultWarning: React.Dispatch<React.SetStateAction<boolean>>;
  }) => {
    const vibration = useVibration();
    const playerState = usePlayerStore();
    return (
      <>
        <GenericStrikeAround>Interactions</GenericStrikeAround>
        <View style={[flex.rowEvenly, { marginTop: 8 }]}>
          <GenericFlatButton
            disabled={!character.dateAvailable}
            onPress={() => {
              vibration({ style: "light" });
              playerState.root.gameTick();
              character.setDateCooldownStart();
              character.updateAffection(5);
            }}
          >
            Chat
          </GenericFlatButton>
          {/*TODO*/}
          {__DEV__ && (
            <GenericFlatButton
              disabled={!character.dateAvailable}
              onPress={() => {
                vibration({ style: "light" });
                showGiftModal();
              }}
            >
              Give a Gift
            </GenericFlatButton>
          )}
        </View>
        <View style={{ paddingTop: 8 }}>
          {character.age >= 18 &&
            playerState.canDate({
              character,
              characterAge: character.age,
            }) &&
            (playerState.partners.find((partner) =>
              partner.equals(character.id),
            ) ? (
              character.sex !== playerState.sex ? (
                <>
                  <GenericFlatButton
                    disabled={!character.dateAvailable}
                    onPress={() => {
                      vibration({ style: "light" });
                      playerState.root.gameTick();
                      attemptPregnancy(character);
                    }}
                  >
                    Try for a Baby
                  </GenericFlatButton>
                  <GenericFlatButton
                    disabled={!character.dateAvailable}
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
                  disabled={!character.dateAvailable}
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
                disabled={!character.dateAvailable}
                onPress={() => {
                  vibration({ style: "light" });
                  playerState.root.gameTick();
                  character.setDateCooldownStart();
                  const res = playerState.askForPartner(character);
                  setDateRequestResult(res === true ? "success" : "failure");
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
                disabled={!character.dateAvailable}
                onPress={() => {
                  vibration({ style: "light" });
                  playerState.root.gameTick();
                  character.setDateCooldownStart();
                  character.updateAffection(-5);
                }}
              >
                Spit in Face
              </GenericFlatButton>
            </View>
            {character.affection <= -25 && (
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
    );
  },
);

const FirstMeetingInteractions = observer(
  ({ character }: { character: Character }) => {
    const vibration = useVibration();
    const playerState = usePlayerStore();

    return (
      <>
        <GenericStrikeAround>Greetings</GenericStrikeAround>
        <View style={[flex.rowEvenly, { marginTop: 8 }]}>
          <GenericFlatButton
            onPress={() => {
              vibration({ style: "light" });
              playerState.root.gameTick();
              playerState.setDateCooldownStart();
              playerState.addKnownCharacter(character);
              character.updateAffection(5);
            }}
          >
            Friendly
          </GenericFlatButton>
          <GenericFlatButton
            onPress={() => {
              vibration({ style: "light" });
              playerState.root.gameTick();
              playerState.setDateCooldownStart();
              playerState.addKnownCharacter(character);
              character.updateAffection(-5);
            }}
          >
            Aggressive
          </GenericFlatButton>
        </View>
      </>
    );
  },
);
