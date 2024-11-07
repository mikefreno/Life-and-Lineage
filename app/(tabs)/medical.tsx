import { ScrollView, View as ThemedView } from "../../components/Themed";
import healthOptions from "../../assets/json/medicalOptions/healthOptions.json";
import manaOptions from "../../assets/json/medicalOptions/manaOptions.json";
import sanityOptions from "../../assets/json/medicalOptions/sanityOptions.json";
import otherOptions from "../../assets/json/medicalOptions/otherOptions.json";
import MedicalOption from "../../components/MedicalOptions";
import { useContext } from "react";
import { AppContext } from "../_layout";
import { useIsFocused } from "@react-navigation/native";
import TutorialModal from "../../components/TutorialModal";
import { View } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import GenericStrikeAround from "../../components/GenericStrikeAround";
import { TutorialOption } from "../../utility/types";
import { observer } from "mobx-react-lite";

const MedicalScreen = observer(() => {
  const appData = useContext(AppContext);
  if (!appData) {
    throw new Error("Missing Context");
  }
  const isFocused = useIsFocused();
  const { isCompact } = appData;

  return (
    <ThemedView className="flex-1">
      <TutorialModal
        tutorial={TutorialOption.medical}
        isFocused={isFocused}
        pageOne={{
          title: "Medical Tab",
          body: "Here you can acquire various forms of medical treatment.",
        }}
        pageTwo={{
          title: "Note: These tick the game clock forward",
          body: "Using items such as potions, or using spells will not tick the clock forward.",
        }}
      />
      <ThemedView className="flex-1">
        <ScrollView
          scrollIndicatorInsets={{ top: 48, right: 0, left: 0, bottom: 48 }}
        >
          <ThemedView
            className="px-2"
            style={{
              paddingBottom: useBottomTabBarHeight() + (isCompact ? 0 : 28),
              paddingTop: useHeaderHeight(),
            }}
          >
            <View className="flex flex-row">
              <View className="w-1/2">
                <GenericStrikeAround>Health</GenericStrikeAround>
                {healthOptions.map((medOption, index) => (
                  <MedicalOption
                    key={index}
                    title={medOption.serviceName}
                    cost={medOption.cost}
                    healthRestore={medOption.heathRestore as number | "fill"}
                    focused={isFocused}
                  />
                ))}
                <GenericStrikeAround>Other</GenericStrikeAround>
                {otherOptions.map((medOption, index) => (
                  <MedicalOption
                    key={index}
                    title={medOption.serviceName}
                    cost={medOption.cost}
                    removeDebuffs={medOption.removeDebuffs as number | "all"}
                    focused={isFocused}
                  />
                ))}
              </View>
              <View className="w-1/2">
                <GenericStrikeAround>Mana</GenericStrikeAround>
                {manaOptions.map((medOption, index) => (
                  <MedicalOption
                    key={index}
                    title={medOption.serviceName}
                    cost={medOption.cost}
                    manaRestore={medOption.manaRestore as number | "fill"}
                    focused={isFocused}
                  />
                ))}
                <GenericStrikeAround>Sanity</GenericStrikeAround>
                {sanityOptions.map((medOption, index) => (
                  <MedicalOption
                    key={index}
                    title={medOption.serviceName}
                    cost={medOption.cost}
                    sanityRestore={medOption.sanityRestore as number | "fill"}
                    focused={isFocused}
                  />
                ))}
              </View>
            </View>
          </ThemedView>
        </ScrollView>
      </ThemedView>
    </ThemedView>
  );
});
export default MedicalScreen;
