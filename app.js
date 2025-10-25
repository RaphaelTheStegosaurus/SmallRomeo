"use strict";
let backgroundTexture;
let bg;
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

///////////
//Mis variables globales
let current_stilt_height;
let velocity_time = 10;
let velocity_unity = 0.1;
let uiRoot;
let textDemo;
///////////

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

    if (this.groundObject && moveInput.y > 0) this.velocity.y = 0.9;
    cameraPos = vec2(
      this.getCameraPosX(this.pos.x),
      this.getCameraPosY(this.pos.y)
    );
  }
  getCameraPosX(_posX) {
    if (_posX < 20) {
      return 19;
    } else if (_posX > 80) {
      return 81;
    } else {
      return _posX;
    }
  }
  getCameraPosY(_posY) {
    if (_posY < 9) {
      return 9;
    }
    return _posY;
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
    const levelSize = vec2(100, 2);
    const tileLayer = new TileCollisionLayer(
      vec2(0, -1),
      levelSize,
      new TileInfo(vec2(0, 0), vec2(16, 16), 0)
    );
    const groundLevelY = 5;
    for (pos.x = 0; pos.x < levelSize.x; pos.x++) {
      for (pos.y = 0; pos.y < groundLevelY; pos.y++) {
        tileLayer.setData(pos, new TileLayerData(1));
        tileLayer.setCollisionData(pos);
      }
    }
    tileLayer.redraw();
  }
}
class Boundary extends EngineObject {
  constructor(pos, size) {
    super(pos, size, new TileInfo(vec2(0, 0), vec2(16, 16), 0));
    this.setCollision();
    this.mass = 0;
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

    if (distSq < detectionRangeSq) {
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
  attack() {}
}

class Stilt extends EngineObject {
  constructor(pos, player) {
    super(pos, vec2(1, 2), null, 0, ORANGE);
    this.setCollision();
    this.player = player;
    this.isMaximized = false;
    this.respawnPos = pos;
  }
  update() {
    this.pos.x = this.player.pos.x;
    current_stilt_height = this.size.y;
    this.reduceY();
  }
  reduceY() {
    if (this.size.y > 0.2) {
      const secondDelay = time % velocity_time;
      if (secondDelay == 0) {
        this.size.y = this.size.y - velocity_unity;
      }
    } else {
      this.size.y = 0.1;
    }
  }
  grow() {
    if (this.isMaximized) return;
    // console.log(
    //   `size: ${this.size.y} pos: ${this.pos.y} respawn: ${this.respawnPos.y}`
    // );
    // console.log(
    //   `size: ${this.player.size.y} pos: ${this.player.pos.y} respawn: ${this.player.respawnPos.y}`
    // );
    this.size.y = this.size.y + 1;
    this.pos.y = this.pos.y + 1;
    this.player.pos.y += this.player.size.y + 1;

    if (this.size >= STILT_HEIGHT_MAX) {
      this.isMaximized = true;
    }
  }
}

class Item extends EngineObject {
  constructor(pos, index, itemSpawner) {
    super(pos, vec2(0.5, 0.5), null, 0, GREEN);
    this.collide = false;
    this.mass = 0;
    this.player = null;
    this.itemSpawner = itemSpawner;
    this.index = index;
    this.sound = new Sound([
      ,
      ,
      539,
      0,
      0.04,
      0.29,
      1,
      1.92,
      ,
      ,
      567,
      0.02,
      0.02,
      ,
      ,
      ,
      0.04,
    ]);
  }
  update() {
    if (this.player) {
      if (this.isOverlapping(this.player.pos, this.player.size)) {
        this.player.activateStilts();
        this.itemSpawner.removeItem(this.index);
        this.sound.play();
        this.destroy();
      }
      super.update();
    }
  }
}
class ItemSpawner extends EngineObject {
  constructor(player) {
    super();
    this.spawnRate = 5;
    this.maxItems = 5;
    this.itemSpawnPos = [
      vec2(10, 4),
      vec2(9, 8),
      vec2(30, 8),
      vec2(20, 4),
      vec2(25, 10),
      vec2(4, 8),
      vec2(12, 8),
      vec2(15, 6),
    ];
    this.player = player;
    this.timer = this.spawnRate;
    this.currentItems = [];
  }

  update() {
    if (time % 5 == 0) {
      if (this.currentItems.length >= this.maxItems) {
        return;
      }
      this.currentItems.push(this.spawnItem());
    }
  }
  removeItem(_index) {
    this.currentItems.splice(_index, 1);
  }
  spawnItem() {
    const randomIndex = randInt(0, this.itemSpawnPos.length);
    const pos = this.itemSpawnPos[randomIndex];
    const newItem = new Item(pos, this.currentItems.length, this);
    newItem.player = this.player;
    return newItem;
  }
}
////////////////////////////////////////////////////////////////////////
function gameInit() {
  gravity.y = -0.05;
  new Level();
  const wallCenterY = 20 / 2;
  const wallHeight = 20;
  const wallWidth = 1;
  new Boundary(vec2(0.5, wallCenterY), vec2(wallWidth, wallHeight));
  new Boundary(vec2(100 - 0.5, wallCenterY), vec2(wallWidth, wallHeight));

  const player = new Player(vec2(5, 6));
  const stilt = new Stilt(vec2(5, 4), player);
  const enemy1 = new Enemy(vec2(25, 6));
  const enemy2 = new Enemy(vec2(20, 10));
  enemy1.player = player;
  enemy2.player = player;
  player.stiltObject = stilt;
  new ItemSpawner(player);
  canvasClearColor = hsl(0.6, 0.3, 0.5);
  // const bg = new TileLayer(
  //   vec2(0, 0),
  //   canvasMaxSize,
  //   new TileInfo(vec2(0, 0), vec2(900, 700), 2)
  // );
  bg = tile(vec2(0, 0), canvasMaxSize, 2);
  // console.log(tile(vec2(0, 0), canvasMaxSize, 2));
  // console.log(mainCanvasSize.scale(0.5));

  //ui
  new UISystemPlugin();
  uiRoot = new UIObject(vec2(0, 0), vec2(1, 1));

  textDemo = new UIText(vec2(600, 100), vec2(600, 100));
  textDemo.textColor = WHITE;
  textDemo.textLineWidth = 8;
  // console.log(textDemo);
  uiRoot.addChild(textDemo);
  // const uiMenu = new UIObject(mainCanvasSize.scale(0.5), vec2(600, 450));
}

///////////////////////////////////////////////////////////////////////////////
function gameUpdate() {
  textDemo.text = `stilt height: ${current_stilt_height}`;
}

///////////////////////////////////////////////////////////////////////////////
function gameUpdatePost() {}

///////////////////////////////////////////////////////////////////////////////
function gameRender() {
  drawTile(vec2(30, 12), vec2(80, 40), bg);
}

///////////////////////////////////////////////////////////////////////////////
function gameRenderPost() {
  drawTextScreen("Hello World!", mainCanvasSize.scale(0.5), 80);
}

///////////////////////////////////////////////////////////////////////////////
// Startup LittleJS Engine
engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost, [
  "tiles.png",
  "/media/player/john_idle.png",
  "/media/bg/Layer.png",
]);
