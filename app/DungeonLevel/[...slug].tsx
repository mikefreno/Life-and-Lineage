import { useContext, useEffect, useState } from "react";
import { Dimensions, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { DungeonInstance, DungeonLevel } from "../../classes/dungeon";
import { Item } from "../../classes/item";
import { AppContext } from "../../app/_layout";
import D20Die from "../../components/DieRollAnim";
import { observer } from "mobx-react-lite";
import {
  type BoundingBox,
  type Tile,
  generateTiles,
  getBoundingBox,
} from "../../components/DungeonComponents/DungeonMap";
import {
  DungeonContext,
  TILE_SIZE,
} from "../../components/DungeonComponents/DungeonContext";
import DungeonLevelScreen from "../../components/DungeonComponents/DungeonLevelScreen";
import type { AttackObj, SpellObj } from "../../utility/types";

const DungeonProvider = observer(() => {
  const { slug } = useLocalSearchParams();
  if (!slug) {
    return <View>Missing params...</View>;
  }

  const appData = useContext(AppContext);
  if (!appData) throw new Error("missing context");
  const { playerState, gameState, setEnemy, enemyState, logsState } = appData;

  const [fightingBoss, setFightingBoss] = useState<boolean>(false);
  const [instanceName, setInstanceName] = useState<string>(slug[0]);
  const [level, setLevel] = useState<number>(Number(slug[1]));
  const [thisInstance, setThisInstance] = useState<DungeonInstance>();
  const [thisDungeon, setThisDungeon] = useState<DungeonLevel>();
  const [leftBehindDrops, setLeftBehindDrops] = useState<Item[]>([]);
  const [enemyAttacked, setEnemyAttacked] = useState<boolean>(false);
  const [attackAnimationOnGoing, setAttackAnimationOnGoing] =
    useState<boolean>(false);
  const [enemyAttackDummy, setEnemyAttackDummy] = useState<number>(0);
  const [enemyHealDummy, setEnemyHealDummy] = useState<number>(0);
  const [enemyTextDummy, setEnemyTextDummy] = useState<number>(0);
  const [enemyTextString, setEnemyTextString] = useState<string>();
  const [firstLoad, setFirstLoad] = useState<boolean>(true);
  const [droppedItems, setDroppedItems] = useState<{
    itemDrops: Item[];
    gold: number;
  } | null>(null);
  const [inventoryFullNotifier, setInventoryFullNotifier] =
    useState<boolean>(false);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [mapDimensions, setMapDimensions] = useState<BoundingBox>({
    width: TILE_SIZE,
    height: TILE_SIZE,
    offsetX: 0,
    offsetY: 0,
  });
  const [inCombat, setInCombat] = useState<boolean>(false);
  const [currentPosition, setCurrentPosition] = useState<Tile | null>(null);
  const [showingFirstBossKillTutorial, setShowingFirstBossKillTutorial] =
    useState<boolean>(false);
  const [shouldShowFirstBossKillTutorial, setShouldShowFirstBossKillTutorial] =
    useState<boolean>(false);
  const [showTargetSelection, setShowTargetSelection] = useState<{
    showing: boolean;
    chosenAttack: AttackObj | SpellObj | null;
  }>({ showing: false, chosenAttack: null });

  useEffect(() => {
    setInstanceName(slug[0]);
    if (slug[0] !== "Activities" && slug[0] !== "Personal") {
      setLevel(Number(slug[1]));
    } else {
      setEnemyAttacked(true);
    }
  }, [slug]);

  useEffect(() => {
    if (slug[0] !== "Activities" && slug[0] !== "Personal") {
      if (!fightingBoss && !enemyState) {
        tiles.map((tile) => {
          if (tile.x == currentPosition?.x && tile.y == currentPosition.y) {
            tile.clearedRoom = true;
            return tile;
          }
          return tile;
        });
      }
    }
  }, [enemyState]);

  useEffect(() => {
    if (!firstLoad && !enemyState) {
      setInCombat(false);
      setFirstLoad(true);
    } else if (enemyState) {
      setFirstLoad(false);
    }
  }, [enemyState]);

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
          setEnemyAttacked(true);
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

  useEffect(() => {
    if (gameState) {
      if (slug[0] == "Activities" || slug[0] == "Personal") {
        const tempDungeon = new DungeonLevel({
          level: 0,
          bosses: [],
          tiles: 0,
          bossDefeated: true,
        });
        const tempInstance = new DungeonInstance({
          name: slug[1],
          levels: [tempDungeon],
        });
        setThisDungeon(tempDungeon);
        setThisInstance(tempInstance);
      } else {
        setThisDungeon(gameState.getDungeon(instanceName, level));
        setThisInstance(gameState.getInstance(instanceName));
      }
    }
  }, [level, instanceName]);

  useEffect(() => {
    if (inventoryFullNotifier) {
      setTimeout(() => setInventoryFullNotifier(false), 2000);
    }
  }, [inventoryFullNotifier]);

  const battleLogger = (whatHappened: string) => {
    const timeOfLog = new Date().toLocaleTimeString();
    const log = `${timeOfLog}: ${whatHappened}`;
    logsState.push(log);
  };

  if (thisDungeon && thisInstance) {
    return (
      <DungeonContext.Provider
        value={{
          slug,
          fightingBoss,
          setFightingBoss,
          thisDungeon,
          thisInstance,
          attackAnimationOnGoing,
          setAttackAnimationOnGoing,
          enemyAttacked,
          setEnemyAttacked,
          enemyHealDummy,
          setEnemyHealDummy,
          enemyAttackDummy,
          setEnemyAttackDummy,
          enemyTextString,
          setEnemyTextString,
          inventoryFullNotifier,
          setInventoryFullNotifier,
          droppedItems,
          leftBehindDrops,
          setDroppedItems,
          setLeftBehindDrops,
          firstLoad,
          setFirstLoad,
          tiles,
          setTiles,
          inCombat,
          setInCombat,
          enemyTextDummy,
          setEnemyTextDummy,
          currentPosition,
          setCurrentPosition,
          mapDimensions,
          setMapDimensions,
          level,
          instanceName,
          battleLogger,
          showingFirstBossKillTutorial,
          setShowingFirstBossKillTutorial,
          shouldShowFirstBossKillTutorial,
          setShouldShowFirstBossKillTutorial,
          showTargetSelection,
          setShowTargetSelection,
        }}
      >
        <DungeonLevelScreen />
      </DungeonContext.Provider>
    );
  } else {
    return <D20Die />;
  }
});
export default DungeonProvider;
