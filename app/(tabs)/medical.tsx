import { ScrollView, View } from "../../components/Themed";
import medicalOptions from "../../assets/json/medicalOptions.json";
import MedicalOption from "../../components/MedicalOptions";
import PlayerStatus from "../../components/PlayerStatus";

export default function MedicalScreen() {
  return (
    <View className="flex-1">
      <PlayerStatus onTop={true} displayGoldBottom={true} />
      <ScrollView>
        <View className="px-2 pb-24 pt-4">
          {medicalOptions.map((medOption, index) => {
            return (
              <MedicalOption
                key={index}
                title={medOption.serviceName}
                cost={medOption.cost}
                healthRestore={medOption.heathRestore}
                sanityRestore={medOption.sanityRestore}
                manaRestore={medOption.manaRestore}
                removeDebuffs={medOption.removeDebuffs}
              />
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
