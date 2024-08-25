import * as $protobuf from "protobufjs";
import Long = require("long");
/** Properties of an AllocatedSkillPoints. */
export interface IAllocatedSkillPoints {

    /** AllocatedSkillPoints attackPower */
    attackPower?: (number|null);

    /** AllocatedSkillPoints health */
    health?: (number|null);

    /** AllocatedSkillPoints mana */
    mana?: (number|null);

    /** AllocatedSkillPoints sanity */
    sanity?: (number|null);
}

/** Represents an AllocatedSkillPoints. */
export class AllocatedSkillPoints implements IAllocatedSkillPoints {

    /**
     * Constructs a new AllocatedSkillPoints.
     * @param [properties] Properties to set
     */
    constructor(properties?: IAllocatedSkillPoints);

    /** AllocatedSkillPoints attackPower. */
    public attackPower: number;

    /** AllocatedSkillPoints health. */
    public health: number;

    /** AllocatedSkillPoints mana. */
    public mana: number;

    /** AllocatedSkillPoints sanity. */
    public sanity: number;

    /**
     * Creates a new AllocatedSkillPoints instance using the specified properties.
     * @param [properties] Properties to set
     * @returns AllocatedSkillPoints instance
     */
    public static create(properties?: IAllocatedSkillPoints): AllocatedSkillPoints;

    /**
     * Encodes the specified AllocatedSkillPoints message. Does not implicitly {@link AllocatedSkillPoints.verify|verify} messages.
     * @param message AllocatedSkillPoints message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IAllocatedSkillPoints, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified AllocatedSkillPoints message, length delimited. Does not implicitly {@link AllocatedSkillPoints.verify|verify} messages.
     * @param message AllocatedSkillPoints message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IAllocatedSkillPoints, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes an AllocatedSkillPoints message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns AllocatedSkillPoints
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): AllocatedSkillPoints;

    /**
     * Decodes an AllocatedSkillPoints message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns AllocatedSkillPoints
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): AllocatedSkillPoints;

    /**
     * Verifies an AllocatedSkillPoints message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates an AllocatedSkillPoints message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns AllocatedSkillPoints
     */
    public static fromObject(object: { [k: string]: any }): AllocatedSkillPoints;

    /**
     * Creates a plain object from an AllocatedSkillPoints message. Also converts values to other types if specified.
     * @param message AllocatedSkillPoints
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: AllocatedSkillPoints, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this AllocatedSkillPoints to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for AllocatedSkillPoints
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Properties of a BoundingBox. */
export interface IBoundingBox {

    /** BoundingBox height */
    height?: (number|null);

    /** BoundingBox offsetX */
    offsetX?: (number|null);

    /** BoundingBox offsetY */
    offsetY?: (number|null);

    /** BoundingBox width */
    width?: (number|null);
}

/** Represents a BoundingBox. */
export class BoundingBox implements IBoundingBox {

    /**
     * Constructs a new BoundingBox.
     * @param [properties] Properties to set
     */
    constructor(properties?: IBoundingBox);

    /** BoundingBox height. */
    public height: number;

    /** BoundingBox offsetX. */
    public offsetX: number;

    /** BoundingBox offsetY. */
    public offsetY: number;

    /** BoundingBox width. */
    public width: number;

    /**
     * Creates a new BoundingBox instance using the specified properties.
     * @param [properties] Properties to set
     * @returns BoundingBox instance
     */
    public static create(properties?: IBoundingBox): BoundingBox;

    /**
     * Encodes the specified BoundingBox message. Does not implicitly {@link BoundingBox.verify|verify} messages.
     * @param message BoundingBox message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IBoundingBox, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified BoundingBox message, length delimited. Does not implicitly {@link BoundingBox.verify|verify} messages.
     * @param message BoundingBox message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IBoundingBox, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a BoundingBox message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns BoundingBox
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): BoundingBox;

    /**
     * Decodes a BoundingBox message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns BoundingBox
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): BoundingBox;

    /**
     * Verifies a BoundingBox message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a BoundingBox message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns BoundingBox
     */
    public static fromObject(object: { [k: string]: any }): BoundingBox;

    /**
     * Creates a plain object from a BoundingBox message. Also converts values to other types if specified.
     * @param message BoundingBox
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: BoundingBox, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this BoundingBox to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for BoundingBox
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Properties of a Character. */
export interface ICharacter {

    /** Character affection */
    affection?: (number|null);

    /** Character alive */
    alive?: (boolean|null);

    /** Character beingType */
    beingType?: (string|null);

    /** Character birthdate */
    birthdate?: (string|null);

    /** Character dateCooldownStart */
    dateCooldownStart?: (string|null);

    /** Character deathdate */
    deathdate?: (string|null);

    /** Character firstName */
    firstName?: (string|null);

    /** Character id */
    id?: (string|null);

    /** Character isPlayerPartner */
    isPlayerPartner?: (boolean|null);

    /** Character job */
    job?: (string|null);

    /** Character lastName */
    lastName?: (string|null);

    /** Character qualifications */
    qualifications?: (string[]|null);

    /** Character sex */
    sex?: (string|null);
}

/** Represents a Character. */
export class Character implements ICharacter {

    /**
     * Constructs a new Character.
     * @param [properties] Properties to set
     */
    constructor(properties?: ICharacter);

    /** Character affection. */
    public affection: number;

    /** Character alive. */
    public alive: boolean;

    /** Character beingType. */
    public beingType: string;

    /** Character birthdate. */
    public birthdate: string;

    /** Character dateCooldownStart. */
    public dateCooldownStart: string;

    /** Character deathdate. */
    public deathdate: string;

    /** Character firstName. */
    public firstName: string;

    /** Character id. */
    public id: string;

