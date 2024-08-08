import { createContext } from "react";
import { DungeonContextType } from "../../utility/types";

export const DungeonContext = createContext<DungeonContextType | undefined>(
  undefined,
);

export const TILE_SIZE = 40;
