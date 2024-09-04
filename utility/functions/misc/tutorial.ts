import { storage } from "../save_load";

export function updateStoredTutorialState(state: boolean) {
  storage.set("tutorialsEnabled", JSON.stringify(state));
}
export function loadStoredTutorialState(): boolean {
  return JSON.parse(storage.getString("tutorialsEnabled") ?? "true");
}
