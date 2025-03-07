import React, { useCallback, useEffect, useState, useRef } from "react";
import { useRootStore } from "@/hooks/stores";
import { observer } from "mobx-react-lite";
import WebView from "react-native-webview";
import { View, TouchableOpacity, BackHandler, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useStyles } from "@/hooks/styles";
import { Text } from "@/components/Themed";
import Colors from "@/constants/Colors";

const FrenoDotMeWebview = observer(() => {
  const { uiStore } = useRootStore();
  const webViewRef = useRef<WebView>(null);
  const navigation = useNavigation();
  const [canGoBack, setCanGoBack] = useState(false);
  const styles = useStyles();

  const handleBackPress = () => {
    if (webViewRef.current && canGoBack) {
      webViewRef.current.goBack();
      return true;
    }
    return false;
  };

  const onAndroidBackPress = useCallback(() => {
    if (canGoBack) {
      webViewRef.current?.goBack();
      return true;
    }
    navigation.goBack();
    return true;
  }, [canGoBack, navigation]);

  useEffect(() => {
    if (Platform.OS === "android") {
      BackHandler.addEventListener("hardwareBackPress", onAndroidBackPress);
      return () => {
        BackHandler.removeEventListener(
          "hardwareBackPress",
          onAndroidBackPress,
        );
      };
    }
  }, [onAndroidBackPress]);

  const handleClose = () => {
    navigation.goBack();
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.webViewHeader}>
        <TouchableOpacity
          onPress={handleBackPress}
          style={{ padding: 10, opacity: canGoBack ? 1.0 : 0.3 }}
          disabled={!canGoBack}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={Colors[uiStore.colorScheme].border}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleClose}>
          <Text>Close</Text>
        </TouchableOpacity>
      </View>

      <WebView
        ref={webViewRef}
        style={{ flex: 1 }}
        originWhitelist={["https://*.freno.me", "https://freno.me"]}
        source={{
          uri: `https://freno.me/${
            uiStore.webviewURL ?? "privacy-policy/life-and-lineage"
          }?viewer=lineage`,
        }}
        allowsBackForwardNavigationGestures={true}
        onNavigationStateChange={(navState) => {
          setCanGoBack(navState.canGoBack);
        }}
        onLoadProgress={(event) => {
          setCanGoBack(event.nativeEvent.canGoBack);
        }}
      />
    </View>
  );
});
export default FrenoDotMeWebview;
