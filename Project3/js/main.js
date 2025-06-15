
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
"use strict";
const app = new PIXI.Application();

// aliases
let stage;
let assets;

let sceneWidth, sceneHeight;

// game variables
let startScene;
let gameScene, rainDrop, rainRadius, scoreLabel, jumpLabel, hitSound, bounceAmount;
let gameOverScene;
let scoreText;
let score;

let leafArray = [];
let jumpCount = 25;
let timer = 0;
let paused = false;

// Create 

// Create a empty variable object to store key values.
let keys = {};

// Load all assets
loadImages();

async function loadImages() {
  // https://pixijs.com/8.x/guides/components/assets#loading-multiple-assets
  PIXI.Assets.addBundle("sprites", {
    gameframe: "images/gameframe.png",
    leaf: "images/leaf.png",
    aiPic: "images/ai-pic.jpg",
    move: "images/move.jpg",
  });

  // The second argument is a callback function that is called whenever the loader makes progress.
  assets = await PIXI.Assets.loadBundle("sprites", (progress) => {
    // console.log(`progress=${(progress * 100).toFixed(2)}%`); // 0.4288 => 42.88%
  });

  setup(); 
}

async function setup() {
  await app.init({ width: 600, height: 600, backgroundColor: 0x87CEEB,  });

  document.body.appendChild(app.canvas);

  stage = app.stage;
  sceneWidth = app.renderer.width;
  sceneHeight = app.renderer.height;

  // #1 - Create the start scene
  startScene = new PIXI.Container();
  stage.addChild(startScene);

  // #2 - Create the main `game` scene and make it invisible
  gameScene = new PIXI.Container();
  gameScene.visible = false;
  stage.addChild(gameScene);

  // #3 - Create the `gameOver` scene and make it invisible
  gameOverScene = new PIXI.Container();
  gameOverScene.visible = false;
  stage.addChild(gameOverScene);

  // Create a three background Sprite.
  const background = new PIXI.Sprite(assets.gameframe);
  background.width = sceneWidth;
  background.height = sceneHeight;

  const startGround = new PIXI.Sprite(assets.gameframe);
  startGround.width = sceneWidth;
  startGround.height = sceneHeight;

  const endGround = new PIXI.Sprite(assets.gameframe);
  endGround.width = sceneWidth;
  endGround.height = sceneHeight;

  // Add the background first in the start scene and .
  startScene.addChild(startGround);
  gameScene.addChild(background);
  gameOverScene.addChild(endGround);

  // Create a keyboard event handlers to check if a key is
  // currently up or down.
  // Note:
  // e.code = "KeyPressed" e.g "KeyD".
  // e.keyCode = KeyNumber e.g 63.
  window.addEventListener("keydown", keysDown);
  window.addEventListener("keyup", keysUp);

  // Add leave first to make leaf under the raindrop.
  // Create leaf falling array using a for loop.
  for(let i = 0; i < 10; i++)
    {
      // Create a random speed.
      let randomSpeed = Math.random() * (50 - 10) + 10;
      let newLeaf = new Leaf(assets.leaf, 20, randomSpeed);
  
      // Add to leaf array.
      leafArray.push(newLeaf);
  
      // Add to start scene.
      gameScene.addChild(newLeaf);
    }

    createLabelsAndButtons()

  // Add the background first in the scene.
  // startScene.addChild(background);

  // Add power-up first to make leaf under the raindrop.
  // Create a power-up array using a for loop.

  // Create a new rain drop and add to the scene.
  let rainRadius = 20;
  let bounceAmount = jumpCount;
  rainDrop = new Raindrop(rainRadius, 0x87CEEB, sceneWidth / 2, sceneHeight - rainRadius, bounceAmount);
  gameScene.addChild(rainDrop);

  // Create a game scene.
  app.ticker.add(gameLoop);

  // Create labels for all 3 scenes.
  function createLabelsAndButtons()
  {
    let buttonStyle = 
    {
      fill: 0xffff00,
      stroke: 0x000000,
      fontSize: 26,
      strokeThickness: 2,
      fontFamily: "Arial",
    };

    // Set up a start up scene.
    let startLabel1 = new PIXI.Text("Raindrop's Journey", 
      { fill: 0xFFC0CB,
        fontSize: 55,
        fontFamily: "Arial",
        stroke: 0x000000,
        strokeThickness: 6,
      });
  
      startLabel1.x = 50;
      startLabel1.y = 100;
      startScene.addChild(startLabel1);
  
    // Start the middle label.
    let startLabel2 = new PIXI.Text("How long can you stay on the leaves!", 
      {
        fill: 0x87CEEC, // 0xff000,
        fontSize: 25,
        fontFamily: "Arial",
        fontStyle: "italic",
        stroke:  0xFFFFFF,
        strokeThickness: 6,
      });
  
      startLabel2.x = 90;
      startLabel2.y = 240;
      startScene.addChild(startLabel2);
  
    // Make start game button.
    let startButton = new PIXI.Text("[ Start the game ]", buttonStyle);
    startButton.x = sceneWidth / 2 - startButton.width / 2;
    startButton.y = sceneHeight - 250;
    startButton.interactive = true;
    startButton.buttonMode = true;
    startButton.on("pointerup", startGame);
    startButton.on("pointerover", (e) => (e.target.alpha = 0.7));
    startButton.on("pointerout", (e) => (e.currentTarget.alpha = 1.0));
    startScene.addChild(startButton);

    // Set up a game scene.
    let textStyle =
    {
      fill: 0xffffff,
      fontSize: 25,
      fontFamily: "Afial",
      stroke: 0xff0000,
      strokeThickness: 4,
    };

    // Make a score label.
    scoreLabel = new PIXI.Text(" ", textStyle);
    scoreLabel.x = 30;
    scoreLabel.y = 20;
    gameScene.addChild(scoreLabel);

    // Make a jump Label.
    jumpLabel = new PIXI.Text(" ", textStyle)
    jumpLabel.x = 460;
    jumpLabel.y = 20;
    gameScene.addChild(jumpLabel);

    // 3 - set up `gameOverScene`
    // 3A - make game over text
    let gameOverText = new PIXI.Text(`Game Over!`, {
      fill: 0xFFC0CB,
      fontSize: 60,
      fontFamily: "Arial",
      stroke: 0x000000,
      strokeThickness: 6,
    });
    gameOverText.x = sceneWidth / 2 - gameOverText.width / 2;
    gameOverText.y = sceneHeight / 2 - 160;
    gameOverScene.addChild(gameOverText);

    scoreText = new PIXI.Text(`Your final score: ${score}`, {
      fill: 0xffffff,
      fontSize: 24,
      fontFamily: "Arial",
      stroke: 0xff0000,
      strokeThickness: 6,
    });
    scoreText.x = sceneWidth / 2 - scoreText.width / 2 + 40;
    scoreText.y = sceneHeight / 2 + 50;
    gameOverScene.addChild(scoreText);
  }
}

