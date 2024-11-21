import { makeObservable, observable, action, reaction } from "mobx";
import { parse, stringify } from "flatted";
import { storage } from "../utility/functions/storage";
import { throttle } from "lodash";
import { RootStore } from "./RootStore";
import { TutorialOption } from "../utility/types";

export class TutorialStore {
  @observable tutorialsShown: Record<TutorialOption, boolean>;
  @observable tutorialsEnabled: boolean;
  root: RootStore;

  constructor({ root }: { root: RootStore }) {
    this.root = root;
    const { tutorialsEnabled, tutorialsShown } = this.hydrate();

    this.tutorialsShown = tutorialsShown;

    this.tutorialsEnabled = tutorialsEnabled;

    makeObservable(this);

    reaction(
      () => [this.tutorialsEnabled, ...Object.values(this.tutorialsShown)],
      () => {
        this.saveGameSettings();
      },
    );
  }

  @action
  updateTutorialState(tutorial: TutorialOption, state: boolean) {
    this.tutorialsShown[tutorial] = state;
  }

  @action
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
    };
    this.tutorialsShown = defaultState;
    this.enableTutorials();
    if (callbackFunction) {
      callbackFunction();
    }
  }

  @action
  disableTutorials() {
    this.tutorialsEnabled = false;
  }

  @action
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
    } catch (e) {}
  };

  public saveGameSettings = throttle(this._saveGameSettings, 500);

  hydrate() {
    const retrieved = storage.getString("gameSettings");
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
      };
      tutorialsEnabled: boolean;
    };
  }
}
