import GenericModal from "./GenericModal";
import { View } from "./Themed";

export default function StoryModal({
  isVisible,
  backFunction,
  storyBeat,
}: {
  isVisible: boolean;
  backFunction: () => void;
  storyBeat: string;
}) {
  const storyBeats = {
    "necromancer defeated": { title: "", description: "" },
  };
  return (
    <GenericModal isVisibleCondition={isVisible} backFunction={backFunction}>
      <View></View>
    </GenericModal>
  );
}
