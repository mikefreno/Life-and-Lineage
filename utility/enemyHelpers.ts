export type EnemyImageMapType = typeof EnemyImageMap;
export type EnemyImageKeyOption = keyof typeof EnemyImageMap;
export type EnemyImageValueOption = (typeof EnemyImageMap)[EnemyImageKeyOption];
export type Animations = EnemyImageValueOption["sets"];
export type AnimationOptions = keyof Animations;

export const EnemyImageMap = {
  baby_dragon: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Baby_Dragon/ATTACK.png"),
        frames: 6,
      },
      death: {
        anim: require("@/assets/monsters/Baby_Dragon/DEATH.png"),
        frames: 5,
      },
      hurt: {
        anim: require("@/assets/monsters/Baby_Dragon/HURT.png"),
        frames: 3,
      },
      idle: {
        anim: require("@/assets/monsters/Baby_Dragon/IDLE.png"),
        frames: 4,
      },
      move: {
        anim: require("@/assets/monsters/Baby_Dragon/MOVE.png"),
        frames: 4,
      },
      spawn: null,
    },
    effects: {
      projectile: {
        anim: require("@/assets/monsters/Baby_Dragon/Projectile.png"),
        frames: 6,
      },
    },
    height: 125,
    width: 158,
  },
  bandit_heavy: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Bandit_Heavy/ATTACK.png"),
        frames: 4,
      },
      hurt: {
        anim: require("@/assets/monsters/Bandit_Heavy/HURT.png"),
        frames: 4,
      },
      death: {
        anim: require("@/assets/monsters/Bandit_Heavy/DEATH.png"),
        frames: 8,
      },
      idle: {
        anim: require("@/assets/monsters/Bandit_Heavy/IDLE.png"),
        frames: 4,
      },
      move: {
        anim: require("@/assets/monsters/Bandit_Heavy/MOVE.png"),
        frames: 8,
      },
      spawn: null,
    },
    height: 48,
    width: 48,
  },
  bandit_light: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Bandit_Light/ATTACK.png"),
        frames: 4,
      },
      hurt: {
        anim: require("@/assets/monsters/Bandit_Light/HURT.png"),
        frames: 4,
      },
      death: {
        anim: require("@/assets/monsters/Bandit_Light/DEATH.png"),
        frames: 8,
      },
      idle: {
        anim: require("@/assets/monsters/Bandit_Light/IDLE.png"),
        frames: 4,
      },
      move: {
        anim: require("@/assets/monsters/Bandit_Light/MOVE.png"),
        frames: 8,
      },
      spawn: null,
    },
    height: 48,
    width: 48,
  },
  bat_blood: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Bat_Blood/ATTACK.png"),
        frames: 3,
      },
      spawn: {
        anim: require("@/assets/monsters/Bat_Blood/SPAWN.png"),
        frames: 5,
      },
      idle: {
        anim: require("@/assets/monsters/Bat_Blood/IDLE.png"),
        frames: 6,
      },
      move: {
        anim: require("@/assets/monsters/Bat_Blood/MOVE.png"),
        frames: 6,
      },
      death: null,
      hurt: null,
    },
    height: 64,
    width: 64,
    mirror: true,
  },
  bat_brown: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Bat_Brown/ATTACK.png"),
        frames: 3,
      },
      spawn: {
        anim: require("@/assets/monsters/Bat_Brown/SPAWN.png"),
        frames: 5,
      },
      idle: {
        anim: require("@/assets/monsters/Bat_Brown/IDLE.png"),
        frames: 6,
      },
      move: {
        anim: require("@/assets/monsters/Bat_Brown/MOVE.png"),
        frames: 6,
      },
      death: null,
      hurt: null,
    },
    height: 64,
    width: 64,
    mirror: true,
  },
  bat_feral: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Bat_Feral/ATTACK.png"),
        frames: 3,
      },
      spawn: {
        anim: require("@/assets/monsters/Bat_Feral/SPAWN.png"),
        frames: 5,
      },
      idle: {
        anim: require("@/assets/monsters/Bat_Feral/IDLE.png"),
        frames: 6,
      },
      move: {
        anim: require("@/assets/monsters/Bat_Feral/MOVE.png"),
        frames: 6,
      },
      death: null,
      hurt: null,
    },
    height: 64,
    width: 64,
    mirror: true,
  },
  bat_gray: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Bat_Gray/ATTACK.png"),
        frames: 3,
      },
      spawn: {
        anim: require("@/assets/monsters/Bat_Gray/SPAWN.png"),
        frames: 5,
      },
      idle: {
        anim: require("@/assets/monsters/Bat_Gray/IDLE.png"),
        frames: 6,
      },
      move: {
        anim: require("@/assets/monsters/Bat_Gray/MOVE.png"),
        frames: 6,
      },
      death: null,
      hurt: null,
    },
    height: 64,
    width: 64,
    mirror: true,
  },
  bat_origin: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Bat_Origin/ATTACK.png"),
        frames: 3,
      },
      spawn: {
        anim: require("@/assets/monsters/Bat_Origin/SPAWN.png"),
        frames: 5,
      },
      idle: {
        anim: require("@/assets/monsters/Bat_Origin/IDLE.png"),
        frames: 6,
      },
      move: {
        anim: require("@/assets/monsters/Bat_Origin/MOVE.png"),
        frames: 6,
      },
      death: null,
      hurt: null,
    },
    height: 64,
    width: 64,
    mirror: true,
  },
  bat_vampire: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Bat_Vampire/ATTACK.png"),
        frames: 3,
      },
      spawn: {
        anim: require("@/assets/monsters/Bat_Vampire/SPAWN.png"),
        frames: 5,
      },
      idle: {
        anim: require("@/assets/monsters/Bat_Vampire/IDLE.png"),
        frames: 6,
      },
      move: {
        anim: require("@/assets/monsters/Bat_Vampire/MOVE.png"),
        frames: 6,
      },
      death: null,
      hurt: null,
    },
    height: 64,
    width: 64,
    mirror: true,
  },
  centaur: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Centaur/ATTACK.png"),
        frames: 8,
      },
      death: {
        anim: require("@/assets/monsters/Centaur/DEATH.png"),
        frames: 6,
      },
      hurt: {
        anim: require("@/assets/monsters/Centaur/HURT.png"),
        frames: 3,
      },
      idle: {
        anim: require("@/assets/monsters/Centaur/IDLE.png"),
        frames: 6,
      },
      move: {
        anim: require("@/assets/monsters/Centaur/MOVE.png"),
        frames: 3,
      },
      spawn: null,
    },
    height: 100,
    width: 100,
  },
  cerebus: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Cerebus/ATTACK.png"),
        frames: 6,
      },
      death: {
        anim: require("@/assets/monsters/Cerebus/DEATH.png"),
        frames: 6,
      },
      hurt: {
        anim: require("@/assets/monsters/Cerebus/HURT.png"),
        frames: 3,
      },
      idle: {
        anim: require("@/assets/monsters/Cerebus/IDLE.png"),
        frames: 3,
      },
      move: {
        anim: require("@/assets/monsters/Cerebus/MOVE.png"),
        frames: 3,
      },
      spawn: null,
    },
    height: 100,
    width: 125,
    displayHeight: 200,
    displayWidth: 250,
  },
  cyclops: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Cyclops/ATTACK_1.png"),
        frames: 7,
      },
      attack_2: {
        anim: require("@/assets/monsters/Cyclops/ATTACK_2.png"),
        frames: 11,
      },
      death: {
        anim: require("@/assets/monsters/Cyclops/DEATH.png"),
        frames: 8,
      },
      hurt: {
        anim: require("@/assets/monsters/Cyclops/HURT.png"),
        frames: 3,
      },
      idle: {
        anim: require("@/assets/monsters/Cyclops/IDLE.png"),
        frames: 3,
      },
      move: {
        anim: require("@/assets/monsters/Cyclops/MOVE.png"),
        frames: 6,
      },
      spawn: null,
    },
    height: 125,
    width: 158,
    displayHeight: 200,
    displayWidth: 250,
  },
  demon_boss: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Demon_Boss/ATTACK.png"),
        frames: 6,
      },
      transition: {
        anim: require("@/assets/monsters/Demon_Boss/TRANSITION.png"),
        frames: 3,
      },
      death: {
        anim: require("@/assets/monsters/Demon_Boss/DEATH.png"),
        frames: 10,
      },
      hurt: {
        anim: require("@/assets/monsters/Demon_Boss/HURT.png"),
        frames: 3,
      },
      idle: {
        anim: require("@/assets/monsters/Demon_Boss/IDLE.png"),
        frames: 4,
      },
      move: {
        anim: require("@/assets/monsters/Demon_Boss/MOVE.png"),
        frames: 4,
      },
      spawn: null,
    },
    height: 148,
    width: 162,
    displayHeight: 300,
    displayWidth: 328,
  },
  demon_samurai_p1: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Demon_Samurai/ATTACK_1_P1.png"),
        frames: 7,
      },
      attack_2: {
        anim: require("@/assets/monsters/Demon_Samurai/ATTACK_2_P1.png"),
        frames: 5,
      },
      attack_3: {
        anim: require("@/assets/monsters/Demon_Samurai/ATTACK_3_P1.png"),
        frames: 7,
      },
      attack_4: {
        anim: require("@/assets/monsters/Demon_Samurai/ATTACK_4_P1.png"),
        frames: 12,
      },
      hurt: {
        anim: require("@/assets/monsters/Demon_Samurai/HURT_P1.png"),
        frames: 7,
      },
      idle: {
        anim: require("@/assets/monsters/Demon_Samurai/IDLE_P1.png"),
        frames: 6,
      },
      move: {
        anim: require("@/assets/monsters/Demon_Samurai/MOVE_P1.png"),
        frames: 8,
      },
      transition: {
        anim: require("@/assets/monsters/Demon_Samurai/SHOUT.png"),
        frames: 17,
      },
      spawn: null,
    },
    height: 108,
    width: 128,
    displayHeight: 277,
    displayWidth: 328,
    mirror: true,
  },
  demon_samurai_p2: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Demon_Samurai/ATTACK_1_P2.png"),
        frames: 7,
      },
      attack_2: {
        anim: require("@/assets/monsters/Demon_Samurai/ATTACK_2_P2.png"),
        frames: 6,
      },
      attack_3: {
        anim: require("@/assets/monsters/Demon_Samurai/ATTACK_3_P2.png"),
        frames: 7,
      },
      attack_4: {
        anim: require("@/assets/monsters/Demon_Samurai/ATTACK_4_P2.png"),
        frames: 11,
      },
      hurt: {
        anim: require("@/assets/monsters/Demon_Samurai/HURT_P2.png"),
        frames: 11,
      },
      idle: {
        anim: require("@/assets/monsters/Demon_Samurai/IDLE_P2.png"),
        frames: 6,
      },
      move: {
        anim: require("@/assets/monsters/Demon_Samurai/MOVE_P2.png"),
        frames: 8,
      },
      transition: {
        anim: require("@/assets/monsters/Demon_Samurai/SHOUT.png"),
        frames: 17,
      },
      spawn: null,
    },
    height: 108,
    width: 128,
    displayHeight: 277,
    displayWidth: 328,
    mirror: true,
  },
  dragon: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Dragon/ATTACK.png"),
        frames: 15,
      },
      death: {
        anim: require("@/assets/monsters/Dragon/DEATH.png"),
        frames: 4,
      },
      hurt: {
        anim: require("@/assets/monsters/Dragon/HURT.png"),
        frames: 3,
      },
      idle: {
        anim: require("@/assets/monsters/Dragon/IDLE.png"),
        frames: 3,
      },
      move: {
        anim: require("@/assets/monsters/Dragon/MOVE.png"),
        frames: 3,
      },
      spawn: null,
    },
    height: 140,
    width: 140,
    displayHeight: 300,
    displayWidth: 300,
    topOffset: 44,
    leftOffset: -24,
  },
  dwarf_warrior: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Dwarf_Warrior/ATTACK.png"),
        frames: 6,
      },
      death: {
        anim: require("@/assets/monsters/Dwarf_Warrior/DEATH.png"),
        frames: 6,
      },
      hurt: {
        anim: require("@/assets/monsters/Dwarf_Warrior/HURT.png"),
        frames: 3,
      },
      idle: {
        anim: require("@/assets/monsters/Dwarf_Warrior/IDLE.png"),
        frames: 3,
      },
      move: {
        anim: require("@/assets/monsters/Dwarf_Warrior/MOVE.png"),
        frames: 6,
      },
      spawn: null,
    },
    height: 100,
    width: 100,
    displayHeight: 220,
    displayWidth: 220,
  },
  flying_eye: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Flying_Eye/ATTACK.png"),
        frames: 6,
      },
      death: {
        anim: require("@/assets/monsters/Flying_Eye/DEATH.png"),
        frames: 5,
      },
      hurt: {
        anim: require("@/assets/monsters/Flying_Eye/HURT.png"),
        frames: 4,
      },
      move: {
        anim: require("@/assets/monsters/Flying_Eye/MOVE.png"),
        frames: 6,
      },
      idle: {
        anim: require("@/assets/monsters/Flying_Eye/MOVE.png"),
        frames: 6,
      },
      spawn: null,
    },
    height: 150,
    width: 150,
    topOffset: 44,
    mirror: true,
  },
  gargoyle: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Gargoyle/ATTACK.png"),
        frames: 8,
      },
      death: {
        anim: require("@/assets/monsters/Gargoyle/DEATH.png"),
        frames: 5,
      },
      hurt: {
        anim: require("@/assets/monsters/Gargoyle/HURT.png"),
        frames: 4,
      },
      idle: {
        anim: require("@/assets/monsters/Gargoyle/IDLE.png"),
        frames: 4,
      },
      move: {
        anim: require("@/assets/monsters/Gargoyle/MOVE.png"),
        frames: 4,
      },
      spawn: null,
    },
    height: 125,
    width: 158,
  },
  ghost: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Ghost/ATTACK_1.png"),
        frames: 20,
      },
      attack_2: {
        anim: require("@/assets/monsters/Ghost/ATTACK_2.png"),
        frames: 20,
      },
      death: {
        anim: require("@/assets/monsters/Ghost/DEATH.png"),
        frames: 20,
      },
      hurt: {
        anim: require("@/assets/monsters/Ghost/HURT.png"),
        frames: 10,
      },
      idle: {
        anim: require("@/assets/monsters/Ghost/IDLE.png"),
        frames: 6,
      },
      move: {
        anim: require("@/assets/monsters/Ghost/MOVE.png"),
        frames: 4,
      },
      spawn: null,
    },
    height: 64,
    width: 64,
    mirror: true,
  },
  gladiator_archer: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Gladiator_Archer/ATTACK.png"),
        frames: 6,
      },
      death: {
        anim: require("@/assets/monsters/Gladiator_Archer/DEATH.png"),
        frames: 9,
      },
      hurt: {
        anim: require("@/assets/monsters/Gladiator_Archer/HURT.png"),
        frames: 3,
      },
      idle: {
        anim: require("@/assets/monsters/Gladiator_Archer/IDLE.png"),
        frames: 3,
      },
      move: {
        anim: require("@/assets/monsters/Gladiator_Archer/MOVE.png"),
        frames: 6,
      },
      spawn: null,
    },
    height: 96,
    width: 96,
    displayHeight: 260,
    displayWidth: 260,
    mirror: true,
  },
  gladiator_female: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Gladiator_Female/ATTACK.png"),
        frames: 6,
      },
      death: {
        anim: require("@/assets/monsters/Gladiator_Female/DEATH.png"),
        frames: 9,
      },
      hurt: {
        anim: require("@/assets/monsters/Gladiator_Female/HURT.png"),
        frames: 7,
      },
      jump: {
        anim: require("@/assets/monsters/Gladiator_Female/JUMP.png"),
        frames: 3,
      },
      idle: {
        anim: require("@/assets/monsters/Gladiator_Female/IDLE.png"),
        frames: 4,
      },
      move: {
        anim: require("@/assets/monsters/Gladiator_Female/MOVE.png"),
        frames: 6,
      },
      spawn: null,
    },
    height: 84,
    width: 106,
    displayHeight: 260,
    displayWidth: 260,
    mirror: true,
  },
  gladiator_hammer: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Gladiator_Hammer/ATTACK.png"),
        frames: 7,
      },
      death: {
        anim: require("@/assets/monsters/Gladiator_Hammer/DEATH.png"),
        frames: 9,
      },
      hurt: {
        anim: require("@/assets/monsters/Gladiator_Hammer/HURT.png"),
        frames: 3,
      },
      idle: {
        anim: require("@/assets/monsters/Gladiator_Hammer/IDLE.png"),
        frames: 4,
      },
      move: {
        anim: require("@/assets/monsters/Gladiator_Hammer/MOVE.png"),
        frames: 6,
      },
      spawn: null,
    },
    height: 84,
    width: 106,
    displayHeight: 260,
    displayWidth: 260,
    mirror: true,
  },
  gladiator_longsword: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Gladiator_LS/ATTACK.png"),
        frames: 6,
      },
      death: {
        anim: require("@/assets/monsters/Gladiator_LS/DEATH.png"),
        frames: 8,
      },
      hurt: {
        anim: require("@/assets/monsters/Gladiator_LS/HURT.png"),
        frames: 3,
      },
      idle: {
        anim: require("@/assets/monsters/Gladiator_LS/IDLE.png"),
        frames: 3,
      },
      move: {
        anim: require("@/assets/monsters/Gladiator_LS/MOVE.png"),
        frames: 6,
      },
      spawn: null,
    },
    height: 96,
    width: 96,
    displayHeight: 260,
    displayWidth: 260,
    mirror: true,
  },
  gladiator_spear: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Gladiator_Spear/ATTACK.png"),
        frames: 6,
      },
      death: {
        anim: require("@/assets/monsters/Gladiator_Spear/DEATH.png"),
        frames: 9,
      },
      hurt: {
        anim: require("@/assets/monsters/Gladiator_Spear/HURT.png"),
        frames: 3,
      },
      idle: {
        anim: require("@/assets/monsters/Gladiator_Spear/IDLE.png"),
        frames: 4,
      },
      move: {
        anim: require("@/assets/monsters/Gladiator_Spear/MOVE.png"),
        frames: 6,
      },
      spawn: null,
    },
    height: 100,
    width: 150,
    displayHeight: 260,
    displayWidth: 300,
    topOffset: 20,
    mirror: true,
  },
  gladiator_shortsword: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Gladiator_SS/ATTACK.png"),
        frames: 6,
      },
      death: {
        anim: require("@/assets/monsters/Gladiator_SS/DEATH.png"),
        frames: 9,
      },
      hurt: {
        anim: require("@/assets/monsters/Gladiator_SS/HURT.png"),
        frames: 3,
      },
      idle: {
        anim: require("@/assets/monsters/Gladiator_SS/IDLE.png"),
        frames: 3,
      },
      move: {
        anim: require("@/assets/monsters/Gladiator_SS/MOVE.png"),
        frames: 6,
      },
      spawn: null,
    },
    height: 96,
    width: 96,
    displayHeight: 260,
    displayWidth: 260,
    mirror: true,
  },
  goblin: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Goblin/ATTACK_1.png"),
        frames: 6,
      },
      attack_2: {
        anim: require("@/assets/monsters/Goblin/ATTACK_2.png"),
        frames: 6,
      },
      death: {
        anim: require("@/assets/monsters/Goblin/DEATH.png"),
        frames: 10,
      },
      hurt: {
        anim: require("@/assets/monsters/Goblin/HURT.png"),
        frames: 3,
      },
      idle: {
        anim: require("@/assets/monsters/Goblin/IDLE.png"),
        frames: 6,
      },
      move: {
        anim: require("@/assets/monsters/Goblin/MOVE.png"),
        frames: 6,
      },
      spawn: null,
    },
    height: 78,
    width: 116,
    displayHeight: 180,
    displayWidth: 180,
  },
  goblin_2: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Goblin_2/ATTACK_1.png"),
        frames: 7,
      },
      death: {
        anim: require("@/assets/monsters/Goblin_2/DEATH.png"),
        frames: 12,
      },
      hurt: {
        anim: require("@/assets/monsters/Goblin_2/HURT.png"),
        frames: 4,
      },
      idle: {
        anim: require("@/assets/monsters/Goblin_2/IDLE.png"),
        frames: 4,
      },
      move: {
        anim: require("@/assets/monsters/Goblin_2/MOVE.png"),
        frames: 8,
      },
      spawn: null,
    },
    height: 80,
    width: 80,
    displayHeight: 160,
    displayWidth: 160,
  },
  goblin_mage: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Goblin_Mage/ATTACK_1.png"),
        frames: 11,
      },
      attack_2: {
        anim: require("@/assets/monsters/Goblin_Mage/ATTACK_2.png"),
        frames: 14,
      },
      death: {
        anim: require("@/assets/monsters/Goblin_Mage/DEATH.png"),
        frames: 12,
      },
      hurt: {
        anim: require("@/assets/monsters/Goblin_Mage/HURT.png"),
        frames: 4,
      },
      idle: {
        anim: require("@/assets/monsters/Goblin_Mage/IDLE.png"),
        frames: 4,
      },
      move: {
        anim: require("@/assets/monsters/Goblin_Mage/MOVE.png"),
        frames: 8,
      },
      spawn: null,
    },
    effects: {
      projectile: {
        anim: require("@/assets/monsters/Goblin_Mage/PROJECTILE.png"),
        frames: 9,
      },
    },
    height: 80,
    width: 80,
    displayHeight: 160,
    displayWidth: 160,
  },
  golem: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Golem/ATTACK.png"),
        frames: 9,
      },
      death: {
        anim: require("@/assets/monsters/Golem/DEATH.png"),
        frames: 5,
      },
      hurt: {
        anim: require("@/assets/monsters/Golem/HURT.png"),
        frames: 3,
      },
      idle: {
        anim: require("@/assets/monsters/Golem/IDLE.png"),
        frames: 5,
      },
      move: {
        anim: require("@/assets/monsters/Golem/MOVE.png"),
        frames: 6,
      },
      spawn: null,
    },
    height: 125,
    width: 158,
    topOffset: 20,
    displayHeight: 260,
    displayWidth: 260,
  },
  ground_monk: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Ground_Monk/ATTACK_1.png"),
        frames: 7,
      },
      attack_2: {
        anim: require("@/assets/monsters/Ground_Monk/ATTACK_2.png"),
        frames: 6,
      },
      attack_3: {
        anim: require("@/assets/monsters/Ground_Monk/ATTACK_3.png"),
        frames: 12,
      },
      attack_4: {
        anim: require("@/assets/monsters/Ground_Monk/ATTACK_4.png"),
        frames: 23,
      },
      attack_5: {
        anim: require("@/assets/monsters/Ground_Monk/ATTACK_5.png"),
        frames: 25,
      },
      block: {
        anim: require("@/assets/monsters/Ground_Monk/BLOCK.png"),
        frames: 13,
      },
      death: {
        anim: require("@/assets/monsters/Ground_Monk/DEATH.png"),
        frames: 16,
      },
      dodge: {
        anim: require("@/assets/monsters/Ground_Monk/DODGE.png"),
        frames: 6,
      },
      float: {
        anim: require("@/assets/monsters/Ground_Monk/FLOAT.png"),
        frames: 3,
      },
      hurt: {
        anim: require("@/assets/monsters/Ground_Monk/HURT.png"),
        frames: 6,
      },
      idle: {
        anim: require("@/assets/monsters/Ground_Monk/IDLE.png"),
        frames: 6,
      },
      move: {
        anim: require("@/assets/monsters/Ground_Monk/MOVE.png"),
        frames: 8,
      },
      spawn: {
        anim: require("@/assets/monsters/Ground_Monk/SPAWN.png"),
        frames: 8,
      },
    },
    height: 128,
    width: 288,
    mirror: true,
  },
  gryphon: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Gryphon/ATTACK_1.png"),
        frames: 7,
      },
      attack_2: {
        anim: require("@/assets/monsters/Gryphon/ATTACK_2.png"),
        frames: 5,
      },
      death: {
        anim: require("@/assets/monsters/Gryphon/DEATH.png"),
        frames: 7,
      },
      hurt: {
        anim: require("@/assets/monsters/Gryphon/HURT.png"),
        frames: 4,
      },
      idle: {
        anim: require("@/assets/monsters/Gryphon/IDLE.png"),
        frames: 4,
      },
      move: {
        anim: require("@/assets/monsters/Gryphon/MOVE.png"),
        frames: 4,
      },
      spawn: null,
    },
    height: 103,
    width: 112,
    displayHeight: 260,
    displayWidth: 260,
    mirror: true,
  },
  harpy: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Harpy/ATTACK.png"),
        frames: 8,
      },
      death: {
        anim: require("@/assets/monsters/Harpy/DEATH.png"),
        frames: 6,
      },
      hurt: {
        anim: require("@/assets/monsters/Harpy/HURT.png"),
        frames: 3,
      },
      idle: {
        anim: require("@/assets/monsters/Harpy/IDLE_MOVE.png"),
        frames: 4,
      },
      move: {
        anim: require("@/assets/monsters/Harpy/IDLE_MOVE.png"),
        frames: 4,
      },
      spawn: null,
    },
    height: 100,
    width: 100,
  },
  headless_horseman: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Headless_Horseman/ATTACK.png"),
        frames: 8,
      },
      death: {
        anim: require("@/assets/monsters/Headless_Horseman/DEATH.png"),
        frames: 10,
      },
      hurt: {
        anim: require("@/assets/monsters/Headless_Horseman/HURT.png"),
        frames: 3,
      },
      idle: {
        anim: require("@/assets/monsters/Headless_Horseman/IDLE.png"),
        frames: 4,
      },
      move: {
        anim: require("@/assets/monsters/Headless_Horseman/MOVE.png"),
        frames: 4,
      },
      spawn: null,
    },
    height: 150,
    width: 150,
    displayHeight: 300,
    displayWidth: 300,
  },
  huge_knight: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Huge_Knight/ATTACK.png"),
        frames: 11,
      },
      death: {
        anim: require("@/assets/monsters/Huge_Knight/DEATH.png"),
        frames: 7,
      },
      hurt: {
        anim: require("@/assets/monsters/Huge_Knight/HURT.png"),
        frames: 6,
      },
      idle: {
        anim: require("@/assets/monsters/Huge_Knight/IDLE.png"),
        frames: 8,
      },
      move: {
        anim: require("@/assets/monsters/Huge_Knight/MOVE.png"),
        frames: 8,
      },
      spawn: null,
    },
    height: 187,
    width: 237,
    mirror: true,
    topOffset: 40,
    leftOffset: 40,
    displayHeight: 240,
    displayWidth: 300,
  },
  imp: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Imp/ATTACK.png"),
        frames: 8,
      },
      death: {
        anim: require("@/assets/monsters/Imp/DEATH.png"),
        frames: 7,
      },
      hurt: {
        anim: require("@/assets/monsters/Imp/HURT.png"),
        frames: 3,
      },
      idle: {
        anim: require("@/assets/monsters/Imp/IDLE_MOVE.png"),
        frames: 4,
      },
      move: {
        anim: require("@/assets/monsters/Imp/IDLE_MOVE.png"),
        frames: 4,
      },
      spawn: null,
    },
    height: 100,
    width: 100,
    topOffset: 10,
    displayHeight: 170,
    displayWidth: 170,
    mirror: true,
  },
  kobold: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Kobold/ATTACK_1.png"),
        frames: 5,
      },
      attack_2: {
        anim: require("@/assets/monsters/Kobold/ATTACK_2.png"),
        frames: 5,
      },
      attack_3: {
        anim: require("@/assets/monsters/Kobold/ATTACK_1.png"),
        frames: 6,
      },
      attack_4: {
        anim: require("@/assets/monsters/Kobold/ATTACK_2.png"),
        frames: 12,
      },
      death: {
        anim: require("@/assets/monsters/Kobold/DEATH.png"),
        frames: 7,
      },
      hurt: {
        anim: require("@/assets/monsters/Kobold/HURT.png"),
        frames: 4,
      },
      idle: {
        anim: require("@/assets/monsters/Kobold/IDLE.png"),
        frames: 6,
      },
      move: {
        anim: require("@/assets/monsters/Kobold/MOVE.png"),
        frames: 8,
      },
      spawn: null,
    },
    height: 96,
    width: 148,
    displayHeight: 140,
    displayWidth: 170,
    mirror: true,
  },
  lizardman: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Lizardman/ATTACK.png"),
        frames: 6,
      },
      death: {
        anim: require("@/assets/monsters/Lizardman/DEATH.png"),
        frames: 6,
      },
      hurt: {
        anim: require("@/assets/monsters/Lizardman/HURT.png"),
        frames: 3,
      },
      idle: {
        anim: require("@/assets/monsters/Lizardman/IDLE.png"),
        frames: 3,
      },
      move: {
        anim: require("@/assets/monsters/Lizardman/MOVE.png"),
        frames: 6,
      },
      spawn: null,
    },
    height: 125,
    width: 158,
    displayHeight: 160,
    displayWidth: 190,
    mirror: true,
  },
  medusa: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Medusa/ATTACK_1.png"),
        frames: 6,
      },
      attack_2: {
        anim: require("@/assets/monsters/Medusa/ATTACK_2.png"),
        frames: 7,
      },
      death: {
        anim: require("@/assets/monsters/Medusa/DEATH.png"),
        frames: 6,
      },
      hurt: {
        anim: require("@/assets/monsters/Medusa/HURT.png"),
        frames: 3,
      },
      idle: {
        anim: require("@/assets/monsters/Medusa/IDLE.png"),
        frames: 6,
      },
      move: {
        anim: require("@/assets/monsters/Medusa/MOVE.png"),
        frames: 4,
      },
      spawn: null,
    },
    height: 125,
    width: 150,
    displayHeight: 200,
    displayWidth: 240,
  },
  mimic: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Mimic/ATTACK.png"),
        frames: 6,
      },
      spawn: {
        anim: require("@/assets/monsters/Mimic/APPEAR.png"),
        frames: 9,
      },
      death: {
        anim: require("@/assets/monsters/Mimic/DEATH.png"),
        frames: 18,
      },
      hurt: {
        anim: require("@/assets/monsters/Mimic/HURT.png"),
        frames: 3,
      },
      idle: {
        anim: require("@/assets/monsters/Mimic/IDLE.png"),
        frames: 3,
      },
      move: {
        anim: require("@/assets/monsters/Mimic/MOVE.png"),
        frames: 6,
      },
    },
    height: 125,
    width: 158,
    mirror: true,
    topOffset: 20,
    displayHeight: 200,
    displayWidth: 240,
  },
  minotaur: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Minotaur/ATTACK_1.png"),
        frames: 6,
      },
      attack_2: {
        anim: require("@/assets/monsters/Minotaur/ATTACK_2.png"),
        frames: 7,
      },
      death: {
        anim: require("@/assets/monsters/Minotaur/DEATH.png"),
        frames: 6,
      },
      hurt: {
        anim: require("@/assets/monsters/Minotaur/HURT.png"),
        frames: 5,
      },
      idle: {
        anim: require("@/assets/monsters/Minotaur/IDLE.png"),
        frames: 6,
      },
      move: {
        anim: require("@/assets/monsters/Minotaur/MOVE.png"),
        frames: 8,
      },
      spawn: null,
    },
    height: 128,
    width: 128,
    mirror: true,
    displayHeight: 180,
    displayWidth: 180,
  },
  necromancer: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Necromancer/ATTACK_1.png"),
        frames: 13,
      },
      attack_2: {
        anim: require("@/assets/monsters/Necromancer/ATTACK_2.png"),
        frames: 13,
      },
      attack_3: {
        anim: require("@/assets/monsters/Necromancer/ATTACK_3.png"),
        frames: 17,
      },
      death: {
        anim: require("@/assets/monsters/Necromancer/DEATH.png"),
        frames: 9,
      },
      hurt: {
        anim: require("@/assets/monsters/Necromancer/HURT.png"),
        frames: 5,
      },
      idle: {
        anim: require("@/assets/monsters/Necromancer/IDLE.png"),
        frames: 8,
      },
      move: {
        anim: require("@/assets/monsters/Necromancer/MOVE.png"),
        frames: 8,
      },
      spawn: null,
    },
    height: 128,
    width: 160,
    mirror: true,
    topOffset: -44,
    displayHeight: 500,
    displayWidth: 500,
  },
  npc_man: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/NPC_Man/ATTACK.png"),
        frames: 4,
      },
      death: {
        anim: require("@/assets/monsters/NPC_Man/DEATH.png"),
        frames: 4,
      },
      hurt: {
        anim: require("@/assets/monsters/NPC_Man/HURT.png"),
        frames: 2,
      },
      idle: {
        anim: require("@/assets/monsters/NPC_Man/IDLE.png"),
        frames: 4,
      },
      move: {
        anim: require("@/assets/monsters/NPC_Man/MOVE.png"),
        frames: 6,
      },
      spawn: null,
    },
    height: 48,
    width: 48,
  },
  npc_man_old: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/NPC_Man_Old/ATTACK.png"),
        frames: 4,
      },
      death: {
        anim: require("@/assets/monsters/NPC_Man_Old/DEATH.png"),
        frames: 4,
      },
      hurt: {
        anim: require("@/assets/monsters/NPC_Man_Old/HURT.png"),
        frames: 2,
      },
      idle: {
        anim: require("@/assets/monsters/NPC_Man_Old/IDLE.png"),
        frames: 4,
      },
      move: {
        anim: require("@/assets/monsters/NPC_Man_Old/MOVE.png"),
        frames: 6,
      },
      spawn: null,
    },
    height: 48,
    width: 48,
  },
  npc_woman: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/NPC_Woman/ATTACK.png"),
        frames: 4,
      },
      death: {
        anim: require("@/assets/monsters/NPC_Woman/DEATH.png"),
        frames: 4,
      },
      hurt: {
        anim: require("@/assets/monsters/NPC_Woman/HURT.png"),
        frames: 2,
      },
      idle: {
        anim: require("@/assets/monsters/NPC_Woman/IDLE.png"),
        frames: 4,
      },
      move: {
        anim: require("@/assets/monsters/NPC_Woman/MOVE.png"),
        frames: 6,
      },
      spawn: null,
    },
    height: 48,
    width: 48,
  },
  npc_woman_old: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/NPC_Woman_Old/ATTACK.png"),
        frames: 4,
      },
      death: {
        anim: require("@/assets/monsters/NPC_Woman_Old/DEATH.png"),
        frames: 4,
      },
      hurt: {
        anim: require("@/assets/monsters/NPC_Woman_Old/HURT.png"),
        frames: 2,
      },
      idle: {
        anim: require("@/assets/monsters/NPC_Woman_Old/IDLE.png"),
        frames: 4,
      },
      move: {
        anim: require("@/assets/monsters/NPC_Woman_Old/MOVE.png"),
        frames: 6,
      },
      spawn: null,
    },
    height: 48,
    width: 48,
  },
  orc_masked: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Orc_Masked/ATTACK.png"),
        frames: 6,
      },
      death: {
        anim: require("@/assets/monsters/Orc_Masked/DEATH.png"),
        frames: 10,
      },
      hurt: {
        anim: require("@/assets/monsters/Orc_Masked/HURT.png"),
        frames: 3,
      },
      idle: {
        anim: require("@/assets/monsters/Orc_Masked/IDLE.png"),
        frames: 4,
      },
      move: {
        anim: require("@/assets/monsters/Orc_Masked/MOVE.png"),
        frames: 6,
      },
      spawn: null,
    },
    height: 80,
    width: 150,
    displayHeight: 300,
    displayWidth: 300,
  },
  pyromancer: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Pyromancer/ATTACK.png"),
        frames: 6,
      },
      death: {
        anim: require("@/assets/monsters/Pyromancer/DEATH.png"),
        frames: 10,
      },
      hurt: {
        anim: require("@/assets/monsters/Pyromancer/HURT.png"),
        frames: 3,
      },
      idle: {
        anim: require("@/assets/monsters/Pyromancer/IDLE.png"),
        frames: 4,
      },
      move: {
        anim: require("@/assets/monsters/Pyromancer/MOVE.png"),
        frames: 6,
      },
      spawn: null,
    },
    effects: {
      projectile: require("@/assets/monsters/Pyromancer/Projectile.png"),
    },
    height: 100,
    width: 100,
    mirror: true,
    displayHeight: 170,
    displayWidth: 170,
  },
  rat: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Rat/ATTACK_1.png"),
        frames: 8,
      },
      attack_2: {
        anim: require("@/assets/monsters/Rat/ATTACK_2.png"),
        frames: 8,
      },
      hurt: {
        anim: require("@/assets/monsters/Rat/HURT.png"),
        frames: 5,
      },
      death: {
        anim: require("@/assets/monsters/Rat/DEATH.png"),
        frames: 11,
      },
      idle: {
        anim: require("@/assets/monsters/Rat/IDLE.png"),
        frames: 8,
      },
      move: {
        anim: require("@/assets/monsters/Rat/MOVE.png"),
        frames: 15,
      },
      spawn: null,
    },
    height: 44,
    width: 62,
    mirror: true,
  },
  rat_corrupt: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Rat_Corrupt/ATTACK_1.png"),
        frames: 7,
      },
      attack_2: {
        anim: require("@/assets/monsters/Rat_Corrupt/ATTACK_2.png"),
        frames: 6,
      },
      hurt: {
        anim: require("@/assets/monsters/Rat_Corrupt/HURT.png"),
        frames: 5,
      },
      death: {
        anim: require("@/assets/monsters/Rat_Corrupt/DEATH.png"),
        frames: 11,
      },
      idle: {
        anim: require("@/assets/monsters/Rat_Corrupt/IDLE.png"),
        frames: 6,
      },
      move: {
        anim: require("@/assets/monsters/Rat_Corrupt/MOVE.png"),
        frames: 13,
      },
      spawn: null,
    },
    height: 44,
    width: 62,
    mirror: true,
  },
  rat_putrid: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Rat_Putrid/ATTACK_1.png"),
        frames: 8,
      },
      attack_2: {
        anim: require("@/assets/monsters/Rat_Putrid/ATTACK_2.png"),
        frames: 8,
      },
      hurt: {
        anim: require("@/assets/monsters/Rat_Putrid/HURT.png"),
        frames: 5,
      },
      death: {
        anim: require("@/assets/monsters/Rat_Putrid/DEATH.png"),
        frames: 12,
      },
      idle: {
        anim: require("@/assets/monsters/Rat_Putrid/IDLE.png"),
        frames: 7,
      },
      move: {
        anim: require("@/assets/monsters/Rat_Putrid/MOVE.png"),
        frames: 15,
      },
      spawn: null,
    },
    height: 44,
    width: 62,
    mirror: true,
  },
  reaper: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Reaper/ATTACK_1.png"),
        frames: 5,
      },
      attack_2: {
        anim: require("@/assets/monsters/Reaper/ATTACK_2.png"),
        frames: 7,
      },
      attack_3: {
        anim: require("@/assets/monsters/Reaper/ATTACK_SUMMON.png"),
        frames: 4,
      },
      hurt: {
        anim: require("@/assets/monsters/Reaper/HURT.png"),
        frames: 12,
      },
      death: {
        anim: require("@/assets/monsters/Reaper/DEATH.png"),
        frames: 18,
      },
      dodge: {
        anim: require("@/assets/monsters/Reaper/DODGE.png"),
        frames: 12,
      },
      idle: {
        anim: require("@/assets/monsters/Reaper/IDLE.png"),
        frames: 4,
      },

      spawn: null,
    },
    height: 100,
    width: 100,
    mirror: true,
  },
  reaper_summon: {
    sets: {
      summon_idle: {
        anim: require("@/assets/monsters/Reaper/SUMMON_IDLE.png"),
        frames: 4,
      },
      summon_spawn: {
        anim: require("@/assets/monsters/Reaper/SUMMON_SPAWN.png"),
        frames: 6,
      },
      summon_death: {
        anim: require("@/assets/monsters/Reaper/SUMMON_DEATH.png"),
        frames: 6,
      },
    },
    height: 50,
    width: 50,
    mirror: true,
  },
  samurai_armor: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Samurai_Armor/ATTACK_1.png"),
        frames: 5,
      },
      attack_2: {
        anim: require("@/assets/monsters/Samurai_Armor/ATTACK_2.png"),
        frames: 5,
      },
      attack_3: {
        anim: require("@/assets/monsters/Samurai_Armor/ATTACK_3.png"),
        frames: 10,
      },
      attack_4: {
        anim: require("@/assets/monsters/Samurai_Armor/ATTACK_4.png"),
        frames: 11,
      },
      throw: {
        anim: require("@/assets/monsters/Samurai_Armor/THROW.png"),
        frames: 7,
      },
      hurt: {
        anim: require("@/assets/monsters/Samurai_Armor/HURT.png"),
        frames: 3,
      },
      defence: {
        anim: require("@/assets/monsters/Samurai_Armor/DEFENCE.png"),
        frames: 6,
      },
      death: {
        anim: require("@/assets/monsters/Samurai_Armor/DEATH.png"),
        frames: 10,
      },
      idle: {
        anim: require("@/assets/monsters/Samurai_Armor/IDLE.png"),
        frames: 5,
      },
      move: {
        anim: require("@/assets/monsters/Samurai_Armor/MOVE.png"),
        frames: 7,
      },
      jump: {
        anim: require("@/assets/monsters/Samurai_Armor/JUMP.png"),
        frames: 3,
      },
      spawn: null,
    },
    effects: {
      projectile: require("@/assets/monsters/Samurai_Armor/SHURIKEN.png"),
      dust: require("@/assets/monsters/Samurai_Armor/DUST_EFFECT.png"),
    },
    height: 64,
    width: 96,
    mirror: true,
    displayHeight: 200,
    displayWidth: 240,
  },
  samurai_dual: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Samurai_Dual/ATTACK_1.png"),
        frames: 6,
      },
      attack_2: {
        anim: require("@/assets/monsters/Samurai_Dual/ATTACK_2.png"),
        frames: 5,
      },
      attack_3: {
        anim: require("@/assets/monsters/Samurai_Dual/ATTACK_3.png"),
        frames: 7,
      },
      hurt: {
        anim: require("@/assets/monsters/Samurai_Dual/HURT.png"),
        frames: 4,
      },
      death: {
        anim: require("@/assets/monsters/Samurai_Dual/DEATH.png"),
        frames: 10,
      },
      idle: {
        anim: require("@/assets/monsters/Samurai_Dual/IDLE.png"),
        frames: 5,
      },
      move: {
        anim: require("@/assets/monsters/Samurai_Dual/MOVE.png"),
        frames: 8,
      },
      jump: {
        anim: require("@/assets/monsters/Samurai_Dual/JUMP.png"),
        frames: 3,
      },
      spawn: null,
    },
    height: 64,
    width: 96,
    mirror: true,
    displayHeight: 200,
    displayWidth: 240,
  },
  samurai_female: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Samurai_Female/ATTACK_1.png"),
        frames: 6,
      },
      attack_2: {
        anim: require("@/assets/monsters/Samurai_Female/ATTACK_2.png"),
        frames: 5,
      },
      attack_3: {
        anim: require("@/assets/monsters/Samurai_Female/ATTACK_3.png"),
        frames: 5,
      },
      throw: {
        anim: require("@/assets/monsters/Samurai_Female/THROW.png"),
        frames: 7,
      },
      hurt: {
        anim: require("@/assets/monsters/Samurai_Female/HURT.png"),
        frames: 4,
      },
      death: {
        anim: require("@/assets/monsters/Samurai_Female/DEATH.png"),
        frames: 10,
      },
      idle: {
        anim: require("@/assets/monsters/Samurai_Female/IDLE.png"),
        frames: 5,
      },
      move: {
        anim: require("@/assets/monsters/Samurai_Female/MOVE.png"),
        frames: 8,
      },
      jump: {
        anim: require("@/assets/monsters/Samurai_Female/JUMP.png"),
        frames: 3,
      },
      spawn: null,
    },
    effects: {
      projectile: require("@/assets/monsters/Samurai_Armor/SHURIKEN.png"),
      dust: require("@/assets/monsters/Samurai_Armor/DUST_EFFECT.png"),
    },
    height: 64,
    width: 96,
    mirror: true,
    displayHeight: 200,
    displayWidth: 240,
  },
  samurai_huge: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Samurai_Huge/ATTACK_1.png"),
        frames: 5,
      },
      attack_2: {
        anim: require("@/assets/monsters/Samurai_Huge/ATTACK_2.png"),
        frames: 5,
      },
      attack_3: {
        anim: require("@/assets/monsters/Samurai_Huge/ATTACK_3.png"),
        frames: 7,
      },
      hurt: {
        anim: require("@/assets/monsters/Samurai_Huge/HURT.png"),
        frames: 4,
      },
      death: {
        anim: require("@/assets/monsters/Samurai_Huge/DEATH.png"),
        frames: 9,
      },
      idle: {
        anim: require("@/assets/monsters/Samurai_Huge/IDLE.png"),
        frames: 5,
      },
      move: {
        anim: require("@/assets/monsters/Samurai_Huge/MOVE.png"),
        frames: 8,
      },
      jump: {
        anim: require("@/assets/monsters/Samurai_Huge/JUMP.png"),
        frames: 3,
      },
      spawn: null,
    },
    height: 64,
    width: 98,
    mirror: true,
    topOffset: -20,
    displayHeight: 220,
    displayWidth: 260,
  },
  samurai_old: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Samurai_Old/ATTACK_1.png"),
        frames: 7,
      },
      attack_2: {
        anim: require("@/assets/monsters/Samurai_Old/ATTACK_2.png"),
        frames: 7,
      },
      attack_3: {
        anim: require("@/assets/monsters/Samurai_Old/ATTACK_3.png"),
        frames: 7,
      },
      attack_4: {
        anim: require("@/assets/monsters/Samurai_Old/ATTACK_4.png"),
        frames: 6,
      },
      block: {
        anim: require("@/assets/monsters/Samurai_Old/DEFEND.png"),
        frames: 6,
      },
      heal: {
        anim: require("@/assets/monsters/Samurai_Old/HEALING.png"),
        frames: 15,
      },
      throw: {
        anim: require("@/assets/monsters/Samurai_Old/THROW.png"),
        frames: 7,
      },
      dodge: {
        anim: require("@/assets/monsters/Samurai_Old/DASH.png"),
        frames: 8,
      },
      hurt: {
        anim: require("@/assets/monsters/Samurai_Old/HURT.png"),
        frames: 4,
      },
      death: {
        anim: require("@/assets/monsters/Samurai_Old/DEATH.png"),
        frames: 9,
      },
      idle: {
        anim: require("@/assets/monsters/Samurai_Old/IDLE.png"),
        frames: 10,
      },
      move: {
        anim: require("@/assets/monsters/Samurai_Old/MOVE.png"),
        frames: 16,
      },
      jump: {
        anim: require("@/assets/monsters/Samurai_Old/JUMP.png"),
        frames: 3,
      },
      spawn: null,
    },
    height: 96,
    width: 96,
    mirror: true,
    topOffset: -20,
    displayHeight: 260,
    displayWidth: 260,
  },
  samurai_rice: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Samurai_Rice/ATTACK_1.png"),
        frames: 5,
      },
      attack_2: {
        anim: require("@/assets/monsters/Samurai_Rice/ATTACK_2.png"),
        frames: 9,
      },
      hurt: {
        anim: require("@/assets/monsters/Samurai_Rice/HURT.png"),
        frames: 3,
      },
      death: {
        anim: require("@/assets/monsters/Samurai_Rice/DEATH.png"),
        frames: 10,
      },
      idle: {
        anim: require("@/assets/monsters/Samurai_Rice/IDLE.png"),
        frames: 4,
      },
      move: {
        anim: require("@/assets/monsters/Samurai_Rice/MOVE.png"),
        frames: 8,
      },
      jump: {
        anim: require("@/assets/monsters/Samurai_Rice/JUMP.png"),
        frames: 3,
      },
      spawn: null,
    },
    height: 84,
    width: 106,
    mirror: true,
    topOffset: -20,
    displayHeight: 200,
    displayWidth: 240,
  },
  samurai_wolf: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Samurai_Wolf/ATTACK_1.png"),
        frames: 6,
      },
      attack_2: {
        anim: require("@/assets/monsters/Samurai_Wolf/ATTACK_2.png"),
        frames: 4,
      },
      attack_3: {
        anim: require("@/assets/monsters/Samurai_Wolf/ATTACK_3.png"),
        frames: 6,
      },
      attack_4: {
        anim: require("@/assets/monsters/Samurai_Wolf/ATTACK_4.png"),
        frames: 12,
      },
      hurt: {
        anim: require("@/assets/monsters/Samurai_Wolf/HURT.png"),
        frames: 6,
      },
      death: {
        anim: require("@/assets/monsters/Samurai_Wolf/DEATH.png"),
        frames: 8,
      },
      idle: {
        anim: require("@/assets/monsters/Samurai_Wolf/IDLE.png"),
        frames: 6,
      },
      move: {
        anim: require("@/assets/monsters/Samurai_Wolf/MOVE.png"),
        frames: 6,
      },
      jump: {
        anim: require("@/assets/monsters/Samurai_Wolf/JUMP.png"),
        frames: 3,
      },
      spawn: null,
    },
    height: 64,
    width: 192,
    leftOffset: 20,
    displayHeight: 200,
    displayWidth: 300,
  },
  satyr: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Satyr/ATTACK.png"),
        frames: 6,
      },
      hurt: {
        anim: require("@/assets/monsters/Satyr/HURT.png"),
        frames: 3,
      },
      death: {
        anim: require("@/assets/monsters/Satyr/DEATH.png"),
        frames: 7,
      },
      idle: {
        anim: require("@/assets/monsters/Satyr/IDLE.png"),
        frames: 3,
      },
      move: {
        anim: require("@/assets/monsters/Satyr/MOVE.png"),
        frames: 6,
      },
      spawn: null,
    },
    height: 100,
    width: 125,
    displayHeight: 180,
    displayWidth: 200,
  },
  skeleton: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Skeleton/ATTACK_1.png"),
        frames: 5,
      },
      attack_2: {
        anim: require("@/assets/monsters/Skeleton/ATTACK_2.png"),
        frames: 5,
      },
      hurt: {
        anim: require("@/assets/monsters/Skeleton/HURT.png"),
        frames: 5,
      },
      death: {
        anim: require("@/assets/monsters/Skeleton/DEATH.png"),
        frames: 6,
      },
      idle: {
        anim: require("@/assets/monsters/Skeleton/IDLE.png"),
        frames: 6,
      },
      move: {
        anim: require("@/assets/monsters/Skeleton/MOVE.png"),
        frames: 6,
      },
      spawn: null,
    },
    height: 78,
    width: 89,
  },
  skeleton_warrior: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Skeleton_Warrior/ATTACK_1.png"),
        frames: 7,
      },
      hurt: {
        anim: require("@/assets/monsters/Skeleton_Warrior/HURT.png"),
        frames: 4,
      },
      death: {
        anim: require("@/assets/monsters/Skeleton_Warrior/DEATH.png"),
        frames: 9,
      },
      idle: {
        anim: require("@/assets/monsters/Skeleton_Warrior/IDLE.png"),
        frames: 4,
      },
      move: {
        anim: require("@/assets/monsters/Skeleton_Warrior/MOVE.png"),
        frames: 8,
      },
      block: {
        anim: require("@/assets/monsters/Skeleton_Warrior/BLOCK.png"),
        frames: 5,
      },
      spawn: {
        anim: require("@/assets/monsters/Skeleton_Warrior/SPAWN.png"),
        frames: 9,
      },
    },
    height: 80,
    width: 110,
  },
  skeleton_archer: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Skeleton_Archer/ATTACK_1.png"),
        frames: 9,
      },
      hurt: {
        anim: require("@/assets/monsters/Skeleton_Archer/HURT.png"),
        frames: 4,
      },
      death: {
        anim: require("@/assets/monsters/Skeleton_Archer/DEATH.png"),
        frames: 9,
      },
      idle: {
        anim: require("@/assets/monsters/Skeleton_Archer/IDLE.png"),
        frames: 4,
      },
      move: {
        anim: require("@/assets/monsters/Skeleton_Archer/MOVE.png"),
        frames: 8,
      },
      spawn: null,
    },
    effects: {
      projectile: {
        anim: require("@/assets/monsters/Skeleton_Archer/PROJECTILE.png"),
        frames: 4,
      },
    },
    height: 80,
    width: 110,
  },
  skeleton_mage: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Skeleton_Mage/ATTACK.png"),
        frames: 9,
      },
      hurt: {
        anim: require("@/assets/monsters/Skeleton_Mage/HURT.png"),
        frames: 4,
      },
      death: {
        anim: require("@/assets/monsters/Skeleton_Mage/DEATH.png"),
        frames: 10,
      },
      idle: {
        anim: require("@/assets/monsters/Skeleton_Mage/IDLE.png"),
        frames: 6,
      },
      move: {
        anim: require("@/assets/monsters/Skeleton_Mage/MOVE.png"),
        frames: 6,
      },
      spawn: null,
    },
    effects: {
      projectile: require("@/assets/monsters/Skeleton_Mage/projectile.png"),
    },
    height: 128,
    width: 128,
    topOffset: 20,
    mirror: true,
  },
  spider_dark: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Spider_Dark/ATTACK.png"),
        frames: 6,
      },
      death: {
        anim: require("@/assets/monsters/Spider_Dark/DEATH.png"),
        frames: 6,
      },
      idle: {
        anim: require("@/assets/monsters/Spider_Dark/IDLE.png"),
        frames: 6,
      },
      move: {
        anim: require("@/assets/monsters/Spider_Dark/MOVE.png"),
        frames: 6,
      },
      hurt: null,
      spawn: null,
    },
    height: 64,
    width: 64,
    mirror: true,
  },
  spider_dark_brood: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Spider_Dark_brood/ATTACK.png"),
        frames: 6,
      },
      death: {
        anim: require("@/assets/monsters/Spider_Dark_brood/DEATH.png"),
        frames: 6,
      },
      idle: {
        anim: require("@/assets/monsters/Spider_Dark_brood/IDLE.png"),
        frames: 6,
      },
      move: {
        anim: require("@/assets/monsters/Spider_Dark_brood/MOVE.png"),
        frames: 6,
      },
      hurt: null,
      spawn: null,
    },
    height: 64,
    width: 64,
    mirror: true,
  },
  spider_dark_small: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Spider_Dark_small/ATTACK.png"),
        frames: 6,
      },
      death: {
        anim: require("@/assets/monsters/Spider_Dark_small/DEATH.png"),
        frames: 6,
      },
      idle: {
        anim: require("@/assets/monsters/Spider_Dark_small/IDLE.png"),
        frames: 6,
      },
      move: {
        anim: require("@/assets/monsters/Spider_Dark_small/MOVE.png"),
        frames: 6,
      },
      hurt: null,
      spawn: null,
    },
    height: 64,
    width: 64,
    mirror: true,
  },
  spider_default: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Spider_Default/ATTACK.png"),
        frames: 6,
      },
      death: {
        anim: require("@/assets/monsters/Spider_Default/DEATH.png"),
        frames: 6,
      },
      idle: {
        anim: require("@/assets/monsters/Spider_Default/IDLE.png"),
        frames: 6,
      },
      move: {
        anim: require("@/assets/monsters/Spider_Default/MOVE.png"),
        frames: 6,
      },
      hurt: null,
      spawn: null,
    },
    height: 64,
    width: 64,
    mirror: true,
  },
  spider_default_brood: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Spider_Default_brood/ATTACK.png"),
        frames: 6,
      },
      death: {
        anim: require("@/assets/monsters/Spider_Default_brood/DEATH.png"),
        frames: 6,
      },
      idle: {
        anim: require("@/assets/monsters/Spider_Default_brood/IDLE.png"),
        frames: 6,
      },
      move: {
        anim: require("@/assets/monsters/Spider_Default_brood/MOVE.png"),
        frames: 6,
      },
      hurt: null,
      spawn: null,
    },
    height: 64,
    width: 64,
    mirror: true,
  },
  spider_default_small: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Spider_Default_small/ATTACK.png"),
        frames: 6,
      },
      death: {
        anim: require("@/assets/monsters/Spider_Default_small/DEATH.png"),
        frames: 6,
      },
      idle: {
        anim: require("@/assets/monsters/Spider_Default_small/IDLE.png"),
        frames: 6,
      },
      move: {
        anim: require("@/assets/monsters/Spider_Default_small/MOVE.png"),
        frames: 6,
      },
      hurt: null,
      spawn: null,
    },
    height: 64,
    width: 64,
    mirror: true,
  },
  spider_demon: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Spider_Demon/ATTACK.png"),
        frames: 6,
      },
      death: {
        anim: require("@/assets/monsters/Spider_Demon/DEATH.png"),
        frames: 6,
      },
      idle: {
        anim: require("@/assets/monsters/Spider_Demon/IDLE.png"),
        frames: 6,
      },
      move: {
        anim: require("@/assets/monsters/Spider_Demon/MOVE.png"),
        frames: 6,
      },
      hurt: null,
      spawn: null,
    },
    height: 64,
    width: 64,
    mirror: true,
  },
  spider_demon_brood: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Spider_Demon_brood/ATTACK.png"),
        frames: 6,
      },
      death: {
        anim: require("@/assets/monsters/Spider_Demon_brood/DEATH.png"),
        frames: 6,
      },
      idle: {
        anim: require("@/assets/monsters/Spider_Demon_brood/IDLE.png"),
        frames: 6,
      },
      move: {
        anim: require("@/assets/monsters/Spider_Demon_brood/MOVE.png"),
        frames: 6,
      },
      hurt: null,
      spawn: null,
    },
    height: 64,
    width: 64,
    mirror: true,
  },
  spider_demon_small: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Spider_Demon_small/ATTACK.png"),
        frames: 6,
      },
      death: {
        anim: require("@/assets/monsters/Spider_Demon_small/DEATH.png"),
        frames: 6,
      },
      idle: {
        anim: require("@/assets/monsters/Spider_Demon_small/IDLE.png"),
        frames: 6,
      },
      move: {
        anim: require("@/assets/monsters/Spider_Demon_small/MOVE.png"),
        frames: 6,
      },
      hurt: null,
      spawn: null,
    },
    height: 64,
    width: 64,
    mirror: true,
  },
  spider_wood: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Spider_Wood/ATTACK.png"),
        frames: 6,
      },
      death: {
        anim: require("@/assets/monsters/Spider_Wood/DEATH.png"),
        frames: 6,
      },
      idle: {
        anim: require("@/assets/monsters/Spider_Wood/IDLE.png"),
        frames: 6,
      },
      move: {
        anim: require("@/assets/monsters/Spider_Wood/MOVE.png"),
        frames: 6,
      },
      hurt: null,
      spawn: null,
    },
    height: 64,
    width: 64,
    mirror: true,
  },
  spider_wood_brood: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Spider_Wood_brood/ATTACK.png"),
        frames: 6,
      },
      death: {
        anim: require("@/assets/monsters/Spider_Wood_brood/DEATH.png"),
        frames: 6,
      },
      idle: {
        anim: require("@/assets/monsters/Spider_Wood_brood/IDLE.png"),
        frames: 6,
      },
      move: {
        anim: require("@/assets/monsters/Spider_Wood_brood/MOVE.png"),
        frames: 6,
      },
      hurt: null,
      spawn: null,
    },
    height: 64,
    width: 64,
    mirror: true,
  },
  spider_wood_small: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Spider_Wood_small/ATTACK.png"),
        frames: 6,
      },
      death: {
        anim: require("@/assets/monsters/Spider_Wood_small/DEATH.png"),
        frames: 6,
      },
      idle: {
        anim: require("@/assets/monsters/Spider_Wood_small/IDLE.png"),
        frames: 6,
      },
      move: {
        anim: require("@/assets/monsters/Spider_Wood_small/MOVE.png"),
        frames: 6,
      },
      hurt: null,
      spawn: null,
    },
    height: 64,
    width: 64,
    mirror: true,
  },
  training_dummy: {
    sets: {
      hurt: {
        anim: require("@/assets/monsters/Training_Dummy/HIT.png"),
        frames: 5,
      },
      idle: {
        anim: require("@/assets/monsters/Training_Dummy/IDLE.png"),
        frames: 1,
      },
      spawn: null,
    },
    height: 48,
    width: 48,
  },
  viking_assassin: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Viking_Assassin/ATTACK_1.png"),
        frames: 5,
      },
      attack_2: {
        anim: require("@/assets/monsters/Viking_Assassin/ATTACK_2.png"),
        frames: 5,
      },
      death: {
        anim: require("@/assets/monsters/Viking_Assassin/DEATH.png"),
        frames: 4,
      },
      hurt: {
        anim: require("@/assets/monsters/Viking_Assassin/HURT.png"),
        frames: 3,
      },
      idle: {
        anim: require("@/assets/monsters/Viking_Assassin/IDLE.png"),
        frames: 6,
      },
      move: {
        anim: require("@/assets/monsters/Viking_Assassin/MOVE.png"),
        frames: 6,
      },
      spawn: null,
    },
    height: 65,
    width: 100,
    displayHeight: 240,
    displayWidth: 300,
    mirror: true,
  },
  viking_axe: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Viking_Axe/ATTACK_1.png"),
        frames: 6,
      },
      attack_2: {
        anim: require("@/assets/monsters/Viking_Axe/ATTACK_2.png"),
        frames: 6,
      },
      death: {
        anim: require("@/assets/monsters/Viking_Axe/DEATH.png"),
        frames: 4,
      },
      hurt: {
        anim: require("@/assets/monsters/Viking_Axe/HURT.png"),
        frames: 3,
      },
      idle: {
        anim: require("@/assets/monsters/Viking_Axe/IDLE.png"),
        frames: 6,
      },
      move: {
        anim: require("@/assets/monsters/Viking_Axe/MOVE.png"),
        frames: 6,
      },
      spawn: null,
    },
    height: 65,
    width: 100,
    displayHeight: 240,
    displayWidth: 300,
    mirror: true,
  },
  viking_giant: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Viking_Giant/ATTACK_1.png"),
        frames: 5,
      },
      attack_2: {
        anim: require("@/assets/monsters/Viking_Giant/ATTACK_2.png"),
        frames: 5,
      },
      death: {
        anim: require("@/assets/monsters/Viking_Giant/DEATH.png"),
        frames: 4,
      },
      hurt: {
        anim: require("@/assets/monsters/Viking_Giant/HURT.png"),
        frames: 3,
      },
      idle: {
        anim: require("@/assets/monsters/Viking_Giant/IDLE.png"),
        frames: 2,
      },
      move: {
        anim: require("@/assets/monsters/Viking_Giant/MOVE.png"),
        frames: 6,
      },
      spawn: null,
    },
    height: 80,
    width: 100,
    topOffset: -20,
    displayHeight: 240,
    displayWidth: 300,
    mirror: true,
  },
  viking_spearthrower: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Viking_Spearthrower/ATTACK.png"),
        frames: 5,
      },
      death: {
        anim: require("@/assets/monsters/Viking_Spearthrower/DEATH.png"),
        frames: 4,
      },
      hurt: {
        anim: require("@/assets/monsters/Viking_Spearthrower/HURT.png"),
        frames: 3,
      },
      idle: {
        anim: require("@/assets/monsters/Viking_Spearthrower/IDLE.png"),
        frames: 6,
      },
      move: {
        anim: require("@/assets/monsters/Viking_Spearthrower/MOVE.png"),
        frames: 6,
      },
      spawn: null,
    },
    height: 65,
    width: 100,
    displayHeight: 240,
    displayWidth: 300,
    mirror: true,
  },
  werewolf: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Werewolf/ATTACK_1.png"),
        frames: 7,
      },
      attack_2: {
        anim: require("@/assets/monsters/Werewolf/ATTACK_2.png"),
        frames: 6,
      },
      spawn: {
        anim: require("@/assets/monsters/Werewolf/TRANSFORMATION.png"),
        frames: 8,
      },
      hurt: {
        anim: require("@/assets/monsters/Werewolf/HURT.png"),
        frames: 6,
      },
      death: {
        anim: require("@/assets/monsters/Werewolf/DEATH.png"),
        frames: 10,
      },
      idle: {
        anim: require("@/assets/monsters/Werewolf/IDLE.png"),
        frames: 6,
      },
      move: {
        anim: require("@/assets/monsters/Werewolf/MOVE.png"),
        frames: 6,
      },
    },
    height: 125,
    width: 158,
    displayHeight: 240,
    displayWidth: 260,
    mirror: true,
  },
  witch: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Witch/ATTACK.png"),
        frames: 6,
      },
      hurt: {
        anim: require("@/assets/monsters/Witch/HURT.png"),
        frames: 3,
      },
      death: {
        anim: require("@/assets/monsters/Witch/DEATH.png"),
        frames: 7,
      },
      idle: {
        anim: require("@/assets/monsters/Witch/IDLE.png"),
        frames: 6,
      },
      move: {
        anim: require("@/assets/monsters/Witch/MOVE.png"),
        frames: 6,
      },
      spawn: null,
    },
    height: 125,
    width: 125,
    displayHeight: 180,
    displayWidth: 180,
  },
  wizard_black: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Wizard_Black/ATTACK.png"),
        frames: 6,
      },
      hurt: {
        anim: require("@/assets/monsters/Wizard_Black/HURT.png"),
        frames: 6,
      },
      death: {
        anim: require("@/assets/monsters/Wizard_Black/DEATH.png"),
        frames: 6,
      },
      idle: {
        anim: require("@/assets/monsters/Wizard_Black/IDLE.png"),
        frames: 6,
      },
      move: null,
      spawn: null,
    },
    effects: {
      projectile: {
        anim: require("@/assets/monsters/Wizard_Black/projectile.png"),
        frames: 6,
      },
      splash: {
        anim: require("@/assets/monsters/Wizard_Black/effect.png"),
        frames: 6,
      },
    },
    height: 64,
    width: 64,
    mirror: true,
    displayHeight: 190,
    displayWidth: 190,
  },
  wizard_blackblue: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Wizard_BlackBlue/ATTACK.png"),
        frames: 6,
      },
      hurt: {
        anim: require("@/assets/monsters/Wizard_BlackBlue/HURT.png"),
        frames: 6,
      },
      death: {
        anim: require("@/assets/monsters/Wizard_BlackBlue/DEATH.png"),
        frames: 6,
      },
      idle: {
        anim: require("@/assets/monsters/Wizard_BlackBlue/IDLE.png"),
        frames: 6,
      },
      move: null,
      spawn: null,
    },
    effects: {
      projectile: {
        anim: require("@/assets/monsters/Wizard_BlackBlue/projectile.png"),
        frames: 6,
      },
      splash: {
        anim: require("@/assets/monsters/Wizard_BlackBlue/effect.png"),
        frames: 6,
      },
    },
    height: 64,
    width: 64,
    mirror: true,
    displayHeight: 190,
    displayWidth: 190,
  },
  wizard_blue: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Wizard_Blue/ATTACK.png"),
        frames: 6,
      },
      hurt: {
        anim: require("@/assets/monsters/Wizard_Blue/HURT.png"),
        frames: 6,
      },
      death: {
        anim: require("@/assets/monsters/Wizard_Blue/DEATH.png"),
        frames: 6,
      },
      idle: {
        anim: require("@/assets/monsters/Wizard_Blue/IDLE.png"),
        frames: 6,
      },
      move: null,
      spawn: null,
    },
    effects: {
      projectile: {
        anim: require("@/assets/monsters/Wizard_Blue/projectile.png"),
        frames: 6,
      },
      splash: {
        anim: require("@/assets/monsters/Wizard_Blue/effect.png"),
        frames: 6,
      },
    },
    height: 64,
    width: 64,
    mirror: true,
    displayHeight: 190,
    displayWidth: 190,
  },
  wizard_classic: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Wizard_Classic/ATTACK_1.png"),
        frames: 10,
      },
      attack_2: {
        anim: require("@/assets/monsters/Wizard_Classic/ATTACK_2.png"),
        frames: 9,
      },
      hurt: {
        anim: require("@/assets/monsters/Wizard_Classic/HURT.png"),
        frames: 4,
      },
      death: {
        anim: require("@/assets/monsters/Wizard_Classic/DEATH.png"),
        frames: 6,
      },
      idle: {
        anim: require("@/assets/monsters/Wizard_Classic/IDLE.png"),
        frames: 6,
      },
      move: {
        anim: require("@/assets/monsters/Wizard_Classic/MOVE.png"),
        frames: 4,
      },
      spawn: null,
    },
    height: 78,
    width: 128,
    topOffset: 10,
    displayHeight: 180,
    displayWidth: 230,
  },
  wizard_darkpurple: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Wizard_DarkPurple/ATTACK.png"),
        frames: 6,
      },
      hurt: {
        anim: require("@/assets/monsters/Wizard_DarkPurple/HURT.png"),
        frames: 6,
      },
      death: {
        anim: require("@/assets/monsters/Wizard_DarkPurple/DEATH.png"),
        frames: 6,
      },
      idle: {
        anim: require("@/assets/monsters/Wizard_DarkPurple/IDLE.png"),
        frames: 6,
      },
      move: null,
      spawn: null,
    },
    effects: {
      projectile: {
        anim: require("@/assets/monsters/Wizard_DarkPurple/projectile.png"),
        frames: 6,
      },
      splash: {
        anim: require("@/assets/monsters/Wizard_DarkPurple/effect.png"),
        frames: 6,
      },
    },
    height: 64,
    width: 64,
    mirror: true,
    displayHeight: 190,
    displayWidth: 190,
  },
  wizard_earthen: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Wizard_Earthen/ATTACK.png"),
        frames: 6,
      },
      hurt: {
        anim: require("@/assets/monsters/Wizard_Earthen/HURT.png"),
        frames: 6,
      },
      death: {
        anim: require("@/assets/monsters/Wizard_Earthen/DEATH.png"),
        frames: 6,
      },
      idle: {
        anim: require("@/assets/monsters/Wizard_Earthen/IDLE.png"),
        frames: 6,
      },
      move: null,
      spawn: null,
    },
    effects: {
      projectile: {
        anim: require("@/assets/monsters/Wizard_Earthen/projectile.png"),
        frames: 6,
      },
      splash: {
        anim: require("@/assets/monsters/Wizard_Earthen/effect.png"),
        frames: 6,
      },
    },
    height: 64,
    width: 64,
    mirror: true,
    displayHeight: 190,
    displayWidth: 190,
  },
  wizard_gray: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Wizard_Gray/ATTACK.png"),
        frames: 6,
      },
      hurt: {
        anim: require("@/assets/monsters/Wizard_Gray/HURT.png"),
        frames: 6,
      },
      death: {
        anim: require("@/assets/monsters/Wizard_Gray/DEATH.png"),
        frames: 6,
      },
      idle: {
        anim: require("@/assets/monsters/Wizard_Gray/IDLE.png"),
        frames: 6,
      },
      move: null,
      spawn: null,
    },
    effects: {
      projectile: {
        anim: require("@/assets/monsters/Wizard_Gray/projectile.png"),
        frames: 6,
      },
      splash: {
        anim: require("@/assets/monsters/Wizard_Gray/effect.png"),
        frames: 6,
      },
    },
    height: 64,
    width: 64,
    mirror: true,
    displayHeight: 190,
    displayWidth: 190,
  },
  wizard_green: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Wizard_Green/ATTACK.png"),
        frames: 6,
      },
      hurt: {
        anim: require("@/assets/monsters/Wizard_Green/HURT.png"),
        frames: 6,
      },
      death: {
        anim: require("@/assets/monsters/Wizard_Green/DEATH.png"),
        frames: 6,
      },
      idle: {
        anim: require("@/assets/monsters/Wizard_Green/IDLE.png"),
        frames: 6,
      },
      move: null,
      spawn: null,
    },
    effects: {
      projectile: {
        anim: require("@/assets/monsters/Wizard_Green/projectile.png"),
        frames: 6,
      },
      splash: {
        anim: require("@/assets/monsters/Wizard_Green/effect.png"),
        frames: 6,
      },
    },
    height: 64,
    width: 64,
    mirror: true,
    displayHeight: 190,
    displayWidth: 190,
  },
  wizard_purple: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Wizard_Purple/ATTACK.png"),
        frames: 6,
      },
      hurt: {
        anim: require("@/assets/monsters/Wizard_Purple/HURT.png"),
        frames: 6,
      },
      death: {
        anim: require("@/assets/monsters/Wizard_Purple/DEATH.png"),
        frames: 6,
      },
      idle: {
        anim: require("@/assets/monsters/Wizard_Purple/IDLE.png"),
        frames: 6,
      },
      move: null,
      spawn: null,
    },
    effects: {
      projectile: {
        anim: require("@/assets/monsters/Wizard_Purple/projectile.png"),
        frames: 6,
      },
      splash: {
        anim: require("@/assets/monsters/Wizard_Purple/effect.png"),
        frames: 6,
      },
    },
    height: 64,
    width: 64,
    mirror: true,
    displayHeight: 190,
    displayWidth: 190,
  },
  wizard_redblack: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Wizard_RedBlack/ATTACK.png"),
        frames: 6,
      },
      hurt: {
        anim: require("@/assets/monsters/Wizard_RedBlack/HURT.png"),
        frames: 6,
      },
      death: {
        anim: require("@/assets/monsters/Wizard_RedBlack/DEATH.png"),
        frames: 6,
      },
      idle: {
        anim: require("@/assets/monsters/Wizard_RedBlack/IDLE.png"),
        frames: 6,
      },
      move: null,
      spawn: null,
    },
    effects: {
      projectile: {
        anim: require("@/assets/monsters/Wizard_RedBlack/projectile.png"),
        frames: 6,
      },
      splash: {
        anim: require("@/assets/monsters/Wizard_RedBlack/effect.png"),
        frames: 6,
      },
    },
    height: 64,
    width: 64,
    mirror: true,
    displayHeight: 190,
    displayWidth: 190,
  },
  wizard_yellow: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Wizard_Yellow/ATTACK.png"),
        frames: 6,
      },
      hurt: {
        anim: require("@/assets/monsters/Wizard_Yellow/HURT.png"),
        frames: 6,
      },
      death: {
        anim: require("@/assets/monsters/Wizard_Yellow/DEATH.png"),
        frames: 6,
      },
      idle: {
        anim: require("@/assets/monsters/Wizard_Yellow/IDLE.png"),
        frames: 6,
      },
      move: null,
      spawn: null,
    },
    effects: {
      projectile: {
        anim: require("@/assets/monsters/Wizard_Yellow/projectile.png"),
        frames: 6,
      },
    },
    height: 64,
    width: 64,
    mirror: true,
    displayHeight: 190,
    displayWidth: 190,
  },
  wolf_black: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Wolf_Black/ATTACK_1.png"),
        frames: 7,
      },
      attack_2: {
        anim: require("@/assets/monsters/Wolf_Black/ATTACK_2.png"),
        frames: 7,
      },
      hurt: {
        anim: require("@/assets/monsters/Wolf_Black/HURT.png"),
        frames: 4,
      },
      death: {
        anim: require("@/assets/monsters/Wolf_Black/DEATH.png"),
        frames: 5,
      },
      idle: {
        anim: require("@/assets/monsters/Wolf_Black/IDLE.png"),
        frames: 6,
      },
      move: {
        anim: require("@/assets/monsters/Wolf_Black/MOVE.png"),
        frames: 8,
      },
      spawn: null,
    },
    height: 100,
    width: 100,
    mirror: true,
    displayHeight: 190,
    displayWidth: 190,
  },
  zombie: {
    sets: {
      attack_1: {
        anim: require("@/assets/monsters/Zombie/ATTACK.png"),
        frames: 15,
      },
      hurt: {
        anim: require("@/assets/monsters/Zombie/HURT.png"),
        frames: 5,
      },
      death: {
        anim: require("@/assets/monsters/Zombie/DEATH.png"),
        frames: 8,
      },
      idle: {
        anim: require("@/assets/monsters/Zombie/IDLE.png"),
        frames: 5,
      },
      spawn: {
        anim: require("@/assets/monsters/Zombie/SPAWN.png"),
        frames: 7,
      },
      move: {
        anim: require("@/assets/monsters/Zombie/MOVE.png"),
        frames: 10,
      },
    },

    height: 32,
    width: 32,
    mirror: true,
  },
};
