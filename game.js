let game = {
  context: null,
  width: document.querySelector("#mycanvas").getAttribute("width"),
  height: document.querySelector("#mycanvas").getAttribute("height"),
  platform: null,
  ball: null,
  sprites: {
    background: null,
    ball: null,
    platform: null
  },
  init() {
    this.context = document.querySelector("#mycanvas").getContext("2d");
  },
  preload(callback) {
    let loadedSprites = 0;
    let requiredSprites = Object.keys(this.sprites).length;

    for (let key in this.sprites) {
      this.sprites[key] = new Image();
      this.sprites[key].src = "img/" + key + ".png";

      // Checking up that all images are loaded, and only then run a game
      this.sprites[key].addEventListener("load", () => {
        ++loadedSprites;
        if (loadedSprites >= requiredSprites) {
          callback();
        }
      });
    }
  },
  run() {
    window.requestAnimationFrame(() => {
      this.render();
    });
  },
  render() {
    this.context.drawImage(this.sprites.background, 0, 0);
    // The first frame of the animation.
    this.context.drawImage(this.sprites.ball, 0, 0, this.ball.width, this.ball.height, this.ball.x, this.ball.y, this.ball.width, this.ball.height);
    this.context.drawImage(this.sprites.platform, this.platform.x, this.platform.y);
  },
  start() {
    this.init();
    this.preload(() => {
      this.run();
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
  x: game.width / 2 - 125,
  y: game.height - 45,
}

window.addEventListener("load", () => {
  game.start();
});
