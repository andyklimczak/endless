var game;
var localStorageName = 'doublelanegame';
var bgColors = [0x54c7fc, 0xffcd00, 0xff2851, 0x62bd18];
var score;
var savedData;
var laneWidth = 138;
var lineWidth = 4;
var cars = [];
var carTurnSpeed = 200;
var targetDelay = 1200;
var targetSpeed = 180;

window.onload = function() {
  var width = 640;
  var height = 960;
  var windowRatio = window.innerWidth / window.innerHeight;
  if(windowRatio < width / height) {
    var height = width / windowRatio;
  }
  game = new Phaser.Game(width, height, Phaser.AUTO, "");
  game.state.add('Boot', boot);
  game.state.add('Preload', preload);
  game.state.add('TitleScreen', titleScreen);
  game.state.add('HowToPlay', howToPlay);
  game.state.add('PlayGame', playGame);
  game.state.add('GameOverScreen', gameOverScreen);
  game.state.start('Boot');
}

Target = function(game, lane) {
  var position = game.rnd.between(0, 1);
  Phaser.Sprite.call(this, game, cars[lane].positions[position], -20, 'target');
  game.physics.enable(this, Phaser.Physics.ARCADE);
  this.anchor.set(.5);
  var tint = game.rnd.between(0, 1);
  this.mustPickUp = tint == lane;
  this.tint = cars[tint].tint;
  this.body.velocity.y = targetSpeed;
  this.missed = new Phaser.Signal();
};
Target.prototype = Object.create(Phaser.Sprite.prototype);
Target.prototype.update = function() {
  if(this.y > game.height - this.height / 2 && this.mustPickUp) {
    this.missed.dispatch(this);
  }
  if(this.y > game.height + this.height / 2) {
    this.destroy();
  }
}

var boot = function(game) {};
boot.prototype = {
  preload: function() {
    game.load.image('loading', 'assets/sprites/loading.png');
  },
  create: function() {
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.state.start('Preload');
  }
};

var preload = function(game) {};
preload.prototype = {
  preload: function() {
    var loadingBar = this.add.sprite(game.width / 2, game.height / 2, 'loading');
    loadingBar.anchor.setTo(.5);
    game.load.setPreloadSprite(loadingBar);
    game.load.image('title', 'assets/sprites/title.png');
    game.load.image('playbutton', 'assets/sprites/playbutton.png');
    game.load.image('backsplash', 'assets/sprites/backsplash.png');
    game.load.image('target', 'assets/sprites/target.png');
    game.load.image('car', 'assets/sprites/car.png');
    game.load.image('particle', 'assets/sprites/particle.png');
    game.load.bitmapFont('font', 'assets/fonts/font.png', 'assets/fonts/font.fnt');
    game.load.audio('bgmusic', ['assets/sounds/bgmusic.mp3', 'assets/sounds/bgmusic.ogg']);
    game.load.audio('explosion', ['assets/sounds/explosion.mp3', 'assets/sounds/explosion.ogg']);
    game.load.audio('hit', ['assets/sounds/hit.mp3', 'assets/sounds/hit.ogg']);
  },
  create: function() {
    game.state.start('TitleScreen');
  }
};

var titleScreen = function(game) {};
titleScreen.prototype = {
  create: function() {
    savedData = localStorage.getItem(localStorageName) == null ? { score: 0 } : JSON.parse(localStorage.getItem(localStorageName));
    var titleBG = game.add.tileSprite(0, 0, game.width, game.height, 'backsplash');
    titleBG.tint = bgColors[game.rnd.between(0, bgColors.length - 1)];
    document.body.style.background = '#' + titleBG.tint.toString(16);
    var title = game.add.image(game.width / 2, 160, 'title');
    title.anchor.set(.5);
    game.add.bitmapText(game.width / 2, 400, 'font', 'Best score', 90).anchor.x = .5;
    game.add.bitmapText(game.width / 2, 500, 'font', savedData.score.toString(), 120).anchor.x = .5;
    var playButton = game.add.button(game.width / 2, game.height - 150, 'playbutton', this.startGame);
    playButton.anchor.set(.5);
    var tween = game.add.tween(playButton).to({
      width: 220,
      height: 220
    }, 1500, 'Linear', true, 0, -1);
    tween.yoyo(true);
  },
  startGame: function() {
    game.state.start('HowToPlay');
  }
};

