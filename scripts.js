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

    // Return deep copy of board to avoid editing the original
    const get = () => board.map((row) => row.map((square) => square.get()));

    const getSize = () => size;

    const markSquare = function (token, row, column) {
        board[row][column].set(token);
    }

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


function GameController() {
    const board = Gameboard();
    let activePlayer = 0;
    let gameOver = false;

    function switchActivePlayer() {
        activePlayer = activePlayer === 0 ? 1 : 0;
    }

    function checkEndConditions() {
        const winner = checkWin();
        if (winner !== false) {
            gameOver = true;
            return { status: "win", winner };
        }

        if (checkTie()) {
            gameOver = true;
            return { status: "tie" };
        }

        return false;
    }


    function checkWin() {
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

        return false;
    };

    function checkTie() {
        const boardState = board.get();

        // Return true if no squares remain empty
        return !boardState.some((row) => row.some((square) => square === null));
    }

    function continueGame() {
        switchActivePlayer();
        return { status: "continue" }
    }

    const isOver = () => gameOver;

    function isValidPlay(row, column) {
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
        if (isOver()) {
            return { status: "over" };
        }

        if (!isValidPlay(row, column)) {
            return { status: "invalid" };
        }

        board.markSquare(activePlayer, row, column);

        return checkEndConditions() || continueGame();
    }


    return {
        placeMarker,
        getBoard: board.get,
    }
}


function DisplayController(game) {
    const domGame = document.querySelector(".game");
    const domSquares = [];
    for (const square of domGame.querySelectorAll(".square")) {
        const row = parseInt(square.dataset.row);
        const column = parseInt(square.dataset.column);
        if (!domSquares[row]) domSquares[row] = [];
        domSquares[row][column] = square;
    }

    const players = [
        Player("Player One", "X"), Player("Player Two", "O")
    ];

    function renderBoardAscii(board) {
        const boardAscii = board.map((row) => {
            return row
                .map((square) => {
                    if (square === 0) {
                        return markers[0];
                    } else if (square === 1) {
                        return markers[1];
                    } else {
                        return "-"
                    }
                })
                .join(" ");
        }).join("\n");

        console.log(boardAscii);
    }

    function renderBoard(board) {
        domSquares.forEach((rowArray, row) => {
            rowArray.forEach((square, column) => {
                const occupant = board[row][column];

                square.textContent = occupant === null ? "" : players[occupant].getMarker();
            })
        });
    }

    function announceResults(result) {
        if (result.status === "win") {
            alert(`${players[result.winner].getName()} has won, congratulations!`);
        } else if (result.status === "tie") {
            alert("It's a tie!");
        }
    }

    const bindSquareListeners = function () {
        domGame.addEventListener("click", (e) => {
            const square = e.target.closest(".square");
            if (!square) return;

            const row = parseInt(square.dataset.row);
            const column = parseInt(square.dataset.column);

            const result = game.placeMarker(row, column);

            renderBoard(game.getBoard());

            if (result.status !== "continue") {
                announceResults(result);
            }
        })
    }

    renderBoard(game.getBoard());
    bindSquareListeners();
}


(function () {
    const game = GameController();
    DisplayController(game);
})();

