import { createContext } from "react";
import { DungeonContextType } from "../../utility/types";
import { Dimensions } from "react-native";

export const DungeonContext = createContext<DungeonContextType | undefined>(
  undefined,
);

export const TILE_SIZE = Math.max(
  Dimensions.get("screen").width / 10,
  Dimensions.get("screen").height / 10,
);