    /** Character isPlayerPartner. */
    public isPlayerPartner: boolean;

    /** Character job. */
    public job: string;

    /** Character lastName. */
    public lastName: string;

    /** Character qualifications. */
    public qualifications: string[];

    /** Character sex. */
    public sex: string;

    /**
     * Creates a new Character instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Character instance
     */
    public static create(properties?: ICharacter): Character;

    /**
     * Encodes the specified Character message. Does not implicitly {@link Character.verify|verify} messages.
     * @param message Character message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: ICharacter, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Character message, length delimited. Does not implicitly {@link Character.verify|verify} messages.
     * @param message Character message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: ICharacter, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a Character message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Character
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): Character;

    /**
     * Decodes a Character message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Character
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): Character;

    /**
     * Verifies a Character message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a Character message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Character
     */
    public static fromObject(object: { [k: string]: any }): Character;

    /**
     * Creates a plain object from a Character message. Also converts values to other types if specified.
     * @param message Character
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: Character, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this Character to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for Character
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Properties of a Condition. */
export interface ICondition {

    /** Condition aura */
    aura?: (boolean|null);

    /** Condition effect */
    effect?: (string[]|null);

    /** Condition effectMagnitude */
    effectMagnitude?: (number[]|null);

    /** Condition effectStyle */
    effectStyle?: (string[]|null);

    /** Condition healthDamage */
    healthDamage?: (number[]|null);

    /** Condition icon */
    icon?: (string|null);

    /** Condition id */
    id?: (string|null);

    /** Condition name */
    name?: (string|null);

    /** Condition placedBy */
    placedBy?: (string|null);

    /** Condition sanityDamage */
    sanityDamage?: (number[]|null);

    /** Condition style */
    style?: (string|null);

    /** Condition turns */
    turns?: (number|null);
}

/** Represents a Condition. */
export class Condition implements ICondition {

    /**
     * Constructs a new Condition.
     * @param [properties] Properties to set
     */
    constructor(properties?: ICondition);

    /** Condition aura. */
    public aura: boolean;

    /** Condition effect. */
    public effect: string[];

    /** Condition effectMagnitude. */
    public effectMagnitude: number[];

    /** Condition effectStyle. */
    public effectStyle: string[];

    /** Condition healthDamage. */
    public healthDamage: number[];

    /** Condition icon. */
    public icon: string;

    /** Condition id. */
    public id: string;

    /** Condition name. */
    public name: string;

    /** Condition placedBy. */
    public placedBy: string;

    /** Condition sanityDamage. */
    public sanityDamage: number[];

    /** Condition style. */
    public style: string;

    /** Condition turns. */
    public turns: number;

    /**
     * Creates a new Condition instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Condition instance
     */
    public static create(properties?: ICondition): Condition;

    /**
     * Encodes the specified Condition message. Does not implicitly {@link Condition.verify|verify} messages.
     * @param message Condition message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: ICondition, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Condition message, length delimited. Does not implicitly {@link Condition.verify|verify} messages.
     * @param message Condition message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: ICondition, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a Condition message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Condition
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): Condition;

    /**
     * Decodes a Condition message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Condition
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): Condition;

    /**
     * Verifies a Condition message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a Condition message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Condition
     */
    public static fromObject(object: { [k: string]: any }): Condition;

    /**
     * Creates a plain object from a Condition message. Also converts values to other types if specified.
     * @param message Condition
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: Condition, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this Condition to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for Condition
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Properties of a Creature. */
export interface ICreature {

    /** Creature attackPower */
    attackPower?: (number|null);

    /** Creature baseArmor */
    baseArmor?: (number|null);

    /** Creature beingType */
    beingType?: (string|null);

    /** Creature conditions */
    conditions?: (ICondition[]|null);

    /** Creature creatureSpecies */
    creatureSpecies?: (string|null);

    /** Creature energy */
    energy?: (number|null);

    /** Creature energyMax */
    energyMax?: (number|null);

    /** Creature energyRegen */
    energyRegen?: (number|null);

    /** Creature health */
    health?: (number|null);

    /** Creature healthMax */
    healthMax?: (number|null);

    /** Creature id */
    id?: (string|null);

    /** Creature sanity */
    sanity?: (number|null);

    /** Creature sanityMax */
    sanityMax?: (number|null);

    /** Creature attacks */
    attacks?: (string[]|null);
}

/** Represents a Creature. */
export class Creature implements ICreature {

    /**
     * Constructs a new Creature.
     * @param [properties] Properties to set
     */
    constructor(properties?: ICreature);

    /** Creature attackPower. */
    public attackPower: number;

    /** Creature baseArmor. */
    public baseArmor: number;

    /** Creature beingType. */
    public beingType: string;

    /** Creature conditions. */
    public conditions: ICondition[];

    /** Creature creatureSpecies. */
    public creatureSpecies: string;

    /** Creature energy. */
    public energy: number;

    /** Creature energyMax. */
    public energyMax: number;

    /** Creature energyRegen. */
    public energyRegen: number;

    /** Creature health. */
    public health: number;

    /** Creature healthMax. */
    public healthMax: number;

    /** Creature id. */
    public id: string;

    /** Creature sanity. */
    public sanity: number;

    /** Creature sanityMax. */
    public sanityMax: number;

    /** Creature attacks. */
    public attacks: string[];

    /**
     * Creates a new Creature instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Creature instance
     */
    public static create(properties?: ICreature): Creature;

    /**
     * Encodes the specified Creature message. Does not implicitly {@link Creature.verify|verify} messages.
     * @param message Creature message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: ICreature, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Creature message, length delimited. Does not implicitly {@link Creature.verify|verify} messages.
     * @param message Creature message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: ICreature, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a Creature message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Creature
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): Creature;

    /**
     * Decodes a Creature message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Creature
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): Creature;

    /**
     * Verifies a Creature message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a Creature message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Creature
     */
    public static fromObject(object: { [k: string]: any }): Creature;

