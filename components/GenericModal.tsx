import { ReactNode, useContext, useEffect } from "react";
import { Dimensions, Platform } from "react-native";
import Modal from "react-native-modal";
import { View } from "./Themed";
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
 */
export default function GenericModal({
  isVisibleCondition,
  backFunction,
  children,
  backdropCloses = true,
  size,
  style,
}: GenericModalProps) {
  const deviceHeight = Dimensions.get("screen").height;
  const appData = useContext(AppContext);
  if (!appData) return;
  const {
    androidNavBarVisibility,
    visibilityWhenOpen,
    setVisisbilityWhenOpen,
  } = appData;

  useEffect(() => {
    if (isVisibleCondition && visibilityWhenOpen != androidNavBarVisibility) {
      console.log("setting");
      setVisisbilityWhenOpen(androidNavBarVisibility);
    }
  }, [androidNavBarVisibility]);

  return (
    <Modal
      animationIn="slideInUp"
      animationOut="slideOutDown"
      animationInTiming={500}
      animationOutTiming={300}
      backdropTransitionInTiming={Platform.OS === "android" ? -500 : 300}
      hasBackdrop
      backdropColor={"#000000a2"}
      isVisible={isVisibleCondition}
      onBackdropPress={backdropCloses ? backFunction : undefined}
      onBackButtonPress={backFunction}
      deviceHeight={deviceHeight}
      statusBarTranslucent={!visibilityWhenOpen}
      useNativeDriverForBackdrop
      useNativeDriver
      style={style}
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
