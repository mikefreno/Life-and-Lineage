/**
 * Learn more about Light and Dark modes:
 * https://docs.expo.io/guides/color-schemes/
 */

import {
  Text as DefaultText,
  View as DefaultView,
  SafeAreaView as DefaultSafeAreaView,
  ScrollView as DefaultScrollView,
} from "react-native";

import Colors from "../constants/Colors";
import { useColorScheme } from "nativewind";

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export type TextProps = ThemeProps & DefaultText["props"];
export type ViewProps = ThemeProps &
  DefaultView["props"] &
  React.RefAttributes<DefaultView>;
export type SafeAreaViewProps = ThemeProps & DefaultSafeAreaView["props"];
export type ScrollViewProps = ThemeProps & DefaultScrollView["props"];

export const DEFAULT_FADEOUT_TIME = 2500; //ms

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark,
) {
  const { colorScheme } = useColorScheme() ?? "light";
  const colorFromProps = props[colorScheme as "light" | "dark"];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[colorScheme][colorName];
  }
}

export function Text(props: TextProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");

  return (
    <DefaultText
      allowFontScaling={false}
      style={[{ color }, { fontFamily: "PixelifySans" }, style]}
      {...otherProps}
    />
  );
}

export function CursiveText(props: TextProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const color = useThemeColor({ light: "black", dark: "white" }, "text");

  return (
    <DefaultText
      allowFontScaling={false}
      style={[{ color }, { fontFamily: "Cursive" }, style]}
      {...otherProps}
    />
  );
}
export function CursiveTextBold(props: TextProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const color = useThemeColor({ light: "black", dark: "white" }, "text");

  return (
    <DefaultText
      allowFontScaling={false}
      style={[{ color }, { fontFamily: "CursiveBold" }, style]}
      {...otherProps}
    />
  );
}
export function HandwrittenText(props: TextProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");

  return (
    <DefaultText
      allowFontScaling={false}
      style={[{ color }, { fontFamily: "Handwritten" }, style]}
      {...otherProps}
    />
  );
}

export function ThemedView(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "accent",
  );

  return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />;
}

export function ThemedSafeAreaView(props: SafeAreaViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "accent",
  );

  return (
    <DefaultSafeAreaView style={[{ backgroundColor }, style]} {...otherProps} />
  );
}

export function ThemedScrollView(props: ScrollViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "accent",
  );

  return (
    <DefaultScrollView style={[{ backgroundColor }, style]} {...otherProps} />
  );
}
