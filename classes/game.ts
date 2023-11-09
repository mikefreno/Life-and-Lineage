import { PlayerCharacter } from "./character";

interface GameOptions {
  date?: Date;
  player: PlayerCharacter;
}

export class Game {
  private date: Date;
  private player: PlayerCharacter;

  constructor({ date, player }: GameOptions) {
    this.date = date ?? new Date();
    this.player = player;
  }

  public getGameDate(): Date {
    return this.date;
  }

  public getPlayer(): PlayerCharacter {
    return this.player;
  }

  static fromJSON(json: any): Game {
    const game = new Game({
      date: new Date(json.date),
      player: PlayerCharacter.fromJSON(json.player),
    });
    return game;
  }
}
