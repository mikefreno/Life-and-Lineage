import { useMemo, useRef, useCallback } from "react";
import { Dimensions, PixelRatio, Platform, ScaledSize } from "react-native";
import { BASE_WIDTH } from "@/stores/UIStore";

let cachedDimensions: ScaledSize = Dimensions.get("screen");
let cachedTaperedScale: number = computeTaperedScale(cachedDimensions);
let cachedTaperedScaleForText: number =
  computeTaperedScaleForText(cachedDimensions);
let cachedReversedScale: number = computeReversedScale(cachedDimensions);

const dimensionsSubscription = Dimensions.addEventListener(
  "change",
  ({ screen }: { screen: ScaledSize }) => {
    cachedDimensions = screen;
    cachedTaperedScale = computeTaperedScale(screen);
    cachedTaperedScaleForText = computeTaperedScaleForText(screen);
    cachedReversedScale = computeReversedScale(screen);
  },
);

function computeTaperedScale(dimensions: ScaledSize): number {
  const lesserDimension = Math.min(dimensions.width, dimensions.height);
  const rawScale = lesserDimension / BASE_WIDTH;
  return rawScale > 1 ? 1 + (rawScale - 1) * 0.2 : 1 - (1 - rawScale) * 0.8;
}

function computeTaperedScaleForText(dimensions: ScaledSize): number {
  const lesserDimension = Math.min(dimensions.width, dimensions.height);
  const rawScale = lesserDimension / BASE_WIDTH;
  return rawScale > 1 ? 1 + (rawScale - 1) * 0.1 : 1 - (1 - rawScale) * 0.8;
}

function computeReversedScale(dimensions: ScaledSize): number {
  const lesserDimension = Math.min(dimensions.width, dimensions.height);
  const rawScale = BASE_WIDTH / lesserDimension;
  return rawScale > 1 ? 1 + (rawScale - 1) * 0.5 : 1 - (1 - rawScale) * 0.5;
}

export const baseNormalize = (
  size: number,
  scale: number = cachedTaperedScale,
): number => {
  const newSize = size * scale;
  const roundedSize = Math.round(PixelRatio.roundToNearestPixel(newSize));
  return Platform.OS === "ios" ? roundedSize : roundedSize - 2;
};

export const baseNormalizeForText = (
  size: number,
  scale: number = cachedTaperedScaleForText,
): number => {
  const newSize = size * scale;
  const roundedSize = Math.round(PixelRatio.roundToNearestPixel(newSize));
  return Platform.OS === "ios" ? roundedSize : roundedSize - 2;
};

export const baseReverseNormalize = (
  size: number,
  scale: number = cachedReversedScale,
): number => {
  const newSize = size * scale;
  const roundedSize = Math.round(PixelRatio.roundToNearestPixel(newSize));
  return Platform.OS === "ios" ? roundedSize : roundedSize - 2;
};

export const baseNormalizeLineHeight = (
  size: number,
  scale: number = cachedTaperedScaleForText,
): number => {
  return Math.round(size * scale);
};

export const baseCalculateRenderScaling = (scale?: number): number => {
  if (scale) {
    return baseReverseNormalize(scale * 10) / 10;
  }
  return 1.0;
};

type CacheKey = string;

// Predefined set of sizes to memoize.
const sizesToMemoize = [
  2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 30, 32, 36, 44, 48,
];

export const useScaling = () => {
  const getKey = (size: number, scale?: number): CacheKey =>
    `${size}-${scale !== undefined ? scale : "default"}`;

  const normalizeCache = useRef<Map<CacheKey, number>>(new Map());
  const normalizeForTextCache = useRef<Map<CacheKey, number>>(new Map());
  const reverseNormalizeCache = useRef<Map<CacheKey, number>>(new Map());
  const normalizeLineHeightCache = useRef<Map<CacheKey, number>>(new Map());

  const memoizedNormalize = useCallback(
    (size: number, scale?: number): number => {
      const key = getKey(size, scale);
      if (normalizeCache.current.has(key)) {
        return normalizeCache.current.get(key)!;
      }
      const result = baseNormalize(size, scale);
      normalizeCache.current.set(key, result);
      return result;
    },
    [],
  );

  const memoizedNormalizeForText = useCallback(
    (size: number, scale?: number): number => {
      const key = getKey(size, scale);
      if (normalizeForTextCache.current.has(key)) {
        return normalizeForTextCache.current.get(key)!;
      }
      const result = baseNormalizeForText(size, scale);
      normalizeForTextCache.current.set(key, result);
      return result;
    },
    [],
  );

  const memoizedReverseNormalize = useCallback(
    (size: number, scale?: number): number => {
      const key = getKey(size, scale);
      if (reverseNormalizeCache.current.has(key)) {
        return reverseNormalizeCache.current.get(key)!;
      }
      const result = baseReverseNormalize(size, scale);
      reverseNormalizeCache.current.set(key, result);
      return result;
    },
    [],
  );

  const memoizedNormalizeLineHeight = useCallback(
    (size: number, scale?: number): number => {
      const key = getKey(size, scale);
      if (normalizeLineHeightCache.current.has(key)) {
        return normalizeLineHeightCache.current.get(key)!;
      }
      const result = baseNormalizeLineHeight(size, scale);
      normalizeLineHeightCache.current.set(key, result);
      return result;
    },
    [],
  );

  const memoizedCalculateRenderScaling = useCallback(
    (scale?: number): number => {
      return baseCalculateRenderScaling(scale);
    },
    [],
  );

  const normalizedFontSizes = useMemo(() => {
    const result: { [size: number]: number } = {};
    sizesToMemoize.forEach((size) => {
      result[size] = memoizedNormalizeForText(size);
    });
    return result;
  }, [memoizedNormalizeForText]);

  const normalizedSizes = useMemo(() => {
    const result: { [size: number]: number } = {};
    sizesToMemoize.forEach((size) => {
      result[size] = memoizedNormalize(size);
    });
    return result;
  }, [memoizedNormalize]);

  const normalizedLineSizes = useMemo(() => {
    const result: { [size: number]: number } = {};
    sizesToMemoize.forEach((size) => {
      result[size] = memoizedNormalizeLineHeight(size);
    });
    return result;
  }, [memoizedNormalizeLineHeight]);

  const getNormalizedFontSize = useCallback(
    (size: number): number => {
      return normalizedFontSizes[size] ?? memoizedNormalizeForText(size);
    },
    [normalizedFontSizes, memoizedNormalizeForText],
  );
  const getNormalizedSize = useCallback(
    (size: number): number => {
      return normalizedSizes[size] ?? memoizedNormalize(size);
    },
    [normalizedSizes, memoizedNormalize],
  );
  const getNormalizedLineSize = useCallback(
    (size: number): number => {
      return normalizedLineSizes[size] ?? memoizedNormalizeLineHeight(size);
    },
    [normalizedLineSizes, memoizedNormalizeLineHeight],
  );

  return {
    getNormalizedFontSize,
    getNormalizedSize,
    getNormalizedLineSize,
    memoizedCalculateRenderScaling,
  };
};
