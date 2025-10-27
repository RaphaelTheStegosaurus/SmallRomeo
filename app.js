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
const STILT_STAR_HEIGTH = 5;
const STILT_GROW_UP = 2;
const STILT_SHRINK_RATE = 5.0;
const WOODTOOL_VALUE = 0.1;
const GAME_STATE = {
  START_MENU: 0,
  PLAYING: 1,
  PAUSED: 2,
  GAME_OVER: 3,
  ANIMATION_INTRO: 4,
};
let gameState = GAME_STATE.START_MENU;
///////////
//Mis variables globales
let current_stilt_height;
let velocity_time = 10;
let velocity_unity = 0.0;
let uiRoot;
let textDemo;

let isVelocityTimeIsMin = false;
let isVelocityUnityIsMax = false;
let isGameOver = false;
let isYouWin = false;
let isPause = false;
let isStar = true;
function startGame() {
  // for (const obj of Engine.objects) {
  //   obj.destroy();
  // }
  velocity_time = 10;
  velocity_unity = 0.0;
  isVelocityTimeIsMin = false;
  isVelocityUnityIsMax = false;
  isGameOver = false;
  isYouWin = false;
  // gameInit();
  gameState = GAME_STATE.PLAYING;
}
function endGame() {
  gameState = GAME_STATE.GAME_OVER;
}
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
    this.JumpSound = new Sound([, , 1e3, , , 0.5, , , , , 99, 0.01, 0.03]);
  }
  update() {
    const moveInput = keyDirection();
    this.velocity.x += moveInput.x * (this.groundObject ? 0.1 : 0.01);
    if (moveInput.x < 0) this.mirror = true;
    else if (moveInput.x > 0) this.mirror = false;
    //[ ] arreglar animation con un sprite justo a los sprites
    // this.animate();

    if (this.groundObject && moveInput.y > 0) {
      this.JumpSound.play();
      this.velocity.y = 0.75;
    }
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
    this.spawner = null;
    this.spawnX = pos.x;
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
    this.attack();
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
  attack() {
    const stilt = this.player.stiltObject;
    if (!stilt) {
      return;
    }
    const enemyLeft = this.pos.x;
    const enemyRight = this.pos.x + this.size.x;
    const stiltLeft = stilt.pos.x;
    const stiltRight = stilt.pos.x + stilt.size.x;
    const isOverlappingX = enemyRight > stiltLeft && enemyLeft < stiltRight;
    if (isOverlappingX) {
      if (this.spawner) {
        this.spawner.notifyDestroyed(this.spawnX);
      }
      if (velocity_time > 1) {
        velocity_time -= 1;
      }
      if (velocity_time == 1 && !isVelocityTimeIsMin) {
        isVelocityTimeIsMin = true;
        console.log("Ya devoran a cada segundo ");
      }
      this.destroy();
    }
  }
}
class EnemySpawner extends EngineObject {
  constructor(player) {
    super();
    this.player = player;
    this.spawnInterval = 10;
    this.timer = this.spawnInterval;
    this.activePositions = [];
    this.maxEnemies = 4;
    this.minX = 5;
    this.maxX = 95;
  }
  update() {
    if (this.activePositions.length >= this.maxEnemies) {
      this.timer = this.spawnInterval;
      return;
    }
    this.timer -= time;
    if (this.timer <= 0) {
      this.spawnEnemy();
      this.timer = this.spawnInterval;
    }
  }
  getRandomXPosition() {
    let attempts = 0;
    const maxAttempts = 10;
    while (attempts < maxAttempts) {
      const randomX = rand(this.minX, this.maxX);
      const minDistance = 10;
      let isTooClose = false;
      for (const activeX of this.activePositions) {
        if (Math.abs(activeX - randomX) < minDistance) {
          isTooClose = true;
          break;
        }
      }
      if (!isTooClose) {
        return randomX;
      }
      attempts++;
    }
    return null;
  }

