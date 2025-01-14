import { useEffect, type ReactNode } from "react";
import {
  type AccessibilityRole,
  Dimensions,
  Platform,
  ScrollView,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Modal from "react-native-modal";
import { ThemedView } from "./Themed";
import { useRootStore } from "../hooks/stores";
import { useStyles } from "../hooks/styles";

interface GenericModalProps {
  isVisibleCondition: boolean;
  backFunction: () => void;
  children: ReactNode;
  backdropCloses?: boolean;
  size?: number;
  style?: StyleProp<ViewStyle>;
  noPad?: boolean;
  isCheckPointModal?: boolean;
  accessibilityRole?: AccessibilityRole;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityState?: {
    disabled?: boolean;
    selected?: boolean;
    checked?: boolean | "mixed";
    busy?: boolean;
    expanded?: boolean;
  };
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
  isCheckPointModal = false,
  ...props
}: GenericModalProps) {
  const height = Dimensions.get("screen").height;
  const root = useRootStore();
  const { uiStore } = root;
  let { modalShowing, colorScheme } = uiStore;
  const styles = useStyles();

  useEffect(() => {
    if (
      isVisibleCondition &&
      !(root.atDeathScreen && !isCheckPointModal && !root.startingNewGame)
    ) {
      modalShowing = true;
    }
  }, [isVisibleCondition, root.atDeathScreen, root.startingNewGame]);

  return (
    <Modal
      animationIn={uiStore.reduceMotion ? "fadeIn" : "slideInUp"}
      animationOut={uiStore.reduceMotion ? "fadeOut" : "slideOutDown"}
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
        isVisibleCondition &&
        !(root.atDeathScreen && !isCheckPointModal && !root.startingNewGame)
      }
      backdropOpacity={0.5}
      onBackdropPress={backdropCloses ? backFunction : undefined}
      onBackButtonPress={backFunction}
      statusBarTranslucent={true}
      coverScreen={true}
      deviceHeight={height}
      style={style}
      {...props}
    >
      <ThemedView
        style={{
          ...styles.modalContent,
          width: size ? `${size}%` : "83.3333%",
          paddingHorizontal: noPad ? 0 : "2%",
          paddingVertical: noPad ? 0 : 16,
        }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        >
          {children}
        </ScrollView>
      </ThemedView>
    </Modal>
  );
}
