import mageSpells from "@/assets/json/mageSpells.json";
import mageBooks from "@/assets/json/items/mageBooks.json";
import rangerSpells from "@/assets/json/rangerSpells.json";
import rangerBooks from "@/assets/json/items/rangerBooks.json";
import paladinSpells from "@/assets/json/paladinSpells.json";
import paladinBooks from "@/assets/json/items/paladinBooks.json";
import necroSpells from "@/assets/json/necroSpells.json";
import necroBooks from "@/assets/json/items/necroBooks.json";
import fs from "fs";

const checkSpellBooks = () => {
  // Clear the missing_spells.json file at start
  fs.writeFileSync("./spell_data/missing_spells.txt", "", "utf8");

  const missingSpellsMap = {
    mage: [],
    ranger: [],
    paladin: [],
    necromancer: [],
  };

  // Check mage books
  for (const book of mageBooks) {
    if (book.teaches) {
      const found = mageSpells.find((spell) => spell.name === book.teaches);
      if (!found) {
        missingSpellsMap.mage.push(book.teaches);

        fs.appendFile(
          "./spell_data/missing_spells.txt",
          `Mage book "${book.name}" teaches non-existent spell: "${book.teaches}"\n`,
          "utf8",
          (err) => {
            if (err) {
              console.error("Error writing to file", err);
            }
          },
        );
      }
    }
  }

  // Check ranger books
  for (const book of rangerBooks) {
    if (book.teaches) {
      const found = rangerSpells.find((spell) => spell.name === book.teaches);
      if (!found) {
        missingSpellsMap.ranger.push(book.teaches);

        fs.appendFile(
          "./spell_data/missing_spells.txt",
          `Ranger book "${book.name}" teaches non-existent spell: "${book.teaches}"\n`,
          "utf8",
          (err) => {
            if (err) {
              console.error("Error writing to file", err);
            }
          },
        );
      }
    }
  }

  // Check paladin books
  for (const book of paladinBooks) {
    if (book.teaches) {
      const found = paladinSpells.find((spell) => spell.name === book.teaches);
      if (!found) {
        missingSpellsMap.paladin.push(book.teaches);

        fs.appendFile(
          "./spell_data/missing_spells.txt",
          `Paladin book "${book.name}" teaches non-existent spell: "${book.teaches}"\n`,
          "utf8",
          (err) => {
            if (err) {
              console.error("Error writing to file", err);
            }
          },
        );
      }
    }
  }

  // Check necromancer books
  for (const book of necroBooks) {
    if (book.teaches) {
      const found = necroSpells.find((spell) => spell.name === book.teaches);
      if (!found) {
        missingSpellsMap.necromancer.push(book.teaches);

        fs.appendFile(
          "./spell_data/missing_spells.txt",
          `Necromancer book "${book.name}" teaches non-existent spell: "${book.teaches}"\n`,
          "utf8",
          (err) => {
            if (err) {
              console.error("Error writing to file", err);
            }
          },
        );
      }
    }
  }

  // Now check the reverse - spells that don't have books
  const spellsWithoutBooks = {
    mage: [],
    ranger: [],
    paladin: [],
    necromancer: [],
  };

  // Check mage spells
  for (const spell of mageSpells) {
    const found = mageBooks.find((book) => book.teaches === spell.name);
    if (!found) {
      spellsWithoutBooks.mage.push(spell.name);
    }
  }

  // Check ranger spells
  for (const spell of rangerSpells) {
    const found = rangerBooks.find((book) => book.teaches === spell.name);
    if (!found) {
      spellsWithoutBooks.ranger.push(spell.name);
    }
  }

  // Check paladin spells
  for (const spell of paladinSpells) {
    const found = paladinBooks.find((book) => book.teaches === spell.name);
    if (!found) {
      spellsWithoutBooks.paladin.push(spell.name);
    }
  }

  // Check necromancer spells
  for (const spell of necroSpells) {
    const found = necroBooks.find((book) => book.teaches === spell.name);
    if (!found) {
      spellsWithoutBooks.necromancer.push(spell.name);
    }
  }

  // Write summary to file
  fs.writeFile(
    "./spell_data/missing_spells_summary.json",
    JSON.stringify(
      {
        missingSpells: missingSpellsMap,
        spellsWithoutBooks: spellsWithoutBooks,
      },
      null,
      2,
    ),
    "utf8",
    (err) => {
      if (err) {
        console.error("Error writing missing spells summary file", err);
      } else {
        console.log("Missing spells summary file successfully written");
      }
    },
  );
};

checkSpellBooks();