  spawnEnemy() {
    const xPos = this.getRandomXPosition();
    if (xPos === null) return;
    const pos = vec2(xPos, 3);
    const newEnemy = new Enemy(pos);
    newEnemy.player = this.player;
    newEnemy.spawner = this;
    newEnemy.spawnX = xPos;
    this.activePositions.push(xPos);
  }
  notifyDestroyed(xPos) {
    const index = this.activePositions.indexOf(xPos);
    if (index !== -1) {
      this.activePositions.splice(index, 1);
    }
    this.timer = this.spawnInterval;
  }
}
class CloudOfDog extends EngineObject {
  constructor(player) {
    super();
    this.size = vec2(5, 2);
    this.color = GRAY;
    this.collide = false;
    this.mass = 0;
    this.pos.y = 1;
    this.player = player;
    console.log(this);
  }
  update() {
    this.pos.x = this.player.pos.x;
  }
}
class CloudParticles extends ParticleEmitter {
  constructor(posX) {
    super(
      vec2(posX, 1),
      0,
      3,
      0,
      200,
      PI, //emitConeAngle
      0,
      hsl(0, 0, 0, 0.5),
      hsl(0, 0, 1, 0.5),
      hsl(0, 0, 0, 0),
      hsl(0, 0, 1, 0),
      1, //particletime
      1, //sizestart
      2, //sizeend
      0.3,
      0.01,
      0.85, //damping
      1,
      -0.075, //gravity
      PI,
      0.3,
      0.5,
      0,
      0,
      1
    );
  }
}
class WoodTool extends EngineObject {
  constructor(pos) {
    super(pos, vec2(1, 1), null, 0, YELLOW);
    this.collide = false;
    this.mass = 0;
    this.player = null;
    this.spawner = null;
    this.spawnX = pos.x;
  }

