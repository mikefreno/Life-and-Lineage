import "react-native-gesture-handler/jestSetup";
jest.mock("react-native/Libraries/Animated/NativeAnimatedHelper");

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

jest.mock("./utility/functions/save_load", () => {
  return {
    storage: {
      getString: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
    },
  };
});

jest.mock("@react-native-community/netinfo", () => {
  return {
    fetch: jest.fn(() => Promise.resolve({ isConnected: true })),
    addEventListener: jest.fn((callback) => {
      callback({ isConnected: true });
      return jest.fn();
    }),
  };
});
