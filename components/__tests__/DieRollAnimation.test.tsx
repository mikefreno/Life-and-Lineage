import { render, act } from "@testing-library/react-native";
import { RootStore } from "../../stores/RootStore";
import { AppProvider } from "../../providers/AppData";
import D20DieAnimation from "../DieRollAnim";

// Create a mock store

jest.mock("../../stores/rootStore", () => {
  return {
    RootStore: jest.fn().mockImplementation(() => ({
      initializeDatabase: jest.fn().mockResolvedValue(undefined),
      uiStore: {
        reduceMotion: false,
      },
      // Add any other store properties/methods your component uses
    })),
  };
});

const mockStore = new RootStore();
// Wrap the component with necessary providers
const TestWrapper = ({ children }) => (
  <AppProvider value={mockStore}>{children}</AppProvider>
);

describe("D20DieAnimation Stress Test", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  it("should handle rapid mounting/unmounting without errors", async () => {
    const iterations = 100; // Reduced for initial testing
    const mockConsoleError = jest.spyOn(console, "error");

    for (let i = 0; i < iterations; i++) {
      const { unmount } = render(
        <TestWrapper>
          <D20DieAnimation keepRolling={true} slowRoll={i % 2 === 0} />
        </TestWrapper>,
      );

      act(() => {
        jest.advanceTimersByTime(100);
      });

      unmount();
    }

    expect(mockConsoleError).not.toHaveBeenCalled();
    mockConsoleError.mockRestore();
  });

  it("should handle rapid prop changes without errors", async () => {
    const iterations = 100; // Reduced for initial testing
    const { rerender } = render(
      <TestWrapper>
        <D20DieAnimation keepRolling={false} />
      </TestWrapper>,
    );

    for (let i = 0; i < iterations; i++) {
      rerender(
        <TestWrapper>
          <D20DieAnimation
            keepRolling={i % 2 === 0}
            slowRoll={i % 3 === 0}
            showNumber={i % 4 === 0}
          />
        </TestWrapper>,
      );

      act(() => {
        jest.advanceTimersByTime(100);
      });
    }
  });
});