var howToPlay = function(game) {};
howToPlay.prototype = {
  create: function() {
    var titleBG = game.add.tileSprite(0, 0, game.width, game.height, 'backsplash');
    var tintColor = bgColors[game.rnd.between(0, bgColors.length - 1)];
    titleBG.tint = tintColor;
    var pickedColors = [tintColor];
    document.body.style.background = '#' + titleBG.tint.toString(16);
    game.add.bitmapText(game.width / 2, 40, 'font', 'Change left car lane', 60).anchor.x = .5;
    game.add.bitmapText(game.width / 2, 120, 'font', 'Tap or click on the left half or Z key', 36).anchor.x = .5;
    game.add.bitmapText(game.width / 2, 280, 'font', 'Change right car lane', 60).anchor.x = .5;
    game.add.bitmapText(game.width / 2, 360, 'font', 'Tap or click on the right half or X key', 36).anchor.x = .5;
    game.add.bitmapText(game.width / 2, 560, 'font', 'Collect targets matching car color', 36).anchor.x = .5;
    game.add.bitmapText(game.width / 2, 600, 'font', 'Avoid other targets', 36).anchor.x = .5;
    var leftCar = game.add.sprite(game.width / 2 - 250, 200, 'car');
    leftCar.anchor.set(.5);
    do {
      tintColor = bgColors[game.rnd.between(0, bgColors.length - 1)];
    } while (pickedColors.indexOf(tintColor) >= 0)
    leftCar.tint = tintColor;
    pickedColors.push(tintColor);
    var leftCarTween = game.add.tween(leftCar).to({
      x: game.width / 2 - 50
    }, 500, 'Linear', true, 0, -1);
    leftCarTween.yoyo(true);
    var rightCar = game.add.sprite(game.width / 2 + 250, 440, 'car');
    rightCar.anchor.set(.5);
    do {
      tintColor = bgColors[game.rnd.between(0, bgColors.length - 1)];
    } while (pickedColors.indexOf(tintColor) >= 0)
    rightCar.tint = tintColor;
    pickedColors.push(tintColor);
    var rightCarTween = game.add.tween(rightCar).to({
      x: game.width / 2 + 50
    }, 500, 'Linear', true, 0, -1);
    rightCarTween.yoyo(true);
    var playButton = game.add.button(game.width / 2, game.height - 150, 'playbutton', this.startGame);
    playButton.anchor.set(.5);
    var tween = game.add.tween(playButton).to({
      width: 220,
      height: 220
    }, 1500, 'Linear', true, 0, -1);
    tween.yoyo(true);
  },
  startGame: function() {
    game.state.start('PlayGame');
  }
};

