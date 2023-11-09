import jobs from "../../assets/jobs.json";
import LaborTask from "../../components/LaborTask";
import { ScrollView, View } from "react-native";

export default function LaborScreen() {
  return (
    <ScrollView>
      <View className="px-2 py-4">
        {jobs
          .sort((aJob, bJob) => aJob.reward.gold - bJob.reward.gold)
          .map((Job, index) => {
            return (
              <LaborTask
                key={index}
                title={Job.title}
                reward={Job.reward.gold}
                cost={Job.cost}
              />
            );
          })}
      </View>
    </ScrollView>
  );
}
