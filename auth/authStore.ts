import { makeAutoObservable } from "mobx";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import * as AppleAuthentication from "expo-apple-authentication";
import { API_BASE_URL } from "../config/config";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import config from "../config/google_config";

type EmailLogin = {
  token: string;
  email: string;
  provider: "email";
};

type GoogleLogin = {
  idToken: string;
  email: string;
  provider: "google";
};

type AppleLogin = {
  identityToken?: string;
  email: string;
  provider: "apple";
  appleUser: string;
};

type LoginCreds = EmailLogin | GoogleLogin | AppleLogin;

class AuthStore {
  private token: string | null = null;
  private email: string | null = null;
  private provider: "email" | "apple" | "google" | null = null;
  private apple_user_string: string | null = null;
  private db_url: string | null = null;
  private db_token: string | null = null;

  constructor() {
    makeAutoObservable(this);
    this.initializeAuth();
    this.initializeGoogleSignIn();
  }

  setAuthState = (
    token: string | null,
    email: string | null,
    provider: "email" | "apple" | "google" | null,
    appleUser?: string | null,
  ) => {
    this.token = token;
    this.email = email;
    this.provider = provider;
    this.apple_user_string = appleUser ?? null;
  };

  setDBCredentials = (url: string | null, token: string | null) => {
    this.db_url = url;
    this.db_token = token;
  };

  get isAuthenticated() {
    return !!(this.token || this.apple_user_string);
  }

  initializeAuth = async () => {
    try {
      const [storedToken, storedEmail, storedProvider, appleUser] =
        await Promise.all([
          AsyncStorage.getItem("userToken"),
          AsyncStorage.getItem("userEmail"),
          AsyncStorage.getItem("authProvider"),
          AsyncStorage.getItem("appleUser"),
        ]);

      if (storedToken) {
        switch (storedProvider) {
          case "apple":
            await this.checkAppleAuth(appleUser, storedEmail);
            break;
          case "google":
            const hasPrevious = GoogleSignin.hasPreviousSignIn();
            if (hasPrevious) {
              const currentUser = GoogleSignin.getCurrentUser();
              if (currentUser) {
                // User info is available, use it
                this.setAuthState(
                  currentUser.idToken,
                  currentUser.user.email,
                  "google",
                );
              } else {
                // User info not available, try silent sign in
                await this.refreshGoogleAuth();
              }
            } else {
              // No previous sign in, clear stored data
              await this.logout();
            }
          default:
            const isValid = await this.validateToken(storedToken);
            if (isValid) {
              this.setAuthState(
                storedToken,
                storedEmail,
                storedProvider as "email" | "apple" | "google" | null,
                appleUser,
              );
            } else {
              await this.logout();
            }
        }
      }
    } catch (error) {
      console.error("Error initializing auth:", error);
      await this.logout();
    }
  };

  // needed prior to a user pressing the associated button
  initializeGoogleSignIn = () => {
    GoogleSignin.configure({
      iosClientId: config.iosClientId,
      webClientId: config.webClientId,
      offlineAccess: true,
      forceCodeForRefreshToken: true, // ensures you always get a refresh token
    });
  };

