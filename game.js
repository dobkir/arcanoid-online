let game = {
  context: null,
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

      // Checking up that all images are loaded
      // And only if all images are loaded, run a game
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
    this.context.drawImage(this.sprites.ball, 0, 0);
    this.context.drawImage(this.sprites.platform, 0, 0);
  },
  start() {
    this.init();
    this.preload(() => {
      this.run();
    });
  }
};

window.addEventListener("load", () => {
  game.start();
});
