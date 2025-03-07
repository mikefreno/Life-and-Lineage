import { Autumn, Spring, Summer, Winter } from "@/assets/icons/SVGIcons";
import { Season } from "@/stores/TimeStore";

export default function SeasonDisplay({ season = Season.WINTER, size = 40 }) {
  switch (season) {
    case Season.WINTER:
      return <Winter height={size} width={size} />;
    case Season.SPRING:
      return <Spring height={size} width={size} />;
    case Season.SUMMER:
      return <Summer height={size} width={size} />;
    case Season.AUTUMN:
      return <Autumn height={size} width={size} />;
  }
}
