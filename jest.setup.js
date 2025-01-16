import "react-native-gesture-handler/jestSetup";

jest.mock("expo-apple-authentication", () => {
  return {
    signInAsync: jest.fn(),
    getCredentialStateAsync: jest.fn(),
    AppleAuthenticationScope: {},
    AppleAuthenticationCredentialState: {},
  };
});

jest.mock("@react-native-google-signin/google-signin", () => {
  return {
    GoogleSignin: {
      configure: jest.fn(),
      hasPlayServices: jest.fn(),
      signIn: jest.fn(),
      signInSilently: jest.fn(),
      getCurrentUser: jest.fn(),
      signOut: jest.fn(),
    },
  };
});

jest.mock("@react-native-community/netinfo", () => {
  return {
    fetch: jest.fn(() => Promise.resolve({ isConnected: false })),
    addEventListener: jest.fn((callback) => {
      callback({ isConnected: false });
      return jest.fn();
    }),
  };
});

jest.mock("expo-av", () => ({
  Audio: {
    Sound: {
      createAsync: jest.fn().mockResolvedValue({
        sound: {
          playAsync: jest.fn(),
          stopAsync: jest.fn(),
          setVolumeAsync: jest.fn(),
          getStatusAsync: jest
            .fn()
            .mockResolvedValue({ isLoaded: true, volume: 1 }),
        },
      }),
    },
    setAudioModeAsync: jest.fn(),
  },
}));

jest.mock("./utility/functions/storage", () => ({
  storage: {
    getString: jest.fn(),
    set: jest.fn(),
    getAllKeys: jest.fn().mockReturnValue([]),
    delete: jest.fn(),
  },
}));

jest.mock("./hooks/generic", () => ({
  AccelerationCurves: {
    linear: "linear",
  },
}));

jest.mock("./components/GenericRaisedButton", () => ({}));
jest.mock("./components/DungeonComponents/DungeonMap", () => ({}));
jest.mock("./components/Themed", () => ({}));
jest.mock("./components/GenericStrikeAround", () => ({}));
jest.mock("./components/AttackDetails", () => ({}));
