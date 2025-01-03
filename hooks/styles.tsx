import { StyleSheet, useColorScheme } from "react-native";
import { useRootStore } from "./stores";
import Colors from "../constants/Colors";

export const useStyles = () => {
  const colorScheme = useColorScheme();
  const { uiStore } = useRootStore();
  const { height, width, greater, lesser } = uiStore.dimensions;

  const isDark = colorScheme === "dark";
  const dark = Colors.dark;
  const light = Colors.light;

  const textXl = { fontSize: 20, lineHeight: 28 };
  const textLg = { fontSize: 18, lineHeight: 28 };
  const text2xl = { fontSize: 24, lineHeight: 32 };
  const text3xl = { fontSize: 30, lineHeight: 36 };

  const bold = { fontWeight: 700 as const };
  const italic = { fontStyle: "italic" as const };

  const border = {
    borderWidth: 1,
    borderColor: isDark ? dark.border : light.border,
  };

  return StyleSheet.create({
    // ---- Generics ---- //
    textLg,
    textXl,
    text2xl,
    text3xl,
    bold,
    italic,
    border,
    // ---- New Game ---- //
    newGameContainer: {
      flex: 1,
      alignItems: "center",
      paddingHorizontal: 0.06 * width,
    },
    newGameHeader: {
      ...text2xl,
      textAlign: "center",
      paddingTop: 0.02 * height,
    },
    tutorialResetButton: {
      marginHorizontal: "auto",
      marginTop: 8,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDark ? "#fafafa" : "#27272a",
      paddingHorizontal: 24,
      paddingVertical: 8,
    },
    tutorialButtonContainer: {
      position: "absolute",
      marginLeft: 16,
      marginTop: 16,
    },
    // ---- New Game - Class Select ---- //
    classSelectButton: {
      marginHorizontal: "auto",
      marginTop: 8,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDark ? "#fafafa" : "#27272a",
      paddingHorizontal: 24,
      paddingVertical: 8,
    },
    classDescriptionText: {
      marginTop: height * 0.02,
      height: 64,
      textAlign: "center",
    },

    // ---- New Game - Blessing Select ---- //
    blessingClassContainer: {
      alignItems: "center",
      justifyContent: "space-evenly",
      paddingVertical: 24,
    },
    blessingRow: {
      flexDirection: "row",
      justifyContent: "space-evenly",
      marginBottom: 32,
    },
    blessingPressable: {
      borderWidth: 1,
      width: "100%",
      height: "100%",
      alignItems: "center",
      justifyContent: "center",
    },

    // ---- New Game - Sex Select ---- //
    sexSelectionRow: {
      marginTop: "12%",
      flexDirection: "row",
      width: "100%",
      justifyContent: "space-evenly",
    },
    sexOption: {
      width: "33%",
      paddingVertical: 16,
      borderWidth: 1,
    },

    // ---- New Game - Name Select ---- //
    nameContainer: {
      flex: 1,
      paddingHorizontal: 24,
      paddingBottom: 64,
      alignItems: "center",
      justifyContent: "center",
    },
    nameInput: {
      borderRadius: 4,
      borderWidth: 1,
      paddingLeft: 8,
      paddingVertical: 8,
      fontFamily: "PixelifySans",
      fontSize: 20,
    },
  });
};
