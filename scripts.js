function Gameboard() {
    const size = 3;
    const board = [];

    createBoard();

    function createBoard() {
        for (let rowIndex = 0; rowIndex < size; rowIndex++) {
            board[rowIndex] = [];
            for (let colIndex = 0; colIndex < size; colIndex++) {
                board[rowIndex].push(Square());
            }
        }
    }

    const getSize = () => size;

    const markSquare = function (player, row, column) {
        board[row][column].set(player);
    }

    // Return deep copy of board to avoid editing the original
    const get = () => board.map((row) => row.map((square) => square.get()));

    return {
        get, getSize, markSquare
    };
}

function Square() {
    let value = null;

    const set = function (inputValue) {
        value = inputValue;
    };

    const get = () => value;

    return {
        set, get
    };
}

function Player(name, marker) {
    const getName = () => name;

    const getMarker = () => marker;

    return {
        getMarker, getName
    }
}

function GameController(playerOne, playerTwo) {
    const board = Gameboard();
    const players = { 0: playerOne, 1: playerTwo };
    let activePlayer = 0;
    let gameOver = false;

    const switchActivePlayer = function () {
        activePlayer = activePlayer === 0 ? 1 : 0;
    }

    const checkWinner = function () {
        const currentBoard = board.get();
        const boardSize = board.getSize();

        const possibleLines = [];
        possibleLines.push(...currentBoard);            // rows
        possibleLines.push(                             // columns
            ...currentBoard[0].map((_, column) => {
                return currentBoard.map((row) => row[column])
            })
        );
        possibleLines.push(                             // diagonals
            currentBoard.map(((row, i) => row[boardSize - 1 - i])),
            currentBoard.map(((row, i) => row[0 + i]))
        );

        for (const line of possibleLines) {
            if (line.every(square => (square === line[0] && line[0] !== null))) {
                return line[0];
            }
        }

        return null;
    };

    const announceWinner = function (winner) {
        console.log(`${players[winner].getName()} has won, congratulations!`);
    }

    const isOver = () => gameOver;

    const isValidPlay = function (row, column) {
        const size = board.getSize();

        if (row >= size || column >= size) {
            console.log(`Position does not exist. Row and column must be less than ${size}.`);
            return false;
        }

        const squareContents = board.get()[row][column];

        if (squareContents === null) {
            return true;
        } else {
            console.log("That square is already occupied.");
            return false;
        }
    }

    const placeMarker = function (row, column) {
        if (isOver) {
            console.log("Sorry, game is over.");
            return;
        }

        if (!isValidPlay(row, column)) {
            return;
        }

        board.markSquare(activePlayer, row, column);

        const winner = checkWinner();
        if (winner !== null) {
            announceWinner(winner);
            gameOver = true;
        } else {
            switchActivePlayer();
        }
    }


    return {
        placeMarker,
        isOver,
        getBoard: board.get
    }
}

function displayController() {

    const renderBoard = function (board) {
        const boardAscii = board.map((row) => {
            return row
                .map((square) => {
                    if (square === 0) {
                        return players[0].getMarker();
                    } else if (square === 1) {
                        return players[1].getMarker();
                    } else {
                        return "-"
                    }
                })
                .join(" ");
        }).join("\n");

        console.log(boardAscii);
    }

    const getPlayerNames = function () {
        let playerOne = null;
        let playerTwo = null;

        while (!playerOne) {
            playerOne = prompt("Please enter the name of the first player:");
        }

        while (!playerTwo) {
            playerTwo = prompt("Please enter the name of the second player:");
        }

        return { playerOne, playerTwo };
    }

    const { playerOne, playerTwo } = getPlayerNames();
    const game = GameController(playerOne, playerTwo);
    renderBoard(game.getBoard());
}

displayController();

