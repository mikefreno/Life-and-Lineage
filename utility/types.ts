type AttackEffect = {
  name: string;
  targets: string;
  hitChance: number;
  damageMult: number;
  sanityDamage: number;
};

type AttackObjectWithoutEffect = AttackEffect & {
  secondaryEffect: null;
  secondaryEffectChance: null;
};

type AttackObjectWithEffect = AttackEffect & {
  secondaryEffect: string[];
  secondaryEffectChance: number[];
};

export type AttackObject = AttackObjectWithoutEffect | AttackObjectWithEffect;