    /**
     * Creates a plain object from a Creature message. Also converts values to other types if specified.
     * @param message Creature
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: Creature, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this Creature to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for Creature
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Properties of a CurrentDungeon. */
export interface ICurrentDungeon {

    /** CurrentDungeon currentPosition */
    currentPosition?: (ITile|null);

    /** CurrentDungeon dungeonMap */
    dungeonMap?: (ITile[]|null);

    /** CurrentDungeon enemy */
    enemy?: (IEnemy|null);

    /** CurrentDungeon fightingBoss */
    fightingBoss?: (boolean|null);

    /** CurrentDungeon instance */
    instance?: (string|null);

    /** CurrentDungeon level */
    level?: (string|null);

    /** CurrentDungeon mapDimensions */
    mapDimensions?: (IBoundingBox|null);
}

/** Represents a CurrentDungeon. */
export class CurrentDungeon implements ICurrentDungeon {

    /**
     * Constructs a new CurrentDungeon.
     * @param [properties] Properties to set
     */
    constructor(properties?: ICurrentDungeon);

    /** CurrentDungeon currentPosition. */
    public currentPosition?: (ITile|null);

    /** CurrentDungeon dungeonMap. */
    public dungeonMap: ITile[];

    /** CurrentDungeon enemy. */
    public enemy?: (IEnemy|null);

    /** CurrentDungeon fightingBoss. */
    public fightingBoss: boolean;

    /** CurrentDungeon instance. */
    public instance: string;

    /** CurrentDungeon level. */
    public level: string;

    /** CurrentDungeon mapDimensions. */
    public mapDimensions?: (IBoundingBox|null);

    /**
     * Creates a new CurrentDungeon instance using the specified properties.
     * @param [properties] Properties to set
     * @returns CurrentDungeon instance
     */
    public static create(properties?: ICurrentDungeon): CurrentDungeon;

    /**
     * Encodes the specified CurrentDungeon message. Does not implicitly {@link CurrentDungeon.verify|verify} messages.
     * @param message CurrentDungeon message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: ICurrentDungeon, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified CurrentDungeon message, length delimited. Does not implicitly {@link CurrentDungeon.verify|verify} messages.
     * @param message CurrentDungeon message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: ICurrentDungeon, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a CurrentDungeon message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns CurrentDungeon
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): CurrentDungeon;

    /**
     * Decodes a CurrentDungeon message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns CurrentDungeon
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): CurrentDungeon;

    /**
     * Verifies a CurrentDungeon message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a CurrentDungeon message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns CurrentDungeon
     */
    public static fromObject(object: { [k: string]: any }): CurrentDungeon;

    /**
     * Creates a plain object from a CurrentDungeon message. Also converts values to other types if specified.
     * @param message CurrentDungeon
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: CurrentDungeon, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this CurrentDungeon to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for CurrentDungeon
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Properties of a DungeonInstance. */
export interface IDungeonInstance {

    /** DungeonInstance levels */
    levels?: (IDungeonLevel[]|null);

    /** DungeonInstance name */
    name?: (string|null);
}

/** Represents a DungeonInstance. */
export class DungeonInstance implements IDungeonInstance {

    /**
     * Constructs a new DungeonInstance.
     * @param [properties] Properties to set
     */
    constructor(properties?: IDungeonInstance);

    /** DungeonInstance levels. */
    public levels: IDungeonLevel[];

    /** DungeonInstance name. */
    public name: string;

    /**
     * Creates a new DungeonInstance instance using the specified properties.
     * @param [properties] Properties to set
     * @returns DungeonInstance instance
     */
    public static create(properties?: IDungeonInstance): DungeonInstance;

    /**
     * Encodes the specified DungeonInstance message. Does not implicitly {@link DungeonInstance.verify|verify} messages.
     * @param message DungeonInstance message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IDungeonInstance, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified DungeonInstance message, length delimited. Does not implicitly {@link DungeonInstance.verify|verify} messages.
     * @param message DungeonInstance message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IDungeonInstance, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a DungeonInstance message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns DungeonInstance
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): DungeonInstance;

    /**
     * Decodes a DungeonInstance message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns DungeonInstance
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): DungeonInstance;

    /**
     * Verifies a DungeonInstance message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a DungeonInstance message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns DungeonInstance
     */
    public static fromObject(object: { [k: string]: any }): DungeonInstance;

    /**
     * Creates a plain object from a DungeonInstance message. Also converts values to other types if specified.
     * @param message DungeonInstance
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: DungeonInstance, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this DungeonInstance to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for DungeonInstance
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Properties of a DungeonLevel. */
export interface IDungeonLevel {

    /** DungeonLevel bossDefeated */
    bossDefeated?: (boolean|null);

    /** DungeonLevel bosses */
    bosses?: (string[]|null);

    /** DungeonLevel level */
    level?: (number|null);

    /** DungeonLevel tiles */
    tiles?: (number|null);
}

/** Represents a DungeonLevel. */
export class DungeonLevel implements IDungeonLevel {

    /**
     * Constructs a new DungeonLevel.
     * @param [properties] Properties to set
     */
    constructor(properties?: IDungeonLevel);

    /** DungeonLevel bossDefeated. */
    public bossDefeated: boolean;

    /** DungeonLevel bosses. */
    public bosses: string[];

    /** DungeonLevel level. */
    public level: number;

    /** DungeonLevel tiles. */
    public tiles: number;

    /**
     * Creates a new DungeonLevel instance using the specified properties.
     * @param [properties] Properties to set
     * @returns DungeonLevel instance
     */
    public static create(properties?: IDungeonLevel): DungeonLevel;

