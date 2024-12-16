import { searchCodex, codexData, CodexEntry } from "../codex";

describe("searchCodex", () => {
  it("should return matching entries based on title", () => {
    const results = searchCodex("mage");
    expect(results).toContainEqual(
      expect.objectContaining({ title: "Mage Class" }),
    );
  });

  it("should return matching entries based on content", () => {
    const results = searchCodex("elemental magic");
    expect(results).toContainEqual(
      expect.objectContaining({ title: "Mage Class" }),
    );
  });

  it("should return matching entries based on tags", () => {
    const results = searchCodex("wizard");
    expect(results).toContainEqual(
      expect.objectContaining({ title: "Mage Class" }),
    );
  });

  it("should rank results with title matches higher", () => {
    const results = searchCodex("player");
    expect(results[0].title).toBe("Player Classes Overview");
  });

  it("should include subcategory in scoring calculation", () => {
    // Search for a term that will match entries with and without subcategories
    const results = searchCodex("class");

    // Get the scores by checking positions of known entries
    const entryWithSub = results.find(
      (entry) => entry.subcategory === "Classes",
    );
    const entryWithoutSub = results.find(
      (entry) => entry.title === "Player Classes Overview",
    );

    // Verify we found both types of entries
    expect(entryWithSub).toBeDefined();
    expect(entryWithoutSub).toBeDefined();

    // Verify the subcategory field is being used in scoring
    const scoreWithSub = results.indexOf(entryWithSub!);
    const scoreWithoutSub = results.indexOf(entryWithoutSub!);

    // Both should be present in results
    expect(scoreWithSub).not.toBe(-1);
    expect(scoreWithoutSub).not.toBe(-1);

    expect(scoreWithSub).toBeGreaterThan(scoreWithoutSub);
  });
  it("should consider various factors in ranking score", () => {
    const results = searchCodex("class");

    // Check if we have at least two results to compare
    expect(results.length).toBeGreaterThan(1);

    // Compare the first two results
    const firstResult = results[0];
    const secondResult = results[1];

    // Calculate a rough score based on the searchCodex function logic
    const calculateRoughScore = (entry: CodexEntry) => {
      let score = 0;
      if (entry.title.toLowerCase().includes("class")) score += 3;
      if (entry.title.toLowerCase().startsWith("class")) score += 5;
      if (entry.content.toLowerCase().includes("class")) score += 1;
      score +=
        entry.tags.filter((tag) => tag.toLowerCase().includes("class")).length *
        2;
      if (entry.subcategory) score += 2;
      return score;
    };

    const firstScore = calculateRoughScore(firstResult);
    const secondScore = calculateRoughScore(secondResult);

    // The first result should have a higher or equal score to the second
    expect(firstScore).toBeGreaterThanOrEqual(secondScore);
  });

  it("should return an empty array for no matches", () => {
    const results = searchCodex("nonexistent");
    expect(results).toEqual([]);
  });

  it("should be case insensitive", () => {
    const lowerResults = searchCodex("mage");
    const upperResults = searchCodex("MAGE");
    expect(lowerResults).toEqual(upperResults);
  });
});

describe("codexData", () => {
  it("should contain valid CodexEntry objects", () => {
    const isValidCodexEntry = (entry: CodexEntry): boolean => {
      return (
        typeof entry.id === "string" &&
        typeof entry.title === "string" &&
        typeof entry.category === "string" &&
        (entry.subcategory === undefined ||
          typeof entry.subcategory === "string") &&
        typeof entry.content === "string" &&
        Array.isArray(entry.tags) &&
        entry.tags.every((tag) => typeof tag === "string") &&
        typeof entry.route === "string"
      );
    };

    expect(codexData.every(isValidCodexEntry)).toBe(true);
  });
});
