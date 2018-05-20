var game;
var bgColors = [0xF16745, 0xFFC65D, 0x7BC8A4, 0x4CC3D9, 0x93648D, 0x7c786a, 0x588c73, 0x8c4646, 0x2a5b84, 0x73503c];
var tunnelWidth = 256;
var shipHorizontalSpeed = 100;
var shipMoveDelay = 0;
var shipVerticalSpeed = 15000;
var swipeDistance = 10;
var barrierSpeed = 280;
var barrierGap = 120;
var shipInvisibilityTime = 1000;
var barrierIncreaseSpeed = 1.1;
var scoreHeight = 100;
var scoreSegments = [100, 50, 25, 10, 5, 2, 1];
var score;
var friendlyBarRatio = 2;
var savedData;
var localStorageName = 'myrocketgame';

Barrier = function(game, speed, tintColor) {
  var positions = [(game.width - tunnelWidth) / 2, (game.width + tunnelWidth) / 2];
  var position = game.rnd.between(0, 1);
  Phaser.Sprite.call(this, game, positions[position], -100, 'barrier');
  var cropRect = new Phaser.Rectangle(0, 0, tunnelWidth / 2, 24);
  this.crop(cropRect);
  game.physics.enable(this, Phaser.Physics.ARCADE);
  this.anchor.set(position, .5);
  this.levelTint = tintColor;
  if(game.rnd.between(0, friendlyBarRatio) != 0) {
    this.tint = tintColor;
    this.friendly = false;
  } else {
    this.friendly = true;
  }
  this.body.velocity.y = speed;
  this.body.immovable = true;
  this.placeBarrier = true;
};
Barrier.prototype = Object.create(Phaser.Sprite.prototype);
Barrier.prototype.constructor = Barrier;
Barrier.prototype.update = function() {
  if(this.placeBarrier && this.y > barrierGap) {
    this.placeBarrier = false;
    playGame.prototype.addBarrier(this.parent, this.levelTint);
  }
  if(this.y > game.height) {
    this.destroy();
  }
};