  update() {
    this.pos.y += sin(time) * 0.005;
    if (this.player && this.spawner) {
      if (
        this.isOverlapping(
          this.player.stiltObject.pos,
          this.player.stiltObject.size
        )
      ) {
        if (velocity_unity < 1.3) {
          velocity_unity += WOODTOOL_VALUE;
        }
        if (velocity_unity > 1 && !isVelocityUnityIsMax) {
          isVelocityUnityIsMax = true;
          console.log("Están destruyendo lo máximo");
        }
        this.spawner.notifyDestroyed(this.spawnX);
        this.destroy();
      }
    }
    super.update();
  }
}
class WoodToolSpawner extends EngineObject {
  constructor(player) {
    super();
    this.player = player;
    this.spawnInterval = 5;
    this.timer = 0;
    this.maxTools = 3;
    this.activePositions = [];
    this.minX = 10;
    this.maxX = 90;
    this.minDistance = 8;
  }
  update() {
    if (this.activePositions.length >= this.maxTools) {
      this.timer = this.spawnInterval;
      return;
    }
    this.timer -= time;
    if (this.timer <= 0) {
      this.spawnWoodTool();
      this.timer = this.spawnInterval;
    }
  }
  getRandomXPosition() {
    let attempts = 0;
    const maxAttempts = 10;
    while (attempts < maxAttempts) {
      const randomX = rand(this.minX, this.maxX);
      let isTooClose = false;
      for (const activeX of this.activePositions) {
        if (Math.abs(activeX - randomX) < this.minDistance) {
          isTooClose = true;
          break;
        }
      }
      if (!isTooClose) {
        return randomX;
      }
      attempts++;
    }
    return null;
  }
  spawnWoodTool() {
    const xPos = this.getRandomXPosition();
    if (xPos === null) return;
    const pos = vec2(xPos, 3);
    const newTool = new WoodTool(pos);
    newTool.player = this.player;
    newTool.spawner = this;
    newTool.spawnX = xPos;
    this.activePositions.push(xPos);
  }
  notifyDestroyed(xPos) {
    const index = this.activePositions.indexOf(xPos);
    if (index !== -1) {
      this.activePositions.splice(index, 1);
    }
    this.timer = this.spawnInterval;
  }
}
class Stilt extends EngineObject {
  constructor(pos, player) {
    super(pos, vec2(1, STILT_STAR_HEIGTH), null, 0, ORANGE);
    this.setCollision();
    this.player = player;
    this.respawnPos = pos;
    this.Cloud = new CloudParticles(this.pos.x);
    this.sound = new Sound([
      ,
      ,
      418,
      0,
      0.02,
      0.2,
      4,
      1.15,
      -8.5,
      ,
      ,
      ,
      ,
      0.7,
      ,
      0.1,
    ]);
  }
  update() {
    this.pos.x = this.player.pos.x;
    this.Cloud.pos.x = this.pos.x;
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
      endGame();
      this.size.y = 0.1;
    }
  }
  grow() {
    this.size.y = this.size.y + STILT_GROW_UP;
    this.pos.y = this.pos.y + STILT_GROW_UP;
    this.player.pos.y += this.player.size.y + STILT_GROW_UP;
    this.sound.play();
  }
}
class Item extends EngineObject {
  constructor(pos) {
    super(pos, vec2(0.5, 0.5), null, 0, GREEN);
    this.collide = false;
    this.mass = 0;
    this.player = null;
    this.player = null;
    this.spawner = null;
    this.spawnPos = pos;
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
    if (this.player && this.spawner) {
      if (this.isOverlapping(this.player.pos, this.player.size)) {
        this.player.activateStilts();
        this.spawner.notifyDestroyed(this.spawnPos);
        this.sound.play();
        this.destroy();
      }
    }
    super.update();
  }
}
class ItemSpawner extends EngineObject {
  constructor(player) {
    super();
    this.player = player;
    this.spawnInterval = 5;
    this.timer = this.spawnInterval;
    this.maxItems = 18;
    this.minX = 10;
    this.maxX = 85;
    this.minY = 8;
    this.maxY = 30;
    this.minDistance = 8;
    this.activePositions = [];
  }
  update() {
    if (this.activePositions.length >= this.maxItems) {
      this.timer = this.spawnInterval;
      return;
    }
    this.timer -= time;
    if (this.timer <= 0) {
      this.spawnItem();
      this.timer = this.spawnInterval;
    }
  }
  getRandomPosition() {
    let attempts = 0;
    const maxAttempts = 15;
    const minDistanceSq = this.minDistance * this.minDistance;
    while (attempts < maxAttempts) {
      const randomX = rand(this.minX, this.maxX);
      const randomY = rand(this.minY, this.maxY);
      const newPos = vec2(randomX, randomY);
      let isTooClose = false;
      for (const activePos of this.activePositions) {
        const dx = newPos.x - activePos.x;
        const dy = newPos.y - activePos.y;
        const distanceSq = dx * dx + dy * dy;
        if (distanceSq < minDistanceSq) {
          isTooClose = true;
          break;
        }
      }
      if (!isTooClose) {
        return newPos;
      }
      attempts++;
    }
    return null;
  }

