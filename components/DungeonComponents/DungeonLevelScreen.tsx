import { View as ThemedView, Text } from "../../components/Themed";
import { View, Platform, Dimensions } from "react-native";
import { useContext, useRef, useEffect, useState } from "react";
import { Pressable } from "react-native";
import { Stack } from "expo-router";
import BattleTab from "../../components/DungeonComponents/BattleTab";
import { toTitleCase } from "../../utility/functions/misc/words";
import PlayerStatus from "../../components/PlayerStatus";
import ProgressBar from "../../components/ProgressBar";
import { observer } from "mobx-react-lite";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import TutorialModal from "../../components/TutorialModal";
import GenericModal from "../../components/GenericModal";
import BattleTabControls from "../../components/DungeonComponents/BattleTabControls";
import DungeonEnemyDisplay from "../../components/DungeonComponents/DungeonEnemyDisplay";
import FleeModal from "../../components/DungeonComponents/FleeModal";
import TargetSelection from "../../components/DungeonComponents/TargetSelection";
import DroppedItemsModal from "../../components/DungeonComponents/DroppedItemsModal";
import LeftBehindItemsModal from "../../components/DungeonComponents/LeftBehindItemsModal";
import { dungeonSave } from "../../utility/functions/save_load";
import { throttle } from "lodash";
import { AppContext } from "../../app/_layout";
import { DungeonContext } from "./DungeonContext";
import { DungeonMapRender } from "./DungeonMap";
import { addItemToPouch, playerMinionsTurn } from "./DungeonInteriorFunctions";
import { SackIcon } from "../../assets/icons/SVGIcons";
import D20DieAnimation from "../DieRollAnim";
import { StatsDisplay } from "../StatsDisplay";
import { TutorialOption } from "../../utility/types";

const DungeonLevelScreen = observer(() => {
  const { colorScheme } = useColorScheme();
  const appData = useContext(AppContext);
  const dungeonData = useContext(DungeonContext);
  if (!appData || !dungeonData) throw new Error("missing context");
  const { playerState, gameState, enemyState } = appData;

  const {
    slug,
    setInventoryFullNotifier,
    thisInstance,
    thisDungeon,
    level,
    inCombat,
    showTargetSelection,
    setShowTargetSelection,
    displayItem,
    setDisplayItem,
    droppedItems,
  } = dungeonData;

  const [battleTab, setBattleTab] = useState<
    "attacksOrNavigation" | "equipment" | "log"
  >("attacksOrNavigation");
  const [showLeftBehindItemsScreen, setShowLeftBehindItemsScreen] =
    useState<boolean>(false);

  const [fleeModalShowing, setFleeModalShowing] = useState<boolean>(false);

  const pouchRef = useRef<View>(null);

  if (!playerState || !gameState) {
    throw new Error("No player character or game data on dungeon level");
  }

  useEffect(() => {
    setInventoryFullNotifier(false);
  }, [showLeftBehindItemsScreen]);

  const throttledDungeonSave = throttle((state) => {
    dungeonSave({ enemy: state, dungeonData, appData });
  }, 250);

  useEffect(() => console.log(droppedItems), [droppedItems]);

  useEffect(() => {
    throttledDungeonSave(enemyState);
  }, [enemyState?.health, playerState.currentHealth]);

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
          isVisibleCondition={
            gameState.tutorialsShown.dungeonInterior &&
            gameState.tutorialsEnabled
          }
          tutorial={TutorialOption.dungeonInterior}
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
          playerMinionsTurn={playerMinionsTurn}
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
        <ThemedView className="flex-1" style={{ paddingBottom: 84 }}>
          {!inCombat ? (
            <DungeonMapRender />
          ) : enemyState ? (
            <DungeonEnemyDisplay />
          ) : (
            <View className="flex h-[40%] pt-8">
              <D20DieAnimation
                keepRolling={true}
                size={Dimensions.get("window").height * 0.25}
              />
            </View>
          )}
          <Pressable
            ref={pouchRef}
            className="absolute ml-4 mt-4"
            onPress={() => setShowLeftBehindItemsScreen(true)}
          >
            <SackIcon height={32} width={32} />
          </Pressable>
          <View className="flex-1 justify-between">
            <BattleTab battleTab={battleTab} pouchRef={pouchRef} />
          </View>
          <BattleTabControls
            battleTab={battleTab}
            setBattleTab={setBattleTab}
          />
          {playerState.minions.length > 0 ? (
            <ThemedView className="flex flex-row flex-wrap justify-evenly px-4">
              {playerState.minions.map((minion, index) => (
                <ThemedView
                  key={minion.id}
                  className={`${
                    index == playerState.minions.length - 1 &&
                    playerState.minions.length % 2 !== 0
                      ? "w-full"
                      : "w-2/5"
                  } py-1`}
                >
                  <Text>{toTitleCase(minion.creatureSpecies)}</Text>
                  <ProgressBar
                    filledColor="#ef4444"
                    unfilledColor="#fee2e2"
                    value={minion.health}
                    maxValue={minion.healthMax}
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
                addItemToPouch={(item) => addItemToPouch({ item, dungeonData })}
                topOffset={-96}
              />
            </View>
          )}
        </ThemedView>
        <PlayerStatus positioning={"absolute"} classname="bottom-0" />
      </>
    );
  }
});

export default DungeonLevelScreen;
