
export enum GameState {
  Waiting,
  Loading,
  Ready,
  Typing,
  Finished,
}

export type GroundingChunk = {
  web: {
    uri: string;
    title: string;
  };
};

export interface TestStats {
  wpm: number;
  accuracy: number;
  time: number;
}
