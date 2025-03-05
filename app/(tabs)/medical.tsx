import React from "react";
import healthOptions from "../../assets/json/medicalOptions/healthOptions.json";
import manaOptions from "../../assets/json/medicalOptions/manaOptions.json";
import sanityOptions from "../../assets/json/medicalOptions/sanityOptions.json";
import otherOptions from "../../assets/json/medicalOptions/otherOptions.json";
import MedicalOption from "../../components/MedicalOptions";
import { useIsFocused } from "@react-navigation/native";
import TutorialModal from "../../components/TutorialModal";
import { ScrollView, View } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import GenericStrikeAround from "../../components/GenericStrikeAround";
import { TutorialOption } from "../../utility/types";
import { observer } from "mobx-react-lite";
import { useRootStore } from "../../hooks/stores";

const MedicalScreen = observer(() => {
  const isFocused = useIsFocused();
  const { uiStore } = useRootStore();
  const header = useHeaderHeight();

  return (
    <>
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
      <View style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{
            paddingTop: header + 20,
            paddingBottom: uiStore.bottomBarHeight,
            width: "80%",
            marginHorizontal: "auto",
          }}
          scrollIndicatorInsets={{ top: 48, right: 0, left: 0, bottom: 48 }}
        >
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
          <GenericStrikeAround>Conditions</GenericStrikeAround>
          {otherOptions.map((medOption, index) => (
            <MedicalOption
              key={index}
              title={medOption.serviceName}
              cost={medOption.cost}
              removeDebuffs={medOption.removeDebuffs as number | "all"}
              focused={isFocused}
            />
          ))}
        </ScrollView>
      </View>
    </>
  );
});
export default MedicalScreen;
