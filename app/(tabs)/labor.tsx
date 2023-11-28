import jobs from "../../assets/json/jobs.json";
import LaborTask from "../../components/LaborTask";
import { ScrollView, View } from "../../components/Themed";
import { useSelector } from "react-redux";
import { selectPlayerCharacter } from "../../redux/selectors";
import PlayerStatus from "../../components/PlayerStatus";

export default function LaborScreen() {
  const playerCharacter = useSelector(selectPlayerCharacter);
  if (!playerCharacter) {
    throw Error("No player character on labor tab");
  }

  const filteredJobs = jobs.filter((job) => {
    if (job.qualifications) {
      return job.qualifications.every((qual) =>
        playerCharacter.getQualifications().includes(qual),
      );
    }
    return true;
  });

  return (
    <View>
      <PlayerStatus displayGoldBottom={true} onTop={true} />
      <ScrollView>
        <View className="px-2 pb-24 pt-4">
          {filteredJobs
            .sort((aJob, bJob) => aJob.reward.gold - bJob.reward.gold)
            .map((Job, index) => {
              return (
                <LaborTask
                  key={index}
                  title={Job.title}
                  reward={Job.reward.gold}
                  cost={Job.cost}
                  experienceToPromote={Job.experienceToPromote}
                />
              );
            })}
        </View>
      </ScrollView>
    </View>
  );
}
