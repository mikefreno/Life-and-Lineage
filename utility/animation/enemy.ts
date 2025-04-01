import enemiesJSON from "@/assets/json/enemy.json";
import { ColorValue } from "react-native";

// use after expanding set
export const enemyImageOptionsPrinter = () => {
  console.log(Object.keys(EnemyImageMap));
};

export type EnemyImageKeyOption =
  | "baby_dragon"
  | "bandit_heavy"
  | "bandit_light"
  | "bat"
  | "centaur"
  | "cerebus"
  | "cyclops"
  | "demon_boss"
  | "demon_samurai_p1"
  | "demon_samurai_p2"
  | "dragon"
  | "ghost"
  | "gladiator_archer"
  | "gladiator_female"
  | "gladiator_hammer"
  | "gladiator_longsword"
  | "gladiator_spear"
  | "gladiator_shortsword"
  | "goblin"
  | "goblin_2"
  | "goblin_mage"
  | "golem"
  | "ground_monk"
  | "gryphon"
  | "harpy"
  | "huge_knight"
  | "imp"
  | "kobold"
  | "lizardman"
  | "medusa"
  | "mimic"
  | "minotaur"
  | "necromancer"
  | "npc_man"
  | "npc_man_old"
  | "npc_woman"
  | "npc_woman_old"
  | "orc_masked"
  | "pyromancer"
  | "rat"
  | "reaper"
  | "reaper_summon"
  | "samurai_armor"
  | "samurai_dual"
  | "samurai_female"
  | "samurai_huge"
  | "samurai_old"
  | "samurai_rice"
  | "samurai_wolf"
  | "satyr"
  | "skeleton"
  | "skeleton_mage"
  | "spider_dark"
  | "spider_dark_brood"
  | "spider_dark_small"
  | "spider_default"
  | "spider_default_brood"
  | "spider_default_small"
  | "spider_demon"
  | "spider_demon_brood"
  | "spider_demon_small"
  | "spider_wood"
  | "spider_wood_brood"
  | "spider_wood_small"
  | "training_dummy"
  | "viking_assassin"
  | "viking_axe"
  | "viking_giant"
  | "viking_spearthrower"
  | "werewolf"
  | "witch"
  | "wizard_black"
  | "wizard_blackblue"
  | "wizard_blue"
  | "wizard_classic"
  | "wizard_darkpurple"
  | "wizard_earthen"
  | "wizard_gray"
  | "wizard_green"
  | "wizard_purple"
  | "wizard_redblack"
  | "wizard_yellow"
  | "wolf_black"
  | "zombie";

export const enemyOptions = enemiesJSON.map((json) => json.name);

export type AnimationBase = {
  anim: any;
  sizeOverride?: { height: number; width: number };
  disablePreMovement?: boolean;
  triggersScreenShake?: { when: "start" | "end"; duration: number };
};

export type AnimationWithProjectile = AnimationBase & {
  projectile?: {
    anim: any;
    height: number;
    width: number;
    scale?: number;
  };
  splash?: {
    anim: any;
    height: number;
    width: number;
    followsProjectile: boolean;
    scale?: number;
  };
};

export type AnimationWithGlow = AnimationBase & {
  glow: {
    color: ColorValue;
    position: "enemy" | "field" | "self";
    duration?: number;
  };
};

export type AnimationSet =
  | AnimationBase
  | AnimationWithProjectile
  | AnimationWithGlow;

export type AnimationOptions =
  | "attack_1"
  | "attack_2"
  | "attack_3"
  | "attack_4"
  | "attack_5"
  | "block"
  | "death"
  | "dodge"
  | "float"
  | "heal"
  | "healing"
  | "hurt"
  | "idle"
  | "jump"
  | "move"
  | "spawn"
  | "summon_death"
  | "summon_idle"
  | "summon_spawn"
  | "throw"
  | "transition";

export type EnemyImageMapType = {
  [key in EnemyImageKeyOption]: {
    sets: {
      [key in AnimationOptions]?: AnimationSet;
    };
    height: number;
    width: number;
    mirror?: boolean;
    topOffset?: number;
    leftOffset?: number;
    renderScale?: number;
  };
};