    /**
     * Encodes the specified DungeonLevel message. Does not implicitly {@link DungeonLevel.verify|verify} messages.
     * @param message DungeonLevel message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IDungeonLevel, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified DungeonLevel message, length delimited. Does not implicitly {@link DungeonLevel.verify|verify} messages.
     * @param message DungeonLevel message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IDungeonLevel, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a DungeonLevel message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns DungeonLevel
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): DungeonLevel;

    /**
     * Decodes a DungeonLevel message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns DungeonLevel
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): DungeonLevel;

    /**
     * Verifies a DungeonLevel message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a DungeonLevel message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns DungeonLevel
     */
    public static fromObject(object: { [k: string]: any }): DungeonLevel;

    /**
     * Creates a plain object from a DungeonLevel message. Also converts values to other types if specified.
     * @param message DungeonLevel
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: DungeonLevel, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this DungeonLevel to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for DungeonLevel
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Properties of an Enemy. */
export interface IEnemy {

    /** Enemy base */
    base?: (ICreature|null);

    /** Enemy minions */
    minions?: (IMinion[]|null);
}

/** Represents an Enemy. */
export class Enemy implements IEnemy {

    /**
     * Constructs a new Enemy.
     * @param [properties] Properties to set
     */
    constructor(properties?: IEnemy);

    /** Enemy base. */
    public base?: (ICreature|null);

    /** Enemy minions. */
    public minions: IMinion[];

    /**
     * Creates a new Enemy instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Enemy instance
     */
    public static create(properties?: IEnemy): Enemy;

    /**
     * Encodes the specified Enemy message. Does not implicitly {@link Enemy.verify|verify} messages.
     * @param message Enemy message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IEnemy, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Enemy message, length delimited. Does not implicitly {@link Enemy.verify|verify} messages.
     * @param message Enemy message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IEnemy, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes an Enemy message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Enemy
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): Enemy;

    /**
     * Decodes an Enemy message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Enemy
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): Enemy;

    /**
     * Verifies an Enemy message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates an Enemy message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Enemy
     */
    public static fromObject(object: { [k: string]: any }): Enemy;

    /**
     * Creates a plain object from an Enemy message. Also converts values to other types if specified.
     * @param message Enemy
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: Enemy, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this Enemy to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for Enemy
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Properties of an Equipment. */
export interface IEquipment {

    /** Equipment body */
    body?: (IItem|null);

    /** Equipment head */
    head?: (IItem|null);

    /** Equipment mainHand */
    mainHand?: (IItem|null);

    /** Equipment offHand */
    offHand?: (IItem|null);
}

/** Represents an Equipment. */
export class Equipment implements IEquipment {

    /**
     * Constructs a new Equipment.
     * @param [properties] Properties to set
     */
    constructor(properties?: IEquipment);

    /** Equipment body. */
    public body?: (IItem|null);

    /** Equipment head. */
    public head?: (IItem|null);

    /** Equipment mainHand. */
    public mainHand?: (IItem|null);

    /** Equipment offHand. */
    public offHand?: (IItem|null);

    /**
     * Creates a new Equipment instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Equipment instance
     */
    public static create(properties?: IEquipment): Equipment;

    /**
     * Encodes the specified Equipment message. Does not implicitly {@link Equipment.verify|verify} messages.
     * @param message Equipment message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IEquipment, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Equipment message, length delimited. Does not implicitly {@link Equipment.verify|verify} messages.
     * @param message Equipment message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IEquipment, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes an Equipment message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Equipment
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): Equipment;

    /**
     * Decodes an Equipment message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Equipment
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): Equipment;

    /**
     * Verifies an Equipment message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates an Equipment message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Equipment
     */
    public static fromObject(object: { [k: string]: any }): Equipment;

    /**
     * Creates a plain object from an Equipment message. Also converts values to other types if specified.
     * @param message Equipment
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: Equipment, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this Equipment to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for Equipment
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Properties of a Game. */
export interface IGame {

    /** Game atDeathScreen */
    atDeathScreen?: (boolean|null);

    /** Game colorScheme */
    colorScheme?: (string|null);

    /** Game completedInstances */
    completedInstances?: (string[]|null);

    /** Game date */
    date?: (string|null);

    /** Game dungeonInstances */
    dungeonInstances?: (IDungeonInstance[]|null);

    /** Game healthWarning */
    healthWarning?: (number|null);

    /** Game shops */
    shops?: (IShop[]|null);

    /** Game tutorialsEnabled */
    tutorialsEnabled?: (boolean|null);

    /** Game tutorialsShown */
    tutorialsShown?: ({ [k: string]: boolean }|null);

    /** Game vibrationEnabled */
    vibrationEnabled?: (string|null);
}

/** Represents a Game. */
export class Game implements IGame {

    /**
     * Constructs a new Game.
     * @param [properties] Properties to set
     */
    constructor(properties?: IGame);

    /** Game atDeathScreen. */
    public atDeathScreen: boolean;

    /** Game colorScheme. */
    public colorScheme: string;

    /** Game completedInstances. */
    public completedInstances: string[];

    /** Game date. */
    public date: string;

    /** Game dungeonInstances. */
    public dungeonInstances: IDungeonInstance[];

    /** Game healthWarning. */
    public healthWarning: number;

    /** Game shops. */
    public shops: IShop[];

    /** Game tutorialsEnabled. */
    public tutorialsEnabled: boolean;

    /** Game tutorialsShown. */
    public tutorialsShown: { [k: string]: boolean };

    /** Game vibrationEnabled. */
    public vibrationEnabled: string;

    /**
     * Creates a new Game instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Game instance
     */
    public static create(properties?: IGame): Game;

