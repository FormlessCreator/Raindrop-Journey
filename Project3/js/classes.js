// Create and add ship class.
class Raindrop extends PIXI.Graphics
{
    constructor(radius, color = 0x87CEEB, x = 0, y = 0, bounceAmount = 10)
    {
      super();

      // Set the fill color, border and draw the circle.
      this.beginFill(color);
      this.lineStyle(6, 0x000);
      this.drawCircle(0, 0, radius);
      this.endFill();

      // Set the position of the circle.
      this.x = x;
      this.y = y;
      this.radius = radius;

      // Other variables:
      this.xMovePosition = 0;
      this.yMovePosition = 0;
      this.isAlive = true;
      
      // Special variables that can be used as a power up.
      this.speed = 40;
      this.bounceStrenght = 0;
      this.bounceHeight = 100;
      this.bounceAmount = bounceAmount;
      this.onLeaf = false;
      this.canWrap = false;
      this.timer = 1;

      // --> Normal gravity.
      this.gravityEffect = 150;

      // Power Up limits.
      this.speedMin = 1;
      this.speedMax = 10;
      this.bounceAmountMaxLimit = 200;
      this.bounceAmountMinLimit = 100;
      this.bounceStrenghtLimit = 1;
      this.gravityMaxEffect = 300;
      this.gravityMinEffect = 150;
    }

    // Create a method that moves the object based on 
    // the player input of left, right and space.
    // Check for leave collusion
    move(keys, leafArray, dt = 1 / 12)
    {
      // Check with console.log();
      // console.log("Rain drop move() is called");
      // console.log("Raindrop position:", this.x, this.y);
      // console.log("Velocity:", this.velocityX, this.velocityY);
      // console.log("Keys pressed:", keys);
      // console.log("deltaTime", dt);
      // console.log("Timer", this.timer);

      // Get the lerp time.
      let at = 6 * dt;

      // Add delta time to the timer.
      this.timer += dt;

      // If the timer is greater than 1 set it to 1.
      if(this.timer >= 1)
      {
        this.timer = 1;
      }

      // Use the timer to keep track of jump intervals.
      
      /* If the keys is "KeyA" or "ArrowLeft"
       * set the xMovePosition to move with:
       * Speed and delta time in the left(-1) x direction. */
      if(keys["KeyA"] || keys["ArrowLeft"])
      {
        this.xMovePosition += -1 * this.speed * dt;
      }

      /* If the keys is "KeyD" or "ArrowRight"
       * set the xMovePosition to move with:
       * Speed and delta time in the right(1) x direction. */
      if(keys["KeyD"] || keys["ArrowRight"])
      {
        this.xMovePosition += 1 * this.speed * dt;
      }

      /* If the keys is "KeyW" or "Space" or "ArrowUp" set the
       * set the yMovePosition to move with:
       * bounce height, strenght, speed and delta time. 
       * If the amount of bounce is greater than 0 */
      if((keys["KeyW"] || keys["Space"] || keys["ArrowUp"]) && this.bounceAmount > 0 && this.timer >= 1)
      {
        // If the jump occured start timer.
        // Set timer to 0.
        this.timer = 0;

         // Set the y move position with bounce.
         this.yMovePosition += -this.bounceHeight * this.speed * dt;

         // Reduce the bounce amount by 1.
         this.bounceAmount--;
      }
      else
      {
          // Else the y move position is 0.
          this.yMovePosition = 0;
      }

      // Add the new y move position to the y position.
      this.y += this.yMovePosition;

      // Make it so that gravity over time is always acting on the
      // If the raindrop is not the leaf, apply gravity
      if(!this.onLeaf)
      {
        this.y += this.gravityEffect * dt;
      }

      // Set the x move position with the x position.
      this.x += this.xMovePosition;

      /* Clamp the y position so it does no exceed the app
       * view height. */
      this.ClampPosition();

      // Check if the rain drop is colliding with a leaf.
      this.leafCollusion(leafArray);
    }

