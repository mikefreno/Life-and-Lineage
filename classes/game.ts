import { PlayerCharacter } from "./character";
import { DungeonLevel } from "./dungeon";

interface GameOptions {
  date?: Date;
  player: PlayerCharacter;
  dungeon?: DungeonLevel[];
}

export class Game {
  private date: Date;
  private player: PlayerCharacter;
  private dungeon: DungeonLevel[];

  constructor({ date, player, dungeon }: GameOptions) {
    this.date = date ?? new Date();
    this.player = player;
    this.dungeon = dungeon ?? [
      new DungeonLevel({
        level: 1,
        step: 0,
        stepsBeforeBoss: 25,
        bossDefeated: false,
      }),
    ];
  }

  public getGameDate(): Date {
    return this.date;
  }

  public getPlayer(): PlayerCharacter {
    return this.player;
  }

  public getDungeon(): DungeonLevel[] {
    return this.dungeon;
  }

  static fromJSON(json: any): Game {
    let dungeonLevels: DungeonLevel[] | undefined = [];
    if (json.dungeon) {
      json.dungeon.forEach((dungeon: any) => {
        const dun = DungeonLevel.fromJSON(dungeon);
        dungeonLevels?.push(dun);
      });
    } else {
      dungeonLevels = undefined;
    }

    const game = new Game({
      date: new Date(json.date),
      player: PlayerCharacter.fromJSON(json.player),
      dungeon: dungeonLevels,
    });
    return game;
  }
}
