const canvas = document.getElementById('canvas1');
// instance of creating canvas api for building all types of 2d objects
const ctx = canvas.getContext('2d'); 
const plantImage = new Image;
plantImage.src = 'WhatsApp Image 2024-11-14 at 21.50.10_65bf9754.jpg'

const zombieImage = new Image;
zombieImage.src = 'WhatsApp_Image_2024-11-14_at_21.50.10_f780f442-removebg-preview.png'

const zombieHitsound = new Audio('HitSound.wav');
const bonusSound = new Audio('Bonus.mp3');
const startButton = document.getElementById('start');
let gameStart = false;

startButton.addEventListener('click',function(){
    startButton.style.display= 'none';
    gameStart= true;
    gameOver = false;

    // Promise.all([ 
    //     new Promise((resolve) => { plantImage.onload = resolve }),
    //     new Promise((resolve) => { zombieImage.onload = resolve })
    // ]).then(() => {
    //     animate();  // Start the game animation once all images are loaded
    // });
    animate();
})



canvas.width = 900;
canvas.height = 600;

//global variables
const cellSize = 100;
const cellGap= 3;

let resources = 200;
let interval = 600;
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
const mouse ={
    x : 10,
    y: 10,
    width : 0.1,
    height : 0.1

}

let canvasPosition = canvas.getBoundingClientRect(); // this function returns a built in rectangle project which contains info about the size of the element aand its position 
canvas.addEventListener('mousemove', function(e){
    mouse.x = e.x - canvasPosition.left;
    mouse.y = e.y - canvasPosition.top;
});
canvas.addEventListener('mouseleave', function(){
    mouse.x = null;
    mouse.y = null;
});

// game board 
const controlsBar = {
    width: canvas.width,
    height: cellSize,
}
class Cell {
constructor(x,y){
    this.x = x;
    this.y = y;
    this.width = cellSize;
    this.height = cellSize;
}
draw(){
    if (mouse.x && mouse.y && collision(this,mouse)){
        ctx.strokeStyle = 'black';
        ctx.strokeRect(this.x,this.y,this.width,this.height);
    }
}
}
function createGrid(){
    for(let y = cellSize;y<canvas.height;y+=cellSize){
        for(let x = 0; x<canvas.width; x +=cellSize){
            gameGrid.push(new Cell(x,y));
        }
    }
}
createGrid();
function handleGameGrid(){
    for(let i=0;i<gameGrid.length;i++){
        gameGrid[i].draw();
    }
}



//utilities

function collision(first, second){
    if (    !(  first.x > second.x + second.width ||
                first.x + first.width < second.x ||
                first.y > second.y + second.height ||
                first.y + first.height < second.y)
    ) {
        return true;
    };
};



class Hitters { //template for creation of object to hit zombies
    constructor(x,y){
        this.x = x;
        this.y = y;
        this.width = 10;
        this.height = 10;
        this.power = 20;
        this.speed = 6;
    }
    update(){
        this.x += this.speed;
    }
    draw(){
        ctx.beginPath(); //to start a new path (not disturbing any other drawing)
        ctx.arc(this.x, this.y, this.width, 0, Math.PI * 2);
        ctx.fillStyle = 'black'; //the fill color is set to dark green
        ctx.fill(); //color is filled in the element
    }
}

function handleHitters(){
    for(let i = 0 ; i < hitter.length ; i++)
    {
        hitter[i].update();
        hitter[i].draw();

        for(let j = 0 ; j < zombie.length ; j++)
        {
            if(hitter[i] && zombie[j] && collision(hitter[i], zombie[j]))
            {
                zombie[j].health -= hitter[i].power;
                hitter.splice(i,1); //getting rid of the hitter that has hit the zombie
                i--;
                zombieHitsound.play();
            }
        }
        
        if(hitter[i] && hitter[i].x > canvas.width - cellSize)
        {
            hitter.splice(i, 1);
            i--; //to make sure that the next pea does not get skipped by updation in the loop
        }
    }
}

class plants{ //template for creation of plants
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.height = cellSize - cellGap * 2;
        this.width = cellSize - cellGap * 2;
        this.shooting = false;
        this.health = 100;
        this.hitters = [];
        this.timer = 0; //timer to set interval for shooting hitter
    }
    draw(){

        ctx.drawImage(plantImage,this.x,this.y,this.width,this.height);
       
    }
    update(){
        if(this.shooting)
        {
            this.timer++;
            if(this.timer % 100 === 0)
            hitter.push(new Hitters(this.x + 75, this.y + 35)); //new hitter shooting after every 100 values of the timer
        }
        else
        this.timer = 0;
    }
}
canvas.addEventListener('click', function(){ //event of setting plants in the game grid
    const positionX = mouse.x - (mouse.x % cellSize) + cellGap;
    const positionY = mouse.y - (mouse.y % cellSize) + cellGap;
    
    
    if(positionY < cellSize)
        return; //To prevent setting a plant in the resource area
    
    for(let i = 0 ; i < plant.length ; i++)
    {
        if(plant[i].x === positionX && plant[i].y === positionY)
            return; //to prevent stacking of plants on the same cell
    }

    let plantCost = 60;

    //creation of an empty plant object based on resources available
    if(resources >= plantCost){
        plant.push(new plants(positionX, positionY)); //available plant pushed in the plant array
        resources -= plantCost; 
    }
})

