import { ReactNode } from "react";
import {
  Dimensions,
  Platform,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Modal from "react-native-modal";
import { View as ThemedView } from "./Themed";

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
 wait(600).then(()=>{
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

  return (
    <Modal
      animationIn="slideInUp"
      animationOut="slideOutDown"
      animationInTiming={600}
      animationOutTiming={300}
      backdropTransitionOutTiming={Platform.OS === "android" ? 600 : 300}
      backdropTransitionInTiming={Platform.OS === "android" ? 0 : 300}
      hasBackdrop
      backdropColor={"#000000a2"}
      isVisible={isVisibleCondition}
      onBackdropPress={backdropCloses ? backFunction : undefined}
      onBackButtonPress={backFunction}
      statusBarTranslucent={true}
      deviceHeight={height}
      style={style}
    >
      <ThemedView
        className={`mx-auto rounded-xl ${
          noPad ? "" : "px-[2vw] py-4"
        } dark:border dark:border-zinc-500`}
        style={{
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 2,
          },
          elevation: 2,
          shadowOpacity: 0.25,
          shadowRadius: 5,
          width: size ? `${size}%` : "83.3333%",
        }}
      >
        {children}
      </ThemedView>
    </Modal>
  );
}
