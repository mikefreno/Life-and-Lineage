import { useEffect, useState, type ReactNode } from "react";
import {
  type AccessibilityRole,
  DimensionValue,
  Platform,
  ScrollView,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Modal from "react-native-modal";
import { ThemedView } from "@/components/Themed";
import { useRootStore } from "@/hooks/stores";
import { useStyles } from "@/hooks/styles";
import { observer } from "mobx-react-lite";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { wait } from "@/utility/functions/misc";

interface GenericModalProps {
  isVisibleCondition: boolean;
  backFunction: () => void;
  children: ReactNode;
  backdropCloses?: boolean;
  size?: number;
  style?: StyleProp<ViewStyle>;
  innerStyle?: StyleProp<ViewStyle>;
  noPad?: boolean;
  scrollEnabled?: boolean;
  providedHeight?: DimensionValue;
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
const GenericModal = observer(
  ({
    isVisibleCondition,
    backFunction,
    children,
    backdropCloses = true,
    providedHeight,
    scrollEnabled = false,
    size,
    style,
    noPad,
    ...props
  }: GenericModalProps) => {
    const root = useRootStore();
    const { uiStore } = root;
    let { modalShowing, colorScheme } = uiStore;
    const styles = useStyles();
    const insets = useSafeAreaInsets();
    const [showContent, setShowContent] = useState<boolean>(isVisibleCondition);

    useEffect(() => {
      if (
        isVisibleCondition &&
        !(root.atDeathScreen && !root.startingNewGame)
      ) {
        modalShowing = true;
      }
    }, [isVisibleCondition, root.atDeathScreen, root.startingNewGame]);

    useEffect(() => {
      if (isVisibleCondition) {
        setShowContent(true);
      } else {
        wait(300).then(() => setShowContent(false));
      }
    }, [isVisibleCondition]);

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
          isVisibleCondition && !(root.atDeathScreen && !root.startingNewGame)
        }
        backdropOpacity={0.5}
        onBackdropPress={backdropCloses ? backFunction : undefined}
        onBackButtonPress={backFunction}
        statusBarTranslucent={true}
        coverScreen={true}
        deviceHeight={providedHeight ?? uiStore.dimensions.height}
        deviceWidth={uiStore.dimensions.width}
        style={[style]}
        {...props}
      >
        {showContent && (
          <ThemedView
            style={[
              {
                maxHeight:
                  uiStore.dimensions.height - insets.top - insets.bottom,
                ...styles.modalContent,
                width: size ? `${size}%` : "83.3333%",
              },
              props.innerStyle,
            ]}
          >
            <ScrollView
              style={{
                maxHeight:
                  uiStore.dimensions.height - insets.top - insets.bottom,
              }}
              contentContainerStyle={{
                flexGrow: 1,
                paddingVertical: noPad ? 0 : 16,
                paddingHorizontal: noPad ? 0 : "2%",
              }}
              showsVerticalScrollIndicator={false}
              scrollEnabled={scrollEnabled}
            >
              {children}
            </ScrollView>
          </ThemedView>
        )}
      </Modal>
    );
  },
);
export default GenericModal;