export const EnemyImageMap: EnemyImageMapType = {
  baby_dragon: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Baby_Dragon/ATTACK_1.webp"),
        projectile: {
          anim: require("@/assets/monsters/Baby_Dragon/PROJECTILE.webp"),
          width: 48,
          height: 32,
          scale: 3,
        },
      },
      death: {
        anim: require("@/assets/monsters/Baby_Dragon/DEATH.webp"),
      },
      hurt: {
        anim: require("@/assets/monsters/Baby_Dragon/HURT.webp"),
      },
      idle: {
        anim: require("@/assets/monsters/Baby_Dragon/IDLE.webp"),
      },
      move: {
        anim: require("@/assets/monsters/Baby_Dragon/MOVE.webp"),
      },
    },
    height: 125,
    width: 158,
  },
  bandit_heavy: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Bandit_Heavy/ATTACK.webp"),
      },
      hurt: {
        anim: require("@/assets/monsters/Bandit_Heavy/HURT.webp"),
      },
      death: {
        anim: require("@/assets/monsters/Bandit_Heavy/DEATH.webp"),
      },
      idle: {
        anim: require("@/assets/monsters/Bandit_Heavy/IDLE.webp"),
      },
      move: {
        anim: require("@/assets/monsters/Bandit_Heavy/MOVE.webp"),
      },
    },
    height: 48,
    width: 48,
    renderScale: 0.85,
  },
  bandit_light: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Bandit_Light/ATTACK.webp"),
      },
      hurt: {
        anim: require("@/assets/monsters/Bandit_Light/HURT.webp"),
      },
      death: {
        anim: require("@/assets/monsters/Bandit_Light/DEATH.webp"),
      },
      idle: {
        anim: require("@/assets/monsters/Bandit_Light/IDLE.webp"),
      },
      move: {
        anim: require("@/assets/monsters/Bandit_Light/MOVE.webp"),
      },
    },
    height: 48,
    width: 48,
    renderScale: 0.85,
  },
  bat: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Bat_Origin/ATTACK_1.webp"),
      },
      hurt: {
        anim: require("@/assets/monsters/Bat_Origin/HURT.webp"),
      },
      spawn: {
        anim: require("@/assets/monsters/Bat_Origin/SPAWN.webp"),
      },
      idle: {
        anim: require("@/assets/monsters/Bat_Origin/IDLE.webp"),
      },
      move: {
        anim: require("@/assets/monsters/Bat_Origin/MOVE.webp"),
      },
    },
    height: 64,
    width: 64,
    mirror: true,
    renderScale: 0.7,
  },
  centaur: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Centaur/ATTACK_1.webp"),
      },
      attack_2: {
        anim: require("@/assets/monsters/Centaur/MOVE.webp"),
      },
      death: {
        anim: require("@/assets/monsters/Centaur/DEATH.webp"),
      },
      hurt: {
        anim: require("@/assets/monsters/Centaur/HURT.webp"),
      },
      idle: {
        anim: require("@/assets/monsters/Centaur/IDLE.webp"),
      },
      move: {
        anim: require("@/assets/monsters/Centaur/MOVE.webp"),
      },
    },
    height: 100,
    width: 100,
  },
  cerebus: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Cerebus/ATTACK_1.webp"),
      },
      death: {
        anim: require("@/assets/monsters/Cerebus/DEATH.webp"),
      },
      hurt: {
        anim: require("@/assets/monsters/Cerebus/HURT.webp"),
      },
      idle: {
        anim: require("@/assets/monsters/Cerebus/IDLE.webp"),
      },
      move: {
        anim: require("@/assets/monsters/Cerebus/MOVE.webp"),
      },
    },
    height: 100,
    width: 125,
  },
  cyclops: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Cyclops/ATTACK_1.webp"),
      },
      attack_2: {
        anim: require("@/assets/monsters/Cyclops/ATTACK_2.webp"),
      },
      death: {
        anim: require("@/assets/monsters/Cyclops/DEATH.webp"),
      },
      hurt: {
        anim: require("@/assets/monsters/Cyclops/HURT.webp"),
      },
      idle: {
        anim: require("@/assets/monsters/Cyclops/IDLE.webp"),
      },
      move: {
        anim: require("@/assets/monsters/Cyclops/MOVE.webp"),
      },
    },
    height: 125,
    width: 158,
  },
  demon_boss: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Demon_Boss/ATTACK_1.webp"),
      },
      death: {
        anim: require("@/assets/monsters/Demon_Boss/DEATH.webp"),
      },
      hurt: {
        anim: require("@/assets/monsters/Demon_Boss/HURT.webp"),
      },
      idle: {
        anim: require("@/assets/monsters/Demon_Boss/IDLE_MOVE.webp"),
      },
      move: {
        anim: require("@/assets/monsters/Demon_Boss/IDLE_MOVE.webp"),
      },
    },
    height: 148,
    width: 162,
  },
  demon_samurai_p1: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Demon_Samurai/Phase1/ATTACK_1.webp"),
      },
      attack_2: {
        anim: require("@/assets/monsters/Demon_Samurai/Phase1/ATTACK_2.webp"),
      },
      attack_3: {
        anim: require("@/assets/monsters/Demon_Samurai/Phase1/ATTACK_3.webp"),
      },
      attack_4: {
        anim: require("@/assets/monsters/Demon_Samurai/Phase1/ATTACK_4.webp"),
      },
      hurt: {
        anim: require("@/assets/monsters/Demon_Samurai/Phase1/HURT.webp"),
      },
      idle: {
        anim: require("@/assets/monsters/Demon_Samurai/Phase1/IDLE.webp"),
      },
      move: {
        anim: require("@/assets/monsters/Demon_Samurai/Phase1/MOVE.webp"),
      },
      transition: {
        anim: require("@/assets/monsters/Demon_Samurai/Phase1/TRANSITION.webp"),
      },
    },
    height: 108,
    width: 128,
    mirror: true,
  },
  demon_samurai_p2: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Demon_Samurai/Phase2/ATTACK_1.webp"),
      },
      attack_2: {
        anim: require("@/assets/monsters/Demon_Samurai/Phase2/ATTACK_2.webp"),
      },
      attack_3: {
        anim: require("@/assets/monsters/Demon_Samurai/Phase2/ATTACK_3.webp"),
      },
      attack_4: {
        anim: require("@/assets/monsters/Demon_Samurai/Phase2/ATTACK_4.webp"),
      },
      hurt: {
        anim: require("@/assets/monsters/Demon_Samurai/Phase2/HURT.webp"),
      },
      idle: {
        anim: require("@/assets/monsters/Demon_Samurai/Phase2/IDLE.webp"),
      },
      move: {
        anim: require("@/assets/monsters/Demon_Samurai/Phase2/MOVE.webp"),
      },
      death: {
        anim: require("@/assets/monsters/Demon_Samurai/Phase2/MOVE.webp"),
      },
    },
    height: 108,
    width: 128,
    mirror: true,
  },
  dragon: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Dragon/ATTACK_1.webp"),
      },
      death: {
        anim: require("@/assets/monsters/Dragon/DEATH.webp"),
      },
      hurt: {
        anim: require("@/assets/monsters/Dragon/HURT.webp"),
      },
      idle: {
        anim: require("@/assets/monsters/Dragon/IDLE.webp"),
      },
      move: {
        anim: require("@/assets/monsters/Dragon/MOVE.webp"),
      },
    },
    height: 140,
    width: 140,
  },
  ghost: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Ghost/ATTACK_1.webp"),
      },
      death: {
        anim: require("@/assets/monsters/Ghost/DEATH.webp"),
      },
      idle: {
        anim: require("@/assets/monsters/Ghost/IDLE.webp"),
      },
      move: {
        anim: require("@/assets/monsters/Ghost/MOVE.webp"),
      },
    },
    height: 31,
    width: 24,
    mirror: true,
  },
  gladiator_archer: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Gladiator_Archer/ATTACK_1.webp"),
      },
      death: {
        anim: require("@/assets/monsters/Gladiator_Archer/DEATH.webp"),
      },
      hurt: {
        anim: require("@/assets/monsters/Gladiator_Archer/HURT.webp"),
      },
      idle: {
        anim: require("@/assets/monsters/Gladiator_Archer/IDLE.webp"),
      },
      move: {
        anim: require("@/assets/monsters/Gladiator_Archer/MOVE.webp"),
      },
    },
    height: 96,
    width: 96,
    mirror: true,
  },
  gladiator_female: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Gladiator_Female/ATTACK_1.webp"),
      },
      death: {
        anim: require("@/assets/monsters/Gladiator_Female/DEATH.webp"),
      },
      hurt: {
        anim: require("@/assets/monsters/Gladiator_Female/HURT.webp"),
      },
      jump: {
        anim: require("@/assets/monsters/Gladiator_Female/JUMP.webp"),
      },
      idle: {
        anim: require("@/assets/monsters/Gladiator_Female/IDLE.webp"),
      },
      move: {
        anim: require("@/assets/monsters/Gladiator_Female/MOVE.webp"),
      },
    },
    height: 84,
    width: 106,
    mirror: true,
  },
  gladiator_hammer: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Gladiator_Hammer/ATTACK_1.webp"),
      },
      death: {
        anim: require("@/assets/monsters/Gladiator_Hammer/DEATH.webp"),
      },
      hurt: {
        anim: require("@/assets/monsters/Gladiator_Hammer/HURT.webp"),
      },
      idle: {
        anim: require("@/assets/monsters/Gladiator_Hammer/IDLE.webp"),
      },
      move: {
        anim: require("@/assets/monsters/Gladiator_Hammer/MOVE.webp"),
      },
    },
    height: 84,
    width: 106,
    mirror: true,
  },
  gladiator_longsword: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Gladiator_LS/ATTACK_1.webp"),
      },
      death: {
        anim: require("@/assets/monsters/Gladiator_LS/DEATH.webp"),
      },
      hurt: {
        anim: require("@/assets/monsters/Gladiator_LS/HURT.webp"),
      },
      idle: {
        anim: require("@/assets/monsters/Gladiator_LS/IDLE.webp"),
      },
      move: {
        anim: require("@/assets/monsters/Gladiator_LS/MOVE.webp"),
      },
    },
    height: 96,
    width: 96,
    mirror: true,
  },
  gladiator_spear: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Gladiator_Spear/ATTACK_1.webp"),
      },
      death: {
        anim: require("@/assets/monsters/Gladiator_Spear/DEATH.webp"),
      },
      hurt: {
        anim: require("@/assets/monsters/Gladiator_Spear/HURT.webp"),
      },
      idle: {
        anim: require("@/assets/monsters/Gladiator_Spear/IDLE.webp"),
      },
      move: {
        anim: require("@/assets/monsters/Gladiator_Spear/MOVE.webp"),
      },
    },
    height: 100,
    width: 150,
    topOffset: 20,
    mirror: true,
  },
  gladiator_shortsword: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Gladiator_SS/ATTACK_1.webp"),
      },
      death: {
        anim: require("@/assets/monsters/Gladiator_SS/DEATH.webp"),
      },
      hurt: {
        anim: require("@/assets/monsters/Gladiator_SS/HURT.webp"),
      },
      idle: {
        anim: require("@/assets/monsters/Gladiator_SS/IDLE.webp"),
      },
      move: {
        anim: require("@/assets/monsters/Gladiator_SS/MOVE.webp"),
      },
    },
    height: 96,
    width: 96,
    mirror: true,
  },
  goblin: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Goblin/ATTACK_1.webp"),
      },
      attack_2: {
        anim: require("@/assets/monsters/Goblin/ATTACK_2.webp"),
      },
      death: {
        anim: require("@/assets/monsters/Goblin/DEATH.webp"),
      },
      hurt: {
        anim: require("@/assets/monsters/Goblin/HURT.webp"),
      },
      idle: {
        anim: require("@/assets/monsters/Goblin/IDLE.webp"),
      },
      move: {
        anim: require("@/assets/monsters/Goblin/MOVE.webp"),
      },
    },
    height: 78,
    width: 116,
  },
  goblin_2: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Goblin_2/ATTACK_1.webp"),
      },
      death: {
        anim: require("@/assets/monsters/Goblin_2/DEATH.webp"),
      },
      hurt: {
        anim: require("@/assets/monsters/Goblin_2/HURT.webp"),
      },
      idle: {
        anim: require("@/assets/monsters/Goblin_2/IDLE.webp"),
      },
      move: {
        anim: require("@/assets/monsters/Goblin_2/MOVE.webp"),
      },
    },
    height: 80,
    width: 80,
  },
  goblin_mage: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Goblin_Mage/ATTACK_1.webp"),
      },
      attack_2: {
        anim: require("@/assets/monsters/Goblin_Mage/ATTACK_2.webp"),
        disablePreMovement: true,
        projectile: {
          anim: require("@/assets/monsters/Goblin_Mage/PROJECTILE.webp"),
          width: 20,
          height: 20,
          scale: 2,
        },
      },
      death: {
        anim: require("@/assets/monsters/Goblin_Mage/DEATH.webp"),
      },
      hurt: {
        anim: require("@/assets/monsters/Goblin_Mage/HURT.webp"),
      },
      idle: {
        anim: require("@/assets/monsters/Goblin_Mage/IDLE.webp"),
      },
      move: {
        anim: require("@/assets/monsters/Goblin_Mage/MOVE.webp"),
      },
    },
    height: 80,
    width: 80,
  },
  golem: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Golem/ATTACK_1.webp"),
      },
      death: {
        anim: require("@/assets/monsters/Golem/DEATH.webp"),
      },
      hurt: {
        anim: require("@/assets/monsters/Golem/HURT.webp"),
      },
      idle: {
        anim: require("@/assets/monsters/Golem/IDLE.webp"),
      },
      move: {
        anim: require("@/assets/monsters/Golem/MOVE.webp"),
      },
    },
    height: 125,
    width: 158,
    topOffset: 20,
  },
  ground_monk: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Ground_Monk/ATTACK_1.webp"),
      },
      attack_2: {
        anim: require("@/assets/monsters/Ground_Monk/ATTACK_2.webp"),
      },
      attack_3: {
        anim: require("@/assets/monsters/Ground_Monk/ATTACK_3.webp"),
      },
      attack_4: {
        anim: require("@/assets/monsters/Ground_Monk/ATTACK_4.webp"),
      },
      attack_5: {
        anim: require("@/assets/monsters/Ground_Monk/ATTACK_5.webp"),
      },
      block: {
        anim: require("@/assets/monsters/Ground_Monk/BLOCK.webp"),
      },
      death: {
        anim: require("@/assets/monsters/Ground_Monk/DEATH.webp"),
      },
      dodge: {
        anim: require("@/assets/monsters/Ground_Monk/DODGE.webp"),
      },
      float: {
        anim: require("@/assets/monsters/Ground_Monk/FLOAT.webp"),
      },
      hurt: {
        anim: require("@/assets/monsters/Ground_Monk/HURT.webp"),
      },
      idle: {
        anim: require("@/assets/monsters/Ground_Monk/IDLE.webp"),
      },
      move: {
        anim: require("@/assets/monsters/Ground_Monk/MOVE.webp"),
      },
      spawn: {
        anim: require("@/assets/monsters/Ground_Monk/SPAWN.webp"),
      },
    },
    height: 128,
    width: 288,
    mirror: true,
  },
  gryphon: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Gryphon/ATTACK_1.webp"),
      },
      attack_2: {
        anim: require("@/assets/monsters/Gryphon/ATTACK_2.webp"),
      },
      death: {
        anim: require("@/assets/monsters/Gryphon/DEATH.webp"),
      },
      hurt: {
        anim: require("@/assets/monsters/Gryphon/HURT.webp"),
      },
      idle: {
        anim: require("@/assets/monsters/Gryphon/IDLE.webp"),
      },
      move: {
        anim: require("@/assets/monsters/Gryphon/MOVE.webp"),
      },
    },
    height: 103,
    width: 112,
    mirror: true,
  },
  harpy: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Harpy/ATTACK_1.webp"),
      },
      death: {
        anim: require("@/assets/monsters/Harpy/DEATH.webp"),
      },
      hurt: {
        anim: require("@/assets/monsters/Harpy/HURT.webp"),
      },
      idle: {
        anim: require("@/assets/monsters/Harpy/IDLE_MOVE.webp"),
      },
      move: {
        anim: require("@/assets/monsters/Harpy/IDLE_MOVE.webp"),
      },
    },
    height: 100,
    width: 100,
  },
  huge_knight: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Huge_Knight/ATTACK_1.webp"),
      },
      death: {
        anim: require("@/assets/monsters/Huge_Knight/DEATH.webp"),
      },
      hurt: {
        anim: require("@/assets/monsters/Huge_Knight/HURT.webp"),
      },
      idle: {
        anim: require("@/assets/monsters/Huge_Knight/IDLE.webp"),
      },
      move: {
        anim: require("@/assets/monsters/Huge_Knight/MOVE.webp"),
      },
    },
    height: 187,
    width: 237,
    mirror: true,
  },
  imp: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Imp/ATTACK_1.webp"),
      },
      death: {
        anim: require("@/assets/monsters/Imp/DEATH.webp"),
      },
      hurt: {
        anim: require("@/assets/monsters/Imp/HURT.webp"),
      },
      idle: {
        anim: require("@/assets/monsters/Imp/IDLE_MOVE.webp"),
      },
      move: {
        anim: require("@/assets/monsters/Imp/IDLE_MOVE.webp"),
      },
    },
    height: 100,
    width: 100,
    mirror: true,
  },
  kobold: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Kobold/ATTACK_1.webp"),
      },
      attack_2: {
        anim: require("@/assets/monsters/Kobold/ATTACK_2.webp"),
      },
      attack_3: {
        anim: require("@/assets/monsters/Kobold/ATTACK_1.webp"),
      },
      attack_4: {
        anim: require("@/assets/monsters/Kobold/ATTACK_2.webp"),
      },
      death: {
        anim: require("@/assets/monsters/Kobold/DEATH.webp"),
      },
      hurt: {
        anim: require("@/assets/monsters/Kobold/HURT.webp"),
      },
      idle: {
        anim: require("@/assets/monsters/Kobold/IDLE.webp"),
      },
      move: {
        anim: require("@/assets/monsters/Kobold/MOVE.webp"),
      },
    },
    height: 96,
    width: 148,
    mirror: true,
  },
  lizardman: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Lizardman/ATTACK_1.webp"),
      },
      death: {
        anim: require("@/assets/monsters/Lizardman/DEATH.webp"),
      },
      hurt: {
        anim: require("@/assets/monsters/Lizardman/HURT.webp"),
      },
      idle: {
        anim: require("@/assets/monsters/Lizardman/IDLE.webp"),
      },
      move: {
        anim: require("@/assets/monsters/Lizardman/MOVE.webp"),
      },
    },
    height: 125,
    width: 158,
    mirror: true,
  },
  medusa: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Medusa/ATTACK_1.webp"),
      },
      attack_2: {
        anim: require("@/assets/monsters/Medusa/ATTACK_2.webp"),
      },
      death: {
        anim: require("@/assets/monsters/Medusa/DEATH.webp"),
      },
      hurt: {
        anim: require("@/assets/monsters/Medusa/HURT.webp"),
      },
      idle: {
        anim: require("@/assets/monsters/Medusa/IDLE.webp"),
      },
      move: {
        anim: require("@/assets/monsters/Medusa/MOVE.webp"),
      },
    },
    height: 125,
    width: 150,
  },
  mimic: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Mimic/ATTACK_1.webp"),
      },
      spawn: {
        anim: require("@/assets/monsters/Mimic/SPAWN.webp"),
      },
      death: {
        anim: require("@/assets/monsters/Mimic/DEATH.webp"),
      },
      hurt: {
        anim: require("@/assets/monsters/Mimic/HURT.webp"),
      },
      idle: {
        anim: require("@/assets/monsters/Mimic/IDLE.webp"),
      },
      move: {
        anim: require("@/assets/monsters/Mimic/MOVE.webp"),
      },
    },
    height: 125,
    width: 158,
    mirror: true,
  },
  minotaur: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Minotaur/ATTACK_1.webp"),
      },
      attack_2: {
        anim: require("@/assets/monsters/Minotaur/ATTACK_2.webp"),
      },
      death: {
        anim: require("@/assets/monsters/Minotaur/DEATH.webp"),
      },
      hurt: {
        anim: require("@/assets/monsters/Minotaur/HURT.webp"),
      },
      idle: {
        anim: require("@/assets/monsters/Minotaur/IDLE.webp"),
      },
      move: {
        anim: require("@/assets/monsters/Minotaur/MOVE.webp"),
      },
    },
    height: 128,
    width: 128,
    mirror: true,
  },
  necromancer: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Necromancer/ATTACK_1.webp"),
      },
      attack_2: {
        anim: require("@/assets/monsters/Necromancer/ATTACK_2.webp"),
        disablePreMovement: true,
      },
      attack_3: {
        anim: require("@/assets/monsters/Necromancer/ATTACK_3.webp"),
      },
      death: {
        anim: require("@/assets/monsters/Necromancer/DEATH.webp"),
      },
      hurt: {
        anim: require("@/assets/monsters/Necromancer/HURT.webp"),
      },
      idle: {
        anim: require("@/assets/monsters/Necromancer/IDLE.webp"),
      },
      move: {
        anim: require("@/assets/monsters/Necromancer/MOVE.webp"),
      },
    },
    height: 128,
    width: 160,
    mirror: true,
  },
  npc_man: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/NPC_Man/ATTACK_1.webp"),
      },
      death: {
        anim: require("@/assets/monsters/NPC_Man/DEATH.webp"),
      },
      hurt: {
        anim: require("@/assets/monsters/NPC_Man/HURT.webp"),
      },
      idle: {
        anim: require("@/assets/monsters/NPC_Man/IDLE.webp"),
      },
      move: {
        anim: require("@/assets/monsters/NPC_Man/MOVE.webp"),
      },
    },
    height: 48,
    width: 48,
  },
  npc_man_old: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/NPC_Man_Old/ATTACK_1.webp"),
      },
      death: {
        anim: require("@/assets/monsters/NPC_Man_Old/DEATH.webp"),
      },
      hurt: {
        anim: require("@/assets/monsters/NPC_Man_Old/HURT.webp"),
      },
      idle: {
        anim: require("@/assets/monsters/NPC_Man_Old/IDLE.webp"),
      },
      move: {
        anim: require("@/assets/monsters/NPC_Man_Old/MOVE.webp"),
      },
    },
    height: 48,
    width: 48,
  },
  npc_woman: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/NPC_Woman/ATTACK_1.webp"),
      },
      death: {
        anim: require("@/assets/monsters/NPC_Woman/DEATH.webp"),
      },
      hurt: {
        anim: require("@/assets/monsters/NPC_Woman/HURT.webp"),
      },
      idle: {
        anim: require("@/assets/monsters/NPC_Woman/IDLE.webp"),
      },
      move: {
        anim: require("@/assets/monsters/NPC_Woman/MOVE.webp"),
      },
    },
    height: 48,
    width: 48,
  },
  npc_woman_old: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/NPC_Woman_Old/ATTACK_1.webp"),
      },
      death: {
        anim: require("@/assets/monsters/NPC_Woman_Old/DEATH.webp"),
      },
      hurt: {
        anim: require("@/assets/monsters/NPC_Woman_Old/HURT.webp"),
      },
      idle: {
        anim: require("@/assets/monsters/NPC_Woman_Old/IDLE.webp"),
      },
      move: {
        anim: require("@/assets/monsters/NPC_Woman_Old/MOVE.webp"),
      },
    },
    height: 48,
    width: 48,
  },
  orc_masked: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Orc_Masked/ATTACK_1.webp"),
      },
      death: {
        anim: require("@/assets/monsters/Orc_Masked/DEATH.webp"),
      },
      hurt: {
        anim: require("@/assets/monsters/Orc_Masked/HURT.webp"),
      },
      idle: {
        anim: require("@/assets/monsters/Orc_Masked/IDLE.webp"),
      },
      move: {
        anim: require("@/assets/monsters/Orc_Masked/MOVE.webp"),
      },
    },
    height: 80,
    width: 150,
  },
  pyromancer: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Pyromancer/ATTACK_1.webp"),
        projectile: {
          anim: require("@/assets/monsters/Pyromancer/PROJECTILE.webp"),
          width: 48,
          height: 48,
        },
      },
      death: {
        anim: require("@/assets/monsters/Pyromancer/DEATH.webp"),
      },
      hurt: {
        anim: require("@/assets/monsters/Pyromancer/HURT.webp"),
      },
      idle: {
        anim: require("@/assets/monsters/Pyromancer/IDLE.webp"),
      },
      move: {
        anim: require("@/assets/monsters/Pyromancer/MOVE.webp"),
      },
    },
    height: 100,
    width: 100,
    mirror: true,
  },
  rat: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Rat/ATTACK_1.webp"),
      },
      attack_2: {
        anim: require("@/assets/monsters/Rat/ATTACK_2.webp"),
      },
      hurt: {
        anim: require("@/assets/monsters/Rat/HURT.webp"),
      },
      death: {
        anim: require("@/assets/monsters/Rat/DEATH.webp"),
      },
      idle: {
        anim: require("@/assets/monsters/Rat/IDLE.webp"),
      },
      move: {
        anim: require("@/assets/monsters/Rat/MOVE.webp"),
      },
    },
    height: 44,
    width: 62,
    topOffset: -15,
    mirror: true,
    renderScale: 0.8,
  },
  reaper: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Reaper/ATTACK_1.webp"),
      },
      attack_2: {
        anim: require("@/assets/monsters/Reaper/ATTACK_2.webp"),
      },
      attack_3: {
        anim: require("@/assets/monsters/Reaper/ATTACK_SUMMON.webp"),
      },
      hurt: {
        anim: require("@/assets/monsters/Reaper/DODGE.webp"),
      },
      death: {
        anim: require("@/assets/monsters/Reaper/DEATH.webp"),
      },
      dodge: {
        anim: require("@/assets/monsters/Reaper/DODGE.webp"),
      },
      idle: {
        anim: require("@/assets/monsters/Reaper/IDLE.webp"),
      },
    },
    height: 100,
    width: 100,
    mirror: true,
  },
  reaper_summon: {
    sets: {
      summon_idle: {
        anim: require("@/assets/monsters/Reaper/SUMMON_IDLE.webp"),
      },
      summon_spawn: {
        anim: require("@/assets/monsters/Reaper/SUMMON_SPAWN.webp"),
      },
      summon_death: {
        anim: require("@/assets/monsters/Reaper/SUMMON_DEATH.webp"),
      },
    },
    height: 50,
    width: 50,
    mirror: true,
  },
  samurai_armor: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Samurai_Armor/ATTACK_1.webp"),
      },
      attack_2: {
        anim: require("@/assets/monsters/Samurai_Armor/ATTACK_2.webp"),
      },
      attack_3: {
        anim: require("@/assets/monsters/Samurai_Armor/ATTACK_3.webp"),
      },
      attack_4: {
        anim: require("@/assets/monsters/Samurai_Armor/ATTACK_4.webp"),
      },
      throw: {
        anim: require("@/assets/monsters/Samurai_Armor/THROW.webp"),
        projectile: require("@/assets/monsters/Samurai_Armor/SHURIKEN.png"),
      },
      hurt: {
        anim: require("@/assets/monsters/Samurai_Armor/HURT.webp"),
      },
      block: {
        anim: require("@/assets/monsters/Samurai_Armor/DEFENCE.webp"),
      },
      death: {
        anim: require("@/assets/monsters/Samurai_Armor/DEATH.webp"),
      },
      idle: {
        anim: require("@/assets/monsters/Samurai_Armor/IDLE.webp"),
      },
      move: {
        anim: require("@/assets/monsters/Samurai_Armor/MOVE.webp"),
      },
      jump: {
        anim: require("@/assets/monsters/Samurai_Armor/JUMP.webp"),
      },
    },
    height: 64,
    width: 96,
    mirror: true,
  },
  samurai_dual: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Samurai_Dual/ATTACK_1.webp"),
      },
      attack_2: {
        anim: require("@/assets/monsters/Samurai_Dual/ATTACK_2.webp"),
      },
      attack_3: {
        anim: require("@/assets/monsters/Samurai_Dual/ATTACK_3.webp"),
      },
      hurt: {
        anim: require("@/assets/monsters/Samurai_Dual/HURT.webp"),
      },
      death: {
        anim: require("@/assets/monsters/Samurai_Dual/DEATH.webp"),
      },
      idle: {
        anim: require("@/assets/monsters/Samurai_Dual/IDLE.webp"),
      },
      move: {
        anim: require("@/assets/monsters/Samurai_Dual/MOVE.webp"),
      },
      jump: {
        anim: require("@/assets/monsters/Samurai_Dual/JUMP.webp"),
      },
    },
    height: 64,
    width: 96,
    mirror: true,
  },
  samurai_female: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Samurai_Female/ATTACK_1.webp"),
      },
      attack_2: {
        anim: require("@/assets/monsters/Samurai_Female/ATTACK_2.webp"),
      },
      attack_3: {
        anim: require("@/assets/monsters/Samurai_Female/ATTACK_3.webp"),
      },
      throw: {
        anim: require("@/assets/monsters/Samurai_Female/THROW.webp"),
        projectile: require("@/assets/monsters/Samurai_Armor/SHURIKEN.png"),
      },
      hurt: {
        anim: require("@/assets/monsters/Samurai_Female/HURT.webp"),
      },
      death: {
        anim: require("@/assets/monsters/Samurai_Female/DEATH.webp"),
      },
      idle: {
        anim: require("@/assets/monsters/Samurai_Female/IDLE.webp"),
      },
      move: {
        anim: require("@/assets/monsters/Samurai_Female/MOVE.webp"),
      },
      jump: {
        anim: require("@/assets/monsters/Samurai_Female/JUMP.webp"),
      },
    },
    height: 64,
    width: 96,
    mirror: true,
  },
  samurai_huge: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Samurai_Huge/ATTACK_1.webp"),
      },
      attack_2: {
        anim: require("@/assets/monsters/Samurai_Huge/ATTACK_2.webp"),
      },
      attack_3: {
        anim: require("@/assets/monsters/Samurai_Huge/ATTACK_3.webp"),
      },
      hurt: {
        anim: require("@/assets/monsters/Samurai_Huge/HURT.webp"),
      },
      death: {
        anim: require("@/assets/monsters/Samurai_Huge/DEATH.webp"),
      },
      idle: {
        anim: require("@/assets/monsters/Samurai_Huge/IDLE.webp"),
      },
      move: {
        anim: require("@/assets/monsters/Samurai_Huge/MOVE.webp"),
      },
      jump: {
        anim: require("@/assets/monsters/Samurai_Huge/JUMP.webp"),
      },
    },
    height: 64,
    width: 98,
    mirror: true,
  },
  samurai_old: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Samurai_Old/ATTACK_1.webp"),
      },
      attack_2: {
        anim: require("@/assets/monsters/Samurai_Old/ATTACK_2.webp"),
      },
      attack_3: {
        anim: require("@/assets/monsters/Samurai_Old/ATTACK_3.webp"),
      },
      attack_4: {
        anim: require("@/assets/monsters/Samurai_Old/ATTACK_4.webp"),
      },
      block: {
        anim: require("@/assets/monsters/Samurai_Old/BLOCK.webp"),
      },
      heal: {
        anim: require("@/assets/monsters/Samurai_Old/HEALING.webp"),
      },
      throw: {
        anim: require("@/assets/monsters/Samurai_Old/THROW.webp"),
        projectile: require("@/assets/monsters/Samurai_Armor/SHURIKEN.png"),
      },
      dodge: {
        anim: require("@/assets/monsters/Samurai_Old/DASH.webp"),
      },
      hurt: {
        anim: require("@/assets/monsters/Samurai_Old/HURT.webp"),
      },
      death: {
        anim: require("@/assets/monsters/Samurai_Old/DEATH.webp"),
      },
      idle: {
        anim: require("@/assets/monsters/Samurai_Old/IDLE.webp"),
      },
      move: {
        anim: require("@/assets/monsters/Samurai_Old/MOVE.webp"),
      },
      jump: {
        anim: require("@/assets/monsters/Samurai_Old/JUMP.webp"),
      },
    },
    height: 96,
    width: 96,
    mirror: true,
    topOffset: -20,
  },
  samurai_rice: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Samurai_Rice/ATTACK_1.webp"),
      },
      attack_2: {
        anim: require("@/assets/monsters/Samurai_Rice/ATTACK_2.webp"),
      },
      hurt: {
        anim: require("@/assets/monsters/Samurai_Rice/HURT.webp"),
      },
      death: {
        anim: require("@/assets/monsters/Samurai_Rice/DEATH.webp"),
      },
      idle: {
        anim: require("@/assets/monsters/Samurai_Rice/IDLE.webp"),
      },
      move: {
        anim: require("@/assets/monsters/Samurai_Rice/MOVE.webp"),
      },
      jump: {
        anim: require("@/assets/monsters/Samurai_Rice/JUMP.webp"),
      },
    },
    height: 84,
    width: 106,
    mirror: true,
  },
  samurai_wolf: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Samurai_Wolf/ATTACK_1.webp"),
      },
      attack_2: {
        anim: require("@/assets/monsters/Samurai_Wolf/ATTACK_2.webp"),
      },
      attack_3: {
        anim: require("@/assets/monsters/Samurai_Wolf/ATTACK_3.webp"),
      },
      attack_4: {
        anim: require("@/assets/monsters/Samurai_Wolf/ATTACK_4.webp"),
      },
      hurt: {
        anim: require("@/assets/monsters/Samurai_Wolf/HURT.webp"),
      },
      death: {
        anim: require("@/assets/monsters/Samurai_Wolf/DEATH.webp"),
      },
      idle: {
        anim: require("@/assets/monsters/Samurai_Wolf/IDLE.webp"),
      },
      move: {
        anim: require("@/assets/monsters/Samurai_Wolf/MOVE.webp"),
      },
      jump: {
        anim: require("@/assets/monsters/Samurai_Wolf/JUMP.webp"),
      },
    },
    height: 64,
    width: 192,
  },
  satyr: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Satyr/ATTACK_1.webp"),
        disablePreMovement: true,
      },
      hurt: {
        anim: require("@/assets/monsters/Satyr/HURT.webp"),
      },
      death: {
        anim: require("@/assets/monsters/Satyr/DEATH.webp"),
      },
      idle: {
        anim: require("@/assets/monsters/Satyr/IDLE.webp"),
      },
      move: {
        anim: require("@/assets/monsters/Satyr/MOVE.webp"),
      },
    },
    height: 100,
    width: 125,
  },
  skeleton: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Skeleton/ATTACK_1.webp"),
      },
      attack_2: {
        anim: require("@/assets/monsters/Skeleton/ATTACK_2.webp"),
      },
      hurt: {
        anim: require("@/assets/monsters/Skeleton/HURT.webp"),
      },
      death: {
        anim: require("@/assets/monsters/Skeleton/DEATH.webp"),
      },
      idle: {
        anim: require("@/assets/monsters/Skeleton/IDLE.webp"),
      },
      move: {
        anim: require("@/assets/monsters/Skeleton/MOVE.webp"),
      },
    },
    height: 78,
    width: 89,
    renderScale: 0.75,
  },
  skeleton_mage: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Skeleton_Mage/ATTACK_1.webp"),
        disablePreMovement: true,
        projectile: {
          anim: require("@/assets/monsters/Skeleton_Mage/PROJECTILE.webp"),
          width: 32,
          height: 16,
          scale: 0.8,
        },
      },
      hurt: {
        anim: require("@/assets/monsters/Skeleton_Mage/HURT.webp"),
      },
      death: {
        anim: require("@/assets/monsters/Skeleton_Mage/DEATH.webp"),
      },
      idle: {
        anim: require("@/assets/monsters/Skeleton_Mage/IDLE.webp"),
      },
      move: {
        anim: require("@/assets/monsters/Skeleton_Mage/MOVE.webp"),
      },
    },
    height: 128,
    width: 128,
    mirror: true,
  },
  spider_dark: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Spider_Dark/ATTACK_1.webp"),
      },
      death: {
        anim: require("@/assets/monsters/Spider_Dark/DEATH.webp"),
      },
      idle: {
        anim: require("@/assets/monsters/Spider_Dark/IDLE.webp"),
      },
      move: {
        anim: require("@/assets/monsters/Spider_Dark/MOVE.webp"),
      },
    },
    height: 64,
    width: 64,
    mirror: true,
  },
  spider_dark_brood: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Spider_Dark_brood/ATTACK_1.webp"),
      },
      death: {
        anim: require("@/assets/monsters/Spider_Dark_brood/DEATH.webp"),
      },
      idle: {
        anim: require("@/assets/monsters/Spider_Dark_brood/IDLE.webp"),
      },
      move: {
        anim: require("@/assets/monsters/Spider_Dark_brood/MOVE.webp"),
      },
    },
    height: 64,
    width: 64,
    mirror: true,
  },
  spider_dark_small: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Spider_Dark_small/ATTACK_1.webp"),
      },
      death: {
        anim: require("@/assets/monsters/Spider_Dark_small/DEATH.webp"),
      },
      idle: {
        anim: require("@/assets/monsters/Spider_Dark_small/IDLE.webp"),
      },
      move: {
        anim: require("@/assets/monsters/Spider_Dark_small/MOVE.webp"),
      },
    },
    height: 64,
    width: 64,
    mirror: true,
  },
  spider_default: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Spider_Default/ATTACK_1.webp"),
      },
      death: {
        anim: require("@/assets/monsters/Spider_Default/DEATH.webp"),
      },
      idle: {
        anim: require("@/assets/monsters/Spider_Default/IDLE.webp"),
      },
      move: {
        anim: require("@/assets/monsters/Spider_Default/MOVE.webp"),
      },
    },
    height: 64,
    width: 64,
    mirror: true,
  },
  spider_default_brood: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Spider_Default_brood/ATTACK_1.webp"),
      },
      death: {
        anim: require("@/assets/monsters/Spider_Default_brood/DEATH.webp"),
      },
      idle: {
        anim: require("@/assets/monsters/Spider_Default_brood/IDLE.webp"),
      },
      move: {
        anim: require("@/assets/monsters/Spider_Default_brood/MOVE.webp"),
      },
    },
    height: 64,
    width: 64,
    mirror: true,
  },
  spider_default_small: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Spider_Default_small/ATTACK_1.webp"),
      },
      death: {
        anim: require("@/assets/monsters/Spider_Default_small/DEATH.webp"),
      },
      idle: {
        anim: require("@/assets/monsters/Spider_Default_small/IDLE.webp"),
      },
      move: {
        anim: require("@/assets/monsters/Spider_Default_small/MOVE.webp"),
      },
    },
    height: 64,
    width: 64,
    mirror: true,
  },
  spider_demon: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Spider_Demon/ATTACK_1.webp"),
      },
      death: {
        anim: require("@/assets/monsters/Spider_Demon/DEATH.webp"),
      },
      idle: {
        anim: require("@/assets/monsters/Spider_Demon/IDLE.webp"),
      },
      move: {
        anim: require("@/assets/monsters/Spider_Demon/MOVE.webp"),
      },
    },
    height: 64,
    width: 64,
    mirror: true,
  },
  spider_demon_brood: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Spider_Demon_brood/ATTACK_1.webp"),
      },
      death: {
        anim: require("@/assets/monsters/Spider_Demon_brood/DEATH.webp"),
      },
      idle: {
        anim: require("@/assets/monsters/Spider_Demon_brood/IDLE.webp"),
      },
      move: {
        anim: require("@/assets/monsters/Spider_Demon_brood/MOVE.webp"),
      },
    },
    height: 64,
    width: 64,
    mirror: true,
  },
  spider_demon_small: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Spider_Demon_small/ATTACK_1.webp"),
      },
      death: {
        anim: require("@/assets/monsters/Spider_Demon_small/DEATH.webp"),
      },
      idle: {
        anim: require("@/assets/monsters/Spider_Demon_small/IDLE.webp"),
      },
      move: {
        anim: require("@/assets/monsters/Spider_Demon_small/MOVE.webp"),
      },
    },
    height: 64,
    width: 64,
    mirror: true,
  },
  spider_wood: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Spider_Wood/ATTACK_1.webp"),
      },
      death: {
        anim: require("@/assets/monsters/Spider_Wood/DEATH.webp"),
      },
      idle: {
        anim: require("@/assets/monsters/Spider_Wood/IDLE.webp"),
      },
      move: {
        anim: require("@/assets/monsters/Spider_Wood/MOVE.webp"),
      },
    },
    height: 64,
    width: 64,
    mirror: true,
  },
  spider_wood_brood: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Spider_Wood_brood/ATTACK_1.webp"),
      },
      death: {
        anim: require("@/assets/monsters/Spider_Wood_brood/DEATH.webp"),
      },
      idle: {
        anim: require("@/assets/monsters/Spider_Wood_brood/IDLE.webp"),
      },
      move: {
        anim: require("@/assets/monsters/Spider_Wood_brood/MOVE.webp"),
      },
    },
    height: 64,
    width: 64,
    mirror: true,
  },
  spider_wood_small: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Spider_Wood_small/ATTACK_1.webp"),
      },
      death: {
        anim: require("@/assets/monsters/Spider_Wood_small/DEATH.webp"),
      },
      idle: {
        anim: require("@/assets/monsters/Spider_Wood_small/IDLE.webp"),
      },
      move: {
        anim: require("@/assets/monsters/Spider_Wood_small/MOVE.webp"),
      },
    },
    height: 64,
    width: 64,
    mirror: true,
  },
  training_dummy: {
    sets: {
      hurt: {
        anim: require("@/assets/monsters/Training_Dummy/HURT.webp"),
      },
      idle: {
        anim: require("@/assets/monsters/Training_Dummy/IDLE.png"),
      },
    },
    height: 48,
    width: 48,
    renderScale: 0.9,
  },
  viking_assassin: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Viking_Assassin/ATTACK_1.webp"),
      },
      attack_2: {
        anim: require("@/assets/monsters/Viking_Assassin/ATTACK_2.webp"),
      },
      death: {
        anim: require("@/assets/monsters/Viking_Assassin/DEATH.webp"),
      },
      hurt: {
        anim: require("@/assets/monsters/Viking_Assassin/HURT.webp"),
      },
      idle: {
        anim: require("@/assets/monsters/Viking_Assassin/IDLE.webp"),
      },
      move: {
        anim: require("@/assets/monsters/Viking_Assassin/MOVE.webp"),
      },
    },
    height: 65,
    width: 100,
    mirror: true,
  },
  viking_axe: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Viking_Axe/ATTACK_1.webp"),
      },
      attack_2: {
        anim: require("@/assets/monsters/Viking_Axe/ATTACK_2.webp"),
      },
      death: {
        anim: require("@/assets/monsters/Viking_Axe/DEATH.webp"),
      },
      hurt: {
        anim: require("@/assets/monsters/Viking_Axe/HURT.webp"),
      },
      idle: {
        anim: require("@/assets/monsters/Viking_Axe/IDLE.webp"),
      },
      move: {
        anim: require("@/assets/monsters/Viking_Axe/MOVE.webp"),
      },
    },
    height: 65,
    width: 100,
    mirror: true,
  },
  viking_giant: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Viking_Giant/ATTACK_1.webp"),
      },
      attack_2: {
        anim: require("@/assets/monsters/Viking_Giant/ATTACK_2.webp"),
      },
      death: {
        anim: require("@/assets/monsters/Viking_Giant/DEATH.webp"),
      },
      hurt: {
        anim: require("@/assets/monsters/Viking_Giant/HURT.webp"),
      },
      idle: {
        anim: require("@/assets/monsters/Viking_Giant/IDLE.webp"),
      },
      move: {
        anim: require("@/assets/monsters/Viking_Giant/MOVE.webp"),
      },
    },
    height: 80,
    width: 100,
    topOffset: -20,
    mirror: true,
  },
  viking_spearthrower: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Viking_Spearthrower/ATTACK_1.webp"),
      },
      death: {
        anim: require("@/assets/monsters/Viking_Spearthrower/DEATH.webp"),
      },
      hurt: {
        anim: require("@/assets/monsters/Viking_Spearthrower/HURT.webp"),
      },
      idle: {
        anim: require("@/assets/monsters/Viking_Spearthrower/IDLE.webp"),
      },
      move: {
        anim: require("@/assets/monsters/Viking_Spearthrower/MOVE.webp"),
      },
    },
    height: 65,
    width: 100,
    mirror: true,
  },
  werewolf: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Werewolf/ATTACK_1.webp"),
      },
      attack_2: {
        anim: require("@/assets/monsters/Werewolf/ATTACK_2.webp"),
      },
      spawn: {
        anim: require("@/assets/monsters/Werewolf/SPAWN.webp"),
      },
      hurt: {
        anim: require("@/assets/monsters/Werewolf/HURT.webp"),
      },
      death: {
        anim: require("@/assets/monsters/Werewolf/DEATH.webp"),
      },
      idle: {
        anim: require("@/assets/monsters/Werewolf/IDLE.webp"),
      },
      move: {
        anim: require("@/assets/monsters/Werewolf/MOVE.webp"),
      },
    },
    height: 125,
    width: 158,
    mirror: true,
  },
  witch: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Witch/ATTACK_1.webp"),
      },
      hurt: {
        anim: require("@/assets/monsters/Witch/HURT.webp"),
      },
      death: {
        anim: require("@/assets/monsters/Witch/DEATH.webp"),
      },
      idle: {
        anim: require("@/assets/monsters/Witch/IDLE.webp"),
      },
      move: {
        anim: require("@/assets/monsters/Witch/MOVE.webp"),
      },
    },
    height: 125,
    width: 125,
  },
  wizard_black: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Wizard_Black/ATTACK_1.webp"),
        projectile: {
          anim: require("@/assets/monsters/Wizard_Black/PROJECTILE.webp"),
          width: 64,
          height: 64,
        },
        splash: {
          anim: require("@/assets/monsters/Wizard_Black/EFFECT.webp"),
          width: 64,
          height: 64,
          followsProjectile: false,
        },
        disablePreMovement: true,
      },
      attack_2: {
        anim: require("@/assets/monsters/Wizard_Black/ATTACK_1.webp"),
      },
      hurt: {
        anim: require("@/assets/monsters/Wizard_Black/HURT.webp"),
      },
      death: {
        anim: require("@/assets/monsters/Wizard_Black/DEATH.webp"),
      },
      idle: {
        anim: require("@/assets/monsters/Wizard_Black/IDLE.webp"),
      },
    },
    height: 64,
    width: 64,
    mirror: true,
  },
  wizard_blackblue: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Wizard_BlackBlue/ATTACK_1.webp"),
        projectile: {
          anim: require("@/assets/monsters/Wizard_BlackBlue/PROJECTILE.webp"),
          width: 64,
          height: 64,
        },
        splash: {
          anim: require("@/assets/monsters/Wizard_BlackBlue/EFFECT.webp"),
          width: 64,
          height: 64,
          followsProjectile: false,
        },
        disablePreMovement: true,
      },
      attack_2: {
        anim: require("@/assets/monsters/Wizard_BlackBlue/ATTACK_1.webp"),
      },
      hurt: {
        anim: require("@/assets/monsters/Wizard_BlackBlue/HURT.webp"),
      },
      death: {
        anim: require("@/assets/monsters/Wizard_BlackBlue/DEATH.webp"),
      },
      idle: {
        anim: require("@/assets/monsters/Wizard_BlackBlue/IDLE.webp"),
      },
    },
    height: 64,
    width: 64,
    mirror: true,
  },
  wizard_blue: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Wizard_Blue/ATTACK_1.webp"),
        projectile: {
          anim: require("@/assets/monsters/Wizard_Blue/PROJECTILE.webp"),
          width: 64,
          height: 64,
        },
        splash: {
          anim: require("@/assets/monsters/Wizard_Blue/EFFECT.webp"),
          width: 64,
          height: 64,
          followsProjectile: false,
        },
        disablePreMovement: true,
      },
      attack_2: {
        anim: require("@/assets/monsters/Wizard_Blue/ATTACK_1.webp"),
      },
      hurt: {
        anim: require("@/assets/monsters/Wizard_Blue/HURT.webp"),
      },
      death: {
        anim: require("@/assets/monsters/Wizard_Blue/DEATH.webp"),
      },
      idle: {
        anim: require("@/assets/monsters/Wizard_Blue/IDLE.webp"),
      },
    },
    height: 64,
    width: 64,
    mirror: true,
  },
  wizard_classic: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Wizard_Classic/ATTACK_1.webp"),
        projectile: {
          anim: require("@/assets/monsters/Wizard_Classic/PROJECTILE.webp"),
          width: 32,
          height: 32,
        },
      },
      attack_2: {
        anim: require("@/assets/monsters/Wizard_Classic/ATTACK_2.webp"),
      },
      hurt: {
        anim: require("@/assets/monsters/Wizard_Classic/HURT.webp"),
      },
      death: {
        anim: require("@/assets/monsters/Wizard_Classic/DEATH.webp"),
      },
      idle: {
        anim: require("@/assets/monsters/Wizard_Classic/IDLE.webp"),
      },
      move: {
        anim: require("@/assets/monsters/Wizard_Classic/MOVE.webp"),
      },
    },
    height: 78,
    width: 128,
  },
  wizard_darkpurple: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Wizard_DarkPurple/ATTACK_1.webp"),
        projectile: {
          anim: require("@/assets/monsters/Wizard_DarkPurple/PROJECTILE.webp"),
          width: 64,
          height: 64,
        },
        splash: {
          anim: require("@/assets/monsters/Wizard_DarkPurple/EFFECT.webp"),
          width: 64,
          height: 64,
          followsProjectile: false,
        },
        disablePreMovement: true,
      },
      attack_2: {
        anim: require("@/assets/monsters/Wizard_DarkPurple/ATTACK_1.webp"),
      },
      hurt: {
        anim: require("@/assets/monsters/Wizard_DarkPurple/HURT.webp"),
      },
      death: {
        anim: require("@/assets/monsters/Wizard_DarkPurple/DEATH.webp"),
      },
      idle: {
        anim: require("@/assets/monsters/Wizard_DarkPurple/IDLE.webp"),
      },
    },
    height: 64,
    width: 64,
  },
  wizard_earthen: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Wizard_Earthen/ATTACK_1.webp"),
        projectile: {
          anim: require("@/assets/monsters/Wizard_Earthen/PROJECTILE.webp"),
          width: 64,
          height: 64,
        },
        splash: {
          anim: require("@/assets/monsters/Wizard_Earthen/EFFECT.webp"),
          width: 64,
          height: 64,
          followsProjectile: false,
        },
        disablePreMovement: true,
      },
      attack_2: {
        anim: require("@/assets/monsters/Wizard_Earthen/ATTACK_1.webp"),
      },
      hurt: {
        anim: require("@/assets/monsters/Wizard_Earthen/HURT.webp"),
      },
      death: {
        anim: require("@/assets/monsters/Wizard_Earthen/DEATH.webp"),
      },
      idle: {
        anim: require("@/assets/monsters/Wizard_Earthen/IDLE.webp"),
      },
    },
    height: 64,
    width: 64,
    mirror: true,
  },
  wizard_gray: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Wizard_Gray/ATTACK_1.webp"),
        projectile: {
          anim: require("@/assets/monsters/Wizard_Gray/PROJECTILE.webp"),
          width: 64,
          height: 64,
        },
        splash: {
          anim: require("@/assets/monsters/Wizard_Gray/EFFECT.webp"),
          width: 64,
          height: 64,
          followsProjectile: false,
        },
        disablePreMovement: true,
      },
      attack_2: {
        anim: require("@/assets/monsters/Wizard_Gray/ATTACK_1.webp"),
      },
      hurt: {
        anim: require("@/assets/monsters/Wizard_Gray/HURT.webp"),
      },
      death: {
        anim: require("@/assets/monsters/Wizard_Gray/DEATH.webp"),
      },
      idle: {
        anim: require("@/assets/monsters/Wizard_Gray/IDLE.webp"),
      },
    },
    height: 64,
    width: 64,
    mirror: true,
  },
  wizard_green: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Wizard_Green/ATTACK_1.webp"),
        projectile: {
          anim: require("@/assets/monsters/Wizard_Green/PROJECTILE.webp"),
          width: 64,
          height: 64,
        },
        splash: {
          anim: require("@/assets/monsters/Wizard_Green/EFFECT.webp"),
          width: 64,
          height: 64,
          followsProjectile: false,
        },
        disablePreMovement: true,
      },
      attack_2: {
        anim: require("@/assets/monsters/Wizard_Green/ATTACK_1.webp"),
      },
      hurt: {
        anim: require("@/assets/monsters/Wizard_Green/HURT.webp"),
      },
      death: {
        anim: require("@/assets/monsters/Wizard_Green/DEATH.webp"),
      },
      idle: {
        anim: require("@/assets/monsters/Wizard_Green/IDLE.webp"),
      },
    },
    height: 64,
    width: 64,
    mirror: true,
  },
  wizard_purple: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Wizard_Purple/ATTACK_1.webp"),
        projectile: {
          anim: require("@/assets/monsters/Wizard_Purple/PROJECTILE.webp"),
          width: 64,
          height: 64,
        },
        splash: {
          anim: require("@/assets/monsters/Wizard_Purple/EFFECT.webp"),
          width: 64,
          height: 64,
          followsProjectile: false,
        },
        disablePreMovement: true,
      },
      attack_2: {
        anim: require("@/assets/monsters/Wizard_Purple/ATTACK_1.webp"),
      },
      hurt: {
        anim: require("@/assets/monsters/Wizard_Purple/HURT.webp"),
      },
      death: {
        anim: require("@/assets/monsters/Wizard_Purple/DEATH.webp"),
      },
      idle: {
        anim: require("@/assets/monsters/Wizard_Purple/IDLE.webp"),
      },
    },
    height: 64,
    width: 64,
    mirror: true,
  },
  wizard_redblack: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Wizard_RedBlack/ATTACK_1.webp"),
        projectile: {
          anim: require("@/assets/monsters/Wizard_RedBlack/PROJECTILE.webp"),
          width: 64,
          height: 64,
        },
        splash: {
          anim: require("@/assets/monsters/Wizard_RedBlack/EFFECT.webp"),
          width: 64,
          height: 64,
          followsProjectile: false,
        },
        disablePreMovement: true,
      },
      attack_2: {
        anim: require("@/assets/monsters/Wizard_RedBlack/ATTACK_1.webp"),
      },
      hurt: {
        anim: require("@/assets/monsters/Wizard_RedBlack/HURT.webp"),
      },
      death: {
        anim: require("@/assets/monsters/Wizard_RedBlack/DEATH.webp"),
      },
      idle: {
        anim: require("@/assets/monsters/Wizard_RedBlack/IDLE.webp"),
      },
    },
    height: 64,
    width: 64,
    mirror: true,
  },
  wizard_yellow: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Wizard_Yellow/ATTACK.webp"),
        projectile: {
          anim: require("@/assets/monsters/Wizard_Yellow/PROJECTILE.webp"),
          width: 64,
          height: 64,
        },
        disablePreMovement: true,
      },
      attack_2: {
        anim: require("@/assets/monsters/Wizard_Yellow/ATTACK.webp"),
      },
      hurt: {
        anim: require("@/assets/monsters/Wizard_Yellow/HURT.webp"),
      },
      death: {
        anim: require("@/assets/monsters/Wizard_Yellow/DEATH.webp"),
      },
      idle: {
        anim: require("@/assets/monsters/Wizard_Yellow/IDLE.webp"),
      },
    },
    height: 64,
    width: 64,
    mirror: true,
  },
  wolf_black: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Wolf_Black/ATTACK_1.webp"), //bite
      },
      attack_2: {
        anim: require("@/assets/monsters/Wolf_Black/ATTACK_2.webp"), //claw
      },
      hurt: {
        anim: require("@/assets/monsters/Wolf_Black/HURT.webp"),
      },
      death: {
        anim: require("@/assets/monsters/Wolf_Black/DEATH.webp"),
      },
      idle: {
        anim: require("@/assets/monsters/Wolf_Black/IDLE.webp"),
      },
      move: {
        anim: require("@/assets/monsters/Wolf_Black/MOVE.webp"),
      },
    },
    height: 100,
    width: 100,
    mirror: true,
  },
  zombie: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Zombie/ATTACK_1.webp"),
      },
      hurt: {
        anim: require("@/assets/monsters/Zombie/HURT.webp"),
      },
      death: {
        anim: require("@/assets/monsters/Zombie/DEATH.webp"),
        sizeOverride: { height: 32, width: 46 },
      },
      idle: {
        anim: require("@/assets/monsters/Zombie/IDLE.webp"),
      },
      spawn: {
        anim: require("@/assets/monsters/Zombie/SPAWN.webp"),
      },
      move: {
        anim: require("@/assets/monsters/Zombie/MOVE.webp"),
      },
    },

    height: 32,
    width: 32,
    mirror: true,
  },
};
