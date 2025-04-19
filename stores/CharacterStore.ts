import { parse, stringify } from "flatted";
import { storage } from "@/utility/functions/storage";
import { RootStore } from "@/stores/RootStore";
import {
  action,
  makeObservable,
  observable,
  reaction,
  runInAction,
} from "mobx";
import { throttle } from "lodash";
import { Character, PlayerCharacter } from "@/entities/character";
import {
  flipCoin,
  getNPCBaseCombatStats,
  getRandomName,
  getRandomPersonality,
} from "@/utility/functions/misc";

export class CharacterStore {
  characters: Character[] = [];
  independentChildren: Character[] = []; // adoptable
  root: RootStore;

  constructor({
    root,
    playerCharacter,
  }: {
    root: RootStore;
    playerCharacter: PlayerCharacter | null;
  }) {
    this.root = root;

    const { characters, independentChildren } = this.hydrateCharacters(root);
    this.characters = playerCharacter
      ? [...characters, playerCharacter]
      : characters;
    this.independentChildren = independentChildren;
    this.independantChildrenAgeCheck();

    makeObservable(this, {
      characters: observable,
      independentChildren: observable,

      createIndependantChild: action,
      addCharacter: action,
      removeCharacter: action,
      clearCharacters: action,
      adopt: action,
      fromCheckpointData: action,
      independantChildrenAgeCheck: action,
    });

    reaction(
      () => [this.characters.length, this.independentChildren.length],
      () => {
        this.saveCharacterIds();
      },
    );

    reaction(
      () => this.independentChildren.length,
      () => {
        this.independantChildrenAgeCheck();
      },
    );
  }

  adopt({
    child,
    partner,
  }: {
    child: Character;
    partner: Character | undefined;
  }) {
    this.removeIndependentChild({ child, adopting: true });
    this.root.playerState?.adopt({ child, partner });
    this.root.playerState?.spendGold(
      Math.max(25_000, Math.floor(this.root.playerState.gold * 0.15)),
    );
  }

  independantChildrenAgeCheck() {
    for (const child of this.independentChildren) {
      if (child.age >= 14) {
        this.removeIndependentChild({ child });
      }
    }
    if (this.independentChildren.length <= 2) {
      const numToAdd = Math.floor(Math.random() * 3 + 1);
      for (let i = 0; i < numToAdd; i++) {
        this.createIndependantChild();
      }
    }
  }

  addCharacter(character: Character) {
    this._characterSave(character);
    this.characters.push(character);
  }

  getCharacter(characterId: string): Character {
    const found = this.characters.find((char) => char.id === characterId);
    if (!found) {
      const stored = storage.getString(`character_${characterId}`);
      if (stored) {
        try {
          const character = Character.fromJSON({
            ...parse(stored),
            root: this.root,
          });
          this.characters.push(character);
          return character;
        } catch (e) {
          console.error("Error loading character from storage:", e);
        }
      }

      throw new Error(`Character not found! (${characterId})`);
    }
    return found;
  }

  removeCharacter(characterId: string) {
    this.characters = this.characters.filter((c) => c.id !== characterId);
    this.clearPersistedCharacter(characterId);
  }

  clearCharacters() {
    this.characters = [];
    this.independentChildren = [];
    this.clearPersistedCharacters();
  }

  public createIndependantChild() {
    const sex = flipCoin() == "Heads" ? "male" : "female";
    const name = getRandomName(sex);
    const birthdate = this.root.time.generateBirthDateInRange(1, 13);
    const randomPersonality = getRandomPersonality();

    const child = new Character({
      beingType: "human",
      sex: sex,
      firstName: name.firstName,
      lastName: name.lastName,
      birthdate: birthdate,
      personality: randomPersonality,
      animationStrings: {},
      activeAuraConditionIds: [],
      root: this.root,
      ...getNPCBaseCombatStats(),
    });
    this.independentChildren.push(child);
    this._characterSave(child);
  }

  private removeIndependentChild({
    child,
    adopting = false,
  }: {
    child: Character;
    adopting?: boolean;
  }) {
    this.independentChildren = this.independentChildren.filter(
      (char) => char.id !== child.id,
    );
    if (adopting) {
      this.addCharacter(child);
    } else {
      this.clearPersistedCharacter(child.id);
    }
  }

