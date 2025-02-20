const playerBoard = document.getElementById('player-board');
const computerBoard = document.getElementById('computer-board');
const statusText = document.getElementById('status');
const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');
const boardSizeInput = document.getElementById('board-size');
const shipCountInput = document.getElementById('ship-count');
const settingsToggle = document.getElementById('settings-toggle');
const settingsPanel = document.getElementById('settings-panel');
const saveSettingsButton = document.getElementById('save-settings');

let BOARD_SIZE = 5;
let SHIP_COUNT = 3;
let COMPUTER_ATTACK_DELAY = 500;
let playerShips = [], computerShips = [];
let playerHits = 0, computerHits = 0;
let playerCells = [];
let gameActive = false;
let playerTurn = true;

settingsToggle.addEventListener('click', () => {
  settingsPanel.style.display = settingsPanel.style.display === 'none' ? 'block' : 'none';
});

saveSettingsButton.addEventListener('click', () => {
  BOARD_SIZE = parseInt(boardSizeInput.value);
  SHIP_COUNT = Math.min(parseInt(shipCountInput.value), Math.floor(BOARD_SIZE * BOARD_SIZE / 3));

  boardSizeInput.value = BOARD_SIZE;
  shipCountInput.value = SHIP_COUNT;

  playSound('start');
  startGame(); // Start or restart game with new settings

  settingsPanel.style.display = 'none'; // Hide settings after saving
});
startButton.addEventListener('click', () => {
  if (gameActive) {
    if (confirm("🔄 Are you sure you want to reset the current game?")) {
      playSound('start');
      startGame(); // Reset game mid-play
    }
  } else {
    settingsPanel.style.display = 'none'
    BOARD_SIZE = parseInt(boardSizeInput.value);
    SHIP_COUNT = Math.min(parseInt(shipCountInput.value), Math.floor(BOARD_SIZE * BOARD_SIZE / 3));
    boardSizeInput.value = BOARD_SIZE;
    shipCountInput.value = SHIP_COUNT;

    playSound('start');
    startGame(); // Start new game
  }
});

function startGame() {
  resetGame();

  gameActive = true;
  playerTurn = true;
  startButton.textContent = 'Reset Game';
  statusText.textContent = "🚢 Battle begins! Attack the enemy ships!";

  createBoard(playerBoard, false); // Player board (no clicks)
  createBoard(computerBoard, true); // Computer board (clickable cells)

  playerShips = placeShips(playerBoard, false);
  computerShips = placeShips(computerBoard, true);
}

function resetGame() {
  playerHits = 0;
  computerHits = 0;
  playerCells = [];
  playerShips = [];
  computerShips = [];

  // Clear boards
  playerBoard.innerHTML = '';
  computerBoard.innerHTML = '';

  // Reset status and turn
  playerTurn = true;
  gameActive = false;
}

function createBoard(board, isEnemy) {
  board.innerHTML = ''; // Clear the existing board

  const calculateCellSize = () => {
    const screenWidth = window.innerWidth;
    let cellSize = 40;
    if (screenWidth <= 768) cellSize = 32;
    if (screenWidth <= 480) cellSize = 26;
    return cellSize;
  };

  const cellSize = calculateCellSize();
  board.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, ${cellSize}px)`;
  board.style.setProperty('--cell-size', `${cellSize}px`);

  for (let i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');

    if (isEnemy) {
      cell.addEventListener('click', () => handlePlayerAttack(cell, i));
    } else {
      playerCells.push(cell);
      cell.classList.add('no-hover');
    }

    board.appendChild(cell);
  }

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
  if (!gameActive || !playerTurn || cell.classList.contains('hit') || cell.classList.contains('miss')) return;

  playerTurn = false;

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

  if (playerHits === SHIP_COUNT) {
    endGame(true);
  } else {
    setTimeout(computerAttack, COMPUTER_ATTACK_DELAY);
  }
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

  if (computerHits === SHIP_COUNT) {
    endGame(false);
  } else {
    playerTurn = true; // Enable player clicks after computer's turn
  }
}

function endGame(playerWon) {
  gameActive = false;

  startButton.textContent = 'Start Game';
  statusText.textContent = playerWon ? "🏆 You won!" : "💥 You lost!";
  playSound(playerWon ? 'win' : 'lose');

  playerShips.forEach(pos => playerBoard.children[pos].classList.add('ship-reveal'));
  computerShips.forEach(pos => computerBoard.children[pos].classList.add('ship-reveal'));
}
