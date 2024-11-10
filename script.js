const canvas = document.getElementById('canvas1');
// instance of creating canvas api for building all types of 2d objects
const ctx = canvas.getContext('2d');
canvas.width = 900;
canvas.height = 600;

//global variables
const cellSize = 100;
const cellGap = 3;

let resources = 200;
let interval = 400;
let frame = 0;
let gameOver = false;
let score = 0;
const winningScore = 50;


const gameGrid = [];
const plant = [];
const zombie = [];
const hitter = [];
const zombiePos = [];
const power = [];




//mouse
const mouse = {
    x: 10,
    y: 10,
    width: 0.1,
    height: 0.1

}

let canvasPosition = canvas.getBoundingClientRect(); // this function returns a built in rectangle project which contains info about the size of the element aand its position 
canvas.addEventListener('mousemove', function (e) {
    mouse.x = e.x - canvasPosition.left;
    mouse.y = e.y - canvasPosition.top;
});
canvas.addEventListener('mouseleave', function () {
    mouse.x = null;
    mouse.y = null;
});

// game board 
const controlsBar = {
    width: canvas.width,
    height: cellSize,
}
class Cell {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = cellSize;
        this.height = cellSize;
    }
    draw() {
        if (mouse.x && mouse.y && collision(this, mouse)) {
            ctx.strokeStyle = 'black';
            ctx.strokeRect(this.x, this.y, this.width, this.height);
        }
    }
}
function createGrid() {
    for (let y = cellSize; y < canvas.height; y += cellSize) {
        for (let x = 0; x < canvas.width; x += cellSize) {
            gameGrid.push(new Cell(x, y));
        }
    }
}
createGrid();
function handleGameGrid() {
    for (let i = 0; i < gameGrid.length; i++) {
        gameGrid[i].draw();
    }
}



//utilities

function collision(first, second) {
    if (!(first.x > second.x + second.width ||
        first.x + first.width < second.x ||
        first.y > second.y + second.height ||
        first.y + first.height < second.y)
    ) {
        return true;
    };
};
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'lavender';
    ctx.fillRect(0, 0, controlsBar.width, controlsBar.height);

    handleGameGrid();
    handlePlants();
    handlePower();
    handleHitters();
    handleZombies();
    gameStatus();
    frame++;
    if (!gameOver) requestAnimationFrame(animate);
}
animate();

window.addEventListener('resize', function () {
    canvasPosition = canvas.getBoundingClientRect();
})