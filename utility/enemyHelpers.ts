type ImageInfo = {
  source: any;
  width: number;
  height: number;
  heightOffset?: number;
};

export const EnemyImageMap: Record<string, ImageInfo> = {
  "air mage": {
    source: require("../assets/images/monsters/air_mage.png"),
    width: 160,
    height: 160,
  },
  bandit: {
    source: require("../assets/images/monsters/bandit.png"),
    width: 160,
    height: 160,
  },
  "bandit boss": {
    source: require("../assets/images/monsters/bandit_boss.png"),
    width: 180,
    height: 180,
  },
  bat: {
    source: require("../assets/images/monsters/bat.png"),
    width: 120,
    height: 120,
    heightOffset: -60,
  },
  "brood mother": {
    source: require("../assets/images/monsters/brood_mother.png"),
    width: 180,
    height: 180,
  },
  drunkard: {
    source: require("../assets/images/monsters/drunkard.png"),
    width: 160,
    height: 160,
  },
  "earth mage": {
    source: require("../assets/images/monsters/earth_mage.png"),
    width: 160,
    height: 160,
  },
  "fire mage": {
    source: require("../assets/images/monsters/fire_mage.png"),
    width: 140,
    height: 200,
  },
  "giant rat": {
    source: require("../assets/images/monsters/giant_rat.png"),
    width: 180,
    height: 180,
  },
  goblin: {
    source: require("../assets/images/monsters/goblin.png"),
    width: 140,
    height: 140,
  },
  "goblin shaman": {
    source: require("../assets/images/monsters/goblin_shaman.png"),
    width: 140,
    height: 140,
  },
  ghost: {
    source: require("../assets/images/monsters/ghost.png"),
    width: 140,
    height: 140,
  },
  griffon: {
    source: require("../assets/images/monsters/griffon.png"),
    width: 180,
    height: 180,
  },
  hobgoblin: {
    source: require("../assets/images/monsters/hobgoblin.png"),
    width: 150,
    height: 150,
  },
  necromancer: {
    source: require("../assets/images/monsters/necromancer.png"),
    width: 150,
    height: 150,
  },
  skeleton: {
    source: require("../assets/images/monsters/skeleton.png"),
    width: 160,
    height: 160,
  },
  "skeleton archer": {
    source: require("../assets/images/monsters/skeleton_archer.png"),
    width: 160,
    height: 160,
  },
  "giant spider": {
    source: require("../assets/images/monsters/giant_spider.png"),
    width: 160,
    height: 160,
  },
  "training dummy": {
    source: require("../assets/images/monsters/training_dummy.png"),
    width: 150,
    height: 150,
  },
  "water mage": {
    source: require("../assets/images/monsters/water_mage.png"),
    width: 160,
    height: 160,
  },
  worg: {
    source: require("../assets/images/monsters/worg.png"),
    width: 160,
    height: 160,
  },
  witch: {
    source: require("../assets/images/monsters/witch.png"),
    width: 150,
    height: 150,
  },
  "generic npc male": {
    source: require("../assets/images/monsters/generic_npc_male.png"),
    width: 60,
    height: 160,
  },
  "generic npc femaleA": {
    source: require("../assets/images/monsters/generic_npc_femaleA.png"),
    width: 80,
    height: 160,
  },
  "generic npc femaleB": {
    source: require("../assets/images/monsters/generic_npc_femaleB.png"),
    width: 80,
    height: 160,
  },
  zombie: {
    source: require("../assets/images/monsters/zombie.png"),
    width: 170,
    height: 170,
  },
};
