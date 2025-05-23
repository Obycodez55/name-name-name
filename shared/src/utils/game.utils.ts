import { GAME_CONSTANTS } from "../constants/game.constants";
import { GamePhase } from "../types/game.types";

export function generateRoomCode(length: number = GAME_CONSTANTS.ROOM_CODE_LENGTH): string {
  const chars = GAME_CONSTANTS.ROOM_CODE_CHARS;
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function getRandomLetter(excludeLetters: Readonly<string[]> = GAME_CONSTANTS.EXCLUDED_LETTERS): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const availableLetters = alphabet.split('').filter(letter => 
    !excludeLetters.includes(letter)
  );
  return availableLetters[Math.floor(Math.random() * availableLetters.length)];
}

export function calculateGameDuration(startTime: Date, endTime: Date): number {
  return Math.floor((endTime.getTime() - startTime.getTime()) / 1000); // seconds
}

export function isGamePhaseTransitionValid(from: GamePhase, to: GamePhase): boolean {
  const validTransitions: Record<GamePhase, GamePhase[]> = {
    [GamePhase.WAITING]: [GamePhase.LETTER_SELECTION, GamePhase.GAME_ENDED],
    [GamePhase.LETTER_SELECTION]: [GamePhase.PLAYING, GamePhase.GAME_ENDED],
    [GamePhase.PLAYING]: [GamePhase.VALIDATION, GamePhase.GAME_ENDED],
    [GamePhase.VALIDATION]: [GamePhase.SCORING, GamePhase.GAME_ENDED],
    [GamePhase.SCORING]: [GamePhase.ROUND_RESULTS, GamePhase.GAME_ENDED],
    [GamePhase.ROUND_RESULTS]: [GamePhase.LETTER_SELECTION, GamePhase.GAME_ENDED],
    [GamePhase.GAME_ENDED]: [],
  };
  
  return validTransitions[from]?.includes(to) ?? false;
}