    /**
     * Encodes the specified Game message. Does not implicitly {@link Game.verify|verify} messages.
     * @param message Game message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IGame, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Game message, length delimited. Does not implicitly {@link Game.verify|verify} messages.
     * @param message Game message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IGame, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a Game message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Game
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): Game;

    /**
     * Decodes a Game message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Game
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): Game;

    /**
     * Verifies a Game message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a Game message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Game
     */
    public static fromObject(object: { [k: string]: any }): Game;

    /**
     * Creates a plain object from a Game message. Also converts values to other types if specified.
     * @param message Game
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: Game, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this Game to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for Game
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Properties of an Investment. */
export interface IInvestment {

    /** Investment currentGoldStockPile */
    currentGoldStockPile?: (number|null);

    /** Investment goldInvested */
    goldInvested?: (number|null);

    /** Investment maxGoldStockPile */
    maxGoldStockPile?: (number|null);

    /** Investment maximumReturn */
    maximumReturn?: (number|null);

    /** Investment minimumReturn */
    minimumReturn?: (number|null);

    /** Investment name */
    name?: (string|null);

    /** Investment turnsPerRoll */
    turnsPerRoll?: (number|null);

    /** Investment turnsUntilNextRoll */
    turnsUntilNextRoll?: (number|null);

    /** Investment upgrades */
    upgrades?: (string[]|null);
}

/** Represents an Investment. */
export class Investment implements IInvestment {

    /**
     * Constructs a new Investment.
     * @param [properties] Properties to set
     */
    constructor(properties?: IInvestment);

    /** Investment currentGoldStockPile. */
    public currentGoldStockPile: number;

    /** Investment goldInvested. */
    public goldInvested: number;

    /** Investment maxGoldStockPile. */
    public maxGoldStockPile: number;

    /** Investment maximumReturn. */
    public maximumReturn: number;

    /** Investment minimumReturn. */
    public minimumReturn: number;

    /** Investment name. */
    public name: string;

    /** Investment turnsPerRoll. */
    public turnsPerRoll: number;

    /** Investment turnsUntilNextRoll. */
    public turnsUntilNextRoll: number;

    /** Investment upgrades. */
    public upgrades: string[];

    /**
     * Creates a new Investment instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Investment instance
     */
    public static create(properties?: IInvestment): Investment;

    /**
     * Encodes the specified Investment message. Does not implicitly {@link Investment.verify|verify} messages.
     * @param message Investment message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IInvestment, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Investment message, length delimited. Does not implicitly {@link Investment.verify|verify} messages.
     * @param message Investment message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IInvestment, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes an Investment message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Investment
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): Investment;

    /**
     * Decodes an Investment message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Investment
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): Investment;

    /**
     * Verifies an Investment message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates an Investment message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Investment
     */
    public static fromObject(object: { [k: string]: any }): Investment;

    /**
     * Creates a plain object from an Investment message. Also converts values to other types if specified.
     * @param message Investment
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: Investment, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this Investment to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for Investment
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Properties of an Item. */
export interface IItem {

    /** Item baseValue */
    baseValue?: (number|null);

    /** Item icon */
    icon?: (string|null);

    /** Item id */
    id?: (string|null);

    /** Item itemClass */
    itemClass?: (string|null);

    /** Item name */
    name?: (string|null);

    /** Item slot */
    slot?: (string|null);

    /** Item stackable */
    stackable?: (boolean|null);

    /** Item stats */
    stats?: ({ [k: string]: number }|null);
}

/** Represents an Item. */
export class Item implements IItem {

    /**
     * Constructs a new Item.
     * @param [properties] Properties to set
     */
    constructor(properties?: IItem);

    /** Item baseValue. */
    public baseValue: number;

    /** Item icon. */
    public icon: string;

    /** Item id. */
    public id: string;

    /** Item itemClass. */
    public itemClass: string;

    /** Item name. */
    public name: string;

    /** Item slot. */
    public slot: string;

    /** Item stackable. */
    public stackable: boolean;

    /** Item stats. */
    public stats: { [k: string]: number };

    /**
     * Creates a new Item instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Item instance
     */
    public static create(properties?: IItem): Item;

    /**
     * Encodes the specified Item message. Does not implicitly {@link Item.verify|verify} messages.
     * @param message Item message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IItem, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Item message, length delimited. Does not implicitly {@link Item.verify|verify} messages.
     * @param message Item message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IItem, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes an Item message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Item
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): Item;

    /**
     * Decodes an Item message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Item
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): Item;

    /**
     * Verifies an Item message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates an Item message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Item
     */
    public static fromObject(object: { [k: string]: any }): Item;

    /**
     * Creates a plain object from an Item message. Also converts values to other types if specified.
     * @param message Item
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: Item, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this Item to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for Item
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Properties of a JobExperience. */
export interface IJobExperience {

    /** JobExperience experience */
    experience?: (number|null);

    /** JobExperience job */
    job?: (string|null);

    /** JobExperience rank */
    rank?: (number|null);
}

/** Represents a JobExperience. */
export class JobExperience implements IJobExperience {

    /**
     * Constructs a new JobExperience.
     * @param [properties] Properties to set
     */
    constructor(properties?: IJobExperience);

    /** JobExperience experience. */
    public experience: number;

    /** JobExperience job. */
    public job: string;

    /** JobExperience rank. */
    public rank: number;

    /**
     * Creates a new JobExperience instance using the specified properties.
     * @param [properties] Properties to set
     * @returns JobExperience instance
     */
    public static create(properties?: IJobExperience): JobExperience;

