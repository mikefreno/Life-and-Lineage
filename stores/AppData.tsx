import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { Dimensions } from "react-native";
import { fullLoad } from "../utility/functions/save_load";
import type { Enemy } from "../classes/creatures";
import type { PlayerCharacter } from "../classes/character";
import { useColorScheme } from "nativewind";
import type { Game } from "../classes/game";
import { SharedValue, useSharedValue } from "react-native-reanimated";

const GameStateContext = createContext<
  | {
      gameState: Game | undefined;
      setGameData: React.Dispatch<React.SetStateAction<Game | undefined>>;
      playerState: PlayerCharacter | undefined;
      setPlayerCharacter: React.Dispatch<
        React.SetStateAction<PlayerCharacter | undefined>
      >;
      enemyState: Enemy | null;
      setEnemy: React.Dispatch<React.SetStateAction<Enemy | null>>;
      appDataLoading: boolean;
    }
  | undefined
>(undefined);

const LayoutContext = createContext<
  | {
      isCompact: boolean;
      setIsCompact: React.Dispatch<React.SetStateAction<boolean>>;
      dimensions: {
        height: number;
        width: number;
        greater: number;
        lesser: number;
      };
      blockSize: number | undefined;
      setBlockSize: React.Dispatch<React.SetStateAction<number | undefined>>;
      showDetailedStatusView: boolean;
      setShowDetailedStatusView: React.Dispatch<React.SetStateAction<boolean>>;
      modalShowing: boolean;
      setModalShowing: React.Dispatch<React.SetStateAction<boolean>>;
    }
  | undefined
>(undefined);

const DragContext = createContext<
  | {
      position: {
        x: SharedValue<number>;
        offsetX: SharedValue<number>;
        y: SharedValue<number>;
        offsetY: SharedValue<number>;
      };
      isDragging: SharedValue<boolean>;
      iconString: string | null;
      setIconString: React.Dispatch<React.SetStateAction<string | null>>;
    }
  | undefined
>(undefined);

const GameStateProvider = ({ children }: { children: ReactNode }) => {
  const [playerState, setPlayerCharacter] = useState<PlayerCharacter>();
  const [enemyState, setEnemy] = useState<Enemy | null>(null);
  const [gameState, setGameData] = useState<Game>();
  const [appDataLoading, setAppDataLoading] = useState(true);

  const { setColorScheme } = useColorScheme();

  const loadData = async () => {
    try {
      const { game, player } = await fullLoad();

      if (game && player) {
        game.refreshAllShops(player);
        setGameData(game);
        setColorScheme(game.colorScheme);
        player.reinstateLinks();
        setPlayerCharacter(player);
      }

      setAppDataLoading(false);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (gameState) {
      setColorScheme(gameState.colorScheme);
    }
  }, [gameState?.colorScheme]);

  return (
    <GameStateContext.Provider
      value={{
        gameState,
        setGameData,
        playerState,
        setPlayerCharacter,
        enemyState,
        setEnemy,
        appDataLoading,
      }}
    >
      {children}
    </GameStateContext.Provider>
  );
};

const LayoutProvider = ({ children }: { children: ReactNode }) => {
  const [playerStatusCompact, setPlayerStatusCompact] = useState<boolean>(true);
  const [blockSize, setBlockSize] = useState<number>();
  const [dimensions, setDimensions] = useState(() => ({
    height: Dimensions.get("window").height,
    width: Dimensions.get("window").width,
    greater: Math.max(
      Dimensions.get("window").height,
      Dimensions.get("window").width,
    ),
    lesser: Math.min(
      Dimensions.get("window").height,
      Dimensions.get("window").width,
    ),
  }));
  const [showDetailedStatusView, setShowDetailedStatusView] =
    useState<boolean>(false);
  const [modalShowing, setModalShowing] = useState<boolean>(false);

  const onChange = useCallback(
    ({
      screen,
    }: {
      screen: {
        width: number;
        height: number;
        scale: number;
        fontScale: number;
      };
    }) => {
      setDimensions({
        height: screen.height,
        width: screen.width,
        greater: Math.max(screen.height, screen.width),
        lesser: Math.min(screen.width, screen.height),
      });
    },
    [],
  );

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", onChange);

    return () => {
      subscription.remove();
    };
  }, [onChange]);

  useEffect(() => {
    if (dimensions.width === dimensions.lesser) {
      const blockSize = Math.min(dimensions.height / 5, dimensions.width / 7.5);
      setBlockSize(blockSize);
    } else {
      const blockSize = dimensions.width / 14;
      setBlockSize(blockSize);
    }
  }, [dimensions.height, dimensions.width, dimensions.lesser]);

  return (
    <LayoutContext.Provider
      value={{
        isCompact: playerStatusCompact,
        setIsCompact: setPlayerStatusCompact,
        setShowDetailedStatusView,
        showDetailedStatusView,
        dimensions,
        blockSize,
        setBlockSize,
        modalShowing,
        setModalShowing,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
};

const DraggableDataProvider = ({ children }: { children: ReactNode }) => {
  const [iconString, setIconString] = useState<string | null>(null);

  const position = {
    x: useSharedValue(0),
    offsetX: useSharedValue(0),
    y: useSharedValue(0),
    offsetY: useSharedValue(0),
  };
  const isDragging = useSharedValue(false);

  const store = useMemo(
    () => ({
      position,
      isDragging,
      iconString,
      setIconString,
    }),
    [iconString],
  );

  return <DragContext.Provider value={store}>{children}</DragContext.Provider>;
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  return (
    <GameStateProvider>
      <LayoutProvider>
        <DraggableDataProvider>{children}</DraggableDataProvider>
      </LayoutProvider>
    </GameStateProvider>
  );
};

export const useGameState = () => {
  const context = useContext(GameStateContext);
  if (!context)
    throw new Error("useGameState must be used within GameStateProvider");
  return context;
};

export const useDraggableDataState = () => {
  const context = useContext(DragContext);
  if (!context) throw new Error("Missing DraggableDataProvider");
  return context;
};

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) throw new Error("useLayout must be used within LayoutProvider");
  return context;
};
