const canvas = document.getElementById('canvas1');
// instance of creating canvas api for building all types of 2d objects
const ctx = canvas.getContext('2d'); 
canvas.width = 900;
canvas.height = 600;

//global variables
const cellSize = 100;
const cellGap= 3;

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

class Hitters{ //template for creation of object to hit zombies
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
        ctx.fillStyle = 'dark green'; //the fill color is set to dark green
        ctx.beginPath(); //to start a new path (not disturbing any other drawing)
        ctx.arc(this.x, this.y, this.width, 0, Math.PI * 2);
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
        ctx.fillStyle = 'green'; //color of plant
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.font = '30px Arial';
        ctx.fillStyle = 'gold'; //color of text inside
        ctx.fillText(Math.floor(this.health), this.x + 15 , this.y + 30);
        
    }
    update(){
        if(this.shooting)
        {
            this.timer++;
            if(this.timer % 100 === 0)
            hitter.push(new Hitters(this.x + 75, this.y + 50)); //new hitter shooting after every 100 values of the timer
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
        ctx.fillStyle = 'brown';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.font = '30px Arial';
        ctx.fillStyle = 'gold';
        ctx.fillText(Math.floor(this.health), this.x + 15, this.y + 30);
        
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
            score += bonus;
            zombie.splice(i,1);
            zombiePos.splice((zombiePos.indexOf(zombie[i].y)), 1);
            i--;
        }
    }
    if(frame % interval === 0) //new zombie will be added after every interval
    {
        let verticalPos = Math.floor(Math.random() * 5 + 1) * cellSize; 
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
        this.x = (Math.random() * canvas.width) - cellSize;
        this.y = (Math.floor(Math.random() * 5) + 1) * cellSize;
        this.width = cellSize * 0.6;
        this.height = cellSize * 0.6;
        this.value = values[Math.floor(Math.random() * values.length)];
    }
    draw(){
        ctx.fillStyle = 'yellow';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.font = '30px Arial';
        ctx.fillStyle = 'black';
        ctx.fillText(this.value, this.x + 15, this.y + 50);
    }
}

function handlePower(){
    if(frame % 500 === 0)
        power.push(new Power);
    for(let i = 0 ; i < power.length ; i++)
    {
        power[i].draw();
        if(power[i] && mouse.x && mouse.y && collision(power[i], mouse))
        {
            resources += power[i].values;
            power.splice(i, 1); 
            i--;
        }
    }
}

function gameStatus(){
    ctx.font = '30px Arial';
    ctx.fillStyle = 'black';
    ctx.fillText('Score: '+score, 20, 30);
    ctx.fillText('Power: '+resources, 20 , 80);
    if(gameOver)
    {
        ctx.font = '100px Arial';
        ctx.fillStyle = 'black';
        ctx.fillText('GAME OVER', 170, 350);
    }
}