    /**
     * Encodes the specified JobExperience message. Does not implicitly {@link JobExperience.verify|verify} messages.
     * @param message JobExperience message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IJobExperience, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified JobExperience message, length delimited. Does not implicitly {@link JobExperience.verify|verify} messages.
     * @param message JobExperience message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IJobExperience, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a JobExperience message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns JobExperience
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): JobExperience;

    /**
     * Decodes a JobExperience message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns JobExperience
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): JobExperience;

    /**
     * Verifies a JobExperience message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a JobExperience message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns JobExperience
     */
    public static fromObject(object: { [k: string]: any }): JobExperience;

    /**
     * Creates a plain object from a JobExperience message. Also converts values to other types if specified.
     * @param message JobExperience
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: JobExperience, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this JobExperience to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for JobExperience
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Properties of a LearningSpell. */
export interface ILearningSpell {

    /** LearningSpell bookName */
    bookName?: (string|null);

    /** LearningSpell element */
    element?: (string|null);

    /** LearningSpell experience */
    experience?: (number|null);

    /** LearningSpell spellName */
    spellName?: (string|null);
}

/** Represents a LearningSpell. */
export class LearningSpell implements ILearningSpell {

    /**
     * Constructs a new LearningSpell.
     * @param [properties] Properties to set
     */
    constructor(properties?: ILearningSpell);

    /** LearningSpell bookName. */
    public bookName: string;

    /** LearningSpell element. */
    public element: string;

    /** LearningSpell experience. */
    public experience: number;

    /** LearningSpell spellName. */
    public spellName: string;

    /**
     * Creates a new LearningSpell instance using the specified properties.
     * @param [properties] Properties to set
     * @returns LearningSpell instance
     */
    public static create(properties?: ILearningSpell): LearningSpell;

    /**
     * Encodes the specified LearningSpell message. Does not implicitly {@link LearningSpell.verify|verify} messages.
     * @param message LearningSpell message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: ILearningSpell, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified LearningSpell message, length delimited. Does not implicitly {@link LearningSpell.verify|verify} messages.
     * @param message LearningSpell message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: ILearningSpell, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a LearningSpell message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns LearningSpell
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): LearningSpell;

    /**
     * Decodes a LearningSpell message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns LearningSpell
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): LearningSpell;

    /**
     * Verifies a LearningSpell message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a LearningSpell message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns LearningSpell
     */
    public static fromObject(object: { [k: string]: any }): LearningSpell;

    /**
     * Creates a plain object from a LearningSpell message. Also converts values to other types if specified.
     * @param message LearningSpell
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: LearningSpell, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this LearningSpell to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for LearningSpell
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Properties of a MagicProficiency. */
export interface IMagicProficiency {

    /** MagicProficiency proficiency */
    proficiency?: (number|null);

    /** MagicProficiency school */
    school?: (string|null);
}

/** Represents a MagicProficiency. */
export class MagicProficiency implements IMagicProficiency {

    /**
     * Constructs a new MagicProficiency.
     * @param [properties] Properties to set
     */
    constructor(properties?: IMagicProficiency);

    /** MagicProficiency proficiency. */
    public proficiency: number;

    /** MagicProficiency school. */
    public school: string;

    /**
     * Creates a new MagicProficiency instance using the specified properties.
     * @param [properties] Properties to set
     * @returns MagicProficiency instance
     */
    public static create(properties?: IMagicProficiency): MagicProficiency;

    /**
     * Encodes the specified MagicProficiency message. Does not implicitly {@link MagicProficiency.verify|verify} messages.
     * @param message MagicProficiency message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IMagicProficiency, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified MagicProficiency message, length delimited. Does not implicitly {@link MagicProficiency.verify|verify} messages.
     * @param message MagicProficiency message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IMagicProficiency, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a MagicProficiency message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns MagicProficiency
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): MagicProficiency;

    /**
     * Decodes a MagicProficiency message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns MagicProficiency
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): MagicProficiency;

    /**
     * Verifies a MagicProficiency message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a MagicProficiency message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns MagicProficiency
     */
    public static fromObject(object: { [k: string]: any }): MagicProficiency;

    /**
     * Creates a plain object from a MagicProficiency message. Also converts values to other types if specified.
     * @param message MagicProficiency
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: MagicProficiency, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this MagicProficiency to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for MagicProficiency
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Properties of a Minion. */
export interface IMinion {

    /** Minion base */
    base?: (ICreature|null);

    /** Minion turnsLeftAlive */
    turnsLeftAlive?: (number|null);
}

/** Represents a Minion. */
export class Minion implements IMinion {

    /**
     * Constructs a new Minion.
     * @param [properties] Properties to set
     */
    constructor(properties?: IMinion);

    /** Minion base. */
    public base?: (ICreature|null);

    /** Minion turnsLeftAlive. */
    public turnsLeftAlive: number;

    /**
     * Creates a new Minion instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Minion instance
     */
    public static create(properties?: IMinion): Minion;

    /**
     * Encodes the specified Minion message. Does not implicitly {@link Minion.verify|verify} messages.
     * @param message Minion message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IMinion, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Minion message, length delimited. Does not implicitly {@link Minion.verify|verify} messages.
     * @param message Minion message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IMinion, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a Minion message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Minion
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): Minion;

    /**
     * Decodes a Minion message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Minion
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): Minion;

    /**
     * Verifies a Minion message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a Minion message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Minion
     */
    public static fromObject(object: { [k: string]: any }): Minion;

    /**
     * Creates a plain object from a Minion message. Also converts values to other types if specified.
     * @param message Minion
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: Minion, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this Minion to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for Minion
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Properties of a PlayerCharacter. */
export interface IPlayerCharacter {

    /** PlayerCharacter allocatedSkillPoints */
    allocatedSkillPoints?: (IAllocatedSkillPoints|null);

    /** PlayerCharacter attackPower */
    attackPower?: (number|null);