  spawnItem() {
    const pos = this.getRandomPosition();
    if (pos === null) return;
    const newItem = new Item(pos);
    newItem.player = this.player;
    newItem.spawner = this;
    this.activePositions.push(pos);
  }
  notifyDestroyed(destroyedPos) {
    const index = this.activePositions.indexOf(destroyedPos);
    if (index !== -1) {
      this.activePositions.splice(index, 1);
    }
    this.timer = this.spawnInterval;
  }
}
class Goal extends EngineObject {
  constructor(pos, player) {
    super(pos, vec2(4, 0.5), null, 0, GREEN);
    this.mass = 0;
    this.collide = true;
    this.setCollision();
    this.player = player;
  }
  update() {
    if (this.OverLappingX()) {
      if (
        this.pos.y < this.player.pos.y &&
        this.pos.y + 2 > this.player.pos.y
      ) {
        isYouWin = true;
      }
    }
  }
  OverLappingX() {
    const goalLeft = this.pos.x;
    const goalRight = this.pos.x + this.size.x;
    const playerLeft = this.player.pos.x;
    const playerRight = this.player.pos.x + this.player.size.x;
    const isCenterToRight = goalLeft < playerLeft;
    const isCenterToLeft = goalRight > playerRight;
    if (isCenterToLeft && isCenterToRight) {
      return true;
    }
    return false;
  }
}
class StiltBar extends UIScrollbar {
  constructor(pos, size) {
    super(pos, size);
  }
  update() {
    const stiltValue = parseFloat(current_stilt_height / 10).toFixed(2);
    this.getValue(stiltValue);
    super.update();
  }
  getValue(value) {
    if (value < 0.2) {
      this.color = RED;
      this.value = 0.01;
      return;
    }
    if (value < 0.4) {
      this.color = ORANGE;
      this.value = 0.25;
      return;
    }
    if (value < 0.5) {
      this.color = YELLOW;
      this.value = 0.35;
      return;
    }
    if (value < 0.7) {
      this.color = CYAN;
      this.value = 0.47;
      return;
    }
    if (value < 0.9) {
      this.color = CYAN;
      this.value = 0.5;
      return;
    }
    if (value < 1.5) {
      this.color = BLUE;
      this.value = 0.75;
      return;
    }
    if (value < 2.0) {
      this.color = BLUE;
      this.value = 0.85;
      return;
    }
    if (value >= 2.0) {
      this.color = GREEN;
      this.value = 0.99;
      return;
    }
  }
}
class Menu extends EngineObject {
  constructor() {
    const canvas = canvasMaxSize.scale(0.5);
    const cameraWidth = parseInt(canvas.x);
    const cameraHeight = parseInt(canvas.y);
    super();
    this.startContainer = this.loadStartMenu(
      vec2(cameraWidth * 0.625, cameraHeight * 0.55),
      vec2(cameraWidth, cameraHeight)
    );
    this.pausedContainer = this.loadPausedMenu(
      vec2(cameraWidth * 0.625, cameraHeight * 0.55),
      vec2(cameraWidth, cameraHeight)
    );
    this.gameOverContainer = this.loadGameOverMenu(
      vec2(cameraWidth * 0.625, cameraHeight * 0.55),
      vec2(cameraWidth, cameraHeight)
    );
    // this.startContainer.visible = true;
    // this.pausedContainer.visible = true;
    // this.gameOverContainer.visible = true;
    // this.addChild(this.startContainer);
    // this.addChild(this.pausedContainer);
    // this.addChild(this.gameOverContainer);
  }
  update() {
    this.startContainer.visible = gameState == GAME_STATE.START_MENU;
    this.pausedContainer.visible = gameState == GAME_STATE.PAUSED;
    this.gameOverContainer.visible = gameState == GAME_STATE.GAME_OVER;
    super.update();
  }
  loadStartMenu(pos, size) {
    const container = new UIObject(pos, size);
    container.color = new Color(1, 1, 1, 0.9);
    const startMenuText = new UIText(
      vec2(0, -150),
      vec2(400, 80),
      "Small Romeo"
    );
    const startButton = new UIButton(vec2(0, 0), vec2(150, 50), "start");
    startButton.onClick = () => {
      startGame();
    };
    container.addChild(startMenuText);
    container.addChild(startButton);
    return container;
  }
  loadPausedMenu(pos, size) {
    const container = new UIObject(pos, size);
    container.color = new Color(0, 0, 0, 0.5);
    const pausedMenuText = new UIText(vec2(0, -150), vec2(400, 80), "Paused");
    const continueButton = new UIButton(vec2(0, 0), vec2(200, 50), "Continue");
    continueButton.onClick = () => {
      gameState = GAME_STATE.PLAYING;
    };
    container.addChild(pausedMenuText);
    container.addChild(continueButton);
    return container;
  }
  loadGameOverMenu(pos, size) {
    const container = new UIObject(pos, size);
    container.color = new Color(0.5, 0, 0, 0.8);
    const gameOverMenuText = new UIText(
      vec2(0, -150),
      vec2(400, 80),
      "Game Over"
    );
    const restartButton = new UIButton(
      vec2(0, -50),
      vec2(250, 50),
      "Play Again ?"
    );
    restartButton.onClick = () => {
      startGame();
    };
    const toMenuButton = new UIButton(
      vec2(0, 50),
      vec2(250, 50),
      "back to Menu"
    );
    toMenuButton.onClick = () => {
      // for (const obj of Engine.objects) {
      //   obj.destroy();
      // }
      // gameInit();
      gameState = GAME_STATE.START_MENU;
    };
    container.addChild(gameOverMenuText);
    container.addChild(restartButton);
    container.addChild(toMenuButton);
    return container;
  }
}
////////////////////////////////////////////////////////////////////////
function gameInit() {
  new UISystemPlugin();
  uiSystem.defaultSoundClick = new Sound([0.5, 0, 440]);
  uiSystem.defaultCornerRadius = 20;
  uiSystem.defaultShadowColor = CYAN;
  gravity.y = -0.05;
  new Level();
  const wallHeight = 40;
  const wallCenterY = wallHeight / 2;
  const wallWidth = 1;
  new Boundary(vec2(0.5, wallCenterY), vec2(wallWidth, wallHeight));
  new Boundary(vec2(100 - 0.5, wallCenterY), vec2(wallWidth, wallHeight));
  const player = new Player(vec2(5, STILT_STAR_HEIGTH + 6));
  const stilt = new Stilt(vec2(5, STILT_STAR_HEIGTH + 2), player);
  new Goal(vec2(97, wallHeight - 10), player);
  new EnemySpawner(player);
  new WoodToolSpawner(player);
  player.stiltObject = stilt;
  new ItemSpawner(player);
  canvasClearColor = hsl(0.6, 0.3, 0.5);
  // const bg = new TileLayer(
  //   vec2(0, 0),
  //   canvasMaxSize,
  //   new TileInfo(vec2(0, 0), vec2(900, 700), 2)
  // );
  // new StiltBar(vec2(0, 0), vec2(1.5, 10));
  bg = tile(vec2(0, 0), canvasMaxSize, 2);
  //ui
  // uiRoot = new UIObject(vec2(0, 0), vec2(1, 1));
  // textDemo = new UIText(vec2(600, 300), vec2(600, 100));
  // textDemo.textColor = WHITE;
  // textDemo.textLineWidth = 8;
  // uiRoot.addChild(textDemo);
  let bar = new StiltBar(vec2(200, 100), vec2(300, 20));
  let menu = new Menu();
  console.log(menu);
}

///////////////////////////////////////////////////////////////////////////////
function gameUpdate() {
  if (gameState === GAME_STATE.PLAYING) {
  }

  if (isYouWin) {
    // textDemo.textColor = GREEN;
    // textDemo.text = "You Win!";
  } else if (isGameOver) {
    // textDemo.textColor = RED;
    // textDemo.text = "Game Over";
  } else {
    // textDemo.text = `stilt height: ${parseFloat(current_stilt_height).toFixed(
    //   2
    // )} y baja a ${parseFloat(velocity_unity).toFixed(1)}/${velocity_time}s`;
  }
}

///////////////////////////////////////////////////////////////////////////////
function gameUpdatePost() {}

///////////////////////////////////////////////////////////////////////////////
function gameRender() {
  drawTile(vec2(40, 12), vec2(80, 40), bg);
}

///////////////////////////////////////////////////////////////////////////////
function gameRenderPost() {
  // drawTextScreen("Hello World!", mainCanvasSize.scale(0.5), 80);
}

///////////////////////////////////////////////////////////////////////////////
// Startup LittleJS Engine
engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost, [
  "tiles.png",
  "/media/player/john_idle.png",
  "/media/bg/Layer.png",
]);
