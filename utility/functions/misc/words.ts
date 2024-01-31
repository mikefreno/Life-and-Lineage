import names from "../../../assets/json/names.json";

export function getRandomName(sex: string) {
  const filteredNames = names.filter((name) => {
    return name.sex == sex;
  });
  const randomIndex = Math.floor(Math.random() * filteredNames.length);
  return {
    firstName: filteredNames[randomIndex].firstName,
    lastName: filteredNames[randomIndex].lastName,
  };
}

export function toTitleCase(title: string | undefined) {
  if (!title) {
    return "";
  }
  return title
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
