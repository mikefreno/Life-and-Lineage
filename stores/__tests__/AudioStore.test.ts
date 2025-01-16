import { AudioStore } from "../AudioStore";
import { Audio } from "expo-av";
import { RootStore } from "../RootStore";
import { storage } from "../../utility/functions/storage";

describe("AudioStore", () => {
  let audioStore: AudioStore;
  let mockRootStore: Partial<RootStore>;
  let mockSound: jest.Mocked<any>;

  beforeEach(() => {
    jest.useFakeTimers();
    // Prevent automatic loading in constructor
    jest
      .spyOn(AudioStore.prototype, "initializeAudio")
      .mockImplementation(() => Promise.resolve());

    mockSound = {
      playAsync: jest.fn().mockResolvedValue(undefined),
      stopAsync: jest.fn().mockResolvedValue(undefined),
      setVolumeAsync: jest.fn().mockResolvedValue(undefined),
      getStatusAsync: jest
        .fn()
        .mockResolvedValue({ isLoaded: true, volume: 1 }),
      replayAsync: jest.fn().mockResolvedValue(undefined),
    };

    (Audio.Sound.createAsync as jest.Mock).mockResolvedValue({
      sound: mockSound,
    });

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
  });

  it("should set mute value correctly", () => {
    audioStore.setMuteValue(true);
    expect(audioStore.muted).toBe(true);
    expect(storage.set).toHaveBeenCalled();
  });

  describe("Sound Effects", () => {
    it("should play a sound effect when loaded", async () => {
      await audioStore.loadAudioResources();
      await audioStore.playSfx("hit");
      expect(mockSound.setVolumeAsync).toHaveBeenCalled();
      expect(mockSound.replayAsync).toHaveBeenCalled();
    });

    it("should not play sound effects if not loaded", async () => {
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
      await audioStore.loadAudioResources();
      audioStore.playAmbient({ track: "young" });
      expect(mockSound.setVolumeAsync).toHaveBeenCalled();
      expect(mockSound.playAsync).toHaveBeenCalled();
    });
  });

  describe("Combat Music", () => {
    it("should not process queue if combat not loaded", () => {
      audioStore.playCombat({ track: "basic" });
      expect(mockSound.playAsync).not.toHaveBeenCalled();
    });

    it("should process combat music when loaded", async () => {
      await audioStore.loadAudioResources();
      audioStore.playCombat({ track: "basic" });
      expect(mockSound.setVolumeAsync).toHaveBeenCalled();
      expect(mockSound.playAsync).toHaveBeenCalled();
    });
  });

  describe("Audio Loading", () => {
    it("should load all audio resources", async () => {
      await audioStore.loadAudioResources();
      expect(audioStore.isSoundEffectsLoaded).toBe(true);
      expect(audioStore.isAmbientLoaded).toBe(true);
      expect(audioStore.isCombatLoaded).toBe(true);
    });

    it("should mark UI store as loaded when ambient is loaded", async () => {
      await audioStore.loadAudioResources();
      expect(mockRootStore.uiStore!.markStoreAsLoaded).toHaveBeenCalledWith(
        "ambient",
      );
    });
  });
});