var playGame = function(game) {};
playGame.prototype = {
  create: function() {
    this.bgMusic = game.add.audio('bgmusic');
    this.bgMusic.loopFull(1);
    this.hitSound = game.add.audio('hit');
    score = 0;
    savedData = localStorage.getItem(localStorageName) == null ? { score: 0 } : JSON.parse(localStorage.getItem(localStorageName));
    var tintColor = bgColors[game.rnd.between(0, bgColors.length - 1 )];
    document.body.style.background = '#' + tintColor.toString(16);
    var pickedColors = [tintColor];
    this.roadWidth = laneWidth * 2 + lineWidth;
    var roadSeparator = game.add.tileSprite(this.roadWidth, 0, game.width - (this.roadWidth * 2), game.height, 'particle');
    roadSeparator.tint = tintColor;
    var leftLine = game.add.tileSprite(laneWidth, 0, lineWidth, game.height, 'particle');
    leftLine.tint = tintColor;
    var rightLine = game.add.tileSprite(game.width - laneWidth - lineWidth, 0, lineWidth, game.height, 'particle');
    rightLine.tint = tintColor;
    this.carGroup = game.add.group();
    this.targetGroup = game.add.group();
    this.scoreText = game.add.bitmapText(game.width / 2, 40, 'font', '0', 120);
    this.scoreText.anchor.x = .5;
    this.carGroup = game.add.group();
    this.targetGroup = game.add.group();
    for(var i = 0; i < 2; i++) {
      cars[i] = game.add.sprite(0, game.height - 120, 'car');
      cars[i].positions = [(game.width + roadSeparator.width) / 2 * i + laneWidth / 2, (game.width + roadSeparator.width) / 2 * i + laneWidth + lineWidth + laneWidth / 2];
      cars[i].anchor.set(.5);
      do {
        tintColor = bgColors[game.rnd.between(0, bgColors.length - 1)];
      } while(pickedColors.indexOf(tintColor) >= 0)
      cars[i].tint = tintColor;
      pickedColors.push(tintColor);
      cars[i].canMove = true;
      cars[i].side = i;
      cars[i].x = cars[i].positions[cars[i].side];
      game.physics.enable(cars[i], Phaser.Physics.ARCADE);
      cars[i].body.allowRotation = false;
      cars[i].body.moves = false;
      cars[i].smokeEmitter = game.add.emitter(cars[i].x, cars[i].y + cars[i].height / 2 + 2, 20);
      cars[i].smokeEmitter.makeParticles('particle');
      cars[i].smokeEmitter.setXSpeed(-15, 15);
      cars[i].smokeEmitter.setYSpeed(50, 150);
      cars[i].smokeEmitter.setAlpha(.2, .5);
      cars[i].smokeEmitter.start(false, 500, 20);
      cars[i].smokeEmitter.forEach(function(p) {
        p.tint = cars[i].tint;
      });
      this.carGroup.add(cars[i]);
    }
    game.input.onDown.add(this.moveCar, this);
    this.leftKey = game.input.keyboard.addKey(Phaser.Keyboard.Z);
    this.leftKey.onDown.add(this.moveCar, this);
    this.rightKey = game.input.keyboard.addKey(Phaser.Keyboard.X);
    this.rightKey.onDown.add(this.moveCar, this);
    this.targetLoop = game.time.events.loop(targetDelay, function() {
      for(var i = 0; i < 2; i++) {
        var target = new Target(game, i);
        game.add.existing(target);
        this.targetGroup.add(target);
        target.missed.add(this.targetFail, this);
      }
    }, this);
    this.scoreLoop = game.time.events.loop(250, function() {
      score++;
      this.scoreText.text = score.toString();
    }, this);
  },
  update: function(e) {
    cars[0].smokeEmitter.x = cars[0].x;
    cars[1].smokeEmitter.x = cars[1].x;
    game.physics.arcade.collide(this.carGroup, this.targetGroup, function(c, t) {
      if(c.tint == t.tint) {
        t.destroy();
        this.hitSound.play();
      } else {
        this.targetFail(t);
      }
    }, null, this);
  },
  moveCar: function(e) {
    var carToMove
    var isKeyboard = e instanceof Phaser.Key;
    if(isKeyboard) {
      if(e.keyCode == 88) {
        carToMove = 1;
      } else {
        carToMove = 0;
      }
    } else {
      var carToMove = Math.floor(e.position.x / (game.width / 2));
    }
    if(cars[carToMove].canMove) {
      cars[carToMove].canMove = false;
      var steerTween = game.add.tween(cars[carToMove]).to({
        angle: 20 - 40 * cars[carToMove].side
      }, carTurnSpeed / 2, Phaser.Easing.Linear.None, true);
      steerTween.onComplete.add(function() {
        var steerTween = game.add.tween(cars[carToMove]).to({
          angle: 0
        }, carTurnSpeed / 2, Phaser.Easing.Linear.None, true);
      });
      cars[carToMove].side = 1 - cars[carToMove].side;
      var moveTween = game.add.tween(cars[carToMove]).to({
        x: cars[carToMove].positions[cars[carToMove].side]
      }, carTurnSpeed, Phaser.Easing.Linear.None, true);
      moveTween.onComplete.add(function() {
        cars[carToMove].canMove = true;
      });
    }
  },
  targetFail: function(t) {
    game.input.keyboard.removeKey(Phaser.Keyboard.Z);
    game.input.keyboard.removeKey(Phaser.Keyboard.X);
    cars[0].smokeEmitter.on = false;
    cars[1].smokeEmitter.on = false;
    game.time.events.remove(this.targetLoop);
    game.time.events.remove(this.scoreLoop);
    game.tweens.removeAll();
    for(var i = 0; i < this.targetGroup.length; i++) {
      this.targetGroup.getChildAt(i).body.velocity.y = 0;
    }
    game.input.onDown.remove(this.moveCar, this);
    var explosionEmitter = game.add.emitter(t.x, t.y, 200);
    explosionEmitter.gravity = 0;
    explosionEmitter.makeParticles('particle');
    explosionEmitter.gravity = 0;
    explosionEmitter.setAlpha(.2, 1);
    explosionEmitter.minParticleScale = .5;
    explosionEmitter.maxParticleScale = 3;
    explosionEmitter.start(true, 2000, null, 200);
    explosionEmitter.forEach(function(p) {
      p.tint = t.tint;
    });
    t.destroy();
    this.bgMusic.stop();
    var explosionSound = game.add.audio('explosion');
    explosionSound.play();
    game.time.events.add(Phaser.Timer.SECOND * 2, function() {
      game.state.start('GameOverScreen');
    }, this);
  }
};

var gameOverScreen = function(game) {};
gameOverScreen.prototype = {
  create: function() {
    var bestScore = Math.max(score, savedData.score);
    var titleBG = game.add.tileSprite(0, 0, game.width, game.height, 'backsplash');
    titleBG.tint = bgColors[game.rnd.between(0, bgColors.length - 1)];
    document.body.style.background = '#' + titleBG.tint.toString(16);
    game.add.bitmapText(game.width / 2, 50, 'font', 'Your score', 90).anchor.x = .5;
    game.add.bitmapText(game.width / 2, 150, 'font', score.toString(), 120).anchor.x = .5;
    game.add.bitmapText(game.width / 2, 350, 'font', 'Best score', 90).anchor.x = .5;
    game.add.bitmapText(game.width / 2, 450, 'font', bestScore.toString(), 120).anchor.x = .5;
    localStorage.setItem(localStorageName, JSON.stringify({ score: bestScore }));
    var playButton = game.add.button(game.width / 2, game.height - 150, 'playbutton', this.startGame);
    playButton.anchor.set(.5);
    var tween = game.add.tween(playButton).to({
      width: 220,
      height: 220
    }, 1500, 'Linear', true, 0, -1);
    tween.yoyo(true);
  },
  startGame: function() {
    game.state.start('PlayGame');
  }
};
