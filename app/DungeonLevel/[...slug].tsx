import { ThemedView, Text } from "../../components/Themed";
import { View, Platform } from "react-native";
import { useRef, useEffect, useState } from "react";
import { Pressable } from "react-native";
import { Stack } from "expo-router";
import BattleTab from "../../components/DungeonComponents/BattleTab";
import { toTitleCase } from "../../utility/functions/misc";
import PlayerStatus from "../../components/PlayerStatus";
import ProgressBar from "../../components/ProgressBar";
import { observer } from "mobx-react-lite";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import TutorialModal from "../../components/TutorialModal";
import GenericModal from "../../components/GenericModal";
import BattleTabControls from "../../components/DungeonComponents/BattleTabControls";
import FleeModal from "../../components/DungeonComponents/FleeModal";
import TargetSelection from "../../components/DungeonComponents/TargetSelection";
import DroppedItemsModal from "../../components/DungeonComponents/DroppedItemsModal";
import LeftBehindItemsModal from "../../components/DungeonComponents/LeftBehindItemsModal";
import { SackIcon } from "../../assets/icons/SVGIcons";
import { TutorialOption } from "../../utility/types";
import { useIsFocused } from "@react-navigation/native";
import {
  DungeonProvider,
  useCombatState,
  useDungeonCore,
  useLootState,
} from "../../stores/DungeonData";
import DungeonEnemyDisplay from "../../components/DungeonComponents/DungeonEnemyDisplay";
import { DungeonMapRender } from "../../components/DungeonComponents/DungeonMap";
import { StatsDisplay } from "../../components/StatsDisplay";
import { useRootStore } from "../../hooks/stores";
import { usePouch } from "../../hooks/generic";

const DungeonLevelScreen = observer(() => {
  const { colorScheme } = useColorScheme();
  const { playerState, gameState, enemyStore } = useRootStore();

  const { firstLoad, thisDungeon, thisInstance, slug, level, inCombat } =
    useDungeonCore();
  const { setInventoryFullNotifier, displayItem, setDisplayItem } =
    useLootState();
  const { showTargetSelection, setShowTargetSelection } = useCombatState();
  const { addItemToPouch } = usePouch();

  const [battleTab, setBattleTab] = useState<
    "attacksOrNavigation" | "equipment" | "log"
  >("attacksOrNavigation");
  const [showLeftBehindItemsScreen, setShowLeftBehindItemsScreen] =
    useState<boolean>(false);
  const isFocused = useIsFocused();

  const [fleeModalShowing, setFleeModalShowing] = useState<boolean>(false);

  const pouchRef = useRef<View>(null);

  if (!playerState || !gameState) {
    throw new Error("No player character or game data on dungeon level");
  }

  useEffect(() => {
    setInventoryFullNotifier(false);
  }, [showLeftBehindItemsScreen]);

  if (thisDungeon && playerState) {
    return (
      <>
        <Stack.Screen
          options={{
            headerTitleStyle: { fontFamily: "PixelifySans", fontSize: 20 },
            headerLeft: () => (
              <Pressable
                onPress={() => {
                  setFleeModalShowing(true);
                }}
              >
                {({ pressed }) => (
                  <MaterialCommunityIcons
                    name="run-fast"
                    size={28}
                    color={colorScheme == "light" ? "#18181b" : "#fafafa"}
                    style={{
                      opacity: pressed ? 0.5 : 1,
                      marginRight: Platform.OS == "android" ? 8 : 0,
                    }}
                  />
                )}
              </Pressable>
            ),
            title:
              slug[0] == "Activities" || slug[0] == "Personal"
                ? slug[1]
                : slug[0] === "training grounds"
                ? "Training Grounds"
                : `${toTitleCase(thisInstance?.name as string)} Level ${level}`,
          }}
        />
        <TutorialModal
          tutorial={TutorialOption.dungeonInterior}
          isFocused={isFocused}
          pageOne={{
            title: "Watch Your Health",
            body: "Your situation can change rapidly.",
          }}
          pageTwo={{
            title: "Advance by killing the boss.",
            body: "Navigate the dungeon until you find them.",
          }}
          pageThree={{
            title: "Good Luck.",
            body: "And remember fleeing (top left) can save you.",
          }}
        />
        <FleeModal
          fleeModalShowing={fleeModalShowing}
          setFleeModalShowing={setFleeModalShowing}
        />
        <DroppedItemsModal />
        <LeftBehindItemsModal
          showLeftBehindItemsScreen={showLeftBehindItemsScreen}
          setShowLeftBehindItemsScreen={setShowLeftBehindItemsScreen}
        />
        <GenericModal
          isVisibleCondition={showTargetSelection.showing}
          size={100}
          backFunction={() =>
            setShowTargetSelection({
              showing: false,
              chosenAttack: null,
            })
          }
        >
          <>
            <Text className="text-center text-2xl">Choose Your Target</Text>
            <TargetSelection />
          </>
        </GenericModal>
        <View className="flex-1" style={{ paddingBottom: 84 }}>
          {enemyStore.enemies.length > 0 && !firstLoad ? (
            <DungeonEnemyDisplay />
          ) : !inCombat && !firstLoad ? (
            <DungeonMapRender />
          ) : (
            <View className="flex-1 justify-center"></View>
          )}
          <Pressable
            ref={pouchRef}
            className="absolute ml-4 mt-4"
            onPress={() => setShowLeftBehindItemsScreen(true)}
          >
            <SackIcon height={32} width={32} />
          </Pressable>
          {inCombat && <View></View>}
          <View className="flex-1 justify-between">
            <BattleTab battleTab={battleTab} pouchRef={pouchRef} />
          </View>
          <BattleTabControls
            battleTab={battleTab}
            setBattleTab={setBattleTab}
          />
          {playerState.minionsAndPets.length > 0 ? (
            <ThemedView className="flex flex-row flex-wrap justify-evenly px-4">
              {playerState.minionsAndPets.map((minion, index) => (
                <ThemedView
                  key={minion.id}
                  className={`${
                    index == playerState.minionsAndPets.length - 1 &&
                    playerState.minionsAndPets.length % 2 !== 0
                      ? "w-full"
                      : "w-2/5"
                  } py-1`}
                >
                  <Text>{toTitleCase(minion.creatureSpecies)}</Text>
                  <ProgressBar
                    filledColor="#ef4444"
                    unfilledColor="#fee2e2"
                    value={minion.currentHealth}
                    maxValue={minion.baseHealth}
                  />
                </ThemedView>
              ))}
            </ThemedView>
          ) : null}
          {displayItem && (
            <View className="absolute z-10">
              <StatsDisplay
                displayItem={displayItem}
                clearItem={() => setDisplayItem(null)}
                addItemToPouch={(items) => addItemToPouch({ items })}
                topOffset={-96}
              />
            </View>
          )}
        </View>
        <PlayerStatus positioning={"absolute"} classname="bottom-0" />
      </>
    );
  }
});

export default function DungeonWrapper() {
  return (
    <DungeonProvider>
      <DungeonLevelScreen />
    </DungeonProvider>
  );
}
