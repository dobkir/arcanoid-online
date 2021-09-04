game.ball = {
  dx: 0,
  dy: 0,
  frame: 0,
  velocity: 6,
  x: game.width / 2 - 20,
  y: game.height - 85,
  width: 40,
  height: 40,
  start() {
    this.dy = -this.velocity;
    // The random movement of a ball along the x-axis
    this.dx = game.random(-this.velocity, this.velocity);
    // this.animate();
  },
  animate() {
    setInterval(() => {
      ++this.frame;
      if (this.frame > 3) {
        this.frame = 0;
      }
    }, 100);
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
    const canvasLeftSide = 0;
    const canvasRightSide = game.width;
    const canvasTopSide = 0;
    const canvasBottomSide = game.height;

    if (ballLeftSide < canvasLeftSide) {
      this.x = 0;
      this.dx = this.velocity;
      game.sounds.bump.play();
    } else if (ballRightSide > canvasRightSide) {
      this.x = canvasRightSide - this.width;
      this.dx = -this.velocity;
      game.sounds.bump.play();
    } else if (ballTopSide < canvasTopSide) {
      this.y = 0;
      this.dy = this.velocity;
      game.sounds.bump.play();
    } else if (ballBottomSide > canvasBottomSide) {
      // ========================= LOSING ========================= //
      this.velocity = 0;
      game.sounds.bump.pause();
      game.sounds.fail.play();
      const fail = game.endGame(game.modalLosing);
      return fail;
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
    if (platform.dx) {
      this.x += platform.dx;
    }
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
};
