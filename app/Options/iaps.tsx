import { ScrollView, View } from "react-native";
import { Text } from "@/components/Themed";
import { useRootStore } from "@/hooks/stores";
import { tw_base, useStyles } from "@/hooks/styles";
import GenericRaisedButton from "@/components/GenericRaisedButton";
import ThemedCard from "@/components/ThemedCard";
import {
  NecromancerPaywall,
  RangerPaywall,
  RemoteSavePaywall,
  DualPaywall,
} from "@/components/IAPPaywalls";
import { useState } from "react";
import { observer } from "mobx-react-lite";

const InAppPurchasePage = observer(() => {
  const { uiStore, iapStore } = useRootStore();
  const styles = useStyles();
  const [showNecromancerPurchase, setShowNecromancerPurchase] =
    useState<boolean>(false);
  const [showRangerPurchase, setShowRangerPurchase] = useState<boolean>(false);
  const [showDualPurchase, setShowDualPurchase] = useState<boolean>(false);
  const [showRemoteSavePurchase, setShowRemoteSavePurchase] =
    useState<boolean>(false);

  return (
    <ScrollView>
      <NecromancerPaywall
        isVisibleCondition={showNecromancerPurchase}
        onClose={() => setShowNecromancerPurchase(false)}
      />
      <RangerPaywall
        isVisibleCondition={showRangerPurchase}
        onClose={() => setShowRangerPurchase(false)}
      />
      <DualPaywall
        isVisibleCondition={showDualPurchase}
        onClose={() => setShowDualPurchase(false)}
      />
      <RemoteSavePaywall
        isVisibleCondition={showRemoteSavePurchase}
        onClose={() => setShowRemoteSavePurchase(false)}
      />
      <View
        style={{
          paddingHorizontal: uiStore.dimensions.width * 0.05,
          flex: 1,
          marginTop: tw_base[16],
          alignItems: "center",
        }}
      >
        <ThemedCard style={{ width: "100%" }}>
          <Text style={{ ...styles["text-lg"], textAlign: "center" }}>
            Unlock both the Ranger and the Necromancer{"\n"}$2.99
          </Text>
          <GenericRaisedButton
            onPress={() => setShowDualPurchase(true)}
            disabled={iapStore.necromancerUnlocked && iapStore.rangerUnlocked}
            childrenWhenDisabled={"Purchased, Thanks!"}
          >
            Purchase Both
          </GenericRaisedButton>
        </ThemedCard>
        <ThemedCard style={{ width: "100%" }}>
          <Text style={[styles["text-lg"], { textAlign: "center" }]}>
            Unlock the Ranger Or the Necromancer{"\n"}$1.99
          </Text>
          <GenericRaisedButton
            onPress={() => setShowNecromancerPurchase(true)}
            disabled={iapStore.necromancerUnlocked}
            childrenWhenDisabled={"Purchased, Thanks!"}
          >
            Purchase Necromancer
          </GenericRaisedButton>
          <GenericRaisedButton
            onPress={() => setShowRangerPurchase(true)}
            disabled={iapStore.rangerUnlocked}
            childrenWhenDisabled={"Purchased, Thanks!"}
          >
            Purchase Ranger
          </GenericRaisedButton>
        </ThemedCard>
        <ThemedCard style={{ width: "100%" }}>
          <Text style={[styles["text-lg"], { textAlign: "center" }]}>
            Unlock remote saves{"\n"}$0.99
          </Text>
          <GenericRaisedButton
            onPress={() => setShowRemoteSavePurchase(true)}
            disabled={iapStore.remoteSavesUnlocked}
            childrenWhenDisabled={"Purchased, Thanks!"}
          >
            Purchase
          </GenericRaisedButton>
        </ThemedCard>
      </View>
    </ScrollView>
  );
});
export default InAppPurchasePage;
