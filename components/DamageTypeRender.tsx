import { useRootStore } from "@/hooks/stores";
import { DamageType } from "@/utility/types";
import {
  Fire,
  Holy,
  Lightning,
  Pestilence,
  Raw,
  Regen,
  Sword,
  Winter,
} from "@/assets/icons/SVGIcons";

export const DamageTypeRender = ({ type }: { type: DamageType }) => {
  const { uiStore } = useRootStore();

  switch (type) {
    case DamageType.PHYSICAL:
      return (
        <Sword height={uiStore.iconSizeSmall} width={uiStore.iconSizeSmall} />
      );
    case DamageType.FIRE:
      return (
        <Fire height={uiStore.iconSizeSmall} width={uiStore.iconSizeSmall} />
      );
    case DamageType.COLD:
      return (
        <Winter height={uiStore.iconSizeSmall} width={uiStore.iconSizeSmall} />
      );

    case DamageType.LIGHTNING:
      return (
        <Lightning
          height={uiStore.iconSizeSmall}
          width={uiStore.iconSizeSmall}
        />
      );

    case DamageType.POISON:
      return (
        <Pestilence
          height={uiStore.iconSizeSmall}
          width={uiStore.iconSizeSmall}
        />
      );
    case DamageType.HOLY:
      return (
        <Holy height={uiStore.iconSizeSmall} width={uiStore.iconSizeSmall} />
      );

    case DamageType.MAGIC:
      //TODO: Replace this with new icon
      return (
        <Regen height={uiStore.iconSizeSmall} width={uiStore.iconSizeSmall} />
      );

    case DamageType.RAW:
      return (
        <Raw height={uiStore.iconSizeSmall} width={uiStore.iconSizeSmall} />
      );
  }
};
