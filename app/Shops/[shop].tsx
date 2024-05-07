import { Stack, useLocalSearchParams } from "expo-router";
import { View as ThemedView, Text } from "../../components/Themed";
import { CharacterImage } from "../../components/CharacterImage";
import { Pressable, Image, ScrollView, View } from "react-native";
import { useContext, useEffect, useRef, useState } from "react";
import { Item } from "../../classes/item";
import Coins from "../../assets/icons/CoinsIcon";
import { useIsFocused } from "@react-navigation/native";
import { GameContext, PlayerCharacterContext } from "../_layout";
import { useVibration } from "../../utility/customHooks";
import { observer } from "mobx-react-lite";
import TutorialModal from "../../components/TutorialModal";
import { useHeaderHeight } from "@react-navigation/elements";
import shopObjects from "../../assets/json/shops.json";
import { toTitleCase } from "../../utility/functions/misc/words";
import { calculateAge } from "../../utility/functions/misc/age";
import InventoryRender from "../../components/InventoryRender";
import { StatsDisplay } from "../../components/StatsDisplay";

const ONE_HOUR = 60 * 60 * 1000;

const ShopInteriorScreen = observer(() => {
  const { shop } = useLocalSearchParams();
  const gameData = useContext(GameContext);
  const playerCharacterData = useContext(PlayerCharacterContext);
  if (!gameData || !playerCharacterData)
    throw new Error("missing game context");
  const { gameState } = gameData;
  const { playerState } = playerCharacterData;
  const vibration = useVibration();
  const colors = shopObjects.find((shopObj) => shopObj.type == shop)?.colors;
  const thisShop = gameState?.shops.find((aShop) => aShop.archetype == shop);
  const [selectedItem, setSelectedItem] = useState<{
    item: Item;
    buying: boolean;
  } | null>(null);
  let selectedItemRef = useRef<Item>();
  const [statsLeftPos, setStatsLeftPos] = useState<number>();
  const [statsTopPos, setStatsTopPos] = useState<number>();
  const [refreshCheck, setRefreshCheck] = useState<boolean>(false);
  const [selectedSpell, setSelectedSpell] = useState<{
    name: string;
    element: string;
    proficiencyNeeded: number;
    manaCost: number;
    effects: {
      damage: number | null;
      buffs: string[] | null;
      debuffs:
        | {
            name: string;
            chance: number;
          }[]
        | null;
      summon?: string[] | undefined;
      selfDamage?: number | undefined;
    };
  } | null>(null);
  const [inventoryFullNotifier, setInventoryFullNotifier] =
    useState<boolean>(false);

  const inventoryTarget = useRef<View>(null);
  const [showingStats, setShowingStats] = useState<Item | null>(null);

  const header = useHeaderHeight();
  const isFocused = useIsFocused();

  const [showShopInteriorTutorial, setShowShopInteriorTutorial] =
    useState<boolean>(
      (gameState && !gameState.getTutorialState("shopInterior")) ?? false,
    );

  useEffect(() => {
    if (!showShopInteriorTutorial && gameState) {
      gameState.updateTutorialState("shopInterior", true);
    }
  }, [showShopInteriorTutorial]);

  useEffect(() => {
    if (inventoryFullNotifier) {
      setTimeout(() => setInventoryFullNotifier(false), 2000);
    }
  }, [inventoryFullNotifier]);

  useEffect(() => {
    if (
      playerState &&
      thisShop &&
      new Date(thisShop.lastStockRefresh) < new Date(Date.now() - ONE_HOUR)
    ) {
      thisShop.refreshInventory(playerState.playerClass);
    }
    setRefreshCheck(true);
  }, [playerState]);

  function sellAllJunk() {
    if (thisShop) {
      const itemsToSell: Item[] = [];
      playerState?.inventory.forEach((item) => {
        if (item.itemClass == "junk") {
          itemsToSell.push(item);
        }
      });

      itemsToSell.forEach((item) => {
        const price = item.getSellPrice(thisShop.shopKeeper.affection);
        thisShop.buyItem(item, price);
        playerState?.sellItem(item, price);
      });
      if (
        selectedItem?.item.itemClass == "junk" ||
        selectedItemRef.current?.itemClass == "junk"
      ) {
        setSelectedItem(null);
        selectedItemRef.current = undefined;
      }
    }
  }

  function displaySetter(item: Item, buying: boolean) {
    const selected = { item: item, buying: buying };
    setSelectedItem(selected);
    selectedItemRef.current = item;
    if (item.itemClass == "book" && playerState) {
      const spell = item.getAttachedSpell(playerState.playerClass);
      setSelectedSpell(spell);
    } else {
      setSelectedSpell(null);
    }
  }

  if (refreshCheck && thisShop && gameState && playerState) {
    return (
      <ThemedView className="h-full">
        <Stack.Screen
          options={{
            title: toTitleCase(shop as string),
          }}
        />
        <TutorialModal
          isVisibleCondition={
            (showShopInteriorTutorial &&
              gameState?.tutorialsEnabled &&
              isFocused) ??
            false
          }
          backFunction={() => setShowShopInteriorTutorial(false)}
          onCloseFunction={() => setShowShopInteriorTutorial(false)}
          pageOne={{
            title: "Shopkeepers remember you.",
            body: "The more you trade with a given shopkeeper the better deals they will have for you.",
          }}
          pageTwo={{
            title: "Shopkeepers are people too.",
            body: "They each have different personalities. They will also age eventually die.",
          }}
          pageThree={{
            title: "Good Luck.",
            body: "And remember fleeing (top left) can save you.",
          }}
        />
        <View
          style={{
            marginTop: header / 2,
            height: header / 2,
            backgroundColor: colors?.background,
            opacity: 0.5,
          }}
        />
        <ThemedView className="flex flex-row justify-between">
          <View className="w-1/3 items-center">
            <CharacterImage
              characterAge={calculateAge(
                new Date(thisShop.shopKeeper.birthdate),
                new Date(gameState.date),
              )}
              characterSex={thisShop.shopKeeper.sex == "male" ? "M" : "F"}
            />
            <Text className="text-center">
              {thisShop.shopKeeper.getFullName()}'s Inventory
            </Text>
            <View className="flex flex-row">
              <Text>{thisShop.currentGold}</Text>
              <Coins width={16} height={16} style={{ marginLeft: 6 }} />
            </View>
          </View>
          <View className="mx-2 -mt-1 h-96 w-2/3 rounded border border-zinc-300 dark:border-zinc-700">
            <ScrollView className="my-auto">
              <View className="flex flex-row flex-wrap justify-around">
                {thisShop.inventory.map((item) => (
                  <Pressable
                    key={item.id}
                    className="m-2 w-1/4 items-center active:scale-90 active:opacity-50"
                    onPress={() => displaySetter(item, true)}
                  >
                    <View className="rounded-lg bg-zinc-300 p-2">
                      <Image source={item.getItemIcon()} />
                    </View>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>
          {showingStats && statsLeftPos && statsTopPos && (
            <View className="absolute z-10">
              <StatsDisplay
                statsLeftPos={statsLeftPos}
                statsTopPos={statsTopPos}
                showingStats={showingStats}
                setShowingStats={setShowingStats}
                topOffset={-240}
              />
            </View>
          )}
        </ThemedView>
        <ThemedView className="flex flex-row justify-center py-4 dark:border-zinc-700">
          <Text className=" text-center">
            {playerState.getFullName()}'s Inventory
          </Text>
          <View className="flex flex-row">
            <Text> ( {playerState!.getReadableGold()}</Text>
            <Coins width={16} height={16} style={{ marginLeft: 6 }} />
            <Text> )</Text>
            {playerState.inventory.some((item) => item.itemClass == "junk") ? (
              <Pressable
                onPress={sellAllJunk}
                className="ml-2 rounded-xl border border-zinc-900 px-6 text-lg active:scale-95 active:opacity-50 dark:border-zinc-50"
              >
                <Text>Sell Junk</Text>
              </Pressable>
            ) : null}
          </View>
        </ThemedView>
        <InventoryRender
          location={"shop"}
          selfRef={inventoryTarget}
          inventory={playerState.getInventory()}
        />
      </ThemedView>
    );
  }
});
export default ShopInteriorScreen;
