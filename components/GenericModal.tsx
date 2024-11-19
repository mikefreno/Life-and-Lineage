import { useEffect, type ReactNode } from "react";
import {
  Dimensions,
  Platform,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Modal from "react-native-modal";
import { ThemedView } from "./Themed";
import { useColorScheme } from "nativewind";
import { useRootStore } from "../hooks/stores";

interface GenericModalProps {
  isVisibleCondition: boolean;
  backFunction: () => void;
  children: ReactNode;
  backdropCloses?: boolean;
  size?: number;
  style?: StyleProp<ViewStyle>;
  noPad?: boolean;
}

/**
 * `size` is a percentage, default of 83.33%(5/6)
 * Only one can be shown at once
 * Animation must be fully finished before another can be triggered
 * This is 2*fade out timing
 * Use something like:
 ```ts
 setShowModal(false);
 wait(750).then(()=>{
     setShowSecondModal(true);
 })
 ```
 */
export default function GenericModal({
  isVisibleCondition,
  backFunction,
  children,
  backdropCloses = true,
  size,
  style,
  noPad,
}: GenericModalProps) {
  const height = Dimensions.get("window").height;
  const { colorScheme } = useColorScheme();
  const root = useRootStore();
  const { uiStore } = root;
  let { modalShowing } = uiStore;

  useEffect(() => {
    if (isVisibleCondition && !(root.atDeathScreen && !root.startingNewGame)) {
      modalShowing = true;
    }
  }, [isVisibleCondition, root.atDeathScreen, root.startingNewGame]);

  return (
    <Modal
      animationIn="slideInUp"
      animationOut="slideOutDown"
      animationInTiming={300}
      animationOutTiming={300}
      backdropTransitionOutTiming={300}
      backdropTransitionInTiming={300}
      backdropColor={
        Platform.OS == "ios"
          ? "#000000"
          : colorScheme == "light"
          ? "#ffffffff"
          : "#000000"
      }
      isVisible={
        isVisibleCondition && !(root.atDeathScreen && !root.startingNewGame)
      }
      backdropOpacity={0.5}
      onBackdropPress={backdropCloses ? backFunction : undefined}
      onBackButtonPress={backFunction}
      statusBarTranslucent={true}
      deviceHeight={height}
      style={style}
    >
      <ThemedView
        className={`mx-auto rounded-xl ${
          noPad ? "" : "px-[2vw] py-4"
        } dark:border dark:border-zinc-500 shadow shadow-black/25`}
        style={{
          shadowRadius: 5,
          elevation: 2,
          width: size ? `${size}%` : "83.3333%",
        }}
      >
        {children}
      </ThemedView>
    </Modal>
  );
}
