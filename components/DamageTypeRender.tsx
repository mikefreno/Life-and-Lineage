import { useRootStore } from "@/hooks/stores";
import { DamageType } from "@/utility/types";
import {
  Fire,
  Holy,
  Lightning,
  MagicDamage,
  Pestilence,
  Raw,
  Sword,
  Winter,
} from "@/assets/icons/SVGIcons";
import { observer } from "mobx-react-lite";

export const DamageTypeRender = observer(
  ({ type, large = false }: { type: DamageType; large?: boolean }) => {
    const { uiStore } = useRootStore();

    switch (type) {
      case DamageType.PHYSICAL:
        return (
          <Sword
            height={large ? uiStore.iconSizeLarge : uiStore.iconSizeSmall}
            width={large ? uiStore.iconSizeLarge : uiStore.iconSizeSmall}
          />
        );
      case DamageType.FIRE:
        return (
          <Fire
            height={large ? uiStore.iconSizeLarge : uiStore.iconSizeSmall}
            width={large ? uiStore.iconSizeLarge : uiStore.iconSizeSmall}
          />
        );
      case DamageType.COLD:
        return (
          <Winter
            height={large ? uiStore.iconSizeLarge : uiStore.iconSizeSmall}
            width={large ? uiStore.iconSizeLarge : uiStore.iconSizeSmall}
          />
        );

      case DamageType.LIGHTNING:
        return (
          <Lightning
            height={large ? uiStore.iconSizeLarge : uiStore.iconSizeSmall}
            width={large ? uiStore.iconSizeLarge : uiStore.iconSizeSmall}
          />
        );

      case DamageType.POISON:
        return (
          <Pestilence
            height={large ? uiStore.iconSizeLarge : uiStore.iconSizeSmall}
            width={large ? uiStore.iconSizeLarge : uiStore.iconSizeSmall}
          />
        );
      case DamageType.HOLY:
        return (
          <Holy
            height={large ? uiStore.iconSizeLarge : uiStore.iconSizeSmall}
            width={large ? uiStore.iconSizeLarge : uiStore.iconSizeSmall}
          />
        );

      case DamageType.MAGIC:
        return (
          <MagicDamage
            height={large ? uiStore.iconSizeLarge : uiStore.iconSizeSmall}
            width={large ? uiStore.iconSizeLarge : uiStore.iconSizeSmall}
          />
        );

      case DamageType.RAW:
        return (
          <Raw
            height={large ? uiStore.iconSizeLarge : uiStore.iconSizeSmall}
            width={large ? uiStore.iconSizeLarge : uiStore.iconSizeSmall}
          />
        );
    }
  },
);
