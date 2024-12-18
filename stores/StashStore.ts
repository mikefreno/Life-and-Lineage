import { makeObservable, observable, action, reaction, toJS } from "mobx";
import { RootStore } from "./RootStore";
import { Item } from "../entities/item";
import { stringify, parse } from "flatted";
import { storage } from "../utility/functions/storage";

export class StashStore {
  root: RootStore;
  items: { item: Item[] }[] = [];

  constructor({ root }: { root: RootStore }) {
    this.root = root;
    this.hydrateStore();

    makeObservable(this, {
      items: observable.deep,
      addItem: action,
      removeItem: action,
    });

    reaction(
      () => this.items.map((item) => toJS(item)),
      () => {
        this.saveStash();
      },
    );
  }

  saveStash() {
    try {
      const serializedData = stringify(
        this.items.map(
          ({ item }) => item.map((i) => ({ ...i, root: null })), // Remove root
        ),
      );
      storage.set("stash", serializedData);
    } catch (error) {
      console.error("Error saving stash:", error);
    }
  }

  hydrateStore() {
    try {
      const serializedData = storage.getString("stash");
      if (serializedData) {
        const parsedData = parse(serializedData);
        this.items = parsedData.map((itemArray: any[]) => ({
          item: itemArray.map((itemData: any) =>
            Item.fromJSON({ ...itemData, root: this.root }),
          ),
        }));
      }
    } catch (error) {
      console.error("Error hydrating stash:", error);
    }
  }

  addItem(item: Item[]) {
    this.items.push({ item });
    this.root.playerState?.removeFromInventory(item);
  }

  removeItem(itemToRemove: Item[]) {
    this.items = this.items.filter(
      ({ item }) => item[0].id !== itemToRemove[0].id,
    );
    this.root.playerState?.addToInventory(itemToRemove);
  }

  toCheckpointData() {
    return {
      items: stringify(this.items),
    };
  }

  fromCheckpointData(data: any) {
    if (data?.items) {
      this.items = data.items.map((itemArray: any[]) => ({
        item: itemArray.map((itemData) =>
          Item.fromJSON({ ...itemData, root: this.root }),
        ),
      }));
    }
  }
}