    /* Create a clamp Y position so that the raindrop will 
     * never exceed the app view height. */
    ClampPosition()
    {
      /* Check for the rain drop height with radius and app
       * view height if it exceeds downward. */
      if(this.y > app.view.height - this.radius - 38)
      {
        // Set the y to the height - the radius.
        this.y = app.view.height - this.radius - 100;
      }

      /* Check for the rain drop height with radius and app
       * view height if it exceeds upward. */
      // If the y position is less than its unchanging radius.
      if(this.y < this.radius)
      {
        this.y = this.radius;
      }

      if(this.canWrap)
      {
          // Call the space wrap method.
          this.spaceWrapping();
      }
      else
      {
        /* Check for the rain drop weight with radius and app
         * view width. */
      // If the x position is less than its unchanging radius.
      if(this.x < this.radius + 25)
        {
          this.x = this.radius + 25;
        }
  
        /* Check for the rain drop weight with radius and app
         * view width. */
        // If the x position is > than its app view width - r.
        if(this.x > app.view.width - this.radius - 25)
        {
          this.x = app.view.width - this.radius - 25;
        }
      }
    }

    // Create a collusion method that check for raindrop's
    // collusion for all leaf object.
    leafCollusion(leafArray)
    {
      // Check.
      // console.log("Checking leaf collusion");

      // For each leaf check.
      leafArray.forEach(leaf => {
        if(this.CheckCollusion(leaf))
        {
          // Set the on leaf to true.
          this.onLeaf = true;

          // If on leaf is true set the raindrop at the middle of the leaf.
          this.y =  leaf.y - this.radius / 2;
        }
        else
        {
          this.onLeaf = false;
        }
      });
    }

    // Check if ball is touching the floor.
    checkFloorCollusion()
    {
      /* Check for the rain drop height with radius and app
       * view height if it exceeds downward. */
      if(this.y > app.view.height - this.radius - 40)
        {
          // Return true.
          return true;
        }
        
      // Else return false.
      return false;
    }

    // Create a check for collusion with a leaf.
    CheckCollusion(leaf)
    {
      // If the rain x + radius is greater the leaf x.
      // and less than the leaf.
      if(this.x + this.radius >= leaf.x && 
        this.x + this.radius < leaf.x + leaf.width &&
        this.y + this.radius > leaf.y &&
        this.y - this.radius < leaf.y + leaf.height - 60) // - 60 to make rain drop appears closer to leaf for collusion.
        {
          // Return true.
          return true;
        }
        else
        {
          // Return false.
          return false;
        }
    }

    // Create a method to increase or decrease jump amount.
    Jump(jumpCount)
    {
      this.jump += jumpCount;
    }

    // Create a method that increase returns the amount of jump count left.
    JumpLeft()
    {
      return this.bounceAmount;
    }

    // Create a method to keep track of 

    // Create a method for normal screen wrapping if power
    // up is taken.
    spaceWrapping()
    {
      // If the drop is going out of bounds for the right side.
      if(this.x > app.view.width + radius && 
        this.xMovePosition > 0)
      {
        this.x = 0 - this.radius;
      }

      if(this.x < 0 - this.radius && 
        this.xMovePosition < 0)
      {
        this.x = app.view.width + radius;
      }
    }

    // ------> If I have more time. [Overscope]
    // Create a method that wraps the player to the nearest
    // teleport the player to the nearest leaf above player.
    // Using the leaf array.
    // teleportToNearestLeaf(leafArray)
    // {

    // }

    // Create a power up method that increases the raindrop
    // speed but it does not exceed speed max.
    increaseSpeed()
    {
      // Increase the speed but clamp it down by the max speed.
      this.speed = Math.min(this.speedMax, this.speed + 1);
    }

    // Create a power down method that decreases the raindrop
    // speed it is not less than speed min.
    decreaseSpeed()
    {
      this.speed = Math.max(this.speedMin, this.speed - 1);
    }

