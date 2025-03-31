export type PlayerVFXImageOptions = keyof typeof PlayerVFXImageMap;

export const PlayerVFXImageMap = {
  fireMissile: {
    source: require("@/assets/vfx/fire/missile.webp"),
    height: 33,
    width: 57,
  },
  fireSlash: {
    source: require("@/assets/vfx/fire/FireSlash.webp"),
    height: 96,
    width: 95,
  },
  flameDust: {
    source: require("@/assets/vfx/fire/flame-and-dust.webp"),
    height: 75,
    width: 47,
  },
  flameWall: {
    source: require("@/assets/vfx/fire/wall-burst.webp"),
    height: 64,
    width: 48,
  },
  fireRain: {
    source: require("@/assets/vfx/fire/fire-rain.webp"),
    height: 64,
    width: 48,
  },
  dragonBreath: {
    source: require("@/assets/vfx/fire/Dragon-Breath.webp"),
    height: 176,
    width: 256,
  },
  fireBeam: {
    source: require("@/assets/vfx/fire/beam.webp"),
    height: 64,
    width: 192,
  },
  // ice/water spells
  iceBlock: {
    source: require("@/assets/vfx/ice/floating-block.webp"),
    height: 96,
    width: 80,
  },
  splash: {
    source: require("@/assets/vfx/water/splash.webp"),
    height: 64,
    width: 64,
  },
  coldSmoke: {
    source: require("@/assets/vfx/ice/cold-smoke.webp"),
    height: 64,
    width: 70,
  },
  longSteam: {
    source: require("@/assets/vfx/water/long-steam.webp"),
    height: 178,
    width: 314,
  },
  steam: {
    source: require("@/assets/vfx/water/steam.webp"),
    height: 70,
    width: 64,
    rotate: 45,
  },
  rainCall: {
    source: require("@/assets/vfx/water/rain-call.webp"),
    height: 48,
    width: 48,
  },
  iceSpike: {
    source: require("@/assets/vfx/ice/spike.webp"),
    height: 111,
    width: 111,
  },
  iceOrb: {
    source: require("@/assets/vfx/ice/orb.webp"),
    height: 48,
    width: 48,
  },
  torrent: {
    source: require("@/assets/vfx/water/torrent.webp"),
    height: 192,
    width: 64,
  },
  massSpikes: {
    source: require("@/assets/vfx/ice/massive-spikes.webp"),
    height: 64,
    width: 48,
  },
  ambiguousSparks: {
    source: require("@/assets/vfx/lightning/ambiguous-sparks.webp"),
    height: 48,
    width: 48,
  },
  // air/lightning spells
  puft: {
    source: require("@/assets/vfx/air/puft.webp"),
    height: 32,
    width: 32,
  },
  sparks: {
    source: require("@/assets/vfx/lightning/spark.webp"),
    height: 64,
    width: 64,
  },
  lightning: {
    source: require("@/assets/vfx/lightning/lightning-bolt.webp"),
    height: 159,
    width: 111,
  },
  thunderClap: {
    source: require("@/assets/vfx/lightning/clap.webp"),
    height: 48,
    width: 48,
  },
  lightningRay: {
    source: require("@/assets/vfx/lightning/long-bolt.webp"),
    height: 48,
    width: 144,
  },
  windBlades: {
    source: require("@/assets/vfx/air/blades.webp"),
    height: 64,
    width: 64,
  },
  groundSlash: {
    source: require("@/assets/vfx/air/ground-slash.webp"),
    height: 64,
    width: 80,
  },
  tornado: {
    source: require("@/assets/vfx/air/tornado.webp"),
    height: 143,
    width: 128,
  },
  suffocate: {
    source: require("@/assets/vfx/air/suffocate.webp"),
    height: 16,
    width: 16,
  },
  //rock spells
  rockDrop: {
    source: require("@/assets/vfx/earth/rock-drop.webp"),
    height: 160,
    width: 96,
  },
  rocksDropper: {
    source: require("@/assets/vfx/earth/rocks-dropper.webp"),
    height: 176,
    width: 192,
  },
  rockCollider: {
    source: require("@/assets/vfx/earth/rock-collider.webp"),
    height: 80,
    width: 192,
  },
  rockProjectile: {
    source: require("@/assets/vfx/earth/projectile.webp"),
    height: 80,
    width: 192,
  },
  fallingSpikes: {
    source: require("@/assets/vfx/earth/falling-spikes.webp"),
    height: 80,
    width: 192,
  },
  rockWall: {
    source: require("@/assets/vfx/earth/wall.webp"),
    height: 48,
    width: 48,
  },
  // ----------------- NECROMANCER ---------------- //
  // blood spells
  bloodCone: {
    source: require("@/assets/vfx/blood/blood-cone.webp"),
    height: 48,
    width: 48,
    mirror: true,
  },
  bloodBurst: {
    source: require("@/assets/vfx/blood/blood-burst.webp"),
    height: 60,
    width: 60,
  },
  bloodLongBolts: {
    source: require("@/assets/vfx/blood/long-bolt.webp"),
    height: 111,
    width: 144,
  },
  bloodSimpleBolts: {
    source: require("@/assets/vfx/blood/simple-bolts.webp"),
    height: 60,
    width: 60,
    rotate: -90,
  },
  bloodSpikes: {
    source: require("@/assets/vfx/blood/blood-spikes.webp"),
    height: 64,
    width: 48,
  },
  bloodRain: {
    source: require("@/assets/vfx/blood/blood-rain.webp"),
    height: 64,
    width: 48,
  },
  // poison
  poisonOrbBurst: {
    source: require("@/assets/vfx/poison/orb-burst.webp"),
    height: 32,
    width: 32,
  },
  poisonSmallBurst: {
    source: require("@/assets/vfx/poison/burst.webp"),
    height: 48,
    width: 48,
  },
  poisonLargeBurst: {
    source: require("@/assets/vfx/poison/orb-burst.webp"),
    height: 80,
    width: 128,
  },
  poisonStream: {
    source: require("@/assets/vfx/poison/stream.webp"),
    height: 32,
    width: 56,
  },
  poisonPuft: {
    source: require("@/assets/vfx/poison/side-puft.webp"),
    height: 32,
    width: 32,
  },
  poisonDart: {
    source: require("@/assets/vfx/poison/dart.webp"),
    height: 32,
    width: 32,
  },
  poisonShield: {
    source: require("@/assets/vfx/poison/shield.webp"),
    height: 48,
    width: 48,
  },
  // bone
  boneLance: {
    source: require("@/assets/vfx/bone/lance.webp"),
    height: 32,
    width: 48,
  },
  boneOrb: {
    source: require("@/assets/vfx/bone/orb.webp"),
    height: 32,
    width: 32,
  },
  boneShield: {
    source: require("@/assets/vfx/bone/shield.webp"),
    height: 48,
    width: 48,
  },
  teeth: {
    source: require("@/assets/vfx/bone/teeth.webp"),
    height: 48,
    width: 48,
  },
  boneWall: {
    source: require("@/assets/vfx/bone/wall.webp"),
    height: 48,
    width: 48,
  },
  boneBlade: {
    source: require("@/assets/vfx/bone/blade.webp"),
    height: 56,
    width: 48,
  },
  // ----------------- PALADIN ---------------- //
  holyBeam: {
    source: require("@/assets/vfx/holy/beam.webp"),
    height: 48,
    width: 48,
  },
  holySword: {
    source: require("@/assets/vfx/holy/holy-sword.webp"),
    height: 80,
    width: 64,
  },
  holyOrb: {
    source: require("@/assets/vfx/holy/orb.webp"),
    height: 80,
    width: 64,
  },
  holyShield: {
    source: require("@/assets/vfx/holy/shield.webp"),
    height: 80,
    width: 64,
  },
  holyStar: {
    source: require("@/assets/vfx/holy/throwing-star.webp"),
    height: 80,
    width: 64,
  },
  holyArc: {
    source: require("@/assets/vfx/holy/arc-spark.webp"),
    height: 32,
    width: 32,
  },
  corruptSword: {
    source: require("@/assets/vfx/holy/corrupt-blade.webp"),
    height: 64,
    width: 64,
  },
  crossedSwords: {
    source: require("@/assets/vfx/holy/cross-swords.webp"),
    height: 64,
    width: 64,
  },
  holyDart: {
    source: require("@/assets/vfx/holy/dart.webp"),
    height: 32,
    width: 32,
  },
  holyShred: {
    source: require("@/assets/vfx/holy/diamond-shred.webp"),
    height: 32,
    width: 32,
  },
  holyTrails: {
    source: require("@/assets/vfx/holy/fire-trails.webp"),
    height: 64,
    width: 64,
  },
  holyFist: {
    source: require("@/assets/vfx/holy/fist.webp"),
    height: 64,
    width: 48,
  },
  glowingBlade: {
    source: require("@/assets/vfx/holy/glowing-blade.webp"),
    height: 64,
    width: 48,
  },
  holySwirl: {
    source: require("@/assets/vfx/holy/glowing-blade.webp"),
    height: 16,
    width: 16,
  },
  vortexSparks: {
    source: require("@/assets/vfx/holy/vortex-sparks.webp"),
    height: 16,
    width: 16,
  },
  goldenHeal: {
    source: require("@/assets/vfx/holy/golden-heal.webp"),
    height: 64,
    width: 48,
  },
  // ----------------- RANGER ---------------- //
  moonCall: {
    source: require("@/assets/vfx/arcane/moon-call.webp"),
    height: 64,
    width: 48,
  },
  risingBlue: {
    source: require("@/assets/vfx/arcane/rising-blue.webp"),
    height: 64,
    width: 48,
  },
  swirl: {
    source: require("@/assets/vfx/arcane/swirl.webp"),
    height: 64,
    width: 48,
  },
  arcaneArrow: {
    source: require("@/assets/vfx/arcane/arrow.webp"),
    height: 30,
    width: 30,
  },
  blueBeam: {
    source: require("@/assets/vfx/arcane/blue-beam.webp"),
    height: 48,
    width: 48,
  },
  arrowTorrent: {
    source: require("@/assets/vfx/arcane/torrent.webp"),
    height: 192,
    width: 64,
  },
  // --------------------- NON SPELLS ----------------------- //
  arrow: {
    source: require("@/assets/vfx/physical/arrow.webp"),
    height: 30,
    width: 30,
  },
  projectileHit: {
    source: require("@/assets/vfx/physical/projectile-hit.webp"),
    height: 48,
    width: 48,
  },
  chainedArrowHit: {
    source: require("@/assets/vfx/physical/chained-arrow-hit.webp"),
    height: 30,
    width: 30,
  },
  chainedPoisonArrowHit: {
    source: require("@/assets/vfx/physical/poison-arrow-hit.webp"),
    height: 30,
    width: 30,
  },
  chainedArrowRooting: {
    source: require("@/assets/vfx/physical/chained-rooting.webp"),
    height: 30,
    width: 30,
  },
  slashHit: {
    source: require("@/assets/vfx/physical/slash-hit.webp"),
    height: 32,
    width: 32,
  },
  smallCross: {
    source: require("@/assets/vfx/physical/small-cross.webp"),
    height: 32,
    width: 32,
  },
  slashHorizontal: {
    source: require("@/assets/vfx/physical/slash-horizontal.webp"),
    height: 48,
    width: 95,
  },
  slash: {
    source: require("@/assets/vfx/physical/slash.webp"),
    height: 96,
    width: 95,
  },
  largeCross: {
    source: require("@/assets/vfx/physical/large-cross.webp"),
    height: 48,
    width: 48,
  },
  crowning: {
    source: require("@/assets/vfx/physical/crowning.webp"),
    height: 34,
    width: 35,
  },
  bloodSplash: {
    source: require("@/assets/vfx/blood/blood-small.webp"),
    height: 20,
    width: 20,
  },
  shuriken: {
    source: require("@/assets/vfx/physical/shuriken.webp"),
    height: 8,
    width: 8,
  },
  smoke: {
    source: require("@/assets/vfx/physical/smoke.webp"),
    height: 64,
    width: 70,
  },
  poisonSmallCross: {
    source: require("@/assets/vfx/poison/small-cross.webp"),
    height: 64,
    width: 70,
  },
  desaturatedCrossSwords: {
    source: require("@/assets/vfx/misc/desaturated-cross-swords.webp"),
    height: 64,
    width: 64,
  },
  crossAndBleed: {
    source: require("@/assets/vfx/physical/cross-and-blood.webp"),
    height: 32,
    width: 32,
  },
  largeCrossAndBleed: {
    source: require("@/assets/vfx/physical/large-cross-and-bleed.webp"),
    height: 48,
    width: 48,
  },
  slashAndDust: {
    source: require("@/assets/vfx/physical/slash-and-dust.webp"),
    height: 96,
    width: 95,
  },
};
