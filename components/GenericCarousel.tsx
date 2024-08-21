import React from "react";
import { Image } from "expo-image";
import { Dimensions } from "react-native";
import Carousel from "react-native-reanimated-carousel";

interface GenericCarousel {
  images: any[];
}
export function GenericCarousel({ images }: GenericCarousel) {
  const width = Dimensions.get("window").width;

  return (
    <Carousel
      width={width}
      height={width}
      data={images}
      mode="parallax"
      renderItem={({ item }) => (
        <Image
          style={{
            flex: 1,
            width: "100%",
          }}
          source={item}
          contentFit="contain"
          transition={1000}
        />
      )}
    />
  );
}