    /** PlayerCharacter base */
    base?: (ICharacter|null);

    /** PlayerCharacter blessing */
    blessing?: (string|null);

    /** PlayerCharacter children */
    children?: (ICharacter[]|null);

    /** PlayerCharacter conditions */
    conditions?: (ICondition[]|null);

    /** PlayerCharacter currentDungeon */
    currentDungeon?: (ICurrentDungeon|null);

    /** PlayerCharacter equipment */
    equipment?: (IEquipment|null);

    /** PlayerCharacter gold */
    gold?: (number|null);

    /** PlayerCharacter health */
    health?: (number|null);

    /** PlayerCharacter healthMax */
    healthMax?: (number|null);

    /** PlayerCharacter inventory */
    inventory?: (IItem[]|null);

    /** PlayerCharacter investments */
    investments?: (IInvestment[]|null);

    /** PlayerCharacter jobExperience */
    jobExperience?: (IJobExperience[]|null);

    /** PlayerCharacter knownCharacters */
    knownCharacters?: (ICharacter[]|null);

    /** PlayerCharacter knownSpells */
    knownSpells?: (string[]|null);

    /** PlayerCharacter learningSpells */
    learningSpells?: (ILearningSpell[]|null);

    /** PlayerCharacter magicProficiencies */
    magicProficiencies?: (IMagicProficiency[]|null);

    /** PlayerCharacter mana */
    mana?: (number|null);

    /** PlayerCharacter manaMax */
    manaMax?: (number|null);

    /** PlayerCharacter manaRegen */
    manaRegen?: (number|null);

    /** PlayerCharacter minions */
    minions?: (IMinion[]|null);

    /** PlayerCharacter parents */
    parents?: (ICharacter[]|null);

    /** PlayerCharacter partners */
    partners?: (ICharacter[]|null);

    /** PlayerCharacter physicalAttacks */
    physicalAttacks?: (string[]|null);

    /** PlayerCharacter playerClass */
    playerClass?: (string|null);

    /** PlayerCharacter qualificationProgress */
    qualificationProgress?: (IQualificationProgress[]|null);

    /** PlayerCharacter sanity */
    sanity?: (number|null);

    /** PlayerCharacter sanityMax */
    sanityMax?: (number|null);

    /** PlayerCharacter savedEnemy */
    savedEnemy?: (IEnemy|null);

    /** PlayerCharacter unAllocatedSkillPoints */
    unAllocatedSkillPoints?: (number|null);
}

/** Represents a PlayerCharacter. */
export class PlayerCharacter implements IPlayerCharacter {

    /**
     * Constructs a new PlayerCharacter.
     * @param [properties] Properties to set
     */
    constructor(properties?: IPlayerCharacter);

    /** PlayerCharacter allocatedSkillPoints. */
    public allocatedSkillPoints?: (IAllocatedSkillPoints|null);

    /** PlayerCharacter attackPower. */
    public attackPower: number;

    /** PlayerCharacter base. */
    public base?: (ICharacter|null);

    /** PlayerCharacter blessing. */
    public blessing: string;

    /** PlayerCharacter children. */
    public children: ICharacter[];

    /** PlayerCharacter conditions. */
    public conditions: ICondition[];

    /** PlayerCharacter currentDungeon. */
    public currentDungeon?: (ICurrentDungeon|null);

    /** PlayerCharacter equipment. */
    public equipment?: (IEquipment|null);

    /** PlayerCharacter gold. */
    public gold: number;

    /** PlayerCharacter health. */
    public health: number;

    /** PlayerCharacter healthMax. */
    public healthMax: number;

    /** PlayerCharacter inventory. */
    public inventory: IItem[];

    /** PlayerCharacter investments. */
    public investments: IInvestment[];

    /** PlayerCharacter jobExperience. */
    public jobExperience: IJobExperience[];

    /** PlayerCharacter knownCharacters. */
    public knownCharacters: ICharacter[];

    /** PlayerCharacter knownSpells. */
    public knownSpells: string[];

    /** PlayerCharacter learningSpells. */
    public learningSpells: ILearningSpell[];

    /** PlayerCharacter magicProficiencies. */
    public magicProficiencies: IMagicProficiency[];

    /** PlayerCharacter mana. */
    public mana: number;

    /** PlayerCharacter manaMax. */
    public manaMax: number;

    /** PlayerCharacter manaRegen. */
    public manaRegen: number;

    /** PlayerCharacter minions. */
    public minions: IMinion[];

    /** PlayerCharacter parents. */
    public parents: ICharacter[];

    /** PlayerCharacter partners. */
    public partners: ICharacter[];

    /** PlayerCharacter physicalAttacks. */
    public physicalAttacks: string[];

    /** PlayerCharacter playerClass. */
    public playerClass: string;

    /** PlayerCharacter qualificationProgress. */
    public qualificationProgress: IQualificationProgress[];

    /** PlayerCharacter sanity. */
    public sanity: number;

    /** PlayerCharacter sanityMax. */
    public sanityMax: number;

    /** PlayerCharacter savedEnemy. */
    public savedEnemy?: (IEnemy|null);

    /** PlayerCharacter unAllocatedSkillPoints. */
    public unAllocatedSkillPoints: number;

    /**
     * Creates a new PlayerCharacter instance using the specified properties.
     * @param [properties] Properties to set
     * @returns PlayerCharacter instance
     */
    public static create(properties?: IPlayerCharacter): PlayerCharacter;

