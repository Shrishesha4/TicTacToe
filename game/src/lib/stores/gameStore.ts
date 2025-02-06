import { writable } from 'svelte/store';

type GameMode = 'pvp' | 'pvc';
type Difficulty = 'easy' | 'medium' | 'hard';

interface GameState {
    scores: {
        X: number;
        O: number;
        ties: number;
    };
    gameMode: GameMode;
    difficulty: Difficulty;
}

const initialState: GameState = {
    scores: {
        X: 0,
        O: 0,
        ties: 0
    },
    gameMode: 'pvc',
    difficulty: 'medium'
};

export const gameState = writable<GameState>(initialState);