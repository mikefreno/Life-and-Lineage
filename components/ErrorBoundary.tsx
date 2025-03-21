import { Component } from "react";
import { Text } from "@/components/Themed";
import { View } from "react-native";
import D20DieAnimation from "@/components/DieRollAnim";
import GenericFlatButton from "@/components/GenericFlatButton";
import { useRootStore } from "@/hooks/stores";
import { useStyles } from "@/hooks/styles";
import { reloadAppAsync } from "expo";
import React from "react";

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    __DEV__ && console.error("Error caught:", error, errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorRender />;
    }
    return this.props.children;
  }
}
function ErrorRender() {
  const root = useRootStore();
  const styles = useStyles();
  return (
    <View style={styles.errorContainer}>
      <View
        style={{
          flex: 1,
          justifyContent: "space-evenly",
        }}
      >
        <Text style={{ textAlign: "center" }}>Something went wrong.</Text>
        <View
          style={{
            width: "100%",
            marginHorizontal: "auto",
          }}
        >
          <D20DieAnimation
            keepRolling={true}
            slowRoll={true}
            replaceNum={"??"}
          />
        </View>
        <GenericFlatButton
          style={{ marginTop: 8 }}
          onPress={() => reloadAppAsync("Restart")}
        >
          Restart
        </GenericFlatButton>
        {__DEV__ && (
          <>
            <GenericFlatButton
              style={{ marginTop: 8 }}
              onPress={() => root.leaveDungeon()}
            >
              Clear Dungeon
            </GenericFlatButton>
            <GenericFlatButton
              style={{ marginTop: 8 }}
              onPress={() => root.clearAllData()}
            >
              Clear All Data
            </GenericFlatButton>
          </>
        )}
      </View>
    </View>
  );
}
