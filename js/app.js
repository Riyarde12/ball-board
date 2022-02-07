var WALL = 'WALL';
var FLOOR = 'FLOOR';
var BALL = 'BALL';
var GAMER = 'GAMER';
var GLUE = 'GLUE';
const AUDIO = new Audio('sounds/bite.mp3');

var GAMER_IMG = '<img src="img/gamer.png" />';
var BALL_IMG = '<img src="img/ball.png" />';
var GLUE_IMG = '🤮';

var gBoard;
var gGamerPos;
var gIntervalId;
var counterBalls = 0;
var gBallsOnBoard = 2;
var gIsGameOn = false;
var gIsonGlue = false;
var gIntervalGlueId

console.log(gBoard);
function initGame() {
	gGamerPos = { i: 2, j: 9 };
	gBoard = buildBoard();
	renderBoard(gBoard);
	gIntervalId = setInterval(placeNewBall, 2000);
	gIsGameOn = true;
	gIntervalGlueId = setInterval(() => { addGlue() }, 5000);
}

function placeNewBall() {
	var emptyCells = getEmptyCells(gBoard);
	var randPos = getRandomCellPos(emptyCells);
	gBoard[randPos.i][randPos.j].gameElement = BALL;
	gBallsOnBoard++;
	renderCell(randPos, BALL_IMG);
}

function buildBoard() {
	// Create the Matrix
	var board = createMat(10, 12)
	// Put FLOOR everywhere and WALL at edges
	for (var i = 0; i < board.length; i++) {
		for (var j = 0; j < board[0].length; j++) {
			// Put FLOOR in a regular cell
			var cell = { type: FLOOR, gameElement: null };
			// Place Walls at edges
			if (i === 0 || i === board.length - 1 || j === 0 || j === board[0].length - 1) {
				cell.type = WALL;
			}
			// Add created cell to The game board
			board[i][j] = cell;
		}
	}
	// Place the gamer at selected position
	board[gGamerPos.i][gGamerPos.j].gameElement = GAMER;
	// Place the Balls (currently randomly chosen positions)
	board[3][8].gameElement = BALL;
	board[7][4].gameElement = BALL;
	board[0][7].type = FLOOR;
	board[9][7].type = FLOOR;
	board[4][0].type = FLOOR;
	board[4][11].type = FLOOR;
	return board;
}

function addGlue() {
	var gluePos = getEmptyCells(gBoard);
	var emptyCell = gluePos[getRandomInt(0, gBoard.length - 1)];
	gBoard[emptyCell.i][emptyCell.j].gameElement = GLUE;
	renderCell(emptyCell, GLUE_IMG);
	setTimeout(function () {
		if (gBoard[emptyCell.i][emptyCell.j].gameElement === GLUE) {
			gBoard[emptyCell.i][emptyCell.j].gameElement = null;
		}
	}, 3000)
}

// Render the board to an HTML table
function renderBoard(board) {

	var strHTML = '';
	for (var i = 0; i < board.length; i++) {
		strHTML += '<tr>\n';
		for (var j = 0; j < board[0].length; j++) {
			var currCell = board[i][j];
			var cellClass = getClassName({ i: i, j: j })

			// TODO - change to short if statement
			if (currCell.type === FLOOR) cellClass += ' floor';
			else if (currCell.type === WALL) cellClass += ' wall';

			//TODO - Change To template string
			strHTML += '\t<td class="cell ' + cellClass +
				'"  onclick="moveTo(' + i + ',' + j + ')" >\n';

			// TODO - change to switch case statement
			if (currCell.gameElement === GAMER) {
				strHTML += GAMER_IMG;
			} else if (currCell.gameElement === BALL) {
				strHTML += BALL_IMG;
			}
			strHTML += '\t</td>\n';
		}
		strHTML += '</tr>\n';
	}
	var elBoard = document.querySelector('.board');
	elBoard.innerHTML = strHTML;
}

