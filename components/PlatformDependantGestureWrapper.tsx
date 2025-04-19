import { tabRouteIndexing, optionRouteIndexing } from "@/app/_layout";
import { useVibration } from "@/hooks/generic";
import { useRootStore } from "@/hooks/stores";
import { RelativePathString, usePathname, useRouter } from "expo-router";
import { useMemo, type ReactNode } from "react";
import { Platform } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

export default function PlatformDependantGestureWrapper({
  children,
}: {
  children: ReactNode;
}) {
  const vibration = useVibration();
  const router = useRouter();
  const pathname = usePathname();

  const correctRouteSet = useMemo(() => {
    if (pathname.includes("Options")) {
      return optionRouteIndexing;
    }
    return tabRouteIndexing;
  }, [pathname]);

  const navigateToLeftTab = () => {
    if (pathname == "/Education") {
      router.back();
      return;
    }
    const currentIndex = correctRouteSet.indexOf(pathname ?? "");
    if (currentIndex === -1) {
      return;
    }
    let leftIdx: number;
    if (currentIndex === 0) {
      leftIdx = correctRouteSet.length - 1;
    } else {
      leftIdx = currentIndex - 1;
    }
    const newTabString = correctRouteSet[leftIdx];
    router.push(newTabString as RelativePathString);
    vibration({ style: "light" });
  };

  const navigateToRightTab = () => {
    if (pathname == "/Education") {
      router.back();
      return;
    }
    const currentIndex = correctRouteSet.indexOf(pathname ?? "");
    if (currentIndex === -1) {
      return;
    }
    let rightIdx: number;
    if (currentIndex === correctRouteSet.length - 1) {
      rightIdx = 0;
    } else {
      rightIdx = currentIndex + 1;
    }
    const newTabString = correctRouteSet[rightIdx];
    router.push(newTabString as RelativePathString);
    vibration({ style: "light" });
  };

  const startX = useSharedValue(0);
  const offsetX = useSharedValue(0);

  const swipeGesture = Gesture.Pan()
    .onBegin(() => {
      startX.value = 0;
      offsetX.value = 0;
    })
    .onUpdate((event) => {
      offsetX.value = event.translationX;
    })
    .onEnd((event) => {
      "worklet";

      if (
        Math.abs(event.velocityX) > 350 &&
        Math.abs(event.translationX) > 35
      ) {
        if (event.velocityX > 0) {
          runOnJS(navigateToLeftTab)();
        } else if (event.velocityX < 0) {
          runOnJS(navigateToRightTab)();
        }
      }

      offsetX.value = withSpring(0);
    });

  if (Platform.OS == "ios") {
    return (
      <GestureDetector gesture={swipeGesture}>
        <Animated.View style={{ flex: 1 }}>{children}</Animated.View>
      </GestureDetector>
    );
  } else {
    return children;
  }
}
