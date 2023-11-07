import { View } from "../../components/Themed";
import tasks from "../../assets/tasks.json";
import LaborTask from "../../components/LaborTask";
import { ScrollView } from "react-native";

export default function LaborScreen() {
  return (
    <ScrollView>
      {tasks.map((task, index) => {
        return (
          <LaborTask
            key={index}
            title={task.title}
            reward={task.reward.gold}
            cost={task.cost}
          />
        );
      })}
    </ScrollView>
  );
}
