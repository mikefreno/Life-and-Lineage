import React from "react";
import { Pressable, ScrollView, View } from "react-native";
import { Text, ThemedView } from "../components/Themed";
import deathMessages from "../assets/json/deathMessages.json";
import { useEffect, useState } from "react";
import { router } from "expo-router";
import { CharacterImage } from "../components/CharacterImage";
import { wait } from "../utility/functions/misc";
import GenericStrikeAround from "../components/GenericStrikeAround";
import GenericModal from "../components/GenericModal";
import GenericFlatButton from "../components/GenericFlatButton";
import { Element, ElementToString, PlayerClassOptions } from "../utility/types";
import {
  NecromancerSkull,
  PaladinHammer,
  RangerIcon,
  WizardHat,
} from "../assets/icons/SVGIcons";
import BlessingDisplay from "../components/BlessingsDisplay";
import { Entypo } from "@expo/vector-icons";
import Colors, { elementalColorMap } from "../constants/Colors";
import { getStartingBaseStats } from "../utility/functions/characterAid";
import {
  savePlayer,
  type Character,
  PlayerCharacter,
} from "../entities/character";
import { useRootStore } from "../hooks/stores";
import { useVibration } from "../hooks/generic";
import { Item } from "../entities/item";
import { useHeaderHeight } from "@react-navigation/elements";
import CheckpointModal from "../components/CheckpointModal";
import { flex, tw, useStyles } from "../hooks/styles";

