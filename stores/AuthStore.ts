import { makeAutoObservable } from "mobx";
import { jwtDecode } from "jwt-decode";
import * as AppleAuthentication from "expo-apple-authentication";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { parseInt } from "lodash";
import { Platform } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { stringify } from "flatted";
import { storage } from "../utility/functions/storage";
import google_config from "../config/google_config";
import { API_BASE_URL } from "../config/config";
import { SaveRow } from "../utility/database";
import type { PlayerCharacter } from "../entities/character";
import type { Game } from "../entities/game";
import type { RootStore } from "./RootStore";

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
interface makeRemoteSaveProps {
  name: string;
  gameState: Game;
  playerState: PlayerCharacter;
}

interface overwriteRemoteSaveProps {
  name: string;
  id: number;
  gameState: Game;
  playerState: PlayerCharacter;
}
interface deleteRemoteSaveProps {
  id: number;
}

export class AuthStore {
  private token: string | null = null;
  private email: string | null = null;
  private provider: "email" | "apple" | "google" | null = null;
  private apple_user_string: string | null = null;
  private db_name: string | null = null;
  private db_token: string | null = null;
  isConnected: boolean = false;
  private isInitialized: boolean = false;
  root: RootStore;

  constructor({ root }: { root: RootStore }) {
    this.initializeNetInfo();
    this.initializeAuth();
    this.initializeGoogleSignIn();
    this.root = root;
    makeAutoObservable(this);
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
      this.setIsConnected(!!state.isConnected);
      if (state.isConnected) {
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
      this.setIsInitialized(true);
    } catch (error) {
      console.error("Error initializing auth:", error);
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
          storage.set("userToken", data.token);
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

  login = async (creds: LoginCreds) => {
    try {
      const { email, provider, token } = creds;
      let appleUser: string | null = null;
      if (provider == "apple") {
        appleUser = creds.appleUser;
      }

      try {
        token && storage.set("userToken", token);
      } catch (error) {
        console.error("userToken setting error:", error);
      }
      try {
        email && storage.set("userEmail", email);
      } catch (error) {
        console.error("userEmail setting error:", error);
      }
      try {
        storage.set("authProvider", provider);
      } catch (error) {
        console.error("authProvider setting error:", error);
      }
      try {
        appleUser && storage.set("appleUser", appleUser);
      } catch (error) {
        console.error("appleUser setting error:", error);
      }

      this.setAuthState(token ?? null, email, provider, appleUser);
    } catch (error) {
      console.error("Login error:", error);
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
    } catch (error) {
      console.error("Logout error:", error);
    }
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
      return res.status;
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

  getRemoteSaves = async () => {
    if (!this.isConnected) {
      throw new Error("Device is offline");
    }
    try {
      const res = await this.databaseExecute({ sql: `SELECT * FROM Save` });
      const data = await res.json();
      const rows = data.results[0].response.result.rows;
      return this.convertHTTPResponseSaveRow(rows);
    } catch (e) {
      console.log(e);
      return [];
    }
  };

  makeRemoteSave = async ({
    name,
    gameState,
    playerState,
  }: makeRemoteSaveProps) => {
    if (!this.isConnected) {
      throw new Error("Device is offline");
    }
    try {
      const time = this.formatDate(new Date());
      await this.databaseExecute({
        sql: `INSERT INTO Save (name, game_state, player_state, created_at, last_updated_at) VALUES (?, ?, ?, ?, ?)`,
        args: [name, stringify(gameState), stringify(playerState), time, time],
      });
    } catch (e) {
      console.error(e);
      return [];
    }
  };

  overwriteRemoteSave = async ({
    name,
    id,
    gameState,
    playerState,
  }: overwriteRemoteSaveProps) => {
    if (!this.isConnected) {
      throw new Error("Device is offline");
    }
    try {
      const updateTime = this.formatDate(new Date());
      const res = await this.databaseExecute({
        sql: `UPDATE Save SET game_state = ?, player_state = ?, last_updated_at = ? WHERE name = ? AND id = ?`,
        args: [
          stringify(gameState),
          stringify(playerState),
          updateTime,
          name,
          id.toString(),
        ],
      });
      await res?.json();
    } catch (e) {
      console.error(e);
      return [];
    }
  };

  deleteRemoteSave = async ({ id }: deleteRemoteSaveProps) => {
    if (!this.isConnected) {
      throw new Error("Device is offline");
    }
    try {
      const res = await this.databaseExecute({
        sql: `DELETE FROM Save WHERE id = ?`,
        args: [id.toString()],
      });
      await res?.json();
    } catch (e) {
      console.error(e);
      return [];
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

  private async databaseExecute({ sql, args }: databaseExecuteProps) {
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
    return res;
  }

  private convertHTTPResponseSaveRow = (rows: any[][]) => {
    let cleaned: SaveRow[] = [];
    rows.forEach((row) =>
      cleaned.push({
        id: parseInt(row[0].value),
        name: row[1].value,
        game_state: row[2].value,
        player_state: row[3].value,
        created_at: row[4].value,
        last_updated_at: row[5].value,
      }),
    );
    return cleaned;
  };

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
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

  _debugLog = async () => {
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
  };
}
