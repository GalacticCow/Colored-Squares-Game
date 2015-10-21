/**
 * Created by Matthew on 10/18/15.
 */

/**'canvas' is where the game's display occurs.*/
var canvasEl = document.getElementById("Display");
var canvas = canvasEl.getContext("2d");

/**'grid' is where the contents of the board is stored**/
var grid =    [[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],
               [0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],
               [0,0,0,0,0,-1,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],
               [0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],
               [0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0]];

/**gridspacesize (in pixels) is the size of a tile in the grid, and also the size of a player.**/
var gSpaceSize = 25;

/**TileEnum makes it easier to refer to tile contents in the grid**/
var TileEnum = {
    WHITE: 0,
    BOMB: -1
};

/**DirEnum is used for movement of players on the board.**/
var DirEnum = {
    NORTH: 0,
    EAST: 1,
    SOUTH: 2,
    WEST: 3
}

/**
 * Player is a controllable entity in the game.  It is represented as a colored square,
 * and can move across the grid changing tile colors as it moves.  It can also detonate bombs.
 * @param color
 * @param borderColor
 * @param tileColor
 * @param startRow
 * @param startCol
 * @param ID
 * NOTE!!!!  ID HAS to correspond with the index it occupies in the players array.
 * @constructor
 */
function Player(color, borderColor, tileColor, startRow, startCol, ID) {
    this.color = color; //Color is the inside color of the player
    this.borderColor = borderColor; //border color is the color of the edge of the player
    this.tileColor = tileColor; //tile color is the color the player leaves behind on tiles.
    this.row = startRow; //row "y" coords for player
    this.col = startCol; //column "x" coords for player
    this.ID = ID; //should be equivalent to the index the player occupies in players[]
    this.isMoving = false; //denotes the player is moving, ignore inputs and move the player slightly movingDir.
    this.movingDir = DirEnum.NORTH; //direction for the player to move when isMoving is true.  Use DirEnum here.
    this.scoreElement = undefined; /*scoreElement is the reference to the <span> where this player's score is kept.  It is
     eventually defined by the createScore method, which is called at the end of this constructor.*/

    /**
     * Draw draws the player object on the grid at the relevant row/col.
     */
    this.draw = function() {
        canvas.fillStyle = this.color;
        canvas.lineWidth = 2;
        canvas.strokeStyle = this.borderColor;
        canvas.fillRect(this.col * 25, this.row * 25, gSpaceSize, gSpaceSize);
        canvas.strokeRect(this.col * 25, this.row * 25, gSpaceSize, gSpaceSize);
    }
    /**
     * createScoreElement sets scoreElement for future updates, and adds the player to the scoreboard.
     */
    this.createScoreElement = function() {
        var playerElement = document.createElement('p');
        playerElement.innerHTML = "Player " + this.ID + ":" + "<span id=\"PlayerScore" + this.ID + "\">0</span>";
        this.scoreElement = playerElement.querySelector('span');
        document.getElementById("scoreboard").appendChild(playerElement)
    }

    //Now call createScoreElement() to set the scoreboard with the player
    this.createScoreElement();

    /**
     * Getter function for score value.
     * @returns {number}
     */
    this.getScore = function() {
        return Number(this.scoreElement.innerHTML);
    }

    /**
     * Setter for the score.  Ignore the webstorm error if it tells you something's wrong, nothing is wrong.
     * @param scoreIn
     */
    this.setScore = function(scoreIn) {
        this.scoreElement.innerHTML = scoreIn.toString();
    }
}

var players = []; //This is where I put all the players.
var cPlayer = 0; //This allows me to switch between players.

/**
 * This function draws the current tiles and grid lines on the game canvas.
 */
function drawGrid() {
    //Grid tiles
    for(var i = 0; i < 10; i++){
        for(var j = 0; j < 10; j++){
            var cTile = grid[i][j];
            if(cTile != TileEnum.WHITE) {
                var cColor = "#555555"; //default color should be a grey block -- signals a problem
                if(cTile == TileEnum.BOMB) {
                    cColor = "#222222";
                } else {
                    cColor = players[cTile - 1].tileColor; //tile ID also corresponds to index in array.  Fun!
                }
                canvas.fillStyle = cColor;
                canvas.fillRect(i * 25, j * 25, gSpaceSize, gSpaceSize);
            }
        }
    }
    //Grid lines
    canvas.strokeStyle = "#888888";
    for(var i = 1; i < 10; i++){
        //Vertical lines
        canvas.beginPath();
        canvas.moveTo(0, i * 25);
        canvas.lineTo(250, i * 25);
        canvas.stroke();
        //Horizontal lines
        canvas.beginPath();
        canvas.moveTo(i * 25, 0);
        canvas.lineTo(i * 25, 250);
        canvas.stroke();
    }
}

/**
 * Update is the main function that updates the items on-screen.  Add any every-frame events or checks here.
 */
function update() {
    updateDisplay();
    updatePlayerMovement();
}

/**
 * updatePlayerMovement moves players whose isMoving flag is set as true in their appropriate directions.  It
 * also stops movement once the player is on the next tile.
 */
