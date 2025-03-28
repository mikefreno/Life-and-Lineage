import { observer } from "mobx-react-lite";
import { useRootStore } from "@/hooks/stores";
import { useStyles } from "@/hooks/styles";
import { Text } from "@/components/Themed";
import GenericStrikeAround from "@/components/GenericStrikeAround";
import { View, Switch, ScrollView } from "react-native";
import Slider from "@react-native-community/slider";

const AudioSettings = observer(() => {
  const { audioStore, uiStore } = useRootStore();
  const styles = useStyles();

  const renderSlider = (
    label: string,
    type: "master" | "ambient" | "sfx" | "combat",
    value: number,
  ) => (
    <View style={styles.px2}>
      <Text style={{ marginBottom: 8 }}>{label}</Text>
      <Slider
        style={{ width: "100%", height: 40 }}
        minimumValue={0}
        maximumValue={1}
        value={value}
        onValueChange={(value) => audioStore.setAudioLevel(type, value)}
      />
      <Text style={{ textAlign: "right" }}>{Math.round(value * 100)}%</Text>
    </View>
  );

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: "center",
        ...styles.notchMirroredLanscapePad,
      }}
    >
      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 48,
        }}
      >
        <GenericStrikeAround>Audio Settings</GenericStrikeAround>
        <View style={{ paddingBottom: uiStore.dimensions.height * 0.1 }}>
          {renderSlider("Master Volume", "master", audioStore.masterVolume)}
          {renderSlider(
            "Ambient Music",
            "ambient",
            audioStore.ambientMusicVolume,
          )}
          {__DEV__ &&
            renderSlider("Sound Effects", "sfx", audioStore.soundEffectsVolume)}
          {renderSlider("Combat Music", "combat", audioStore.combatMusicVolume)}

          <View style={styles.rowEvenly}>
            <Text style={[styles.myAuto, styles["text-xl"]]}>Mute</Text>
            <Switch
              trackColor={{ false: "#767577", true: "#3b82f6" }}
              ios_backgroundColor="#3e3e3e"
              thumbColor={"white"}
              onValueChange={(bool) => audioStore.setMuteValue(bool)}
              value={audioStore.muted}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
});

export default AudioSettings;
