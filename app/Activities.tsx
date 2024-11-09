import activities from "../assets/json/activities.json";
import ActivityCard from "../components/ActivityCard";
import { ScrollView, View } from "react-native";
import PlayerStatus from "../components/PlayerStatus";
import { useHeaderHeight } from "@react-navigation/elements";

export default function Activities() {
  return (
    <>
      <View className="flex-1 justify-between">
        <ScrollView>
          <View className="px-4" style={{ paddingTop: useHeaderHeight() }}>
            {activities.map((activity) => (
              <ActivityCard activity={activity} key={activity.name} />
            ))}
          </View>
        </ScrollView>
      </View>
      <PlayerStatus tabScreen />
    </>
  );
}