    /**
     * Encodes the specified PlayerCharacter message. Does not implicitly {@link PlayerCharacter.verify|verify} messages.
     * @param message PlayerCharacter message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IPlayerCharacter, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified PlayerCharacter message, length delimited. Does not implicitly {@link PlayerCharacter.verify|verify} messages.
     * @param message PlayerCharacter message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IPlayerCharacter, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a PlayerCharacter message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns PlayerCharacter
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PlayerCharacter;

    /**
     * Decodes a PlayerCharacter message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns PlayerCharacter
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PlayerCharacter;

    /**
     * Verifies a PlayerCharacter message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a PlayerCharacter message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns PlayerCharacter
     */
    public static fromObject(object: { [k: string]: any }): PlayerCharacter;

    /**
     * Creates a plain object from a PlayerCharacter message. Also converts values to other types if specified.
     * @param message PlayerCharacter
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: PlayerCharacter, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this PlayerCharacter to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for PlayerCharacter
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Properties of a QualificationProgress. */
export interface IQualificationProgress {

    /** QualificationProgress completed */
    completed?: (boolean|null);

    /** QualificationProgress name */
    name?: (string|null);

    /** QualificationProgress progress */
    progress?: (number|null);
}

/** Represents a QualificationProgress. */
export class QualificationProgress implements IQualificationProgress {

    /**
     * Constructs a new QualificationProgress.
     * @param [properties] Properties to set
     */
    constructor(properties?: IQualificationProgress);

    /** QualificationProgress completed. */
    public completed: boolean;

    /** QualificationProgress name. */
    public name: string;

    /** QualificationProgress progress. */
    public progress: number;

    /**
     * Creates a new QualificationProgress instance using the specified properties.
     * @param [properties] Properties to set
     * @returns QualificationProgress instance
     */
    public static create(properties?: IQualificationProgress): QualificationProgress;

    /**
     * Encodes the specified QualificationProgress message. Does not implicitly {@link QualificationProgress.verify|verify} messages.
     * @param message QualificationProgress message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IQualificationProgress, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified QualificationProgress message, length delimited. Does not implicitly {@link QualificationProgress.verify|verify} messages.
     * @param message QualificationProgress message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IQualificationProgress, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a QualificationProgress message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns QualificationProgress
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): QualificationProgress;

    /**
     * Decodes a QualificationProgress message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns QualificationProgress
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): QualificationProgress;

    /**
     * Verifies a QualificationProgress message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a QualificationProgress message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns QualificationProgress
     */
    public static fromObject(object: { [k: string]: any }): QualificationProgress;

    /**
     * Creates a plain object from a QualificationProgress message. Also converts values to other types if specified.
     * @param message QualificationProgress
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: QualificationProgress, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this QualificationProgress to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for QualificationProgress
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Properties of a Shop. */
export interface IShop {

    /** Shop archetype */
    archetype?: (string|null);

    /** Shop baseGold */
    baseGold?: (number|null);

    /** Shop currentGold */
    currentGold?: (number|null);

    /** Shop inventory */
    inventory?: (IItem[]|null);

    /** Shop lastStockRefresh */
    lastStockRefresh?: (string|null);

    /** Shop shopKeeper */
    shopKeeper?: (ICharacter|null);
}

/** Represents a Shop. */
export class Shop implements IShop {

    /**
     * Constructs a new Shop.
     * @param [properties] Properties to set
     */
    constructor(properties?: IShop);

    /** Shop archetype. */
    public archetype: string;

    /** Shop baseGold. */
    public baseGold: number;

    /** Shop currentGold. */
    public currentGold: number;

    /** Shop inventory. */
    public inventory: IItem[];

    /** Shop lastStockRefresh. */
    public lastStockRefresh: string;

    /** Shop shopKeeper. */
    public shopKeeper?: (ICharacter|null);

    /**
     * Creates a new Shop instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Shop instance
     */
    public static create(properties?: IShop): Shop;

    /**
     * Encodes the specified Shop message. Does not implicitly {@link Shop.verify|verify} messages.
     * @param message Shop message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IShop, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Shop message, length delimited. Does not implicitly {@link Shop.verify|verify} messages.
     * @param message Shop message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IShop, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a Shop message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Shop
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): Shop;

    /**
     * Decodes a Shop message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Shop
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): Shop;

    /**
     * Verifies a Shop message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a Shop message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Shop
     */
    public static fromObject(object: { [k: string]: any }): Shop;

    /**
     * Creates a plain object from a Shop message. Also converts values to other types if specified.
     * @param message Shop
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: Shop, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this Shop to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for Shop
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Properties of a Tile. */
export interface ITile {

    /** Tile clearedRoom */
    clearedRoom?: (boolean|null);

    /** Tile isBossRoom */
    isBossRoom?: (boolean|null);

    /** Tile x */
    x?: (number|null);

    /** Tile y */
    y?: (number|null);
}

/** Represents a Tile. */
export class Tile implements ITile {

    /**
     * Constructs a new Tile.
     * @param [properties] Properties to set
     */
    constructor(properties?: ITile);

    /** Tile clearedRoom. */
    public clearedRoom: boolean;

    /** Tile isBossRoom. */
    public isBossRoom: boolean;

    /** Tile x. */
    public x: number;

    /** Tile y. */
    public y: number;

    /**
     * Creates a new Tile instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Tile instance
     */
    public static create(properties?: ITile): Tile;

    /**
     * Encodes the specified Tile message. Does not implicitly {@link Tile.verify|verify} messages.
     * @param message Tile message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: ITile, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Tile message, length delimited. Does not implicitly {@link Tile.verify|verify} messages.
     * @param message Tile message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: ITile, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a Tile message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Tile
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): Tile;

    /**
     * Decodes a Tile message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Tile
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): Tile;

    /**
     * Verifies a Tile message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a Tile message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Tile
     */
    public static fromObject(object: { [k: string]: any }): Tile;

    /**
     * Creates a plain object from a Tile message. Also converts values to other types if specified.
     * @param message Tile
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: Tile, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this Tile to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for Tile
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}
