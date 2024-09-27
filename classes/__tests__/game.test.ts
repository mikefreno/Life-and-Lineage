import { Game } from "../game";
import { createShops } from "../shop";
import { PlayerClassOptions } from "../../utility/types";

// my test code
describe("Game object exploration", () => {
  it("expects shop items to be largest", () => {
    const shops = createShops(PlayerClassOptions.mage);
    const game = new Game({
      shops: shops,
      vibrationEnabled: "full",
    }); // create a game object
    const sizeOfGame = getObjectSizeInBytes(game);
    const sizeOfGameShops = getObjectSizeInBytes(game.shops);
    console.log("full object size: ", sizeOfGame);
    console.log("size of shops: ", sizeOfGameShops);
    let totalCharacterSize = 0;
    let totalItemSize = 0;
    game.shops.forEach((shop) => {
      totalCharacterSize += getObjectSizeInBytes(shop.shopKeeper);
      totalItemSize += getObjectSizeInBytes(shop.getInventory());
    });

    console.log("size of characters: ", totalCharacterSize);
    console.log("size of items: ", totalItemSize);
    console.log(
      `items constitute ${((totalItemSize / sizeOfGame) * 100).toFixed(
        2,
      )}% of the game's total size`,
    );
    expect(sizeOfGameShops).toBeGreaterThan(sizeOfGame - sizeOfGameShops);
    expect(totalItemSize).toBeGreaterThan(totalCharacterSize);
  });
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

// model a
//describe('Game object size', () => {
//it('should log the size of the Game object and its largest properties', () => {
//const game = new Game({});
//game.shops = createShops(PlayerClassOptions.mage);

//const gameJson = JSON.stringify(game);
//console.log('Game object size:', gameJson.length);

//const properties = [
//{ name: 'date', value: game.date },
//{ name: 'startDate', value: game.startDate },
//{ name: 'dungeonInstances', value: game.dungeonInstances },
//{ name: 'completedInstances', value: game.completedInstances },
//{ name: 'atDeathScreen', value: game.atDeathScreen },
//{ name: 'shops', value: game.shops },
//{ name: 'colorScheme', value: game.colorScheme },
//{ name: 'vibrationEnabled', value: game.vibrationEnabled },
//{ name: 'healthWarning', value: game.healthWarning },
//{ name: 'tutorialsShown', value: game.tutorialsShown },
//{ name: 'tutorialsEnabled', value: game.tutorialsEnabled },
//];

//const largestProperty = properties.reduce((prev, curr) => {
//const prevSize = JSON.stringify(prev.value).length;
//const currSize = JSON.stringify(curr.value).length;
//return prevSize > currSize ? prev : curr;
//});

//console.log('Largest property:', largestProperty.name, largestProperty.value);

//if (largestProperty.name === 'shops') {
//const shopProperties = game.shops.map((shop) => {
//const inventorySize = JSON.stringify(shop.inventory).length;
//return { name: 'inventory', value: shop.inventory, size: inventorySize };
//});

//const largestShopProperty = shopProperties.reduce((prev, curr) => (prev.size > curr.size ? prev : curr));

//console.log('Largest shop property:', largestShopProperty.name, largestShopProperty.value);
//}

//expect(largestProperty.name).toBe('shops'); // Update the expected largest property as needed
//});
//});

// model b
//describe("Game Serialization Performance", () => {
//it("should measure the size of the Game object and its largest properties", () => {
//const shops = createShops(PlayerClassOptions.mage);
//const game = new Game({
//date: new Date().toISOString(),
//startDate: new Date().toISOString(),
//dungeonInstances: [
//{
//name: "training grounds",
//levels: [
//{
//level: 0,
//bosses: [],
//tiles: 0,
//bossDefeated: true,
//},
//],
//},
//{
//name: "nearby cave",
//levels: [
//{
//level: 1,
//bosses: ["zombie"],
//tiles: 10,
//bossDefeated: false,
//},
//],
//},
//],
//completedInstances: [],
//atDeathScreen: false,
//shops: shops,
//colorScheme: "system",
//vibrationEnabled: "full",
//healthWarning: 0.2,
//tutorialsShown: {
//[TutorialOption.class]: true,
//[TutorialOption.aging]: true,
//[TutorialOption.blessing]: true,
//[TutorialOption.intro]: false,
//[TutorialOption.spell]: false,
//[TutorialOption.labor]: false,
//[TutorialOption.dungeon]: false,
//[TutorialOption.dungeonInterior]: false,
//[TutorialOption.shops]: false,
//[TutorialOption.shopInterior]: false,
//[TutorialOption.medical]: false,
//[TutorialOption.investing]: false,
//[TutorialOption.training]: false,
//[TutorialOption.firstBossKill]: false,
//},
//tutorialsEnabled: true,
//});

//// Serialize the game object to JSON
//const jsonString = JSON.stringify(game);
//console.log("Serialized JSON size:", jsonString.length);

//// Parse the JSON string to get the object
//const jsonObject = JSON.parse(jsonString);

//// Function to find the largest property in an object
//function findLargestProperty(obj: any): { key: string; value: any } {
//let largest: { key: string; value: any } = { key: "", value: 0 };
//for (const key in obj) {
//if (obj.hasOwnProperty(key)) {
//const value = JSON.stringify(obj[key]).length;
//if (value > largest.value) {
//largest = { key, value };
//}
//}
//}
//return largest;
//}

//// Find the largest property in the top-level object
//const largestTopLevelProperty = findLargestProperty(jsonObject);
//console.log("Largest top-level property:", largestTopLevelProperty);

//// If the largest property is an object, find its largest nested property
//if (
//largestTopLevelProperty.value > 0 &&
//typeof jsonObject[largestTopLevelProperty.key] === "object"
//) {
//const nestedLargestProperty = findLargestProperty(
//jsonObject[largestTopLevelProperty.key],
//);
//console.log("Largest nested property:", nestedLargestProperty);
//}

//// Assert the largest property if needed
//expect(largestTopLevelProperty.key).toBe("shops"); // Adjust the assertion as needed
//});
//});
