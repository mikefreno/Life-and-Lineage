import { ReactNode } from "react";
import Modal from "react-native-modal";
import { View } from "./Themed";

interface GenericModalProps {
  isVisibleCondition: boolean;
  backFunction: () => void;
  children: ReactNode;
}

export default function GenericModal({
  isVisibleCondition,
  backFunction,
  children,
}: GenericModalProps) {
  return (
    <Modal
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropOpacity={0.2}
      animationInTiming={500}
      animationOutTiming={300}
      isVisible={isVisibleCondition}
      onBackdropPress={backFunction}
      onBackButtonPress={backFunction}
    >
      <View
        className="mx-auto w-5/6 rounded-xl px-6 py-4 dark:border dark:border-zinc-500"
        style={{
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 2,
          },
          elevation: 2,
          shadowOpacity: 0.25,
          shadowRadius: 5,
        }}
      >
        {children}
      </View>
    </Modal>
  );
}
