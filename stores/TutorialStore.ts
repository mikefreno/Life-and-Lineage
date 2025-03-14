import { makeObservable, action, reaction, observable, toJS } from "mobx";
import { parse, stringify } from "flatted";
import { storage } from "@/utility/functions/storage";
import { throttle } from "lodash";
import { RootStore } from "@/stores/RootStore";
import { TutorialOption } from "@/utility/types";

export class TutorialStore {
  tutorialsShown: Record<TutorialOption, boolean>;
  tutorialsEnabled: boolean;
  root: RootStore;

  constructor({ root }: { root: RootStore }) {
    this.root = root;
    const { tutorialsEnabled, tutorialsShown } = this.hydrate();

    this.tutorialsShown = tutorialsShown;
    this.tutorialsEnabled = tutorialsEnabled;

    makeObservable(this, {
      tutorialsShown: observable,
      tutorialsEnabled: observable,
      updateTutorialState: action,
      resetTutorialState: action,
      disableTutorials: action,
      enableTutorials: action,
    });

    reaction(
      () => [this.tutorialsEnabled, toJS(this.tutorialsShown)],
      () => {
        this.saveGameSettings();
      },
    );
  }

  updateTutorialState(tutorial: TutorialOption, state: boolean) {
    this.tutorialsShown[tutorial] = state;
  }

  resetTutorialState(callbackFunction?: () => void) {
    const defaultState = {
      [TutorialOption.class]: false,
      [TutorialOption.aging]: false,
      [TutorialOption.blessing]: false,
      [TutorialOption.intro]: false,
      [TutorialOption.spell]: false,
      [TutorialOption.labor]: false,
      [TutorialOption.dungeon]: false,
      [TutorialOption.dungeonInterior]: false,
      [TutorialOption.shops]: false,
      [TutorialOption.shopInterior]: false,
      [TutorialOption.medical]: false,
      [TutorialOption.investing]: false,
      [TutorialOption.training]: false,
      [TutorialOption.firstBossKill]: false,
      [TutorialOption.keyItem]: false,
      [TutorialOption.relationships]: false,
    };
    this.tutorialsShown = defaultState;
    this.enableTutorials();
    if (callbackFunction) {
      callbackFunction();
    }
  }

  disableTutorials() {
    this.tutorialsEnabled = false;
  }

  enableTutorials() {
    this.tutorialsEnabled = true;
  }

  private _saveGameSettings = () => {
    try {
      storage.set(
        "tutorials",
        stringify({
          tutorialsShown: this.tutorialsShown,
          tutorialsEnabled: this.tutorialsEnabled,
        }),
      );
    } catch (e) {
      console.error(e);
    }
  };

  public saveGameSettings = throttle(this._saveGameSettings, 500);

  hydrate() {
    const retrieved = storage.getString("tutorials");
    if (!retrieved) {
      return {
        tutorialsShown: {
          [TutorialOption.class]: false,
          [TutorialOption.aging]: false,
          [TutorialOption.blessing]: false,
          [TutorialOption.intro]: false,
          [TutorialOption.spell]: false,
          [TutorialOption.labor]: false,
          [TutorialOption.dungeon]: false,
          [TutorialOption.dungeonInterior]: false,
          [TutorialOption.shops]: false,
          [TutorialOption.shopInterior]: false,
          [TutorialOption.medical]: false,
          [TutorialOption.investing]: false,
          [TutorialOption.training]: false,
          [TutorialOption.firstBossKill]: false,
          [TutorialOption.keyItem]: false,
          [TutorialOption.relationships]: false,
        },
        tutorialsEnabled: true,
      };
    }
    return parse(retrieved) as {
      tutorialsShown: {
        0: boolean;
        1: boolean;
        2: boolean;
        3: boolean;
        4: boolean;
        5: boolean;
        6: boolean;
        7: boolean;
        8: boolean;
        9: boolean;
        10: boolean;
        11: boolean;
        12: boolean;
        13: boolean;
        14: boolean;
        15: boolean;
      };
      tutorialsEnabled: boolean;
    };
  }
}