function updatePlayerMovement() {
    var movementInterval = .0625;
    for(var i = 0; i < players.length; i++) {
        if(players[i].isMoving) {
            //Apply the movement
            if(players[i].movingDir == DirEnum.WEST) {players[i].col -= movementInterval;}
            if(players[i].movingDir == DirEnum.EAST) {players[i].col += movementInterval;}
            if(players[i].movingDir == DirEnum.NORTH) {players[i].row -= movementInterval;}
            if(players[i].movingDir == DirEnum.SOUTH) {players[i].row += movementInterval;}
            /**TODO:  Fix floating point bullshittery to allow for more movementIntervals**/
            //See if they're ready to stop, and if so, stop.
            if(players[i].row % 1 === 0 && players[i].col % 1 === 0) {//whole numbers mean it's right on a tile
                players[i].isMoving = false;
                updateGrid();
            }
        }
    }
}

/**
 * UpdateDisplay re-draws the screen based on the position of game elements.
 */
function updateDisplay() {
    canvas.clearRect(0,0, 250, 250);
    drawGrid();
    for(var i = 0; i < players.length; i++) {
        players[i].draw();
    }
}

/**
 * UpdateGrid colors the current tile under the players as their color, while also checking for
 * bomb detonations and territory captures.  It basically updates the board according to the rules
 * of the game.  If I add more "rules" in I might want to do so here.
 */
function updateGrid() {
    //Check for bomb detonation
    for(var i = 0; i < players.length; i++) {
        if(players[i].isMoving == false) {
            if(grid[players[i].col][players[i].row] == TileEnum.BOMB) {
                activateBomb(players[i].ID, players[i].col, players[i].row);
            }
        }
    }
    //Change current tile to player's color.
    for(var i = 0; i < players.length; i++) {
        if(players[i].isMoving == false) {
            grid[players[i].col][players[i].row] = players[i].ID; //ID translates to color
        }
    }
    //Check for territory capture, flip tiles as necessary
    //checkTerritoryCapture();
    //Todo:  Decide whether I'll keep territory capture or not
    //Todo:  Fix territory capture so it doesn't have suicides or mysterious invalid tiles.
}
/**
 * Detonates the bomb at grid[col][row] by the bTile color.  Applies the tile changes
 * and activates the bomb position reset.
 * @param bTile
 * @param col
 * @param row
 */
function activateBomb(bTile, col, row) {
    grid[col][row] = bTile; //set the bomb tile to the activating player's color to make the floodFill work right
    floodFill(col, row, TileEnum.WHITE, bTile);
    resetBomb();
}

/**
 * floodFill is used in bomb activation and territory capture.  It colors a connected block
 * of similarly-colored tiles to another color, recursively, starting from a root block.
 * Starts at grid[cCol][cRow], it changes a block of 'fromColor' tiles to 'toColor' tiles.
 * @param cCol
 * @param cRow
 * @param toColor
 * @param fromColor
 */
function floodFill(cCol, cRow, toColor, fromColor) {
    if(grid[cCol][cRow] == toColor) {return;}
    if(grid[cCol][cRow] != fromColor) {return;}
    grid[cCol][cRow] = toColor; //here's where it actually fills the file in.
    //Now add 1 to player's score.  fromColor-1 is the player who should get points.
    players[fromColor-1].setScore(players[fromColor-1].getScore() + 1);
    //Perform floodFill recursively up,down,left,right
    if(cCol > 0) {floodFill(cCol - 1, cRow, toColor, fromColor);}
    if(cCol < 9) {floodFill(cCol + 1, cRow, toColor, fromColor);}
    if(cRow > 0) {floodFill(cCol, cRow - 1, toColor, fromColor);}
    if(cRow < 9) {floodFill(cCol, cRow + 1, toColor, fromColor);}
}

/**
 *Finds a random tile that isn't the player, then sets a new bomb there.
 */
function resetBomb() {
    var newCol, newRow;
    while(true) {
        newCol = getRandomInt(0,9);
        newRow = getRandomInt(0,9);
        var isValidTile = true;
        for(var i = 0; i < players.length; i++) {
            if(newCol == players[i].col && newRow == players[i].row) {
                isValidTile = false;
            }
        }
        if(isValidTile) { break; }
    }
    grid[newCol][newRow] = TileEnum.BOMB;
}

/**
 * Checks entire grid for any territory captures, and changes tile colors as necessary.
 */
