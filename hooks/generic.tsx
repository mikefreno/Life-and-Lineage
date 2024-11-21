import { Platform, Animated } from "react-native";
import * as Haptics from "expo-haptics";
import { useEffect, useCallback, useRef, useState } from "react";
import { useRootStore } from "./stores";
import { useLootState } from "../providers/DungeonData";
import type { Item } from "../entities/item";
import { AccelerationCurves } from "../utility/functions/misc";
import { DEFAULT_FADEOUT_TIME } from "../components/Themed";
import type { PlayerCharacter } from "../entities/character";
import { isAction } from "mobx";

export const useVibration = () => {
  const { uiStore } = useRootStore();
  /**
   * requires a `style` for the vibration, `essential`(optional) is a signal for if the user has set in-app vibrations to 'minimal', defaults to false
   */
  const vibrate = ({
    style,
    essential = false,
  }: {
    style: "light" | "medium" | "heavy" | "success" | "warning" | "error";
    essential?: boolean;
  }) => {
    const platform = Platform.OS;

    if (
      (uiStore.vibrationEnabled == "full" ||
        (uiStore.vibrationEnabled == "minimal" && essential)) &&
      (platform === "android" || platform === "ios")
    ) {
      switch (style) {
        case "light":
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case "medium":
          if (platform == "ios") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          } else {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
          break;
        case "heavy":
          if (platform == "ios") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          } else {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }
          break;
        case "success":
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case "warning":
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
        case "error":
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
      }
    }
  };

  // Return vibration function from Hook
  return vibrate;
};

const useSmartExecution = (isActiveRef: React.MutableRefObject<boolean>) => {
  const queueRef = useRef<(() => void)[]>([]);
  const isProcessingRef = useRef(false);
  const lastExecutionTimeRef = useRef(0);
  const baseThrottleTime = 8;

  const clearQueue = useCallback(() => {
    queueRef.current = [];
    isProcessingRef.current = false;
  }, []);

  const enqueue = useCallback(
    (task: () => void) => {
      if (!isActiveRef.current) return;
      queueRef.current.push(task);
      processQueue();
    },
    [isActiveRef],
  );

  const processQueue = useCallback(() => {
    if (
      !isActiveRef.current ||
      isProcessingRef.current ||
      queueRef.current.length === 0
    ) {
      return;
    }

    const now = Date.now();
    const timeSinceLastExecution = now - lastExecutionTimeRef.current;

    isProcessingRef.current = true;
    const task = queueRef.current.shift()!;
    const executionStart = performance.now();

    Promise.resolve(task())
      .then(() => {
        if (!isActiveRef.current) {
          isProcessingRef.current = false;
          return;
        }

        const executionTime = performance.now() - executionStart;
        const dynamicThrottleTime = Math.max(baseThrottleTime, executionTime);

        if (timeSinceLastExecution < dynamicThrottleTime) {
          setTimeout(() => {
            isProcessingRef.current = false;
            lastExecutionTimeRef.current = Date.now();
            processQueue();
          }, dynamicThrottleTime - timeSinceLastExecution);
        } else {
          isProcessingRef.current = false;
          lastExecutionTimeRef.current = now;
          setTimeout(() => processQueue(), 0);
        }
      })
      .catch((error) => {
        isProcessingRef.current = false;
        console.error("Task failed:", error);
        setTimeout(() => processQueue(), 0);
      });
  }, [isActiveRef]);

  return { enqueue, clearQueue };
};

interface AccelerationConfig<T> {
  minHoldTime?: number;
  maxSpeed?: number;
  accelerationCurve?: (t: number) => number;
  updateInterval?: number;
  action?: (amount: number, totalExecuted: number) => T;
  minActionAmount?: number;
  maxActionAmount?: number;
  debounceTime?: number;
  onError?: (error: Error) => void;
}

const defaultConfig: AccelerationConfig<void> = {
  minHoldTime: 250,
  maxSpeed: 10,
  accelerationCurve: AccelerationCurves.linear,
  updateInterval: 16,
  minActionAmount: 1,
};

