export default class Game extends Phaser.Scene {
  constructor() {
    super("game");
    // Estados intro/jump: 0=intro,1=esp1,2=esp2,3=activo
    this.introState = 0;
    // Muros infinitos
    this.wallTilemapLayers = [];
    this.wallMapHeightPx = 0;
    this.wallMapsCreados = 0;
  }

  init() {
    this.score = 0;
    this.direction = 0;
    this.begingame= false;
    this.isStuck = false;
    this.isPlayingFalling = false; // Para animación de caída
    this.stuckTimer = null;
  }

  preload() {
    // Assets de juego
    this.load.spritesheet("player", "public/assets/fall.png", { frameWidth: 46, frameHeight: 64 });
    this.load.image("tileset", "public/assets/texture.png");
    this.load.tilemapTiledJSON("map", "public/assets/tilemap/slime.json");
    this.load.tilemapTiledJSON("wallmap", "public/assets/tilemap/slimewall.json");
    // Intro y salto
    this.load.spritesheet("inicio", "public/assets/inicio.png", { frameWidth: 184, frameHeight: 64 });
    this.load.spritesheet("saltoizq", "public/assets/saltoizq.png", { frameWidth: 184, frameHeight: 182 });
    this.load.spritesheet("saltoder", "public/assets/saltoder.png", { frameWidth: 184, frameHeight: 182 });
  }

  create() {
    // Mapa base
    const map = this.make.tilemap({ key: "map" });
    const tiles = map.addTilesetImage("texture", "tileset");

    this.floorLayer = map.createLayer("Floor", tiles, 0, 0);
    this.wallLayer  = map.createLayer("Wall",  tiles, 0, 0);
    this.floorLayer.setCollisionByExclusion([-1]);
    this.wallLayer .setCollisionByExclusion([-1]);

    // Coords de spawn
    const objLayer = map.getObjectLayer("Point");
    const spawnObj = objLayer.objects.find(o => o.name === "Spawn");
    const spawnX = spawnObj ? spawnObj.x : this.scale.width/2;
    const spawnY = spawnObj ? spawnObj.y : this.scale.height/2;

    // Jugador, oculto hasta post-intro
    this.player = this.physics.add.sprite(spawnX, spawnY, "player")
      .setGravityY(0).setBounce(0.2).setCollideWorldBounds(true).setScale(2.6)
      .setVisible(false);
    this.player.setOffset(5, 0);
    this.physics.add.collider(this.player, this.floorLayer);
    // muros infinitos se añaden más tarde a partir de wallmap

    // Input
    this.cursors  = this.input.keyboard.createCursorKeys();
    this.keyR     = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Animaciones intro/salto
    this.anims.create({ key: 'intro',    frames: this.anims.generateFrameNumbers('inicio',   { start: 0,  end: 26 }), frameRate: 8, repeat: 0 });
    this.anims.create({ key: 'preJump',  frames: this.anims.generateFrameNumbers('inicio',   { start: 27, end: 29 }), frameRate: 8, repeat: 0 });
    this.anims.create({ key: 'jumpLeft', frames: this.anims.generateFrameNumbers('saltoizq', { start: 0,  end: 3  }), frameRate: 8, repeat: 0 });
    this.anims.create({ key: 'jump',frames: this.anims.generateFrameNumbers('saltoder',{ start: 0,  end: 3  }), frameRate: 8, repeat: 0 });

    // Animaciones de colisión y caída
    this.anims.create({ key: "pegao", frames: [{ key: "player", frame: 1 }], frameRate: 10 });
    this.anims.create({ key: "caida", frames: this.anims.generateFrameNumbers("player", { start: 2, end: 8 }), frameRate: 2, repeat: 0 });

    // Logo/intro en spawn
    this.logo = this.add.sprite(spawnX, spawnY, 'inicio').setScale(2.6).setOrigin(0.5, 0.5);
    this.logo.play('intro');
    this.logo.once('animationcomplete-intro', () => this.introState = 1);

    // Cámara y límites
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setBounds(0, -100000, 720, 100000 + 1280);
    this.physics.world.setBounds(0, -100000, 720, 100000 + 1280);
  }

