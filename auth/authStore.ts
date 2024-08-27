import { makeAutoObservable } from "mobx";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import * as AppleAuthentication from "expo-apple-authentication";
import { API_BASE_URL } from "../config/config";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import config from "../config/google_config";
import { SaveRow } from "../utility/database";
import { PlayerCharacter } from "../classes/character";
import { Game } from "../classes/game";
import { parseInt } from "lodash";

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
  playerState: PlayerCharacter;
  gameState: Game;
}

interface overwriteRemoteSaveProps {
  name: string;
  id: number;
  playerState: PlayerCharacter;
  gameState: Game;
}
interface deleteRemoteSaveProps {
  id: number;
}

class AuthStore {
  private token: string | null = null;
  private email: string | null = null;
  private provider: "email" | "apple" | "google" | null = null;
  private apple_user_string: string | null = null;
  private db_name: string | null = null;
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

  get isAuthenticated() {
    return !!this.token || !!this.apple_user_string;
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

      if (storedToken || (appleUser && storedProvider === "apple")) {
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
            break;
          default:
            const isValid = await this.validateToken(storedToken!);
            if (isValid) {
              this.setAuthState(
                storedToken,
                storedEmail,
                storedProvider as "email",
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

  getRemoteSaves = async () => {
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

  private convertHTTPResponseSaveRow = (rows: any[][]) => {
    let cleaned: SaveRow[] = [];
    rows.forEach((row) =>
      cleaned.push({
        id: parseInt(row[0].value),
        name: row[1].value,
        player_state: row[2].value,
        game_state: row[3].value,
        created_at: row[4].value,
        last_updated_at: row[5].value,
      }),
    );
    return cleaned;
  };

  login = async (creds: LoginCreds) => {
    try {
      const { email, provider, token } = creds;
      let appleUser: string | null = null;
      if (provider == "apple") {
        appleUser = creds.appleUser;
      }

      await Promise.all([
        token ? AsyncStorage.setItem("userToken", token) : Promise.resolve(),
        AsyncStorage.setItem("userEmail", email),
        AsyncStorage.setItem("authProvider", provider),
        appleUser
          ? AsyncStorage.setItem("appleUser", appleUser)
          : Promise.resolve(),
      ]);

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
  };
  googleSignIn = async () => {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    userInfo.serverAuthCode;

    if (!userInfo.idToken) {
      throw new Error("missing idToken in response");
    }
    await this.login({
      token: userInfo.idToken,
      email: userInfo.user.email,
      provider: "google",
    });
    await fetch(`${API_BASE_URL}/google/registration`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        familyName: userInfo.user.familyName,
        email: userInfo.user.email,
      }),
    });
  };

  makeRemoteSave = async ({
    name,
    playerState,
    gameState,
  }: makeRemoteSaveProps) => {
    try {
      const time = this.formatDate(new Date());
      const res = await this.databaseExecute({
        sql: `INSERT INTO Save (name, player_state, game_state, created_at, last_updated_at) VALUES (?, ?, ?, ?, ?)`,
        args: [
          name,
          JSON.stringify(playerState),
          JSON.stringify(gameState),
          time,
          time,
        ],
      });
      await res.json();
    } catch (e) {
      console.error(e);
      return [];
    }
  };

  overwriteRemoteSave = async ({
    name,
    id,
    playerState,
    gameState,
  }: overwriteRemoteSaveProps) => {
    try {
      const updateTime = this.formatDate(new Date());
      console.log(updateTime);
      const res = await this.databaseExecute({
        sql: `UPDATE Save SET player_state = ?, game_state = ?, last_updated_at = ? WHERE name = ? AND id = ?`,
        args: [
          JSON.stringify(playerState),
          JSON.stringify(gameState),
          updateTime,
          name,
          id.toString(),
        ],
      });
      const parsed = await res.json();
      console.log(parsed.results[0]);
    } catch (e) {
      console.error(e);
      return [];
    }
  };

  deleteRemoteSave = async ({ id }: deleteRemoteSaveProps) => {
    try {
      const updateTime = this.formatDate(new Date());
      console.log(updateTime);
      const res = await this.databaseExecute({
        sql: `DELETE FROM Save WHERE id = ?`,
        args: [id.toString()],
      });
      const parsed = await res.json();
      console.log(parsed.results[0]);
    } catch (e) {
      console.error(e);
      return [];
    }
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
    return undefined;
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
      this.setDBCredentials(parse.db_name, parse.db_token);
    }
    const url = this.getDbURL();
    if (!url) throw new Error("url build failed!");
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
      console.log("State DB Name:", this.db_name);
      console.log("State DB Token:", this.db_token);
    } catch (error) {
      console.error("Error in _debugLog:", error);
    }
  };
}

export const authStore = new AuthStore();
