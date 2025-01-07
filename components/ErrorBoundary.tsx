import { Component } from "react";
import { Text } from "./Themed";
import { View } from "react-native";
import D20DieAnimation from "./DieRollAnim";
import GenericFlatButton from "./GenericFlatButton";
import * as Updates from "expo-updates";
import { useRootStore } from "../hooks/stores";
import { useStyles } from "../hooks/styles";

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    __DEV__ && console.log("Error caught:", error, errorInfo.componentStack);
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
      <View style={styles.errorInnerContainer}>
        <Text style={{ textAlign: "center" }}>Something went wrong.</Text>

        <View style={styles.dieContainer}>
          <D20DieAnimation
            keepRolling={true}
            slowRoll={true}
            replaceNum={"??"}
          />
        </View>
        <GenericFlatButton
          style={{ marginTop: 8 }}
          onPress={() => Updates.reloadAsync()}
        >
          Restart
        </GenericFlatButton>
        {__DEV__ && (
          <GenericFlatButton
            style={{ marginTop: 8 }}
            onPress={() => root.leaveDungeon()}
          >
            Clear Dungeon
          </GenericFlatButton>
        )}
      </View>
    </View>
  );
}
