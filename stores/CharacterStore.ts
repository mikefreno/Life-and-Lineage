import { parse, stringify } from "flatted";
import { storage } from "../utility/functions/storage";
import { RootStore } from "./RootStore";
import { action, makeObservable, observable, reaction } from "mobx";
import { throttle } from "lodash";
import { Character, PlayerCharacter } from "../entities/character";

export class CharacterStore {
  adopt(arg0: {
    adoptee: Character;
    player: PlayerCharacter;
    partner: Character | undefined;
  }): void {
    throw new Error("Method not implemented.");
  }
  independantChildrenAgeCheck() {
    throw new Error("Method not implemented.");
  }
  @observable characters: Character[] = [];
  @observable independentChildren: Character[] = [];
  root: RootStore;

  constructor({ root }: { root: RootStore }) {
    this.root = root;
    makeObservable(this);

    const { characters, independentChildren } = this.hydrateCharacters();
    this.characters = characters;
    this.independentChildren = independentChildren;

    reaction(
      () => [this.characters, this.independentChildren],
      () => {
        this.saveCharacterIds();
      },
    );
  }

  @action
  addCharacter(character: Character) {
    this.characters.push(character);
    this.saveCharacter(character);
  }

  @action
  removeCharacter(characterId: string) {
    this.characters = this.characters.filter((c) => c.id !== characterId);
    this.clearPersistedCharacter(characterId);
  }

  @action
  setPlayer(player: PlayerCharacter) {
    this.addCharacter(player);
  }

  @action
  addIndependentChild(child: Character) {
    this.independentChildren.push(child);
    this.saveCharacter(child);
  }

  @action
  removeIndependentChild(childId: string) {
    this.independentChildren = this.independentChildren.filter(
      (c) => c.id !== childId,
    );
    this.clearPersistedCharacter(childId);
  }

  @action
  clearCharacters() {
    this.characters = [];
    this.independentChildren = [];
    this.clearPersistedCharacters();
  }

  private hydrateCharacters() {
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
          const character = Character.fromJSON({
            ...parse(retrieved),
            root: this.root,
          });
          characters.push(character);
        }
      });
    }

    // Hydrate independent children
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
      storage.set(
        `character_${character.id}`,
        stringify({ ...character, root: null }),
      );
    } catch (e) {}
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
    allKeys.forEach((key) => {
      if (key.startsWith("character_")) {
        storage.delete(key);
      }
    });
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
}
