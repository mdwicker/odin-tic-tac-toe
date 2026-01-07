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
    let winningCoordinates = [];

    function isValidPlay(row, column) {
        const currentBoard = board.get()
        const size = currentBoard.length;

        if (row >= size || column >= size) {
            console.log(`Position does not exist. Row and column must be less than ${size}.`);
            return false;
        }

        const squareContents = currentBoard[row][column];

        if (squareContents !== null) {
            console.log("That square is already occupied.");
            return false;
        }

        return true
    }

    function checkEndConditions() {
        const win = findWin();
        if (win) {
            gameOver = true;
            winner = win.player;
            winningCoordinates = win.squares;
        } else if (checkTie()) {
            gameOver = true;
        } else {
            activePlayer = activePlayer === 0 ? 1 : 0;
        }
    }

    function findWin() {

        const currentBoard = board.get();
        const width = currentBoard.length;
        const height = currentBoard[0].length;

        function squaresMatch(squares) {
            if (!squares) {
                return false;
            }

            return squares.every(square => square === squares[0] && square !== null);
        }

        // Check rows
        for (let row = 0; row < width; row++) {
            if (squaresMatch(currentBoard[row])) {
                return {
                    player: currentBoard[row][0],
                    squares: currentBoard[row].map((_, column) => {
                        return { row, column };
                    })
                };
            }
        }
        // Check columns
        for (let column = 0; column < height; column++) {
            const columnSquares = currentBoard.map((row) => row[column]);
            if (squaresMatch(columnSquares)) {
                return {
                    player: currentBoard[0][column],
                    squares: currentBoard.map((_, row) => {
                        return { row, column };
                    })
                };
            }
        }

        // Check diagonals
        const diagonalA = currentBoard.map((row, i) => row[width - 1 - i]);
        if (squaresMatch(diagonalA)) {
            return {
                player: currentBoard[row][width - 1],
                squares: currentBoard.map((_, i) => {
                    return {
                        row: i,
                        column: width - 1 - i
                    }
                })
            }
        }

        const diagonalB = currentBoard.map((row, i) => row[i]);
        if (squaresMatch(diagonalB)) {
            return {
                player: currentBoard[0][0],
                squares: currentBoard.map((_, i) => {
                    return {
                        row: i,
                        column: i
                    }
                })
            }
        }
    }

    function checkTie() {
        const currentBoard = board.get();

        // Return true if no squares remain empty
        return !currentBoard.some((row) => row.some((square) => square === null));
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

    const getWinningCoordinates = () => winningCoordinates;

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
        getWinningCoordinates,
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
            game.placeMarker(row, column);

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

