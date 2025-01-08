import { observer } from "mobx-react-lite";
import { useRootStore } from "../../hooks/stores";
import { AudioLevels } from "../../stores/AudioStore";
import { useStyles } from "../../hooks/styles";
import { Text } from "../../components/Themed";
import GenericStrikeAround from "../../components/GenericStrikeAround";
import { Pressable, Switch, View } from "react-native";
import Slider from "@react-native-community/slider";

const AudioSettings = observer(() => {
  const { uiStore, audioStore } = useRootStore();
  const styles = useStyles();
  const renderSlider = (label: string, type: keyof AudioLevels) => (
    <View style={styles.px2}>
      <Text style={{ marginBottom: 8 }}>{label}</Text>
      <Slider
        style={{ width: "100%", height: 40 }}
        minimumValue={0}
        maximumValue={1}
        value={audioStore.levels[type]}
        onValueChange={(value) => audioStore.setAudioLevel(type, value)}
      />
      <Text style={{ textAlign: "right" }}>
        {Math.round(audioStore.levels[type] * 100)}%
      </Text>
    </View>
  );

  return (
    <View style={[styles.p4, { flex: 1 }]}>
      <GenericStrikeAround>Audio Settings</GenericStrikeAround>
      <View style={{ flex: 1 }}>
        {renderSlider("Master Volume", "master")}
        {renderSlider("Ambient Music", "ambientMusic")}
        {renderSlider("Sound Effects", "soundEffects")}
        {renderSlider("Combat Music", "combatMusic")}
        {renderSlider("Combat Sound Effects", "combatSoundEffects")}

        <View style={styles.rowEvenly}>
          <Text style={[styles.myAuto, styles.xl]}>Mute</Text>
          <Switch
            trackColor={{ false: "#767577", true: "#3b82f6" }}
            ios_backgroundColor="#3e3e3e"
            thumbColor={"white"}
            onValueChange={(bool) => audioStore.setMuteValue(bool)}
            value={audioStore.levels.muted}
          />
        </View>
      </View>
    </View>
  );
});
export default AudioSettings;
