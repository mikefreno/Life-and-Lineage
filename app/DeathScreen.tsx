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
import { useColorScheme } from "nativewind";
import { elementalColorMap } from "../constants/Colors";
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

  const root = useRootStore();
  const { playerState, uiStore } = root;
  const vibration = useVibration();
  const { colorScheme } = useColorScheme();
  const [checkpoints, setCheckpoints] = useState<
    {
      id: number;
      timestamp: number;
      playerAge: number;
    }[]
  >([]);
  const [isCheckpointListExpanded, setIsCheckpointListExpanded] =
    useState(false);

  const getDeathMessage = () => {
    const randomIndex = Math.floor(Math.random() * deathMessages.length);
    return deathMessages[randomIndex].message;
  };

  useEffect(() => {
    root.hitDeathScreen();
    setDeathMessage(getDeathMessage());
    loadCheckpoints();
  }, []);

  function startNewGame() {
    root.startingNewGame = true;
    router.push("/NewGame/ClassSelect");
  }

  const loadCheckpoints = async () => {
    const checkpointList = await root.getCheckpointsList();
    setCheckpoints(checkpointList);
  };

  function createPlayerCharacter() {
    if (nextLife && selectedClass && selectedBlessing && playerState) {
      const inventory = [
        ...playerState.inventory,
        playerState.equipment.mainHand.name !== "unarmored"
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
        gold: playerState.gold / playerState.children.length ?? 1,
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
  const header = useHeaderHeight();

  const loadCheckpoint = async (id: number) => {
    const loaded = await root.loadCheckpoint(id);
    if (loaded) {
      root.clearDeathScreen();
      router.replace("/");
    } else {
      console.error("Failed to load checkpoint");
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
                  colorScheme={colorScheme}
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
                <Pressable onPress={() => setPage(0)} className="absolute z-50">
                  <Entypo
                    name="chevron-left"
                    size={24}
                    color={colorScheme === "dark" ? "#f4f4f5" : "black"}
                  />
                </Pressable>
                <MinimalBlessingSelect
                  playerClass={selectedClass}
                  blessing={selectedBlessing}
                  setBlessing={setSelectedBlessing}
                  vibration={vibration}
                  colorScheme={colorScheme}
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
        <View
          className="flex-1 items-center justify-center"
          style={{ top: -header }}
        >
          <Text
            className="py-8 text-center text-3xl font-bold"
            style={{ letterSpacing: 3, color: "#ef4444" }}
          >
            {playerState.currentSanity > -50
              ? deathMessage
              : "You have gone insane"}
          </Text>
          <Pressable
            onPress={() =>
              setIsCheckpointListExpanded(!isCheckpointListExpanded)
            }
            className="my-4 p-2 bg-blue-500 rounded"
          >
            <Text className="text-white">
              {isCheckpointListExpanded
                ? "Hide Checkpoints"
                : "Show Checkpoints"}
            </Text>
          </Pressable>

          {isCheckpointListExpanded && (
            <CheckpointList
              checkpoints={checkpoints}
              onSelect={loadCheckpoint}
            />
          )}
          {playerState.children.length > 0 ? (
            <>
              <Text className="text-xl">Continue as one of your children?</Text>
              <View className="justify-center items-center h-64">
                <ScrollView
                  className="w-screen"
                  horizontal
                  contentContainerStyle={{
                    flexGrow: 1,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {playerState.children?.map((child, idx) => (
                    <Pressable
                      key={idx}
                      onPress={() => setNextLife(child)}
                      className="my-auto mx-2"
                    >
                      <ThemedView className="shadow-lg rounded-xl p-1">
                        <Text className="text-center text-xl">
                          {child.firstName}
                        </Text>
                        <CharacterImage character={child} />
                      </ThemedView>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
              <GenericStrikeAround>
                <Text>Or</Text>
              </GenericStrikeAround>
            </>
          ) : null}
          <Pressable
            onPress={startNewGame}
            className="mt-2 border px-4 py-2 active:scale-95 active:bg-zinc-100 dark:border-zinc-50 active:dark:bg-zinc-600"
          >
            <Text className="text-lg">Live a New Life</Text>
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
            className={`${
              pressed || selectedClass === classOption
                ? "rounded-lg border-zinc-900 dark:border-zinc-50"
                : "border-transparent"
            } w-full h-full border flex items-center justify-center`}
          >
            <View
              className={`
                ${flip ? "scale-x-[-1] transform" : ""}
                ${
                  rotate < 0
                    ? `-rotate-${Math.abs(rotate)}`
                    : rotate > 0
                    ? `rotate-${rotate}`
                    : ""
                }
              `.trim()}
            >
              <Icon
                style={{ marginBottom: 5 }}
                color={colorScheme === "dark" ? color : color}
                height={dimensions.height * 0.15}
                width={dimensions.height * 0.15}
              />
            </View>
            <Text className="mx-auto text-xl" style={{ color }}>
              {classOption.charAt(0).toUpperCase() + classOption.slice(1)}
            </Text>
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <View className="flex items-center justify-evenly py-6">
      <ThemedView className="mb-8 flex flex-row justify-between">
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
      <View className="flex flex-row justify-between">
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
            className={`${
              pressed || blessing == element
                ? "rounded-lg border-zinc-900 dark:border-zinc-50"
                : "border-transparent"
            } w-full h-full border flex items-center justify-center`}
          >
            <BlessingDisplay
              blessing={element}
              colorScheme={colorScheme}
              size={dimensions.height * 0.15}
            />
            <Text
              style={{
                color: elementalColorMap[element].light,
                marginTop: 12,
                marginBottom: -12,
              }}
            >
              {ElementToString[element]}
            </Text>
          </View>
        )}
      </Pressable>
    );
  };

  switch (playerClass) {
    case PlayerClassOptions.mage:
      return (
        <View className="flex items-center justify-evenly py-6">
          <ThemedView className="mb-8 flex flex-row justify-between">
            <BlessingPressable element={Element.fire} />
            <BlessingPressable element={Element.water} />
          </ThemedView>
          <ThemedView className="flex flex-row justify-between">
            <BlessingPressable element={Element.air} />
            <BlessingPressable element={Element.earth} />
          </ThemedView>
        </View>
      );
    case PlayerClassOptions.necromancer:
      return (
        <View className="flex items-center justify-evenly py-6">
          <ThemedView className="mb-8 flex flex-row justify-between">
            <BlessingPressable element={Element.summoning} />
            <BlessingPressable element={Element.pestilence} />
          </ThemedView>
          <ThemedView className="flex flex-row justify-between">
            <BlessingPressable element={Element.bone} />
            <BlessingPressable element={Element.blood} />
          </ThemedView>
        </View>
      );
    case PlayerClassOptions.ranger:
      return (
        <View className="flex items-center justify-evenly py-6">
          <BlessingPressable element={Element.beastMastery} />
          <ThemedView className="mt-8 flex flex-row justify-between">
            <BlessingPressable element={Element.arcane} />
            <BlessingPressable element={Element.assassination} />
          </ThemedView>
        </View>
      );
    case PlayerClassOptions.paladin:
      return (
        <View className="flex items-center justify-evenly py-6">
          <BlessingPressable element={Element.holy} />
          <ThemedView className="mt-8 flex flex-row justify-between">
            <BlessingPressable element={Element.vengeance} />
            <BlessingPressable element={Element.protection} />
          </ThemedView>
        </View>
      );
  }
}

const CheckpointList = ({
  checkpoints,
  onSelect,
}: {
  checkpoints: {
    id: number;
    timestamp: number;
    playerAge: number;
  }[];
  onSelect: (id: number) => void;
}) => (
  <ScrollView className="max-h-48 w-full">
    {checkpoints.map((checkpoint) => (
      <Pressable
        key={checkpoint.id}
        onPress={() => onSelect(checkpoint.id)}
        className="p-2 border-b border-gray-200 dark:border-gray-700"
      >
        <Text>
          Checkpoint {checkpoint.id} - Age: {checkpoint.playerAge}
        </Text>
        <Text>{new Date(checkpoint.timestamp).toLocaleString()}</Text>
      </Pressable>
    ))}
  </ScrollView>
);
