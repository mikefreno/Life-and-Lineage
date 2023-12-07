import { observer } from "mobx-react-lite";
import { ScrollView, View } from "../components/Themed";
import qualifications from "../assets/json/qualifications.json";
import PlayerStatus from "../components/PlayerStatus";
import TrainingCard from "../components/TrainingCard";
import { Stack } from "expo-router";

const JobTraining = observer(() => {
  return (
    <>
      <Stack.Screen
        options={{
          title: "Gain Qualifications",
        }}
      />
      <View className="flex-1">
        <PlayerStatus displayGoldBottom={true} onTop={true} />
        <ScrollView>
          <View className="px-2 pb-24 pt-4">
            {qualifications.map((qual, index) => {
              return (
                <TrainingCard
                  key={index}
                  name={qual.name}
                  ticks={qual.ticks}
                  sanityCostPerTick={qual.sanityCostPerTick}
                  goldCostPerTick={qual.goldCostPerTick}
                  preRequisites={qual.prerequisites}
                />
              );
            })}
          </View>
        </ScrollView>
      </View>
    </>
  );
});
export default JobTraining;
