import { action, makeObservable, observable } from "mobx";

export class DraggableDataStore {
  iconString: string | null = null;
  inventoryBounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null = null;
  ancillaryBoundsMap = new Map<
    string,
    {
      x: number;
      y: number;
      width: number;
      height: number;
    } | null
  >();

  constructor() {
    makeObservable(this, {
      iconString: observable,
      inventoryBounds: observable,
      ancillaryBoundsMap: observable,
      setAncillaryBounds: action,
      clearAncillaryBounds: action,
      setIconString: action,
      setInventoryBounds: action,
    });
  }

  setIconString(icon: string | null) {
    this.iconString = icon;
  }

  setInventoryBounds(
    bounds: {
      x: number;
      y: number;
      width: number;
      height: number;
    } | null,
  ) {
    this.inventoryBounds = bounds;
  }

  setAncillaryBounds(
    key: string,
    bounds: {
      x: number;
      y: number;
      width: number;
      height: number;
    } | null,
  ) {
    this.ancillaryBoundsMap.set(key, bounds);
  }

  clearAncillaryBounds() {
    this.ancillaryBoundsMap.clear();
  }
}
