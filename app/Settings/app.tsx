import { Pressable, View as NonThemedView } from "react-native";
import { View, Text } from "../../components/Themed";
import { useState } from "react";
import { useColorScheme } from "nativewind";
import { useSelector } from "react-redux";
import { selectGame } from "../../redux/selectors";
import { toTitleCase } from "../../utility/functions";

export default function AppSettings() {
  const options = ["system", "light", "dark"];
  const { setColorScheme } = useColorScheme();

  const gameData = useSelector(selectGame);

  if (gameData) {
    const [selectedOption, setSelectedOption] = useState<number>(
      options.indexOf(gameData.getColorScheme()),
    );

    function setColorTheme(index: number, option: "system" | "light" | "dark") {
      gameData?.saveColorScheme(option);
      setSelectedOption(index);
      setColorScheme(option);
    }

    return (
      <>
        <View className="flex-1 items-center justify-center">
          <NonThemedView className="rounded border border-zinc-900 px-4 py-2 dark:border-zinc-50">
            <Text className="pb-6 text-2xl">Select Color Theme</Text>
            {options.map((item, index) => (
              <Pressable
                key={index}
                className="mb-4 ml-10 flex flex-row"
                onPress={() =>
                  setColorTheme(index, item as "system" | "light" | "dark")
                }
              >
                <NonThemedView
                  className={
                    selectedOption == index
                      ? "my-auto mr-4 h-4 w-4 rounded-full border border-zinc-900 bg-blue-500 dark:border-zinc-50 dark:bg-blue-600"
                      : "my-auto mr-4 h-4 w-4 rounded-full border border-zinc-900 dark:border-zinc-50"
                  }
                />
                <Text className="text-2xl tracking-widest">
                  {toTitleCase(item)}
                </Text>
              </Pressable>
            ))}
          </NonThemedView>
        </View>
      </>
    );
  }
}
