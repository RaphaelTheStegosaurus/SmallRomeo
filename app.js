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
const ListsSpriteFrameEnemy = {
  walk: {
    frames: 3,
    speed: 6,
    width: 301,
    height: 275,
    tileIndex: 3,
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
  YOU_WIN: 4,
  ANIMATION_INTRO: 5,
};
let gameState = GAME_STATE.START_MENU;
///////////
let current_stilt_height;
let velocity_time = 6;
let velocity_unity = 0.1;
let uiRoot;
let textDemo;

let isVelocityTimeIsMin = false;
let isVelocityUnityIsMax = false;
let isGameOver = false;
let isYouWin = false;
let isPause = false;
let isStar = true;
let menuInstance = null;
let gameObjects = [];
let paused_Button = null;
let stilt_Bar = null;
function startGame() {
  destroyAndResetGame();
  createGameObjects();
  gameState = GAME_STATE.PLAYING;
}
function endGame() {
  if (gameState === GAME_STATE.PLAYING) {
    gameState = GAME_STATE.GAME_OVER;
  }
}
function pauseGame() {
  if (gameState === GAME_STATE.PLAYING) {
    gameState = GAME_STATE.PAUSED;
  }
}
function winGame() {
  if (gameState === GAME_STATE.PLAYING) {
    gameState = GAME_STATE.YOU_WIN;
  }
}
function destroyAndResetGame() {
  for (const obj of gameObjects) {
    if (obj) {
      obj.destroy();
    }
  }
  gameObjects = [];
  velocity_time = 6;
  velocity_unity = 0.1;
  isVelocityTimeIsMin = false;
  isVelocityUnityIsMax = false;
  isGameOver = false;
  isYouWin = false;
  paused_Button = null;
  stilt_Bar = null;
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
    if (gameState !== GAME_STATE.PLAYING) {
      return;
    }
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
    super(pos, vec2(1.5, 1.5));
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

    const animData = ListsSpriteFrameEnemy.walk;
    const tileInfo = new TileInfo(
      vec2(0, 0),
      vec2(animData.width, animData.height),
      animData.tileIndex
    );
  }

  update() {
    if (gameState !== GAME_STATE.PLAYING) {
      return;
    }
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
    if (this.velocity.x > 0) {
      this.mirror = true;
    } else if (this.velocity.x < 0) {
      this.mirror = false;
    }
    this.animate();
    this.attack();
    super.update();
  }
  animate() {
    const animData = ListsSpriteFrameEnemy.walk;
    if (abs(this.velocity.x) > 0.001) {
      this.frame = (time * animData.speed) % animData.frames | 0;
    } else {
      this.frame = 0;
    }
    this.tileInfo = new TileInfo(
      vec2(this.frame * animData.width, 0),
      vec2(animData.width, animData.height),
      animData.tileIndex
    );
  }
  patrolUpdate() {
    if (this.direction > 0 && this.pos.x >= this.rightBound) {
      this.direction = -1;
    } else if (this.direction < 0 && this.pos.x <= this.leftBound) {
      this.direction = 1;
    }
    this.velocity.x = this.direction * this.speed;
  }
  loadSprite() {}
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
      this.destroy();
    }
  }
}
class EnemySpawner extends EngineObject {
  constructor(player) {
    super();
    this.player = player;
    this.spawnInterval = 1;
    this.timer = this.spawnInterval;
    this.activePositions = [];
    this.activeEnemies = [];
    this.maxEnemies = 8;
    this.minX = 5;
    this.maxX = 95;
  }
  update() {
    if (gameState !== GAME_STATE.PLAYING) {
      return;
    }
    if (this.activePositions.length >= this.maxEnemies) {
      this.timer = this.spawnInterval;
      return;
    }
    this.timer -= timeDelta;
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
    this.activeEnemies.push(newEnemy);
  }
  notifyDestroyed(xPos) {
    const index = this.activePositions.indexOf(xPos);
    if (index !== -1) {
      this.activePositions.splice(index, 1);
      this.activeEnemies.splice(index, 1);
    }
    this.timer = this.spawnInterval;
  }
  destroyAllSpawned() {
    for (const enemy of this.activeEnemies) {
      if (enemy) {
        enemy.destroy();
      }
    }
    this.activeEnemies = [];
  }
  destroy() {
    this.destroyAllSpawned();
    super.destroy();
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
    super(pos, vec2(2, 2));
    this.collide = false;
    this.mass = 0;
    this.player = null;
    this.spawner = null;
    this.spawnX = pos.x;
    this.tileInfo = new TileInfo(vec2(0, 0), vec2(500, 500), 4);
  }

