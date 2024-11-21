import { Component } from "react";
import { Text } from "./Themed";
import { View } from "react-native";
import D20DieAnimation from "./DieRollAnim";
import GenericFlatButton from "./GenericFlatButton";
import * as Updates from "expo-updates";

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
      return (
        <View className="flex-1 justify-center align-middle py-24">
          <View className="flex-1 justify-evenly">
            <Text className="text-center">Something went wrong.</Text>

            <View className=" w-full mx-auto">
              <D20DieAnimation
                keepRolling={true}
                slowRoll={true}
                replaceNum={"??"}
              />
            </View>
            <GenericFlatButton
              className="mt-2"
              onPress={() => Updates.reloadAsync()}
            >
              Restart
            </GenericFlatButton>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}
