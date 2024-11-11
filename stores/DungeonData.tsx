import {
  type ReactNode,
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import { Dimensions, View } from "react-native";
import { DungeonInstance, DungeonLevel } from "../classes/dungeon";
import type { Item } from "../classes/item";
import {
  generateTiles,
  type BoundingBox,
  type Tile,
  getBoundingBox,
} from "../components/DungeonComponents/DungeonMap";
import type { Attack } from "../classes/attack";
import type { Spell } from "../classes/spell";
import { useGameState, useLayout } from "./AppData";
import { getSexFromName } from "../utility/functions/characterAid";
import { enemyGenerator } from "../utility/enemy";
import { flipCoin, wait } from "../utility/functions/misc";
import { useHeaderHeight } from "@react-navigation/elements";
import TutorialModal from "../components/TutorialModal";
import { TutorialOption } from "../utility/types";
import { useIsFocused } from "@react-navigation/native";
import { dungeonSave } from "../utility/functions/save_load";
import { throttle } from "lodash";
import { useLocalSearchParams } from "expo-router";

const DungeonCoreContext = createContext<
  | {
      slug: string[];
      thisDungeon: DungeonLevel;
      thisInstance: DungeonInstance;
      level: string;
      instanceName: string;
      firstLoad: boolean;
      setFirstLoad: React.Dispatch<React.SetStateAction<boolean>>;
      inCombat: boolean;
      setInCombat: React.Dispatch<React.SetStateAction<boolean>>;
    }
  | undefined
>(undefined);

const CombatStateContext = createContext<
  | {
      fightingBoss: boolean;
      setFightingBoss: React.Dispatch<React.SetStateAction<boolean>>;

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

const MapStateContext = createContext<
  | {
      tiles: Tile[];
      setTiles: React.Dispatch<React.SetStateAction<Tile[]>>;
      currentPosition: Tile | null;
      setCurrentPosition: React.Dispatch<React.SetStateAction<Tile | null>>;
      mapDimensions: BoundingBox;
      setMapDimensions: React.Dispatch<React.SetStateAction<BoundingBox>>;
    }
  | undefined
>(undefined);

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

const DungeonCoreProvider = ({ children }: { children: ReactNode }) => {
  const { slug } = useLocalSearchParams();
  if (!Array.isArray(slug)) {
    throw new Error(`slug needs to be an array! Received ${slug}`);
  }
  const [thisInstance, setThisInstance] = useState<DungeonInstance>();
  const [thisDungeon, setThisDungeon] = useState<DungeonLevel>();
  const { gameState, enemyState, setEnemy } = useGameState();
  const [firstLoad, setFirstLoad] = useState<boolean>(
    enemyState ? false : true,
  );

  const instanceName = slug[0];
  const level = slug[1];
  const [inCombat, setInCombat] = useState<boolean>(
    instanceName !== "Activities" && instanceName !== "Personal" ? false : true,
  );

  useEffect(() => {
    if (
      (instanceName === "Activities" ||
        instanceName === "Personal" ||
        instanceName === "training grounds") &&
      !enemyState &&
      firstLoad
    ) {
      let name: string | undefined = undefined;
      if (slug.length > 2) {
        let sex = getSexFromName(slug[2].split(" ")[0]);
        name =
          sex === "male"
            ? "generic npc male"
            : flipCoin() == "Heads"
            ? "generic npc femaleA"
            : "generic npc femaleB";
      }
      const enemy = enemyGenerator(instanceName, level, name);
      if (!enemy) throw new Error(`missing enemy, slug: ${slug}`);
      setEnemy(enemy);
      setInCombat(true);
      setFirstLoad(false);
    } else {
      setFirstLoad(false);
    }
  }, [slug]);

  useEffect(() => {
    if (gameState) {
      if (instanceName == "Activities" || instanceName == "Personal") {
        const tempDungeon = new DungeonLevel({
          level: 0,
          boss: [],
          tiles: 0,
          bossDefeated: true,
          unlocked: true,
        });
        const tempInstance = new DungeonInstance({
          name: level,
          levels: [tempDungeon],
          unlocks: [],
        });
        setThisDungeon(tempDungeon);
        setThisInstance(tempInstance);
      } else {
        setThisDungeon(gameState.getDungeon(instanceName, level));
        setThisInstance(gameState.getInstance(instanceName));
      }
    }
  }, [level, instanceName, gameState]);

  const header = useHeaderHeight();
  if (!thisDungeon || !thisInstance) {
    return (
      <View className="flex-1 justify-center" style={{ marginTop: -header }} />
    );
  }

  return (
    <DungeonCoreContext.Provider
      value={{
        slug,
        firstLoad,
        setFirstLoad,
        inCombat,
        setInCombat,
        level,
        instanceName,
        thisDungeon,
        thisInstance,
      }}
    >
      {children}
    </DungeonCoreContext.Provider>
  );
};

const CombatStateProvider = ({ children }: { children: ReactNode }) => {
  const [showTargetSelection, setShowTargetSelection] = useState<{
    showing: boolean;
    chosenAttack: Attack | Spell | null;
  }>({ showing: false, chosenAttack: null });
  const [fightingBoss, setFightingBoss] = useState<boolean>(false);

  return (
    <CombatStateContext.Provider
      value={{
        showTargetSelection,
        setShowTargetSelection,
        setFightingBoss,
        fightingBoss,
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

const MapStateProvider = ({ children }: { children: ReactNode }) => {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [mapDimensions, setMapDimensions] = useState<BoundingBox>({
    width: TILE_SIZE,
    height: TILE_SIZE,
    offsetX: 0,
    offsetY: 0,
  });
  const [currentPosition, setCurrentPosition] = useState<Tile | null>(null);

  const { playerState, gameState, enemyState, setEnemy } = useGameState();
  const { setFightingBoss, fightingBoss } = useCombatState();
  const { thisDungeon, slug, setInCombat, instanceName } = useDungeonCore();
  const { setAttackAnimationOnGoing } = useEnemyAnimation();

  useEffect(() => {
    if (playerState) {
      if (playerState.currentDungeon && playerState.currentDungeon.dungeonMap) {
        setTiles(playerState.currentDungeon.dungeonMap);
        setCurrentPosition(playerState.currentDungeon.currentPosition);
        setMapDimensions(playerState.currentDungeon.mapDimensions);
        setEnemy(playerState.currentDungeon.enemy);
        if (playerState.currentDungeon.enemy) {
          setFightingBoss(playerState.currentDungeon.fightingBoss);
          setInCombat(true);
          setAttackAnimationOnGoing(false);
        }
      } else if (thisDungeon) {
        const generatedTiles = generateTiles({
          numTiles: thisDungeon.tiles,
          tileSize: TILE_SIZE,
          bossDefeated: thisDungeon.bossDefeated ?? false,
        });
        setTiles(generatedTiles);
        const dimensions = getBoundingBox(generatedTiles, TILE_SIZE);
        setMapDimensions(dimensions);
        setCurrentPosition(generatedTiles[0]);
      }
    }
  }, [thisDungeon]);

  const throttledDungeonSave = throttle(() => {
    dungeonSave({
      playerState,
      enemyState,
      mapDimensions,
      tiles,
      currentPosition,
      slug,
      fightingBoss,
      gameState,
      instanceName,
    });
  }, 250);

  useEffect(() => {
    throttledDungeonSave();
  }, [enemyState?.id, enemyState?.health, playerState?.currentHealth]);

  return (
    <MapStateContext.Provider
      value={{
        tiles,
        setTiles,
        mapDimensions,
        setMapDimensions,
        setCurrentPosition,
        currentPosition,
      }}
    >
      {children}
    </MapStateContext.Provider>
  );
};

const TutorialStateProvider = ({ children }: { children: ReactNode }) => {
  const [
    shouldShowFirstBossKillTutorialAfterItemDrops,
    setShouldShowFirstBossKillTutorialAfterItemDrops,
  ] = useState<boolean>(false);
  const [showFirstBossKillTutorial, setShowFirstBossKillTutorial] =
    useState<boolean>(false);

  const isFocused = useIsFocused();
  const { droppedItems } = useLootState();
  const { setShowDetailedStatusView } = useLayout();

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
              setShowDetailedStatusView(true);
            });
          }}
          onCloseFunction={() => {
            setShowFirstBossKillTutorial(false);
            wait(750).then(() => {
              setShowDetailedStatusView(true);
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
    <DungeonCoreProvider>
      <CombatStateProvider>
        <EnemyAnimationStateProvider>
          <LootStateProvider>
            <MapStateProvider>
              <TutorialStateProvider>{children}</TutorialStateProvider>
            </MapStateProvider>
          </LootStateProvider>
        </EnemyAnimationStateProvider>
      </CombatStateProvider>
    </DungeonCoreProvider>
  );
};

export const useDungeonCore = () => {
  const context = useContext(DungeonCoreContext);
  if (!context)
    throw new Error("useDungeonCore must be used within DungeonCoreProvider");
  return context;
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

export const useMapState = () => {
  const context = useContext(MapStateContext);
  if (!context)
    throw new Error("useMapState must be used within MapStateProvider");
  return context;
};

export const useTutorialState = () => {
  const context = useContext(TutorialStateContext);
  if (!context)
    throw new Error(
      "useTutorialState must be used within TutorialStateProvider",
    );
  return context;
};

export const TILE_SIZE = Math.max(
  Number((Dimensions.get("screen").width / 10).toFixed(0)),
  Number((Dimensions.get("screen").height / 10).toFixed(0)),
);
