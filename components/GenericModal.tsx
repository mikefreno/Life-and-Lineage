import { ReactNode } from "react";
import { Dimensions } from "react-native";
import Modal from "react-native-modal";
import { View } from "./Themed";

interface GenericModalProps {
  isVisibleCondition: boolean;
  backFunction: () => void;
  children: ReactNode;
  backdropCloses?: boolean;
  size?: number;
}

export default function GenericModal({
  isVisibleCondition,
  backFunction,
  children,
  backdropCloses = true,
  size,
}: GenericModalProps) {
  const deviceHeight = Dimensions.get("screen").height;

  return (
    <Modal
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropOpacity={0.2}
      animationInTiming={500}
      animationOutTiming={300}
      isVisible={isVisibleCondition}
      onBackdropPress={backdropCloses ? backFunction : undefined}
      onBackButtonPress={backFunction}
      deviceHeight={deviceHeight}
      useNativeDriver
      statusBarTranslucent
    >
      <View
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
      </View>
    </Modal>
  );
}
