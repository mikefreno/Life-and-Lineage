import { ReactNode, useContext } from "react";
import { Platform } from "react-native";
import Modal from "react-native-modal";
import { View as ThemedView } from "./Themed";
import { AppContext } from "../app/_layout";

interface GenericModalProps {
  isVisibleCondition: boolean;
  backFunction: () => void;
  children: ReactNode;
  backdropCloses?: boolean;
  size?: number;
  style?: {};
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
}: GenericModalProps) {
  const appData = useContext(AppContext);
  const { dimensions } = appData!;

  return (
    <Modal
      animationIn="slideInUp"
      animationOut="slideOutDown"
      animationInTiming={500}
      animationOutTiming={300}
      backdropTransitionInTiming={Platform.OS === "android" ? 100 : 300}
      hasBackdrop
      backdropColor={"#000000a2"}
      isVisible={isVisibleCondition}
      onBackdropPress={backdropCloses ? backFunction : undefined}
      onBackButtonPress={backFunction}
      deviceHeight={dimensions.height}
      statusBarTranslucent
      useNativeDriver
      useNativeDriverForBackdrop
      style={style}
    >
      <ThemedView
        className="mx-auto rounded-xl px-[2vw] py-4 dark:border dark:border-zinc-500"
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
