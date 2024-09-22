import * as NavigationBar from "expo-navigation-bar";

export const updateNavBar = async ({
  isKeyboardVisible,
}: {
  isKeyboardVisible: boolean;
}) => {
  const isVisible = (await NavigationBar.getVisibilityAsync()) === "visible";

  if (isKeyboardVisible && !isVisible) {
    await NavigationBar.setVisibilityAsync("visible");
    await NavigationBar.setPositionAsync("relative");
    await NavigationBar.setBehaviorAsync("inset-touch");
  } else if (!isKeyboardVisible && isVisible) {
    await NavigationBar.setVisibilityAsync("hidden");
    await NavigationBar.setPositionAsync("absolute");
    await NavigationBar.setBehaviorAsync("overlay-swipe");
  }
};
