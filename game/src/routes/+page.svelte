<script lang="ts">
  import { onMount } from 'svelte';
  import { gameState } from '$lib/stores/gameStore';
  import { fade, scale, blur } from 'svelte/transition';
  
  let board: string[] = Array(9).fill('');
  let currentPlayer: 'X' | 'O' = 'X';
  let winner: string | null = null;
  let gameOver = false;
  let moveSound: HTMLAudioElement;
  let winSound: HTMLAudioElement;
  let isAnimating = false;
  let showAnnouncement = false;


  let gameTitle = "Tic Tac Toe";
  let celebrationSound: HTMLAudioElement;
  let winningCells: number[] = [];
  let titleClass = "";
  
  onMount(() => {
    moveSound = new Audio('/sounds/move.mp3');
    celebrationSound = new Audio('/sounds/celebration.mp3');
    winSound = new Audio('/sounds/win.mp3');
    titleClass = "animate-bounce";
    setTimeout(() => titleClass = "", 1000);

    // Updated Buy Me a Coffee Script
    const script = document.createElement('script');
    script.src = "https://cdnjs.buymeacoffee.com/1.0.0/button.prod.min.js";
    script.setAttribute('data-name', 'bmc-button');
    script.setAttribute('data-slug', 'shrishesha4');
    script.setAttribute('data-color', '#FF5F5F');
    script.setAttribute('data-emoji', '');
    script.setAttribute('data-font', 'Lato');
    script.setAttribute('data-text', 'Buy me a coffee');
    script.setAttribute('data-outline-color', '#000000');
    script.setAttribute('data-font-color', '#ffffff');
    script.setAttribute('data-coffee-color', '#FFDD00');
    document.body.appendChild(script);

    // Create the button container
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'fixed top-4 right-4 z-50';
    buttonContainer.id = 'bmc-container';
    document.body.appendChild(buttonContainer);
  });

  function minimax(board: string[], depth: number, isMaximizing: boolean): number {
    const winner = checkWinner(board);
    if (winner === 'O') return 10;
    if (winner === 'X') return -10;
    if (board.every(cell => cell !== '') || depth === 0) return 0;

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < board.length; i++) {
        if (board[i] === '') {
          const tempBoard = [...board];
          tempBoard[i] = 'O';
          const score = minimax(tempBoard, depth - 1, false);
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < board.length; i++) {
        if (board[i] === '') {
          const tempBoard = [...board];
          tempBoard[i] = 'X';
          const score = minimax(tempBoard, depth - 1, true);
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  }


  async function handleMove(index: number) {
    if (board[index] === '' && !gameOver && !isAnimating) {
      isAnimating = true;
      try {
        await moveSound?.play();
      } catch (error) {
        console.warn('Sound playback failed:', error);
      }

      board[index] = currentPlayer;
      board = [...board];

      const result = checkWinner(board);
      if (result) {
        winner = result;
        gameOver = true;
        try {
          await winSound?.play();
          await celebrationSound?.play();
        } catch (error) {
          console.warn('Sound playback failed:', error);
        }
        updateScores(result);
        showAnnouncement = true;
        setTimeout(() => {
          showAnnouncement = false;
        }, 2000);
      } else if (board.every(cell => cell !== '')) {
        gameOver = true;
        winner = 'tie';
        updateScores('tie');
        showAnnouncement = true;
        setTimeout(() => {
          showAnnouncement = false;
        }, 2000);
      } else {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        if ($gameState.gameMode === 'pvc' && currentPlayer === 'O') {
          setTimeout(async () => {
            await computerMove();
          }, 500);
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 300));
      isAnimating = false;
    }
  }

  async function computerMove() {
    if (gameOver || isAnimating) return;

    const difficulty = $gameState.difficulty;
    let move: number;

    const availableMoves = board.reduce((moves, cell, index) => {
      if (cell === '') moves.push(index);
      return moves;
    }, [] as number[]);

    if (difficulty === 'easy' || availableMoves.length === 9) {
      move = availableMoves[Math.floor(Math.random() * availableMoves.length)];
    } else {
      let bestScore = -Infinity;
      move = availableMoves[0];

      for (const possibleMove of availableMoves) {
        const tempBoard = [...board];
        tempBoard[possibleMove] = 'O';
        const score = minimax(tempBoard, difficulty === 'hard' ? 5 : 3, false);
        if (score > bestScore) {
          bestScore = score;
          move = possibleMove;
        }
      }
    }

    await handleMove(move);
  }

  function updateScores(result: string) {
    gameState.update(state => {
      if (result === 'tie') {
        state.scores.ties++;
      } else {
        state.scores[result as 'X' | 'O']++;
      }
      return state;
    });
  }

  function checkWinner(board: string[]): string | null {
  const winningCombos = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6] // diagonals
  ];

  for (const combo of winningCombos) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      winningCells = combo;  // Store winning combination
      return board[a];
    }
  }
  return null;
}
  
  function resetGame() {
    board = Array(9).fill('');
    currentPlayer = 'X';
    winner = null;
    gameOver = false;
    isAnimating = false;
  }
</script>