  private hydrateCharacters(root: RootStore) {
    const storedCharacterIds = storage.getString("characterIDs");
    const storedIndependentChildIds = storage.getString("independentChildIDs");

    const characters: Character[] = [];
    const independentChildren: Character[] = [];

    // Hydrate characters
    if (storedCharacterIds) {
      (parse(storedCharacterIds) as string[]).forEach((id) => {
        const retrieved = storage.getString(`character_${id}`);
        if (retrieved) {
          const parsed = parse(retrieved);
          if (parsed.id !== this.root.playerState?.id) {
            try {
              const character = Character.fromJSON({ ...parsed, root });
              characters.push(character);
            } catch (e) {
              console.error("Error hydrating character:", id, e);
            }
          }
        }
      });
    }

    if (storedIndependentChildIds) {
      (parse(storedIndependentChildIds) as string[]).forEach((id) => {
        const retrieved = storage.getString(`character_${id}`);
        if (retrieved) {
          const child = Character.fromJSON({
            ...parse(retrieved),
            root: this.root,
          });
          independentChildren.push(child);
        }
      });
    }

    return { characters, independentChildren };
  }

  _characterSave = (character: Character) => {
    if (character.id === this.root.playerState?.id) {
      return;
    }
    try {
      const key = `character_${character.id}`;
      const data = stringify({ ...character, root: null });
      storage.set(key, data);

      const stored = storage.getString(key);
      if (!stored) {
        console.error("Failed to verify character save:", character.id);
      }
    } catch (e) {
      console.error("Error saving character:", e);
    }
  };

  public saveCharacter = throttle(this._characterSave, 500);

  private saveCharacterIds = () => {
    const characterIds = this.characters.map((c) => c.id);
    const independentChildIds = this.independentChildren.map((c) => c.id);

    storage.set("characterIDs", stringify(characterIds));
    storage.set("independentChildIDs", stringify(independentChildIds));
  };

  private clearPersistedCharacters() {
    storage.delete("characterIDs");
    storage.delete("independentChildIDs");
    storage.delete("playerID");

    const allKeys = storage.getAllKeys();
    if (allKeys) {
      allKeys.forEach((key) => {
        if (key.startsWith("character_")) {
          storage.delete(key);
        }
      });
    }
  }

  private clearPersistedCharacter(characterId: string) {
    storage.delete(`character_${characterId}`);

    const storedCharacterIds = storage.getString("characterIDs");
    if (storedCharacterIds) {
      const ids = parse(storedCharacterIds) as string[];
      const updatedIds = ids.filter((id) => id !== characterId);
      storage.set("characterIDs", stringify(updatedIds));
    }

    const storedIndependentChildIds = storage.getString("independentChildIDs");
    if (storedIndependentChildIds) {
      const ids = parse(storedIndependentChildIds) as string[];
      const updatedIds = ids.filter((id) => id !== characterId);
      storage.set("independentChildIDs", stringify(updatedIds));
    }
  }

  toCheckpointData() {
    return {
      characters: this.characters.map((char) =>
        stringify({ ...char, root: null }),
      ),
      independentChildren: this.independentChildren.map((child) =>
        stringify({ ...child, root: null }),
      ),
    };
  }

  fromCheckpointData(data: any) {
    if (!data) {
      console.warn("Character data is undefined in checkpoint");
      return;
    }

    runInAction(() => {
      try {
        // Handle characters
        if (Array.isArray(data.characters)) {
          this.characters = data.characters
            .map((charData: any) => {
              try {
                return Character.fromJSON({
                  ...(typeof charData === "string"
                    ? parse(charData)
                    : charData),
                  root: this.root,
                });
              } catch (e) {
                console.error("Error parsing character data:", e);
                return null;
              }
            })
            .filter(Boolean); // Remove any null entries
        } else {
          console.warn("Characters data is not an array in checkpoint");
          this.characters = [];
        }

        // Handle independent children
        if (Array.isArray(data.independentChildren)) {
          this.independentChildren = data.independentChildren
            .map((childData: any) => {
              try {
                return Character.fromJSON({
                  ...(typeof childData === "string"
                    ? parse(childData)
                    : childData),
                  root: this.root,
                });
              } catch (e) {
                console.error("Error parsing independent child data:", e);
                return null;
              }
            })
            .filter(Boolean); // Remove any null entries
        } else {
          console.warn(
            "Independent children data is not an array in checkpoint",
          );
          this.independentChildren = [];
        }
      } catch (e) {
        console.error("Error in character store fromCheckpointData:", e);
        // Set to empty arrays as fallback
        this.characters = [];
        this.independentChildren = [];
      }
    });
  }
}
