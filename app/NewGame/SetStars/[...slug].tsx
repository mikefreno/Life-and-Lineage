import { Pressable, View } from "react-native";
import { Text, ScrollView } from "../../../components/Themed";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import { Stack, useLocalSearchParams } from "expo-router";
import { toTitleCase } from "../../../utility/functions";
import { router } from "expo-router";
import { elementalColorMap } from "../../../utility/elementColors";

export default function SetStars() {
  const { slug } = useLocalSearchParams();
  const [star, setStar] = useState<string>("");
  const [element, setElement] = useState<string>("");
  const witchOrWizard = slug[0];
  const firstName = toTitleCase(slug[1]);
  const lastName = toTitleCase(slug[2]);

  return (
    <>
      <Stack.Screen
        options={{
          title: "Stars",
        }}
      />
      <ScrollView>
        <View className="px-6 pb-12">
          <Text className="py-8 text-center text-2xl text-zinc-900 dark:text-zinc-50">
            {`Under What Stars Was ${firstName} ${lastName} Born?`}
          </Text>
          <Text className="py-1 text-center">
            Fire Signs are more adept at Fire Based Magics
          </Text>
          <Text className="py-1 text-center">
            Earth Signs are more adept at Earth Based Magics
          </Text>
          <Text className="py-1 text-center">Etc...</Text>
          {star !== "" ? (
            <View className="mx-auto mt-8">
              <Pressable
                onPress={() =>
                  router.push(
                    `/NewGame/Review/${witchOrWizard}/${firstName}/${lastName}/${star}/${element}`,
                  )
                }
              >
                {({ pressed }) => (
                  <View
                    className={`rounded-lg bg-blue-400 px-8 py-4 dark:bg-blue-800 ${
                      pressed ? "scale-95 opacity-30" : null
                    }`}
                  >
                    <Text style={{ color: "white" }} className="text-2xl">
                      Review
                    </Text>
                  </View>
                )}
              </Pressable>
            </View>
          ) : null}
          <View className="mt-4 flex max-w-full justify-center">
            <View
              className="flex rounded"
              style={{ backgroundColor: elementalColorMap.fire.dark }}
            >
              <Text className="py-2 text-center">Fire Signs</Text>
              <View className="mx-auto flex flex-row pb-4">
                <Pressable
                  className="mx-1"
                  onPress={() => {
                    setStar("aries");
                    setElement("Fire");
                  }}
                >
                  {({ pressed }) => (
                    <View
                      className={`${
                        pressed || star == "aries"
                          ? "scale-110 bg-red-200"
                          : null
                      } rounded-xl px-2`}
                    >
                      <MaterialCommunityIcons
                        name="zodiac-aries"
                        size={64}
                        color="#C1272D"
                      />

                      <Text className="mx-auto">Aries</Text>
                    </View>
                  )}
                </Pressable>
                <Pressable
                  className="mx-1"
                  onPress={() => {
                    setStar("leo");
                    setElement("Fire");
                  }}
                >
                  {({ pressed }) => (
                    <View
                      className={`${
                        pressed || star == "leo" ? "scale-110 bg-red-200" : null
                      } rounded-xl px-2`}
                    >
                      <MaterialCommunityIcons
                        name="zodiac-leo"
                        size={64}
                        color="#FAA21D"
                      />
                      <Text className="mx-auto">Leo</Text>
                    </View>
                  )}
                </Pressable>
                <Pressable
                  className="mx-1"
                  onPress={() => {
                    setStar("sagittarius");
                    setElement("Fire");
                  }}
                >
                  {({ pressed }) => (
                    <View
                      className={`${
                        pressed || star == "sagittarius"
                          ? "scale-110 bg-red-200"
                          : null
                      } rounded-xl px-2`}
                    >
                      <MaterialCommunityIcons
                        name="zodiac-sagittarius"
                        size={64}
                        color="#EFAA43"
                      />
                      <Text className="mx-auto">Sagittarius</Text>
                    </View>
                  )}
                </Pressable>
              </View>
            </View>
            <View
              className="mt-2 flex rounded"
              style={{ backgroundColor: "#937D62" }}
            >
              <Text className="py-2 text-center">Earth Signs</Text>
              <View className="mx-auto flex flex-row pb-4">
                <Pressable
                  className="mx-1"
                  onPress={() => {
                    setStar("taurus");
                    setElement("Earth");
                  }}
                >
                  {({ pressed }) => (
                    <View
                      className={`${
                        pressed || star == "taurus"
                          ? "scale-110 bg-[#B1A89B]"
                          : null
                      } rounded-xl px-2`}
                    >
                      <MaterialCommunityIcons
                        name="zodiac-taurus"
                        size={64}
                        color="#006E51"
                      />

                      <Text className="mx-auto">Taurus</Text>
                    </View>
                  )}
                </Pressable>
                <Pressable
                  className="mx-1"
                  onPress={() => {
                    setStar("virgo");
                    setElement("Earth");
                  }}
                >
                  {({ pressed }) => (
                    <View
                      className={`${
                        pressed || star == "virgo"
                          ? "scale-110 bg-[#B1A89B]"
                          : null
                      } rounded-xl px-2`}
                    >
                      <MaterialCommunityIcons
                        name="zodiac-virgo"
                        size={64}
                        color="#447C69"
                      />
                      <Text className="mx-auto">Virgo</Text>
                    </View>
                  )}
                </Pressable>
                <Pressable
                  className="mx-1"
                  onPress={() => {
                    setStar("capricorn");
                    setElement("Earth");
                  }}
                >
                  {({ pressed }) => (
                    <View
                      className={`${
                        pressed || star == "capricorn"
                          ? "scale-110 bg-[#B1A89B]"
                          : null
                      } rounded-xl px-2`}
                    >
                      <MaterialCommunityIcons
                        name="zodiac-capricorn"
                        size={64}
                        color="#154577"
                      />
                      <Text className="mx-auto">Capricorn</Text>
                    </View>
                  )}
                </Pressable>
              </View>
            </View>
            <View
              className="mt-2 flex rounded"
              style={{ backgroundColor: "#e2e8f0" }}
            >
              <Text style={{ color: "black" }} className="py-2 text-center">
                Air Signs
              </Text>
              <View className="mx-auto flex flex-row pb-4">
                <Pressable
                  className="mx-1"
                  onPress={() => {
                    setStar("gemini");
                    setElement("Air");
                  }}
                >
                  {({ pressed }) => (
                    <View
                      className={`${
                        pressed || star == "gemini"
                          ? "scale-110 bg-slate-50"
                          : null
                      } rounded-xl px-2`}
                    >
                      <MaterialCommunityIcons
                        name="zodiac-gemini"
                        size={64}
                        color="#1D6996"
                      />
                      <Text style={{ color: "black" }} className="mx-auto">
                        Gemini
                      </Text>
                    </View>
                  )}
                </Pressable>
                <Pressable
                  className="mx-1"
                  onPress={() => {
                    setStar("libra");
                    setElement("Air");
                  }}
                >
                  {({ pressed }) => (
                    <View
                      className={`${
                        pressed || star == "libra"
                          ? "scale-110 bg-slate-50"
                          : null
                      } rounded-xl px-2`}
                    >
                      <MaterialCommunityIcons
                        name="zodiac-libra"
                        size={64}
                        color="#B67162"
                      />
                      <Text style={{ color: "black" }} className="mx-auto">
                        Libra
                      </Text>
                    </View>
                  )}
                </Pressable>
                <Pressable
                  className="mx-1"
                  onPress={() => {
                    setStar("aquarius");
                    setElement("Air");
                  }}
                >
                  {({ pressed }) => (
                    <View
                      className={`${
                        pressed || star == "aquarius"
                          ? "scale-110 bg-slate-50"
                          : null
                      } rounded-xl px-2`}
                    >
                      <MaterialCommunityIcons
                        name="zodiac-aquarius"
                        size={64}
                        color="#43919A"
                      />
                      <Text style={{ color: "black" }} className="mx-auto">
                        Aquarius
                      </Text>
                    </View>
                  )}
                </Pressable>
              </View>
            </View>
            <View
              className="mt-2 flex rounded"
              style={{ backgroundColor: "#60a5fa" }}
            >
              <Text className="py-2 text-center">Water Signs</Text>
              <View className="mx-auto flex flex-row pb-4">
                <Pressable
                  className="mx-1"
                  onPress={() => {
                    setStar("cancer");
                    setElement("Water");
                  }}
                >
                  {({ pressed }) => (
                    <View
                      className={`${
                        pressed || star == "cancer"
                          ? "scale-110 bg-blue-300"
                          : null
                      } rounded-xl px-2`}
                    >
                      <MaterialCommunityIcons
                        name="zodiac-cancer"
                        size={64}
                        color="#E7D2CC"
                      />
                      <Text className="mx-auto">Cancer</Text>
                    </View>
                  )}
                </Pressable>
                <Pressable
                  className="mx-1"
                  onPress={() => {
                    setStar("scorpio");
                    setElement("Water");
                  }}
                >
                  {({ pressed }) => (
                    <View
                      className={`${
                        pressed || star == "scorpio"
                          ? "scale-110 bg-blue-300"
                          : null
                      } rounded-xl px-2`}
                    >
                      <MaterialCommunityIcons
                        name="zodiac-scorpio"
                        size={64}
                        color="#5E2129"
                      />
                      <Text className="mx-auto">Scorpio</Text>
                    </View>
                  )}
                </Pressable>
                <Pressable
                  className="mx-1"
                  onPress={() => {
                    setStar("pisces");
                    setElement("Water");
                  }}
                >
                  {({ pressed }) => (
                    <View
                      className={`${
                        pressed || star == "pisces"
                          ? "scale-110 bg-blue-300"
                          : null
                      } rounded-xl px-2`}
                    >
                      <MaterialCommunityIcons
                        name="zodiac-pisces"
                        size={64}
                        color="#EF4671"
                      />
                      <Text className="mx-auto">Pisces</Text>
                    </View>
                  )}
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </>
  );
}
