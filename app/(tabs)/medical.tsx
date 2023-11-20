import { Pressable, useColorScheme } from "react-native";
import { Text, View } from "../../components/Themed";

export default function MedicalScreen() {
  const colorScheme = useColorScheme();
  return (
    <View className="flex-1">
      <View
        className="flex flex-row justify-between"
        style={{
          backgroundColor: colorScheme == "light" ? "#fafafa" : "#18181b",
        }}
      >
        <View></View>
        <Pressable>
          <Text>Visit</Text>
        </Pressable>
      </View>
    </View>
  );
}
