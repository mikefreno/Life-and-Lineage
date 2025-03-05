import { AudioStore } from "../AudioStore";
import { Audio } from "expo-av";
import { RootStore } from "../RootStore";
import { storage } from "../../utility/functions/storage";
import { InteractionManager, Platform } from "react-native";

// Mock the platform
jest.mock("react-native", () => ({
  Platform: {
    OS: "ios",
  },
  InteractionManager: {
    runAfterInteractions: jest.fn((callback) => callback()),
  },
}));

// Mock Device
jest.mock("expo-device", () => ({
  isDevice: true,
}));

describe("AudioStore", () => {
  let audioStore: AudioStore;
  let mockRootStore: Partial<RootStore>;
  let mockSound: jest.Mocked<any>;
  let mockAddDevAction: jest.Mock;

  beforeEach(() => {
    jest.useFakeTimers();
    // Prevent automatic loading in constructor
    jest
      .spyOn(AudioStore.prototype, "initializeAudio")
      .mockImplementation(() => Promise.resolve());

    mockSound = {
      playAsync: jest.fn().mockResolvedValue(undefined),
      stopAsync: jest.fn().mockResolvedValue(undefined),
      pauseAsync: jest.fn().mockResolvedValue(undefined),
      setVolumeAsync: jest.fn().mockResolvedValue(undefined),
      getStatusAsync: jest
        .fn()
        .mockResolvedValue({ isLoaded: true, volume: 1, isPlaying: true }),
      replayAsync: jest.fn().mockResolvedValue(undefined),
      unloadAsync: jest.fn().mockResolvedValue(undefined),
    };

    (Audio.Sound.createAsync as jest.Mock).mockResolvedValue({
      sound: mockSound,
    });

    (Audio.setAudioModeAsync as jest.Mock).mockResolvedValue(undefined);

    mockAddDevAction = jest.fn();

    mockRootStore = {
      dungeonStore: {
        isInDungeon: false,
        inCombat: false,
      },
      shopsStore: {
        inMarket: false,
      },
      playerState: {
        age: 25,
      },
      uiStore: {
        markStoreAsLoaded: jest.fn(),
      },
      addDevAction: mockAddDevAction,
    };

    audioStore = new AudioStore({ root: mockRootStore as RootStore });
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    audioStore.cleanup();
  });

  it("should initialize with default values", () => {
    expect(audioStore.masterVolume).toBe(1);
    expect(audioStore.ambientMusicVolume).toBe(1);
    expect(audioStore.soundEffectsVolume).toBe(1);
    expect(audioStore.combatMusicVolume).toBe(1);
    expect(audioStore.muted).toBe(false);
    expect(audioStore.audioOverride).toBe(true);
  });

  it("should load persisted settings if available", () => {
    const mockSettings = {
      master: 0.5,
      ambient: 0.7,
      sfx: 0.8,
      combat: 0.6,
      muted: true,
    };

    (storage.getString as jest.Mock).mockReturnValue(
      JSON.stringify(mockSettings),
    );

    const newAudioStore = new AudioStore({ root: mockRootStore as RootStore });

    expect(newAudioStore.masterVolume).toBe(0.5);
    expect(newAudioStore.ambientMusicVolume).toBe(0.7);
    expect(newAudioStore.soundEffectsVolume).toBe(0.8);
    expect(newAudioStore.combatMusicVolume).toBe(0.6);
    expect(newAudioStore.muted).toBe(true);
  });

  it("should set audio level correctly", () => {
    audioStore.setAudioLevel("master", 0.5);
    expect(audioStore.masterVolume).toBe(0.5);
    expect(storage.set).toHaveBeenCalled();

    audioStore.setAudioLevel("ambient", 0.6);
    expect(audioStore.ambientMusicVolume).toBe(0.6);

    audioStore.setAudioLevel("sfx", 0.7);
    expect(audioStore.soundEffectsVolume).toBe(0.7);

    audioStore.setAudioLevel("combat", 0.8);
    expect(audioStore.combatMusicVolume).toBe(0.8);
  });

  it("should not set audio level if value is out of range", () => {
    audioStore.setAudioLevel("master", 1.5);
    expect(audioStore.masterVolume).toBe(1);

    audioStore.setAudioLevel("ambient", -0.5);
    expect(audioStore.ambientMusicVolume).toBe(1);
  });

  it("should set mute value correctly", () => {
    audioStore.setMuteValue(true);
    expect(audioStore.muted).toBe(true);
    expect(storage.set).toHaveBeenCalled();
  });

  it("should register a dev action for toggling audio override", () => {
    expect(mockAddDevAction).toHaveBeenCalledWith({
      action: expect.any(Function),
      name: "Toggle Audio Override",
    });
  });

  it("should toggle audio override correctly", () => {
    const cleanupSpy = jest.spyOn(audioStore, "cleanup");
    const initSpy = jest
      .spyOn(audioStore, "initializeAudio")
      .mockResolvedValue();

    audioStore.toggleAudioOverride();
    expect(audioStore.audioOverride).toBe(false);
    expect(cleanupSpy).toHaveBeenCalled();

    audioStore.toggleAudioOverride();
    expect(audioStore.audioOverride).toBe(true);
    expect(initSpy).toHaveBeenCalled();
  });

  describe("Sound Effects", () => {
    it("should play a sound effect when loaded", async () => {
      audioStore.isSoundEffectsLoaded = true;
      await audioStore.playSfx("hit");
      expect(mockSound.setVolumeAsync).toHaveBeenCalled();
      expect(mockSound.replayAsync).toHaveBeenCalled();
    });

    it("should not play sound effects if not loaded", async () => {
      audioStore.isSoundEffectsLoaded = false;
      await audioStore.playSfx("hit");
      expect(mockSound.replayAsync).not.toHaveBeenCalled();
    });

    it("should not play sound effects if store is being destroyed", async () => {
      audioStore.isSoundEffectsLoaded = true;
      audioStore.prepareForDestroy();
      await audioStore.playSfx("hit");
      expect(mockSound.replayAsync).not.toHaveBeenCalled();
    });
  });

  describe("Ambient Music", () => {
    it("should not process queue if ambient not loaded", () => {
      audioStore.playAmbient({ track: "young" });
      expect(mockSound.playAsync).not.toHaveBeenCalled();
    });

    it("should process ambient music when loaded", async () => {
      audioStore.isAmbientLoaded = true;
      // Mock the map to return our mock sound
      const mapSpy = jest
        .spyOn(Map.prototype, "get")
        .mockReturnValue(mockSound);

      await audioStore.playAmbient({ track: "young" });
      expect(mockSound.setVolumeAsync).toHaveBeenCalled();
      expect(mockSound.playAsync).toHaveBeenCalled();

      mapSpy.mockRestore();
    });

    it("should not play ambient music if store is being destroyed", async () => {
      audioStore.isAmbientLoaded = true;
      audioStore.prepareForDestroy();
      await audioStore.playAmbient({ track: "young" });
      expect(mockSound.playAsync).not.toHaveBeenCalled();
    });

    it("should select the correct ambient track based on player context", async () => {
      audioStore.isAmbientLoaded = true;
      const mapSpy = jest
        .spyOn(Map.prototype, "get")
        .mockReturnValue(mockSound);

      // Test dungeon track
      mockRootStore.dungeonStore!.isInDungeon = true;
      await audioStore.playAmbient();
      expect(mapSpy).toHaveBeenCalledWith("dungeon");

      // Test market track
      mockRootStore.dungeonStore!.isInDungeon = false;
      mockRootStore.shopsStore!.inMarket = true;
      await audioStore.playAmbient();
      expect(mapSpy).toHaveBeenCalledWith("shops");

      // Test young age track
      mockRootStore.shopsStore!.inMarket = false;
      mockRootStore.playerState!.age = 25;
      await audioStore.playAmbient();
      expect(mapSpy).toHaveBeenCalledWith("young");

      // Test middle age track
      mockRootStore.playerState!.age = 45;
      await audioStore.playAmbient();
      expect(mapSpy).toHaveBeenCalledWith("middle");

      // Test old age track
      mockRootStore.playerState!.age = 70;
      await audioStore.playAmbient();
      expect(mapSpy).toHaveBeenCalledWith("old");

      mapSpy.mockRestore();
    });
  });

  describe("Combat Music", () => {
    it("should not process queue if combat not loaded", () => {
      audioStore.playCombat("basic");
      expect(mockSound.playAsync).not.toHaveBeenCalled();
    });

    it("should process combat music when loaded", async () => {
      audioStore.isCombatLoaded = true;
      // Mock the map to return our mock sound
      const mapSpy = jest
        .spyOn(Map.prototype, "get")
        .mockReturnValue(mockSound);

      await audioStore.playCombat("basic");
      expect(mockSound.setVolumeAsync).toHaveBeenCalled();
      expect(mockSound.playAsync).toHaveBeenCalled();

      mapSpy.mockRestore();
    });

    it("should not play combat music if store is being destroyed", async () => {
      audioStore.isCombatLoaded = true;
      audioStore.prepareForDestroy();
      await audioStore.playCombat("basic");
      expect(mockSound.playAsync).not.toHaveBeenCalled();
    });
  });

  describe("Audio Loading", () => {
    it("should load all audio resources", async () => {
      const loadSoundEffectsSpy = jest
        .spyOn(audioStore as any, "loadSoundEffects")
        .mockResolvedValue(undefined);
      const loadAmbientTracksSpy = jest
        .spyOn(audioStore as any, "loadAmbientTracks")
        .mockResolvedValue(undefined);
      const loadCombatTracksSpy = jest
        .spyOn(audioStore as any, "loadCombatTracks")
        .mockResolvedValue(undefined);

      await audioStore.loadAudioResources();

      expect(loadSoundEffectsSpy).toHaveBeenCalled();
      expect(loadAmbientTracksSpy).toHaveBeenCalled();
      expect(loadCombatTracksSpy).toHaveBeenCalled();
      expect(audioStore.isSoundEffectsLoaded).toBe(true);
      expect(audioStore.isAmbientLoaded).toBe(true);
      expect(audioStore.isCombatLoaded).toBe(true);
    });

    it("should mark UI store as loaded when ambient is loaded", async () => {
      const loadSoundEffectsSpy = jest
        .spyOn(audioStore as any, "loadSoundEffects")
        .mockResolvedValue(undefined);
      const loadAmbientTracksSpy = jest
        .spyOn(audioStore as any, "loadAmbientTracks")
        .mockResolvedValue(undefined);
      const loadCombatTracksSpy = jest
        .spyOn(audioStore as any, "loadCombatTracks")
        .mockResolvedValue(undefined);

      await audioStore.loadAudioResources();

      expect(mockRootStore.uiStore!.markStoreAsLoaded).toHaveBeenCalledWith(
        "ambient",
      );
    });

    it("should not load resources if store is being destroyed", async () => {
      const loadSoundEffectsSpy = jest
        .spyOn(audioStore as any, "loadSoundEffects")
        .mockResolvedValue(undefined);
      const loadAmbientTracksSpy = jest
        .spyOn(audioStore as any, "loadAmbientTracks")
        .mockResolvedValue(undefined);
      const loadCombatTracksSpy = jest
        .spyOn(audioStore as any, "loadCombatTracks")
        .mockResolvedValue(undefined);

      audioStore.prepareForDestroy();
      await audioStore.loadAudioResources();

      expect(loadSoundEffectsSpy).not.toHaveBeenCalled();
      expect(loadAmbientTracksSpy).not.toHaveBeenCalled();
      expect(loadCombatTracksSpy).not.toHaveBeenCalled();
    });
  });

  describe("Audio Context Reactions", () => {
    beforeEach(() => {
      audioStore.isAmbientLoaded = true;
      audioStore.isCombatLoaded = true;
      jest.spyOn(Map.prototype, "get").mockReturnValue(mockSound);
    });

    it("should play combat music when entering combat", () => {
      const playCombatSpy = jest.spyOn(audioStore, "playCombat");

      mockRootStore.dungeonStore!.inCombat = true;
      // Trigger reaction
      audioStore["parseLocationForRelevantTrack"]({
        inDungeon: false,
        inMarket: false,
        playerAge: 25,
        inCombat: true,
      });

      expect(playCombatSpy).toHaveBeenCalledWith("basic");
    });

    it("should play ambient music when exiting combat", () => {
      const playAmbientSpy = jest.spyOn(audioStore, "playAmbient");

      mockRootStore.dungeonStore!.inCombat = false;
      // Trigger reaction
      audioStore["parseLocationForRelevantTrack"](
        {
          inDungeon: false,
          inMarket: false,
          playerAge: 25,
          inCombat: false,
        },
        {
          inDungeon: false,
          inMarket: false,
          playerAge: 25,
          inCombat: true,
        },
      );

      expect(playAmbientSpy).toHaveBeenCalled();
    });

    it("should play appropriate ambient music when entering dungeon", () => {
      const playAmbientSpy = jest.spyOn(audioStore, "playAmbient");

      mockRootStore.dungeonStore!.isInDungeon = true;
      // Trigger reaction
      audioStore["parseLocationForRelevantTrack"](
        {
          inDungeon: true,
          inMarket: false,
          playerAge: 25,
          inCombat: false,
        },
        {
          inDungeon: false,
          inMarket: false,
          playerAge: 25,
          inCombat: false,
        },
      );

      expect(playAmbientSpy).toHaveBeenCalled();
    });

    it("should play appropriate ambient music when entering market", () => {
      const playAmbientSpy = jest.spyOn(audioStore, "playAmbient");

      mockRootStore.shopsStore!.inMarket = true;
      // Trigger reaction
      audioStore["parseLocationForRelevantTrack"](
        {
          inDungeon: false,
          inMarket: true,
          playerAge: 25,
          inCombat: false,
        },
        {
          inDungeon: false,
          inMarket: false,
          playerAge: 25,
          inCombat: false,
        },
      );

      expect(playAmbientSpy).toHaveBeenCalled();
    });

    it("should play appropriate ambient music when player age changes", () => {
      const playAmbientSpy = jest.spyOn(audioStore, "playAmbient");

      mockRootStore.playerState!.age = 65;
      // Trigger reaction
      audioStore["parseLocationForRelevantTrack"](
        {
          inDungeon: false,
          inMarket: false,
          playerAge: 65,
          inCombat: false,
        },
        {
          inDungeon: false,
          inMarket: false,
          playerAge: 25,
          inCombat: false,
        },
      );

      expect(playAmbientSpy).toHaveBeenCalled();
    });
  });

  describe("Volume Management", () => {
    it("should calculate effective volume correctly", () => {
      // Test with default values
      expect(audioStore["getEffectiveVolume"]("ambientMusic")).toBe(0.7); // GLOBAL_VOLUME_MULTIPLIER is 0.7

      // Test with custom values
      audioStore.masterVolume = 0.5;
      audioStore.ambientMusicVolume = 0.8;
      expect(audioStore["getEffectiveVolume"]("ambientMusic")).toBe(
        0.5 * 0.8 * 0.7,
      );

      // Test with muted
      audioStore.muted = true;
      expect(audioStore["getEffectiveVolume"]("ambientMusic")).toBe(0);
    });

    it("should update all volumes when settings change", async () => {
      audioStore.isAmbientLoaded = true;
      audioStore.isSoundEffectsLoaded = true;

      // Setup current track
      audioStore.currentTrack = {
        name: "young",
        sound: mockSound,
        category: "ambientMusic",
      };

      // Mock sound effects map
      const sfxMap = new Map();
      sfxMap.set("hit", mockSound);
      audioStore["soundEffects"] = sfxMap;

      await audioStore.setAudioLevel("master", 0.5);

      expect(mockSound.setVolumeAsync).toHaveBeenCalled();
    });
  });

  describe("Cleanup and Error Handling", () => {
    it("should clean up all audio resources on cleanup", () => {
      // Setup current track
      audioStore.currentTrack = {
        name: "young",
        sound: mockSound,
        category: "ambientMusic",
      };

      // Mock sound maps
      const ambientMap = new Map();
      ambientMap.set("young", mockSound);
      audioStore["ambientPlayers"] = ambientMap;

      const combatMap = new Map();
      combatMap.set("basic", mockSound);
      audioStore["combatPlayers"] = combatMap;

      const sfxMap = new Map();
      sfxMap.set("hit", mockSound);
      audioStore["soundEffects"] = sfxMap;

      audioStore.cleanup();

      expect(mockSound.stopAsync).toHaveBeenCalled();
      expect(mockSound.unloadAsync).toHaveBeenCalled();
      expect(audioStore.currentTrack).toBeNull();
    });

    it("should prepare for destroy correctly", () => {
      const cleanupSpy = jest.spyOn(audioStore, "cleanup");

      audioStore.prepareForDestroy();

      expect(audioStore["isDestroying"]).toBe(true);
      expect(cleanupSpy).toHaveBeenCalled();
    });

    it("should recover from errors", async () => {
      const cleanupSpy = jest.spyOn(audioStore, "cleanup");
      const initSpy = jest
        .spyOn(audioStore, "initializeAudio")
        .mockResolvedValue();

      await audioStore["recoverFromError"]();

      expect(cleanupSpy).toHaveBeenCalled();
      expect(initSpy).toHaveBeenCalled();
    });

    it("should handle timeout in audio operations", async () => {
      const cleanupSpy = jest.spyOn(audioStore, "cleanup");

      // Create a promise that never resolves
      const hangingPromise = new Promise(() => {});

      await audioStore["withTimeout"](hangingPromise, 100, "test_operation");

      jest.advanceTimersByTime(200);

      expect(cleanupSpy).toHaveBeenCalled();
    });
  });

  describe("Platform-specific behavior", () => {
    it("should use InteractionManager on Android", async () => {
      // Mock Platform.OS as Android
      Platform.OS = "android";

      const operation = jest.fn().mockResolvedValue("result");

      await audioStore["initializeAudio"]();

      expect(InteractionManager.runAfterInteractions).toHaveBeenCalled();
    });
  });

  describe("Track Counting", () => {
    it("should count playing tracks correctly", async () => {
      // Mock ambient players map
      const ambientMap = new Map();
      ambientMap.set("young", mockSound);
      audioStore["ambientPlayers"] = ambientMap;

      // Mock combat players map
      const combatMap = new Map();
      combatMap.set("basic", mockSound);
      audioStore["combatPlayers"] = combatMap;

      const result = await audioStore.getPlayingTracksCount();

      expect(result).toEqual({ ambientCount: 1, combatCount: 1 });
    });

    it("should return zero counts when destroying", async () => {
      audioStore.prepareForDestroy();

      const result = await audioStore.getPlayingTracksCount();

      expect(result).toEqual({ ambientCount: 0, combatCount: 0 });
    });
  });

  describe("Sound Fading", () => {
    it("should fade in sound correctly", async () => {
      const sound = mockSound;

      await audioStore["fadeSound"]({
        sound,
        soundCategory: "ambientMusic",
        soundName: "young",
        duration: 100,
        startVolume: 0,
        directionality: "in",
      });

      expect(sound.setVolumeAsync).toHaveBeenCalled();
      expect(sound.playAsync).toHaveBeenCalled();

      // Advance timers to complete fade
      jest.advanceTimersByTime(200);
    });

    it("should fade out sound correctly", async () => {
      const sound = mockSound;

      await audioStore["fadeSound"]({
        sound,
        soundCategory: "ambientMusic",
        soundName: "young",
        duration: 100,
        startVolume: 0.7,
        directionality: "out",
      });

      expect(sound.setVolumeAsync).toHaveBeenCalled();

      // Advance timers to complete fade
      jest.advanceTimersByTime(200);

      expect(sound.pauseAsync).toHaveBeenCalled();
    });

    it("should handle interruption during fade", async () => {
      const sound = mockSound;

      // Start a fade in
      const fadePromise = audioStore["fadeSound"]({
        sound,
        soundCategory: "ambientMusic",
        soundName: "young",
        duration: 500,
        startVolume: 0,
        directionality: "in",
      });

      // Advance timers partially
      jest.advanceTimersByTime(100);

      // Interrupt the fade by triggering the cancel function
      if (audioStore["activeTransition"].trackIn) {
        await audioStore["activeTransition"].trackIn.cancel();
      }

      // Ensure the fade was interrupted
      expect(sound.setVolumeAsync).toHaveBeenCalledWith(0);
      expect(sound.pauseAsync).toHaveBeenCalled();

      // Complete the promise
      await fadePromise;
    });
  });
});