export function useAcceleratedAction<T = void>(
  getMaxAmount: () => number | null,
  config: AccelerationConfig<T> = {},
) {
  const {
    minHoldTime,
    maxSpeed,
    accelerationCurve,
    updateInterval,
    action,
    minActionAmount,
    maxActionAmount,
    debounceTime,
    onError,
  } = { ...defaultConfig, ...config };

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const [amount, setAmount] = useState<number>(0);
  const singlePressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastAmountRef = useRef<number>(0);
  const totalExecutedRef = useRef<number>(0);
  const isActiveRef = useRef<boolean>(false);
  const { enqueue, clearQueue } = useSmartExecution(isActiveRef);

  const actionArgsRef = useRef<any | undefined>(undefined);

  const updateAmount = useCallback(() => {
    try {
      const elapsedTime = Date.now() - startTimeRef.current;
      const maxAmount = getMaxAmount();

      if (elapsedTime < minHoldTime!) {
        if (!action) {
          setAmount(1);
        }
        return;
      }

      const adjustedTime = (elapsedTime - minHoldTime!) / 1000;
      const accelerationFactor = Math.min(
        accelerationCurve!(adjustedTime),
        maxSpeed!,
      );

      const pointsPerSecond = accelerationFactor;
      const newAmount = 1 + Math.floor(pointsPerSecond * adjustedTime);

      if (action) {
        enqueue(() => {
          const amountDiff = newAmount - lastAmountRef.current;
          const executionAmount = Math.max(
            minActionAmount ?? 1,
            Math.min(amountDiff, maxActionAmount ?? Infinity),
          );

          if (executionAmount > 0) {
            action(executionAmount, totalExecutedRef.current);
            totalExecutedRef.current += executionAmount;
            lastAmountRef.current = newAmount;
          }
        });
      } else {
        const currentAmount =
          maxAmount !== null ? Math.min(newAmount, maxAmount) : newAmount;
        setAmount(currentAmount);
      }
    } catch (error) {
      onError?.(error as Error);
    }
  }, [
    getMaxAmount,
    minHoldTime,
    maxSpeed,
    accelerationCurve,
    action,
    minActionAmount,
    maxActionAmount,
    onError,
    enqueue,
  ]);

  const debouncedUpdateAmount = useCallback(() => {
    if (debounceTime && debounceTime > 0) {
      const now = Date.now();
      const timeSinceLastUpdate = now - (lastUpdateTimeRef.current || 0);

      if (timeSinceLastUpdate >= debounceTime) {
        updateAmount();
        lastUpdateTimeRef.current = now;
      }
    } else {
      updateAmount();
    }
  }, [updateAmount, debounceTime]);

  const lastUpdateTimeRef = useRef<number>(0);

  const start = useCallback(
    (args?: any) => {
      if (isActiveRef.current) {
        // If an action is already in progress, don't start a new one
        return;
      }
      actionArgsRef.current = args;
      isActiveRef.current = true;
      startTimeRef.current = Date.now();
      lastAmountRef.current = 0;
      totalExecutedRef.current = 0;
      lastUpdateTimeRef.current = 0;

      singlePressTimeoutRef.current = setTimeout(() => {
        if (action) {
          action(
            minActionAmount ?? 1,
            totalExecutedRef.current,
            actionArgsRef.current!,
          );
          totalExecutedRef.current += minActionAmount ?? 1;
        } else {
          setAmount(1);
        }
        intervalRef.current = setInterval(
          debouncedUpdateAmount,
          updateInterval,
        );
      }, 150);
    },
    [debouncedUpdateAmount, updateInterval, action, minActionAmount],
  );

  const stop = useCallback(() => {
    if (!isActiveRef.current) {
      return 0;
    }

    isActiveRef.current = false;
    clearQueue();

    if (singlePressTimeoutRef.current) {
      clearTimeout(singlePressTimeoutRef.current);
      singlePressTimeoutRef.current = null;

      // Execute action immediately for quick taps
      if (action) {
        action(minActionAmount ?? 1, totalExecutedRef.current);
        totalExecutedRef.current += minActionAmount ?? 1;
      }
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const finalAmount = action
      ? totalExecutedRef.current
      : amount > 0
      ? amount
      : 1;

    setAmount(0);
    lastAmountRef.current = 0;
    totalExecutedRef.current = 0;
    lastUpdateTimeRef.current = 0;

    return finalAmount;
  }, [amount, action, minActionAmount, clearQueue]);

  useEffect(() => {
    return () => {
      if (singlePressTimeoutRef.current) {
        clearTimeout(singlePressTimeoutRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    amount,
    start,
    stop,
    totalExecuted: totalExecutedRef.current,
  };
}

export const usePouch = () => {
  const { setLeftBehindDrops } = useLootState();

  const addItemToPouch = useCallback(({ items }: { items: Item[] }) => {
    setLeftBehindDrops((prev) => [...prev, ...items]);
  }, []);

  return { addItemToPouch };
};

export type StatType = "health" | "mana" | "sanity" | "gold";

export interface StatChange {
  current: number;
  cumulative: number;
  isShowing: boolean;
}

export const useStatChanges = (playerState: PlayerCharacter) => {
  const [statChanges, setStatChanges] = useState<Record<StatType, StatChange>>({
    health: { current: 0, cumulative: 0, isShowing: false },
    mana: { current: 0, cumulative: 0, isShowing: false },
    sanity: { current: 0, cumulative: 0, isShowing: false },
    gold: { current: 0, cumulative: 0, isShowing: false },
  });

  const lastUpdateTimeRef = useRef<Record<StatType, number>>({
    health: 0,
    mana: 0,
    sanity: 0,
    gold: 0,
  });

  const [records, setRecords] = useState({
    health: playerState?.currentHealth,
    mana: playerState?.currentMana,
    sanity: playerState?.currentSanity,
    gold: playerState?.gold,
  });

  const [healthDamageFlash] = useState(new Animated.Value(0));
  const [animationCycler, setAnimationCycler] = useState(0);

  useEffect(() => {
    const updateStat = (
      stat: StatType,
      currentValue: number,
      recordValue: number,
    ) => {
      if (currentValue !== recordValue) {
        const diff = currentValue - recordValue;
        lastUpdateTimeRef.current[stat] = Date.now();

        setStatChanges((prev) => ({
          ...prev,
          [stat]: {
            current: diff,
            cumulative: prev[stat].isShowing
              ? prev[stat].cumulative + diff
              : diff,
            isShowing: true,
          },
        }));
        setAnimationCycler((prev) => prev + 1);

        // Set timeout to clear the stat change
        setTimeout(() => {
          const timeSinceLastUpdate =
            Date.now() - lastUpdateTimeRef.current[stat];
          if (timeSinceLastUpdate >= DEFAULT_FADEOUT_TIME) {
            setStatChanges((prev) => ({
              ...prev,
              [stat]: { current: 0, cumulative: 0, isShowing: false },
            }));
          }
        }, DEFAULT_FADEOUT_TIME);
      }
    };

    if (playerState) {
      // Health special case for damage flash
      if (playerState.currentHealth !== records.health) {
        if (playerState.currentHealth - records.health < 0) {
          Animated.sequence([
            Animated.timing(healthDamageFlash, {
              toValue: 1,
              duration: 200,
              useNativeDriver: false,
            }),
            Animated.timing(healthDamageFlash, {
              toValue: 0,
              duration: 200,
              useNativeDriver: false,
            }),
          ]).start();
        }
      }

      // Update all stats
      updateStat("health", playerState.currentHealth, records.health);
      updateStat("mana", playerState.currentMana, records.mana);
      updateStat("sanity", playerState.currentSanity, records.sanity);
      updateStat("gold", playerState.gold, records.gold);

      // Update records
      setRecords({
        health: playerState.currentHealth,
        mana: playerState.currentMana,
        sanity: playerState.currentSanity,
        gold: playerState.gold,
      });
    }
  }, [
    playerState?.currentHealth,
    playerState?.currentMana,
    playerState?.currentSanity,
    playerState?.gold,
  ]);

  return { statChanges, animationCycler, healthDamageFlash };
};
