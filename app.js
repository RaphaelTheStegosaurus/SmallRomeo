"use strict";
let backgroundTexture;
const ListsSpriteFramePlayer = {
  idle: {
    index: 1,
    frames: 5,
    speed: 8,
    height: 22,
    width: 22,
  },
};
const STILT_HEIGHT_MIN = 0.01;
const STILT_HEIGHT_MAX = 3.0;
const STILT_SIZE_X = 1.5;
const STILT_SHRINK_RATE = 5.0;
// let player;
class Player extends EngineObject {
  constructor(pos, stilt) {
    const tileInfo = new TileInfo(
      vec2(0, 0),
      vec2(
        ListsSpriteFramePlayer.idle.width,
        ListsSpriteFramePlayer.idle.height
      ),
      1
    );
    super(pos, vec2(2, 2), tileInfo);
    this.setCollision();
    this.frame = 0;
    this.animationTimer = 0;
    this.stiltObject = stilt;
    this.respawnPos = pos;
  }
  update() {
    const moveInput = keyDirection();
    this.velocity.x += moveInput.x * (this.groundObject ? 0.1 : 0.01);
    if (moveInput.x < 0) this.mirror = true;
    else if (moveInput.x > 0) this.mirror = false;
    //[ ] arreglar animation con un sprite justo a los sprites
    // this.animate();

    if (this.groundObject && moveInput.y > 0) this.velocity.y = 0.9; // jump
    cameraPos = vec2(this.pos.x, 9);
  }
  animate() {
    const animationData = ListsSpriteFramePlayer.idle;
    const frame = (time * 1) % animationData.frames | 0;
    // this.tileInfo.pos.x = frame;
    // console.log(this.tileInfo);
    this.tileInfo = new TileInfo(
      vec2(frame * 11, 0),
      vec2(animationData.width, animationData.height),
      1
    );
    // while (this.animationTimer > animationData.speed) {
    //   this.animationTimer -= animationData.speed;
    //   this.frame = (this.frame + 1) % animationData.frames;
    //   = this.frame;
    // }
  }
  activateStilts() {
    this.stiltObject.grow();
  }
}
class Level extends EngineObject {
  constructor() {
    super();
    this.createGround();
  }
  createGround() {
    const pos = vec2();
    const tileLayer = new TileCollisionLayer(
      pos,
      vec2(256, 2),
      new TileInfo(vec2(0, 0), vec2(16, 16), 0)
    );
    const groundHeight = 5;
    for (pos.x = tileLayer.size.x; pos.x--; ) {
      const levelHeight = groundHeight;
      for (pos.y = tileLayer.size.y; pos.y--; ) {
        if (pos.y > levelHeight) continue;
        tileLayer.setData(pos, new TileLayerData(1));
        tileLayer.setCollisionData(pos);
      }
    }
    tileLayer.redraw();
  }
}
class Enemy extends EngineObject {
  constructor(pos) {
    super(pos, vec2(1.5, 1.5), null, 0, BLUE);
    this.setCollision();
    this.speed = 0.05;
    this.chaseSpeed = 0.08;
    this.range = 5;
    this.direction = 1;

    this.detectionRange = 8;
    this.player = null;
    this.state = "patrol";
    this.leftBound = pos.x - this.range / 2;
    this.rightBound = pos.x + this.range / 2;
  }

  update() {
    const dx = this.player.pos.x - this.pos.x;
    const dy = this.player.pos.y - this.pos.y;
    const distSq = dx * dx + dy * dy;
    const detectionRangeSq = this.detectionRange * this.detectionRange;

    if (distSq < detectionRangeSq && this.player.pos.y < this.pos.y + 2) {
      this.state = "chase";
    } else if (distSq >= detectionRangeSq && this.state === "chase") {
      this.state = "patrol";
      this.velocity.x = 0;
    }
    if (this.state === "chase") {
      this.chaseUpdate();
    } else {
      this.patrolUpdate();
    }
    super.update();
  }
  patrolUpdate() {
    if (this.direction > 0 && this.pos.x >= this.rightBound) {
      this.direction = -1;
    } else if (this.direction < 0 && this.pos.x <= this.leftBound) {
      this.direction = 1;
    }
    this.velocity.x = this.direction * this.speed;
  }

  chaseUpdate() {
    const dirToPlayer = sign(this.player.pos.x - this.pos.x);
    this.velocity.x = dirToPlayer * this.chaseSpeed;
  }
}

class Stilt extends EngineObject {
  constructor(pos, player) {
    super(pos, vec2(2, 0.1), null, 0, ORANGE);
    this.setCollision();
    this.player = player;
    this.isMaximized = false;
    this.respawnPos = pos;
  }
  update() {
    this.pos.x = this.player.pos.x;
  }
  grow() {
    if (this.isMaximized) return;
    // console.log(
    //   `size: ${this.size.y} pos: ${this.pos.y} respawn: ${this.respawnPos.y}`
    // );
    // console.log(
    //   `size: ${this.player.size.y} pos: ${this.player.pos.y} respawn: ${this.player.respawnPos.y}`
    // );
    this.size.y = Math.floor(this.size.y + 1);
    this.pos.y = Math.floor(this.pos.y + 1);
    this.player.pos.y += this.player.size.y + 1;

    if (this.size >= STILT_HEIGHT_MAX) {
      this.isMaximized = true;
    }
  }
}

class Item extends EngineObject {
  constructor(pos) {
    super(pos, vec2(0.5, 0.5), null, 0, GREEN);
    this.collide = false;
    this.mass = 0;
    this.player = null;
  }
  update() {
    if (this.player) {
      if (this.isOverlapping(this.player.pos, this.player.size)) {
        this.player.activateStilts();
        this.destroy();
      }
      super.update();
    }
  }
}

////////////////////////////////////////////////////////////////////////
function gameInit() {
  gravity.y = -0.05;
  new Level();
  const player = new Player(vec2(5, 6));
  const stilt = new Stilt(vec2(5, 4), player);
  const enemy1 = new Enemy(vec2(25, 6));
  const enemy2 = new Enemy(vec2(20, 10));
  enemy1.player = player;
  enemy2.player = player;

  const item1 = new Item(vec2(10, 8));
  item1.player = player;
  const item2 = new Item(vec2(30, 8));
  item2.player = player;
  const item3 = new Item(vec2(50, 8));
  item3.player = player;
  const item4 = new Item(vec2(70, 8));
  item4.player = player;
  const item5 = new Item(vec2(90, 8));
  item5.player = player;

  player.stiltObject = stilt;
  canvasClearColor = hsl(0.6, 0.3, 0.5);
}

///////////////////////////////////////////////////////////////////////////////
function gameUpdate() {}

///////////////////////////////////////////////////////////////////////////////
function gameUpdatePost() {}

///////////////////////////////////////////////////////////////////////////////
function gameRender() {}

///////////////////////////////////////////////////////////////////////////////
function gameRenderPost() {
  drawTextScreen("Hello World!", mainCanvasSize.scale(0.5), 80);
}

///////////////////////////////////////////////////////////////////////////////
// Startup LittleJS Engine
engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost, [
  "tiles.png",
  "/media/player/john_idle.png",
]);
