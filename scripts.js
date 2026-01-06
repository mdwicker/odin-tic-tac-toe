function Gameboard() {
    const size = 3;
    const board = [];

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

    const markSquare = function (token, row, column) {
        board[row][column].set(token);
    }

    const clear = function () {
        board.forEach((row) => row.forEach((square) => square.clear()));
    }

    createBoard();

    return {
        get, markSquare, clear
    };
}


function Square() {
    let value = null;

    const get = () => value;

    const set = function (inputValue) {
        if (value === null) {
            value = inputValue;
        } else {
            console.log(`Square value already set to ${value}.`);
        }
    };

    const clear = function () {
        value = null;
    };

    return {
        set, get, clear
    };
}


function Player(name, marker) {
    const setName = (input) => {
        name = input;
    };

    const getName = () => name;
    const getMarker = () => marker;

    return {
        setName,
        getName,
        getMarker
    }
}


function GameController() {
    let board = Gameboard();
    let activePlayer = 0;
    let gameOver = false;
    let winner = null;

    function isValidPlay(row, column) {
        const boardState = board.get()
        const size = boardState.length;

        if (row >= size || column >= size) {
            console.log(`Position does not exist. Row and column must be less than ${size}.`);
            return false;
        }

        const squareContents = boardState[row][column];

        if (squareContents !== null) {
            console.log("That square is already occupied.");
            return false;
        }

        return true
    }

    function checkEndConditions() {
        const winningPlayer = checkWin();
        if (winningPlayer !== false) {
            gameOver = true;
            winner = winningPlayer;
        } else if (checkTie()) {
            gameOver = true;
        } else {
            activePlayer = activePlayer === 0 ? 1 : 0;
        }
    }

    function checkWin() {
        const currentBoard = board.get();
        const boardSize = currentBoard.length;

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
    }

    function checkTie() {
        const boardState = board.get();

        // Return true if no squares remain empty
        return !boardState.some((row) => row.some((square) => square === null));
    }

    const placeMarker = function (row, column) {
        if (gameOver) {
            return { status: "over" };
        }

        if (!isValidPlay(row, column)) {
            return { status: "invalid" };
        }

        board.markSquare(activePlayer, row, column);

        checkEndConditions();
    };

    const isOver = () => gameOver;

    const hasWinner = () => winner !== null;

    const getWinner = () => winner;

    const getActivePlayer = () => activePlayer;

    const reset = function () {
        board.clear();
        activePlayer = 0;
        gameOver = false;
        winner = null;
    };

    return {
        placeMarker,
        isOver,
        hasWinner,
        getWinner,
        getActivePlayer,
        reset,
        getBoard: board.get
    }
}


function DisplayController(game) {
    const domDisplay = document.querySelector(".message");
    const domGame = document.querySelector(".game");
    const domSquares = getDomSquares();
    const players = [Player("Player One", "X"), Player("Player Two", "O")];

    renderBoard(game.getBoard());
    bindSquareListeners();
    bindNameInputListeners();
    bindNewGameListener();

    function getDomSquares() {
        const domSquares = [];

        for (const square of domGame.querySelectorAll(".square")) {
            const row = parseInt(square.dataset.row);
            const column = parseInt(square.dataset.column);

            if (!domSquares[row]) domSquares[row] = [];
            domSquares[row][column] = square;
        }

        return domSquares;
    }

    function bindSquareListeners() {
        domGame.addEventListener("click", (e) => {
            const square = e.target.closest(".square");
            if (!square) return;

            const row = parseInt(square.dataset.row);
            const column = parseInt(square.dataset.column);

            const result = game.placeMarker(row, column);

            render();
        })
    }

    function bindNameInputListeners() {
        document.querySelectorAll("input").forEach((input) => {
            input.addEventListener("input", (e) => {
                const name = e.target.value;
                const player = e.target.dataset.player;
                players[player].setName(name);
                renderDisplay();
            })
        })
    }

    function bindNewGameListener() {
        const newGameBtn = document.getElementById("new-game-btn");
        newGameBtn.addEventListener("click", (e) => {
            game.reset();
            render();
        });
    }

    function render() {
        const board = game.getBoard()
        renderBoard(board);
        renderDisplay();
    }

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

                if (occupant !== null) {
                    square.textContent = players[occupant].getMarker();
                    square.classList.add(`player-${occupant === 0 ? "one" : "two"}`);
                }

                square.textContent = occupant === null ? "" : players[occupant].getMarker();
                square.classList.add()
            })
        });
    }

    function renderDisplay() {
        let message;
        if (game.isOver()) {
            if (game.hasWinner()) {
                const player = players[game.getWinner()].getName();
                message = `${player} has won!`;
            } else {
                message = "It's a tie.";
            }
        } else {
            const player = players[game.getActivePlayer()].getName();
            message = `${player}'s turn.`;
        }
        domDisplay.textContent = message;
    }
}


(function () {
    const game = GameController();
    DisplayController(game);
})();