function handlePlants(){ 
    for(let i = 0 ; i < plant.length ; i++){
        plant[i].draw();
        plant[i].update();
        if(zombiePos.indexOf(plant[i].y) !== -1) //if any zombie is present at the row of the plant
            plant[i].shooting = true;
        else
            plant[i].shooting = false; // no shooting when no zombie is there

        for(let j = 0 ; j < zombie.length ; j++){
            if(plant[i] && collision(plant[i], zombie[j])){ //when plant and zombie are next to each other 
                zombie[j].move = 0;
                plant[i].health -= 1;
            }
            if(plant[i] && plant[i].health <= 0)
            {
                plant.splice(i, 1); //removal of the plant from array after being eaten by zombie
                i--;
                zombie[j].move = zombie[j].speed;
            }
        }     
    }
}
//zombies
class zombies{ //template for creation of zombies
    constructor(verticalPos){
        this.x = canvas.width;
        this.y = verticalPos;
        this.width = cellSize - cellGap * 2;
        this.height = cellSize - cellGap * 2;
        this.speed = Math.random()* 0.2 + 0.4; //a random speed between 0.4 and 0.6
        this.move = this.speed;
        this.health = 90; //current health of a zombie
        this.maxHealth = this.health; //to keep track of initial health of every zombie
    }
    update(){ //to update the moving state of the zombie
        this.x -= this.move; //modification in the position of zombie
    }
    draw(){ //to render the zombie on the canvas
        ctx.drawImage(zombieImage,this.x,this.y,this.width,this.height);
    }
}

function handleZombies(){
    for(let i = 0 ; i < zombie.length ; i++)
    {
        zombie[i].update();
        zombie[i].draw();
        if(zombie[i].x < 0) gameOver = true;
        if(zombie[i].health <= 0)
        {
            let bonus = zombie[i].maxHealth / 10; //power gained by plant after killing a zombie
            resources += bonus;
            score +=bonus;
            zombie.splice(i,1);
            zombiePos.splice((zombiePos.indexOf(zombie[i].y)), 1);
            i--;
        }
    }
    if(frame % interval === 0) //new zombie will be added after every interval
    {
        let verticalPos = Math.floor(Math.random() * 5 + 1) * cellSize + cellGap; 
        //for random selection of row for zombie movement
        zombie.push(new zombies(verticalPos));
        zombiePos.push(verticalPos);
        if(interval > 120) interval -= 50;
    }
}

//power
const values = [20, 30, 40];
class Power{ 
    constructor(){ //template for randomly occurring power packets
        this.x = Math.random() * (canvas.width - cellSize);
        this.y = (Math.floor(Math.random() * 5) + 1) * cellSize + 25;
        this.width = cellSize * 0.6;
        this.height = cellSize * 0.6;
        this.value = values[Math.floor(Math.random() * values.length)];
    }
    draw(){
        ctx.fillStyle = 'yellow';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = 'black';
        ctx.font = '30px Arial';
        ctx.fillText(this.value, this.x + 15, this.y + 50);
    }
}

function handlePower(){
    if(frame % 500 === 0)
        power.push(new Power());
    for(let i = 0 ; i < power.length ; i++)
    {
        power[i].draw();
        if(power[i] && mouse.x && mouse.y && collision(power[i], mouse))
        {
            resources += power[i].value;
            power.splice(i, 1); 
            i--;
            bonusSound.play();
        }
    }
}

function gameStatus(){
    
    ctx.font = '30px Arial';
    ctx.fillStyle = 'black';
    ctx.fillText('Score: ' +score, 20, 30);
    ctx.fillText('Power:' +resources, 20 , 80);
    if(gameOver)
    {
       
        ctx.font = '100px Arial';
        ctx.fillStyle = 'black';
        ctx.fillText('GAME OVER', 170, 350);
    }
}
function animate(){
    if(!gameStart)
        return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'lavender';
  ctx.fillRect(0,0,controlsBar.width,controlsBar.height);
  
  handleGameGrid();
  handlePlants();
  handlePower();
  handleHitters();
  handleZombies();
  gameStatus();
  frame++;
  if (!gameOver) requestAnimationFrame(animate);
}


window.addEventListener('resize', function(){
    canvasPosition = canvas.getBoundingClientRect();
})