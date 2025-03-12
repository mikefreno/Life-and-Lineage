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
  getRandomName,
  getRandomPersonality,
} from "@/utility/functions/misc";

export class CharacterStore {
  characters: Character[] = [];
  independentChildren: Character[] = []; // adoptable
  root: RootStore;

  constructor({ root }: { root: RootStore }) {
    this.root = root;

    const { characters, independentChildren } = this.hydrateCharacters(root);
    this.characters = characters;
    this.independentChildren = independentChildren;

    makeObservable(this, {
      characters: observable,
      independentChildren: observable,
      createIndependantChild: action,
      addCharacter: action,
      removeCharacter: action,
      setPlayer: action,
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
  }

  independantChildrenAgeCheck() {
    for (const child of this.independentChildren) {
      if (child.age >= 16) {
        this.removeIndependentChild({ child });
        this.independentChildren;
      }
    }
  }

  addCharacter(character: Character) {
    this.characters.push(character);
    this.characterSave(character);
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

  setPlayer(player: PlayerCharacter) {
    this.addCharacter(player);
  }

  clearCharacters() {
    this.characters = [];
    this.independentChildren = [];
    this.clearPersistedCharacters();
  }

  public createIndependantChild() {
    const sex = flipCoin() == "Heads" ? "male" : "female";
    const name = getRandomName(sex);
    const birthdate = this.root.time.generateBirthDateInRange(1, 17);
    const randomPersonality = getRandomPersonality();

    const child = new Character({
      sex: sex,
      firstName: name.firstName,
      lastName: name.lastName,
      birthdate: birthdate,
      personality: randomPersonality,
      root: this.root,
    });
    this.independentChildren.push(child);
    this.saveCharacter(child);
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
    const storedPlayerId = storage.getString("playerID");

    const characters: Character[] = [];
    const independentChildren: Character[] = [];
    let player: PlayerCharacter | null = null;

    // Hydrate characters
    if (storedCharacterIds) {
      (parse(storedCharacterIds) as string[]).forEach((id) => {
        const retrieved = storage.getString(`character_${id}`);
        if (retrieved) {
          try {
            const character = Character.fromJSON({ ...parse(retrieved), root });
            characters.push(character);
          } catch (e) {
            console.error("Error hydrating character:", id, e);
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

    // Hydrate player
    if (storedPlayerId) {
      const retrieved = storage.getString(`character_${storedPlayerId}`);
      if (retrieved) {
        player = PlayerCharacter.fromJSON({
          ...parse(retrieved),
          root: this.root,
        });
      }
    }

    return { characters, independentChildren, player };
  }

  private characterSave = async (character: Character) => {
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

  public saveCharacter = throttle(this.characterSave, 250);

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
    runInAction(() => {
      this.characters = data.characters.map((charData: any) =>
        Character.fromJSON({ ...charData, root: this.root }),
      );
    });

    runInAction(() => {
      this.independentChildren = data.independentChildren.map(
        (childData: any) =>
          Character.fromJSON({ ...childData, root: this.root }),
      );
    });
  }
}
