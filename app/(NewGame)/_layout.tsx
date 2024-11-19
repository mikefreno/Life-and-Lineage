import { Stack, router } from "expo-router";
import { headerOptions } from "../_layout";
import { type ReactNode, createContext, useContext, useState } from "react";
import type { Element, PlayerClassOptions } from "../../utility/types";
import { useRootStore } from "../../hooks/stores";
import { Pressable } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

const NewGameContext = createContext<
  | {
      classSelection: PlayerClassOptions | undefined;
      setClassSelection: React.Dispatch<
        React.SetStateAction<PlayerClassOptions | undefined>
      >;
      blessingSelection: Element | undefined;
      setBlessingSelection: React.Dispatch<
        React.SetStateAction<Element | undefined>
      >;
      sex: "male" | "female" | undefined;
      setSex: React.Dispatch<
        React.SetStateAction<"male" | "female" | undefined>
      >;
      firstName: string;
      setFirstName: React.Dispatch<React.SetStateAction<string>>;
      lastName: string;
      setLastName: React.Dispatch<React.SetStateAction<string>>;
    }
  | undefined
>(undefined);

const NewGameProvider = ({ children }: { children: ReactNode }) => {
  const [classSelection, setClassSelection] = useState<
    PlayerClassOptions | undefined
  >();
  const [blessingSelection, setBlessingSelection] = useState<Element>();
  const [sex, setSex] = useState<"male" | "female">();
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");

  return (
    <NewGameContext.Provider
      value={{
        classSelection,
        setClassSelection,
        blessingSelection,
        setBlessingSelection,
        sex,
        setSex,
        firstName,
        setFirstName,
        lastName,
        setLastName,
      }}
    >
      {children}
    </NewGameContext.Provider>
  );
};

export const useNewGameStore = () => {
  const newGameStore = useContext(NewGameContext);
  if (!newGameStore)
    throw new Error("useNewGameStore used outside of NewGameProvider");
  return newGameStore;
};

export default function NewGameLayout() {
  const { playerState } = useRootStore();
  return (
    <NewGameProvider>
      <Stack>
        <Stack.Screen
          name="ClassSelect"
          options={{
            ...headerOptions({
              title: "Class Select",
            }),
            headerLeft: !!playerState
              ? ({ tintColor }) => (
                  <Pressable
                    onPress={router.dismissAll}
                    style={({ pressed }) => ({
                      opacity: pressed ? 0.5 : 1,
                      marginLeft: -12,
                    })}
                  >
                    <Ionicons name="chevron-back" size={28} color={tintColor} />
                  </Pressable>
                )
              : undefined,
          }}
        />
        <Stack.Screen
          name="BlessingSelect"
          options={headerOptions({ title: "Blessing Select" })}
        />
        <Stack.Screen
          name="SexSelect"
          options={headerOptions({ title: "Sex Select" })}
        />
        <Stack.Screen
          name="NameSelect"
          options={headerOptions({ title: "Name Set" })}
        />
        <Stack.Screen
          name="Review"
          options={headerOptions({ title: "Review" })}
        />
      </Stack>
    </NewGameProvider>
  );
}
