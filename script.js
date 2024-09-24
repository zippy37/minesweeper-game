const restartButton = document.getElementById("restart-button");
const easyButton = document.getElementById("easy-button");
const mediumButton = document.getElementById("medium-button");
const hardButton = document.getElementById("hard-button");
const flagButton = document.getElementById("flag-button");
const clockDisplay = document.getElementById("timer");
const timeCount = document.getElementById("time");

let currentTime = 0;

let difficuly;

let board = [];
let minesLocation = []; 

let rows;
let columns;
let minesCount;

let tilesClicked = 0;
let flagEnabled = false;

let gameOver = false;

const trackTime = () => {
    if (!gameOver) {
        currentTime += 1;
        timeCount.innerText = currentTime;
    }

    else {
        return;
    }
}

window.onload = () => {
    setInterval(trackTime, 1000);
}

const changeDifficulty = (difficulty) => {
    
    if (difficulty === 1) {
        rows = 8;
        columns = 8;
        minesCount = 10;
        boardSetUp();
    }

    else if (difficulty === 2) {
        rows = 12;
        columns = 12;
        minesCount = 25;
        boardSetUp()
        document.querySelectorAll("#board div").forEach((e)=> {
            e.style.width = "48px"
            e.style.height = "48px"
        });
    }
    
    else if (difficulty === 3) {
        rows = 16;
        columns = 16;
        minesCount = 40;
        boardSetUp();
        document.querySelectorAll("#board div").forEach((e)=> {
            e.style.width = "35.5px"
            e.style.height = "35.5px"
        });
    }
    currentTime = 0;
    timeCount.innerText = "0";
    gameOver = false;
    easyButton.classList.add("hidden");
    mediumButton.classList.add("hidden");
    hardButton.classList.add("hidden");
    restartButton.classList.toggle("hidden");
}

easyButton.addEventListener("click", ()=> {changeDifficulty(1)});
mediumButton.addEventListener("click", ()=> {changeDifficulty(2)});
hardButton.addEventListener("click", ()=> {changeDifficulty(3)});


const gameRestart = () => {
    document.querySelector("h1").innerHTML = `<h1>Mines: <span id="mines-count">0</span></h1>`;
    document.querySelector("h1").style.color = "black";
  
    gameOver = false;   
    currentTime = 0;
    rows = "";
    columns = "";
    minesCount = "";
    board = [];
    minesLocation = []; 
    document.querySelectorAll("#board div").forEach((e)=> e.remove());
    easyButton.classList.toggle("hidden");
    mediumButton.classList.toggle("hidden");
    hardButton.classList.toggle("hidden");
    restartButton.classList.toggle("hidden");
    flagButton.classList.toggle("hidden");
    clockDisplay.classList.toggle("hidden");
    
}

document.getElementById("restart-button").addEventListener("click", gameRestart);


const setMines = () => {
    let minesLeft = minesCount;
    while (minesLeft > 0) {
        let r = Math.floor(Math.random() * rows);
        let c = Math.floor(Math.random() * columns);
        let id = `${r.toString()}-${c.toString()}`;

        if (!minesLocation.includes(id)) {
            minesLocation.push(id);
            minesLeft -= 1;
        }
    }
}

const boardSetUp = () => {
    document.getElementById("mines-count").innerText = minesCount;
    flagButton.addEventListener("click", setFlag);    // board
    flagButton.classList.toggle("hidden");
    clockDisplay.classList.toggle("hidden");
    setMines();

    // create grid
    for (let r = 0; r < rows; r++) {
        let row = [];
        for (let c = 0; c < columns; c++) {
            let tile = document.createElement("div");
            tile.id = `${r.toString()}-${c.toString()}`;
            // tile click
            tile.addEventListener("click", clickTile);
            tile.addEventListener("contextmenu", rightClickTile);
            document.getElementById("board").append(tile);
            row.push(tile);
        }
        board.push(row);
    }

    // console.log(board);
}

const setFlag = () => {
    if (flagEnabled) {
        flagEnabled = false;
        document.getElementById("flag-button").style.backgroundColor = "lightgray";
    }
    else {
        flagEnabled = true;
        document.getElementById("flag-button").style.backgroundColor = "darkgray";
    }
}

function clickTile() {
    if (gameOver || this.classList.contains("tile-clicked")) {
        return;
    }

    let tile = this;
    if (flagEnabled) {
        if (tile.innerText === "") {
            tile.innerText = "🚩";
        }
        else if (tile.innerText === "🚩") {
            tile.innerText = "";
        }
        return;
    }

    if (minesLocation.includes(tile.id)) {
        this.innerText = "💥";
        this.style.backgroundColor = "red";
        document.querySelector("h1").innerText = "GAME OVER";
        document.querySelector("h1").style.color = "red";
        gameOver = true;
        revealMines();
        return;
    }

    let coords = tile.id.split("-"); // "0-0" -> ["0", "0"]
    let r = parseInt(coords[0]);
    let c = parseInt(coords[1]);
    checkMine(r, c);
}

function rightClickTile() {

    if (gameOver || this.classList.contains("tile-clicked")) {
        return;
    }

    let tile = this;
        if (tile.innerText === "") {
            tile.innerText = "🚩";
        }
        else if (tile.innerText === "🚩") {
            tile.innerText = "";
        }
        return;
}

document.getElementById("board").addEventListener("contextmenu", e => {
    e.preventDefault();
})

const revealMines = () => {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            let tile = board[r][c];
            if (minesLocation.includes(tile.id) && tile.innerText !== "💥") {
                tile.innerText = "💣"
                tile.style.backgroundColor = "red";
            }
        }
    }
}

function checkMine(r, c) {
    if (r < 0 || r >= rows || c < 0 || c >= columns) {
        return;
    }

    if (board[r][c].classList.contains("tile-clicked")) {
        return;
    }

    board[r][c].classList.add("tile-clicked");
    tilesClicked += 1;

    let minesFound = 0;

    // top 3
    minesFound += checkTile(r - 1, c - 1); // top left
    minesFound += checkTile(r - 1, c);     // top
    minesFound += checkTile(r - 1, c + 1); // top right

    // left, right
    minesFound += checkTile(r, c - 1); // left
    minesFound += checkTile(r, c + 1); // right

    minesFound += checkTile(r + 1, c - 1); // bottom left
    minesFound += checkTile(r + 1, c);     // bottom
    minesFound += checkTile(r + 1, c + 1); // bottom right

    if (minesFound > 0) {
        board[r][c].innerText = minesFound;
        board[r][c].classList.add(`x${minesFound.toString()}`);
    }
    else {
        // top 3
        checkMine(r - 1, c - 1); // top left
        checkMine(r - 1, c); // top
        checkMine(r - 1, c + 1); // top right

        // left and right
        checkMine(r, c - 1); // left
        checkMine(r, c + 1); // right

        checkMine(r + 1, c - 1); // bottom left
        checkMine(r + 1, c); // bottom
        checkMine(r + 1, c + 1); // bottom right   
    }

    if (tilesClicked == rows * columns - minesCount) {
        document.querySelector("h1").innerText = "YOU WIN";
        document.querySelector("h1").style.color = "green";
        gameOver = true;
    }
}

function checkTile(r, c) {
    if (r < 0 || r >= rows || c < 0 || c >= columns) {
        return 0;
    }
    if (minesLocation.includes(`${r.toString()}-${c.toString()}`)) {
        return 1;
    }
    return 0;
}