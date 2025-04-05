import GenericRaisedButton from "@/components/GenericRaisedButton";
import GenericStrikeAround from "@/components/GenericStrikeAround";
import PlayerStatusForSecondary from "@/components/PlayerStatus/ForSecondary";
import { Text } from "@/components/Themed";
import ThemedCard from "@/components/ThemedCard";
import { useRootStore } from "@/hooks/stores";
import { useStyles } from "@/hooks/styles";
import { jsonServiceStore } from "@/stores/SingletonSource";
import { toTitleCase } from "@/utility/functions/misc";
import { PvPRewardIcons } from "@/utility/pvp";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { ScrollView, View } from "react-native";

const PVPArena = observer(() => {
  const { pvpStore, uiStore } = useRootStore();
  const styles = useStyles();

  useEffect(() => {
    pvpStore.sendPlayerToAPI();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <GenericStrikeAround>Availible Battles</GenericStrikeAround>
        <ScrollView
          horizontal
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            ...styles.notchMirroredLanscapePad,
          }}
        >
          {pvpStore.availibleOpponents.map((opp) => (
            <ThemedCard></ThemedCard>
          ))}
        </ScrollView>
      </View>
      <View style={{ flex: 1 }}>
        <GenericStrikeAround>Rewards Option</GenericStrikeAround>
        <ScrollView
          horizontal
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            ...styles.notchMirroredLanscapePad,
          }}
        >
          {jsonServiceStore.readJsonFileSync("pvpRewards").map((pvpReward) => (
            <ThemedCard style={{ height: "100%" }}>
              <Text style={[styles["text-xl"], { textAlign: "center" }]}>
                {toTitleCase(pvpReward.name)}
              </Text>
              <View style={{ marginHorizontal: "auto" }}>
                <PvPRewardIcons
                  icon={pvpReward.icon}
                  size={uiStore.dimensions.lesser * 0.3}
                  colorScheme={uiStore.colorScheme}
                />
              </View>
              <Text style={[styles["text-2xl"], { textAlign: "center" }]}>
                Cost: {pvpReward.price}
              </Text>
              <GenericRaisedButton>Purchase</GenericRaisedButton>
            </ThemedCard>
          ))}
        </ScrollView>
      </View>
      <PlayerStatusForSecondary />
    </View>
  );
});
export default PVPArena;