function checkTerritoryCapture() {
    var checkMap = //CheckMap corresponds with grid. It marks which tiles have already been searched.
        [[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0]];

    /**
     * checkForBlockCapture takes in a starting tile and the color, and determines whether the structure is completely
     * encircled by an enemy color.  If it is, it pushes that color, and regardless of whether it's actually
     * encircled, it marks all the connected tiles as checked.
     * @param col
     * @param row
     * @param startTileColor
     */
    function checkForBlockCapture(col, row, startTileColor) {
        var nList = [];
        /**
         * getAllNeighbors puts all the neighbors of the block into the nList.  If adjacent to a wall, it pushes -1.
         * @param col
         * @param row
         * @param tileColor
         */
        function getAllNeighbors(col, row, tileColor) {
            if(grid[col][row] != tileColor) { return; }
            checkMap[col][row] = 1; //modify check map, 1 means visited.
            if(col > 0) {
                if (checkMap[col-1][row] == 0 || grid[col-1][row] != tileColor) {
                    getAllNeighbors(col-1, row, tileColor);
                }
            } else {nList.push(-1);}
            if(col < 9) {
                if(checkMap[col+1][row] == 0  || grid[col+1][row] != tileColor) {
                    getAllNeighbors(col+1, row, tileColor);
                }
            } else {nList.push(-1);}
            if(row > 0) {
                if(checkMap[col][row-1] == 0  || grid[col][row-1] != tileColor) {
                    getAllNeighbors(col, row-1, tileColor);
                }
            } else {nList.push(-1);}
            if(row < 9) {
                if(checkMap[col][row+1] == 0  || grid[col][row+1] != tileColor) {
                    getAllNeighbors(col, row+1, tileColor);
                }
            } else {nList.push(-1);}
            //This should visit all the tiles, and push all the neighbors and wall tiles to nList.
        }
        getAllNeighbors(col, row, startTileColor); //start the recursion thing.

        var eligibleForCapture = true;
        for(var i = 0; i < nList.length - 1; i++) {
            if(nList[i] == -1 || nList[i] == TileEnum.WHITE) {eligibleForCapture = false; break;}
            if(nList[i] != nList[i + 1]) {eligibleForCapture = false; break;}
        }
        //Finally, return the relevant value.
        if(eligibleForCapture) { return nList[0]; }
        else { return -1; }
    }

    /**CheckForBlockCapture() with every block of similarly colored tiles.  If any block is surrounded
     * completely by another, floodFill it with the surrounding block's color.
     */
    for(var i = 0; i < 10; i++) {
        for(var j = 0; j < 10; j++){
            if(checkMap[i][j] != 1 && grid[i][j] != TileEnum.BOMB) { //if the tile isn't checked yet and is ok to capture
                var check = checkForBlockCapture(i, j, grid[i][j]); //check if its block is surrounded
                if(check != -1) { //if the block IS surrounded by 'something'
                    floodFill(i,j,check, grid[i][j]); //turn that block into 'that something'.
                }
            }
        }
    }
}

/**
 * Used for resetBomb().  Generates random value between min and max.
 * @param min
 * @param max
 * @returns {*}
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**Make javascript recognize any keypress in the canvas context.**/
window.addEventListener( "keydown", doKeyDown, true);

/**
 * The relevant keypress listener function.  It uses various doMovementKeyDOwn statements to
 * bind keys to players, and updates the grid accordingly.
 * @param e
 */
function doKeyDown(e) {
    doMovementKeyDown(0, 38, 40, 37, 39, e.keyCode);
    doMovementKeyDown(1, 87, 83, 65, 68, e.keyCode);
    doMovementKeyDown(2, 84, 71, 70, 72, e.keyCode);
    doMovementKeyDown(3, 73, 75, 74, 76, e.keyCode);
    //Since a player must have moved, update the grid because tiles must have changed.
    //updateGrid();
}

/**
 * A function where you can input a player and bind certain keys to their movement.  The player at
 * playerIndex will move up/down/left/right according to the inputted keys.  Also input the e.keyCode.
 * @param playerIndex
 * @param upkey
 * @param downkey
 * @param leftkey
 * @param rightkey
 * @param inputKey
 */
function doMovementKeyDown(playerIndex, upkey, downkey, leftkey, rightkey, inputKey) {
    if ( inputKey == upkey ) { if(players[playerIndex].row != 0 && !players[playerIndex].isMoving) {
        players[playerIndex].isMoving = true;
        players[playerIndex].movingDir = DirEnum.NORTH;}
    }
    if ( inputKey == downkey ) { if(players[playerIndex].row != 9 && !players[playerIndex].isMoving) {
        players[playerIndex].isMoving = true;
        players[playerIndex].movingDir = DirEnum.SOUTH;}
    }
    if ( inputKey == leftkey ) { if(players[playerIndex].col != 0 && !players[playerIndex].isMoving) {
        players[playerIndex].isMoving = true;
        players[playerIndex].movingDir = DirEnum.WEST;}
    }
    if ( inputKey == rightkey ) { if(players[playerIndex].col != 9 && !players[playerIndex].isMoving) {
        players[playerIndex].isMoving = true;
        players[playerIndex].movingDir = DirEnum.EAST;}
    }
}

//Instantiate the players.
players.push(new Player("#FF0000", "#8A0808", "#F5A9A9", 0, 0, 1));
players.push(new Player("#0000FF", "#0B2161", "#A9BCF5", 9, 9, 2));
players.push(new Player("#04B404", "#21610B", "#ACFA58", 0, 9, 3));
players.push(new Player("#A901DB", "#4C0B5F", "#E2A9F3", 9, 0, 4));

updateGrid(); //set initial player position tiles to their colors.
/**Main game loop**/
setInterval(update, 1000/60); //60 is fps for updates.  Can change if I need to do some weird stuff.