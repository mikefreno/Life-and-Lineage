import { makeAutoObservable, reaction, runInAction } from "mobx";
import { jwtDecode } from "jwt-decode";
import * as AppleAuthentication from "expo-apple-authentication";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { Platform } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { storage } from "@/utility/functions/storage";
import google_config from "@/config/google_config";
import { API_BASE_URL } from "@/config/config";
import type { RootStore } from "./RootStore";
import { reloadAppAsync } from "expo";
import { checkForUpdateAsync, fetchUpdateAsync } from "expo-updates";

type EmailLogin = {
  token: string;
  email: string;
  provider: "email";
};

type GoogleLogin = {
  token: string;
  email: string;
  provider: "google";
};

type AppleLogin = {
  token?: string;
  email: string;
  provider: "apple";
  appleUser: string;
};

type LoginCreds = EmailLogin | GoogleLogin | AppleLogin;

interface databaseExecuteProps {
  sql: string;
  args?: string[];
}

export class AuthStore {
  private token: string | null = null;
  private email: string | null = null;
  private provider: "email" | "apple" | "google" | null = null;
  private apple_user_string: string | null = null;
  private db_name: string | null = null;
  private db_token: string | null = null;
  deletionScheduled: string | undefined;
  isConnected: boolean = false;
  updateAvailable: boolean = false;
  private isInitialized: boolean = false;
  root: RootStore;

