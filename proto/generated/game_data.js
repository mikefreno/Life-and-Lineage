/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
"use strict";

var $protobuf = require("protobufjs/minimal");

// Common aliases
var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

$root.AllocatedSkillPoints = (function() {

    /**
     * Properties of an AllocatedSkillPoints.
     * @exports IAllocatedSkillPoints
     * @interface IAllocatedSkillPoints
     * @property {number|null} [attackPower] AllocatedSkillPoints attackPower
     * @property {number|null} [health] AllocatedSkillPoints health
     * @property {number|null} [mana] AllocatedSkillPoints mana
     * @property {number|null} [sanity] AllocatedSkillPoints sanity
     */

    /**
     * Constructs a new AllocatedSkillPoints.
     * @exports AllocatedSkillPoints
     * @classdesc Represents an AllocatedSkillPoints.
     * @implements IAllocatedSkillPoints
     * @constructor
     * @param {IAllocatedSkillPoints=} [properties] Properties to set
     */
    function AllocatedSkillPoints(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * AllocatedSkillPoints attackPower.
     * @member {number} attackPower
     * @memberof AllocatedSkillPoints
     * @instance
     */
    AllocatedSkillPoints.prototype.attackPower = 0;

    /**
     * AllocatedSkillPoints health.
     * @member {number} health
     * @memberof AllocatedSkillPoints
     * @instance
     */
    AllocatedSkillPoints.prototype.health = 0;

    /**
     * AllocatedSkillPoints mana.
     * @member {number} mana
     * @memberof AllocatedSkillPoints
     * @instance
     */
    AllocatedSkillPoints.prototype.mana = 0;

    /**
     * AllocatedSkillPoints sanity.
     * @member {number} sanity
     * @memberof AllocatedSkillPoints
     * @instance
     */
    AllocatedSkillPoints.prototype.sanity = 0;

    /**
     * Creates a new AllocatedSkillPoints instance using the specified properties.
     * @function create
     * @memberof AllocatedSkillPoints
     * @static
     * @param {IAllocatedSkillPoints=} [properties] Properties to set
     * @returns {AllocatedSkillPoints} AllocatedSkillPoints instance
     */
    AllocatedSkillPoints.create = function create(properties) {
        return new AllocatedSkillPoints(properties);
    };

    /**
     * Encodes the specified AllocatedSkillPoints message. Does not implicitly {@link AllocatedSkillPoints.verify|verify} messages.
     * @function encode
     * @memberof AllocatedSkillPoints
     * @static
     * @param {IAllocatedSkillPoints} message AllocatedSkillPoints message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    AllocatedSkillPoints.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.attackPower != null && Object.hasOwnProperty.call(message, "attackPower"))
            writer.uint32(/* id 1, wireType 0 =*/8).int32(message.attackPower);
        if (message.health != null && Object.hasOwnProperty.call(message, "health"))
            writer.uint32(/* id 2, wireType 0 =*/16).int32(message.health);
        if (message.mana != null && Object.hasOwnProperty.call(message, "mana"))
            writer.uint32(/* id 3, wireType 0 =*/24).int32(message.mana);
        if (message.sanity != null && Object.hasOwnProperty.call(message, "sanity"))
            writer.uint32(/* id 4, wireType 0 =*/32).int32(message.sanity);
        return writer;
    };

    /**
     * Encodes the specified AllocatedSkillPoints message, length delimited. Does not implicitly {@link AllocatedSkillPoints.verify|verify} messages.
     * @function encodeDelimited
     * @memberof AllocatedSkillPoints
     * @static
     * @param {IAllocatedSkillPoints} message AllocatedSkillPoints message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    AllocatedSkillPoints.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes an AllocatedSkillPoints message from the specified reader or buffer.
     * @function decode
     * @memberof AllocatedSkillPoints
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {AllocatedSkillPoints} AllocatedSkillPoints
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    AllocatedSkillPoints.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.AllocatedSkillPoints();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
            case 1: {
                    message.attackPower = reader.int32();
                    break;
                }
            case 2: {
                    message.health = reader.int32();
                    break;
                }
            case 3: {
                    message.mana = reader.int32();
                    break;
                }
            case 4: {
                    message.sanity = reader.int32();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes an AllocatedSkillPoints message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof AllocatedSkillPoints
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {AllocatedSkillPoints} AllocatedSkillPoints
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    AllocatedSkillPoints.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies an AllocatedSkillPoints message.
     * @function verify
     * @memberof AllocatedSkillPoints
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    AllocatedSkillPoints.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.attackPower != null && message.hasOwnProperty("attackPower"))
            if (!$util.isInteger(message.attackPower))
                return "attackPower: integer expected";
        if (message.health != null && message.hasOwnProperty("health"))
            if (!$util.isInteger(message.health))
                return "health: integer expected";
        if (message.mana != null && message.hasOwnProperty("mana"))
            if (!$util.isInteger(message.mana))
                return "mana: integer expected";
        if (message.sanity != null && message.hasOwnProperty("sanity"))
            if (!$util.isInteger(message.sanity))
                return "sanity: integer expected";
        return null;
    };

    /**
     * Creates an AllocatedSkillPoints message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof AllocatedSkillPoints
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {AllocatedSkillPoints} AllocatedSkillPoints
     */
    AllocatedSkillPoints.fromObject = function fromObject(object) {
        if (object instanceof $root.AllocatedSkillPoints)
            return object;
        var message = new $root.AllocatedSkillPoints();
        if (object.attackPower != null)
            message.attackPower = object.attackPower | 0;
        if (object.health != null)
            message.health = object.health | 0;
        if (object.mana != null)
            message.mana = object.mana | 0;
        if (object.sanity != null)
            message.sanity = object.sanity | 0;
        return message;
    };

    /**
     * Creates a plain object from an AllocatedSkillPoints message. Also converts values to other types if specified.
     * @function toObject
     * @memberof AllocatedSkillPoints
     * @static
     * @param {AllocatedSkillPoints} message AllocatedSkillPoints
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    AllocatedSkillPoints.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults) {
            object.attackPower = 0;
            object.health = 0;
            object.mana = 0;
            object.sanity = 0;
        }
        if (message.attackPower != null && message.hasOwnProperty("attackPower"))
            object.attackPower = message.attackPower;
        if (message.health != null && message.hasOwnProperty("health"))
            object.health = message.health;
        if (message.mana != null && message.hasOwnProperty("mana"))
            object.mana = message.mana;
        if (message.sanity != null && message.hasOwnProperty("sanity"))
            object.sanity = message.sanity;
        return object;
    };

    /**
     * Converts this AllocatedSkillPoints to JSON.
     * @function toJSON
     * @memberof AllocatedSkillPoints
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    AllocatedSkillPoints.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for AllocatedSkillPoints
     * @function getTypeUrl
     * @memberof AllocatedSkillPoints
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    AllocatedSkillPoints.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/AllocatedSkillPoints";
    };

    return AllocatedSkillPoints;
})();

$root.BoundingBox = (function() {

    /**
     * Properties of a BoundingBox.
     * @exports IBoundingBox
     * @interface IBoundingBox
     * @property {number|null} [height] BoundingBox height
     * @property {number|null} [offsetX] BoundingBox offsetX
     * @property {number|null} [offsetY] BoundingBox offsetY
     * @property {number|null} [width] BoundingBox width
     */

    /**
     * Constructs a new BoundingBox.
     * @exports BoundingBox
     * @classdesc Represents a BoundingBox.
     * @implements IBoundingBox
     * @constructor
     * @param {IBoundingBox=} [properties] Properties to set
     */
    function BoundingBox(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * BoundingBox height.
     * @member {number} height
     * @memberof BoundingBox
     * @instance
     */
    BoundingBox.prototype.height = 0;

    /**
     * BoundingBox offsetX.
     * @member {number} offsetX
     * @memberof BoundingBox
     * @instance
     */
    BoundingBox.prototype.offsetX = 0;

    /**
     * BoundingBox offsetY.
     * @member {number} offsetY
     * @memberof BoundingBox
     * @instance
     */
    BoundingBox.prototype.offsetY = 0;

    /**
     * BoundingBox width.
     * @member {number} width
     * @memberof BoundingBox
     * @instance
     */
    BoundingBox.prototype.width = 0;

    /**
     * Creates a new BoundingBox instance using the specified properties.
     * @function create
     * @memberof BoundingBox
     * @static
     * @param {IBoundingBox=} [properties] Properties to set
     * @returns {BoundingBox} BoundingBox instance
     */
    BoundingBox.create = function create(properties) {
        return new BoundingBox(properties);
    };

    /**
     * Encodes the specified BoundingBox message. Does not implicitly {@link BoundingBox.verify|verify} messages.
     * @function encode
     * @memberof BoundingBox
     * @static
     * @param {IBoundingBox} message BoundingBox message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    BoundingBox.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.height != null && Object.hasOwnProperty.call(message, "height"))
            writer.uint32(/* id 1, wireType 0 =*/8).int32(message.height);
        if (message.offsetX != null && Object.hasOwnProperty.call(message, "offsetX"))
            writer.uint32(/* id 2, wireType 0 =*/16).int32(message.offsetX);
        if (message.offsetY != null && Object.hasOwnProperty.call(message, "offsetY"))
            writer.uint32(/* id 3, wireType 0 =*/24).int32(message.offsetY);
        if (message.width != null && Object.hasOwnProperty.call(message, "width"))
            writer.uint32(/* id 4, wireType 0 =*/32).int32(message.width);
        return writer;
    };

    /**
     * Encodes the specified BoundingBox message, length delimited. Does not implicitly {@link BoundingBox.verify|verify} messages.
     * @function encodeDelimited
     * @memberof BoundingBox
     * @static
     * @param {IBoundingBox} message BoundingBox message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    BoundingBox.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a BoundingBox message from the specified reader or buffer.
     * @function decode
     * @memberof BoundingBox
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {BoundingBox} BoundingBox
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    BoundingBox.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.BoundingBox();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
            case 1: {
                    message.height = reader.int32();
                    break;
                }
            case 2: {
                    message.offsetX = reader.int32();
                    break;
                }
            case 3: {
                    message.offsetY = reader.int32();
                    break;
                }
            case 4: {
                    message.width = reader.int32();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a BoundingBox message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof BoundingBox
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {BoundingBox} BoundingBox
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    BoundingBox.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a BoundingBox message.
     * @function verify
     * @memberof BoundingBox
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    BoundingBox.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.height != null && message.hasOwnProperty("height"))
            if (!$util.isInteger(message.height))
                return "height: integer expected";
        if (message.offsetX != null && message.hasOwnProperty("offsetX"))
            if (!$util.isInteger(message.offsetX))
                return "offsetX: integer expected";
        if (message.offsetY != null && message.hasOwnProperty("offsetY"))
            if (!$util.isInteger(message.offsetY))
                return "offsetY: integer expected";
        if (message.width != null && message.hasOwnProperty("width"))
            if (!$util.isInteger(message.width))
                return "width: integer expected";
        return null;
    };

    /**
     * Creates a BoundingBox message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof BoundingBox
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {BoundingBox} BoundingBox
     */
    BoundingBox.fromObject = function fromObject(object) {
        if (object instanceof $root.BoundingBox)
            return object;
        var message = new $root.BoundingBox();
        if (object.height != null)
            message.height = object.height | 0;
        if (object.offsetX != null)
            message.offsetX = object.offsetX | 0;
        if (object.offsetY != null)
            message.offsetY = object.offsetY | 0;
        if (object.width != null)
            message.width = object.width | 0;
        return message;
    };

    /**
     * Creates a plain object from a BoundingBox message. Also converts values to other types if specified.
     * @function toObject
     * @memberof BoundingBox
     * @static
     * @param {BoundingBox} message BoundingBox
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    BoundingBox.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults) {
            object.height = 0;
            object.offsetX = 0;
            object.offsetY = 0;
            object.width = 0;
        }
        if (message.height != null && message.hasOwnProperty("height"))
            object.height = message.height;
        if (message.offsetX != null && message.hasOwnProperty("offsetX"))
            object.offsetX = message.offsetX;
        if (message.offsetY != null && message.hasOwnProperty("offsetY"))
            object.offsetY = message.offsetY;
        if (message.width != null && message.hasOwnProperty("width"))
            object.width = message.width;
        return object;
    };

    /**
     * Converts this BoundingBox to JSON.
     * @function toJSON
     * @memberof BoundingBox
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    BoundingBox.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for BoundingBox
     * @function getTypeUrl
     * @memberof BoundingBox
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    BoundingBox.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/BoundingBox";
    };

    return BoundingBox;
})();

$root.Character = (function() {

    /**
     * Properties of a Character.
     * @exports ICharacter
     * @interface ICharacter
     * @property {number|null} [affection] Character affection
     * @property {boolean|null} [alive] Character alive
     * @property {string|null} [beingType] Character beingType
     * @property {string|null} [birthdate] Character birthdate
     * @property {string|null} [dateCooldownStart] Character dateCooldownStart
     * @property {string|null} [deathdate] Character deathdate
     * @property {string|null} [firstName] Character firstName
     * @property {string|null} [id] Character id
     * @property {boolean|null} [isPlayerPartner] Character isPlayerPartner
     * @property {string|null} [job] Character job
     * @property {string|null} [lastName] Character lastName
     * @property {Array.<string>|null} [qualifications] Character qualifications
     * @property {string|null} [sex] Character sex
     */

    /**
     * Constructs a new Character.
     * @exports Character
     * @classdesc Represents a Character.
     * @implements ICharacter
     * @constructor
     * @param {ICharacter=} [properties] Properties to set
     */
    function Character(properties) {
        this.qualifications = [];
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * Character affection.
     * @member {number} affection
     * @memberof Character
     * @instance
     */
    Character.prototype.affection = 0;

    /**
     * Character alive.
     * @member {boolean} alive
     * @memberof Character
     * @instance
     */
    Character.prototype.alive = false;

    /**
     * Character beingType.
     * @member {string} beingType
     * @memberof Character
     * @instance
     */
    Character.prototype.beingType = "";

    /**
     * Character birthdate.
     * @member {string} birthdate
     * @memberof Character
     * @instance
     */
    Character.prototype.birthdate = "";

    /**
     * Character dateCooldownStart.
     * @member {string} dateCooldownStart
     * @memberof Character
     * @instance
     */
    Character.prototype.dateCooldownStart = "";

    /**
     * Character deathdate.
     * @member {string} deathdate
     * @memberof Character
     * @instance
     */
    Character.prototype.deathdate = "";

    /**
     * Character firstName.
     * @member {string} firstName
     * @memberof Character
     * @instance
     */
    Character.prototype.firstName = "";

    /**
     * Character id.
     * @member {string} id
     * @memberof Character
     * @instance
     */
    Character.prototype.id = "";

    /**
     * Character isPlayerPartner.
     * @member {boolean} isPlayerPartner
     * @memberof Character
     * @instance
     */
    Character.prototype.isPlayerPartner = false;

    /**
     * Character job.
     * @member {string} job
     * @memberof Character
     * @instance
     */
    Character.prototype.job = "";

    /**
     * Character lastName.
     * @member {string} lastName
     * @memberof Character
     * @instance
     */
    Character.prototype.lastName = "";

    /**
     * Character qualifications.
     * @member {Array.<string>} qualifications
     * @memberof Character
     * @instance
     */
    Character.prototype.qualifications = $util.emptyArray;

    /**
     * Character sex.
     * @member {string} sex
     * @memberof Character
     * @instance
     */
    Character.prototype.sex = "";

    /**
     * Creates a new Character instance using the specified properties.
     * @function create
     * @memberof Character
     * @static
     * @param {ICharacter=} [properties] Properties to set
     * @returns {Character} Character instance
     */
    Character.create = function create(properties) {
        return new Character(properties);
    };

    /**
     * Encodes the specified Character message. Does not implicitly {@link Character.verify|verify} messages.
     * @function encode
     * @memberof Character
     * @static
     * @param {ICharacter} message Character message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Character.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.affection != null && Object.hasOwnProperty.call(message, "affection"))
            writer.uint32(/* id 1, wireType 5 =*/13).float(message.affection);
        if (message.alive != null && Object.hasOwnProperty.call(message, "alive"))
            writer.uint32(/* id 2, wireType 0 =*/16).bool(message.alive);
        if (message.beingType != null && Object.hasOwnProperty.call(message, "beingType"))
            writer.uint32(/* id 3, wireType 2 =*/26).string(message.beingType);
        if (message.birthdate != null && Object.hasOwnProperty.call(message, "birthdate"))
            writer.uint32(/* id 4, wireType 2 =*/34).string(message.birthdate);
        if (message.dateCooldownStart != null && Object.hasOwnProperty.call(message, "dateCooldownStart"))
            writer.uint32(/* id 5, wireType 2 =*/42).string(message.dateCooldownStart);
        if (message.deathdate != null && Object.hasOwnProperty.call(message, "deathdate"))
            writer.uint32(/* id 6, wireType 2 =*/50).string(message.deathdate);
        if (message.firstName != null && Object.hasOwnProperty.call(message, "firstName"))
            writer.uint32(/* id 7, wireType 2 =*/58).string(message.firstName);
        if (message.id != null && Object.hasOwnProperty.call(message, "id"))
            writer.uint32(/* id 8, wireType 2 =*/66).string(message.id);
        if (message.isPlayerPartner != null && Object.hasOwnProperty.call(message, "isPlayerPartner"))
            writer.uint32(/* id 9, wireType 0 =*/72).bool(message.isPlayerPartner);
        if (message.job != null && Object.hasOwnProperty.call(message, "job"))
            writer.uint32(/* id 10, wireType 2 =*/82).string(message.job);
        if (message.lastName != null && Object.hasOwnProperty.call(message, "lastName"))
            writer.uint32(/* id 11, wireType 2 =*/90).string(message.lastName);
        if (message.qualifications != null && message.qualifications.length)
            for (var i = 0; i < message.qualifications.length; ++i)
                writer.uint32(/* id 12, wireType 2 =*/98).string(message.qualifications[i]);
        if (message.sex != null && Object.hasOwnProperty.call(message, "sex"))
            writer.uint32(/* id 13, wireType 2 =*/106).string(message.sex);
        return writer;
    };

    /**
     * Encodes the specified Character message, length delimited. Does not implicitly {@link Character.verify|verify} messages.
     * @function encodeDelimited
     * @memberof Character
     * @static
     * @param {ICharacter} message Character message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Character.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a Character message from the specified reader or buffer.
     * @function decode
     * @memberof Character
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {Character} Character
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Character.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.Character();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
            case 1: {
                    message.affection = reader.float();
                    break;
                }
            case 2: {
                    message.alive = reader.bool();
                    break;
                }
            case 3: {
                    message.beingType = reader.string();
                    break;
                }
            case 4: {
                    message.birthdate = reader.string();
                    break;
                }
            case 5: {
                    message.dateCooldownStart = reader.string();
                    break;
                }
            case 6: {
                    message.deathdate = reader.string();
                    break;
                }
            case 7: {
                    message.firstName = reader.string();
                    break;
                }
            case 8: {
                    message.id = reader.string();
                    break;
                }
            case 9: {
                    message.isPlayerPartner = reader.bool();
                    break;
                }
            case 10: {
                    message.job = reader.string();
                    break;
                }
            case 11: {
                    message.lastName = reader.string();
                    break;
                }
            case 12: {
                    if (!(message.qualifications && message.qualifications.length))
                        message.qualifications = [];
                    message.qualifications.push(reader.string());
                    break;
                }
            case 13: {
                    message.sex = reader.string();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a Character message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof Character
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {Character} Character
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Character.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a Character message.
     * @function verify
     * @memberof Character
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    Character.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.affection != null && message.hasOwnProperty("affection"))
            if (typeof message.affection !== "number")
                return "affection: number expected";
        if (message.alive != null && message.hasOwnProperty("alive"))
            if (typeof message.alive !== "boolean")
                return "alive: boolean expected";
        if (message.beingType != null && message.hasOwnProperty("beingType"))
            if (!$util.isString(message.beingType))
                return "beingType: string expected";
        if (message.birthdate != null && message.hasOwnProperty("birthdate"))
            if (!$util.isString(message.birthdate))
                return "birthdate: string expected";
        if (message.dateCooldownStart != null && message.hasOwnProperty("dateCooldownStart"))
            if (!$util.isString(message.dateCooldownStart))
                return "dateCooldownStart: string expected";
        if (message.deathdate != null && message.hasOwnProperty("deathdate"))
            if (!$util.isString(message.deathdate))
                return "deathdate: string expected";
        if (message.firstName != null && message.hasOwnProperty("firstName"))
            if (!$util.isString(message.firstName))
                return "firstName: string expected";
        if (message.id != null && message.hasOwnProperty("id"))
            if (!$util.isString(message.id))
                return "id: string expected";
        if (message.isPlayerPartner != null && message.hasOwnProperty("isPlayerPartner"))
            if (typeof message.isPlayerPartner !== "boolean")
                return "isPlayerPartner: boolean expected";
        if (message.job != null && message.hasOwnProperty("job"))
            if (!$util.isString(message.job))
                return "job: string expected";
        if (message.lastName != null && message.hasOwnProperty("lastName"))
            if (!$util.isString(message.lastName))
                return "lastName: string expected";
        if (message.qualifications != null && message.hasOwnProperty("qualifications")) {
            if (!Array.isArray(message.qualifications))
                return "qualifications: array expected";
            for (var i = 0; i < message.qualifications.length; ++i)
                if (!$util.isString(message.qualifications[i]))
                    return "qualifications: string[] expected";
        }
        if (message.sex != null && message.hasOwnProperty("sex"))
            if (!$util.isString(message.sex))
                return "sex: string expected";
        return null;
    };

    /**
     * Creates a Character message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof Character
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {Character} Character
     */
    Character.fromObject = function fromObject(object) {
        if (object instanceof $root.Character)
            return object;
        var message = new $root.Character();
        if (object.affection != null)
            message.affection = Number(object.affection);
        if (object.alive != null)
            message.alive = Boolean(object.alive);
        if (object.beingType != null)
            message.beingType = String(object.beingType);
        if (object.birthdate != null)
            message.birthdate = String(object.birthdate);
        if (object.dateCooldownStart != null)
            message.dateCooldownStart = String(object.dateCooldownStart);
        if (object.deathdate != null)
            message.deathdate = String(object.deathdate);
        if (object.firstName != null)
            message.firstName = String(object.firstName);
        if (object.id != null)
            message.id = String(object.id);
        if (object.isPlayerPartner != null)
            message.isPlayerPartner = Boolean(object.isPlayerPartner);
        if (object.job != null)
            message.job = String(object.job);
        if (object.lastName != null)
            message.lastName = String(object.lastName);
        if (object.qualifications) {
            if (!Array.isArray(object.qualifications))
                throw TypeError(".Character.qualifications: array expected");
            message.qualifications = [];
            for (var i = 0; i < object.qualifications.length; ++i)
                message.qualifications[i] = String(object.qualifications[i]);
        }
        if (object.sex != null)
            message.sex = String(object.sex);
        return message;
    };

    /**
     * Creates a plain object from a Character message. Also converts values to other types if specified.
     * @function toObject
     * @memberof Character
     * @static
     * @param {Character} message Character
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    Character.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.arrays || options.defaults)
            object.qualifications = [];
        if (options.defaults) {
            object.affection = 0;
            object.alive = false;
            object.beingType = "";
            object.birthdate = "";
            object.dateCooldownStart = "";
            object.deathdate = "";
            object.firstName = "";
            object.id = "";
            object.isPlayerPartner = false;
            object.job = "";
            object.lastName = "";
            object.sex = "";
        }
        if (message.affection != null && message.hasOwnProperty("affection"))
            object.affection = options.json && !isFinite(message.affection) ? String(message.affection) : message.affection;
        if (message.alive != null && message.hasOwnProperty("alive"))
            object.alive = message.alive;
        if (message.beingType != null && message.hasOwnProperty("beingType"))
            object.beingType = message.beingType;
        if (message.birthdate != null && message.hasOwnProperty("birthdate"))
            object.birthdate = message.birthdate;
        if (message.dateCooldownStart != null && message.hasOwnProperty("dateCooldownStart"))
            object.dateCooldownStart = message.dateCooldownStart;
        if (message.deathdate != null && message.hasOwnProperty("deathdate"))
            object.deathdate = message.deathdate;
        if (message.firstName != null && message.hasOwnProperty("firstName"))
            object.firstName = message.firstName;
        if (message.id != null && message.hasOwnProperty("id"))
            object.id = message.id;
        if (message.isPlayerPartner != null && message.hasOwnProperty("isPlayerPartner"))
            object.isPlayerPartner = message.isPlayerPartner;
        if (message.job != null && message.hasOwnProperty("job"))
            object.job = message.job;
        if (message.lastName != null && message.hasOwnProperty("lastName"))
            object.lastName = message.lastName;
        if (message.qualifications && message.qualifications.length) {
            object.qualifications = [];
            for (var j = 0; j < message.qualifications.length; ++j)
                object.qualifications[j] = message.qualifications[j];
        }
        if (message.sex != null && message.hasOwnProperty("sex"))
            object.sex = message.sex;
        return object;
    };

    /**
     * Converts this Character to JSON.
     * @function toJSON
     * @memberof Character
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    Character.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for Character
     * @function getTypeUrl
     * @memberof Character
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    Character.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/Character";
    };

    return Character;
})();

$root.Condition = (function() {

    /**
     * Properties of a Condition.
     * @exports ICondition
     * @interface ICondition
     * @property {boolean|null} [aura] Condition aura
     * @property {Array.<string>|null} [effect] Condition effect
     * @property {Array.<number>|null} [effectMagnitude] Condition effectMagnitude
     * @property {Array.<string>|null} [effectStyle] Condition effectStyle
     * @property {Array.<number>|null} [healthDamage] Condition healthDamage
     * @property {string|null} [icon] Condition icon
     * @property {string|null} [id] Condition id
     * @property {string|null} [name] Condition name
     * @property {string|null} [placedBy] Condition placedBy
     * @property {Array.<number>|null} [sanityDamage] Condition sanityDamage
     * @property {string|null} [style] Condition style
     * @property {number|null} [turns] Condition turns
     */

    /**
     * Constructs a new Condition.
     * @exports Condition
     * @classdesc Represents a Condition.
     * @implements ICondition
     * @constructor
     * @param {ICondition=} [properties] Properties to set
     */
    function Condition(properties) {
        this.effect = [];
        this.effectMagnitude = [];
        this.effectStyle = [];
        this.healthDamage = [];
        this.sanityDamage = [];
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * Condition aura.
     * @member {boolean} aura
     * @memberof Condition
     * @instance
     */
    Condition.prototype.aura = false;

    /**
     * Condition effect.
     * @member {Array.<string>} effect
     * @memberof Condition
     * @instance
     */
    Condition.prototype.effect = $util.emptyArray;

    /**
     * Condition effectMagnitude.
     * @member {Array.<number>} effectMagnitude
     * @memberof Condition
     * @instance
     */
    Condition.prototype.effectMagnitude = $util.emptyArray;

    /**
     * Condition effectStyle.
     * @member {Array.<string>} effectStyle
     * @memberof Condition
     * @instance
     */
    Condition.prototype.effectStyle = $util.emptyArray;

    /**
     * Condition healthDamage.
     * @member {Array.<number>} healthDamage
     * @memberof Condition
     * @instance
     */
    Condition.prototype.healthDamage = $util.emptyArray;

    /**
     * Condition icon.
     * @member {string} icon
     * @memberof Condition
     * @instance
     */
    Condition.prototype.icon = "";

    /**
     * Condition id.
     * @member {string} id
     * @memberof Condition
     * @instance
     */
    Condition.prototype.id = "";

    /**
     * Condition name.
     * @member {string} name
     * @memberof Condition
     * @instance
     */
    Condition.prototype.name = "";

    /**
     * Condition placedBy.
     * @member {string} placedBy
     * @memberof Condition
     * @instance
     */
    Condition.prototype.placedBy = "";

    /**
     * Condition sanityDamage.
     * @member {Array.<number>} sanityDamage
     * @memberof Condition
     * @instance
     */
    Condition.prototype.sanityDamage = $util.emptyArray;

    /**
     * Condition style.
     * @member {string} style
     * @memberof Condition
     * @instance
     */
    Condition.prototype.style = "";

    /**
     * Condition turns.
     * @member {number} turns
     * @memberof Condition
     * @instance
     */
    Condition.prototype.turns = 0;

    /**
     * Creates a new Condition instance using the specified properties.
     * @function create
     * @memberof Condition
     * @static
     * @param {ICondition=} [properties] Properties to set
     * @returns {Condition} Condition instance
     */
    Condition.create = function create(properties) {
        return new Condition(properties);
    };

    /**
     * Encodes the specified Condition message. Does not implicitly {@link Condition.verify|verify} messages.
     * @function encode
     * @memberof Condition
     * @static
     * @param {ICondition} message Condition message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Condition.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.aura != null && Object.hasOwnProperty.call(message, "aura"))
            writer.uint32(/* id 1, wireType 0 =*/8).bool(message.aura);
        if (message.effect != null && message.effect.length)
            for (var i = 0; i < message.effect.length; ++i)
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.effect[i]);
        if (message.effectMagnitude != null && message.effectMagnitude.length) {
            writer.uint32(/* id 3, wireType 2 =*/26).fork();
            for (var i = 0; i < message.effectMagnitude.length; ++i)
                writer.float(message.effectMagnitude[i]);
            writer.ldelim();
        }
        if (message.effectStyle != null && message.effectStyle.length)
            for (var i = 0; i < message.effectStyle.length; ++i)
                writer.uint32(/* id 4, wireType 2 =*/34).string(message.effectStyle[i]);
        if (message.healthDamage != null && message.healthDamage.length) {
            writer.uint32(/* id 5, wireType 2 =*/42).fork();
            for (var i = 0; i < message.healthDamage.length; ++i)
                writer.float(message.healthDamage[i]);
            writer.ldelim();
        }
        if (message.icon != null && Object.hasOwnProperty.call(message, "icon"))
            writer.uint32(/* id 6, wireType 2 =*/50).string(message.icon);
        if (message.id != null && Object.hasOwnProperty.call(message, "id"))
            writer.uint32(/* id 7, wireType 2 =*/58).string(message.id);
        if (message.name != null && Object.hasOwnProperty.call(message, "name"))
            writer.uint32(/* id 8, wireType 2 =*/66).string(message.name);
        if (message.placedBy != null && Object.hasOwnProperty.call(message, "placedBy"))
            writer.uint32(/* id 9, wireType 2 =*/74).string(message.placedBy);
        if (message.sanityDamage != null && message.sanityDamage.length) {
            writer.uint32(/* id 10, wireType 2 =*/82).fork();
            for (var i = 0; i < message.sanityDamage.length; ++i)
                writer.float(message.sanityDamage[i]);
            writer.ldelim();
        }
        if (message.style != null && Object.hasOwnProperty.call(message, "style"))
            writer.uint32(/* id 11, wireType 2 =*/90).string(message.style);
        if (message.turns != null && Object.hasOwnProperty.call(message, "turns"))
            writer.uint32(/* id 12, wireType 0 =*/96).int32(message.turns);
        return writer;
    };

    /**
     * Encodes the specified Condition message, length delimited. Does not implicitly {@link Condition.verify|verify} messages.
     * @function encodeDelimited
     * @memberof Condition
     * @static
     * @param {ICondition} message Condition message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Condition.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a Condition message from the specified reader or buffer.
     * @function decode
     * @memberof Condition
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {Condition} Condition
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Condition.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.Condition();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
            case 1: {
                    message.aura = reader.bool();
                    break;
                }
            case 2: {
                    if (!(message.effect && message.effect.length))
                        message.effect = [];
                    message.effect.push(reader.string());
                    break;
                }
            case 3: {
                    if (!(message.effectMagnitude && message.effectMagnitude.length))
                        message.effectMagnitude = [];
                    if ((tag & 7) === 2) {
                        var end2 = reader.uint32() + reader.pos;
                        while (reader.pos < end2)
                            message.effectMagnitude.push(reader.float());
                    } else
                        message.effectMagnitude.push(reader.float());
                    break;
                }
            case 4: {
                    if (!(message.effectStyle && message.effectStyle.length))
                        message.effectStyle = [];
                    message.effectStyle.push(reader.string());
                    break;
                }
            case 5: {
                    if (!(message.healthDamage && message.healthDamage.length))
                        message.healthDamage = [];
                    if ((tag & 7) === 2) {
                        var end2 = reader.uint32() + reader.pos;
                        while (reader.pos < end2)
                            message.healthDamage.push(reader.float());
                    } else
                        message.healthDamage.push(reader.float());
                    break;
                }
            case 6: {
                    message.icon = reader.string();
                    break;
                }
            case 7: {
                    message.id = reader.string();
                    break;
                }
            case 8: {
                    message.name = reader.string();
                    break;
                }
            case 9: {
                    message.placedBy = reader.string();
                    break;
                }
            case 10: {
                    if (!(message.sanityDamage && message.sanityDamage.length))
                        message.sanityDamage = [];
                    if ((tag & 7) === 2) {
                        var end2 = reader.uint32() + reader.pos;
                        while (reader.pos < end2)
                            message.sanityDamage.push(reader.float());
                    } else
                        message.sanityDamage.push(reader.float());
                    break;
                }
            case 11: {
                    message.style = reader.string();
                    break;
                }
            case 12: {
                    message.turns = reader.int32();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a Condition message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof Condition
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {Condition} Condition
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Condition.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a Condition message.
     * @function verify
     * @memberof Condition
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    Condition.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.aura != null && message.hasOwnProperty("aura"))
            if (typeof message.aura !== "boolean")
                return "aura: boolean expected";
        if (message.effect != null && message.hasOwnProperty("effect")) {
            if (!Array.isArray(message.effect))
                return "effect: array expected";
            for (var i = 0; i < message.effect.length; ++i)
                if (!$util.isString(message.effect[i]))
                    return "effect: string[] expected";
        }
        if (message.effectMagnitude != null && message.hasOwnProperty("effectMagnitude")) {
            if (!Array.isArray(message.effectMagnitude))
                return "effectMagnitude: array expected";
            for (var i = 0; i < message.effectMagnitude.length; ++i)
                if (typeof message.effectMagnitude[i] !== "number")
                    return "effectMagnitude: number[] expected";
        }
        if (message.effectStyle != null && message.hasOwnProperty("effectStyle")) {
            if (!Array.isArray(message.effectStyle))
                return "effectStyle: array expected";
            for (var i = 0; i < message.effectStyle.length; ++i)
                if (!$util.isString(message.effectStyle[i]))
                    return "effectStyle: string[] expected";
        }
        if (message.healthDamage != null && message.hasOwnProperty("healthDamage")) {
            if (!Array.isArray(message.healthDamage))
                return "healthDamage: array expected";
            for (var i = 0; i < message.healthDamage.length; ++i)
                if (typeof message.healthDamage[i] !== "number")
                    return "healthDamage: number[] expected";
        }
        if (message.icon != null && message.hasOwnProperty("icon"))
            if (!$util.isString(message.icon))
                return "icon: string expected";
        if (message.id != null && message.hasOwnProperty("id"))
            if (!$util.isString(message.id))
                return "id: string expected";
        if (message.name != null && message.hasOwnProperty("name"))
            if (!$util.isString(message.name))
                return "name: string expected";
        if (message.placedBy != null && message.hasOwnProperty("placedBy"))
            if (!$util.isString(message.placedBy))
                return "placedBy: string expected";
        if (message.sanityDamage != null && message.hasOwnProperty("sanityDamage")) {
            if (!Array.isArray(message.sanityDamage))
                return "sanityDamage: array expected";
            for (var i = 0; i < message.sanityDamage.length; ++i)
                if (typeof message.sanityDamage[i] !== "number")
                    return "sanityDamage: number[] expected";
        }
        if (message.style != null && message.hasOwnProperty("style"))
            if (!$util.isString(message.style))
                return "style: string expected";
        if (message.turns != null && message.hasOwnProperty("turns"))
            if (!$util.isInteger(message.turns))
                return "turns: integer expected";
        return null;
    };

    /**
     * Creates a Condition message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof Condition
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {Condition} Condition
     */
    Condition.fromObject = function fromObject(object) {
        if (object instanceof $root.Condition)
            return object;
        var message = new $root.Condition();
        if (object.aura != null)
            message.aura = Boolean(object.aura);
        if (object.effect) {
            if (!Array.isArray(object.effect))
                throw TypeError(".Condition.effect: array expected");
            message.effect = [];
            for (var i = 0; i < object.effect.length; ++i)
                message.effect[i] = String(object.effect[i]);
        }
        if (object.effectMagnitude) {
            if (!Array.isArray(object.effectMagnitude))
                throw TypeError(".Condition.effectMagnitude: array expected");
            message.effectMagnitude = [];
            for (var i = 0; i < object.effectMagnitude.length; ++i)
                message.effectMagnitude[i] = Number(object.effectMagnitude[i]);
        }
        if (object.effectStyle) {
            if (!Array.isArray(object.effectStyle))
                throw TypeError(".Condition.effectStyle: array expected");
            message.effectStyle = [];
            for (var i = 0; i < object.effectStyle.length; ++i)
                message.effectStyle[i] = String(object.effectStyle[i]);
        }
        if (object.healthDamage) {
            if (!Array.isArray(object.healthDamage))
                throw TypeError(".Condition.healthDamage: array expected");
            message.healthDamage = [];
            for (var i = 0; i < object.healthDamage.length; ++i)
                message.healthDamage[i] = Number(object.healthDamage[i]);
        }
        if (object.icon != null)
            message.icon = String(object.icon);
        if (object.id != null)
            message.id = String(object.id);
        if (object.name != null)
            message.name = String(object.name);
        if (object.placedBy != null)
            message.placedBy = String(object.placedBy);
        if (object.sanityDamage) {
            if (!Array.isArray(object.sanityDamage))
                throw TypeError(".Condition.sanityDamage: array expected");
            message.sanityDamage = [];
            for (var i = 0; i < object.sanityDamage.length; ++i)
                message.sanityDamage[i] = Number(object.sanityDamage[i]);
        }
        if (object.style != null)
            message.style = String(object.style);
        if (object.turns != null)
            message.turns = object.turns | 0;
        return message;
    };

    /**
     * Creates a plain object from a Condition message. Also converts values to other types if specified.
     * @function toObject
     * @memberof Condition
     * @static
     * @param {Condition} message Condition
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    Condition.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.arrays || options.defaults) {
            object.effect = [];
            object.effectMagnitude = [];
            object.effectStyle = [];
            object.healthDamage = [];
            object.sanityDamage = [];
        }
        if (options.defaults) {
            object.aura = false;
            object.icon = "";
            object.id = "";
            object.name = "";
            object.placedBy = "";
            object.style = "";
            object.turns = 0;
        }
        if (message.aura != null && message.hasOwnProperty("aura"))
            object.aura = message.aura;
        if (message.effect && message.effect.length) {
            object.effect = [];
            for (var j = 0; j < message.effect.length; ++j)
                object.effect[j] = message.effect[j];
        }
        if (message.effectMagnitude && message.effectMagnitude.length) {
            object.effectMagnitude = [];
            for (var j = 0; j < message.effectMagnitude.length; ++j)
                object.effectMagnitude[j] = options.json && !isFinite(message.effectMagnitude[j]) ? String(message.effectMagnitude[j]) : message.effectMagnitude[j];
        }
        if (message.effectStyle && message.effectStyle.length) {
            object.effectStyle = [];
            for (var j = 0; j < message.effectStyle.length; ++j)
                object.effectStyle[j] = message.effectStyle[j];
        }
        if (message.healthDamage && message.healthDamage.length) {
            object.healthDamage = [];
            for (var j = 0; j < message.healthDamage.length; ++j)
                object.healthDamage[j] = options.json && !isFinite(message.healthDamage[j]) ? String(message.healthDamage[j]) : message.healthDamage[j];
        }
        if (message.icon != null && message.hasOwnProperty("icon"))
            object.icon = message.icon;
        if (message.id != null && message.hasOwnProperty("id"))
            object.id = message.id;
        if (message.name != null && message.hasOwnProperty("name"))
            object.name = message.name;
        if (message.placedBy != null && message.hasOwnProperty("placedBy"))
            object.placedBy = message.placedBy;
        if (message.sanityDamage && message.sanityDamage.length) {
            object.sanityDamage = [];
            for (var j = 0; j < message.sanityDamage.length; ++j)
                object.sanityDamage[j] = options.json && !isFinite(message.sanityDamage[j]) ? String(message.sanityDamage[j]) : message.sanityDamage[j];
        }
        if (message.style != null && message.hasOwnProperty("style"))
            object.style = message.style;
        if (message.turns != null && message.hasOwnProperty("turns"))
            object.turns = message.turns;
        return object;
    };

    /**
     * Converts this Condition to JSON.
     * @function toJSON
     * @memberof Condition
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    Condition.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for Condition
     * @function getTypeUrl
     * @memberof Condition
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    Condition.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/Condition";
    };

    return Condition;
})();

$root.Creature = (function() {

    /**
     * Properties of a Creature.
     * @exports ICreature
     * @interface ICreature
     * @property {number|null} [attackPower] Creature attackPower
     * @property {number|null} [baseArmor] Creature baseArmor
     * @property {string|null} [beingType] Creature beingType
     * @property {Array.<ICondition>|null} [conditions] Creature conditions
     * @property {string|null} [creatureSpecies] Creature creatureSpecies
     * @property {number|null} [energy] Creature energy
     * @property {number|null} [energyMax] Creature energyMax
     * @property {number|null} [energyRegen] Creature energyRegen
     * @property {number|null} [health] Creature health
     * @property {number|null} [healthMax] Creature healthMax
     * @property {string|null} [id] Creature id
     * @property {number|null} [sanity] Creature sanity
     * @property {number|null} [sanityMax] Creature sanityMax
     * @property {Array.<string>|null} [attacks] Creature attacks
     */

    /**
     * Constructs a new Creature.
     * @exports Creature
     * @classdesc Represents a Creature.
     * @implements ICreature
     * @constructor
     * @param {ICreature=} [properties] Properties to set
     */
    function Creature(properties) {
        this.conditions = [];
        this.attacks = [];
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * Creature attackPower.
     * @member {number} attackPower
     * @memberof Creature
     * @instance
     */
    Creature.prototype.attackPower = 0;

    /**
     * Creature baseArmor.
     * @member {number} baseArmor
     * @memberof Creature
     * @instance
     */
    Creature.prototype.baseArmor = 0;

    /**
     * Creature beingType.
     * @member {string} beingType
     * @memberof Creature
     * @instance
     */
    Creature.prototype.beingType = "";

    /**
     * Creature conditions.
     * @member {Array.<ICondition>} conditions
     * @memberof Creature
     * @instance
     */
    Creature.prototype.conditions = $util.emptyArray;

    /**
     * Creature creatureSpecies.
     * @member {string} creatureSpecies
     * @memberof Creature
     * @instance
     */
    Creature.prototype.creatureSpecies = "";

    /**
     * Creature energy.
     * @member {number} energy
     * @memberof Creature
     * @instance
     */
    Creature.prototype.energy = 0;

    /**
     * Creature energyMax.
     * @member {number} energyMax
     * @memberof Creature
     * @instance
     */
    Creature.prototype.energyMax = 0;

    /**
     * Creature energyRegen.
     * @member {number} energyRegen
     * @memberof Creature
     * @instance
     */
    Creature.prototype.energyRegen = 0;

    /**
     * Creature health.
     * @member {number} health
     * @memberof Creature
     * @instance
     */
    Creature.prototype.health = 0;

    /**
     * Creature healthMax.
     * @member {number} healthMax
     * @memberof Creature
     * @instance
     */
    Creature.prototype.healthMax = 0;

    /**
     * Creature id.
     * @member {string} id
     * @memberof Creature
     * @instance
     */
    Creature.prototype.id = "";

    /**
     * Creature sanity.
     * @member {number} sanity
     * @memberof Creature
     * @instance
     */
    Creature.prototype.sanity = 0;

    /**
     * Creature sanityMax.
     * @member {number} sanityMax
     * @memberof Creature
     * @instance
     */
    Creature.prototype.sanityMax = 0;

    /**
     * Creature attacks.
     * @member {Array.<string>} attacks
     * @memberof Creature
     * @instance
     */
    Creature.prototype.attacks = $util.emptyArray;

    /**
     * Creates a new Creature instance using the specified properties.
     * @function create
     * @memberof Creature
     * @static
     * @param {ICreature=} [properties] Properties to set
     * @returns {Creature} Creature instance
     */
    Creature.create = function create(properties) {
        return new Creature(properties);
    };

    /**
     * Encodes the specified Creature message. Does not implicitly {@link Creature.verify|verify} messages.
     * @function encode
     * @memberof Creature
     * @static
     * @param {ICreature} message Creature message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Creature.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.attackPower != null && Object.hasOwnProperty.call(message, "attackPower"))
            writer.uint32(/* id 1, wireType 5 =*/13).float(message.attackPower);
        if (message.baseArmor != null && Object.hasOwnProperty.call(message, "baseArmor"))
            writer.uint32(/* id 2, wireType 5 =*/21).float(message.baseArmor);
        if (message.beingType != null && Object.hasOwnProperty.call(message, "beingType"))
            writer.uint32(/* id 3, wireType 2 =*/26).string(message.beingType);
        if (message.conditions != null && message.conditions.length)
            for (var i = 0; i < message.conditions.length; ++i)
                $root.Condition.encode(message.conditions[i], writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
        if (message.creatureSpecies != null && Object.hasOwnProperty.call(message, "creatureSpecies"))
            writer.uint32(/* id 5, wireType 2 =*/42).string(message.creatureSpecies);
        if (message.energy != null && Object.hasOwnProperty.call(message, "energy"))
            writer.uint32(/* id 6, wireType 5 =*/53).float(message.energy);
        if (message.energyMax != null && Object.hasOwnProperty.call(message, "energyMax"))
            writer.uint32(/* id 7, wireType 5 =*/61).float(message.energyMax);
        if (message.energyRegen != null && Object.hasOwnProperty.call(message, "energyRegen"))
            writer.uint32(/* id 8, wireType 5 =*/69).float(message.energyRegen);
        if (message.health != null && Object.hasOwnProperty.call(message, "health"))
            writer.uint32(/* id 9, wireType 5 =*/77).float(message.health);
        if (message.healthMax != null && Object.hasOwnProperty.call(message, "healthMax"))
            writer.uint32(/* id 10, wireType 5 =*/85).float(message.healthMax);
        if (message.id != null && Object.hasOwnProperty.call(message, "id"))
            writer.uint32(/* id 11, wireType 2 =*/90).string(message.id);
        if (message.sanity != null && Object.hasOwnProperty.call(message, "sanity"))
            writer.uint32(/* id 12, wireType 5 =*/101).float(message.sanity);
        if (message.sanityMax != null && Object.hasOwnProperty.call(message, "sanityMax"))
            writer.uint32(/* id 13, wireType 5 =*/109).float(message.sanityMax);
        if (message.attacks != null && message.attacks.length)
            for (var i = 0; i < message.attacks.length; ++i)
                writer.uint32(/* id 14, wireType 2 =*/114).string(message.attacks[i]);
        return writer;
    };

    /**
     * Encodes the specified Creature message, length delimited. Does not implicitly {@link Creature.verify|verify} messages.
     * @function encodeDelimited
     * @memberof Creature
     * @static
     * @param {ICreature} message Creature message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Creature.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a Creature message from the specified reader or buffer.
     * @function decode
     * @memberof Creature
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {Creature} Creature
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Creature.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.Creature();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
            case 1: {
                    message.attackPower = reader.float();
                    break;
                }
            case 2: {
                    message.baseArmor = reader.float();
                    break;
                }
            case 3: {
                    message.beingType = reader.string();
                    break;
                }
            case 4: {
                    if (!(message.conditions && message.conditions.length))
                        message.conditions = [];
                    message.conditions.push($root.Condition.decode(reader, reader.uint32()));
                    break;
                }
            case 5: {
                    message.creatureSpecies = reader.string();
                    break;
                }
            case 6: {
                    message.energy = reader.float();
                    break;
                }
            case 7: {
                    message.energyMax = reader.float();
                    break;
                }
            case 8: {
                    message.energyRegen = reader.float();
                    break;
                }
            case 9: {
                    message.health = reader.float();
                    break;
                }
            case 10: {
                    message.healthMax = reader.float();
                    break;
                }
            case 11: {
                    message.id = reader.string();
                    break;
                }
            case 12: {
                    message.sanity = reader.float();
                    break;
                }
            case 13: {
                    message.sanityMax = reader.float();
                    break;
                }
            case 14: {
                    if (!(message.attacks && message.attacks.length))
                        message.attacks = [];
                    message.attacks.push(reader.string());
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a Creature message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof Creature
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {Creature} Creature
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Creature.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a Creature message.
     * @function verify
     * @memberof Creature
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    Creature.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.attackPower != null && message.hasOwnProperty("attackPower"))
            if (typeof message.attackPower !== "number")
                return "attackPower: number expected";
        if (message.baseArmor != null && message.hasOwnProperty("baseArmor"))
            if (typeof message.baseArmor !== "number")
                return "baseArmor: number expected";
        if (message.beingType != null && message.hasOwnProperty("beingType"))
            if (!$util.isString(message.beingType))
                return "beingType: string expected";
        if (message.conditions != null && message.hasOwnProperty("conditions")) {
            if (!Array.isArray(message.conditions))
                return "conditions: array expected";
            for (var i = 0; i < message.conditions.length; ++i) {
                var error = $root.Condition.verify(message.conditions[i]);
                if (error)
                    return "conditions." + error;
            }
        }
        if (message.creatureSpecies != null && message.hasOwnProperty("creatureSpecies"))
            if (!$util.isString(message.creatureSpecies))
                return "creatureSpecies: string expected";
        if (message.energy != null && message.hasOwnProperty("energy"))
            if (typeof message.energy !== "number")
                return "energy: number expected";
        if (message.energyMax != null && message.hasOwnProperty("energyMax"))
            if (typeof message.energyMax !== "number")
                return "energyMax: number expected";
        if (message.energyRegen != null && message.hasOwnProperty("energyRegen"))
            if (typeof message.energyRegen !== "number")
                return "energyRegen: number expected";
        if (message.health != null && message.hasOwnProperty("health"))
            if (typeof message.health !== "number")
                return "health: number expected";
        if (message.healthMax != null && message.hasOwnProperty("healthMax"))
            if (typeof message.healthMax !== "number")
                return "healthMax: number expected";
        if (message.id != null && message.hasOwnProperty("id"))
            if (!$util.isString(message.id))
                return "id: string expected";
        if (message.sanity != null && message.hasOwnProperty("sanity"))
            if (typeof message.sanity !== "number")
                return "sanity: number expected";
        if (message.sanityMax != null && message.hasOwnProperty("sanityMax"))
            if (typeof message.sanityMax !== "number")
                return "sanityMax: number expected";
        if (message.attacks != null && message.hasOwnProperty("attacks")) {
            if (!Array.isArray(message.attacks))
                return "attacks: array expected";
            for (var i = 0; i < message.attacks.length; ++i)
                if (!$util.isString(message.attacks[i]))
                    return "attacks: string[] expected";
        }
        return null;
    };

    /**
     * Creates a Creature message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof Creature
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {Creature} Creature
     */
    Creature.fromObject = function fromObject(object) {
        if (object instanceof $root.Creature)
            return object;
        var message = new $root.Creature();
        if (object.attackPower != null)
            message.attackPower = Number(object.attackPower);
        if (object.baseArmor != null)
            message.baseArmor = Number(object.baseArmor);
        if (object.beingType != null)
            message.beingType = String(object.beingType);
        if (object.conditions) {
            if (!Array.isArray(object.conditions))
                throw TypeError(".Creature.conditions: array expected");
            message.conditions = [];
            for (var i = 0; i < object.conditions.length; ++i) {
                if (typeof object.conditions[i] !== "object")
                    throw TypeError(".Creature.conditions: object expected");
                message.conditions[i] = $root.Condition.fromObject(object.conditions[i]);
            }
        }
        if (object.creatureSpecies != null)
            message.creatureSpecies = String(object.creatureSpecies);
        if (object.energy != null)
            message.energy = Number(object.energy);
        if (object.energyMax != null)
            message.energyMax = Number(object.energyMax);
        if (object.energyRegen != null)
            message.energyRegen = Number(object.energyRegen);
        if (object.health != null)
            message.health = Number(object.health);
        if (object.healthMax != null)
            message.healthMax = Number(object.healthMax);
        if (object.id != null)
            message.id = String(object.id);
        if (object.sanity != null)
            message.sanity = Number(object.sanity);
        if (object.sanityMax != null)
            message.sanityMax = Number(object.sanityMax);
        if (object.attacks) {
            if (!Array.isArray(object.attacks))
                throw TypeError(".Creature.attacks: array expected");
            message.attacks = [];
            for (var i = 0; i < object.attacks.length; ++i)
                message.attacks[i] = String(object.attacks[i]);
        }
        return message;
    };

    /**
     * Creates a plain object from a Creature message. Also converts values to other types if specified.
     * @function toObject
     * @memberof Creature
     * @static
     * @param {Creature} message Creature
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    Creature.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.arrays || options.defaults) {
            object.conditions = [];
            object.attacks = [];
        }
        if (options.defaults) {
            object.attackPower = 0;
            object.baseArmor = 0;
            object.beingType = "";
            object.creatureSpecies = "";
            object.energy = 0;
            object.energyMax = 0;
            object.energyRegen = 0;
            object.health = 0;
            object.healthMax = 0;
            object.id = "";
            object.sanity = 0;
            object.sanityMax = 0;
        }
        if (message.attackPower != null && message.hasOwnProperty("attackPower"))
            object.attackPower = options.json && !isFinite(message.attackPower) ? String(message.attackPower) : message.attackPower;
        if (message.baseArmor != null && message.hasOwnProperty("baseArmor"))
            object.baseArmor = options.json && !isFinite(message.baseArmor) ? String(message.baseArmor) : message.baseArmor;
        if (message.beingType != null && message.hasOwnProperty("beingType"))
            object.beingType = message.beingType;
        if (message.conditions && message.conditions.length) {
            object.conditions = [];
            for (var j = 0; j < message.conditions.length; ++j)
                object.conditions[j] = $root.Condition.toObject(message.conditions[j], options);
        }
        if (message.creatureSpecies != null && message.hasOwnProperty("creatureSpecies"))
            object.creatureSpecies = message.creatureSpecies;
        if (message.energy != null && message.hasOwnProperty("energy"))
            object.energy = options.json && !isFinite(message.energy) ? String(message.energy) : message.energy;
        if (message.energyMax != null && message.hasOwnProperty("energyMax"))
            object.energyMax = options.json && !isFinite(message.energyMax) ? String(message.energyMax) : message.energyMax;
        if (message.energyRegen != null && message.hasOwnProperty("energyRegen"))
            object.energyRegen = options.json && !isFinite(message.energyRegen) ? String(message.energyRegen) : message.energyRegen;
        if (message.health != null && message.hasOwnProperty("health"))
            object.health = options.json && !isFinite(message.health) ? String(message.health) : message.health;
        if (message.healthMax != null && message.hasOwnProperty("healthMax"))
            object.healthMax = options.json && !isFinite(message.healthMax) ? String(message.healthMax) : message.healthMax;
        if (message.id != null && message.hasOwnProperty("id"))
            object.id = message.id;
        if (message.sanity != null && message.hasOwnProperty("sanity"))
            object.sanity = options.json && !isFinite(message.sanity) ? String(message.sanity) : message.sanity;
        if (message.sanityMax != null && message.hasOwnProperty("sanityMax"))
            object.sanityMax = options.json && !isFinite(message.sanityMax) ? String(message.sanityMax) : message.sanityMax;
        if (message.attacks && message.attacks.length) {
            object.attacks = [];
            for (var j = 0; j < message.attacks.length; ++j)
                object.attacks[j] = message.attacks[j];
        }
        return object;
    };

    /**
     * Converts this Creature to JSON.
     * @function toJSON
     * @memberof Creature
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    Creature.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for Creature
     * @function getTypeUrl
     * @memberof Creature
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    Creature.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/Creature";
    };

    return Creature;
})();

$root.CurrentDungeon = (function() {

    /**
     * Properties of a CurrentDungeon.
     * @exports ICurrentDungeon
     * @interface ICurrentDungeon
     * @property {ITile|null} [currentPosition] CurrentDungeon currentPosition
     * @property {Array.<ITile>|null} [dungeonMap] CurrentDungeon dungeonMap
     * @property {IEnemy|null} [enemy] CurrentDungeon enemy
     * @property {boolean|null} [fightingBoss] CurrentDungeon fightingBoss
     * @property {string|null} [instance] CurrentDungeon instance
     * @property {string|null} [level] CurrentDungeon level
     * @property {IBoundingBox|null} [mapDimensions] CurrentDungeon mapDimensions
     */

    /**
     * Constructs a new CurrentDungeon.
     * @exports CurrentDungeon
     * @classdesc Represents a CurrentDungeon.
     * @implements ICurrentDungeon
     * @constructor
     * @param {ICurrentDungeon=} [properties] Properties to set
     */
    function CurrentDungeon(properties) {
        this.dungeonMap = [];
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * CurrentDungeon currentPosition.
     * @member {ITile|null|undefined} currentPosition
     * @memberof CurrentDungeon
     * @instance
     */
    CurrentDungeon.prototype.currentPosition = null;

    /**
     * CurrentDungeon dungeonMap.
     * @member {Array.<ITile>} dungeonMap
     * @memberof CurrentDungeon
     * @instance
     */
    CurrentDungeon.prototype.dungeonMap = $util.emptyArray;

    /**
     * CurrentDungeon enemy.
     * @member {IEnemy|null|undefined} enemy
     * @memberof CurrentDungeon
     * @instance
     */
    CurrentDungeon.prototype.enemy = null;

    /**
     * CurrentDungeon fightingBoss.
     * @member {boolean} fightingBoss
     * @memberof CurrentDungeon
     * @instance
     */
    CurrentDungeon.prototype.fightingBoss = false;

    /**
     * CurrentDungeon instance.
     * @member {string} instance
     * @memberof CurrentDungeon
     * @instance
     */
    CurrentDungeon.prototype.instance = "";

    /**
     * CurrentDungeon level.
     * @member {string} level
     * @memberof CurrentDungeon
     * @instance
     */
    CurrentDungeon.prototype.level = "";

    /**
     * CurrentDungeon mapDimensions.
     * @member {IBoundingBox|null|undefined} mapDimensions
     * @memberof CurrentDungeon
     * @instance
     */
    CurrentDungeon.prototype.mapDimensions = null;

    /**
     * Creates a new CurrentDungeon instance using the specified properties.
     * @function create
     * @memberof CurrentDungeon
     * @static
     * @param {ICurrentDungeon=} [properties] Properties to set
     * @returns {CurrentDungeon} CurrentDungeon instance
     */
    CurrentDungeon.create = function create(properties) {
        return new CurrentDungeon(properties);
    };

    /**
     * Encodes the specified CurrentDungeon message. Does not implicitly {@link CurrentDungeon.verify|verify} messages.
     * @function encode
     * @memberof CurrentDungeon
     * @static
     * @param {ICurrentDungeon} message CurrentDungeon message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    CurrentDungeon.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.currentPosition != null && Object.hasOwnProperty.call(message, "currentPosition"))
            $root.Tile.encode(message.currentPosition, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
        if (message.dungeonMap != null && message.dungeonMap.length)
            for (var i = 0; i < message.dungeonMap.length; ++i)
                $root.Tile.encode(message.dungeonMap[i], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
        if (message.enemy != null && Object.hasOwnProperty.call(message, "enemy"))
            $root.Enemy.encode(message.enemy, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
        if (message.fightingBoss != null && Object.hasOwnProperty.call(message, "fightingBoss"))
            writer.uint32(/* id 4, wireType 0 =*/32).bool(message.fightingBoss);
        if (message.instance != null && Object.hasOwnProperty.call(message, "instance"))
            writer.uint32(/* id 5, wireType 2 =*/42).string(message.instance);
        if (message.level != null && Object.hasOwnProperty.call(message, "level"))
            writer.uint32(/* id 6, wireType 2 =*/50).string(message.level);
        if (message.mapDimensions != null && Object.hasOwnProperty.call(message, "mapDimensions"))
            $root.BoundingBox.encode(message.mapDimensions, writer.uint32(/* id 7, wireType 2 =*/58).fork()).ldelim();
        return writer;
    };

    /**
     * Encodes the specified CurrentDungeon message, length delimited. Does not implicitly {@link CurrentDungeon.verify|verify} messages.
     * @function encodeDelimited
     * @memberof CurrentDungeon
     * @static
     * @param {ICurrentDungeon} message CurrentDungeon message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    CurrentDungeon.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a CurrentDungeon message from the specified reader or buffer.
     * @function decode
     * @memberof CurrentDungeon
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {CurrentDungeon} CurrentDungeon
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    CurrentDungeon.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.CurrentDungeon();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
            case 1: {
                    message.currentPosition = $root.Tile.decode(reader, reader.uint32());
                    break;
                }
            case 2: {
                    if (!(message.dungeonMap && message.dungeonMap.length))
                        message.dungeonMap = [];
                    message.dungeonMap.push($root.Tile.decode(reader, reader.uint32()));
                    break;
                }
            case 3: {
                    message.enemy = $root.Enemy.decode(reader, reader.uint32());
                    break;
                }
            case 4: {
                    message.fightingBoss = reader.bool();
                    break;
                }
            case 5: {
                    message.instance = reader.string();
                    break;
                }
            case 6: {
                    message.level = reader.string();
                    break;
                }
            case 7: {
                    message.mapDimensions = $root.BoundingBox.decode(reader, reader.uint32());
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a CurrentDungeon message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof CurrentDungeon
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {CurrentDungeon} CurrentDungeon
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    CurrentDungeon.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a CurrentDungeon message.
     * @function verify
     * @memberof CurrentDungeon
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    CurrentDungeon.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.currentPosition != null && message.hasOwnProperty("currentPosition")) {
            var error = $root.Tile.verify(message.currentPosition);
            if (error)
                return "currentPosition." + error;
        }
        if (message.dungeonMap != null && message.hasOwnProperty("dungeonMap")) {
            if (!Array.isArray(message.dungeonMap))
                return "dungeonMap: array expected";
            for (var i = 0; i < message.dungeonMap.length; ++i) {
                var error = $root.Tile.verify(message.dungeonMap[i]);
                if (error)
                    return "dungeonMap." + error;
            }
        }
        if (message.enemy != null && message.hasOwnProperty("enemy")) {
            var error = $root.Enemy.verify(message.enemy);
            if (error)
                return "enemy." + error;
        }
        if (message.fightingBoss != null && message.hasOwnProperty("fightingBoss"))
            if (typeof message.fightingBoss !== "boolean")
                return "fightingBoss: boolean expected";
        if (message.instance != null && message.hasOwnProperty("instance"))
            if (!$util.isString(message.instance))
                return "instance: string expected";
        if (message.level != null && message.hasOwnProperty("level"))
            if (!$util.isString(message.level))
                return "level: string expected";
        if (message.mapDimensions != null && message.hasOwnProperty("mapDimensions")) {
            var error = $root.BoundingBox.verify(message.mapDimensions);
            if (error)
                return "mapDimensions." + error;
        }
        return null;
    };

    /**
     * Creates a CurrentDungeon message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof CurrentDungeon
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {CurrentDungeon} CurrentDungeon
     */
    CurrentDungeon.fromObject = function fromObject(object) {
        if (object instanceof $root.CurrentDungeon)
            return object;
        var message = new $root.CurrentDungeon();
        if (object.currentPosition != null) {
            if (typeof object.currentPosition !== "object")
                throw TypeError(".CurrentDungeon.currentPosition: object expected");
            message.currentPosition = $root.Tile.fromObject(object.currentPosition);
        }
        if (object.dungeonMap) {
            if (!Array.isArray(object.dungeonMap))
                throw TypeError(".CurrentDungeon.dungeonMap: array expected");
            message.dungeonMap = [];
            for (var i = 0; i < object.dungeonMap.length; ++i) {
                if (typeof object.dungeonMap[i] !== "object")
                    throw TypeError(".CurrentDungeon.dungeonMap: object expected");
                message.dungeonMap[i] = $root.Tile.fromObject(object.dungeonMap[i]);
            }
        }
        if (object.enemy != null) {
            if (typeof object.enemy !== "object")
                throw TypeError(".CurrentDungeon.enemy: object expected");
            message.enemy = $root.Enemy.fromObject(object.enemy);
        }
        if (object.fightingBoss != null)
            message.fightingBoss = Boolean(object.fightingBoss);
        if (object.instance != null)
            message.instance = String(object.instance);
        if (object.level != null)
            message.level = String(object.level);
        if (object.mapDimensions != null) {
            if (typeof object.mapDimensions !== "object")
                throw TypeError(".CurrentDungeon.mapDimensions: object expected");
            message.mapDimensions = $root.BoundingBox.fromObject(object.mapDimensions);
        }
        return message;
    };

    /**
     * Creates a plain object from a CurrentDungeon message. Also converts values to other types if specified.
     * @function toObject
     * @memberof CurrentDungeon
     * @static
     * @param {CurrentDungeon} message CurrentDungeon
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    CurrentDungeon.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.arrays || options.defaults)
            object.dungeonMap = [];
        if (options.defaults) {
            object.currentPosition = null;
            object.enemy = null;
            object.fightingBoss = false;
            object.instance = "";
            object.level = "";
            object.mapDimensions = null;
        }
        if (message.currentPosition != null && message.hasOwnProperty("currentPosition"))
            object.currentPosition = $root.Tile.toObject(message.currentPosition, options);
        if (message.dungeonMap && message.dungeonMap.length) {
            object.dungeonMap = [];
            for (var j = 0; j < message.dungeonMap.length; ++j)
                object.dungeonMap[j] = $root.Tile.toObject(message.dungeonMap[j], options);
        }
        if (message.enemy != null && message.hasOwnProperty("enemy"))
            object.enemy = $root.Enemy.toObject(message.enemy, options);
        if (message.fightingBoss != null && message.hasOwnProperty("fightingBoss"))
            object.fightingBoss = message.fightingBoss;
        if (message.instance != null && message.hasOwnProperty("instance"))
            object.instance = message.instance;
        if (message.level != null && message.hasOwnProperty("level"))
            object.level = message.level;
        if (message.mapDimensions != null && message.hasOwnProperty("mapDimensions"))
            object.mapDimensions = $root.BoundingBox.toObject(message.mapDimensions, options);
        return object;
    };

    /**
     * Converts this CurrentDungeon to JSON.
     * @function toJSON
     * @memberof CurrentDungeon
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    CurrentDungeon.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for CurrentDungeon
     * @function getTypeUrl
     * @memberof CurrentDungeon
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    CurrentDungeon.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/CurrentDungeon";
    };

    return CurrentDungeon;
})();

$root.DungeonInstance = (function() {

    /**
     * Properties of a DungeonInstance.
     * @exports IDungeonInstance
     * @interface IDungeonInstance
     * @property {Array.<IDungeonLevel>|null} [levels] DungeonInstance levels
     * @property {string|null} [name] DungeonInstance name
     */

    /**
     * Constructs a new DungeonInstance.
     * @exports DungeonInstance
     * @classdesc Represents a DungeonInstance.
     * @implements IDungeonInstance
     * @constructor
     * @param {IDungeonInstance=} [properties] Properties to set
     */
    function DungeonInstance(properties) {
        this.levels = [];
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * DungeonInstance levels.
     * @member {Array.<IDungeonLevel>} levels
     * @memberof DungeonInstance
     * @instance
     */
    DungeonInstance.prototype.levels = $util.emptyArray;

    /**
     * DungeonInstance name.
     * @member {string} name
     * @memberof DungeonInstance
     * @instance
     */
    DungeonInstance.prototype.name = "";

    /**
     * Creates a new DungeonInstance instance using the specified properties.
     * @function create
     * @memberof DungeonInstance
     * @static
     * @param {IDungeonInstance=} [properties] Properties to set
     * @returns {DungeonInstance} DungeonInstance instance
     */
    DungeonInstance.create = function create(properties) {
        return new DungeonInstance(properties);
    };

    /**
     * Encodes the specified DungeonInstance message. Does not implicitly {@link DungeonInstance.verify|verify} messages.
     * @function encode
     * @memberof DungeonInstance
     * @static
     * @param {IDungeonInstance} message DungeonInstance message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    DungeonInstance.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.levels != null && message.levels.length)
            for (var i = 0; i < message.levels.length; ++i)
                $root.DungeonLevel.encode(message.levels[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
        if (message.name != null && Object.hasOwnProperty.call(message, "name"))
            writer.uint32(/* id 2, wireType 2 =*/18).string(message.name);
        return writer;
    };

    /**
     * Encodes the specified DungeonInstance message, length delimited. Does not implicitly {@link DungeonInstance.verify|verify} messages.
     * @function encodeDelimited
     * @memberof DungeonInstance
     * @static
     * @param {IDungeonInstance} message DungeonInstance message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    DungeonInstance.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a DungeonInstance message from the specified reader or buffer.
     * @function decode
     * @memberof DungeonInstance
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {DungeonInstance} DungeonInstance
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    DungeonInstance.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.DungeonInstance();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
            case 1: {
                    if (!(message.levels && message.levels.length))
                        message.levels = [];
                    message.levels.push($root.DungeonLevel.decode(reader, reader.uint32()));
                    break;
                }
            case 2: {
                    message.name = reader.string();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a DungeonInstance message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof DungeonInstance
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {DungeonInstance} DungeonInstance
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    DungeonInstance.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a DungeonInstance message.
     * @function verify
     * @memberof DungeonInstance
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    DungeonInstance.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.levels != null && message.hasOwnProperty("levels")) {
            if (!Array.isArray(message.levels))
                return "levels: array expected";
            for (var i = 0; i < message.levels.length; ++i) {
                var error = $root.DungeonLevel.verify(message.levels[i]);
                if (error)
                    return "levels." + error;
            }
        }
        if (message.name != null && message.hasOwnProperty("name"))
            if (!$util.isString(message.name))
                return "name: string expected";
        return null;
    };

    /**
     * Creates a DungeonInstance message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof DungeonInstance
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {DungeonInstance} DungeonInstance
     */
    DungeonInstance.fromObject = function fromObject(object) {
        if (object instanceof $root.DungeonInstance)
            return object;
        var message = new $root.DungeonInstance();
        if (object.levels) {
            if (!Array.isArray(object.levels))
                throw TypeError(".DungeonInstance.levels: array expected");
            message.levels = [];
            for (var i = 0; i < object.levels.length; ++i) {
                if (typeof object.levels[i] !== "object")
                    throw TypeError(".DungeonInstance.levels: object expected");
                message.levels[i] = $root.DungeonLevel.fromObject(object.levels[i]);
            }
        }
        if (object.name != null)
            message.name = String(object.name);
        return message;
    };

    /**
     * Creates a plain object from a DungeonInstance message. Also converts values to other types if specified.
     * @function toObject
     * @memberof DungeonInstance
     * @static
     * @param {DungeonInstance} message DungeonInstance
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    DungeonInstance.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.arrays || options.defaults)
            object.levels = [];
        if (options.defaults)
            object.name = "";
        if (message.levels && message.levels.length) {
            object.levels = [];
            for (var j = 0; j < message.levels.length; ++j)
                object.levels[j] = $root.DungeonLevel.toObject(message.levels[j], options);
        }
        if (message.name != null && message.hasOwnProperty("name"))
            object.name = message.name;
        return object;
    };

    /**
     * Converts this DungeonInstance to JSON.
     * @function toJSON
     * @memberof DungeonInstance
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    DungeonInstance.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for DungeonInstance
     * @function getTypeUrl
     * @memberof DungeonInstance
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    DungeonInstance.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/DungeonInstance";
    };

    return DungeonInstance;
})();

$root.DungeonLevel = (function() {

    /**
     * Properties of a DungeonLevel.
     * @exports IDungeonLevel
     * @interface IDungeonLevel
     * @property {boolean|null} [bossDefeated] DungeonLevel bossDefeated
     * @property {Array.<string>|null} [bosses] DungeonLevel bosses
     * @property {number|null} [level] DungeonLevel level
     * @property {number|null} [tiles] DungeonLevel tiles
     */

    /**
     * Constructs a new DungeonLevel.
     * @exports DungeonLevel
     * @classdesc Represents a DungeonLevel.
     * @implements IDungeonLevel
     * @constructor
     * @param {IDungeonLevel=} [properties] Properties to set
     */
    function DungeonLevel(properties) {
        this.bosses = [];
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * DungeonLevel bossDefeated.
     * @member {boolean} bossDefeated
     * @memberof DungeonLevel
     * @instance
     */
    DungeonLevel.prototype.bossDefeated = false;

    /**
     * DungeonLevel bosses.
     * @member {Array.<string>} bosses
     * @memberof DungeonLevel
     * @instance
     */
    DungeonLevel.prototype.bosses = $util.emptyArray;

    /**
     * DungeonLevel level.
     * @member {number} level
     * @memberof DungeonLevel
     * @instance
     */
    DungeonLevel.prototype.level = 0;

    /**
     * DungeonLevel tiles.
     * @member {number} tiles
     * @memberof DungeonLevel
     * @instance
     */
    DungeonLevel.prototype.tiles = 0;

    /**
     * Creates a new DungeonLevel instance using the specified properties.
     * @function create
     * @memberof DungeonLevel
     * @static
     * @param {IDungeonLevel=} [properties] Properties to set
     * @returns {DungeonLevel} DungeonLevel instance
     */
    DungeonLevel.create = function create(properties) {
        return new DungeonLevel(properties);
    };

    /**
     * Encodes the specified DungeonLevel message. Does not implicitly {@link DungeonLevel.verify|verify} messages.
     * @function encode
     * @memberof DungeonLevel
     * @static
     * @param {IDungeonLevel} message DungeonLevel message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    DungeonLevel.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.bossDefeated != null && Object.hasOwnProperty.call(message, "bossDefeated"))
            writer.uint32(/* id 1, wireType 0 =*/8).bool(message.bossDefeated);
        if (message.bosses != null && message.bosses.length)
            for (var i = 0; i < message.bosses.length; ++i)
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.bosses[i]);
        if (message.level != null && Object.hasOwnProperty.call(message, "level"))
            writer.uint32(/* id 3, wireType 0 =*/24).int32(message.level);
        if (message.tiles != null && Object.hasOwnProperty.call(message, "tiles"))
            writer.uint32(/* id 4, wireType 0 =*/32).int32(message.tiles);
        return writer;
    };

    /**
     * Encodes the specified DungeonLevel message, length delimited. Does not implicitly {@link DungeonLevel.verify|verify} messages.
     * @function encodeDelimited
     * @memberof DungeonLevel
     * @static
     * @param {IDungeonLevel} message DungeonLevel message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    DungeonLevel.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a DungeonLevel message from the specified reader or buffer.
     * @function decode
     * @memberof DungeonLevel
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {DungeonLevel} DungeonLevel
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    DungeonLevel.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.DungeonLevel();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
            case 1: {
                    message.bossDefeated = reader.bool();
                    break;
                }
            case 2: {
                    if (!(message.bosses && message.bosses.length))
                        message.bosses = [];
                    message.bosses.push(reader.string());
                    break;
                }
            case 3: {
                    message.level = reader.int32();
                    break;
                }
            case 4: {
                    message.tiles = reader.int32();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a DungeonLevel message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof DungeonLevel
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {DungeonLevel} DungeonLevel
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    DungeonLevel.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a DungeonLevel message.
     * @function verify
     * @memberof DungeonLevel
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    DungeonLevel.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.bossDefeated != null && message.hasOwnProperty("bossDefeated"))
            if (typeof message.bossDefeated !== "boolean")
                return "bossDefeated: boolean expected";
        if (message.bosses != null && message.hasOwnProperty("bosses")) {
            if (!Array.isArray(message.bosses))
                return "bosses: array expected";
            for (var i = 0; i < message.bosses.length; ++i)
                if (!$util.isString(message.bosses[i]))
                    return "bosses: string[] expected";
        }
        if (message.level != null && message.hasOwnProperty("level"))
            if (!$util.isInteger(message.level))
                return "level: integer expected";
        if (message.tiles != null && message.hasOwnProperty("tiles"))
            if (!$util.isInteger(message.tiles))
                return "tiles: integer expected";
        return null;
    };

    /**
     * Creates a DungeonLevel message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof DungeonLevel
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {DungeonLevel} DungeonLevel
     */
    DungeonLevel.fromObject = function fromObject(object) {
        if (object instanceof $root.DungeonLevel)
            return object;
        var message = new $root.DungeonLevel();
        if (object.bossDefeated != null)
            message.bossDefeated = Boolean(object.bossDefeated);
        if (object.bosses) {
            if (!Array.isArray(object.bosses))
                throw TypeError(".DungeonLevel.bosses: array expected");
            message.bosses = [];
            for (var i = 0; i < object.bosses.length; ++i)
                message.bosses[i] = String(object.bosses[i]);
        }
        if (object.level != null)
            message.level = object.level | 0;
        if (object.tiles != null)
            message.tiles = object.tiles | 0;
        return message;
    };

    /**
     * Creates a plain object from a DungeonLevel message. Also converts values to other types if specified.
     * @function toObject
     * @memberof DungeonLevel
     * @static
     * @param {DungeonLevel} message DungeonLevel
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    DungeonLevel.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.arrays || options.defaults)
            object.bosses = [];
        if (options.defaults) {
            object.bossDefeated = false;
            object.level = 0;
            object.tiles = 0;
        }
        if (message.bossDefeated != null && message.hasOwnProperty("bossDefeated"))
            object.bossDefeated = message.bossDefeated;
        if (message.bosses && message.bosses.length) {
            object.bosses = [];
            for (var j = 0; j < message.bosses.length; ++j)
                object.bosses[j] = message.bosses[j];
        }
        if (message.level != null && message.hasOwnProperty("level"))
            object.level = message.level;
        if (message.tiles != null && message.hasOwnProperty("tiles"))
            object.tiles = message.tiles;
        return object;
    };

    /**
     * Converts this DungeonLevel to JSON.
     * @function toJSON
     * @memberof DungeonLevel
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    DungeonLevel.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for DungeonLevel
     * @function getTypeUrl
     * @memberof DungeonLevel
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    DungeonLevel.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/DungeonLevel";
    };

    return DungeonLevel;
})();

$root.Enemy = (function() {

    /**
     * Properties of an Enemy.
     * @exports IEnemy
     * @interface IEnemy
     * @property {ICreature|null} [base] Enemy base
     * @property {Array.<IMinion>|null} [minions] Enemy minions
     */

    /**
     * Constructs a new Enemy.
     * @exports Enemy
     * @classdesc Represents an Enemy.
     * @implements IEnemy
     * @constructor
     * @param {IEnemy=} [properties] Properties to set
     */
    function Enemy(properties) {
        this.minions = [];
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * Enemy base.
     * @member {ICreature|null|undefined} base
     * @memberof Enemy
     * @instance
     */
    Enemy.prototype.base = null;

    /**
     * Enemy minions.
     * @member {Array.<IMinion>} minions
     * @memberof Enemy
     * @instance
     */
    Enemy.prototype.minions = $util.emptyArray;

    /**
     * Creates a new Enemy instance using the specified properties.
     * @function create
     * @memberof Enemy
     * @static
     * @param {IEnemy=} [properties] Properties to set
     * @returns {Enemy} Enemy instance
     */
    Enemy.create = function create(properties) {
        return new Enemy(properties);
    };

    /**
     * Encodes the specified Enemy message. Does not implicitly {@link Enemy.verify|verify} messages.
     * @function encode
     * @memberof Enemy
     * @static
     * @param {IEnemy} message Enemy message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Enemy.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.base != null && Object.hasOwnProperty.call(message, "base"))
            $root.Creature.encode(message.base, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
        if (message.minions != null && message.minions.length)
            for (var i = 0; i < message.minions.length; ++i)
                $root.Minion.encode(message.minions[i], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
        return writer;
    };

    /**
     * Encodes the specified Enemy message, length delimited. Does not implicitly {@link Enemy.verify|verify} messages.
     * @function encodeDelimited
     * @memberof Enemy
     * @static
     * @param {IEnemy} message Enemy message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Enemy.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes an Enemy message from the specified reader or buffer.
     * @function decode
     * @memberof Enemy
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {Enemy} Enemy
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Enemy.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.Enemy();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
            case 1: {
                    message.base = $root.Creature.decode(reader, reader.uint32());
                    break;
                }
            case 2: {
                    if (!(message.minions && message.minions.length))
                        message.minions = [];
                    message.minions.push($root.Minion.decode(reader, reader.uint32()));
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes an Enemy message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof Enemy
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {Enemy} Enemy
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Enemy.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies an Enemy message.
     * @function verify
     * @memberof Enemy
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    Enemy.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.base != null && message.hasOwnProperty("base")) {
            var error = $root.Creature.verify(message.base);
            if (error)
                return "base." + error;
        }
        if (message.minions != null && message.hasOwnProperty("minions")) {
            if (!Array.isArray(message.minions))
                return "minions: array expected";
            for (var i = 0; i < message.minions.length; ++i) {
                var error = $root.Minion.verify(message.minions[i]);
                if (error)
                    return "minions." + error;
            }
        }
        return null;
    };

    /**
     * Creates an Enemy message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof Enemy
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {Enemy} Enemy
     */
    Enemy.fromObject = function fromObject(object) {
        if (object instanceof $root.Enemy)
            return object;
        var message = new $root.Enemy();
        if (object.base != null) {
            if (typeof object.base !== "object")
                throw TypeError(".Enemy.base: object expected");
            message.base = $root.Creature.fromObject(object.base);
        }
        if (object.minions) {
            if (!Array.isArray(object.minions))
                throw TypeError(".Enemy.minions: array expected");
            message.minions = [];
            for (var i = 0; i < object.minions.length; ++i) {
                if (typeof object.minions[i] !== "object")
                    throw TypeError(".Enemy.minions: object expected");
                message.minions[i] = $root.Minion.fromObject(object.minions[i]);
            }
        }
        return message;
    };

    /**
     * Creates a plain object from an Enemy message. Also converts values to other types if specified.
     * @function toObject
     * @memberof Enemy
     * @static
     * @param {Enemy} message Enemy
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    Enemy.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.arrays || options.defaults)
            object.minions = [];
        if (options.defaults)
            object.base = null;
        if (message.base != null && message.hasOwnProperty("base"))
            object.base = $root.Creature.toObject(message.base, options);
        if (message.minions && message.minions.length) {
            object.minions = [];
            for (var j = 0; j < message.minions.length; ++j)
                object.minions[j] = $root.Minion.toObject(message.minions[j], options);
        }
        return object;
    };

    /**
     * Converts this Enemy to JSON.
     * @function toJSON
     * @memberof Enemy
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    Enemy.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for Enemy
     * @function getTypeUrl
     * @memberof Enemy
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    Enemy.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/Enemy";
    };

    return Enemy;
})();

$root.Equipment = (function() {

    /**
     * Properties of an Equipment.
     * @exports IEquipment
     * @interface IEquipment
     * @property {IItem|null} [body] Equipment body
     * @property {IItem|null} [head] Equipment head
     * @property {IItem|null} [mainHand] Equipment mainHand
     * @property {IItem|null} [offHand] Equipment offHand
     */

    /**
     * Constructs a new Equipment.
     * @exports Equipment
     * @classdesc Represents an Equipment.
     * @implements IEquipment
     * @constructor
     * @param {IEquipment=} [properties] Properties to set
     */
    function Equipment(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * Equipment body.
     * @member {IItem|null|undefined} body
     * @memberof Equipment
     * @instance
     */
    Equipment.prototype.body = null;

    /**
     * Equipment head.
     * @member {IItem|null|undefined} head
     * @memberof Equipment
     * @instance
     */
    Equipment.prototype.head = null;

    /**
     * Equipment mainHand.
     * @member {IItem|null|undefined} mainHand
     * @memberof Equipment
     * @instance
     */
    Equipment.prototype.mainHand = null;

    /**
     * Equipment offHand.
     * @member {IItem|null|undefined} offHand
     * @memberof Equipment
     * @instance
     */
    Equipment.prototype.offHand = null;

    /**
     * Creates a new Equipment instance using the specified properties.
     * @function create
     * @memberof Equipment
     * @static
     * @param {IEquipment=} [properties] Properties to set
     * @returns {Equipment} Equipment instance
     */
    Equipment.create = function create(properties) {
        return new Equipment(properties);
    };

    /**
     * Encodes the specified Equipment message. Does not implicitly {@link Equipment.verify|verify} messages.
     * @function encode
     * @memberof Equipment
     * @static
     * @param {IEquipment} message Equipment message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Equipment.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.body != null && Object.hasOwnProperty.call(message, "body"))
            $root.Item.encode(message.body, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
        if (message.head != null && Object.hasOwnProperty.call(message, "head"))
            $root.Item.encode(message.head, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
        if (message.mainHand != null && Object.hasOwnProperty.call(message, "mainHand"))
            $root.Item.encode(message.mainHand, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
        if (message.offHand != null && Object.hasOwnProperty.call(message, "offHand"))
            $root.Item.encode(message.offHand, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
        return writer;
    };

    /**
     * Encodes the specified Equipment message, length delimited. Does not implicitly {@link Equipment.verify|verify} messages.
     * @function encodeDelimited
     * @memberof Equipment
     * @static
     * @param {IEquipment} message Equipment message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Equipment.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes an Equipment message from the specified reader or buffer.
     * @function decode
     * @memberof Equipment
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {Equipment} Equipment
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Equipment.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.Equipment();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
            case 1: {
                    message.body = $root.Item.decode(reader, reader.uint32());
                    break;
                }
            case 2: {
                    message.head = $root.Item.decode(reader, reader.uint32());
                    break;
                }
            case 3: {
                    message.mainHand = $root.Item.decode(reader, reader.uint32());
                    break;
                }
            case 4: {
                    message.offHand = $root.Item.decode(reader, reader.uint32());
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes an Equipment message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof Equipment
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {Equipment} Equipment
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Equipment.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies an Equipment message.
     * @function verify
     * @memberof Equipment
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    Equipment.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.body != null && message.hasOwnProperty("body")) {
            var error = $root.Item.verify(message.body);
            if (error)
                return "body." + error;
        }
        if (message.head != null && message.hasOwnProperty("head")) {
            var error = $root.Item.verify(message.head);
            if (error)
                return "head." + error;
        }
        if (message.mainHand != null && message.hasOwnProperty("mainHand")) {
            var error = $root.Item.verify(message.mainHand);
            if (error)
                return "mainHand." + error;
        }
        if (message.offHand != null && message.hasOwnProperty("offHand")) {
            var error = $root.Item.verify(message.offHand);
            if (error)
                return "offHand." + error;
        }
        return null;
    };

    /**
     * Creates an Equipment message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof Equipment
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {Equipment} Equipment
     */
    Equipment.fromObject = function fromObject(object) {
        if (object instanceof $root.Equipment)
            return object;
        var message = new $root.Equipment();
        if (object.body != null) {
            if (typeof object.body !== "object")
                throw TypeError(".Equipment.body: object expected");
            message.body = $root.Item.fromObject(object.body);
        }
        if (object.head != null) {
            if (typeof object.head !== "object")
                throw TypeError(".Equipment.head: object expected");
            message.head = $root.Item.fromObject(object.head);
        }
        if (object.mainHand != null) {
            if (typeof object.mainHand !== "object")
                throw TypeError(".Equipment.mainHand: object expected");
            message.mainHand = $root.Item.fromObject(object.mainHand);
        }
        if (object.offHand != null) {
            if (typeof object.offHand !== "object")
                throw TypeError(".Equipment.offHand: object expected");
            message.offHand = $root.Item.fromObject(object.offHand);
        }
        return message;
    };

    /**
     * Creates a plain object from an Equipment message. Also converts values to other types if specified.
     * @function toObject
     * @memberof Equipment
     * @static
     * @param {Equipment} message Equipment
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    Equipment.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults) {
            object.body = null;
            object.head = null;
            object.mainHand = null;
            object.offHand = null;
        }
        if (message.body != null && message.hasOwnProperty("body"))
            object.body = $root.Item.toObject(message.body, options);
        if (message.head != null && message.hasOwnProperty("head"))
            object.head = $root.Item.toObject(message.head, options);
        if (message.mainHand != null && message.hasOwnProperty("mainHand"))
            object.mainHand = $root.Item.toObject(message.mainHand, options);
        if (message.offHand != null && message.hasOwnProperty("offHand"))
            object.offHand = $root.Item.toObject(message.offHand, options);
        return object;
    };

    /**
     * Converts this Equipment to JSON.
     * @function toJSON
     * @memberof Equipment
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    Equipment.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for Equipment
     * @function getTypeUrl
     * @memberof Equipment
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    Equipment.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/Equipment";
    };

    return Equipment;
})();

$root.Game = (function() {

    /**
     * Properties of a Game.
     * @exports IGame
     * @interface IGame
     * @property {boolean|null} [atDeathScreen] Game atDeathScreen
     * @property {string|null} [colorScheme] Game colorScheme
     * @property {Array.<string>|null} [completedInstances] Game completedInstances
     * @property {string|null} [date] Game date
     * @property {Array.<IDungeonInstance>|null} [dungeonInstances] Game dungeonInstances
     * @property {number|null} [healthWarning] Game healthWarning
     * @property {Array.<IShop>|null} [shops] Game shops
     * @property {boolean|null} [tutorialsEnabled] Game tutorialsEnabled
     * @property {Object.<string,boolean>|null} [tutorialsShown] Game tutorialsShown
     * @property {string|null} [vibrationEnabled] Game vibrationEnabled
     */

    /**
     * Constructs a new Game.
     * @exports Game
     * @classdesc Represents a Game.
     * @implements IGame
     * @constructor
     * @param {IGame=} [properties] Properties to set
     */
    function Game(properties) {
        this.completedInstances = [];
        this.dungeonInstances = [];
        this.shops = [];
        this.tutorialsShown = {};
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * Game atDeathScreen.
     * @member {boolean} atDeathScreen
     * @memberof Game
     * @instance
     */
    Game.prototype.atDeathScreen = false;

    /**
     * Game colorScheme.
     * @member {string} colorScheme
     * @memberof Game
     * @instance
     */
    Game.prototype.colorScheme = "";

    /**
     * Game completedInstances.
     * @member {Array.<string>} completedInstances
     * @memberof Game
     * @instance
     */
    Game.prototype.completedInstances = $util.emptyArray;

    /**
     * Game date.
     * @member {string} date
     * @memberof Game
     * @instance
     */
    Game.prototype.date = "";

    /**
     * Game dungeonInstances.
     * @member {Array.<IDungeonInstance>} dungeonInstances
     * @memberof Game
     * @instance
     */
    Game.prototype.dungeonInstances = $util.emptyArray;

    /**
     * Game healthWarning.
     * @member {number} healthWarning
     * @memberof Game
     * @instance
     */
    Game.prototype.healthWarning = 0;

    /**
     * Game shops.
     * @member {Array.<IShop>} shops
     * @memberof Game
     * @instance
     */
    Game.prototype.shops = $util.emptyArray;

    /**
     * Game tutorialsEnabled.
     * @member {boolean} tutorialsEnabled
     * @memberof Game
     * @instance
     */
    Game.prototype.tutorialsEnabled = false;

    /**
     * Game tutorialsShown.
     * @member {Object.<string,boolean>} tutorialsShown
     * @memberof Game
     * @instance
     */
    Game.prototype.tutorialsShown = $util.emptyObject;

    /**
     * Game vibrationEnabled.
     * @member {string} vibrationEnabled
     * @memberof Game
     * @instance
     */
    Game.prototype.vibrationEnabled = "";

    /**
     * Creates a new Game instance using the specified properties.
     * @function create
     * @memberof Game
     * @static
     * @param {IGame=} [properties] Properties to set
     * @returns {Game} Game instance
     */
    Game.create = function create(properties) {
        return new Game(properties);
    };

    /**
     * Encodes the specified Game message. Does not implicitly {@link Game.verify|verify} messages.
     * @function encode
     * @memberof Game
     * @static
     * @param {IGame} message Game message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Game.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.atDeathScreen != null && Object.hasOwnProperty.call(message, "atDeathScreen"))
            writer.uint32(/* id 1, wireType 0 =*/8).bool(message.atDeathScreen);
        if (message.colorScheme != null && Object.hasOwnProperty.call(message, "colorScheme"))
            writer.uint32(/* id 2, wireType 2 =*/18).string(message.colorScheme);
        if (message.completedInstances != null && message.completedInstances.length)
            for (var i = 0; i < message.completedInstances.length; ++i)
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.completedInstances[i]);
        if (message.date != null && Object.hasOwnProperty.call(message, "date"))
            writer.uint32(/* id 4, wireType 2 =*/34).string(message.date);
        if (message.dungeonInstances != null && message.dungeonInstances.length)
            for (var i = 0; i < message.dungeonInstances.length; ++i)
                $root.DungeonInstance.encode(message.dungeonInstances[i], writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
        if (message.healthWarning != null && Object.hasOwnProperty.call(message, "healthWarning"))
            writer.uint32(/* id 6, wireType 5 =*/53).float(message.healthWarning);
        if (message.shops != null && message.shops.length)
            for (var i = 0; i < message.shops.length; ++i)
                $root.Shop.encode(message.shops[i], writer.uint32(/* id 7, wireType 2 =*/58).fork()).ldelim();
        if (message.tutorialsEnabled != null && Object.hasOwnProperty.call(message, "tutorialsEnabled"))
            writer.uint32(/* id 8, wireType 0 =*/64).bool(message.tutorialsEnabled);
        if (message.tutorialsShown != null && Object.hasOwnProperty.call(message, "tutorialsShown"))
            for (var keys = Object.keys(message.tutorialsShown), i = 0; i < keys.length; ++i)
                writer.uint32(/* id 9, wireType 2 =*/74).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]).uint32(/* id 2, wireType 0 =*/16).bool(message.tutorialsShown[keys[i]]).ldelim();
        if (message.vibrationEnabled != null && Object.hasOwnProperty.call(message, "vibrationEnabled"))
            writer.uint32(/* id 10, wireType 2 =*/82).string(message.vibrationEnabled);
        return writer;
    };

    /**
     * Encodes the specified Game message, length delimited. Does not implicitly {@link Game.verify|verify} messages.
     * @function encodeDelimited
     * @memberof Game
     * @static
     * @param {IGame} message Game message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Game.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a Game message from the specified reader or buffer.
     * @function decode
     * @memberof Game
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {Game} Game
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Game.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.Game(), key, value;
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
            case 1: {
                    message.atDeathScreen = reader.bool();
                    break;
                }
            case 2: {
                    message.colorScheme = reader.string();
                    break;
                }
            case 3: {
                    if (!(message.completedInstances && message.completedInstances.length))
                        message.completedInstances = [];
                    message.completedInstances.push(reader.string());
                    break;
                }
            case 4: {
                    message.date = reader.string();
                    break;
                }
            case 5: {
                    if (!(message.dungeonInstances && message.dungeonInstances.length))
                        message.dungeonInstances = [];
                    message.dungeonInstances.push($root.DungeonInstance.decode(reader, reader.uint32()));
                    break;
                }
            case 6: {
                    message.healthWarning = reader.float();
                    break;
                }
            case 7: {
                    if (!(message.shops && message.shops.length))
                        message.shops = [];
                    message.shops.push($root.Shop.decode(reader, reader.uint32()));
                    break;
                }
            case 8: {
                    message.tutorialsEnabled = reader.bool();
                    break;
                }
            case 9: {
                    if (message.tutorialsShown === $util.emptyObject)
                        message.tutorialsShown = {};
                    var end2 = reader.uint32() + reader.pos;
                    key = "";
                    value = false;
                    while (reader.pos < end2) {
                        var tag2 = reader.uint32();
                        switch (tag2 >>> 3) {
                        case 1:
                            key = reader.string();
                            break;
                        case 2:
                            value = reader.bool();
                            break;
                        default:
                            reader.skipType(tag2 & 7);
                            break;
                        }
                    }
                    message.tutorialsShown[key] = value;
                    break;
                }
            case 10: {
                    message.vibrationEnabled = reader.string();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a Game message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof Game
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {Game} Game
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Game.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a Game message.
     * @function verify
     * @memberof Game
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    Game.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.atDeathScreen != null && message.hasOwnProperty("atDeathScreen"))
            if (typeof message.atDeathScreen !== "boolean")
                return "atDeathScreen: boolean expected";
        if (message.colorScheme != null && message.hasOwnProperty("colorScheme"))
            if (!$util.isString(message.colorScheme))
                return "colorScheme: string expected";
        if (message.completedInstances != null && message.hasOwnProperty("completedInstances")) {
            if (!Array.isArray(message.completedInstances))
                return "completedInstances: array expected";
            for (var i = 0; i < message.completedInstances.length; ++i)
                if (!$util.isString(message.completedInstances[i]))
                    return "completedInstances: string[] expected";
        }
        if (message.date != null && message.hasOwnProperty("date"))
            if (!$util.isString(message.date))
                return "date: string expected";
        if (message.dungeonInstances != null && message.hasOwnProperty("dungeonInstances")) {
            if (!Array.isArray(message.dungeonInstances))
                return "dungeonInstances: array expected";
            for (var i = 0; i < message.dungeonInstances.length; ++i) {
                var error = $root.DungeonInstance.verify(message.dungeonInstances[i]);
                if (error)
                    return "dungeonInstances." + error;
            }
        }
        if (message.healthWarning != null && message.hasOwnProperty("healthWarning"))
            if (typeof message.healthWarning !== "number")
                return "healthWarning: number expected";
        if (message.shops != null && message.hasOwnProperty("shops")) {
            if (!Array.isArray(message.shops))
                return "shops: array expected";
            for (var i = 0; i < message.shops.length; ++i) {
                var error = $root.Shop.verify(message.shops[i]);
                if (error)
                    return "shops." + error;
            }
        }
        if (message.tutorialsEnabled != null && message.hasOwnProperty("tutorialsEnabled"))
            if (typeof message.tutorialsEnabled !== "boolean")
                return "tutorialsEnabled: boolean expected";
        if (message.tutorialsShown != null && message.hasOwnProperty("tutorialsShown")) {
            if (!$util.isObject(message.tutorialsShown))
                return "tutorialsShown: object expected";
            var key = Object.keys(message.tutorialsShown);
            for (var i = 0; i < key.length; ++i)
                if (typeof message.tutorialsShown[key[i]] !== "boolean")
                    return "tutorialsShown: boolean{k:string} expected";
        }
        if (message.vibrationEnabled != null && message.hasOwnProperty("vibrationEnabled"))
            if (!$util.isString(message.vibrationEnabled))
                return "vibrationEnabled: string expected";
        return null;
    };

    /**
     * Creates a Game message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof Game
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {Game} Game
     */
    Game.fromObject = function fromObject(object) {
        if (object instanceof $root.Game)
            return object;
        var message = new $root.Game();
        if (object.atDeathScreen != null)
            message.atDeathScreen = Boolean(object.atDeathScreen);
        if (object.colorScheme != null)
            message.colorScheme = String(object.colorScheme);
        if (object.completedInstances) {
            if (!Array.isArray(object.completedInstances))
                throw TypeError(".Game.completedInstances: array expected");
            message.completedInstances = [];
            for (var i = 0; i < object.completedInstances.length; ++i)
                message.completedInstances[i] = String(object.completedInstances[i]);
        }
        if (object.date != null)
            message.date = String(object.date);
        if (object.dungeonInstances) {
            if (!Array.isArray(object.dungeonInstances))
                throw TypeError(".Game.dungeonInstances: array expected");
            message.dungeonInstances = [];
            for (var i = 0; i < object.dungeonInstances.length; ++i) {
                if (typeof object.dungeonInstances[i] !== "object")
                    throw TypeError(".Game.dungeonInstances: object expected");
                message.dungeonInstances[i] = $root.DungeonInstance.fromObject(object.dungeonInstances[i]);
            }
        }
        if (object.healthWarning != null)
            message.healthWarning = Number(object.healthWarning);
        if (object.shops) {
            if (!Array.isArray(object.shops))
                throw TypeError(".Game.shops: array expected");
            message.shops = [];
            for (var i = 0; i < object.shops.length; ++i) {
                if (typeof object.shops[i] !== "object")
                    throw TypeError(".Game.shops: object expected");
                message.shops[i] = $root.Shop.fromObject(object.shops[i]);
            }
        }
        if (object.tutorialsEnabled != null)
            message.tutorialsEnabled = Boolean(object.tutorialsEnabled);
        if (object.tutorialsShown) {
            if (typeof object.tutorialsShown !== "object")
                throw TypeError(".Game.tutorialsShown: object expected");
            message.tutorialsShown = {};
            for (var keys = Object.keys(object.tutorialsShown), i = 0; i < keys.length; ++i)
                message.tutorialsShown[keys[i]] = Boolean(object.tutorialsShown[keys[i]]);
        }
        if (object.vibrationEnabled != null)
            message.vibrationEnabled = String(object.vibrationEnabled);
        return message;
    };

    /**
     * Creates a plain object from a Game message. Also converts values to other types if specified.
     * @function toObject
     * @memberof Game
     * @static
     * @param {Game} message Game
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    Game.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.arrays || options.defaults) {
            object.completedInstances = [];
            object.dungeonInstances = [];
            object.shops = [];
        }
        if (options.objects || options.defaults)
            object.tutorialsShown = {};
        if (options.defaults) {
            object.atDeathScreen = false;
            object.colorScheme = "";
            object.date = "";
            object.healthWarning = 0;
            object.tutorialsEnabled = false;
            object.vibrationEnabled = "";
        }
        if (message.atDeathScreen != null && message.hasOwnProperty("atDeathScreen"))
            object.atDeathScreen = message.atDeathScreen;
        if (message.colorScheme != null && message.hasOwnProperty("colorScheme"))
            object.colorScheme = message.colorScheme;
        if (message.completedInstances && message.completedInstances.length) {
            object.completedInstances = [];
            for (var j = 0; j < message.completedInstances.length; ++j)
                object.completedInstances[j] = message.completedInstances[j];
        }
        if (message.date != null && message.hasOwnProperty("date"))
            object.date = message.date;
        if (message.dungeonInstances && message.dungeonInstances.length) {
            object.dungeonInstances = [];
            for (var j = 0; j < message.dungeonInstances.length; ++j)
                object.dungeonInstances[j] = $root.DungeonInstance.toObject(message.dungeonInstances[j], options);
        }
        if (message.healthWarning != null && message.hasOwnProperty("healthWarning"))
            object.healthWarning = options.json && !isFinite(message.healthWarning) ? String(message.healthWarning) : message.healthWarning;
        if (message.shops && message.shops.length) {
            object.shops = [];
            for (var j = 0; j < message.shops.length; ++j)
                object.shops[j] = $root.Shop.toObject(message.shops[j], options);
        }
        if (message.tutorialsEnabled != null && message.hasOwnProperty("tutorialsEnabled"))
            object.tutorialsEnabled = message.tutorialsEnabled;
        var keys2;
        if (message.tutorialsShown && (keys2 = Object.keys(message.tutorialsShown)).length) {
            object.tutorialsShown = {};
            for (var j = 0; j < keys2.length; ++j)
                object.tutorialsShown[keys2[j]] = message.tutorialsShown[keys2[j]];
        }
        if (message.vibrationEnabled != null && message.hasOwnProperty("vibrationEnabled"))
            object.vibrationEnabled = message.vibrationEnabled;
        return object;
    };

    /**
     * Converts this Game to JSON.
     * @function toJSON
     * @memberof Game
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    Game.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for Game
     * @function getTypeUrl
     * @memberof Game
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    Game.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/Game";
    };

    return Game;
})();

$root.Investment = (function() {

    /**
     * Properties of an Investment.
     * @exports IInvestment
     * @interface IInvestment
     * @property {number|null} [currentGoldStockPile] Investment currentGoldStockPile
     * @property {number|null} [goldInvested] Investment goldInvested
     * @property {number|null} [maxGoldStockPile] Investment maxGoldStockPile
     * @property {number|null} [maximumReturn] Investment maximumReturn
     * @property {number|null} [minimumReturn] Investment minimumReturn
     * @property {string|null} [name] Investment name
     * @property {number|null} [turnsPerRoll] Investment turnsPerRoll
     * @property {number|null} [turnsUntilNextRoll] Investment turnsUntilNextRoll
     * @property {Array.<string>|null} [upgrades] Investment upgrades
     */

    /**
     * Constructs a new Investment.
     * @exports Investment
     * @classdesc Represents an Investment.
     * @implements IInvestment
     * @constructor
     * @param {IInvestment=} [properties] Properties to set
     */
    function Investment(properties) {
        this.upgrades = [];
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * Investment currentGoldStockPile.
     * @member {number} currentGoldStockPile
     * @memberof Investment
     * @instance
     */
    Investment.prototype.currentGoldStockPile = 0;

    /**
     * Investment goldInvested.
     * @member {number} goldInvested
     * @memberof Investment
     * @instance
     */
    Investment.prototype.goldInvested = 0;

    /**
     * Investment maxGoldStockPile.
     * @member {number} maxGoldStockPile
     * @memberof Investment
     * @instance
     */
    Investment.prototype.maxGoldStockPile = 0;

    /**
     * Investment maximumReturn.
     * @member {number} maximumReturn
     * @memberof Investment
     * @instance
     */
    Investment.prototype.maximumReturn = 0;

    /**
     * Investment minimumReturn.
     * @member {number} minimumReturn
     * @memberof Investment
     * @instance
     */
    Investment.prototype.minimumReturn = 0;

    /**
     * Investment name.
     * @member {string} name
     * @memberof Investment
     * @instance
     */
    Investment.prototype.name = "";

    /**
     * Investment turnsPerRoll.
     * @member {number} turnsPerRoll
     * @memberof Investment
     * @instance
     */
    Investment.prototype.turnsPerRoll = 0;

    /**
     * Investment turnsUntilNextRoll.
     * @member {number} turnsUntilNextRoll
     * @memberof Investment
     * @instance
     */
    Investment.prototype.turnsUntilNextRoll = 0;

    /**
     * Investment upgrades.
     * @member {Array.<string>} upgrades
     * @memberof Investment
     * @instance
     */
    Investment.prototype.upgrades = $util.emptyArray;

    /**
     * Creates a new Investment instance using the specified properties.
     * @function create
     * @memberof Investment
     * @static
     * @param {IInvestment=} [properties] Properties to set
     * @returns {Investment} Investment instance
     */
    Investment.create = function create(properties) {
        return new Investment(properties);
    };

    /**
     * Encodes the specified Investment message. Does not implicitly {@link Investment.verify|verify} messages.
     * @function encode
     * @memberof Investment
     * @static
     * @param {IInvestment} message Investment message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Investment.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.currentGoldStockPile != null && Object.hasOwnProperty.call(message, "currentGoldStockPile"))
            writer.uint32(/* id 1, wireType 0 =*/8).int32(message.currentGoldStockPile);
        if (message.goldInvested != null && Object.hasOwnProperty.call(message, "goldInvested"))
            writer.uint32(/* id 2, wireType 0 =*/16).int32(message.goldInvested);
        if (message.maxGoldStockPile != null && Object.hasOwnProperty.call(message, "maxGoldStockPile"))
            writer.uint32(/* id 3, wireType 0 =*/24).int32(message.maxGoldStockPile);
        if (message.maximumReturn != null && Object.hasOwnProperty.call(message, "maximumReturn"))
            writer.uint32(/* id 4, wireType 0 =*/32).int32(message.maximumReturn);
        if (message.minimumReturn != null && Object.hasOwnProperty.call(message, "minimumReturn"))
            writer.uint32(/* id 5, wireType 0 =*/40).int32(message.minimumReturn);
        if (message.name != null && Object.hasOwnProperty.call(message, "name"))
            writer.uint32(/* id 6, wireType 2 =*/50).string(message.name);
        if (message.turnsPerRoll != null && Object.hasOwnProperty.call(message, "turnsPerRoll"))
            writer.uint32(/* id 7, wireType 0 =*/56).int32(message.turnsPerRoll);
        if (message.turnsUntilNextRoll != null && Object.hasOwnProperty.call(message, "turnsUntilNextRoll"))
            writer.uint32(/* id 8, wireType 0 =*/64).int32(message.turnsUntilNextRoll);
        if (message.upgrades != null && message.upgrades.length)
            for (var i = 0; i < message.upgrades.length; ++i)
                writer.uint32(/* id 9, wireType 2 =*/74).string(message.upgrades[i]);
        return writer;
    };

    /**
     * Encodes the specified Investment message, length delimited. Does not implicitly {@link Investment.verify|verify} messages.
     * @function encodeDelimited
     * @memberof Investment
     * @static
     * @param {IInvestment} message Investment message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Investment.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes an Investment message from the specified reader or buffer.
     * @function decode
     * @memberof Investment
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {Investment} Investment
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Investment.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.Investment();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
            case 1: {
                    message.currentGoldStockPile = reader.int32();
                    break;
                }
            case 2: {
                    message.goldInvested = reader.int32();
                    break;
                }
            case 3: {
                    message.maxGoldStockPile = reader.int32();
                    break;
                }
            case 4: {
                    message.maximumReturn = reader.int32();
                    break;
                }
            case 5: {
                    message.minimumReturn = reader.int32();
                    break;
                }
            case 6: {
                    message.name = reader.string();
                    break;
                }
            case 7: {
                    message.turnsPerRoll = reader.int32();
                    break;
                }
            case 8: {
                    message.turnsUntilNextRoll = reader.int32();
                    break;
                }
            case 9: {
                    if (!(message.upgrades && message.upgrades.length))
                        message.upgrades = [];
                    message.upgrades.push(reader.string());
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes an Investment message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof Investment
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {Investment} Investment
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Investment.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies an Investment message.
     * @function verify
     * @memberof Investment
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    Investment.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.currentGoldStockPile != null && message.hasOwnProperty("currentGoldStockPile"))
            if (!$util.isInteger(message.currentGoldStockPile))
                return "currentGoldStockPile: integer expected";
        if (message.goldInvested != null && message.hasOwnProperty("goldInvested"))
            if (!$util.isInteger(message.goldInvested))
                return "goldInvested: integer expected";
        if (message.maxGoldStockPile != null && message.hasOwnProperty("maxGoldStockPile"))
            if (!$util.isInteger(message.maxGoldStockPile))
                return "maxGoldStockPile: integer expected";
        if (message.maximumReturn != null && message.hasOwnProperty("maximumReturn"))
            if (!$util.isInteger(message.maximumReturn))
                return "maximumReturn: integer expected";
        if (message.minimumReturn != null && message.hasOwnProperty("minimumReturn"))
            if (!$util.isInteger(message.minimumReturn))
                return "minimumReturn: integer expected";
        if (message.name != null && message.hasOwnProperty("name"))
            if (!$util.isString(message.name))
                return "name: string expected";
        if (message.turnsPerRoll != null && message.hasOwnProperty("turnsPerRoll"))
            if (!$util.isInteger(message.turnsPerRoll))
                return "turnsPerRoll: integer expected";
        if (message.turnsUntilNextRoll != null && message.hasOwnProperty("turnsUntilNextRoll"))
            if (!$util.isInteger(message.turnsUntilNextRoll))
                return "turnsUntilNextRoll: integer expected";
        if (message.upgrades != null && message.hasOwnProperty("upgrades")) {
            if (!Array.isArray(message.upgrades))
                return "upgrades: array expected";
            for (var i = 0; i < message.upgrades.length; ++i)
                if (!$util.isString(message.upgrades[i]))
                    return "upgrades: string[] expected";
        }
        return null;
    };

    /**
     * Creates an Investment message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof Investment
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {Investment} Investment
     */
    Investment.fromObject = function fromObject(object) {
        if (object instanceof $root.Investment)
            return object;
        var message = new $root.Investment();
        if (object.currentGoldStockPile != null)
            message.currentGoldStockPile = object.currentGoldStockPile | 0;
        if (object.goldInvested != null)
            message.goldInvested = object.goldInvested | 0;
        if (object.maxGoldStockPile != null)
            message.maxGoldStockPile = object.maxGoldStockPile | 0;
        if (object.maximumReturn != null)
            message.maximumReturn = object.maximumReturn | 0;
        if (object.minimumReturn != null)
            message.minimumReturn = object.minimumReturn | 0;
        if (object.name != null)
            message.name = String(object.name);
        if (object.turnsPerRoll != null)
            message.turnsPerRoll = object.turnsPerRoll | 0;
        if (object.turnsUntilNextRoll != null)
            message.turnsUntilNextRoll = object.turnsUntilNextRoll | 0;
        if (object.upgrades) {
            if (!Array.isArray(object.upgrades))
                throw TypeError(".Investment.upgrades: array expected");
            message.upgrades = [];
            for (var i = 0; i < object.upgrades.length; ++i)
                message.upgrades[i] = String(object.upgrades[i]);
        }
        return message;
    };

    /**
     * Creates a plain object from an Investment message. Also converts values to other types if specified.
     * @function toObject
     * @memberof Investment
     * @static
     * @param {Investment} message Investment
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    Investment.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.arrays || options.defaults)
            object.upgrades = [];
        if (options.defaults) {
            object.currentGoldStockPile = 0;
            object.goldInvested = 0;
            object.maxGoldStockPile = 0;
            object.maximumReturn = 0;
            object.minimumReturn = 0;
            object.name = "";
            object.turnsPerRoll = 0;
            object.turnsUntilNextRoll = 0;
        }
        if (message.currentGoldStockPile != null && message.hasOwnProperty("currentGoldStockPile"))
            object.currentGoldStockPile = message.currentGoldStockPile;
        if (message.goldInvested != null && message.hasOwnProperty("goldInvested"))
            object.goldInvested = message.goldInvested;
        if (message.maxGoldStockPile != null && message.hasOwnProperty("maxGoldStockPile"))
            object.maxGoldStockPile = message.maxGoldStockPile;
        if (message.maximumReturn != null && message.hasOwnProperty("maximumReturn"))
            object.maximumReturn = message.maximumReturn;
        if (message.minimumReturn != null && message.hasOwnProperty("minimumReturn"))
            object.minimumReturn = message.minimumReturn;
        if (message.name != null && message.hasOwnProperty("name"))
            object.name = message.name;
        if (message.turnsPerRoll != null && message.hasOwnProperty("turnsPerRoll"))
            object.turnsPerRoll = message.turnsPerRoll;
        if (message.turnsUntilNextRoll != null && message.hasOwnProperty("turnsUntilNextRoll"))
            object.turnsUntilNextRoll = message.turnsUntilNextRoll;
        if (message.upgrades && message.upgrades.length) {
            object.upgrades = [];
            for (var j = 0; j < message.upgrades.length; ++j)
                object.upgrades[j] = message.upgrades[j];
        }
        return object;
    };

    /**
     * Converts this Investment to JSON.
     * @function toJSON
     * @memberof Investment
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    Investment.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for Investment
     * @function getTypeUrl
     * @memberof Investment
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    Investment.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/Investment";
    };

    return Investment;
})();

$root.Item = (function() {

    /**
     * Properties of an Item.
     * @exports IItem
     * @interface IItem
     * @property {number|null} [baseValue] Item baseValue
     * @property {string|null} [icon] Item icon
     * @property {string|null} [id] Item id
     * @property {string|null} [itemClass] Item itemClass
     * @property {string|null} [name] Item name
     * @property {string|null} [slot] Item slot
     * @property {boolean|null} [stackable] Item stackable
     * @property {Object.<string,number>|null} [stats] Item stats
     */

    /**
     * Constructs a new Item.
     * @exports Item
     * @classdesc Represents an Item.
     * @implements IItem
     * @constructor
     * @param {IItem=} [properties] Properties to set
     */
    function Item(properties) {
        this.stats = {};
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * Item baseValue.
     * @member {number} baseValue
     * @memberof Item
     * @instance
     */
    Item.prototype.baseValue = 0;

    /**
     * Item icon.
     * @member {string} icon
     * @memberof Item
     * @instance
     */
    Item.prototype.icon = "";

    /**
     * Item id.
     * @member {string} id
     * @memberof Item
     * @instance
     */
    Item.prototype.id = "";

    /**
     * Item itemClass.
     * @member {string} itemClass
     * @memberof Item
     * @instance
     */
    Item.prototype.itemClass = "";

    /**
     * Item name.
     * @member {string} name
     * @memberof Item
     * @instance
     */
    Item.prototype.name = "";

    /**
     * Item slot.
     * @member {string} slot
     * @memberof Item
     * @instance
     */
    Item.prototype.slot = "";

    /**
     * Item stackable.
     * @member {boolean} stackable
     * @memberof Item
     * @instance
     */
    Item.prototype.stackable = false;

    /**
     * Item stats.
     * @member {Object.<string,number>} stats
     * @memberof Item
     * @instance
     */
    Item.prototype.stats = $util.emptyObject;

    /**
     * Creates a new Item instance using the specified properties.
     * @function create
     * @memberof Item
     * @static
     * @param {IItem=} [properties] Properties to set
     * @returns {Item} Item instance
     */
    Item.create = function create(properties) {
        return new Item(properties);
    };

    /**
     * Encodes the specified Item message. Does not implicitly {@link Item.verify|verify} messages.
     * @function encode
     * @memberof Item
     * @static
     * @param {IItem} message Item message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Item.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.baseValue != null && Object.hasOwnProperty.call(message, "baseValue"))
            writer.uint32(/* id 1, wireType 0 =*/8).int32(message.baseValue);
        if (message.icon != null && Object.hasOwnProperty.call(message, "icon"))
            writer.uint32(/* id 2, wireType 2 =*/18).string(message.icon);
        if (message.id != null && Object.hasOwnProperty.call(message, "id"))
            writer.uint32(/* id 3, wireType 2 =*/26).string(message.id);
        if (message.itemClass != null && Object.hasOwnProperty.call(message, "itemClass"))
            writer.uint32(/* id 4, wireType 2 =*/34).string(message.itemClass);
        if (message.name != null && Object.hasOwnProperty.call(message, "name"))
            writer.uint32(/* id 5, wireType 2 =*/42).string(message.name);
        if (message.slot != null && Object.hasOwnProperty.call(message, "slot"))
            writer.uint32(/* id 6, wireType 2 =*/50).string(message.slot);
        if (message.stackable != null && Object.hasOwnProperty.call(message, "stackable"))
            writer.uint32(/* id 7, wireType 0 =*/56).bool(message.stackable);
        if (message.stats != null && Object.hasOwnProperty.call(message, "stats"))
            for (var keys = Object.keys(message.stats), i = 0; i < keys.length; ++i)
                writer.uint32(/* id 8, wireType 2 =*/66).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]).uint32(/* id 2, wireType 5 =*/21).float(message.stats[keys[i]]).ldelim();
        return writer;
    };

    /**
     * Encodes the specified Item message, length delimited. Does not implicitly {@link Item.verify|verify} messages.
     * @function encodeDelimited
     * @memberof Item
     * @static
     * @param {IItem} message Item message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Item.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes an Item message from the specified reader or buffer.
     * @function decode
     * @memberof Item
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {Item} Item
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Item.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.Item(), key, value;
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
            case 1: {
                    message.baseValue = reader.int32();
                    break;
                }
            case 2: {
                    message.icon = reader.string();
                    break;
                }
            case 3: {
                    message.id = reader.string();
                    break;
                }
            case 4: {
                    message.itemClass = reader.string();
                    break;
                }
            case 5: {
                    message.name = reader.string();
                    break;
                }
            case 6: {
                    message.slot = reader.string();
                    break;
                }
            case 7: {
                    message.stackable = reader.bool();
                    break;
                }
            case 8: {
                    if (message.stats === $util.emptyObject)
                        message.stats = {};
                    var end2 = reader.uint32() + reader.pos;
                    key = "";
                    value = 0;
                    while (reader.pos < end2) {
                        var tag2 = reader.uint32();
                        switch (tag2 >>> 3) {
                        case 1:
                            key = reader.string();
                            break;
                        case 2:
                            value = reader.float();
                            break;
                        default:
                            reader.skipType(tag2 & 7);
                            break;
                        }
                    }
                    message.stats[key] = value;
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes an Item message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof Item
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {Item} Item
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Item.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies an Item message.
     * @function verify
     * @memberof Item
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    Item.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.baseValue != null && message.hasOwnProperty("baseValue"))
            if (!$util.isInteger(message.baseValue))
                return "baseValue: integer expected";
        if (message.icon != null && message.hasOwnProperty("icon"))
            if (!$util.isString(message.icon))
                return "icon: string expected";
        if (message.id != null && message.hasOwnProperty("id"))
            if (!$util.isString(message.id))
                return "id: string expected";
        if (message.itemClass != null && message.hasOwnProperty("itemClass"))
            if (!$util.isString(message.itemClass))
                return "itemClass: string expected";
        if (message.name != null && message.hasOwnProperty("name"))
            if (!$util.isString(message.name))
                return "name: string expected";
        if (message.slot != null && message.hasOwnProperty("slot"))
            if (!$util.isString(message.slot))
                return "slot: string expected";
        if (message.stackable != null && message.hasOwnProperty("stackable"))
            if (typeof message.stackable !== "boolean")
                return "stackable: boolean expected";
        if (message.stats != null && message.hasOwnProperty("stats")) {
            if (!$util.isObject(message.stats))
                return "stats: object expected";
            var key = Object.keys(message.stats);
            for (var i = 0; i < key.length; ++i)
                if (typeof message.stats[key[i]] !== "number")
                    return "stats: number{k:string} expected";
        }
        return null;
    };

    /**
     * Creates an Item message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof Item
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {Item} Item
     */
    Item.fromObject = function fromObject(object) {
        if (object instanceof $root.Item)
            return object;
        var message = new $root.Item();
        if (object.baseValue != null)
            message.baseValue = object.baseValue | 0;
        if (object.icon != null)
            message.icon = String(object.icon);
        if (object.id != null)
            message.id = String(object.id);
        if (object.itemClass != null)
            message.itemClass = String(object.itemClass);
        if (object.name != null)
            message.name = String(object.name);
        if (object.slot != null)
            message.slot = String(object.slot);
        if (object.stackable != null)
            message.stackable = Boolean(object.stackable);
        if (object.stats) {
            if (typeof object.stats !== "object")
                throw TypeError(".Item.stats: object expected");
            message.stats = {};
            for (var keys = Object.keys(object.stats), i = 0; i < keys.length; ++i)
                message.stats[keys[i]] = Number(object.stats[keys[i]]);
        }
        return message;
    };

    /**
     * Creates a plain object from an Item message. Also converts values to other types if specified.
     * @function toObject
     * @memberof Item
     * @static
     * @param {Item} message Item
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    Item.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.objects || options.defaults)
            object.stats = {};
        if (options.defaults) {
            object.baseValue = 0;
            object.icon = "";
            object.id = "";
            object.itemClass = "";
            object.name = "";
            object.slot = "";
            object.stackable = false;
        }
        if (message.baseValue != null && message.hasOwnProperty("baseValue"))
            object.baseValue = message.baseValue;
        if (message.icon != null && message.hasOwnProperty("icon"))
            object.icon = message.icon;
        if (message.id != null && message.hasOwnProperty("id"))
            object.id = message.id;
        if (message.itemClass != null && message.hasOwnProperty("itemClass"))
            object.itemClass = message.itemClass;
        if (message.name != null && message.hasOwnProperty("name"))
            object.name = message.name;
        if (message.slot != null && message.hasOwnProperty("slot"))
            object.slot = message.slot;
        if (message.stackable != null && message.hasOwnProperty("stackable"))
            object.stackable = message.stackable;
        var keys2;
        if (message.stats && (keys2 = Object.keys(message.stats)).length) {
            object.stats = {};
            for (var j = 0; j < keys2.length; ++j)
                object.stats[keys2[j]] = options.json && !isFinite(message.stats[keys2[j]]) ? String(message.stats[keys2[j]]) : message.stats[keys2[j]];
        }
        return object;
    };

    /**
     * Converts this Item to JSON.
     * @function toJSON
     * @memberof Item
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    Item.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for Item
     * @function getTypeUrl
     * @memberof Item
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    Item.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/Item";
    };

    return Item;
})();

$root.JobExperience = (function() {

    /**
     * Properties of a JobExperience.
     * @exports IJobExperience
     * @interface IJobExperience
     * @property {number|null} [experience] JobExperience experience
     * @property {string|null} [job] JobExperience job
     * @property {number|null} [rank] JobExperience rank
     */

    /**
     * Constructs a new JobExperience.
     * @exports JobExperience
     * @classdesc Represents a JobExperience.
     * @implements IJobExperience
     * @constructor
     * @param {IJobExperience=} [properties] Properties to set
     */
    function JobExperience(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * JobExperience experience.
     * @member {number} experience
     * @memberof JobExperience
     * @instance
     */
    JobExperience.prototype.experience = 0;

    /**
     * JobExperience job.
     * @member {string} job
     * @memberof JobExperience
     * @instance
     */
    JobExperience.prototype.job = "";

    /**
     * JobExperience rank.
     * @member {number} rank
     * @memberof JobExperience
     * @instance
     */
    JobExperience.prototype.rank = 0;

    /**
     * Creates a new JobExperience instance using the specified properties.
     * @function create
     * @memberof JobExperience
     * @static
     * @param {IJobExperience=} [properties] Properties to set
     * @returns {JobExperience} JobExperience instance
     */
    JobExperience.create = function create(properties) {
        return new JobExperience(properties);
    };

    /**
     * Encodes the specified JobExperience message. Does not implicitly {@link JobExperience.verify|verify} messages.
     * @function encode
     * @memberof JobExperience
     * @static
     * @param {IJobExperience} message JobExperience message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    JobExperience.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.experience != null && Object.hasOwnProperty.call(message, "experience"))
            writer.uint32(/* id 1, wireType 0 =*/8).int32(message.experience);
        if (message.job != null && Object.hasOwnProperty.call(message, "job"))
            writer.uint32(/* id 2, wireType 2 =*/18).string(message.job);
        if (message.rank != null && Object.hasOwnProperty.call(message, "rank"))
            writer.uint32(/* id 3, wireType 0 =*/24).int32(message.rank);
        return writer;
    };

    /**
     * Encodes the specified JobExperience message, length delimited. Does not implicitly {@link JobExperience.verify|verify} messages.
     * @function encodeDelimited
     * @memberof JobExperience
     * @static
     * @param {IJobExperience} message JobExperience message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    JobExperience.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a JobExperience message from the specified reader or buffer.
     * @function decode
     * @memberof JobExperience
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {JobExperience} JobExperience
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    JobExperience.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.JobExperience();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
            case 1: {
                    message.experience = reader.int32();
                    break;
                }
            case 2: {
                    message.job = reader.string();
                    break;
                }
            case 3: {
                    message.rank = reader.int32();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a JobExperience message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof JobExperience
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {JobExperience} JobExperience
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    JobExperience.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a JobExperience message.
     * @function verify
     * @memberof JobExperience
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    JobExperience.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.experience != null && message.hasOwnProperty("experience"))
            if (!$util.isInteger(message.experience))
                return "experience: integer expected";
        if (message.job != null && message.hasOwnProperty("job"))
            if (!$util.isString(message.job))
                return "job: string expected";
        if (message.rank != null && message.hasOwnProperty("rank"))
            if (!$util.isInteger(message.rank))
                return "rank: integer expected";
        return null;
    };

    /**
     * Creates a JobExperience message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof JobExperience
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {JobExperience} JobExperience
     */
    JobExperience.fromObject = function fromObject(object) {
        if (object instanceof $root.JobExperience)
            return object;
        var message = new $root.JobExperience();
        if (object.experience != null)
            message.experience = object.experience | 0;
        if (object.job != null)
            message.job = String(object.job);
        if (object.rank != null)
            message.rank = object.rank | 0;
        return message;
    };

    /**
     * Creates a plain object from a JobExperience message. Also converts values to other types if specified.
     * @function toObject
     * @memberof JobExperience
     * @static
     * @param {JobExperience} message JobExperience
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    JobExperience.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults) {
            object.experience = 0;
            object.job = "";
            object.rank = 0;
        }
        if (message.experience != null && message.hasOwnProperty("experience"))
            object.experience = message.experience;
        if (message.job != null && message.hasOwnProperty("job"))
            object.job = message.job;
        if (message.rank != null && message.hasOwnProperty("rank"))
            object.rank = message.rank;
        return object;
    };

    /**
     * Converts this JobExperience to JSON.
     * @function toJSON
     * @memberof JobExperience
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    JobExperience.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for JobExperience
     * @function getTypeUrl
     * @memberof JobExperience
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    JobExperience.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/JobExperience";
    };

    return JobExperience;
})();

$root.LearningSpell = (function() {

    /**
     * Properties of a LearningSpell.
     * @exports ILearningSpell
     * @interface ILearningSpell
     * @property {string|null} [bookName] LearningSpell bookName
     * @property {string|null} [element] LearningSpell element
     * @property {number|null} [experience] LearningSpell experience
     * @property {string|null} [spellName] LearningSpell spellName
     */

    /**
     * Constructs a new LearningSpell.
     * @exports LearningSpell
     * @classdesc Represents a LearningSpell.
     * @implements ILearningSpell
     * @constructor
     * @param {ILearningSpell=} [properties] Properties to set
     */
    function LearningSpell(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * LearningSpell bookName.
     * @member {string} bookName
     * @memberof LearningSpell
     * @instance
     */
    LearningSpell.prototype.bookName = "";

    /**
     * LearningSpell element.
     * @member {string} element
     * @memberof LearningSpell
     * @instance
     */
    LearningSpell.prototype.element = "";

    /**
     * LearningSpell experience.
     * @member {number} experience
     * @memberof LearningSpell
     * @instance
     */
    LearningSpell.prototype.experience = 0;

    /**
     * LearningSpell spellName.
     * @member {string} spellName
     * @memberof LearningSpell
     * @instance
     */
    LearningSpell.prototype.spellName = "";

    /**
     * Creates a new LearningSpell instance using the specified properties.
     * @function create
     * @memberof LearningSpell
     * @static
     * @param {ILearningSpell=} [properties] Properties to set
     * @returns {LearningSpell} LearningSpell instance
     */
    LearningSpell.create = function create(properties) {
        return new LearningSpell(properties);
    };

    /**
     * Encodes the specified LearningSpell message. Does not implicitly {@link LearningSpell.verify|verify} messages.
     * @function encode
     * @memberof LearningSpell
     * @static
     * @param {ILearningSpell} message LearningSpell message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    LearningSpell.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.bookName != null && Object.hasOwnProperty.call(message, "bookName"))
            writer.uint32(/* id 1, wireType 2 =*/10).string(message.bookName);
        if (message.element != null && Object.hasOwnProperty.call(message, "element"))
            writer.uint32(/* id 2, wireType 2 =*/18).string(message.element);
        if (message.experience != null && Object.hasOwnProperty.call(message, "experience"))
            writer.uint32(/* id 3, wireType 0 =*/24).int32(message.experience);
        if (message.spellName != null && Object.hasOwnProperty.call(message, "spellName"))
            writer.uint32(/* id 4, wireType 2 =*/34).string(message.spellName);
        return writer;
    };

    /**
     * Encodes the specified LearningSpell message, length delimited. Does not implicitly {@link LearningSpell.verify|verify} messages.
     * @function encodeDelimited
     * @memberof LearningSpell
     * @static
     * @param {ILearningSpell} message LearningSpell message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    LearningSpell.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a LearningSpell message from the specified reader or buffer.
     * @function decode
     * @memberof LearningSpell
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {LearningSpell} LearningSpell
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    LearningSpell.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.LearningSpell();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
            case 1: {
                    message.bookName = reader.string();
                    break;
                }
            case 2: {
                    message.element = reader.string();
                    break;
                }
            case 3: {
                    message.experience = reader.int32();
                    break;
                }
            case 4: {
                    message.spellName = reader.string();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a LearningSpell message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof LearningSpell
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {LearningSpell} LearningSpell
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    LearningSpell.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a LearningSpell message.
     * @function verify
     * @memberof LearningSpell
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    LearningSpell.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.bookName != null && message.hasOwnProperty("bookName"))
            if (!$util.isString(message.bookName))
                return "bookName: string expected";
        if (message.element != null && message.hasOwnProperty("element"))
            if (!$util.isString(message.element))
                return "element: string expected";
        if (message.experience != null && message.hasOwnProperty("experience"))
            if (!$util.isInteger(message.experience))
                return "experience: integer expected";
        if (message.spellName != null && message.hasOwnProperty("spellName"))
            if (!$util.isString(message.spellName))
                return "spellName: string expected";
        return null;
    };

    /**
     * Creates a LearningSpell message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof LearningSpell
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {LearningSpell} LearningSpell
     */
    LearningSpell.fromObject = function fromObject(object) {
        if (object instanceof $root.LearningSpell)
            return object;
        var message = new $root.LearningSpell();
        if (object.bookName != null)
            message.bookName = String(object.bookName);
        if (object.element != null)
            message.element = String(object.element);
        if (object.experience != null)
            message.experience = object.experience | 0;
        if (object.spellName != null)
            message.spellName = String(object.spellName);
        return message;
    };

    /**
     * Creates a plain object from a LearningSpell message. Also converts values to other types if specified.
     * @function toObject
     * @memberof LearningSpell
     * @static
     * @param {LearningSpell} message LearningSpell
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    LearningSpell.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults) {
            object.bookName = "";
            object.element = "";
            object.experience = 0;
            object.spellName = "";
        }
        if (message.bookName != null && message.hasOwnProperty("bookName"))
            object.bookName = message.bookName;
        if (message.element != null && message.hasOwnProperty("element"))
            object.element = message.element;
        if (message.experience != null && message.hasOwnProperty("experience"))
            object.experience = message.experience;
        if (message.spellName != null && message.hasOwnProperty("spellName"))
            object.spellName = message.spellName;
        return object;
    };

    /**
     * Converts this LearningSpell to JSON.
     * @function toJSON
     * @memberof LearningSpell
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    LearningSpell.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for LearningSpell
     * @function getTypeUrl
     * @memberof LearningSpell
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    LearningSpell.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/LearningSpell";
    };

    return LearningSpell;
})();

$root.MagicProficiency = (function() {

    /**
     * Properties of a MagicProficiency.
     * @exports IMagicProficiency
     * @interface IMagicProficiency
     * @property {number|null} [proficiency] MagicProficiency proficiency
     * @property {string|null} [school] MagicProficiency school
     */

    /**
     * Constructs a new MagicProficiency.
     * @exports MagicProficiency
     * @classdesc Represents a MagicProficiency.
     * @implements IMagicProficiency
     * @constructor
     * @param {IMagicProficiency=} [properties] Properties to set
     */
    function MagicProficiency(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * MagicProficiency proficiency.
     * @member {number} proficiency
     * @memberof MagicProficiency
     * @instance
     */
    MagicProficiency.prototype.proficiency = 0;

    /**
     * MagicProficiency school.
     * @member {string} school
     * @memberof MagicProficiency
     * @instance
     */
    MagicProficiency.prototype.school = "";

    /**
     * Creates a new MagicProficiency instance using the specified properties.
     * @function create
     * @memberof MagicProficiency
     * @static
     * @param {IMagicProficiency=} [properties] Properties to set
     * @returns {MagicProficiency} MagicProficiency instance
     */
    MagicProficiency.create = function create(properties) {
        return new MagicProficiency(properties);
    };

    /**
     * Encodes the specified MagicProficiency message. Does not implicitly {@link MagicProficiency.verify|verify} messages.
     * @function encode
     * @memberof MagicProficiency
     * @static
     * @param {IMagicProficiency} message MagicProficiency message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    MagicProficiency.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.proficiency != null && Object.hasOwnProperty.call(message, "proficiency"))
            writer.uint32(/* id 1, wireType 0 =*/8).int32(message.proficiency);
        if (message.school != null && Object.hasOwnProperty.call(message, "school"))
            writer.uint32(/* id 2, wireType 2 =*/18).string(message.school);
        return writer;
    };

    /**
     * Encodes the specified MagicProficiency message, length delimited. Does not implicitly {@link MagicProficiency.verify|verify} messages.
     * @function encodeDelimited
     * @memberof MagicProficiency
     * @static
     * @param {IMagicProficiency} message MagicProficiency message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    MagicProficiency.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a MagicProficiency message from the specified reader or buffer.
     * @function decode
     * @memberof MagicProficiency
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {MagicProficiency} MagicProficiency
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    MagicProficiency.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.MagicProficiency();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
            case 1: {
                    message.proficiency = reader.int32();
                    break;
                }
            case 2: {
                    message.school = reader.string();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a MagicProficiency message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof MagicProficiency
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {MagicProficiency} MagicProficiency
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    MagicProficiency.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a MagicProficiency message.
     * @function verify
     * @memberof MagicProficiency
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    MagicProficiency.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.proficiency != null && message.hasOwnProperty("proficiency"))
            if (!$util.isInteger(message.proficiency))
                return "proficiency: integer expected";
        if (message.school != null && message.hasOwnProperty("school"))
            if (!$util.isString(message.school))
                return "school: string expected";
        return null;
    };

    /**
     * Creates a MagicProficiency message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof MagicProficiency
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {MagicProficiency} MagicProficiency
     */
    MagicProficiency.fromObject = function fromObject(object) {
        if (object instanceof $root.MagicProficiency)
            return object;
        var message = new $root.MagicProficiency();
        if (object.proficiency != null)
            message.proficiency = object.proficiency | 0;
        if (object.school != null)
            message.school = String(object.school);
        return message;
    };

    /**
     * Creates a plain object from a MagicProficiency message. Also converts values to other types if specified.
     * @function toObject
     * @memberof MagicProficiency
     * @static
     * @param {MagicProficiency} message MagicProficiency
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    MagicProficiency.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults) {
            object.proficiency = 0;
            object.school = "";
        }
        if (message.proficiency != null && message.hasOwnProperty("proficiency"))
            object.proficiency = message.proficiency;
        if (message.school != null && message.hasOwnProperty("school"))
            object.school = message.school;
        return object;
    };

    /**
     * Converts this MagicProficiency to JSON.
     * @function toJSON
     * @memberof MagicProficiency
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    MagicProficiency.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for MagicProficiency
     * @function getTypeUrl
     * @memberof MagicProficiency
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    MagicProficiency.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/MagicProficiency";
    };

    return MagicProficiency;
})();

$root.Minion = (function() {

    /**
     * Properties of a Minion.
     * @exports IMinion
     * @interface IMinion
     * @property {ICreature|null} [base] Minion base
     * @property {number|null} [turnsLeftAlive] Minion turnsLeftAlive
     */

    /**
     * Constructs a new Minion.
     * @exports Minion
     * @classdesc Represents a Minion.
     * @implements IMinion
     * @constructor
     * @param {IMinion=} [properties] Properties to set
     */
    function Minion(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * Minion base.
     * @member {ICreature|null|undefined} base
     * @memberof Minion
     * @instance
     */
    Minion.prototype.base = null;

    /**
     * Minion turnsLeftAlive.
     * @member {number} turnsLeftAlive
     * @memberof Minion
     * @instance
     */
    Minion.prototype.turnsLeftAlive = 0;

    /**
     * Creates a new Minion instance using the specified properties.
     * @function create
     * @memberof Minion
     * @static
     * @param {IMinion=} [properties] Properties to set
     * @returns {Minion} Minion instance
     */
    Minion.create = function create(properties) {
        return new Minion(properties);
    };

    /**
     * Encodes the specified Minion message. Does not implicitly {@link Minion.verify|verify} messages.
     * @function encode
     * @memberof Minion
     * @static
     * @param {IMinion} message Minion message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Minion.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.base != null && Object.hasOwnProperty.call(message, "base"))
            $root.Creature.encode(message.base, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
        if (message.turnsLeftAlive != null && Object.hasOwnProperty.call(message, "turnsLeftAlive"))
            writer.uint32(/* id 2, wireType 0 =*/16).int32(message.turnsLeftAlive);
        return writer;
    };

    /**
     * Encodes the specified Minion message, length delimited. Does not implicitly {@link Minion.verify|verify} messages.
     * @function encodeDelimited
     * @memberof Minion
     * @static
     * @param {IMinion} message Minion message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Minion.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a Minion message from the specified reader or buffer.
     * @function decode
     * @memberof Minion
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {Minion} Minion
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Minion.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.Minion();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
            case 1: {
                    message.base = $root.Creature.decode(reader, reader.uint32());
                    break;
                }
            case 2: {
                    message.turnsLeftAlive = reader.int32();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a Minion message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof Minion
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {Minion} Minion
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Minion.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a Minion message.
     * @function verify
     * @memberof Minion
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    Minion.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.base != null && message.hasOwnProperty("base")) {
            var error = $root.Creature.verify(message.base);
            if (error)
                return "base." + error;
        }
        if (message.turnsLeftAlive != null && message.hasOwnProperty("turnsLeftAlive"))
            if (!$util.isInteger(message.turnsLeftAlive))
                return "turnsLeftAlive: integer expected";
        return null;
    };

    /**
     * Creates a Minion message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof Minion
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {Minion} Minion
     */
    Minion.fromObject = function fromObject(object) {
        if (object instanceof $root.Minion)
            return object;
        var message = new $root.Minion();
        if (object.base != null) {
            if (typeof object.base !== "object")
                throw TypeError(".Minion.base: object expected");
            message.base = $root.Creature.fromObject(object.base);
        }
        if (object.turnsLeftAlive != null)
            message.turnsLeftAlive = object.turnsLeftAlive | 0;
        return message;
    };

    /**
     * Creates a plain object from a Minion message. Also converts values to other types if specified.
     * @function toObject
     * @memberof Minion
     * @static
     * @param {Minion} message Minion
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    Minion.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults) {
            object.base = null;
            object.turnsLeftAlive = 0;
        }
        if (message.base != null && message.hasOwnProperty("base"))
            object.base = $root.Creature.toObject(message.base, options);
        if (message.turnsLeftAlive != null && message.hasOwnProperty("turnsLeftAlive"))
            object.turnsLeftAlive = message.turnsLeftAlive;
        return object;
    };

    /**
     * Converts this Minion to JSON.
     * @function toJSON
     * @memberof Minion
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    Minion.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for Minion
     * @function getTypeUrl
     * @memberof Minion
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    Minion.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/Minion";
    };

    return Minion;
})();

$root.PlayerCharacter = (function() {

    /**
     * Properties of a PlayerCharacter.
     * @exports IPlayerCharacter
     * @interface IPlayerCharacter
     * @property {IAllocatedSkillPoints|null} [allocatedSkillPoints] PlayerCharacter allocatedSkillPoints
     * @property {number|null} [attackPower] PlayerCharacter attackPower
     * @property {ICharacter|null} [base] PlayerCharacter base
     * @property {string|null} [blessing] PlayerCharacter blessing
     * @property {Array.<ICharacter>|null} [children] PlayerCharacter children
     * @property {Array.<ICondition>|null} [conditions] PlayerCharacter conditions
     * @property {ICurrentDungeon|null} [currentDungeon] PlayerCharacter currentDungeon
     * @property {IEquipment|null} [equipment] PlayerCharacter equipment
     * @property {number|null} [gold] PlayerCharacter gold
     * @property {number|null} [health] PlayerCharacter health
     * @property {number|null} [healthMax] PlayerCharacter healthMax
     * @property {Array.<IItem>|null} [inventory] PlayerCharacter inventory
     * @property {Array.<IInvestment>|null} [investments] PlayerCharacter investments
     * @property {Array.<IJobExperience>|null} [jobExperience] PlayerCharacter jobExperience
     * @property {Array.<ICharacter>|null} [knownCharacters] PlayerCharacter knownCharacters
     * @property {Array.<string>|null} [knownSpells] PlayerCharacter knownSpells
     * @property {Array.<ILearningSpell>|null} [learningSpells] PlayerCharacter learningSpells
     * @property {Array.<IMagicProficiency>|null} [magicProficiencies] PlayerCharacter magicProficiencies
     * @property {number|null} [mana] PlayerCharacter mana
     * @property {number|null} [manaMax] PlayerCharacter manaMax
     * @property {number|null} [manaRegen] PlayerCharacter manaRegen
     * @property {Array.<IMinion>|null} [minions] PlayerCharacter minions
     * @property {Array.<ICharacter>|null} [parents] PlayerCharacter parents
     * @property {Array.<ICharacter>|null} [partners] PlayerCharacter partners
     * @property {Array.<string>|null} [physicalAttacks] PlayerCharacter physicalAttacks
     * @property {string|null} [playerClass] PlayerCharacter playerClass
     * @property {Array.<IQualificationProgress>|null} [qualificationProgress] PlayerCharacter qualificationProgress
     * @property {number|null} [sanity] PlayerCharacter sanity
     * @property {number|null} [sanityMax] PlayerCharacter sanityMax
     * @property {IEnemy|null} [savedEnemy] PlayerCharacter savedEnemy
     * @property {number|null} [unAllocatedSkillPoints] PlayerCharacter unAllocatedSkillPoints
     */

    /**
     * Constructs a new PlayerCharacter.
     * @exports PlayerCharacter
     * @classdesc Represents a PlayerCharacter.
     * @implements IPlayerCharacter
     * @constructor
     * @param {IPlayerCharacter=} [properties] Properties to set
     */
    function PlayerCharacter(properties) {
        this.children = [];
        this.conditions = [];
        this.inventory = [];
        this.investments = [];
        this.jobExperience = [];
        this.knownCharacters = [];
        this.knownSpells = [];
        this.learningSpells = [];
        this.magicProficiencies = [];
        this.minions = [];
        this.parents = [];
        this.partners = [];
        this.physicalAttacks = [];
        this.qualificationProgress = [];
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * PlayerCharacter allocatedSkillPoints.
     * @member {IAllocatedSkillPoints|null|undefined} allocatedSkillPoints
     * @memberof PlayerCharacter
     * @instance
     */
    PlayerCharacter.prototype.allocatedSkillPoints = null;

    /**
     * PlayerCharacter attackPower.
     * @member {number} attackPower
     * @memberof PlayerCharacter
     * @instance
     */
    PlayerCharacter.prototype.attackPower = 0;

    /**
     * PlayerCharacter base.
     * @member {ICharacter|null|undefined} base
     * @memberof PlayerCharacter
     * @instance
     */
    PlayerCharacter.prototype.base = null;

    /**
     * PlayerCharacter blessing.
     * @member {string} blessing
     * @memberof PlayerCharacter
     * @instance
     */
    PlayerCharacter.prototype.blessing = "";

    /**
     * PlayerCharacter children.
     * @member {Array.<ICharacter>} children
     * @memberof PlayerCharacter
     * @instance
     */
    PlayerCharacter.prototype.children = $util.emptyArray;

    /**
     * PlayerCharacter conditions.
     * @member {Array.<ICondition>} conditions
     * @memberof PlayerCharacter
     * @instance
     */
    PlayerCharacter.prototype.conditions = $util.emptyArray;

    /**
     * PlayerCharacter currentDungeon.
     * @member {ICurrentDungeon|null|undefined} currentDungeon
     * @memberof PlayerCharacter
     * @instance
     */
    PlayerCharacter.prototype.currentDungeon = null;

    /**
     * PlayerCharacter equipment.
     * @member {IEquipment|null|undefined} equipment
     * @memberof PlayerCharacter
     * @instance
     */
    PlayerCharacter.prototype.equipment = null;

    /**
     * PlayerCharacter gold.
     * @member {number} gold
     * @memberof PlayerCharacter
     * @instance
     */
    PlayerCharacter.prototype.gold = 0;

    /**
     * PlayerCharacter health.
     * @member {number} health
     * @memberof PlayerCharacter
     * @instance
     */
    PlayerCharacter.prototype.health = 0;

    /**
     * PlayerCharacter healthMax.
     * @member {number} healthMax
     * @memberof PlayerCharacter
     * @instance
     */
    PlayerCharacter.prototype.healthMax = 0;

    /**
     * PlayerCharacter inventory.
     * @member {Array.<IItem>} inventory
     * @memberof PlayerCharacter
     * @instance
     */
    PlayerCharacter.prototype.inventory = $util.emptyArray;

    /**
     * PlayerCharacter investments.
     * @member {Array.<IInvestment>} investments
     * @memberof PlayerCharacter
     * @instance
     */
    PlayerCharacter.prototype.investments = $util.emptyArray;

    /**
     * PlayerCharacter jobExperience.
     * @member {Array.<IJobExperience>} jobExperience
     * @memberof PlayerCharacter
     * @instance
     */
    PlayerCharacter.prototype.jobExperience = $util.emptyArray;

    /**
     * PlayerCharacter knownCharacters.
     * @member {Array.<ICharacter>} knownCharacters
     * @memberof PlayerCharacter
     * @instance
     */
    PlayerCharacter.prototype.knownCharacters = $util.emptyArray;

    /**
     * PlayerCharacter knownSpells.
     * @member {Array.<string>} knownSpells
     * @memberof PlayerCharacter
     * @instance
     */
    PlayerCharacter.prototype.knownSpells = $util.emptyArray;

    /**
     * PlayerCharacter learningSpells.
     * @member {Array.<ILearningSpell>} learningSpells
     * @memberof PlayerCharacter
     * @instance
     */
    PlayerCharacter.prototype.learningSpells = $util.emptyArray;

    /**
     * PlayerCharacter magicProficiencies.
     * @member {Array.<IMagicProficiency>} magicProficiencies
     * @memberof PlayerCharacter
     * @instance
     */
    PlayerCharacter.prototype.magicProficiencies = $util.emptyArray;

    /**
     * PlayerCharacter mana.
     * @member {number} mana
     * @memberof PlayerCharacter
     * @instance
     */
    PlayerCharacter.prototype.mana = 0;

    /**
     * PlayerCharacter manaMax.
     * @member {number} manaMax
     * @memberof PlayerCharacter
     * @instance
     */
    PlayerCharacter.prototype.manaMax = 0;

    /**
     * PlayerCharacter manaRegen.
     * @member {number} manaRegen
     * @memberof PlayerCharacter
     * @instance
     */
    PlayerCharacter.prototype.manaRegen = 0;

    /**
     * PlayerCharacter minions.
     * @member {Array.<IMinion>} minions
     * @memberof PlayerCharacter
     * @instance
     */
    PlayerCharacter.prototype.minions = $util.emptyArray;

    /**
     * PlayerCharacter parents.
     * @member {Array.<ICharacter>} parents
     * @memberof PlayerCharacter
     * @instance
     */
    PlayerCharacter.prototype.parents = $util.emptyArray;

    /**
     * PlayerCharacter partners.
     * @member {Array.<ICharacter>} partners
     * @memberof PlayerCharacter
     * @instance
     */
    PlayerCharacter.prototype.partners = $util.emptyArray;

    /**
     * PlayerCharacter physicalAttacks.
     * @member {Array.<string>} physicalAttacks
     * @memberof PlayerCharacter
     * @instance
     */
    PlayerCharacter.prototype.physicalAttacks = $util.emptyArray;

    /**
     * PlayerCharacter playerClass.
     * @member {string} playerClass
     * @memberof PlayerCharacter
     * @instance
     */
    PlayerCharacter.prototype.playerClass = "";

    /**
     * PlayerCharacter qualificationProgress.
     * @member {Array.<IQualificationProgress>} qualificationProgress
     * @memberof PlayerCharacter
     * @instance
     */
    PlayerCharacter.prototype.qualificationProgress = $util.emptyArray;

    /**
     * PlayerCharacter sanity.
     * @member {number} sanity
     * @memberof PlayerCharacter
     * @instance
     */
    PlayerCharacter.prototype.sanity = 0;

    /**
     * PlayerCharacter sanityMax.
     * @member {number} sanityMax
     * @memberof PlayerCharacter
     * @instance
     */
    PlayerCharacter.prototype.sanityMax = 0;

    /**
     * PlayerCharacter savedEnemy.
     * @member {IEnemy|null|undefined} savedEnemy
     * @memberof PlayerCharacter
     * @instance
     */
    PlayerCharacter.prototype.savedEnemy = null;

    /**
     * PlayerCharacter unAllocatedSkillPoints.
     * @member {number} unAllocatedSkillPoints
     * @memberof PlayerCharacter
     * @instance
     */
    PlayerCharacter.prototype.unAllocatedSkillPoints = 0;

    /**
     * Creates a new PlayerCharacter instance using the specified properties.
     * @function create
     * @memberof PlayerCharacter
     * @static
     * @param {IPlayerCharacter=} [properties] Properties to set
     * @returns {PlayerCharacter} PlayerCharacter instance
     */
    PlayerCharacter.create = function create(properties) {
        return new PlayerCharacter(properties);
    };

    /**
     * Encodes the specified PlayerCharacter message. Does not implicitly {@link PlayerCharacter.verify|verify} messages.
     * @function encode
     * @memberof PlayerCharacter
     * @static
     * @param {IPlayerCharacter} message PlayerCharacter message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    PlayerCharacter.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.allocatedSkillPoints != null && Object.hasOwnProperty.call(message, "allocatedSkillPoints"))
            $root.AllocatedSkillPoints.encode(message.allocatedSkillPoints, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
        if (message.attackPower != null && Object.hasOwnProperty.call(message, "attackPower"))
            writer.uint32(/* id 2, wireType 5 =*/21).float(message.attackPower);
        if (message.base != null && Object.hasOwnProperty.call(message, "base"))
            $root.Character.encode(message.base, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
        if (message.blessing != null && Object.hasOwnProperty.call(message, "blessing"))
            writer.uint32(/* id 4, wireType 2 =*/34).string(message.blessing);
        if (message.children != null && message.children.length)
            for (var i = 0; i < message.children.length; ++i)
                $root.Character.encode(message.children[i], writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
        if (message.conditions != null && message.conditions.length)
            for (var i = 0; i < message.conditions.length; ++i)
                $root.Condition.encode(message.conditions[i], writer.uint32(/* id 6, wireType 2 =*/50).fork()).ldelim();
        if (message.currentDungeon != null && Object.hasOwnProperty.call(message, "currentDungeon"))
            $root.CurrentDungeon.encode(message.currentDungeon, writer.uint32(/* id 7, wireType 2 =*/58).fork()).ldelim();
        if (message.equipment != null && Object.hasOwnProperty.call(message, "equipment"))
            $root.Equipment.encode(message.equipment, writer.uint32(/* id 8, wireType 2 =*/66).fork()).ldelim();
        if (message.gold != null && Object.hasOwnProperty.call(message, "gold"))
            writer.uint32(/* id 9, wireType 0 =*/72).int32(message.gold);
        if (message.health != null && Object.hasOwnProperty.call(message, "health"))
            writer.uint32(/* id 10, wireType 5 =*/85).float(message.health);
        if (message.healthMax != null && Object.hasOwnProperty.call(message, "healthMax"))
            writer.uint32(/* id 11, wireType 5 =*/93).float(message.healthMax);
        if (message.inventory != null && message.inventory.length)
            for (var i = 0; i < message.inventory.length; ++i)
                $root.Item.encode(message.inventory[i], writer.uint32(/* id 12, wireType 2 =*/98).fork()).ldelim();
        if (message.investments != null && message.investments.length)
            for (var i = 0; i < message.investments.length; ++i)
                $root.Investment.encode(message.investments[i], writer.uint32(/* id 13, wireType 2 =*/106).fork()).ldelim();
        if (message.jobExperience != null && message.jobExperience.length)
            for (var i = 0; i < message.jobExperience.length; ++i)
                $root.JobExperience.encode(message.jobExperience[i], writer.uint32(/* id 14, wireType 2 =*/114).fork()).ldelim();
        if (message.knownCharacters != null && message.knownCharacters.length)
            for (var i = 0; i < message.knownCharacters.length; ++i)
                $root.Character.encode(message.knownCharacters[i], writer.uint32(/* id 15, wireType 2 =*/122).fork()).ldelim();
        if (message.knownSpells != null && message.knownSpells.length)
            for (var i = 0; i < message.knownSpells.length; ++i)
                writer.uint32(/* id 16, wireType 2 =*/130).string(message.knownSpells[i]);
        if (message.learningSpells != null && message.learningSpells.length)
            for (var i = 0; i < message.learningSpells.length; ++i)
                $root.LearningSpell.encode(message.learningSpells[i], writer.uint32(/* id 17, wireType 2 =*/138).fork()).ldelim();
        if (message.magicProficiencies != null && message.magicProficiencies.length)
            for (var i = 0; i < message.magicProficiencies.length; ++i)
                $root.MagicProficiency.encode(message.magicProficiencies[i], writer.uint32(/* id 18, wireType 2 =*/146).fork()).ldelim();
        if (message.mana != null && Object.hasOwnProperty.call(message, "mana"))
            writer.uint32(/* id 19, wireType 5 =*/157).float(message.mana);
        if (message.manaMax != null && Object.hasOwnProperty.call(message, "manaMax"))
            writer.uint32(/* id 20, wireType 5 =*/165).float(message.manaMax);
        if (message.manaRegen != null && Object.hasOwnProperty.call(message, "manaRegen"))
            writer.uint32(/* id 21, wireType 5 =*/173).float(message.manaRegen);
        if (message.minions != null && message.minions.length)
            for (var i = 0; i < message.minions.length; ++i)
                $root.Minion.encode(message.minions[i], writer.uint32(/* id 22, wireType 2 =*/178).fork()).ldelim();
        if (message.parents != null && message.parents.length)
            for (var i = 0; i < message.parents.length; ++i)
                $root.Character.encode(message.parents[i], writer.uint32(/* id 23, wireType 2 =*/186).fork()).ldelim();
        if (message.partners != null && message.partners.length)
            for (var i = 0; i < message.partners.length; ++i)
                $root.Character.encode(message.partners[i], writer.uint32(/* id 24, wireType 2 =*/194).fork()).ldelim();
        if (message.physicalAttacks != null && message.physicalAttacks.length)
            for (var i = 0; i < message.physicalAttacks.length; ++i)
                writer.uint32(/* id 25, wireType 2 =*/202).string(message.physicalAttacks[i]);
        if (message.playerClass != null && Object.hasOwnProperty.call(message, "playerClass"))
            writer.uint32(/* id 26, wireType 2 =*/210).string(message.playerClass);
        if (message.qualificationProgress != null && message.qualificationProgress.length)
            for (var i = 0; i < message.qualificationProgress.length; ++i)
                $root.QualificationProgress.encode(message.qualificationProgress[i], writer.uint32(/* id 27, wireType 2 =*/218).fork()).ldelim();
        if (message.sanity != null && Object.hasOwnProperty.call(message, "sanity"))
            writer.uint32(/* id 28, wireType 5 =*/229).float(message.sanity);
        if (message.sanityMax != null && Object.hasOwnProperty.call(message, "sanityMax"))
            writer.uint32(/* id 29, wireType 5 =*/237).float(message.sanityMax);
        if (message.savedEnemy != null && Object.hasOwnProperty.call(message, "savedEnemy"))
            $root.Enemy.encode(message.savedEnemy, writer.uint32(/* id 30, wireType 2 =*/242).fork()).ldelim();
        if (message.unAllocatedSkillPoints != null && Object.hasOwnProperty.call(message, "unAllocatedSkillPoints"))
            writer.uint32(/* id 31, wireType 0 =*/248).int32(message.unAllocatedSkillPoints);
        return writer;
    };

    /**
     * Encodes the specified PlayerCharacter message, length delimited. Does not implicitly {@link PlayerCharacter.verify|verify} messages.
     * @function encodeDelimited
     * @memberof PlayerCharacter
     * @static
     * @param {IPlayerCharacter} message PlayerCharacter message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    PlayerCharacter.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a PlayerCharacter message from the specified reader or buffer.
     * @function decode
     * @memberof PlayerCharacter
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {PlayerCharacter} PlayerCharacter
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    PlayerCharacter.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.PlayerCharacter();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
            case 1: {
                    message.allocatedSkillPoints = $root.AllocatedSkillPoints.decode(reader, reader.uint32());
                    break;
                }
            case 2: {
                    message.attackPower = reader.float();
                    break;
                }
            case 3: {
                    message.base = $root.Character.decode(reader, reader.uint32());
                    break;
                }
            case 4: {
                    message.blessing = reader.string();
                    break;
                }
            case 5: {
                    if (!(message.children && message.children.length))
                        message.children = [];
                    message.children.push($root.Character.decode(reader, reader.uint32()));
                    break;
                }
            case 6: {
                    if (!(message.conditions && message.conditions.length))
                        message.conditions = [];
                    message.conditions.push($root.Condition.decode(reader, reader.uint32()));
                    break;
                }
            case 7: {
                    message.currentDungeon = $root.CurrentDungeon.decode(reader, reader.uint32());
                    break;
                }
            case 8: {
                    message.equipment = $root.Equipment.decode(reader, reader.uint32());
                    break;
                }
            case 9: {
                    message.gold = reader.int32();
                    break;
                }
            case 10: {
                    message.health = reader.float();
                    break;
                }
            case 11: {
                    message.healthMax = reader.float();
                    break;
                }
            case 12: {
                    if (!(message.inventory && message.inventory.length))
                        message.inventory = [];
                    message.inventory.push($root.Item.decode(reader, reader.uint32()));
                    break;
                }
            case 13: {
                    if (!(message.investments && message.investments.length))
                        message.investments = [];
                    message.investments.push($root.Investment.decode(reader, reader.uint32()));
                    break;
                }
            case 14: {
                    if (!(message.jobExperience && message.jobExperience.length))
                        message.jobExperience = [];
                    message.jobExperience.push($root.JobExperience.decode(reader, reader.uint32()));
                    break;
                }
            case 15: {
                    if (!(message.knownCharacters && message.knownCharacters.length))
                        message.knownCharacters = [];
                    message.knownCharacters.push($root.Character.decode(reader, reader.uint32()));
                    break;
                }
            case 16: {
                    if (!(message.knownSpells && message.knownSpells.length))
                        message.knownSpells = [];
                    message.knownSpells.push(reader.string());
                    break;
                }
            case 17: {
                    if (!(message.learningSpells && message.learningSpells.length))
                        message.learningSpells = [];
                    message.learningSpells.push($root.LearningSpell.decode(reader, reader.uint32()));
                    break;
                }
            case 18: {
                    if (!(message.magicProficiencies && message.magicProficiencies.length))
                        message.magicProficiencies = [];
                    message.magicProficiencies.push($root.MagicProficiency.decode(reader, reader.uint32()));
                    break;
                }
            case 19: {
                    message.mana = reader.float();
                    break;
                }
            case 20: {
                    message.manaMax = reader.float();
                    break;
                }
            case 21: {
                    message.manaRegen = reader.float();
                    break;
                }
            case 22: {
                    if (!(message.minions && message.minions.length))
                        message.minions = [];
                    message.minions.push($root.Minion.decode(reader, reader.uint32()));
                    break;
                }
            case 23: {
                    if (!(message.parents && message.parents.length))
                        message.parents = [];
                    message.parents.push($root.Character.decode(reader, reader.uint32()));
                    break;
                }
            case 24: {
                    if (!(message.partners && message.partners.length))
                        message.partners = [];
                    message.partners.push($root.Character.decode(reader, reader.uint32()));
                    break;
                }
            case 25: {
                    if (!(message.physicalAttacks && message.physicalAttacks.length))
                        message.physicalAttacks = [];
                    message.physicalAttacks.push(reader.string());
                    break;
                }
            case 26: {
                    message.playerClass = reader.string();
                    break;
                }
            case 27: {
                    if (!(message.qualificationProgress && message.qualificationProgress.length))
                        message.qualificationProgress = [];
                    message.qualificationProgress.push($root.QualificationProgress.decode(reader, reader.uint32()));
                    break;
                }
            case 28: {
                    message.sanity = reader.float();
                    break;
                }
            case 29: {
                    message.sanityMax = reader.float();
                    break;
                }
            case 30: {
                    message.savedEnemy = $root.Enemy.decode(reader, reader.uint32());
                    break;
                }
            case 31: {
                    message.unAllocatedSkillPoints = reader.int32();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a PlayerCharacter message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof PlayerCharacter
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {PlayerCharacter} PlayerCharacter
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    PlayerCharacter.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a PlayerCharacter message.
     * @function verify
     * @memberof PlayerCharacter
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    PlayerCharacter.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.allocatedSkillPoints != null && message.hasOwnProperty("allocatedSkillPoints")) {
            var error = $root.AllocatedSkillPoints.verify(message.allocatedSkillPoints);
            if (error)
                return "allocatedSkillPoints." + error;
        }
        if (message.attackPower != null && message.hasOwnProperty("attackPower"))
            if (typeof message.attackPower !== "number")
                return "attackPower: number expected";
        if (message.base != null && message.hasOwnProperty("base")) {
            var error = $root.Character.verify(message.base);
            if (error)
                return "base." + error;
        }
        if (message.blessing != null && message.hasOwnProperty("blessing"))
            if (!$util.isString(message.blessing))
                return "blessing: string expected";
        if (message.children != null && message.hasOwnProperty("children")) {
            if (!Array.isArray(message.children))
                return "children: array expected";
            for (var i = 0; i < message.children.length; ++i) {
                var error = $root.Character.verify(message.children[i]);
                if (error)
                    return "children." + error;
            }
        }
        if (message.conditions != null && message.hasOwnProperty("conditions")) {
            if (!Array.isArray(message.conditions))
                return "conditions: array expected";
            for (var i = 0; i < message.conditions.length; ++i) {
                var error = $root.Condition.verify(message.conditions[i]);
                if (error)
                    return "conditions." + error;
            }
        }
        if (message.currentDungeon != null && message.hasOwnProperty("currentDungeon")) {
            var error = $root.CurrentDungeon.verify(message.currentDungeon);
            if (error)
                return "currentDungeon." + error;
        }
        if (message.equipment != null && message.hasOwnProperty("equipment")) {
            var error = $root.Equipment.verify(message.equipment);
            if (error)
                return "equipment." + error;
        }
        if (message.gold != null && message.hasOwnProperty("gold"))
            if (!$util.isInteger(message.gold))
                return "gold: integer expected";
        if (message.health != null && message.hasOwnProperty("health"))
            if (typeof message.health !== "number")
                return "health: number expected";
        if (message.healthMax != null && message.hasOwnProperty("healthMax"))
            if (typeof message.healthMax !== "number")
                return "healthMax: number expected";
        if (message.inventory != null && message.hasOwnProperty("inventory")) {
            if (!Array.isArray(message.inventory))
                return "inventory: array expected";
            for (var i = 0; i < message.inventory.length; ++i) {
                var error = $root.Item.verify(message.inventory[i]);
                if (error)
                    return "inventory." + error;
            }
        }
        if (message.investments != null && message.hasOwnProperty("investments")) {
            if (!Array.isArray(message.investments))
                return "investments: array expected";
            for (var i = 0; i < message.investments.length; ++i) {
                var error = $root.Investment.verify(message.investments[i]);
                if (error)
                    return "investments." + error;
            }
        }
        if (message.jobExperience != null && message.hasOwnProperty("jobExperience")) {
            if (!Array.isArray(message.jobExperience))
                return "jobExperience: array expected";
            for (var i = 0; i < message.jobExperience.length; ++i) {
                var error = $root.JobExperience.verify(message.jobExperience[i]);
                if (error)
                    return "jobExperience." + error;
            }
        }
        if (message.knownCharacters != null && message.hasOwnProperty("knownCharacters")) {
            if (!Array.isArray(message.knownCharacters))
                return "knownCharacters: array expected";
            for (var i = 0; i < message.knownCharacters.length; ++i) {
                var error = $root.Character.verify(message.knownCharacters[i]);
                if (error)
                    return "knownCharacters." + error;
            }
        }
        if (message.knownSpells != null && message.hasOwnProperty("knownSpells")) {
            if (!Array.isArray(message.knownSpells))
                return "knownSpells: array expected";
            for (var i = 0; i < message.knownSpells.length; ++i)
                if (!$util.isString(message.knownSpells[i]))
                    return "knownSpells: string[] expected";
        }
        if (message.learningSpells != null && message.hasOwnProperty("learningSpells")) {
            if (!Array.isArray(message.learningSpells))
                return "learningSpells: array expected";
            for (var i = 0; i < message.learningSpells.length; ++i) {
                var error = $root.LearningSpell.verify(message.learningSpells[i]);
                if (error)
                    return "learningSpells." + error;
            }
        }
        if (message.magicProficiencies != null && message.hasOwnProperty("magicProficiencies")) {
            if (!Array.isArray(message.magicProficiencies))
                return "magicProficiencies: array expected";
            for (var i = 0; i < message.magicProficiencies.length; ++i) {
                var error = $root.MagicProficiency.verify(message.magicProficiencies[i]);
                if (error)
                    return "magicProficiencies." + error;
            }
        }
        if (message.mana != null && message.hasOwnProperty("mana"))
            if (typeof message.mana !== "number")
                return "mana: number expected";
        if (message.manaMax != null && message.hasOwnProperty("manaMax"))
            if (typeof message.manaMax !== "number")
                return "manaMax: number expected";
        if (message.manaRegen != null && message.hasOwnProperty("manaRegen"))
            if (typeof message.manaRegen !== "number")
                return "manaRegen: number expected";
        if (message.minions != null && message.hasOwnProperty("minions")) {
            if (!Array.isArray(message.minions))
                return "minions: array expected";
            for (var i = 0; i < message.minions.length; ++i) {
                var error = $root.Minion.verify(message.minions[i]);
                if (error)
                    return "minions." + error;
            }
        }
        if (message.parents != null && message.hasOwnProperty("parents")) {
            if (!Array.isArray(message.parents))
                return "parents: array expected";
            for (var i = 0; i < message.parents.length; ++i) {
                var error = $root.Character.verify(message.parents[i]);
                if (error)
                    return "parents." + error;
            }
        }
        if (message.partners != null && message.hasOwnProperty("partners")) {
            if (!Array.isArray(message.partners))
                return "partners: array expected";
            for (var i = 0; i < message.partners.length; ++i) {
                var error = $root.Character.verify(message.partners[i]);
                if (error)
                    return "partners." + error;
            }
        }
        if (message.physicalAttacks != null && message.hasOwnProperty("physicalAttacks")) {
            if (!Array.isArray(message.physicalAttacks))
                return "physicalAttacks: array expected";
            for (var i = 0; i < message.physicalAttacks.length; ++i)
                if (!$util.isString(message.physicalAttacks[i]))
                    return "physicalAttacks: string[] expected";
        }
        if (message.playerClass != null && message.hasOwnProperty("playerClass"))
            if (!$util.isString(message.playerClass))
                return "playerClass: string expected";
        if (message.qualificationProgress != null && message.hasOwnProperty("qualificationProgress")) {
            if (!Array.isArray(message.qualificationProgress))
                return "qualificationProgress: array expected";
            for (var i = 0; i < message.qualificationProgress.length; ++i) {
                var error = $root.QualificationProgress.verify(message.qualificationProgress[i]);
                if (error)
                    return "qualificationProgress." + error;
            }
        }
        if (message.sanity != null && message.hasOwnProperty("sanity"))
            if (typeof message.sanity !== "number")
                return "sanity: number expected";
        if (message.sanityMax != null && message.hasOwnProperty("sanityMax"))
            if (typeof message.sanityMax !== "number")
                return "sanityMax: number expected";
        if (message.savedEnemy != null && message.hasOwnProperty("savedEnemy")) {
            var error = $root.Enemy.verify(message.savedEnemy);
            if (error)
                return "savedEnemy." + error;
        }
        if (message.unAllocatedSkillPoints != null && message.hasOwnProperty("unAllocatedSkillPoints"))
            if (!$util.isInteger(message.unAllocatedSkillPoints))
                return "unAllocatedSkillPoints: integer expected";
        return null;
    };

    /**
     * Creates a PlayerCharacter message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof PlayerCharacter
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {PlayerCharacter} PlayerCharacter
     */
    PlayerCharacter.fromObject = function fromObject(object) {
        if (object instanceof $root.PlayerCharacter)
            return object;
        var message = new $root.PlayerCharacter();
        if (object.allocatedSkillPoints != null) {
            if (typeof object.allocatedSkillPoints !== "object")
                throw TypeError(".PlayerCharacter.allocatedSkillPoints: object expected");
            message.allocatedSkillPoints = $root.AllocatedSkillPoints.fromObject(object.allocatedSkillPoints);
        }
        if (object.attackPower != null)
            message.attackPower = Number(object.attackPower);
        if (object.base != null) {
            if (typeof object.base !== "object")
                throw TypeError(".PlayerCharacter.base: object expected");
            message.base = $root.Character.fromObject(object.base);
        }
        if (object.blessing != null)
            message.blessing = String(object.blessing);
        if (object.children) {
            if (!Array.isArray(object.children))
                throw TypeError(".PlayerCharacter.children: array expected");
            message.children = [];
            for (var i = 0; i < object.children.length; ++i) {
                if (typeof object.children[i] !== "object")
                    throw TypeError(".PlayerCharacter.children: object expected");
                message.children[i] = $root.Character.fromObject(object.children[i]);
            }
        }
        if (object.conditions) {
            if (!Array.isArray(object.conditions))
                throw TypeError(".PlayerCharacter.conditions: array expected");
            message.conditions = [];
            for (var i = 0; i < object.conditions.length; ++i) {
                if (typeof object.conditions[i] !== "object")
                    throw TypeError(".PlayerCharacter.conditions: object expected");
                message.conditions[i] = $root.Condition.fromObject(object.conditions[i]);
            }
        }
        if (object.currentDungeon != null) {
            if (typeof object.currentDungeon !== "object")
                throw TypeError(".PlayerCharacter.currentDungeon: object expected");
            message.currentDungeon = $root.CurrentDungeon.fromObject(object.currentDungeon);
        }
        if (object.equipment != null) {
            if (typeof object.equipment !== "object")
                throw TypeError(".PlayerCharacter.equipment: object expected");
            message.equipment = $root.Equipment.fromObject(object.equipment);
        }
        if (object.gold != null)
            message.gold = object.gold | 0;
        if (object.health != null)
            message.health = Number(object.health);
        if (object.healthMax != null)
            message.healthMax = Number(object.healthMax);
        if (object.inventory) {
            if (!Array.isArray(object.inventory))
                throw TypeError(".PlayerCharacter.inventory: array expected");
            message.inventory = [];
            for (var i = 0; i < object.inventory.length; ++i) {
                if (typeof object.inventory[i] !== "object")
                    throw TypeError(".PlayerCharacter.inventory: object expected");
                message.inventory[i] = $root.Item.fromObject(object.inventory[i]);
            }
        }
        if (object.investments) {
            if (!Array.isArray(object.investments))
                throw TypeError(".PlayerCharacter.investments: array expected");
            message.investments = [];
            for (var i = 0; i < object.investments.length; ++i) {
                if (typeof object.investments[i] !== "object")
                    throw TypeError(".PlayerCharacter.investments: object expected");
                message.investments[i] = $root.Investment.fromObject(object.investments[i]);
            }
        }
        if (object.jobExperience) {
            if (!Array.isArray(object.jobExperience))
                throw TypeError(".PlayerCharacter.jobExperience: array expected");
            message.jobExperience = [];
            for (var i = 0; i < object.jobExperience.length; ++i) {
                if (typeof object.jobExperience[i] !== "object")
                    throw TypeError(".PlayerCharacter.jobExperience: object expected");
                message.jobExperience[i] = $root.JobExperience.fromObject(object.jobExperience[i]);
            }
        }
        if (object.knownCharacters) {
            if (!Array.isArray(object.knownCharacters))
                throw TypeError(".PlayerCharacter.knownCharacters: array expected");
            message.knownCharacters = [];
            for (var i = 0; i < object.knownCharacters.length; ++i) {
                if (typeof object.knownCharacters[i] !== "object")
                    throw TypeError(".PlayerCharacter.knownCharacters: object expected");
                message.knownCharacters[i] = $root.Character.fromObject(object.knownCharacters[i]);
            }
        }
        if (object.knownSpells) {
            if (!Array.isArray(object.knownSpells))
                throw TypeError(".PlayerCharacter.knownSpells: array expected");
            message.knownSpells = [];
            for (var i = 0; i < object.knownSpells.length; ++i)
                message.knownSpells[i] = String(object.knownSpells[i]);
        }
        if (object.learningSpells) {
            if (!Array.isArray(object.learningSpells))
                throw TypeError(".PlayerCharacter.learningSpells: array expected");
            message.learningSpells = [];
            for (var i = 0; i < object.learningSpells.length; ++i) {
                if (typeof object.learningSpells[i] !== "object")
                    throw TypeError(".PlayerCharacter.learningSpells: object expected");
                message.learningSpells[i] = $root.LearningSpell.fromObject(object.learningSpells[i]);
            }
        }
        if (object.magicProficiencies) {
            if (!Array.isArray(object.magicProficiencies))
                throw TypeError(".PlayerCharacter.magicProficiencies: array expected");
            message.magicProficiencies = [];
            for (var i = 0; i < object.magicProficiencies.length; ++i) {
                if (typeof object.magicProficiencies[i] !== "object")
                    throw TypeError(".PlayerCharacter.magicProficiencies: object expected");
                message.magicProficiencies[i] = $root.MagicProficiency.fromObject(object.magicProficiencies[i]);
            }
        }
        if (object.mana != null)
            message.mana = Number(object.mana);
        if (object.manaMax != null)
            message.manaMax = Number(object.manaMax);
        if (object.manaRegen != null)
            message.manaRegen = Number(object.manaRegen);
        if (object.minions) {
            if (!Array.isArray(object.minions))
                throw TypeError(".PlayerCharacter.minions: array expected");
            message.minions = [];
            for (var i = 0; i < object.minions.length; ++i) {
                if (typeof object.minions[i] !== "object")
                    throw TypeError(".PlayerCharacter.minions: object expected");
                message.minions[i] = $root.Minion.fromObject(object.minions[i]);
            }
        }
        if (object.parents) {
            if (!Array.isArray(object.parents))
                throw TypeError(".PlayerCharacter.parents: array expected");
            message.parents = [];
            for (var i = 0; i < object.parents.length; ++i) {
                if (typeof object.parents[i] !== "object")
                    throw TypeError(".PlayerCharacter.parents: object expected");
                message.parents[i] = $root.Character.fromObject(object.parents[i]);
            }
        }
        if (object.partners) {
            if (!Array.isArray(object.partners))
                throw TypeError(".PlayerCharacter.partners: array expected");
            message.partners = [];
            for (var i = 0; i < object.partners.length; ++i) {
                if (typeof object.partners[i] !== "object")
                    throw TypeError(".PlayerCharacter.partners: object expected");
                message.partners[i] = $root.Character.fromObject(object.partners[i]);
            }
        }
        if (object.physicalAttacks) {
            if (!Array.isArray(object.physicalAttacks))
                throw TypeError(".PlayerCharacter.physicalAttacks: array expected");
            message.physicalAttacks = [];
            for (var i = 0; i < object.physicalAttacks.length; ++i)
                message.physicalAttacks[i] = String(object.physicalAttacks[i]);
        }
        if (object.playerClass != null)
            message.playerClass = String(object.playerClass);
        if (object.qualificationProgress) {
            if (!Array.isArray(object.qualificationProgress))
                throw TypeError(".PlayerCharacter.qualificationProgress: array expected");
            message.qualificationProgress = [];
            for (var i = 0; i < object.qualificationProgress.length; ++i) {
                if (typeof object.qualificationProgress[i] !== "object")
                    throw TypeError(".PlayerCharacter.qualificationProgress: object expected");
                message.qualificationProgress[i] = $root.QualificationProgress.fromObject(object.qualificationProgress[i]);
            }
        }
        if (object.sanity != null)
            message.sanity = Number(object.sanity);
        if (object.sanityMax != null)
            message.sanityMax = Number(object.sanityMax);
        if (object.savedEnemy != null) {
            if (typeof object.savedEnemy !== "object")
                throw TypeError(".PlayerCharacter.savedEnemy: object expected");
            message.savedEnemy = $root.Enemy.fromObject(object.savedEnemy);
        }
        if (object.unAllocatedSkillPoints != null)
            message.unAllocatedSkillPoints = object.unAllocatedSkillPoints | 0;
        return message;
    };

    /**
     * Creates a plain object from a PlayerCharacter message. Also converts values to other types if specified.
     * @function toObject
     * @memberof PlayerCharacter
     * @static
     * @param {PlayerCharacter} message PlayerCharacter
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    PlayerCharacter.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.arrays || options.defaults) {
            object.children = [];
            object.conditions = [];
            object.inventory = [];
            object.investments = [];
            object.jobExperience = [];
            object.knownCharacters = [];
            object.knownSpells = [];
            object.learningSpells = [];
            object.magicProficiencies = [];
            object.minions = [];
            object.parents = [];
            object.partners = [];
            object.physicalAttacks = [];
            object.qualificationProgress = [];
        }
        if (options.defaults) {
            object.allocatedSkillPoints = null;
            object.attackPower = 0;
            object.base = null;
            object.blessing = "";
            object.currentDungeon = null;
            object.equipment = null;
            object.gold = 0;
            object.health = 0;
            object.healthMax = 0;
            object.mana = 0;
            object.manaMax = 0;
            object.manaRegen = 0;
            object.playerClass = "";
            object.sanity = 0;
            object.sanityMax = 0;
            object.savedEnemy = null;
            object.unAllocatedSkillPoints = 0;
        }
        if (message.allocatedSkillPoints != null && message.hasOwnProperty("allocatedSkillPoints"))
            object.allocatedSkillPoints = $root.AllocatedSkillPoints.toObject(message.allocatedSkillPoints, options);
        if (message.attackPower != null && message.hasOwnProperty("attackPower"))
            object.attackPower = options.json && !isFinite(message.attackPower) ? String(message.attackPower) : message.attackPower;
        if (message.base != null && message.hasOwnProperty("base"))
            object.base = $root.Character.toObject(message.base, options);
        if (message.blessing != null && message.hasOwnProperty("blessing"))
            object.blessing = message.blessing;
        if (message.children && message.children.length) {
            object.children = [];
            for (var j = 0; j < message.children.length; ++j)
                object.children[j] = $root.Character.toObject(message.children[j], options);
        }
        if (message.conditions && message.conditions.length) {
            object.conditions = [];
            for (var j = 0; j < message.conditions.length; ++j)
                object.conditions[j] = $root.Condition.toObject(message.conditions[j], options);
        }
        if (message.currentDungeon != null && message.hasOwnProperty("currentDungeon"))
            object.currentDungeon = $root.CurrentDungeon.toObject(message.currentDungeon, options);
        if (message.equipment != null && message.hasOwnProperty("equipment"))
            object.equipment = $root.Equipment.toObject(message.equipment, options);
        if (message.gold != null && message.hasOwnProperty("gold"))
            object.gold = message.gold;
        if (message.health != null && message.hasOwnProperty("health"))
            object.health = options.json && !isFinite(message.health) ? String(message.health) : message.health;
        if (message.healthMax != null && message.hasOwnProperty("healthMax"))
            object.healthMax = options.json && !isFinite(message.healthMax) ? String(message.healthMax) : message.healthMax;
        if (message.inventory && message.inventory.length) {
            object.inventory = [];
            for (var j = 0; j < message.inventory.length; ++j)
                object.inventory[j] = $root.Item.toObject(message.inventory[j], options);
        }
        if (message.investments && message.investments.length) {
            object.investments = [];
            for (var j = 0; j < message.investments.length; ++j)
                object.investments[j] = $root.Investment.toObject(message.investments[j], options);
        }
        if (message.jobExperience && message.jobExperience.length) {
            object.jobExperience = [];
            for (var j = 0; j < message.jobExperience.length; ++j)
                object.jobExperience[j] = $root.JobExperience.toObject(message.jobExperience[j], options);
        }
        if (message.knownCharacters && message.knownCharacters.length) {
            object.knownCharacters = [];
            for (var j = 0; j < message.knownCharacters.length; ++j)
                object.knownCharacters[j] = $root.Character.toObject(message.knownCharacters[j], options);
        }
        if (message.knownSpells && message.knownSpells.length) {
            object.knownSpells = [];
            for (var j = 0; j < message.knownSpells.length; ++j)
                object.knownSpells[j] = message.knownSpells[j];
        }
        if (message.learningSpells && message.learningSpells.length) {
            object.learningSpells = [];
            for (var j = 0; j < message.learningSpells.length; ++j)
                object.learningSpells[j] = $root.LearningSpell.toObject(message.learningSpells[j], options);
        }
        if (message.magicProficiencies && message.magicProficiencies.length) {
            object.magicProficiencies = [];
            for (var j = 0; j < message.magicProficiencies.length; ++j)
                object.magicProficiencies[j] = $root.MagicProficiency.toObject(message.magicProficiencies[j], options);
        }
        if (message.mana != null && message.hasOwnProperty("mana"))
            object.mana = options.json && !isFinite(message.mana) ? String(message.mana) : message.mana;
        if (message.manaMax != null && message.hasOwnProperty("manaMax"))
            object.manaMax = options.json && !isFinite(message.manaMax) ? String(message.manaMax) : message.manaMax;
        if (message.manaRegen != null && message.hasOwnProperty("manaRegen"))
            object.manaRegen = options.json && !isFinite(message.manaRegen) ? String(message.manaRegen) : message.manaRegen;
        if (message.minions && message.minions.length) {
            object.minions = [];
            for (var j = 0; j < message.minions.length; ++j)
                object.minions[j] = $root.Minion.toObject(message.minions[j], options);
        }
        if (message.parents && message.parents.length) {
            object.parents = [];
            for (var j = 0; j < message.parents.length; ++j)
                object.parents[j] = $root.Character.toObject(message.parents[j], options);
        }
        if (message.partners && message.partners.length) {
            object.partners = [];
            for (var j = 0; j < message.partners.length; ++j)
                object.partners[j] = $root.Character.toObject(message.partners[j], options);
        }
        if (message.physicalAttacks && message.physicalAttacks.length) {
            object.physicalAttacks = [];
            for (var j = 0; j < message.physicalAttacks.length; ++j)
                object.physicalAttacks[j] = message.physicalAttacks[j];
        }
        if (message.playerClass != null && message.hasOwnProperty("playerClass"))
            object.playerClass = message.playerClass;
        if (message.qualificationProgress && message.qualificationProgress.length) {
            object.qualificationProgress = [];
            for (var j = 0; j < message.qualificationProgress.length; ++j)
                object.qualificationProgress[j] = $root.QualificationProgress.toObject(message.qualificationProgress[j], options);
        }
        if (message.sanity != null && message.hasOwnProperty("sanity"))
            object.sanity = options.json && !isFinite(message.sanity) ? String(message.sanity) : message.sanity;
        if (message.sanityMax != null && message.hasOwnProperty("sanityMax"))
            object.sanityMax = options.json && !isFinite(message.sanityMax) ? String(message.sanityMax) : message.sanityMax;
        if (message.savedEnemy != null && message.hasOwnProperty("savedEnemy"))
            object.savedEnemy = $root.Enemy.toObject(message.savedEnemy, options);
        if (message.unAllocatedSkillPoints != null && message.hasOwnProperty("unAllocatedSkillPoints"))
            object.unAllocatedSkillPoints = message.unAllocatedSkillPoints;
        return object;
    };

    /**
     * Converts this PlayerCharacter to JSON.
     * @function toJSON
     * @memberof PlayerCharacter
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    PlayerCharacter.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for PlayerCharacter
     * @function getTypeUrl
     * @memberof PlayerCharacter
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    PlayerCharacter.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/PlayerCharacter";
    };

    return PlayerCharacter;
})();

$root.QualificationProgress = (function() {

    /**
     * Properties of a QualificationProgress.
     * @exports IQualificationProgress
     * @interface IQualificationProgress
     * @property {boolean|null} [completed] QualificationProgress completed
     * @property {string|null} [name] QualificationProgress name
     * @property {number|null} [progress] QualificationProgress progress
     */

    /**
     * Constructs a new QualificationProgress.
     * @exports QualificationProgress
     * @classdesc Represents a QualificationProgress.
     * @implements IQualificationProgress
     * @constructor
     * @param {IQualificationProgress=} [properties] Properties to set
     */
    function QualificationProgress(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * QualificationProgress completed.
     * @member {boolean} completed
     * @memberof QualificationProgress
     * @instance
     */
    QualificationProgress.prototype.completed = false;

    /**
     * QualificationProgress name.
     * @member {string} name
     * @memberof QualificationProgress
     * @instance
     */
    QualificationProgress.prototype.name = "";

    /**
     * QualificationProgress progress.
     * @member {number} progress
     * @memberof QualificationProgress
     * @instance
     */
    QualificationProgress.prototype.progress = 0;

    /**
     * Creates a new QualificationProgress instance using the specified properties.
     * @function create
     * @memberof QualificationProgress
     * @static
     * @param {IQualificationProgress=} [properties] Properties to set
     * @returns {QualificationProgress} QualificationProgress instance
     */
    QualificationProgress.create = function create(properties) {
        return new QualificationProgress(properties);
    };

    /**
     * Encodes the specified QualificationProgress message. Does not implicitly {@link QualificationProgress.verify|verify} messages.
     * @function encode
     * @memberof QualificationProgress
     * @static
     * @param {IQualificationProgress} message QualificationProgress message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    QualificationProgress.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.completed != null && Object.hasOwnProperty.call(message, "completed"))
            writer.uint32(/* id 1, wireType 0 =*/8).bool(message.completed);
        if (message.name != null && Object.hasOwnProperty.call(message, "name"))
            writer.uint32(/* id 2, wireType 2 =*/18).string(message.name);
        if (message.progress != null && Object.hasOwnProperty.call(message, "progress"))
            writer.uint32(/* id 3, wireType 0 =*/24).int32(message.progress);
        return writer;
    };

    /**
     * Encodes the specified QualificationProgress message, length delimited. Does not implicitly {@link QualificationProgress.verify|verify} messages.
     * @function encodeDelimited
     * @memberof QualificationProgress
     * @static
     * @param {IQualificationProgress} message QualificationProgress message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    QualificationProgress.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a QualificationProgress message from the specified reader or buffer.
     * @function decode
     * @memberof QualificationProgress
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {QualificationProgress} QualificationProgress
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    QualificationProgress.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.QualificationProgress();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
            case 1: {
                    message.completed = reader.bool();
                    break;
                }
            case 2: {
                    message.name = reader.string();
                    break;
                }
            case 3: {
                    message.progress = reader.int32();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a QualificationProgress message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof QualificationProgress
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {QualificationProgress} QualificationProgress
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    QualificationProgress.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a QualificationProgress message.
     * @function verify
     * @memberof QualificationProgress
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    QualificationProgress.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.completed != null && message.hasOwnProperty("completed"))
            if (typeof message.completed !== "boolean")
                return "completed: boolean expected";
        if (message.name != null && message.hasOwnProperty("name"))
            if (!$util.isString(message.name))
                return "name: string expected";
        if (message.progress != null && message.hasOwnProperty("progress"))
            if (!$util.isInteger(message.progress))
                return "progress: integer expected";
        return null;
    };

    /**
     * Creates a QualificationProgress message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof QualificationProgress
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {QualificationProgress} QualificationProgress
     */
    QualificationProgress.fromObject = function fromObject(object) {
        if (object instanceof $root.QualificationProgress)
            return object;
        var message = new $root.QualificationProgress();
        if (object.completed != null)
            message.completed = Boolean(object.completed);
        if (object.name != null)
            message.name = String(object.name);
        if (object.progress != null)
            message.progress = object.progress | 0;
        return message;
    };

    /**
     * Creates a plain object from a QualificationProgress message. Also converts values to other types if specified.
     * @function toObject
     * @memberof QualificationProgress
     * @static
     * @param {QualificationProgress} message QualificationProgress
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    QualificationProgress.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults) {
            object.completed = false;
            object.name = "";
            object.progress = 0;
        }
        if (message.completed != null && message.hasOwnProperty("completed"))
            object.completed = message.completed;
        if (message.name != null && message.hasOwnProperty("name"))
            object.name = message.name;
        if (message.progress != null && message.hasOwnProperty("progress"))
            object.progress = message.progress;
        return object;
    };

    /**
     * Converts this QualificationProgress to JSON.
     * @function toJSON
     * @memberof QualificationProgress
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    QualificationProgress.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for QualificationProgress
     * @function getTypeUrl
     * @memberof QualificationProgress
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    QualificationProgress.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/QualificationProgress";
    };

    return QualificationProgress;
})();

$root.Shop = (function() {

    /**
     * Properties of a Shop.
     * @exports IShop
     * @interface IShop
     * @property {string|null} [archetype] Shop archetype
     * @property {number|null} [baseGold] Shop baseGold
     * @property {number|null} [currentGold] Shop currentGold
     * @property {Array.<IItem>|null} [inventory] Shop inventory
     * @property {string|null} [lastStockRefresh] Shop lastStockRefresh
     * @property {ICharacter|null} [shopKeeper] Shop shopKeeper
     */

    /**
     * Constructs a new Shop.
     * @exports Shop
     * @classdesc Represents a Shop.
     * @implements IShop
     * @constructor
     * @param {IShop=} [properties] Properties to set
     */
    function Shop(properties) {
        this.inventory = [];
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * Shop archetype.
     * @member {string} archetype
     * @memberof Shop
     * @instance
     */
    Shop.prototype.archetype = "";

    /**
     * Shop baseGold.
     * @member {number} baseGold
     * @memberof Shop
     * @instance
     */
    Shop.prototype.baseGold = 0;

    /**
     * Shop currentGold.
     * @member {number} currentGold
     * @memberof Shop
     * @instance
     */
    Shop.prototype.currentGold = 0;

    /**
     * Shop inventory.
     * @member {Array.<IItem>} inventory
     * @memberof Shop
     * @instance
     */
    Shop.prototype.inventory = $util.emptyArray;

    /**
     * Shop lastStockRefresh.
     * @member {string} lastStockRefresh
     * @memberof Shop
     * @instance
     */
    Shop.prototype.lastStockRefresh = "";

    /**
     * Shop shopKeeper.
     * @member {ICharacter|null|undefined} shopKeeper
     * @memberof Shop
     * @instance
     */
    Shop.prototype.shopKeeper = null;

    /**
     * Creates a new Shop instance using the specified properties.
     * @function create
     * @memberof Shop
     * @static
     * @param {IShop=} [properties] Properties to set
     * @returns {Shop} Shop instance
     */
    Shop.create = function create(properties) {
        return new Shop(properties);
    };

    /**
     * Encodes the specified Shop message. Does not implicitly {@link Shop.verify|verify} messages.
     * @function encode
     * @memberof Shop
     * @static
     * @param {IShop} message Shop message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Shop.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.archetype != null && Object.hasOwnProperty.call(message, "archetype"))
            writer.uint32(/* id 1, wireType 2 =*/10).string(message.archetype);
        if (message.baseGold != null && Object.hasOwnProperty.call(message, "baseGold"))
            writer.uint32(/* id 2, wireType 0 =*/16).int32(message.baseGold);
        if (message.currentGold != null && Object.hasOwnProperty.call(message, "currentGold"))
            writer.uint32(/* id 3, wireType 0 =*/24).int32(message.currentGold);
        if (message.inventory != null && message.inventory.length)
            for (var i = 0; i < message.inventory.length; ++i)
                $root.Item.encode(message.inventory[i], writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
        if (message.lastStockRefresh != null && Object.hasOwnProperty.call(message, "lastStockRefresh"))
            writer.uint32(/* id 5, wireType 2 =*/42).string(message.lastStockRefresh);
        if (message.shopKeeper != null && Object.hasOwnProperty.call(message, "shopKeeper"))
            $root.Character.encode(message.shopKeeper, writer.uint32(/* id 6, wireType 2 =*/50).fork()).ldelim();
        return writer;
    };

    /**
     * Encodes the specified Shop message, length delimited. Does not implicitly {@link Shop.verify|verify} messages.
     * @function encodeDelimited
     * @memberof Shop
     * @static
     * @param {IShop} message Shop message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Shop.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a Shop message from the specified reader or buffer.
     * @function decode
     * @memberof Shop
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {Shop} Shop
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Shop.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.Shop();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
            case 1: {
                    message.archetype = reader.string();
                    break;
                }
            case 2: {
                    message.baseGold = reader.int32();
                    break;
                }
            case 3: {
                    message.currentGold = reader.int32();
                    break;
                }
            case 4: {
                    if (!(message.inventory && message.inventory.length))
                        message.inventory = [];
                    message.inventory.push($root.Item.decode(reader, reader.uint32()));
                    break;
                }
            case 5: {
                    message.lastStockRefresh = reader.string();
                    break;
                }
            case 6: {
                    message.shopKeeper = $root.Character.decode(reader, reader.uint32());
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a Shop message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof Shop
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {Shop} Shop
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Shop.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a Shop message.
     * @function verify
     * @memberof Shop
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    Shop.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.archetype != null && message.hasOwnProperty("archetype"))
            if (!$util.isString(message.archetype))
                return "archetype: string expected";
        if (message.baseGold != null && message.hasOwnProperty("baseGold"))
            if (!$util.isInteger(message.baseGold))
                return "baseGold: integer expected";
        if (message.currentGold != null && message.hasOwnProperty("currentGold"))
            if (!$util.isInteger(message.currentGold))
                return "currentGold: integer expected";
        if (message.inventory != null && message.hasOwnProperty("inventory")) {
            if (!Array.isArray(message.inventory))
                return "inventory: array expected";
            for (var i = 0; i < message.inventory.length; ++i) {
                var error = $root.Item.verify(message.inventory[i]);
                if (error)
                    return "inventory." + error;
            }
        }
        if (message.lastStockRefresh != null && message.hasOwnProperty("lastStockRefresh"))
            if (!$util.isString(message.lastStockRefresh))
                return "lastStockRefresh: string expected";
        if (message.shopKeeper != null && message.hasOwnProperty("shopKeeper")) {
            var error = $root.Character.verify(message.shopKeeper);
            if (error)
                return "shopKeeper." + error;
        }
        return null;
    };

    /**
     * Creates a Shop message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof Shop
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {Shop} Shop
     */
    Shop.fromObject = function fromObject(object) {
        if (object instanceof $root.Shop)
            return object;
        var message = new $root.Shop();
        if (object.archetype != null)
            message.archetype = String(object.archetype);
        if (object.baseGold != null)
            message.baseGold = object.baseGold | 0;
        if (object.currentGold != null)
            message.currentGold = object.currentGold | 0;
        if (object.inventory) {
            if (!Array.isArray(object.inventory))
                throw TypeError(".Shop.inventory: array expected");
            message.inventory = [];
            for (var i = 0; i < object.inventory.length; ++i) {
                if (typeof object.inventory[i] !== "object")
                    throw TypeError(".Shop.inventory: object expected");
                message.inventory[i] = $root.Item.fromObject(object.inventory[i]);
            }
        }
        if (object.lastStockRefresh != null)
            message.lastStockRefresh = String(object.lastStockRefresh);
        if (object.shopKeeper != null) {
            if (typeof object.shopKeeper !== "object")
                throw TypeError(".Shop.shopKeeper: object expected");
            message.shopKeeper = $root.Character.fromObject(object.shopKeeper);
        }
        return message;
    };

    /**
     * Creates a plain object from a Shop message. Also converts values to other types if specified.
     * @function toObject
     * @memberof Shop
     * @static
     * @param {Shop} message Shop
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    Shop.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.arrays || options.defaults)
            object.inventory = [];
        if (options.defaults) {
            object.archetype = "";
            object.baseGold = 0;
            object.currentGold = 0;
            object.lastStockRefresh = "";
            object.shopKeeper = null;
        }
        if (message.archetype != null && message.hasOwnProperty("archetype"))
            object.archetype = message.archetype;
        if (message.baseGold != null && message.hasOwnProperty("baseGold"))
            object.baseGold = message.baseGold;
        if (message.currentGold != null && message.hasOwnProperty("currentGold"))
            object.currentGold = message.currentGold;
        if (message.inventory && message.inventory.length) {
            object.inventory = [];
            for (var j = 0; j < message.inventory.length; ++j)
                object.inventory[j] = $root.Item.toObject(message.inventory[j], options);
        }
        if (message.lastStockRefresh != null && message.hasOwnProperty("lastStockRefresh"))
            object.lastStockRefresh = message.lastStockRefresh;
        if (message.shopKeeper != null && message.hasOwnProperty("shopKeeper"))
            object.shopKeeper = $root.Character.toObject(message.shopKeeper, options);
        return object;
    };

    /**
     * Converts this Shop to JSON.
     * @function toJSON
     * @memberof Shop
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    Shop.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for Shop
     * @function getTypeUrl
     * @memberof Shop
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    Shop.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/Shop";
    };

    return Shop;
})();

$root.Tile = (function() {

    /**
     * Properties of a Tile.
     * @exports ITile
     * @interface ITile
     * @property {boolean|null} [clearedRoom] Tile clearedRoom
     * @property {boolean|null} [isBossRoom] Tile isBossRoom
     * @property {number|null} [x] Tile x
     * @property {number|null} [y] Tile y
     */

    /**
     * Constructs a new Tile.
     * @exports Tile
     * @classdesc Represents a Tile.
     * @implements ITile
     * @constructor
     * @param {ITile=} [properties] Properties to set
     */
    function Tile(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * Tile clearedRoom.
     * @member {boolean} clearedRoom
     * @memberof Tile
     * @instance
     */
    Tile.prototype.clearedRoom = false;

    /**
     * Tile isBossRoom.
     * @member {boolean} isBossRoom
     * @memberof Tile
     * @instance
     */
    Tile.prototype.isBossRoom = false;

    /**
     * Tile x.
     * @member {number} x
     * @memberof Tile
     * @instance
     */
    Tile.prototype.x = 0;

    /**
     * Tile y.
     * @member {number} y
     * @memberof Tile
     * @instance
     */
    Tile.prototype.y = 0;

    /**
     * Creates a new Tile instance using the specified properties.
     * @function create
     * @memberof Tile
     * @static
     * @param {ITile=} [properties] Properties to set
     * @returns {Tile} Tile instance
     */
    Tile.create = function create(properties) {
        return new Tile(properties);
    };

    /**
     * Encodes the specified Tile message. Does not implicitly {@link Tile.verify|verify} messages.
     * @function encode
     * @memberof Tile
     * @static
     * @param {ITile} message Tile message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Tile.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.clearedRoom != null && Object.hasOwnProperty.call(message, "clearedRoom"))
            writer.uint32(/* id 1, wireType 0 =*/8).bool(message.clearedRoom);
        if (message.isBossRoom != null && Object.hasOwnProperty.call(message, "isBossRoom"))
            writer.uint32(/* id 2, wireType 0 =*/16).bool(message.isBossRoom);
        if (message.x != null && Object.hasOwnProperty.call(message, "x"))
            writer.uint32(/* id 3, wireType 0 =*/24).int32(message.x);
        if (message.y != null && Object.hasOwnProperty.call(message, "y"))
            writer.uint32(/* id 4, wireType 0 =*/32).int32(message.y);
        return writer;
    };

    /**
     * Encodes the specified Tile message, length delimited. Does not implicitly {@link Tile.verify|verify} messages.
     * @function encodeDelimited
     * @memberof Tile
     * @static
     * @param {ITile} message Tile message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Tile.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a Tile message from the specified reader or buffer.
     * @function decode
     * @memberof Tile
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {Tile} Tile
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Tile.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.Tile();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
            case 1: {
                    message.clearedRoom = reader.bool();
                    break;
                }
            case 2: {
                    message.isBossRoom = reader.bool();
                    break;
                }
            case 3: {
                    message.x = reader.int32();
                    break;
                }
            case 4: {
                    message.y = reader.int32();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a Tile message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof Tile
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {Tile} Tile
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Tile.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a Tile message.
     * @function verify
     * @memberof Tile
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    Tile.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.clearedRoom != null && message.hasOwnProperty("clearedRoom"))
            if (typeof message.clearedRoom !== "boolean")
                return "clearedRoom: boolean expected";
        if (message.isBossRoom != null && message.hasOwnProperty("isBossRoom"))
            if (typeof message.isBossRoom !== "boolean")
                return "isBossRoom: boolean expected";
        if (message.x != null && message.hasOwnProperty("x"))
            if (!$util.isInteger(message.x))
                return "x: integer expected";
        if (message.y != null && message.hasOwnProperty("y"))
            if (!$util.isInteger(message.y))
                return "y: integer expected";
        return null;
    };

    /**
     * Creates a Tile message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof Tile
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {Tile} Tile
     */
    Tile.fromObject = function fromObject(object) {
        if (object instanceof $root.Tile)
            return object;
        var message = new $root.Tile();
        if (object.clearedRoom != null)
            message.clearedRoom = Boolean(object.clearedRoom);
        if (object.isBossRoom != null)
            message.isBossRoom = Boolean(object.isBossRoom);
        if (object.x != null)
            message.x = object.x | 0;
        if (object.y != null)
            message.y = object.y | 0;
        return message;
    };

    /**
     * Creates a plain object from a Tile message. Also converts values to other types if specified.
     * @function toObject
     * @memberof Tile
     * @static
     * @param {Tile} message Tile
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    Tile.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults) {
            object.clearedRoom = false;
            object.isBossRoom = false;
            object.x = 0;
            object.y = 0;
        }
        if (message.clearedRoom != null && message.hasOwnProperty("clearedRoom"))
            object.clearedRoom = message.clearedRoom;
        if (message.isBossRoom != null && message.hasOwnProperty("isBossRoom"))
            object.isBossRoom = message.isBossRoom;
        if (message.x != null && message.hasOwnProperty("x"))
            object.x = message.x;
        if (message.y != null && message.hasOwnProperty("y"))
            object.y = message.y;
        return object;
    };

    /**
     * Converts this Tile to JSON.
     * @function toJSON
     * @memberof Tile
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    Tile.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for Tile
     * @function getTypeUrl
     * @memberof Tile
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    Tile.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/Tile";
    };

    return Tile;
})();

module.exports = $root;