// Create key down function to check if key is down and store
// the key.
function keysDown(e)
{
  // Debug to check in console.
  // console.log(e.code);

  // Save the key string in keys and set it value to true.
  keys[e.code] = true;
}

// Create key down function to check if key is up and store
// the key.
function keysUp(e)
{
  // Debug to check in console.
  // console.log(e.code);

  // Save the key string in keys and set it value to false.
  keys[e.code] = false;
}

// Create a gameloop function.
function gameLoop()
{
  // If the game is paused end the function.
  if(paused)
  {
    return;
  }

  // Calculate the delta time.
  let dt = 1 / app.ticker.FPS;
  
  // If the delta time surpasses 1 / 12 set it to 1 / 12.
  // For constant delta time limit.
  if(dt > 1 / 12)
  {
    dt = 1 / 12;
  }

  // Update the rain movememt and check with leave collusion.
  rainDrop.move(keys, leafArray, dt);

  // Update the leave falling.
  for(let i = 0; i < 10; i++)
  {
    leafArray[i].moveUpdate(dt)
  }

  // If the rain drop touches the ground reduce score by 1.
  if(rainDrop.checkFloorCollusion())
  {
    // Reduce the score by 1.
    increaseScoreBy(-1);
  }
  else
  {
    // Increase the score by time.
    increaseScoreBy(dt);
  }

  // Print out the number of jumps left.
  Jumpleft();

  // If the jump is less or equal to zero.
  if(rainDrop.JumpLeft() === 0)
  {
    // Call the end game.
    end();
  }
}

// Create a start game
function startGame()
  {
    startScene.visible = false;
    gameOverScene.visible = false;
    gameScene.visible = true;
    rainDrop.x = 300;
    rainDrop.y = 200;
    score = 10;
    jumpCount = 25;
    paused = false;
  }

// Create a increase score by function.
function increaseScoreBy(value)
{
  score += value;
  scoreLabel.text = `Score:   ${Math.floor(score)}`;
}

function Jumpleft()
{
  jumpLabel.text = `Jump:   ${rainDrop. JumpLeft()}`
}
// Create a increase jump by function.
// function increaseJumpBy(value)
// {
//   score += value;
//   scoreLabel.text = `Score:   ${score}`;
// }

// Create an end game function.
function end()
{
  // Pause the game.
  paused = true;

  // Disable the one click event.
  app.view.oneClick = null;

  scoreText.text = `Your final score: ${Math.floor(score)}`;
  
  // Hide the game over scene change.
  gameOverScene.visible = true;
  gameScene.visible = false; 
}