    // Create a power up method that increases the raindrop 
    // bounce height. by 1 but do not exceed limits.
    // it is not lower than 30.
    increaseBounceHeight()
    {
      this.bounceHeight = Math.min(30, this.bounceHeight + 1);
    }

    // Create a power up method that decrease the raindrop 
    // bounce height but is not less than 20.
    decreaseBounceHeight()
    {
      this.bounceHeight = Math.max(20, this.bounceHeight - 1);
    }

    // Create a power down method that increase the gravity 
    // of the raindrop by 1 but is not greater than 14.
    increaseGravity()
    {
      this.gravityEffect = Math.min(this.gravityMaxEffect, this.gravityEffect + 1);
    }

    // Create a power down method that decrease the gravity 
    // of the raindrop by 1.5. but not less than 6.
    decreaseGravity()
    {
      this.gravityEffect = Math.max(this.gravityMinEffect, this.gravityEffect - 1);
    }

    // Create a power up method that increases the raindrop 
    // bounce amount by 1.
    increaseBounceAmount()
    {
      this.bounceAmount += 1;
    }
}

// ***************************************************
// -------- Less time not implemented -->
// Create one power up class that changes it fill color,
// border color, falling speed, letter based on its type.

// --> Increase / decrease raindrop speed:
// Color: Green / Red.
// Letter: S+ / S-.

// --> Increase / decrease raindrop bounce height:
// Color: Blue / Yellow
// Letter: H+ / H-.

// --> Increase / decrease raindrop bounce amount:
// Color: Magenta / Cyan
// Letter: A+ / A-.

// --> Increase / decrease raindrop bounce gravity:
// Color: Orange / Purple.
// Letter: G+ / G-.

class PowerUP extends PIXI.Graphics
{
  constructor(type, radius, x = 0, y = 0)
  {
    this.type = type;
    this.radius = radius;
    this.x = x;
    this.y = y;
    this
    this.fallingSpeed = 3 + (Math.random() * 2);
    this.isAlive = true;

    /* I need to make a power up that changes based on type.
       I researched online and also asked Chat-Gpt how to do
       so:
       It told me to create a method that clears the previous
       drawing of the power up and create a method that changes
       it properties based on type.
       I am thinking of adding different letters and colors 
       to based on the type I pass in the the class.
    */ 
    
    // Call the methods:
    // Change the properties based the type first.
    this.changePropertiesBasedOnType();

    // Draw the circle for the power up.
    this.drawPowerup();
  }

  // This method changes some properties based on it type.
  changePropertiesBasedOnType()
  {
    // Create a switch method that pass in type.
    switch(this.type)
    {
      case "speed+":
        this.fillColor = 0x00ff00; // Green
        this.borderColor = 0x004400;
        this.letter = "S+";
        break;

        case "speed-":
        this.fillColor = 0xff0000; // Red
        this.borderColor = 0x440000;
        this.letter = "S-";
        break;

      case "height+":
        this.fillColor = 0x0000ff; // Blue
        this.borderColor = 0x000044;
        this.letter = "H+";
        break;
      case "height-":
        this.fillColor = 0xffff00; // Yellow
        this.borderColor = 0x444400;
        this.letter = "H-";
        break;

      case "bounceAmount+":
        this.fillColor = 0xff00ff; // Magenta
        this.borderColor = 0x440044;
        this.letter = "A+";
        break;

      case "bounceAmount-":
        this.fillColor = 0x00ffff; // Cyan
        this.borderColor = 0x004444;
        this.letter = "A-";
        break;

      case "gravity+":
        this.fillColor = 0xFFA500; // Orange
        this.borderColor = 0xFF4500;
        this.letter = "G+";
        break;

      case "gravity-":
        this.fillColor = 0x800080; // Purple
        this.borderColor = 0x4B0082;
        this.letter = "G-";
        break;

      default:
        this.fillColor = 0xffffff;
        this.borderColor = 0x000000;
        this.letter = "?";
    }
  }

