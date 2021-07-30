game.platform = {
  velocity: 6,
  dx: 0,
  x: game.width / 2 - 125,
  y: game.height - 45,
  width: 251,
  height: 41,
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
  },
  collideCanvasBounds() {
    // Change of coordinates on next render
    const x = this.x + this.dx;

    // Platform sides
    const platformLeftSide = x;
    const platformRightSide = platformLeftSide + this.width;

    // Canvas sides
    const canvasLeftSide = 0;
    const canvasRightSide = game.width;

    if (platformLeftSide < canvasLeftSide || platformRightSide > canvasRightSide) {
      this.dx = 0;
    }
  }
};