  update() {
    // Fase intro/jump
    if (this.introState < 3) {
    if (Phaser.Input.Keyboard.JustDown(this.keySpace)) {
    if (this.introState === 1) {
      this.logo.play('preJump');
      this.introState = 2;
    } 
    else if (this.introState === 2) {
      // Elegimos aleatoriamente -1 (izq) o +1 (der)
      const direction = Phaser.Math.Between(0, 1) === 0 ? -1 : 1;
      this.direction = direction;
      // Asumimos una sola animación 'jump' que cubre ambos saltos

      // 1) Guardamos la posición del logo ANTES de la animación


    // Asignamos la animación y la orientación
    this.logo.flipX = (direction === -1);
    this.logo.setOrigin(0.5, 0.8);
    this.logo.play('jump');

    this.introState = 3;

    this.logo.once('animationcomplete-jump', () => {
        const finalFlipX = this.logo.flipX;
        const initialY = this.logo.y; 

     
        this.logo.destroy();

        this.player.setVisible(true);
         const playerHalfWidth = (this.player.displayWidth*3) / 2;
        let finalX;
        let newOffset;

        if (finalFlipX) { 
            newOffset = { x: -2, y: 0 };
            finalX = playerHalfWidth + newOffset.x;
        } else { 
            newOffset = { x: 2, y: 0 };
            finalX = this.scale.width - playerHalfWidth + newOffset.x;
        }

        const finalY = initialY - 200;

        this.player.setPosition(finalX, finalY);
        this.player.flipX = finalFlipX;
        this.player.setOffset(newOffset.x, newOffset.y);
    

        this.physics.add.collider(this.player, this.wallLayer, this.handleStick, null, this);
        this.crearNuevaCapaWallmap(0);
        
        if (finalFlipX) { 
            this.player.setVelocityX(-5); 
        } else { 
            this.player.setVelocityX(5);
        }
        
        this.begingame = true;
    });
    }
  
  return;
}

    }

    // Gameplay normal
    // Estado “pegado”
    if (this.isStuck === true) {
      this.player.setVelocity(0,0);
      this.player.flipX = this.direction === 1 ? true : false;
      this.player.setOffset(0, 0);
      this.player.play('pegao', true);
      if (this.cursors.up.isDown) {
        this.player.body.allowGravity = true;
        this.player.setVelocityY(-330);
        this.isStuck = false;
        this.stuckTimer.remove(false);
      }
      return;
    }

    // Estado “cayendo lento”
    if (this.isStuck === 'falling') {
      if (!this.isPlayingFalling) {
        this.player.play('caida', true);
        this.isPlayingFalling = true;
      }
      // Movimiento lateral en caída lenta
      this.player.setVelocityX(this.cursors.left.isDown ? -160 : this.cursors.right.isDown ? 160 : 0);
      if (this.cursors.up.isDown) {
        this.player.setVelocityY(-330);
        this.isStuck = false;
        this.stuckTimer.remove(false);
      }
      return;
    }

    // Movimiento normal y salto
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160); this.player.flipX = false; this.player.setOffset(4,0); this.direction = -1;
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160); this.player.flipX = true; this.player.setOffset(-4,0); this.direction = 1;
    } else if (this.direction !== 0) {
      this.player.setVelocityX(0); this.player.flipX = this.direction === 1? true: false; this.player.setOffset(4,0);
    }
    if (this.cursors.up.isDown && (this.player.body.blocked.down || this.player.body.touching.down)) {
      this.player.setVelocityY(-330);
    }
    if (Phaser.Input.Keyboard.JustDown(this.keyR)) {
      this.scene.restart();
    }
  }

  handleStick(player) {
    if ((!this.isStuck && !player.body.touching.down) || this.begingame === true) {
      this.isStuck = true;
      player.setVelocity(0,0);
      player.body.allowGravity = false;
      this.stuckTimer = this.time.delayedCall(1000, () => {
        player.body.allowGravity = true;
        player.setVelocityY(0);
        this.isStuck = 'falling';
      });
    }
  }

  crearNuevaCapaWallmap(offsetY) {
    const wallmap = this.make.tilemap({ key: "wallmap" });
    const tileset = wallmap.addTilesetImage("texture", "tileset");
    const wallLayer = wallmap.createLayer("Wall", tileset, 0, offsetY);
    wallLayer.setCollisionByExclusion([-1]);
    this.physics.add.collider(this.player, wallLayer, this.handleStick, null, this);
    this.wallTilemapLayers.push({ wallLayer, offsetY });
    if (this.wallMapHeightPx === 0) {
      this.wallMapHeightPx = wallmap.height * wallmap.tileHeight;
    }
    this.wallMapsCreados++;
  }
}
