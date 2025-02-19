const playerBoard = document.getElementById('player-board');
const computerBoard = document.getElementById('computer-board');
const statusText = document.getElementById('status');
const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');
const boardSizeInput = document.getElementById('board-size');
const shipCountInput = document.getElementById('ship-count');

let BOARD_SIZE = 5;
let SHIP_COUNT = 3;
let COMPUTER_ATTACK_DELAY = 200;
let playerShips = [], computerShips = [];
let playerHits = 0, computerHits = 0;
let playerCells = [];
let gameActive = false;

// Update startButton event listener:
startButton.addEventListener('click', () => {
  if (gameActive) {
    if (confirm("🔄 Are you sure you want to reset the current game?")) {
      playSound('start');
      startGame(); // Reset game mid-play
    }
  } else {
    BOARD_SIZE = parseInt(boardSizeInput.value);
    SHIP_COUNT = Math.min(parseInt(shipCountInput.value), Math.floor(BOARD_SIZE * BOARD_SIZE / 3));
    boardSizeInput.value = BOARD_SIZE;
    shipCountInput.value = SHIP_COUNT;

    playSound('start');
    startGame(); // Start new game
  }
});


// restartButton.addEventListener('click', () => {
//   if (gameActive && confirm("Are you sure you want to restart the game?")) {
//     playSound('start');
//     startGame();
//   }
// });

// Update startGame function:
function startGame() {
  gameActive = true;
  playerHits = 0;
  computerHits = 0;
  playerCells = [];

  startButton.style.display = 'inline-block';
  startButton.textContent = 'Reset Game'; // Change button text during active game
  statusText.textContent = "🚢 Battle begins! Attack the enemy ships!";

  createBoard(playerBoard, false);
  createBoard(computerBoard, true);

  playerShips = placeShips(playerBoard, false);
  computerShips = placeShips(computerBoard, true);
}

function createBoard(board, isEnemy) {
  board.innerHTML = ''; // Clear the existing board

  // Function to calculate and set responsive cell size
  const calculateCellSize = () => {
    const screenWidth = window.innerWidth;
    let cellSize = 40; // Default for desktop

    if (screenWidth <= 768) cellSize = 32; // Tablet
    if (screenWidth <= 480) cellSize = 26; // Mobile

    return cellSize;
  };

  // Set the initial cell size and grid columns
  const cellSize = calculateCellSize();
  board.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, ${cellSize}px)`;
  board.style.setProperty('--cell-size', `${cellSize}px`);

  // Create the cells
  for (let i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');

    if (isEnemy) {
      cell.addEventListener('click', () => handlePlayerAttack(cell, i), { once: true });
    } else {
      playerCells.push(cell);
      cell.classList.add('no-hover'); // Prevent hover effect on player board
    }

    board.appendChild(cell);
  }

  // Update the board when window is resized
  window.addEventListener('resize', () => {
    const newCellSize = calculateCellSize();
    board.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, ${newCellSize}px)`;
    board.style.setProperty('--cell-size', `${newCellSize}px`);
  });
}
function placeShips(board, isEnemy) {
  const positions = [];
  while (positions.length < SHIP_COUNT) {
    const pos = Math.floor(Math.random() * BOARD_SIZE * BOARD_SIZE);
    if (!positions.includes(pos)) {
      positions.push(pos);
      if (!isEnemy) {
        // Keep player ships hidden until game ends (no 'ship' class added)
      }
    }
  }
  return positions;
}

function handlePlayerAttack(cell, index) {
  if (!gameActive) return; // Prevent moves after game ends

  if (computerShips.includes(index)) {
    cell.classList.add('hit');
    playerHits++;
    playSound('hit');
    statusText.textContent = `🎯 Hit! (${playerHits}/${SHIP_COUNT})`;
  } else {
    cell.classList.add('miss');
    playSound('miss');
    statusText.textContent = "💦 Miss! Enemy's turn...";
  }

  if (playerHits === SHIP_COUNT) return endGame(true);
  setTimeout(computerAttack, COMPUTER_ATTACK_DELAY);
}

function computerAttack() {
  if (!gameActive) return;

  let pos;
  do {
    pos = Math.floor(Math.random() * BOARD_SIZE * BOARD_SIZE);
  } while (playerCells[pos].classList.contains('hit') || playerCells[pos].classList.contains('miss'));

  if (playerShips.includes(pos)) {
    playerCells[pos].classList.add('hit');
    computerHits++;
    playSound('hit');
    statusText.textContent = `⚠️ Enemy hit! (${computerHits}/${SHIP_COUNT})`;
  } else {
    playerCells[pos].classList.add('miss');
    playSound('miss');
    statusText.textContent = "😅 Enemy missed! Your turn.";
  }

  if (computerHits === SHIP_COUNT) endGame(false);
}

function endGame(playerWon) {
  gameActive = false;

  restartButton.style.display = 'none';
  startButton.style.display = 'inline-block';

  // Reveal ships on both boards
  playerShips.forEach(pos => playerBoard.children[pos].classList.add('ship-reveal'));
  computerShips.forEach(pos => computerBoard.children[pos].classList.add('ship-reveal'));

  statusText.textContent = playerWon ? "🏆 You won!" : "💥 You lost!";
  playSound(playerWon ? 'win' : 'lose');
}
