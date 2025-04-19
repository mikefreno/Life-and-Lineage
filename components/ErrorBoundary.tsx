import { Component } from "react";
import { Text } from "@/components/Themed";
import { ScrollView, View } from "react-native";
import D20DieAnimation from "@/components/DieRollAnim";
import GenericFlatButton from "@/components/GenericFlatButton";
import { useRootStore } from "@/hooks/stores";
import { reloadAppAsync } from "expo";
import React, { ReactNode, useState } from "react";
import * as Sentry from "@sentry/react-native";
import { fetchUpdateAsync, reloadAsync } from "expo-updates";
import GenericModal from "./GenericModal";
import { AnimatedLoadingText } from "./AnimatedLoadingText";

type Extra = unknown;
export type Extras = Record<string, Extra>;

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: unknown;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: unknown): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: unknown, errorInfo: React.ErrorInfo): void {
    // Create an extras object conforming to Extras type.
    const extras: Extras = {
      componentStack: errorInfo.componentStack,
    };

    Sentry.captureException(error, { extra: extras });

    __DEV__ && console.error("Error caught:", error, errorInfo.componentStack);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return <ErrorRender error={this.state.error} />;
    }
    return this.props.children;
  }
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

function ErrorRender({ error }: { error: unknown }): React.ReactElement {
  const root = useRootStore();
  const [expanded, setExpanded] = useState(false);
  root.uiStore.clearDungeonColor();
  const [downloadingUpdate, setDownloadingUpdate] = useState(false);
  const [downloadingError, setDownloadingError] = useState<string>();

  return (
    <>
      <GenericModal
        isVisibleCondition={!!downloadingError}
        backFunction={() => setDownloadingError(undefined)}
      >
        <View>
          <Text style={{ textAlign: "center" }}>
            An error occurred while downloading the update ironically. Yikes.
          </Text>
          <Text style={{ textAlign: "center" }}>{downloadingError}</Text>
        </View>
      </GenericModal>
      <ScrollView
        contentContainerStyle={{
          flex: 1,
          justifyContent: "space-evenly",
          paddingBottom: root.uiStore.insets?.bottom,
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
        {downloadingUpdate ? (
          <View style={{ marginTop: 8 }}>
            <Text style={{ textAlign: "center" }}>Downloading update</Text>
            <AnimatedLoadingText />
          </View>
        ) : (
          <View>
            <GenericFlatButton
              style={{ marginTop: 8 }}
              onPress={() => setExpanded((prev) => !prev)}
            >
              {expanded ? "Hide Error Details" : "Show Error Details"}
            </GenericFlatButton>
            {expanded && (
              <Text style={{ textAlign: "center", marginVertical: 8 }}>
                {getErrorMessage(error)}
              </Text>
            )}
            {root.authStore.updateAvailable && (
              <>
                <Text style={{ textAlign: "center", marginVertical: 8 }}>
                  An update is available that may address this, download and
                  update?
                </Text>
                <GenericFlatButton
                  style={{ marginTop: 8 }}
                  onPress={() => {
                    setDownloadingUpdate(true);
                    fetchUpdateAsync()
                      .then(() => reloadAsync())
                      .catch((e) => {
                        setDownloadingError(e);
                        setDownloadingUpdate(false);
                      });
                  }}
                >
                  Start
                </GenericFlatButton>
              </>
            )}
            <GenericFlatButton
              style={{ marginTop: 8 }}
              onPress={(): Promise<void> => reloadAppAsync("Restart")}
            >
              {root.authStore.updateAvailable
                ? "Restart without update"
                : "Restart"}
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
        )}
      </ScrollView>
    </>
  );
}