<!-- svelte-ignore element_invalid_self_closing_tag -->
<!-- svelte-ignore a11y_consider_explicit_label -->
<div class="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 text-white py-4 sm:py-8 flex items-center">
  <div class="fixed top-2 left-2 sm:top-4 sm:left-4 z-50 flex gap-4 p-4">
    <a href="https://github.com/shrishesha4" target="_blank" rel="noopener noreferrer" class="text-white hover:text-yellow-400 transition-colors">
      <i class="fab fa-github text-2xl sm:text-3xl"></i>
    </a>
    <a href="https://linkedin.com/in/shrishesha" target="_blank" rel="noopener noreferrer" class="text-white hover:text-blue-400 transition-colors">
      <i class="fab fa-linkedin text-2xl sm:text-3xl"></i>
    </a>
    <a href="https://twitter.com/shrishesha4" target="_blank" rel="noopener noreferrer" class="text-white hover:text-sky-400 transition-colors">
      <i class="fab fa-twitter text-2xl sm:text-3xl"></i>
    </a>
    <a href="https://instagram.com/shrishesha4" target="_blank" rel="noopener noreferrer" class="text-white hover:text-sky-400 transition-colors">
      <i class="fab fa-instagram text-2xl sm:text-3xl"></i>
    </a>
  </div>
  
  <div class="container mx-auto px-2 sm:px-4 max-w-2xl">
    <h1 class="text-4xl sm:text-6xl font-bold text-center mb-4 sm:mb-8 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-pink-500 {titleClass}">
      {gameTitle}
    </h1>

    <div class="bg-white/10 backdrop-blur-md rounded-xl p-4 sm:p-8 shadow-2xl">
      <div class="mb-4 sm:mb-8 flex flex-col sm:flex-row justify-center gap-2 sm:gap-4">
        <select
          bind:value={$gameState.gameMode}
          class="bg-white/20 text-white rounded-lg border-2 border-white/30 p-2 focus:outline-none focus:border-white/50 text-sm sm:text-base"
        >
          <option value="pvp">👥 Player vs Player</option>
          <option value="pvc">🤖 Player vs Computer</option>
        </select>

        {#if $gameState.gameMode === 'pvc'}
          <select
            bind:value={$gameState.difficulty}
            class="bg-white/20 text-white rounded-lg border-2 border-white/30 p-2 focus:outline-none focus:border-white/50 text-sm sm:text-base"
          >
            <option value="easy">😊 Easy</option>
            <option value="medium">😐 Medium</option>
            <option value="hard">😈 Hard</option>
          </select>
        {/if}
      </div>

      <div class="mb-4 sm:mb-8 flex justify-center gap-4 sm:gap-12 text-base sm:text-xl">
        <div class="bg-blue-500/30 px-6 py-3 rounded-lg">
          <span class="text-blue-300">X:</span> {$gameState.scores.X}
        </div>
        <div class="bg-red-500/30 px-6 py-3 rounded-lg">
          <span class="text-red-300">O:</span> {$gameState.scores.O}
        </div>
        <div class="bg-gray-500/30 px-6 py-3 rounded-lg">
          <span class="text-gray-300">Ties:</span> {$gameState.scores.ties}
        </div>
      </div>

      <div class="grid grid-cols-3 gap-2 sm:gap-3 max-w-[300px] sm:max-w-[350px] mx-auto mb-4 sm:mb-8">
        {#each board as cell, index}
          <button
            class="h-20 sm:h-28 bg-white/5 hover:bg-white/10 text-3xl sm:text-5xl font-bold flex items-center justify-center border-2 border-white/20 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 
                {winningCells.includes(index) && winner && winner !== 'tie' ? 'animate-bounce bg-yellow-500/30 border-yellow-400' : ''}"
              on:click={() => handleMove(index)}
              disabled={cell !== '' || gameOver || (currentPlayer === 'O' && $gameState.gameMode === 'pvc')}
            >
              {#if cell}
                <span 
                  in:scale={{ duration: 300 }}
                  class={cell === 'X' ? 'text-blue-400' : 'text-red-400'}
                  class:animate-spin={winningCells.includes(index) && winner && winner !== 'tie'}
                >
                  {cell}
                </span>
              {/if}
            </button>
        {/each}
      </div>

      <div class="text-center">
        {#if winner}
          <p class="text-2xl mb-4 font-bold animate-bounce">
            {#if winner === 'tie'}
              <span class="text-gray-300">🤝 It's a tie!</span>
            {:else}
              <span class="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 animate-pulse">
                🎉 Player {winner} wins! 🎊
              </span>
            {/if}
          </p>
        {:else}
          <p class="text-xl mb-4">
            Current player: 
            <span class={currentPlayer === 'X' ? 'text-blue-400' : 'text-red-400'}>
              {currentPlayer}
            </span>
          </p>
        {/if}
        <button
          class="bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-bold py-3 px-6 rounded-lg transform transition-all duration-200 hover:scale-105 hover:shadow-lg"
          on:click={resetGame}
        >
          🎮 New Game
        </button>
      </div>
    </div>
    <div class="fixed top-2 right-2 sm:top-4 sm:right-4 z-50 scale-50 sm:scale-75 transform-origin-top-right">
      <script 
        type="text/javascript" 
        src="https://cdnjs.buymeacoffee.com/1.0.0/button.prod.min.js" 
        data-name="bmc-button" 
        data-slug="shrishesha4" 
        data-color="#FF5F5F" 
        data-emoji="" 
        data-font="Lato" 
        data-text="Buy me a coffee" 
        data-outline-color="#000000" 
        data-font-color="#ffffff" 
        data-coffee-color="#FFDD00"
      ></script>
    </div>
  </div>
  {#if showAnnouncement}
      <div 
        class="fixed inset-0 flex items-center justify-center z-50"
        transition:fade={{ duration: 200 }}
      >
        <div 
          class="absolute inset-0 bg-black/60 backdrop-blur-sm"
          transition:blur={{ duration: 200 }}
        />
        <div 
          class="relative text-8xl font-bold text-center"
          in:scale={{ duration: 300, start: 0.5 }}
          out:scale={{ duration: 300 }}
        >
          {#if winner === 'tie'}
            <span class="text-white">🤝 It's a tie!</span>
          {:else}
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 animate-pulse">
              🎉 {winner} Wins! 🎊
            </span>
          {/if}
        </div>
      </div>
    {/if}
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
  }
</style>
```
