import { ScrollView, View, Text } from "../../components/Themed";
import medicalOptions from "../../assets/json/medicalOptions.json";
import MedicalOption from "../../components/MedicalOptions";
import PlayerStatus from "../../components/PlayerStatus";
import Coins from "../../assets/icons/CoinsIcon";
import { useSelector } from "react-redux";
import { selectPlayerCharacter } from "../../redux/selectors";
export default function MedicalScreen() {
  const playerCharacter = useSelector(selectPlayerCharacter);
  return (
    <View>
      <View className="mx-4 pb-4">
        <View className="flex flex-row justify-center pt-2">
          <Text>{playerCharacter?.getReadableGold()}</Text>
          <Coins width={16} height={16} style={{ marginLeft: 6 }} />
        </View>
        <PlayerStatus />
      </View>
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
