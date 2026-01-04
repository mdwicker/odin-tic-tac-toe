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

    const markSquare = function (player, row, column) {
        if (player !== 0 && player !== 1) {
            console.log(`Gameboard should only receive 0 or 1, not ${player}`);
        }
        board[row][column].set(player);
    }

    const isValidPlay = function (player, row, column) {
        if (player !== 0 && player !== 1) {
            console.log(`Gameboard should only receive 0 or 1, not ${player}`);
        }

        if (row >= size || column >= size) {
            console.log("Position does not exist. Row and column must be 0, 1, or 2.");
            return false;
        }

        const squareContents = board[row][column].get();

        if (squareContents === null) {
            return true;
        } else {
            console.log("That square is already occupied.");
            return false;
        }
    }

    const get = () => board;

    const winner = function () {
        /*
        K, how to determine winner...EITHER I cycle through all rows
        and columns and check manually.
        OR I change the markers to 1's and 2's and do math?
        No, because 3 could be made by 3 1's or 2+1. So...1 and 5?
        then if anything totals 3 or 15, we know the winner. that feels
        odd and hacky, but it works really smoothly lol. Idk.
        */
        return null;
    }

    return {
        markSquare, isValidPlay, winner, get
    };
}

function Square() {
    let value = null;

    const set = function (player) {
        value = player;
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

    const switchActivePlayer = function () {
        activePlayer = activePlayer === 0 ? 1 : 0;
    }

    const renderBoard = function () {
        const boardAscii = board.get().map((row) => {
            return row
                .map((square) => {
                    if (square.get() === 0) {
                        return players[0].getMarker();
                    } else if (square.get() === 1) {
                        return players[1].getMarker();
                    } else {
                        return "-"
                    }
                })
                .join(" ");
        }).join("\n");

        console.log(boardAscii);
    }

    const placeMarker = function (row, column) {
        if (!board.isValidPlay(activePlayer, row, column)) {
            return;
        }

        board.markSquare(activePlayer, row, column);
        renderBoard();

        if (board.winner()) {
            // announce winner
            // end game
        } else {
            switchActivePlayer();
        }
    }

    renderBoard();

    return {
        placeMarker
    }
}





/**
 * Ok, so how will this work? I think he's onto something. The Gameboard
 * will consist of Squares, which willl have one of three states:
 * a player1 token, a player2 token, or nothing.
 * GameController will manage the gameplay. Setting up initial players,
 * getting the active player, switching turns, checking for wins.
 * Player will handle the players. It should know their name, their marker,
 * and that's probably it. displaying the results. 
 * 
 Now, how should I handle the name and marker input? One option would be
 to initialize it within the Player object. That feels by far the tidiest
 option, but the problem is that they dont have enough info! B/c you need
 to know who has chosen what. One option could be to just assign the markers
 for them...that could be best, doing it randomly would be fair. Also much
 easier!
 */