  // This method clears the previous drawn data and draw a new 
  // circle.
  drawPowerup()
  {
    this.clear();

    // Draw circle with borders.
    this.lineStyle(3, this.borderColor);
    this.beginFill(this.fillColor);
    this.drawCircle(0, 0, this.radius);
    this.endFill();

    // Create a letter and attach it to the circle.
    const text = new PIXI.Text(this.letter,
      {
        fontFamily: "Arial",
        fontSize: 20,
        fill: 0x000000,
        align: "center",
      }
    );

    // Attach the text to the power up.
    text.anchor.set(0.5);
    this.addChild(text);
  }

  // This method moves the power up down. 
  move(dt = 1 / 12)
  {
    this.y += this.fallingSpeed * dt;

    // If the power up goes below the screen make it appear 
    // at a random x position at the top of the screen.
    if(this.y > app.view.width)
    {
      // Set the x to a random x position with the screen.
      let newX = Math.round(20 + (Math.random() * app.view.width - 40));
      let newY = 20;

      // Set the power up x and y.
      this.x = newX;
      this.y = newY;
    }
  }

  // Create a collusion with the rain drop.
  CheckCollusionWithRain(rain)
  {
    // Find the distance formula.
    let squareOfX = Math.pow(rain.x - this.x);
    let squareOfY = Math.pow(rain.y - this.y);
    let sumOfXandY = squareOfX + squareOfY;
    let distance = Math.sqrt(sumOfXandY);

    // Find the sum of the radius.
    let sumOfRadius = rain.radius + this.radius;

    // As both are circles.
    // If the sum of the radius is greater than the distance.
    if(sumOfRadius >= distance)
    {
      // Set the is alive to false.
      this.isAlive = false;

      // Return true.
      return true;
    }

    // Else return false.
    return false;
  }

}

// *****************************************************
// -------- If time allows me ---------->
// -------- Less time not implemented -->

// Create a Circle power up that changes it color each second.
// --> Teleport above leaf.
// Color: Random each second.
// Letter: T++.

// Create a morphing type power up.
// --> Screen wrapping.

// Color: Black
// Letter: M++.

// *****************************************************
// Create Leaf class with leaf PIXI Sprite.
class Leaf extends PIXI.Sprite
{
  constructor(texture, y = 0, speed = 1)
  {
    super(texture)
    this.anchor.set(0.5);
    this.x = Math.random() * (500 - 100) + 100;
    this.y = y;
    this.xMovePosition = 0;
    this.yMovePosition = speed;
    this.speed = speed;
    this.isAlive = true;
    this.tint = Math.random() * 0xffffff + 1;
    this.collide = true;
  }

  // Create an update so it falls with time.
  moveUpdate(dt = 1 / 12)
  {
    // If the leaf is alive.
    if(this.isAlive === true)
    {
      // Make the leaf fall downward with time.
      this.y += this.yMovePosition * dt;
    }

    // console.log("alive" , this.isAlive);

    // If the leaf it the bottom of the window.
    if(this.y > app.view.height + 20)
    {
      // Set the leaf is alive to false.
      this.isAlive = false;
    }

    // If the leaf is alive is false.  
    if(!this.isAlive)
    {
      // Call the make alive method.
      this.MakeALive();

      console.log("Make alive is called");
    }

    // If the rain drop is on leaf the leaf speed changes
    // randomly each loop.
    // if(this.collide)
    // {
    //   this.speed = Math.random() * (40 - 10) + 10;
    // }
  }

  // Make Alive method that make leaf alive again.
  // Give the leaf a new random x position within screem bounds.
  MakeALive()
  {
    // Create a random new x position.
    let randomX = Math.random() * (500 - 100) + 100;
    
    // Set x postion to new position.
    this.x = randomX;

    // Set the leaf y back to - 20;
    this.y = - 20;

    // Set the leaf to alive.
    this.isAlive = true;
  }
}