export default function DeathScreen() {
  const [nextLife, setNextLife] = useState<Character | null>(null);
  const [deathMessage, setDeathMessage] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<PlayerClassOptions | null>(
    null,
  );
  const [selectedBlessing, setSelectedBlessing] = useState<Element | null>(
    null,
  );
  const [page, setPage] = useState<number>(0);
  const [isCheckpointModalVisible, setIsCheckpointModalVisible] =
    useState(false);

  const root = useRootStore();
  const { playerState, uiStore } = root;
  const vibration = useVibration();
  const header = useHeaderHeight();
  const styles = useStyles();

  const getDeathMessage = () => {
    const randomIndex = Math.floor(Math.random() * deathMessages.length);
    return deathMessages[randomIndex].message;
  };

  useEffect(() => {
    root.hitDeathScreen();
    setDeathMessage(getDeathMessage());
  }, []);

  function startNewGame() {
    root.startingNewGame = true;
    router.push("/NewGame/ClassSelect");
  }

  function createPlayerCharacter() {
    if (nextLife && selectedClass && selectedBlessing && playerState) {
      const inventory = [
        ...playerState.inventory,
        playerState.equipment.mainHand.name.toLowerCase() !== "unarmored"
          ? playerState.equipment.mainHand
          : null,
        playerState.equipment.body,
        playerState.equipment.head,
        playerState.equipment.offHand,
      ].filter((item): item is Item => item !== null);
      //@ts-ignore
      const newCharacter = new PlayerCharacter({
        firstName: nextLife.firstName,
        lastName: nextLife.lastName,
        sex: nextLife.sex,
        playerClass: selectedClass,
        blessing: selectedBlessing,
        parents: nextLife.parents ?? [],
        birthdate: nextLife.birthdate,
        investments: playerState?.investments,
        gold: playerState.gold / playerState.children.length,
        keyItems: playerState?.keyItems,
        baseInventory: inventory,
        ...getStartingBaseStats({ classSelection: selectedClass }),
        root,
      });
      return newCharacter;
    }
  }

  const startNextLife = () => {
    const newPlayerCharacter = createPlayerCharacter();
    if (newPlayerCharacter) {
      savePlayer(newPlayerCharacter);
      const skillPoints = root.inheritance();
      newPlayerCharacter.addSkillPoint({ amount: skillPoints });
      wait(500).then(() => {
        router.dismissAll();
        router.replace("/");
      });
    }
  };

  if (playerState) {
    return (
      <>
        <GenericModal
          isVisibleCondition={!!nextLife}
          backFunction={() => setNextLife(null)}
          size={100}
        >
          <View>
            {page == 0 && (
              <>
                <MinimalClassSelect
                  dimensions={uiStore.dimensions}
                  vibration={vibration}
                  selectedClass={selectedClass}
                  setSelectedClass={setSelectedClass}
                  colorScheme={uiStore.colorScheme}
                />
                <GenericFlatButton
                  onPress={() => setPage(1)}
                  disabled={!selectedClass}
                >
                  Select Blessing
                </GenericFlatButton>
              </>
            )}
            {page == 1 && selectedClass && (
              <>
                <Pressable onPress={() => setPage(0)}>
                  <Entypo
                    name="chevron-left"
                    size={24}
                    color={uiStore.colorScheme === "dark" ? "#f4f4f5" : "black"}
                  />
                </Pressable>
                <MinimalBlessingSelect
                  playerClass={selectedClass}
                  blessing={selectedBlessing}
                  setBlessing={setSelectedBlessing}
                  vibration={vibration}
                  colorScheme={uiStore.colorScheme}
                  dimensions={uiStore.dimensions}
                />
                <GenericFlatButton
                  onPress={startNextLife}
                  disabled={!selectedClass}
                >
                  Continue Lineage
                </GenericFlatButton>
              </>
            )}
          </View>
        </GenericModal>
        <CheckpointModal
          isVisible={isCheckpointModalVisible}
          onClose={() => setIsCheckpointModalVisible(false)}
          allowSaving={false}
        />
        <View style={[styles.centeredContainer, { top: -header }]}>
          <Text style={styles.deathMessage}>
            {playerState.currentSanity > -50
              ? deathMessage
              : "You have gone insane"}
          </Text>
          <GenericFlatButton onPress={() => setIsCheckpointModalVisible(true)}>
            Load A Checkpoint
          </GenericFlatButton>

          {playerState.children.length > 0 && (
            <>
              <Text style={styles["text-xl"]}>
                Continue as one of your children?
              </Text>
              <View style={styles.childrenContainer}>
                <ScrollView
                  horizontal
                  contentContainerStyle={[flex.columnCenter, { flexGrow: 1 }]}
                >
                  {playerState.children?.map((child, idx) => (
                    <Pressable
                      key={idx}
                      onPress={() => setNextLife(child)}
                      style={[tw.myAuto, tw.mx2]}
                    >
                      <View style={styles.childCard}>
                        <Text style={{ textAlign: "center", ...text.xl }}>
                          {child.firstName}
                        </Text>
                        <CharacterImage character={child} />
                      </View>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            </>
          )}

          <Pressable style={styles.newLifeButton} onPress={startNewGame}>
            <Text style={text.lg}>Live a New Life</Text>
          </Pressable>
        </View>
      </>
    );
  }
}

function MinimalClassSelect({
  dimensions,
  vibration,
  selectedClass,
  setSelectedClass,
  colorScheme,
}: {
  dimensions: {
    height: number;
    width: number;
    greater: number;
    lesser: number;
  };
  vibration: ({
    style,
    essential,
  }: {
    style: "light" | "medium" | "heavy" | "success" | "warning" | "error";
    essential?: boolean | undefined;
  }) => void;
  selectedClass: PlayerClassOptions | null;
  setSelectedClass: React.Dispatch<
    React.SetStateAction<PlayerClassOptions | null>
  >;
  colorScheme: "light" | "dark";
}) {
  const styles = useStyles();

  const ClassPressable = ({
    classOption,
    Icon,
    color,
    rotate = 0,
    flip = false,
  }: {
    classOption: PlayerClassOptions;
    Icon: React.JSX.ElementType;
    color: string;
    rotate?: number;
    flip?: boolean;
  }) => {
    return (
      <Pressable
        onPress={() => {
          vibration({ style: "light" });
          setSelectedClass(classOption);
        }}
        style={{
          height: dimensions.height * 0.25,
          width: dimensions.width * 0.4,
        }}
      >
        {({ pressed }) => (
          <View
            style={[
              {
                width: "100%",
                height: "100%",
                borderWidth: 1,
                alignItems: "center",
                justifyContent: "center",
                borderColor:
                  pressed || selectedClass === classOption
                    ? colorScheme === "dark"
                      ? "#fafafa"
                      : "#27272a"
                    : "transparent",
                borderRadius: 8,
              },
            ]}
          >
            <View
              style={{
                transform: [
                  { scaleX: flip ? -1 : 1 },
                  { rotate: `${rotate}deg` },
                ],
              }}
            >
              <Icon
                style={{ marginBottom: 5 }}
                color={color}
                height={dimensions.height * 0.15}
                width={dimensions.height * 0.15}
              />
            </View>
            <Text style={[text.xl, { color, marginHorizontal: "auto" }]}>
              {classOption.charAt(0).toUpperCase() + classOption.slice(1)}
            </Text>
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <View style={styles.classContainer}>
      <ThemedView style={[flex.rowBetween, tw.mb8]}>
        <ClassPressable
          classOption={PlayerClassOptions.mage}
          Icon={WizardHat}
          color="#2563eb"
        />
        <ClassPressable
          classOption={PlayerClassOptions.ranger}
          Icon={RangerIcon}
          color="green"
          rotate={12}
        />
      </ThemedView>
      <View style={flex.rowBetween}>
        <ClassPressable
          classOption={PlayerClassOptions.necromancer}
          Icon={NecromancerSkull}
          color="#9333ea"
          rotate={-12}
        />
        <ClassPressable
          classOption={PlayerClassOptions.paladin}
          Icon={PaladinHammer}
          color="#fcd34d"
          rotate={12}
          flip={true}
        />
      </View>
    </View>
  );
}

function MinimalBlessingSelect({
  playerClass,
  blessing,
  setBlessing,
  vibration,
  colorScheme,
  dimensions,
}: {
  playerClass: PlayerClassOptions;
  blessing: Element | null;
  setBlessing: React.Dispatch<React.SetStateAction<Element | null>>;
  vibration: ({
    style,
    essential,
  }: {
    style: "light" | "medium" | "heavy" | "success" | "warning" | "error";
    essential?: boolean | undefined;
  }) => void;
  colorScheme: "light" | "dark";
  dimensions: {
    height: number;
    width: number;
    greater: number;
    lesser: number;
  };
}) {
  const styles = useStyles();

  const BlessingPressable = ({ element }: { element: Element }) => {
    return (
      <Pressable
        onPress={() => {
          vibration({ style: "light" });
          setBlessing(element);
        }}
        style={{
          height: dimensions.height * 0.25,
          width: dimensions.width * 0.4,
        }}
      >
        {({ pressed }) => (
          <View
            style={[
              styles.blessingContainer,
              pressed || blessing === element
                ? { borderColor: Colors[colorScheme].border }
                : { borderColor: "transparent" },
            ]}
          >
            <BlessingDisplay
              blessing={element}
              colorScheme={colorScheme}
              size={dimensions.height * 0.15}
            />
            <Text
              style={{
                ...tw.mt3,
                ...tw.mb3,
                color: elementalColorMap[element].light,
              }}
            >
              {ElementToString[element]}
            </Text>
          </View>
        )}
      </Pressable>
    );
  };

  const renderBlessingRows = (elements: Element[][]) => (
    <View style={styles.classContainer}>
      {elements.map((row, rowIndex) => (
        <View
          key={rowIndex}
          style={[
            {
              ...flex.rowBetween,
              ...tw.mb8,
            },
            rowIndex > 0 && tw.mt8,
          ]}
        >
          {row.map((element) => (
            <BlessingPressable key={element} element={element} />
          ))}
        </View>
      ))}
    </View>
  );

  switch (playerClass) {
    case PlayerClassOptions.mage:
      return renderBlessingRows([
        [Element.fire, Element.water],
        [Element.air, Element.earth],
      ]);
    case PlayerClassOptions.necromancer:
      return renderBlessingRows([
        [Element.summoning, Element.pestilence],
        [Element.bone, Element.blood],
      ]);
    case PlayerClassOptions.ranger:
      return renderBlessingRows([
        [Element.beastMastery],
        [Element.arcane, Element.assassination],
      ]);
    case PlayerClassOptions.paladin:
      return renderBlessingRows([
        [Element.holy],
        [Element.vengeance, Element.protection],
      ]);
  }
}
