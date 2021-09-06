const CANVAS = document.querySelector(".canvas");
const HELP = document.querySelector(".help");

const KEYS = {
  ESCAPE: 27,
  SPACE: 32,
  LEFT: 37,
  RIGHT: 39,
  H: 72,
  P: 80
};

const game = {
  running: true,
  pause: false,
  context: null,
  width: CANVAS.getAttribute("width"),
  height: CANVAS.getAttribute("height"),
  level: null,
  platform: null,
  ball: null,
  score: 0,
  blocks: [],
  rows: 0,
  columns: 0,
  sprites: {
    background: null,
    ball: null,
    platform: null,
    block: null,
  },
  sounds: {
    bump: null,
    hit: null,
    fail: null,
    victory: null,
  },

  initCanvasSize() {
    let realWidth = window.innerWidth * window.devicePixelRatio;
    let realHeight = window.innerHeight * window.devicePixelRatio;
    let maxHeight = this.height;
    let maxWidth = this.width;
    /* 
     *  Always fully fit the width
     *  It means that the final width is maxWidth, then the proportion is fair:
     *  realWidth / realHeight
     *  maxWidth / resultHeight
     *  resultHeight = maxWidth * realHeight / realWidth
     *  Round down and cut off everything above maxWidth
     */
    this.height = Math.min(Math.floor(maxWidth * realHeight / realWidth), maxHeight);
    // responsive variant
    // this.height = Math.floor(maxWidth * realHeight / realWidth);
    CANVAS.width = this.width;
    CANVAS.height = this.height;
    CANVAS.style = "background: url(img/universe_wallpapers.jpg) no-repeat 0 0 / cover;";
  },

  hideMouse() {
    /*
     *  The disappearance of the cursor if it is not used 
     *  for 3 seconds after the last click or moving
     */
    let mouseTimer = null, cursorVisible = true;

    function disappearCursor() {
      mouseTimer = null;
      document.body.style.cursor = "none";
      cursorVisible = false;
    }

    document.onmousemove = function () {
      if (mouseTimer) {
        window.clearTimeout(mouseTimer);
      }
      if (!cursorVisible) {
        document.body.style.cursor = "default";
        cursorVisible = true;
      }
      mouseTimer = window.setTimeout(disappearCursor, 3000);
    };
  },

  setLevel() {
    function chooseLevel(event) {
      if (event.target.name === "modalChooseButton") {
        this.level = event.target.value;
        this.startGame();
        document.body.removeEventListener("click", chooseLevel);
      };
    };
    !this.level && document.body.addEventListener("click", chooseLevel.bind(game));
  },

  setLevelSettings() {
    this.setLevel();
    this.modalWindow.content = this.modalChoosingLevel;
    !this.level && this.modalWindow.openModal();

    if (this.level === "beginner") {
      this.rows = 4;
      this.columns = 8;
      this.ball.velocity = 4;
      this.modalWindow.closeModal();
    } else if (this.level === "gamer") {
      this.rows = 5;
      this.columns = 10;
      this.ball.velocity = 6;
      this.modalWindow.closeModal();
    } else if (this.level === "professional") {
      this.rows = 7;
      this.columns = 11;
      this.ball.velocity = 8;
      this.platform.velocity = 8;
      this.modalWindow.closeModal();
    }
  },

  init() {
    this.setLevelSettings();
    this.hideMouse();
    this.context = CANVAS.getContext("2d");
    this.initCanvasSize();
    this.setTextFont();
    this.level && this.setEvents();
    // Open Help by clicking on "?" icon
    HELP.addEventListener("click", this.clickToOpenHelp.bind(game));
    this.keysHelpModal();
  },

  setTextFont() {
    this.context.font = "28px Arial";
    this.context.fillStyle = "#FFFFFF";
  },

  setEvents() {
    // Moving the platform
    window.addEventListener("keydown", e => {
      if (e.keyCode === KEYS.SPACE) {
        this.platform.startBall();
      } else if (e.keyCode === KEYS.LEFT || e.keyCode === KEYS.RIGHT) {
        this.platform.start(e.keyCode);
      }
    });
    // Stop the platform
    window.addEventListener("keyup", e => {
      this.platform.stop();
    });
    // Paused and unpaused the game
    window.addEventListener("keydown", e => {
      if (!this.pause && !this.modalWindow.content && e.keyCode === KEYS.P) {
        this.pausedGame();
      } else if (this.pause && this.modalWindow.content && (e.keyCode === KEYS.P || e.keyCode === KEYS.ESCAPE)) {
        this.unpausedGame();
      }
    });
    this.keysHelpModal();
  },

  preload(callback) {
    let loadedSprites = 0;
    let loadedSounds = 0;
    let requiredResourses = Object.keys(this.sprites).length;
    requiredResourses += Object.keys(this.sounds).length;

    // Checking up that all sprites and sounds are loaded, and only then run a game
    let onResourceLoad = () => {
      ++loadedSprites;
      ++loadedSounds;
      if (loadedSprites && loadedSounds >= requiredResourses) {
        callback();
      }
    };
    this.preloadSprites(onResourceLoad);
    this.preloadAudio(onResourceLoad);
  },

  preloadSprites(onResourceLoad) {
    for (let key in this.sprites) {
      this.sprites[key] = new Image();
      this.sprites[key].src = "img/" + key + "_" + this.level + ".png";
      this.sprites[key].addEventListener("load", onResourceLoad);
    }
  },

  preloadAudio(onResourceLoad) {
    for (let key in this.sounds) {
      this.sounds[key] = new Audio("sounds/" + key + ".mp3");
      this.sounds[key].addEventListener("canplaythrough", onResourceLoad, { once: true });
    }
  },

  createBlocksArea() {
    this.ball.x = this.width / 2 - 20;
    this.ball.y = this.height - 85;
    this.platform.x = this.width / 2 - 125;
    this.platform.y = this.height - 45;

    for (let row = 0; row < this.rows; row++) {
      for (let column = 0; column < this.columns; column++) {
        this.blocks.push({
          active: true,
          width: 112,
          height: 40,
          x: 114 * column + ((this.width - 114 * this.columns) / 2),
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
    this.collideBallAndBlocks();
    this.collideBallAndPlatform();
    this.platform.collideCanvasBounds();
    this.platform.move();
    this.ball.collideCanvasBounds();
    this.ball.move();
  },

  addScore() {
    ++this.score;

    // When the counter shows that blocks are ended, finish the game
    // ========================= WINNING ========================= //
    if (this.score >= this.blocks.length) {
      this.sounds.bump.pause();
      this.sounds.victory.play();
      const victory = this.endGame(this.modalWinning);
      return victory;
    }
  },

  collideBallAndBlocks() {
    for (let block of this.blocks) {
      // If the block was not destroyed by the ball, and collide with it, then:
      if (block.active && this.ball.collide(block)) {
        this.ball.bumpBlock(block);
        // When a ball has been colliding the block, add scores in the method addScore()
        this.addScore();
        this.sounds.hit.play();
      }
    }
  },

  collideBallAndPlatform() {
    if (this.ball.collide(this.platform)) {
      this.ball.bumpPlatform(this.platform);
      this.sounds.bump.play();
    }
  },

  renderSprites() {
    // Clear sprites rectangles before each new rendering
    this.context.clearRect(0, 0, this.width, this.height);
    // Rendering of the background
    this.context.drawImage(this.sprites.background, 0, 0);
    // The first frame of the animation.
    this.context.drawImage(this.sprites.ball, this.ball.frame * this.ball.width, 0, this.ball.width, this.ball.height, this.ball.x, this.ball.y, this.ball.width, this.ball.height);
    this.context.drawImage(this.sprites.platform, this.platform.x, this.platform.y);
    this.renderBlocksArea();
    this.context.fillText("Score: " + this.score, 70, 46);
  },

  runGame() {
    // When running is true, it means that the game is running
    if (this.running) {
      // Calls itself recursively for each frame of the animation.
      window.requestAnimationFrame(() => {
        this.updateSprites();
        this.renderSprites();
        this.runGame();
      });
    }
  },

  openHelpTutorial() {
    this.running = false;
    this.pause = true;
    this.modalWindow.content = this.modalHelpTutorial;
    this.modalWindow.openModal();
    document.body.addEventListener("click", this.closeModalWindow.bind(game));
    HELP.addEventListener("click", this.clickToCloseHelp.bind(game));
  },

  closeHelpTutorial() {
    this.modalWindow.closeModal();
    this.pause = false;
    this.running = true;
    this.runGame();
  },

  startGame() {
    this.init();
    this.preload(() => {
      this.createBlocksArea();
      this.runGame();
    });
  },

  pausedGame() {
    this.running = false;
    this.pause = true;
    this.modalWindow.content = this.modalGamePaused;
    this.modalWindow.openModal();
  },

  unpausedGame() {
    this.modalWindow.closeModal();
    this.pause = false;
    this.running = true;
    this.runGame();
  },

  clearParameters() {
    this.platform = game.platform;
    this.ball = game.ball;
    this.score = 0;
    this.blocks = [];
    this.rows = 0;
    this.columns = 0;
  },

  endGame(messageType) {
    if (!this.modalWindow.content && this.running) {
      this.modalWindow.content = messageType;
      this.modalWindow.openModal();
      this.running = false;

      document.body.addEventListener("click", this.confirmEndGame.bind(game));
    }
  },

  restartLevel() {
    this.clearParameters();

    if (this.level === "beginner") {
      this.rows = 4;
      this.columns = 8;
      this.ball.velocity = 4;
    } else if (this.level === "gamer") {
      this.rows = 5;
      this.columns = 10;
      this.ball.velocity = 6;
    } else if (this.level === "professional") {
      this.rows = 7;
      this.columns = 11;
      this.ball.velocity = 8;
      this.platform.velocity = 8;
    }

    this.preload(() => {
      this.createBlocksArea();
      this.runGame();
    });

    this.running = true;
  },

  reloadGame() {
    this.running = false;
    window.location.reload();
  },

  confirmEndGame(event) {
    if (event.target.value === "mainMenu") {
      this.reloadGame();
    } else if (event.target.value === "restartLevel") {
      this.modalWindow.closeModal();
      this.restartLevel();
    }
    document.body.removeEventListener("click", this.confirmEndGame);
  },

  closeModalWindow(event) {
    if (this.level && this.modalWindow.content && event.target.value === "closeModal") {
      this.modalWindow.closeModal();
      this.pause = false;
      this.running = true;
      this.runGame();
    } else if (!this.level && this.modalWindow.content === this.modalHelpTutorial) {
      this.modalWindow.closeModal();
      this.modalWindow.content = this.modalChoosingLevel;
      this.modalWindow.openModal();
    }
    document.body.removeEventListener("click", this.closeModalWindow);
  },

  keysHelpModal() {
    // Open and close Help Tutorial
    window.addEventListener("keydown", e => {
      if (this.level && !this.pause && !this.modalWindow.content && e.keyCode === KEYS.H) {
        this.openHelpTutorial();
      } else if ((this.modalWindow.content === this.modalGamePaused || this.modalWindow.content === this.modalChoosingLevel) && e.keyCode === KEYS.H) {
        this.modalWindow.closeModal();
        this.modalWindow.content = this.modalHelpTutorial;
        this.modalWindow.openModal();
      } else if (this.level && (this.modalWindow.content === this.modalHelpTutorial) && (e.keyCode === KEYS.H || e.keyCode === KEYS.ESCAPE)) {
        this.closeHelpTutorial();
      } else if (!this.level && (this.modalWindow.content === this.modalHelpTutorial) && (e.keyCode === KEYS.H || e.keyCode === KEYS.ESCAPE)) {
        this.closeModalWindow();
      }
    });
  },

  clickToOpenHelp(event) {
    event.preventDefault();
    event.stopPropagation();
    document.body.addEventListener("click", this.closeModalWindow.bind(game));
    if (!this.pause && !this.modalWindow.content && event.target.classList.contains("help")) {
      this.openHelpTutorial()
    } else if (this.modalWindow.content && this.modalWindow.content !== this.modalHelpTutorial && event.target.classList.contains("help")) {
      this.modalWindow.closeModal();
      this.modalWindow.content = this.modalHelpTutorial;
      this.modalWindow.openModal();
    }
    HELP.addEventListener("click", this.clickToCloseHelp.bind(game));
    HELP.removeEventListener("click", this.clickToOpenHelp);
  },

  clickToCloseHelp(event) {
    if (this.level && this.modalWindow.content === this.modalHelpTutorial && event.target.classList.contains("help")) {
      this.closeHelpTutorial();
    } else if (!this.level && this.modalWindow.content === this.modalHelpTutorial && event.target.classList.contains("help")) {
      this.closeModalWindow();
    }
    HELP.addEventListener("click", this.clickToOpenHelp.bind(game));
    HELP.removeEventListener("click", this.clickToCloseHelp);
  },

  random(min, max) {
    // Get a random integer in a given range
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
};

window.addEventListener("load", () => {
  game.init();
});
