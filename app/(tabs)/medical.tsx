import React from "react";
import MedicalOption from "@/components/MedicalOptions";
import { useIsFocused } from "@react-navigation/native";
import TutorialModal from "@/components/TutorialModal";
import { ScrollView, View } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import GenericStrikeAround from "@/components/GenericStrikeAround";
import { TutorialOption } from "@/utility/types";
import { observer } from "mobx-react-lite";
import { useRootStore } from "@/hooks/stores";
import { useStyles } from "@/hooks/styles";

const MedicalScreen = observer(() => {
  const isFocused = useIsFocused();
  const { uiStore, JSONServiceStore } = useRootStore();
  const header = useHeaderHeight();
  const styles = useStyles();

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
            paddingTop: header,
            paddingBottom: uiStore.bottomBarHeight,
            width: "90%",
            marginHorizontal: "auto",
            ...styles.notchAvoidingLanscapeMargin,
          }}
          scrollIndicatorInsets={{ top: 48, right: 0, left: 0, bottom: 48 }}
        >
          <GenericStrikeAround>Health</GenericStrikeAround>
          {JSONServiceStore.readJsonFileSync("healthOptions").map(
            (medOption, index) => (
              <MedicalOption
                key={index}
                title={medOption.serviceName}
                cost={medOption.cost}
                healthRestore={medOption.heathRestore as number | "fill"}
                focused={isFocused}
              />
            ),
          )}

          <GenericStrikeAround>Mana</GenericStrikeAround>
          {JSONServiceStore.readJsonFileSync("manaOptions").map(
            (medOption, index) => (
              <MedicalOption
                key={index}
                title={medOption.serviceName}
                cost={medOption.cost}
                manaRestore={medOption.manaRestore as number | "fill"}
                focused={isFocused}
              />
            ),
          )}
          <GenericStrikeAround>Sanity</GenericStrikeAround>
          {JSONServiceStore.readJsonFileSync("sanityOptions").map(
            (medOption, index) => (
              <MedicalOption
                key={index}
                title={medOption.serviceName}
                cost={medOption.cost}
                sanityRestore={medOption.sanityRestore as number | "fill"}
                focused={isFocused}
              />
            ),
          )}
          <GenericStrikeAround>Conditions</GenericStrikeAround>
          {JSONServiceStore.readJsonFileSync("otherOptions").map(
            (medOption, index) => (
              <MedicalOption
                key={index}
                title={medOption.serviceName}
                cost={medOption.cost}
                removeDebuffs={medOption.removeDebuffs as number | "all"}
                focused={isFocused}
              />
            ),
          )}
        </ScrollView>
      </View>
    </>
  );
});
export default MedicalScreen;
