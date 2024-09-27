import Benchmark from "benchmark";
import { stringify, parse } from "flatted";
import CircularJSON from "circular-json";
import { Character, PlayerCharacter } from "../../../classes/character";
import { Game } from "../../../classes/game";
import { Element, PlayerClassOptions } from "../../types";
import { generateBirthday, getRandomName } from "../misc";
import { getRandomJobTitle } from "../characterAid";
import { createShops } from "../../../classes/shop";

describe("Serialization Benchmark", () => {
  it("compares flatted's stringify, custom serialization, and JSON.stringify", (done) => {
    const player = new PlayerCharacter({
      firstName: "John",
      lastName: "Doe",
      sex: "male",
      playerClass: PlayerClassOptions.mage,
      blessing: Element.fire,
      parents: [createParent("female"), createParent("female")],
      birthdate: new Date().toString(),
      ...getStartingBaseStats({ playerClass: PlayerClassOptions.mage }),
    }); // create a player object

    const shops = createShops(PlayerClassOptions.mage);
    const game = new Game({
      shops: shops,
      vibrationEnabled: "full",
    }); // create a game object

    const suite = new Benchmark.Suite();

    suite
      .add("flatted stringify/parse player", () => {
        const serialized = stringify(player);
        parse(serialized);
      })
      .add("flatted stringify/parse game", () => {
        const serialized = stringify(game);
        parse(serialized);
      })
      .add("CircularJSON stringify/parse player", () => {
        const serialized = CircularJSON.stringify(player);
        CircularJSON.parse(serialized);
      })
      .add("CircularJSON stringify/parse game", () => {
        const serialized = CircularJSON.stringify(game);
        CircularJSON.parse(serialized);
      })
      .add("JSON.stringify/parse player", () => {
        const serialized = JSON.stringify(player);
        JSON.parse(serialized);
      })
      .add("JSON.stringify/parse game", () => {
        const serialized = JSON.stringify(game);
        JSON.parse(serialized);
      })
      .add("Custom Serialization/parse player", () => {
        const seen = new WeakSet();
        const serialized = JSON.stringify(player, (key: string, value: any) => {
          if (typeof value === "object" && value !== null) {
            if (seen.has(value)) {
              return;
            }
            seen.add(value);
          }
          return value;
        });
        JSON.parse(serialized);
      })
      .add("Custom Serialization/parse game", () => {
        const seen = new WeakSet();
        const serialized = JSON.stringify(game, (key: string, value: any) => {
          if (typeof value === "object" && value !== null) {
            if (seen.has(value)) {
              return;
            }
            seen.add(value);
          }
          return value;
        });
        JSON.parse(serialized);
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

function createParent(sex: "female" | "male"): Character {
  const firstName = getRandomName(sex).firstName;
  const job = getRandomJobTitle();
  const parent = new Character({
    firstName: firstName,
    lastName: "Doe",
    sex: sex,
    job: job,
    affection: 85,
    birthdate: generateBirthday(32, 55),
  });
  return parent;
}
function getStartingBaseStats({
  playerClass,
}: {
  playerClass: PlayerClassOptions;
}) {
  switch (playerClass) {
    case PlayerClassOptions.necromancer:
      return {
        baseHealth: 80,
        baseMana: 120,
        baseStrength: 3,
        baseIntelligence: 6,
        baseDexterity: 4,
        baseManaRegen: 6,
        baseSanity: 40,
      };
    case PlayerClassOptions.paladin:
      return {
        baseHealth: 120,
        baseMana: 80,
        baseStrength: 6,
        baseIntelligence: 4,
        baseDexterity: 3,
        baseManaRegen: 5,
        baseSanity: 60,
      };
    case PlayerClassOptions.mage:
      return {
        baseHealth: 100,
        baseMana: 100,
        baseStrength: 5,
        baseIntelligence: 5,
        baseDexterity: 3,
        baseManaRegen: 5,
        baseSanity: 50,
      };
    case PlayerClassOptions.ranger:
      return {
        baseHealth: 90,
        baseMana: 90,
        baseStrength: 4,
        baseIntelligence: 3,
        baseDexterity: 7,
        baseManaRegen: 5,
        baseSanity: 50,
      };
  }
}
