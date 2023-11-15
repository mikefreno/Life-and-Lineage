import { useContext } from "react";
import jobs from "../../assets/jobs.json";
import LaborTask from "../../components/LaborTask";
import { ScrollView, View } from "../../components/Themed";
import { PlayerCharacterContext } from "../_layout";

export default function LaborScreen() {
  const playerContext = useContext(PlayerCharacterContext);

  if (!playerContext) {
    throw Error("Labor missing Context(s)");
  }

  const { playerCharacter } = playerContext;
  if (playerCharacter) {
    const filteredJobs = jobs.filter((job) => {
      if (job.qualifications) {
        return job.qualifications.every((qual) =>
          playerCharacter.getQualifications().includes(qual),
        );
      }
      return true;
    });

    return (
      <ScrollView>
        <View className="px-2 py-4">
          {filteredJobs
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
}
