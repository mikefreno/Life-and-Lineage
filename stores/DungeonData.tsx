import {
  type ReactNode,
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import { Dimensions } from "react-native";
import type { Item } from "../entities/item";
import {
  generateTiles,
  type BoundingBox,
  type Tile,
  getBoundingBox,
} from "../components/DungeonComponents/DungeonMap";
import type { Attack } from "../entities/attack";
import type { Spell } from "../entities/spell";
import { wait } from "../utility/functions/misc";
import TutorialModal from "../components/TutorialModal";
import { TutorialOption } from "../utility/types";
import { useIsFocused } from "@react-navigation/native";
import { throttle } from "lodash";
import {
  useDungeonStore,
  useEnemyStore,
  useGameStore,
  usePlayerStore,
  useRootStore,
  useUIStore,
} from "../hooks/stores";

const CombatStateContext = createContext<
  | {
      showTargetSelection: {
        showing: boolean;
        chosenAttack: Attack | Spell | null;
      };
      setShowTargetSelection: React.Dispatch<
        React.SetStateAction<{
          showing: boolean;
          chosenAttack: Attack | Spell | null;
        }>
      >;
    }
  | undefined
>(undefined);

const EnemyAnimationStateContext = createContext<
  | {
      attackAnimationOnGoing: boolean;
      setAttackAnimationOnGoing: React.Dispatch<React.SetStateAction<boolean>>;
      enemyDodgeDummy: number;
      setEnemyDodgeDummy: React.Dispatch<React.SetStateAction<number>>;
      enemyAttackDummy: number;
      setEnemyAttackDummy: React.Dispatch<React.SetStateAction<number>>;
      enemyTextDummy: number;
      setEnemyTextDummy: React.Dispatch<React.SetStateAction<number>>;
      enemyTextString: string | undefined;
      setEnemyTextString: React.Dispatch<
        React.SetStateAction<string | undefined>
      >;
    }
  | undefined
>(undefined);

const LootStateContext = createContext<
  | {
      inventoryFullNotifier: boolean;
      setInventoryFullNotifier: React.Dispatch<React.SetStateAction<boolean>>;
      droppedItems: {
        itemDrops: Item[];
        gold: number;
        storyDrops: Item[];
      } | null;
      leftBehindDrops: Item[];
      setDroppedItems: React.Dispatch<
        React.SetStateAction<{
          itemDrops: Item[];
          gold: number;
          storyDrops: Item[];
        } | null>
      >;
      setLeftBehindDrops: React.Dispatch<React.SetStateAction<Item[]>>;
      displayItem: {
        item: Item[];
        positon: {
          left: number;
          top: number;
        };
      } | null;
      setDisplayItem: React.Dispatch<
        React.SetStateAction<{
          item: Item[];
          positon: {
            left: number;
            top: number;
          };
        } | null>
      >;
    }
  | undefined
>(undefined);

//const MapStateContext = createContext<
//| {
//tiles: Tile[];
//setTiles: React.Dispatch<React.SetStateAction<Tile[]>>;
//currentPosition: Tile | null;
//setCurrentPosition: React.Dispatch<React.SetStateAction<Tile | null>>;
//mapDimensions: BoundingBox;
//setMapDimensions: React.Dispatch<React.SetStateAction<BoundingBox>>;
//}
//| undefined
//>(undefined);

const TutorialStateContext = createContext<
  | {
      showFirstBossKillTutorial: boolean;
      setShowFirstBossKillTutorial: React.Dispatch<
        React.SetStateAction<boolean>
      >;
      shouldShowFirstBossKillTutorialAfterItemDrops: boolean;
      setShouldShowFirstBossKillTutorialAfterItemDrops: React.Dispatch<
        React.SetStateAction<boolean>
      >;
    }
  | undefined
>(undefined);

const CombatStateProvider = ({ children }: { children: ReactNode }) => {
  const [showTargetSelection, setShowTargetSelection] = useState<{
    showing: boolean;
    chosenAttack: Attack | Spell | null;
  }>({ showing: false, chosenAttack: null });

  return (
    <CombatStateContext.Provider
      value={{
        showTargetSelection,
        setShowTargetSelection,
      }}
    >
      {children}
    </CombatStateContext.Provider>
  );
};

const EnemyAnimationStateProvider = ({ children }: { children: ReactNode }) => {
  const [enemyAttackDummy, setEnemyAttackDummy] = useState<number>(0);
  const [enemyDodgeDummy, setEnemyDodgeDummy] = useState<number>(0);
  const [enemyTextDummy, setEnemyTextDummy] = useState<number>(0);
  const [enemyTextString, setEnemyTextString] = useState<string>();
  const [attackAnimationOnGoing, setAttackAnimationOnGoing] =
    useState<boolean>(false);
  return (
    <EnemyAnimationStateContext.Provider
      value={{
        attackAnimationOnGoing,
        setAttackAnimationOnGoing,
        enemyTextDummy,
        setEnemyTextDummy,
        enemyDodgeDummy,
        setEnemyDodgeDummy,
        enemyAttackDummy,
        setEnemyAttackDummy,
        enemyTextString,
        setEnemyTextString,
      }}
    >
      {children}
    </EnemyAnimationStateContext.Provider>
  );
};

const LootStateProvider = ({ children }: { children: ReactNode }) => {
  const [droppedItems, setDroppedItems] = useState<{
    itemDrops: Item[];
    gold: number;
    storyDrops: Item[];
  } | null>(null);
  const [leftBehindDrops, setLeftBehindDrops] = useState<Item[]>([]);
  const [displayItem, setDisplayItem] = useState<{
    item: Item[];
    positon: { left: number; top: number };
  } | null>(null);
  const [inventoryFullNotifier, setInventoryFullNotifier] =
    useState<boolean>(false);

  useEffect(() => {
    if (inventoryFullNotifier) {
      setTimeout(() => setInventoryFullNotifier(false), 2000);
    }
  }, [inventoryFullNotifier]);

  return (
    <LootStateContext.Provider
      value={{
        leftBehindDrops,
        setLeftBehindDrops,
        displayItem,
        setDisplayItem,
        setInventoryFullNotifier,
        inventoryFullNotifier,
        droppedItems,
        setDroppedItems,
      }}
    >
      {children}
    </LootStateContext.Provider>
  );
};

//const MapStateProvider = ({ children }: { children: ReactNode }) => {

//const { setAttackAnimationOnGoing } = useEnemyAnimation();

//useEffect(() => {
//if (playerState) {
//if (playerState.currentDungeon && playerState.currentDungeon.dungeonMap) {
//setTiles(playerState.currentDungeon.dungeonMap);
//setCurrentPosition(playerState.currentDungeon.currentPosition);
//setMapDimensions(playerState.currentDungeon.mapDimensions);
//if (playerState.currentDungeon.enemy) {
//enemyStore.enemies.push(playerState.currentDungeon.enemy);
//}
//if (playerState.currentDungeon.enemy) {
//setFightingBoss(playerState.currentDungeon.fightingBoss);
//setInCombat(true);
//setAttackAnimationOnGoing(false);
//}
//} else if (thisDungeon) {
//const generatedTiles = generateTiles({
//numTiles: thisDungeon.tiles,
//tileSize: TILE_SIZE,
//bossDefeated: thisDungeon.bossDefeated ?? false,
//});
//setTiles(generatedTiles);
//const dimensions = getBoundingBox(generatedTiles, TILE_SIZE);
//setMapDimensions(dimensions);
//setCurrentPosition(generatedTiles[0]);
//}
//}
//}, [thisDungeon]);

//const throttledDungeonSave = throttle(() => {
//dungeonSave({
//playerState,
//enemyState,
//mapDimensions,
//tiles,
//currentPosition,
//slug,
//fightingBoss,
//gameState,
//instanceName,
//});
//}, 250);

//useEffect(() => {
//throttledDungeonSave();
//}, [enemyState?.id, enemyState?.health, playerState?.currentHealth]);

//return (
//<MapStateContext.Provider
//value={{
//tiles,
//setTiles,
//mapDimensions,
//setMapDimensions,
//setCurrentPosition,
//currentPosition,
//}}
//>
//{children}
//</MapStateContext.Provider>
//);
//};

const TutorialStateProvider = ({ children }: { children: ReactNode }) => {
  const [
    shouldShowFirstBossKillTutorialAfterItemDrops,
    setShouldShowFirstBossKillTutorialAfterItemDrops,
  ] = useState<boolean>(false);
  const [showFirstBossKillTutorial, setShowFirstBossKillTutorial] =
    useState<boolean>(false);

  const isFocused = useIsFocused();
  const { droppedItems } = useLootState();
  const ui = useUIStore();

  useEffect(() => {
    if (shouldShowFirstBossKillTutorialAfterItemDrops && !droppedItems) {
      wait(750).then(() => {
        setShowFirstBossKillTutorial(true);
        setShouldShowFirstBossKillTutorialAfterItemDrops(false);
      });
    }
  }, [shouldShowFirstBossKillTutorialAfterItemDrops, droppedItems]);

  return (
    <TutorialStateContext.Provider
      value={{
        setShowFirstBossKillTutorial,
        setShouldShowFirstBossKillTutorialAfterItemDrops,
        showFirstBossKillTutorial,
        shouldShowFirstBossKillTutorialAfterItemDrops,
      }}
    >
      {showFirstBossKillTutorial && (
        <TutorialModal
          tutorial={TutorialOption.firstBossKill}
          backFunction={() => {
            setShowFirstBossKillTutorial(false);
            wait(750).then(() => {
              ui.detailedStatusViewShowing = true;
            });
          }}
          onCloseFunction={() => {
            setShowFirstBossKillTutorial(false);
            wait(750).then(() => {
              ui.detailedStatusViewShowing = true;
            });
          }}
          isFocused={isFocused}
          pageOne={{
            title: "Well Fought!",
            body: "You have defeated the first boss! Every boss will reward you with stats points to distribute as you wish.",
          }}
        />
      )}
      {children}
    </TutorialStateContext.Provider>
  );
};

export const DungeonProvider = ({ children }: { children: ReactNode }) => {
  return (
    <CombatStateProvider>
      <EnemyAnimationStateProvider>
        <LootStateProvider>
          <TutorialStateProvider>{children}</TutorialStateProvider>
        </LootStateProvider>
      </EnemyAnimationStateProvider>
    </CombatStateProvider>
  );
};

export const useCombatState = () => {
  const context = useContext(CombatStateContext);
  if (!context)
    throw new Error("useCombatState must be used within CombatStateProvider");
  return context;
};

export const useEnemyAnimation = () => {
  const context = useContext(EnemyAnimationStateContext);
  if (!context)
    throw new Error(
      "useEnemyAnimation must be used within EnemyAnimationStateProvider",
    );
  return context;
};

export const useLootState = () => {
  const context = useContext(LootStateContext);
  if (!context)
    throw new Error("useLootState must be used within LootStateProvider");
  return context;
};

//export const useMapState = () => {
//const context = useContext(MapStateContext);
//if (!context)
//throw new Error("useMapState must be used within MapStateProvider");
//return context;
//};

export const useTutorialState = () => {
  const context = useContext(TutorialStateContext);
  if (!context)
    throw new Error(
      "useTutorialState must be used within TutorialStateProvider",
    );
  return context;
};
