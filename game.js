const KEYS = {
  LEFT: 37,
  RIGHT: 39
};

let game = {
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
      if (e.keyCode === KEYS.LEFT || e.keyCode === KEYS.RIGHT) {
        this.platform.start(e.keyCode);
      }
    });
    window.addEventListener("keyup", e => {
      this.platform.stop();
    });
  },
  preload(callback) {
    let loadedSprites = 0;
    let requiredSprites = Object.keys(this.sprites).length;

    // Checking up that all sprites are loaded, and only then run a game
    let onSpriteLoad = () => {
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
          x: 113 * column + ((this.width - 113 * this.columns) / 2),
          y: 42 * row + ((this.height - 42 * this.rows) / 2)
        });
      }
    }
  },

  renderBlocksArea() {
    for (let block of this.blocks) {
      this.context.drawImage(this.sprites.block, block.x, block.y);
    }
  },

  rerenderSprites() {
    this.platform.move();
  },

  renderingSprites() {
    this.context.drawImage(this.sprites.background, 0, 0);
    // The first frame of the animation.
    this.context.drawImage(this.sprites.ball, 0, 0, this.ball.width, this.ball.height, this.ball.x, this.ball.y, this.ball.width, this.ball.height);
    this.context.drawImage(this.sprites.platform, this.platform.x, this.platform.y);
    this.renderBlocksArea();
  },


  runGame() {
    window.requestAnimationFrame(() => {
      this.rerenderingSprites();
      this.renderSprites();
      this.runGame();
    });
  },

  start() {
    this.init();
    this.preload(() => {
      this.createBlocksArea();
      this.runGame();
    });
  }
};

game.ball = {
  x: game.width / 2 - 20,
  y: game.height - 85,
  width: 40,
  height: 40
}


game.platform = {
  velocity: 6,
  dx: 0,
  x: game.width / 2 - 125,
  y: game.height - 45,
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
      // move a ball whith the platform
      game.ball.x += this.dx;
    }
  }
}

window.addEventListener("load", () => {
  game.start();
});
