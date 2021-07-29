const KEYS = {
  LEFT: 37,
  RIGHT: 39,
  SPACE: 32
};

const game = {
  context: null,
  width: document.querySelector("#mycanvas").getAttribute("width"),
  height: document.querySelector("#mycanvas").getAttribute("height"),
  platform: null,
  ball: null,
  blocks: [],
  rows: 4,
  columns: 8,
  sprites: {
    background: null,
    ball: null,
    platform: null,
    block: null
  },
  init() {
    this.context = document.querySelector("#mycanvas").getContext("2d");
    this.setEvents();
  },
  setEvents() {
    window.addEventListener("keydown", e => {
      if (e.keyCode === KEYS.SPACE) {
        this.platform.startBall();
      } else if (e.keyCode === KEYS.LEFT || e.keyCode === KEYS.RIGHT) {
        this.platform.start(e.keyCode);
      }
    });
    window.addEventListener("keyup", e => {
      this.platform.stop();
    });
  },
  preload(callback) {
    let loadedSprites = 0;
    const requiredSprites = Object.keys(this.sprites).length;

    // Checking up that all sprites are loaded, and only then run a game
    const onSpriteLoad = () => {
      ++loadedSprites;
      if (loadedSprites >= requiredSprites) {
        callback();
      }
    };

    for (let key in this.sprites) {
      this.sprites[key] = new Image();
      this.sprites[key].src = "img/" + key + ".png";

      // Checking up that all sprites are loaded, and only then run a game
      this.sprites[key].addEventListener("load", onSpriteLoad);
    }
  },

  createBlocksArea() {
    for (let row = 0; row < this.rows; row++) {
      for (let column = 0; column < this.columns; column++) {
        this.blocks.push({
          active: true,
          width: 111,
          height: 39,
          x: 113 * column + ((this.width - 113 * this.columns) / 2),
          y: 42 * row + ((this.height - 42 * this.rows) / 2)
        });
      }
    }
  },

  renderBlocksArea() {
    for (let block of this.blocks) {
      // If the block was not destroyed by the ball, then render it.
      if (block.active) {
        this.context.drawImage(this.sprites.block, block.x, block.y);
      }
    }
  },

  updateSprites() {
    this.platform.move();
    this.ball.move();
    this.ball.collideCanvasBounds();
    this.collideBlocks();
    this.collidePlatform();
  },

  collideBlocks() {
    for (let block of this.blocks) {
      // If the block was not destroyed by the ball, and collide with it, then:
      if (block.active && this.ball.collide(block)) {
        this.ball.bumpBlock(block);
      }
    }
  },

  collidePlatform() {
    if (this.ball.collide(this.platform)) {
      this.ball.bumpPlatform(this.platform);
    }
  },

  renderSprites() {
    // Clear sprites rectangles before each new rendering
    this.context.clearRect(0, 0, this.width, this.height);
    // Rendering of the background
    this.context.drawImage(this.sprites.background, 0, 0);
    // The first frame of the animation.
    this.context.drawImage(this.sprites.ball, 0, 0, this.ball.width, this.ball.height, this.ball.x, this.ball.y, this.ball.width, this.ball.height);
    this.context.drawImage(this.sprites.platform, this.platform.x, this.platform.y);
    this.renderBlocksArea();
  },

  runGame() {
    window.requestAnimationFrame(() => {
      this.updateSprites();
      this.renderSprites();
      this.runGame();
    });
  },

  startGame() {
    this.init();
    this.preload(() => {
      this.createBlocksArea();
      this.runGame();
    });
  },

  random(min, max) {
    // Get a random integer in a given range
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
};

game.ball = {
  velocity: 3,
  dx: 0,
  dy: 0,
  x: game.width / 2 - 20,
  y: game.height - 85,
  width: 40,
  height: 40,
  start() {
    this.dy = -this.velocity;
    // The random movement of a ball along the x-axis
    this.dx = game.random(-this.velocity, this.velocity);
  },
  move() {
    if (this.dy) {
      this.y += this.dy;
    }
    // The random movement of a ball along the x-axis
    if (this.dx) {
      this.x += this.dx;
    }
  },
  collide(element) {
    // Change of coordinates on next render
    const x = this.x + this.dx;
    const y = this.y + this.dy;

    // Checking the collision event of the ball and the block
    if (x + this.width > element.x &&
      x < element.x + element.width &&
      y + this.height > element.y &&
      y < element.y + element.height) {
      return true;
    }
    return false;
  },
  // The handler of a colliding ball with canvas bounds
  collideCanvasBounds() {
    // Change of coordinates on next render
    const x = this.x + this.dx;
    const y = this.y + this.dy;

    // Ball sides
    const ballLeftSide = x;
    const ballRightSide = ballLeftSide + this.width;
    const ballTopSide = y;
    const ballBottomSide = ballTopSide + this.height;

    // Canvas sides
    const canvasRightSide = game.width;
    const canvasTopSide = 0;
    const canvasBottomSide = game.height;
    const canvasLeftSide = 0;

    if (ballLeftSide < canvasLeftSide) {
      this.x = 0;
      this.dx = this.velocity;
    } else if (ballRightSide > canvasRightSide) {
      this.x = canvasRightSide - this.width;
      this.dx = -this.velocity;
    } else if (ballTopSide < canvasTopSide) {
      this.y = 0;
      this.dy = this.velocity;
    } else if (ballBottomSide > canvasBottomSide) {
      alert("Вы проиграли");
    }
  },
  // Bumping the ball off the block
  // Here I reverse a movement by the y-axis direction of the ball. 
  // In this case, the angle of movement is also mirrored to the opposite angle.
  bumpBlock(block) {
    this.dy *= -1;
    // When the ball hits a block, the block must be destroyed
    block.active = false;
  },
  // Bumping the ball off the platform
  bumpPlatform(platform) {

    // If the ball moving up, bumpPlatform() shouldn't act
    if (this.dy > 0) {
      // Here I reverse a movement by the y-axis direction of the ball. 
      // In this case, the angle of movement is also mirrored to the opposite angle.
      this.dy = -this.velocity;;
      // The further from the center is the collision of the ball, 
      // and the platform occurs, then the sharper the angle of rebound.

      // The coordinates of the point where the ball touches a platform
      let touchX = this.x + this.width / 2;
      // Offset on the x-axis to obtain the correct bounce angle of the ball from the platform
      this.dx = this.velocity * platform.getTouchOffset(touchX);
    }
  }
}


game.platform = {
  velocity: 6,
  dx: 0,
  width: 251,
  height: 41,
  x: game.width / 2 - 125,
  y: game.height - 45,
  ball: game.ball,
  startBall() {
    // if a ball on the platform
    if (this.ball) {
      // then activate start() function
      this.ball.start();
      // and there is no ball on the platform now
      this.ball = null;
    }
  },
  start(direction) {
    if (direction === KEYS.LEFT) {
      this.dx = -this.velocity;
    } else if (direction === KEYS.RIGHT) {
      this.dx = this.velocity;
    }
  },
  stop() {
    this.dx = 0;
  },
  move() {
    if (this.dx) {
      this.x += this.dx;
      // When a ball is on the platform, then they moving together.
      if (this.ball) {
        this.ball.x += this.dx;
      }
    }
  },
  // Offset on the x-axis to obtain the correct bounce angle of the ball
  getTouchOffset(x) {
    let diff = (this.x + this.width) - x;
    let offset = this.width - diff;
    let result = 2 * offset / this.width;
    return result - 1;
  }
}

window.addEventListener("load", () => {
  game.startGame();
});