  constructor({ root }: { root: RootStore }) {
    this.root = root;

    this.isConnected = false;
    this.isInitialized = false;

    this.initializeNetInfo();
    this.initializeAuth();
    this.initializeGoogleSignIn();

    setTimeout(() => this.checkAvailableUpdates(), 5000);

    makeAutoObservable(this);

    reaction(
      () => this.isConnected,
      () => {
        if (this.isConnected) {
          this.deletionCheck();
          this.checkAvailableUpdates();
        }
      },
    );
  }
  checkAvailableUpdates() {
    checkForUpdateAsync()
      .then((val) => {
        if (val.isAvailable) {
          runInAction(() => {
            this.updateAvailable = true;
          });
        }
      })
      .catch((e) => {
        __DEV__ && console.log(e);
      });
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

  setDBCredentials = (name: string | null, token: string | null) => {
    this.db_name = name;
    this.db_token = token;
  };

  getDbURL() {
    return this.db_name
      ? `https://${this.db_name}-mikefreno.turso.io/v2/pipeline`
      : undefined;
  }

  getEmail() {
    return this.email;
  }

  setIsConnected = (isConnected: boolean) => {
    this.isConnected = isConnected;
  };

  setIsInitialized = (isInitialized: boolean) => {
    this.isInitialized = isInitialized;
  };

  get isConnectedAndInitialized() {
    return this.isConnected && this.isInitialized;
  }

  get isAuthenticated() {
    return !!this.token || !!this.apple_user_string;
  }

  initializeNetInfo = () => {
    NetInfo.fetch().then((state) => {
      this.setIsConnected(!!state.isConnected);
    });

    NetInfo.addEventListener((state) => {
      this.setIsConnected(!!state.isInternetReachable);
      if (state.isInternetReachable) {
        this.initializeAuth();
      }
    });
  };

  initializeAuth = async () => {
    if (!this.isConnected) {
      return;
    }

    if (Platform.OS === "web" && typeof window === "undefined") {
      // Running in server-side environment, skip storage access
      return;
    }
    try {
      const [storedToken, storedEmail, storedProvider, appleUser] =
        await Promise.all([
          storage.getString("userToken"),
          storage.getString("userEmail"),
          storage.getString("authProvider"),
          storage.getString("appleUser"),
        ]);

      if (storedToken || (appleUser && storedProvider === "apple")) {
        switch (storedProvider) {
          case "apple":
            await this.checkAppleAuth(appleUser ?? "", storedEmail ?? "");
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
            break;
          default:
            const isValid = await this.validateToken(storedToken!);
            if (isValid) {
              this.setAuthState(
                storedToken ?? "",
                storedEmail ?? "",
                storedProvider as "email",
              );
            } else {
              await this.logout();
            }
        }
      }

      this.deletionCheck();
      this.setIsInitialized(true);
    } catch (error) {
      await this.logout();
    }
  };

  // needed prior to a user pressing the associated button
  initializeGoogleSignIn = () => {
    GoogleSignin.configure({
      iosClientId: google_config.iosClientId,
      webClientId: google_config.webClientId,
      offlineAccess: true,
      forceCodeForRefreshToken: true,
    });
  };

  validateToken = async (token: string): Promise<boolean> => {
    try {
      const decodedToken: any = jwtDecode(token);
      if (decodedToken.exp < Date.now() / 1000) return false;

      const response = await fetch(`${API_BASE_URL}/email/refresh/token`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.token) {
          storage.set("userToken", data.token);
          runInAction(() => (this.token = data.token));
        }
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  login = async (creds: LoginCreds) => {
    try {
      const { email, provider, token } = creds;
      let appleUser: string | null = null;
      if (provider == "apple") {
        appleUser = creds.appleUser;
      }

      try {
        token && storage.set("userToken", token);
      } catch (error) {}
      try {
        email && storage.set("userEmail", email);
      } catch (error) {}
      try {
        storage.set("authProvider", provider);
      } catch (error) {}
      try {
        appleUser && storage.set("appleUser", appleUser);
      } catch (error) {}

      await this.deletionCheck();
      this.setAuthState(token ?? null, email, provider, appleUser);
    } catch (error) {
      console.error(error);
    }
  };

  logout = async () => {
    try {
      if (this.provider === "google") {
        await GoogleSignin.signOut();
      }
      storage.delete("userToken");
      storage.delete("userEmail");
      storage.delete("authProvider");
      storage.delete("appleUser");
      this.setAuthState(null, null, null);
      this.setDBCredentials(null, null);
    } catch (error) {}
  };

  appleSignIn = async () => {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });
    const user = credential.user;
    let email = credential.email;
    if (!email) {
      email = await this.appleEmailRetrieval(user);
      if (!email) {
        return `Failed to retrieve email, if you have created and deleted an account previously, you need to remove us from "Sign in with Apple".\nIn device settings>Apple Account>Sign in with Apple>Lineage>Delete`;
      }
    }

    const res = await fetch(`${API_BASE_URL}/apple/registration`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        userString: user,
      }),
    });

    if (res.status == 200 || res.status == 201) {
      const parse = await res.json();
      await this.login({
        email: parse.email,
        provider: "apple",
        appleUser: credential.user,
      });
      if (res.status == 201) {
        setTimeout(() => reloadAppAsync("hang prevention"));
      }
      return "success";
    } else if (res.status == 400) {
      throw new Error("Missing user string");
    } else if (res.status == 418) {
      throw new Error("Somehow the user was found but did not update");
    } else if (res.status == 500) {
      throw new Error("There was an unknown server error");
    }
  };

  googleSignIn = async () => {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();

    if (!userInfo.idToken) {
      throw new Error("missing idToken in response");
    }
    const res = await fetch(`${API_BASE_URL}/google/registration`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: userInfo.user.email,
      }),
    });
    await this.login({
      token: userInfo.idToken,
      email: userInfo.user.email,
      provider: "google",
    });
    if (!res.ok) {
      throw new Error("Failure during sign-in");
    }
    return res.status;
  };

  emailSignIn = async (data: {
    email: string;
    password: string;
  }): Promise<{ success: true } | { success: false; message: string }> => {
    const res = await fetch(`${API_BASE_URL}/email/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok) {
      if (res.status === 400) {
        return {
          success: false,
          message: result.message || "Bad request. Please check your input.",
        };
      } else if (res.status === 500) {
        return {
          success: false,
          message:
            result.message ||
            "An internal server error occurred. Please try again later.",
        };
      } else {
        if (result.message === "Email not yet verified!") {
          fetch(`${API_BASE_URL}/email/refresh/verification`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: data.email }),
          });
          return {
            success: false,
            message: result.message + " A new verification email has been sent",
          };
        } else {
          return {
            success: false,
            message: result.message || "An unexpected error occurred.",
          };
        }
      }
    } else {
      if (result.success) {
        await this.login({
          token: result.token,
          email: result.email,
          provider: "email",
        });
        return {
          success: true,
        };
      } else {
        return {
          success: false,
          message: "Login failed for an unknown reason.",
        };
      }
    }
  };

  private checkAppleAuth = async (
    appleUser: string | null,
    email: string | null,
  ) => {
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

          await this.login({ provider: "apple", email: email_opt, appleUser });
        } else {
          await this.login({ provider: "apple", email: email, appleUser });
        }
      } else {
        await this.logout();
      }
    } catch (error) {
      await this.logout();
    }
  };

  private refreshGoogleAuth = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signInSilently();
      if (userInfo) {
        if (!userInfo.idToken) {
          throw new Error("missing token");
        }
        await this.login({
          token: userInfo.idToken,
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

  async databaseExecute({ sql, args }: databaseExecuteProps) {
    if (!this.db_name || !this.db_token) {
      const credsRes = await fetch(`${API_BASE_URL}/database/creds`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${
            this.provider == "apple" ? this.apple_user_string : this.token
          }`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: this.email, provider: this.provider }),
      });

      const parse = await credsRes.json();
      if (credsRes.ok) {
        this.setDBCredentials(parse.db_name, parse.db_token);
      } else {
        this.logout();
      }
    }
    let url = this.getDbURL();
    if (!url) {
      for (let i = 1; i++; i <= 3) {
        setTimeout(() => {
          url = this.getDbURL();
        }, 250);
      }
      if (!url) {
        throw new Error("url build failed!");
      }
    }

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.db_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requests: [
            {
              type: "execute",
              stmt: args
                ? { sql: sql, args: this.argBuilder(args) }
                : { sql: sql },
            },
            { type: "close" },
          ],
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      return await res.json();
    } catch (error) {
      console.error("Database execution error:", error);
      throw error;
    }
  }

  private argBuilder(args: string[]) {
    const types = args.map((arg) => this.argCheck(arg));
    const built: { type: string; value: string }[] = [];
    args.forEach((arg, idx) => built.push({ type: types[idx], value: arg }));
    return built;
  }

  private argCheck(arg: string) {
    if (/^-?\d+$/.test(arg)) {
      return "integer";
    }

    if (/^-?\d*\.\d+$/.test(arg)) {
      return "float";
    }

    if (/^data:.*;base64,/.test(arg)) {
      return "blob";
    }
    if (arg == "null") {
      return "null";
    }

    return "text";
  }

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
    return null;
  };

  async deleteAccount({
    sendEmail,
    skipCron,
  }: {
    sendEmail: boolean;
    skipCron: boolean;
  }) {
    const apiUrl = `${API_BASE_URL}/database/deletion/init`;

    const payload = {
      email: this.email,
      db_name: this.db_name,
      db_token: this.db_token,
      skip_cron: skipCron,
      send_dump_target: sendEmail && this.email,
    };

    return fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${
          this.apple_user_string ? this.apple_user_string : this.token
        }`,
      },
      body: JSON.stringify(payload),
    })
      .then(async (response) => {
        return await response.json();
      })
      .catch((e) => console.error(e));
  }

  async deletionCheck() {
    const apiUrl = `${API_BASE_URL}/database/deletion/check`;
    const payload = {
      email: this.email,
    };

    const res = await fetch(apiUrl, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const response = await res.json();

      if (response.created_at) {
        runInAction(() => {
          const isoString = response.created_at.replace(" ", "T") + "Z";
          const createdDate = new Date(
            new Date(isoString).getTime() + 24 * 60 * 60 * 1000,
          );
          const todayMidnightUTC = new Date(
            Date.UTC(
              createdDate.getUTCFullYear(),
              createdDate.getUTCMonth(),
              createdDate.getUTCDate(),
            ),
          );

          const nextUtcMidnight =
            createdDate.getTime() >= todayMidnightUTC.getTime()
              ? new Date(todayMidnightUTC.getTime() + 24 * 60 * 60 * 1000)
              : todayMidnightUTC;

          this.deletionScheduled = nextUtcMidnight.toLocaleString();
        });
      } else {
        this.deletionScheduled = undefined;
      }
    } else {
      this.deletionScheduled = undefined;
    }
  }

  async deletionCancel() {
    const apiUrl = `${API_BASE_URL}/database/deletion/cancel`;
    const payload = {
      email: this.email,
    };

    return fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${
          this.apple_user_string ? this.apple_user_string : this.token
        }`,
      },
      body: JSON.stringify(payload),
    })
      .then(async (response) => {
        return await response.json();
      })
      .catch((e) => console.error(e));
  }

  _debugLog = async () => {
    if (__DEV__) {
      try {
        const [storedToken, storedEmail, storedProvider, appleUser] =
          await Promise.all([
            storage.getString("userToken"),
            storage.getString("userEmail"),
            storage.getString("authProvider"),
            storage.getString("appleUser"),
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
        console.log("State DB Name:", this.db_name);
        console.log("State DB Token:", this.db_token);
      } catch (error) {
        console.error("Error in _debugLog:", error);
      }
    }
  };
}