// Move the player to a specific location
function moveTo(i, j) {
	if (!gIsGameOn) return
	if (gIsonGlue) return
	var targetCell = gBoard[i][j];
	if (targetCell.type === WALL) return

	// Calculate distance to make sure we are moving to a neighbor cell
	var iAbsDiff = Math.abs(i - gGamerPos.i);
	var jAbsDiff = Math.abs(j - gGamerPos.j);

	// If the clicked Cell is one of the four allowed
	if ((iAbsDiff === 1 && jAbsDiff === 0) ||
		(jAbsDiff === 1 && iAbsDiff === 0) ||
		(gGamerPos.j === 0 && j === 11) ||
		(gGamerPos.j === 11 && j === 0) ||
		(gGamerPos.i === 0 && i === 9) ||
		(gGamerPos.i === 9 && i === 0)
	) {
		console.log('targetCell', targetCell)
		if (targetCell.gameElement === BALL) {
			ballsEatenCollected();
			checkVictory();
			console.log('Collecting!');
		}
		if (targetCell.gameElement === GLUE) {
			gIsonGlue = true;
			setTimeout(() => { gIsonGlue = false }, 3000);
		}
		// MOVING from current position
		// Model:
		gBoard[gGamerPos.i][gGamerPos.j].gameElement = null;
		// Dom:
		renderCell(gGamerPos, '');
		// MOVING to selected position
		// Model:
		gGamerPos.i = i;
		gGamerPos.j = j;
		gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER;
		// DOM:
		renderCell(gGamerPos, GAMER_IMG);
	} // else console.log('TOO FAR', iAbsDiff, jAbsDiff);
}

// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
	var cellSelector = '.' + getClassName(location);
	var elCell = document.querySelector(cellSelector);
	elCell.innerHTML = value;
}

// Move the player by keyboard arrows
function handleKey(event) {
	var i = gGamerPos.i;
	var j = gGamerPos.j;

	switch (event.key) {
		case 'ArrowLeft':
			if (j === 0) {
				moveTo(4, 11)
			} else {
				moveTo(i, j - 1);
				break;
			}
		case 'ArrowRight':
			if (j === 11) {
				moveTo(4, 0)
			} else {
				moveTo(i, j + 1);
				break;
			}
		case 'ArrowUp':
			if (i === 0) {
				moveTo(9, 7)
			} else {
				moveTo(i - 1, j);
				break;
			}
		case 'ArrowDown':
			if (i === 9) {
				moveTo(0, 7)
			} else {
				moveTo(i + 1, j);
				break;
			}
	}
}

// Returns the class name for a specific cell
function getClassName(location) {
	var cellClass = 'cell-' + location.i + '-' + location.j;
	return cellClass;
}

function getEmptyCells(board) {
	var emptyCells = [];
	for (var i = 0; i < board.length; i++) {
		for (var j = 0; j < board[0].length; j++) {
			if (board[i][j].gameElement === BALL) continue;
			if (board[i][j].type === WALL) continue;
			if (board[i][j].gameElement === GAMER) continue;
			var emptyCell = { i: i, j: j };
			emptyCells.push(emptyCell);
		}
	}
	return emptyCells
}

// [{i j},{i j},{i j}]....
function getRandomCellPos(emptyCells) {
	var idx = getRandomInt(0, emptyCells.length)
	return emptyCells[idx]
}



function ballsEatenCollected() {
	AUDIO.play();
	counterBalls++
	gBallsOnBoard--
	var elDivCounterB = document.querySelector('.counter-balls')
	elDivCounterB.innerHTML = `Balls Collected: ${counterBalls}`;
}

function checkVictory() {
	if (gBallsOnBoard === 0) {
		clearInterval(gIntervalId);
		alert('Victory');
		gIsGameOn = false;
		resetGame()
	}
}

function resetGame() {
	gIsGameOn = false;
	gBallsOnBoard = 2;
	counterBalls = 0;
	clearInterval(gIntervalId);
	var elDivCounterB = document.querySelector('.counter-balls')
	elDivCounterB.innerHTML = `Balls Collected: ${counterBalls}`;
	initGame();
}