  validateToken = async (token: string): Promise<boolean> => {
    try {
      const decodedToken: any = jwtDecode(token);
      if (decodedToken.exp < Date.now() / 1000) return false;

      const response = await fetch(`${API_BASE_URL}/verify-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.token) {
          await AsyncStorage.setItem("userToken", data.token);
          this.token = data.token;
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error("Token validation error:", error);
      return false;
    }
  };

  googleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      userInfo.serverAuthCode;

      if (!userInfo.idToken) {
        throw new Error("missing idToken in response");
      }
      await this.login({
        idToken: userInfo.idToken,
        email: userInfo.user.email,
        provider: "google",
      });
      return {
        givenName: userInfo.user.givenName,
        familyName: userInfo.user.familyName,
        email: userInfo.user.email,
      };
    } catch (error) {
      console.log(error);
    }
  };

  private appleEmailRetrieval = async (user: string) => {
    const response = await fetch(`${API_BASE_URL}/apple/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userString: user }),
    });
    if (response.ok) {
      const { email } = await response.json();
      return email as string;
    }
    return undefined;
  };

  appleSignIn = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      const user = credential.user;
      let email = credential.email;
      if (!email) {
        const email_opt = await this.appleEmailRetrieval(user);
        if (!email_opt) throw new Error("email retrieval failed");
        email = email_opt;
      }
      await this.login({
        email,
        provider: "apple",
        appleUser: credential.user,
      });
      return {
        givenName: credential.fullName?.givenName,
        lastName: credential.fullName?.familyName,
        email: credential.email,
        userString: credential.user,
      };
    } catch (error) {
      console.log(error);
    }
  };

  login = async (creds: LoginCreds) => {
    try {
      const { email, provider } = creds;
      let token: string | undefined;

      switch (provider) {
        case "email":
          token = creds.token;
          break;
        case "google":
          token = creds.idToken;
          break;
        case "apple":
          token = creds.identityToken;
          break;
      }

      await Promise.all([
        token ? AsyncStorage.setItem("userToken", token) : Promise.resolve(),
        AsyncStorage.setItem("userEmail", email),
        AsyncStorage.setItem("authProvider", provider),
        provider === "apple"
          ? AsyncStorage.setItem("appleUser", creds.appleUser)
          : Promise.resolve(),
      ]);

      this.setAuthState(
        token ?? null,
        email,
        provider,
        provider === "apple" ? creds.appleUser : undefined,
      );
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  logout = async () => {
    try {
      if (this.provider === "google") {
        await GoogleSignin.signOut();
      }
      await Promise.all([
        AsyncStorage.removeItem("userToken"),
        AsyncStorage.removeItem("userEmail"),
        AsyncStorage.removeItem("authProvider"),
        AsyncStorage.removeItem("appleUser"),
      ]);
      this.setAuthState(null, null, null);
      this.setDBCredentials(null, null);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  refreshDatabaseCreds = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/verify-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify({}),
      });
      const parsed = await response.json();
      if (response.ok) {
        this.setDBCredentials(parsed.db_url, parsed.db_token);
      }
      if (parsed.message === "destroy token") {
        await this.logout();
      }
    } catch (error) {
      console.error("Error refreshing database credentials:", error);
    }
  };

  checkAppleAuth = async (appleUser: string | null, email: string | null) => {
    if (!appleUser) {
      await this.logout();
      return;
    }

    try {
      const credentialState =
        await AppleAuthentication.getCredentialStateAsync(appleUser);
      if (
        credentialState ===
        AppleAuthentication.AppleAuthenticationCredentialState.AUTHORIZED
      ) {
        if (!email) {
          const email_opt = await this.appleEmailRetrieval(appleUser);
          if (!email_opt) {
            await this.logout();
            return;
          }

          this.login({ provider: "apple", email: email_opt, appleUser });
        } else {
          this.login({ provider: "apple", email: email, appleUser });
        }
      } else {
        await this.logout();
      }
    } catch (error) {
      console.error("Apple auth refresh error:", error);
      await this.logout();
    }
  };

  refreshGoogleAuth = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signInSilently();
      if (userInfo) {
        await this.login({
          idToken: userInfo.idToken ?? "",
          email: userInfo.user.email,
          provider: "google",
        });
      } else {
        throw new Error("Failed to refresh Google authentication silently.");
      }
    } catch (error) {
      //ignore error, just log out
      await this.logout();
    }
  };

  _debugLog = async () => {
    try {
      const [storedToken, storedEmail, storedProvider, appleUser] =
        await Promise.all([
          AsyncStorage.getItem("userToken"),
          AsyncStorage.getItem("userEmail"),
          AsyncStorage.getItem("authProvider"),
          AsyncStorage.getItem("appleUser"),
        ]);

      console.log("*******USER AUTH STATE*******");
      console.log("Stored Token:", storedToken);
      console.log("Stored Email:", storedEmail);
      console.log("Stored Provider:", storedProvider);
      console.log("Stored Apple User:", appleUser);
      console.log("State Token:", this.token);
      console.log("State Email:", this.email);
      console.log("State Provider:", this.provider);
      console.log("State Apple User:", this.apple_user_string);
      console.log("State DB URL:", this.db_url);
      console.log("State DB Token:", this.db_token);
    } catch (error) {
      console.error("Error in _debugLog:", error);
    }
  };
}

export const authStore = new AuthStore();
