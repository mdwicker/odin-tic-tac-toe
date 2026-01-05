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
    /*
    Is this the best way to do this? I can think of other options:
    1. Initialize the name within the Player object. Creating a player
    object would automatically involve getting a name from the user.
    This is nice and tidy and ensures that players aren't floating around 
    without names. That honestly seems quite important, lol.
    BUT the problem is that it's possible that one might need to get
    info from outside to set it. Like with a GUI. This is worse with the
    marker, since you can't have both players choosing the same marker.
    
    2. Just have the player object take two arguments, one for name
    and one for marker. Honestly that might be the best option. Only 
    allow player creation after names and markers have been selected...
    Ok I'm convinced, I'm gonna use that method. So, for posterity, I'll
    record what I was originally doing. I had declared the name and
    marker variables without initializing them at all, then created
    functions to set their value. I liked how that felt like a compromise,
    letting the Player object handle their initialization but with input
    from the outside. BUT it's too risky to allow a player with no name
    or marker to exist. 
    */

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
            currentBoard.map(((row, i) => row[2 - i])),
            currentBoard.map(((row, i) => row[0 + i]))
        );

        for (const line of possibleLines) {
            if (line.every(square => (square === line[0] && square !== null))) {
                return line[0];
            }
        }

        return null;
    };

    const announceWinner = function (winner) {
        console.log(`${players[winner].getName()} has won, congratulations!`);
    }

    const renderBoard = function () {
        const boardAscii = board.get().map((row) => {
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
        if (gameOver) {
            console.log("Sorry, game is over.");
            return;
        }

        if (!isValidPlay(row, column)) {
            return;
        }

        board.markSquare(activePlayer, row, column);
        renderBoard();

        const winner = checkWinner();
        if (winner !== null) {
            announceWinner(winner);
            gameOver = true;
        } else {
            switchActivePlayer();
        }
    }


    renderBoard();

    return {
        placeMarker
    }
}