window.onload = function() {
  var width = 640;
  var height = 960;
  var windowRation = window.innerWidth / window.innerHeight;
  if(windowRation < width / height) {
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

var boot = function(game) {};
boot.prototype = {
  preload: function() {
    this.game.load.image('loading', 'assets/sprites/loading.png');
  },
  create: function() {
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.game.state.start('Preload');
  }
}

var preload = function(game) {};
preload.prototype = {
  preload: function() {
    var loadingBar = this.add.sprite(game.width / 2, game.height / 2, 'loading');
    loadingBar.anchor.setTo(0.5);
    game.load.setPreloadSprite(loadingBar);
    game.load.image('title', 'assets/sprites/title.png');
    game.load.image('playbutton', 'assets/sprites/playbutton.png');
    game.load.image('backsplash', 'assets/sprites/backsplash.png');
    game.load.image('tunnelbg', 'assets/sprites/tunnelbg.png');
    game.load.image('wall', 'assets/sprites/wall.png');
    game.load.image('ship', 'assets/sprites/ship.png');
    game.load.image('smoke', 'assets/sprites/smoke.png');
    game.load.image('barrier', 'assets/sprites/barrier.png');
    game.load.image('separator', 'assets/sprites/separator.png');
    game.load.bitmapFont('font', 'assets/fonts/font.png', 'assets/fonts/font.fnt');
    game.load.audio('bgmusic', ['assets/sounds/bgmusic.mp3','assets/sounds/bgmusic.ogg']);
    game.load.audio('explosion', ['assets/sounds/explosion.mp3','assets/sounds/explosion.ogg']);
  },
  create: function() {
    this.game.state.start('TitleScreen');
  }
}

var titleScreen = function(game) {};
titleScreen.prototype = {
  create: function() {
    savedData = localStorage.getItem(localStorageName) == null ? {score: 0} : JSON.parse(localStorage.getItem(localStorageName));
    var titleBG = game.add.tileSprite(0, 0, game.width, game.height, 'backsplash');
    titleBG.tint = bgColors[game.rnd.between(0, bgColors.length - 1)];
    document.body.style.background = '#' + titleBG.tint.toString(16);
    var title = game.add.image(game.width / 2, 210, 'title');
    title.anchor.set(.5);
    game.add.bitmapText(game.width / 2, 480, 'font', 'Best score', 48).anchor.x = .5;
    game.add.bitmapText(game.width / 2, 530, 'font', savedData.score.toString(), 72).anchor.x = .5;
    var playButton = game.add.button(game.width / 2, game.height - 150, 'playbutton', this.startGame);
    playButton.anchor.set(.5);
    var tween = game.add.tween(playButton).to({
      width: 220,
      height: 220,
    }, 1500, 'Linear', true, 0, -1);
    tween.yoyo(true);
  },
  startGame: function() {
    game.state.start('HowToPlay');
  }
}

var howToPlay = function(game) {};
howToPlay.prototype = {
  create: function() {
    var titleBG = game.add.tileSprite(0, 0, game.width, game.height, 'backsplash');
    titleBG.tint = bgColors[game.rnd.between(0, bgColors.length - 1)];
    document.body.style.background = '#' + titleBG.tint.toString(16);
    game.add.bitmapText(game.width / 2, 120, 'font', 'Move left / right', 60).anchor.x = .5;
    game.add.bitmapText(game.width / 2, 200, 'font', 'Tap, Click, or SPACEBAR key', 36).anchor.x = .5;
    game.add.bitmapText(game.width / 2, 400, 'font', 'Move to the bottom', 60).anchor.x = .5;
    game.add.bitmapText(game.width / 2, 480, 'font', 'Swipe, Drag, or SHIFT key', 36).anchor.x = .5;
    var horizontalShip = game.add.sprite(game.width / 2 - 50, 260, 'ship');
    horizontalShip.anchor.set(.5);
    horizontalShip.scale.set(.5);
    var horizontalShipTween = game.add.tween(horizontalShip).to({
      x: game.width / 2 + 50
    }, 500, 'Linear', true, 0, -1);
    horizontalShipTween.yoyo(true);
    var verticalShip = game.add.sprite(game.width / 2, 540, 'ship');
    verticalShip.anchor.set(.5);
    verticalShip.scale.set(.5);
    var verticalShipTween = game.add.tween(verticalShip).to({
      y: 640
    }, 500, 'Linear', true, 0, -1);
    var playButton = game.add.button(game.width / 2, game.height - 150, 'playbutton', this.startGame);
    playButton.anchor.set(.5);
    var tween = game.add.tween(playButton).to({
      width: 220,
      height: 220,
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
    this.saveBarrierSpeed = barrierSpeed;
    this.bgMusic = game.add.audio('bgmusic');
    this.bgMusic.loopFull(1);
    score = 0;
    savedData = localStorage.getItem(localStorageName) == null ? {score: 0} : JSON.parse(localStorage.getItem(localStorageName));
    var tintColor = bgColors[game.rnd.between(0, bgColors.length - 1)]
    var tunnelBG = game.add.tileSprite(0, 0, game.width, game.height, 'tunnelbg');
    tunnelBG.tint = tintColor;
    document.body.style.background = '#' + tintColor.toString(16);
    var leftWallBG = game.add.tileSprite(-tunnelWidth / 2, 0, game.width / 2, game.height, 'wall');
    leftWallBG.tint = tintColor;
    var rightWallBG = game.add.tileSprite((game.width + tunnelWidth) / 2, 0, game.width / 2, game.height, 'wall');
    rightWallBG.tint = tintColor;
    rightWallBG.tileScale.x = -1;
    for(var i = 1; i <= scoreSegments.length; i++) {
      var leftSeparator = game.add.sprite((game.width - tunnelWidth) / 2, scoreHeight * i, 'separator');
      leftSeparator.tint = tintColor;
      leftSeparator.anchor.set(1, 0);
      var rightSeparator = game.add.sprite((game.width + tunnelWidth) / 2, scoreHeight * i, 'separator');
      rightSeparator.tint = tintColor;
      var posX = (game.width - tunnelWidth) / 2 - leftSeparator.width / 2;
      if(i % 2 == 0) {
        posX = (game.width + tunnelWidth) / 2 + leftSeparator.width / 2;
      }
      game.add.bitmapText(posX, scoreHeight * (i - 1) + scoreHeight / 2 - 18, 'font', scoreSegments[i - 1].toString(), 36).anchor.x = .5
    }
    this.scoreText = game.add.bitmapText(20, game.height - 90, 'font', '0', 48);
    this.shipPositions = [(game.width - tunnelWidth) / 2 + 32, (game.width + tunnelWidth) / 2 - 32];
    this.ship = game.add.sprite(this.shipPositions[0], 860, 'ship');
    this.ship.side = 0;
    this.ship.destroued = false;
    this.ship.canMove = true;
    this.ship.canSwipe = false;
    this.ship.anchor.set(.5);
    this.game.physics.enable(this.ship, Phaser.Physics.ARCADE);
    game.input.onDown.add(this.moveShip, this);
    game.input.onUp.add(function() {
      this.ship.canSwipe = false;
    }, this);
    this.smokeEmitter = game.add.emitter(this.ship.x, this.ship.y + 10, 20);
    this.smokeEmitter.makeParticles('smoke');
    this.smokeEmitter.setXSpeed(-15, 15);
    this.smokeEmitter.setYSpeed(50, 150);
    this.smokeEmitter.setAlpha(.5, 1);
    this.smokeEmitter.start(false, 1000, 40);
    this.verticalTween = game.add.tween(this.ship).to({
      y: 0
    }, shipVerticalSpeed, Phaser.Easing.Linear.None, true);
    this.barrierGroup = game.add.group();
    this.addBarrier(this.barrierGroup, tintColor);
    this.highlightBar = game.add.tileSprite(game.width / 2, 0, tunnelWidth, scoreHeight, 'smoke');
    this.highlightBar.anchor.set(.5, 0);
    this.highlightBar.alpha = .1;
    this.highlightBar.visible = false;
    game.time.events.loop(250, this.updateScore, this);
    this.spacebar = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    this.spacebar.onDown.add(this.moveShip, this);
    this.shift = game.input.keyboard.addKey(Phaser.Keyboard.SHIFT);
    this.shift.onDown.add(this.restartShip, this);
  },
  moveShip: function(e) {
    var isKeyboard = e instanceof Phaser.Key;
    if(!isKeyboard) {
      this.ship.canSwipe = true;
    }
    if(!this.ship.destroyed && this.ship.canMove) {
      this.ship.canMove = false;
      this.ship.side = 1 - this.ship.side;
      var horizontalTween = game.add.tween(this.ship).to({
        x: this.shipPositions[this.ship.side]
      }, shipHorizontalSpeed, Phaser.Easing.Linear.None, true);
      horizontalTween.onComplete.add(function() {
        game.time.events.add(shipMoveDelay, function() {
          this.ship.canMove = true;
        }, this);
      }, this);
      var ghostShip = game.add.sprite(this.ship.x, this.ship.y, 'ship');
      ghostShip.alpha = .5;
      ghostShip.anchor.set(.5);
      var ghostTween = game.add.tween(ghostShip).to({
        alpha: 0
      }, 350, Phaser.Easing.Linear.None, true);
      ghostTween.onComplete.add(function() {
        ghostShip.destroy();
      });
    }
  },
  update: function() {
    this.smokeEmitter.x = this.ship.x;
    this.smokeEmitter.y = this.ship.y;
    if(this.ship.canSwipe) {
      if(Phaser.Point.distance(game.input.activePointer.positionDown, game.input.activePointer.position) > swipeDistance) {
        this.restartShip();
      }
    }
    if(!this.ship.destroyed && this.ship.alpha == 1) {
      if(this.ship.y < scoreHeight * scoreSegments.length) {
        this.highlightBar.visible = true;
        var row = Math.floor(this.ship.y / scoreHeight);
        this.highlightBar.y = row * scoreHeight;
      }
      game.physics.arcade.collide(this.ship, this.barrierGroup, null, function(s, b) {
        if(!b.friendly) {
          this.highlightBar.visible = true;
          this.ship.destroyed = true;
          this.smokeEmitter.destroy();
          var destroyTween = game.add.tween(this.ship).to({
            x: this.ship.x + game.rnd.between(-100, 100),
            y: this.ship.y - 100,
            rotation: 10
          }, 1000, Phaser.Easing.Linear.None, true);
          destroyTween.onComplete.add(function() {
            this.bgMusic.stop();
            var explosionSound = game.add.audio('explosion');
            explosionSound.play();
            var explosionEmitter = game.add.emitter(this.ship.x, this.ship.y, 200);
            explosionEmitter.makeParticles('smoke');
            explosionEmitter.setAlpha(.5, 1);
            explosionEmitter.minParticleScale = .5;
            explosionEmitter.maxParticleScale = 2;
            explosionEmitter.start(true, 2000, null, 200);
            this.ship.destroy();
            game.time.events.add(Phaser.Timer.SECOND * 2, function() {
              barrierSpeed = this.saveBarrierSpeed;
              game.state.start('GameOverScreen');
            });
          }, this);
        } else {
          if(b.alpha == 1) {
            var barrierTween = game.add.tween(b).to({
              alpha: 0
            }, 200, Phaser.Easing.Bounce.Out, true);
            if(this.ship.y < scoreHeight * scoreSegments.length) {
              var row = Math.floor(this.ship.y / scoreHeight);
              score += scoreSegments[row] * 5;
              this.scoreText.text = score.toString();
            }
          }
        }
      }, this);
    }
  },
  restartShip: function() {
    this.highlightBar.visible = false;
    if(!this.ship.destroyed && this.ship.alpha == 1) {
      barrierSpeed *= barrierIncreaseSpeed;
      for(var i = 0; i < this.barrierGroup.length; i++) {
        this.barrierGroup.getChildAt(i).body.velocity.y = barrierSpeed;
      }
      this.ship.canSwipe = false;
      this.verticalTween.stop();
      this.ship.alpha = .5;
      this.verticalTween = game.add.tween(this.ship).to({
        y: 860
      }, 100, Phaser.Easing.Linear.None, true);
      this.verticalTween.onComplete.add(function() {
        this.verticalTween = game.add.tween(this.ship).to({
          y: 0
        }, shipVerticalSpeed, Phaser.Easing.Linear.None, true);
        var alphaTween = game.add.tween(this.ship).to({
          alpha: 1
        }, shipInvisibilityTime, Phaser.Easing.Bounce.In, true);
      }, this);
    }
  },
  addBarrier: function(group, tintColor) {
    var barrier = new Barrier(game, barrierSpeed, tintColor);
    game.add.existing(barrier);
    group.add(barrier);
  },
  updateScore: function() {
    if(this.ship.alpha == 1 && !this.ship.destroyed) {
      if(this.ship.y < scoreHeight * scoreSegments.length) {
        var row = Math.floor(this.ship.y / scoreHeight);
        score += scoreSegments[row];
        this.scoreText.text = score.toString();
      }
    }
  }
}

var gameOverScreen = function(game) {};
gameOverScreen.prototype = {
  create: function() {
    var bestScore = Math.max(score, savedData.score);
    var titleBG = game.add.tileSprite(0, 0, game.width, game.height, 'backsplash');
    titleBG.tint = bgColors[game.rnd.between(0, bgColors.length - 1)];
    document.body.style.background = '#' + titleBG.tint.toString(16);
    game.add.bitmapText(game.width / 2, 50, 'font', 'Your score', 48).anchor.x = .5;
    game.add.bitmapText(game.width / 2, 150, 'font', score.toString(), 72).anchor.x = .5;
    game.add.bitmapText(game.width / 2, 350, 'font', 'Best score', 48).anchor.x = .5;
    game.add.bitmapText(game.width / 2, 450, 'font', bestScore.toString(), 72).anchor.x = .5;
    localStorage.setItem(localStorageName, JSON.stringify({
      score: bestScore
    }));
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
}
