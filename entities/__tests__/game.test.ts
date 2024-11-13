import { Game } from "../game";
import { createShops } from "../shop";
import { PlayerClassOptions } from "../../utility/types";
import Benchmark from "benchmark";
import { parse, stringify } from "flatted";

describe("Game object exploration", () => {
  it("should reduce game size", () => {
    const shops = createShops(PlayerClassOptions.mage);
    const game = new Game({
      shops: shops,
      vibrationEnabled: "full",
    }); // create a game object
    const sizeOfGameSerialized = Buffer.byteLength(
      JSON.stringify(game),
      "utf8",
    );
    const sizeOfGameItemsCleared = Buffer.byteLength(
      JSON.stringify(Game.forSaving(game)),
      "utf8",
    );

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
        Game.fromJSON(parse(serialized));
      })
      .add("cleared inventory", () => {
        const serialized = stringify(Game.forSaving(game));
        Game.fromJSON(parse(serialized));
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
  }, 30000);
});