  update() {
    if (gameState !== GAME_STATE.PLAYING) {
      return;
    }
    this.pos.y += sin(time) * 0.005;
    if (this.player && this.spawner) {
      if (
        this.isOverlapping(
          this.player.stiltObject.pos,
          this.player.stiltObject.size
        )
      ) {
        if (velocity_unity < 1.5) {
          velocity_unity += WOODTOOL_VALUE;
        }
        if (velocity_unity > 1 && !isVelocityUnityIsMax) {
          isVelocityUnityIsMax = true;
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
    this.spawnInterval = 2;
    this.timer = this.spawnInterval;
    this.maxTools = 6;
    this.activePositions = [];
    this.activeTools = [];
    this.minX = 10;
    this.maxX = 90;
    this.minDistance = 8;
  }
  update() {
    if (gameState !== GAME_STATE.PLAYING) {
      return;
    }
    if (this.activePositions.length >= this.maxTools) {
      this.timer = this.spawnInterval;
      return;
    }
    this.timer -= timeDelta;
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
    this.activeTools.push(newTool);
  }
  notifyDestroyed(xPos) {
    const index = this.activePositions.indexOf(xPos);
    if (index !== -1) {
      this.activePositions.splice(index, 1);
      this.activeTools.splice(index, 1);
    }
    this.timer = this.spawnInterval;
  }
  destroyAllSpawned() {
    for (const tool of this.activeTools) {
      if (tool) tool.destroy();
    }
    this.activeTools = [];
  }
  destroy() {
    this.destroyAllSpawned();
    super.destroy();
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
    this.shrinkTimer = velocity_time;
    this.tileInfo = new TileInfo(vec2(0, 0), vec2(32, 32), 5);
  }
  update() {
    if (gameState !== GAME_STATE.PLAYING) {
      return;
    }
    this.pos.x = this.player.pos.x;
    this.Cloud.pos.x = this.pos.x;
    current_stilt_height = this.size.y;
    this.reduceY();
  }
  destroy() {
    if (this.Cloud) {
      this.Cloud.destroy();
    }
    super.destroy();
  }
  reduceY() {
    if (this.size.y > 0.2) {
      if (time % velocity_time === 0) {
        this.size.y = this.size.y - velocity_unity;
      }
    } else {
      if (gameState === GAME_STATE.PLAYING) {
        endGame();
      }
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
    super(pos, vec2(2, 2));
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
    this.tileInfo = new TileInfo(vec2(0, 32), vec2(32, 32), 5);
  }
  update() {
    if (gameState !== GAME_STATE.PLAYING) {
      return;
    }
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
    this.spawnInterval = 0.7;
    this.timer = this.spawnInterval;
    this.maxItems = 30;
    this.minX = 10;
    this.maxX = 85;
    this.minY = 6;
    this.maxY = 30;
    this.minDistance = 8;
    this.activePositions = [];
    this.activeItems = [];
  }
  update() {
    if (gameState !== GAME_STATE.PLAYING) {
      return;
    }
    if (this.activePositions.length >= this.maxItems) {
      this.timer = this.spawnInterval;
      return;
    }
    this.timer -= timeDelta;
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
    this.activeItems.push(newItem);
  }
  notifyDestroyed(destroyedPos) {
    const index = this.activePositions.indexOf(destroyedPos);
    if (index !== -1) {
      this.activePositions.splice(index, 1);
      this.activeItems.splice(index, 1);
    }
    this.timer = this.spawnInterval;
  }
  destroyAllSpawned() {
    for (const item of this.activeItems) {
      if (item) item.destroy();
    }
    this.activeItems = [];
  }
  destroy() {
    this.destroyAllSpawned();
    super.destroy();
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
        winGame();
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
    this.interactive = false;
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
class PauseButton extends UIButton {
  constructor(pos, size) {
    super(pos, size);
    this.text = "Pause";
    this.onClick = pauseGame;
    this.interactive = true;
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
    this.youWinContainer = this.loadYouWinMenu(
      vec2(cameraWidth * 0.625, cameraHeight * 0.55),
      vec2(cameraWidth, cameraHeight)
    );
    this.startContainer.visible = false;
    this.pausedContainer.visible = false;
    this.gameOverContainer.visible = false;
    this.youWinContainer.visible = false;
  }
  update() {
    this.startContainer.visible = gameState == GAME_STATE.START_MENU;
    this.pausedContainer.visible = gameState == GAME_STATE.PAUSED;
    this.gameOverContainer.visible = gameState == GAME_STATE.GAME_OVER;
    this.youWinContainer.visible = gameState == GAME_STATE.YOU_WIN;
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
      container.visible = false;
      setTimeout(() => {
        startGame();
      }, 1);
    };
    const toMenuButton = new UIButton(
      vec2(0, 50),
      vec2(250, 50),
      "back to Menu"
    );
    toMenuButton.onClick = () => {
      container.visible = false;
      destroyAndResetGame();
      createGameObjects();
      gameState = GAME_STATE.START_MENU;
    };
    container.addChild(gameOverMenuText);
    container.addChild(restartButton);
    container.addChild(toMenuButton);
    return container;
  }
  loadYouWinMenu(pos, size) {
    const container = new UIObject(pos, size);
    container.color = new Color(0, 0.5, 0, 0.8);
    const youWinMenuText = new UIText(
      vec2(0, -150),
      vec2(400, 80),
      "¡Victory!"
    );
    youWinMenuText.textColor = WHITE;
    const restartButton = new UIButton(
      vec2(0, -50),
      vec2(250, 50),
      "Play Again ?"
    );
    restartButton.onClick = () => {
      container.visible = false;
      setTimeout(() => {
        startGame();
      }, 1);
    };
    const toMenuButton = new UIButton(
      vec2(0, 50),
      vec2(250, 50),
      "back to Menu"
    );
    toMenuButton.onClick = () => {
      container.visible = false;
      destroyAndResetGame();
      createGameObjects();
      gameState = GAME_STATE.START_MENU;
    };

    container.addChild(youWinMenuText);
    container.addChild(restartButton);
    container.addChild(toMenuButton);
    return container;
  }
}
function createGameObjects() {
  gameObjects = [];
  gameObjects.push(new Level());
  const wallHeight = 40;
  const wallCenterY = wallHeight / 2;
  const wallWidth = 1;
  gameObjects.push(
    new Boundary(vec2(0.5, wallCenterY), vec2(wallWidth, wallHeight))
  );
  gameObjects.push(
    new Boundary(vec2(100 - 0.5, wallCenterY), vec2(wallWidth, wallHeight))
  );

  const player = new Player(vec2(5, STILT_STAR_HEIGTH + 6));
  gameObjects.push(player);

  const stilt = new Stilt(vec2(5, STILT_STAR_HEIGTH + 2), player);
  gameObjects.push(stilt);

  gameObjects.push(new Goal(vec2(97, wallHeight - 10), player));
  gameObjects.push(new EnemySpawner(player));
  gameObjects.push(new WoodToolSpawner(player));

  player.stiltObject = stilt;
  gameObjects.push(new ItemSpawner(player));

  canvasClearColor = hsl(0.6, 0.3, 0.5);
  bg = tile(vec2(0, 0), vec2(1472, 704), 2);
  stilt_Bar = new StiltBar(vec2(200, 150), vec2(300, 20));
  paused_Button = new PauseButton(vec2(200, 75), vec2(200, 50));
}
////////////////////////////////////////////////////////////////////////
function gameInit() {
  new UISystemPlugin();
  uiSystem.defaultSoundClick = new Sound([0.5, 0, 440]);
  uiSystem.defaultCornerRadius = 20;
  uiSystem.defaultShadowColor = CYAN;

  gravity.y = -0.05;
  menuInstance = new Menu();
  createGameObjects();
  gameState = GAME_STATE.START_MENU;
  canvasClearColor = hsl(0.6, 0.3, 0.5);
}

///////////////////////////////////////////////////////////////////////////////
function gameUpdate() {
  if (paused_Button && stilt_Bar) {
    if (gameState !== GAME_STATE.PLAYING) {
      paused_Button.visible = false;
      stilt_Bar.visible = false;
    } else {
      paused_Button.visible = true;
      stilt_Bar.visible = true;
    }
  }
}

///////////////////////////////////////////////////////////////////////////////
function gameUpdatePost() {}

///////////////////////////////////////////////////////////////////////////////
function gameRender() {
  drawTile(vec2(50, 15), vec2(100, 40), bg, new Color(1, 1, 1, 0.5));
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
  "/tiles/bg01.png",
  "/tiles/dog.png",
  "/tiles/tools.png",
  "/tiles/stick_stilt.png",
]);
