import { Game } from "../game";
import { createShops } from "../shop";
import { PlayerClassOptions } from "../../utility/types";
import Benchmark from "benchmark";
import { parse, stringify } from "flatted";

// my test code
describe("Game object exploration", () => {
  it("should reduce game size", () => {
    const shops = createShops(PlayerClassOptions.mage);
    const game = new Game({
      shops: shops,
      vibrationEnabled: "full",
    }); // create a game object
    const sizeOfGameSerialized = getObjectSizeInBytes(JSON.stringify(game));
    game.clearInventories();
    const sizeOfGameItemsCleared = getObjectSizeInBytes(JSON.stringify(game));

    console.log("Size of serialized game with items:", sizeOfGameSerialized);
    console.log(
      "Size of serialized game without items:",
      sizeOfGameItemsCleared,
    );
    expect(sizeOfGameItemsCleared).toBeLessThan(sizeOfGameSerialized);
  });
  it("should increase serialization speed", (done) => {
    const shops = createShops(PlayerClassOptions.mage);
    const game = new Game({
      shops: shops,
      vibrationEnabled: "full",
    }); // create a game object
    const suite = new Benchmark.Suite();
    suite
      .add("uncleared inventory", () => {
        const serialized = stringify(game);
        parse(serialized);
      })
      .add("cleared inventory", () => {
        game.clearInventories();
        const serialized = stringify(game);
        parse(serialized);
      })
      .on("cycle", function (event: Benchmark.Event) {
        console.log(String(event.target));
      })
      .on("complete", function (this: Benchmark.Suite) {
        console.log("Fastest is " + this.filter("fastest").map("name"));

        expect(this.filter("fastest").map("name")[0]).toBeDefined();

        done();
      })
      .run({ async: true });
  }, 60000);
});

function getObjectSizeInBytes(obj: any): number {
  const seen = new WeakSet();

  function sizeOf(value: any): number {
    if (value === null || value === undefined) return 0;

    const type = typeof value;
    if (type === "number") return 8;
    if (type === "string") return value.length * 2;
    if (type === "boolean") return 4;

    if (type === "object") {
      if (seen.has(value)) return 0;
      seen.add(value);

      let bytes = 0;

      if (Array.isArray(value)) {
        bytes += 8; // Array overhead
        for (let i = 0; i < value.length; i++) {
          bytes += sizeOf(value[i]);
        }
      } else {
        bytes += 8; // Object overhead
        for (let key in value) {
          if (Object.hasOwnProperty.call(value, key)) {
            bytes += key.length * 2; // Key size
            bytes += sizeOf(value[key]); // Value size
          }
        }
      }

      return bytes;
    }

    return 0;
  }

  return sizeOf(obj);
}
