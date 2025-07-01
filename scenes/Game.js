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

    this.load.image("tileset", "public/assets/texture.png");
    this.load.tilemapTiledJSON("map", "public/assets/tilemap/slime.json");
    this.load.tilemapTiledJSON("wallmap", "public/assets/tilemap/slimewall.json");
    this.load.image ("fondo", "public/assets/bg_solid.png");
    this.load.image ("nubes", "public/assets/nubes.png");
    this.load.image("icono1", "public/assets/icono1.png");
    this.load.image("icono2", "public/assets/icono2.png");
    this.load.image("pausa", "public/assets/iconopausa.png");
    this.load.image("backbotton", "public/assets/backbotton.png");
    this.load.image("configback", "public/assets/configback.png");
    this.load.image("exitbotton", "public/assets/exitbotton.png");
    this.load.image("musicbotton", "public/assets/musicbotton.png");
    this.load.image("optionbotton", "public/assets/optionbotton.png");
    this.load.image("soundbotton", "public/assets/soundbotton.png");
    this.load.image("pauseback", "public/assets/pauseback.png");
    this.load.image("continuebotton", "public/assets/continuebotton.png");
    this.load.image("fondomenu", "public/assets/fondomenu.png");
    this.load.image("titleinicio", "public/assets/titleinicio.png");
    this.load.image("play", "public/assets/play.png");
    this.load.image("playselect", "public/assets/playselect.png");
    this.load.image("credits", "public/assets/credits.png");
    this.load.image("creditsselect", "public/assets/creditsselect.png");
    this.load.image("setting", "public/assets/setting.png");
    this.load.image("settingselect", "public/assets/settingselect.png");
    this.load.image("scores", "public/assets/scores.png");
    this.load.image("scoresselect", "public/assets/scoresselect.png");
    this.load.image("gameoverback", "public/assets/gameoverback.png");
    this.load.image("tap", "public/assets/tap.png");

    // SpriteSheets de animaciones
    this.load.spritesheet("player", "public/assets/fall.png", { frameWidth: 46, frameHeight: 64 });
    this.load.spritesheet("inicio", "public/assets/inicio.png", { frameWidth: 184, frameHeight: 64 });
    this.load.spritesheet("saltoizq", "public/assets/saltoizq.png", { frameWidth: 184, frameHeight: 182 });
    this.load.spritesheet("saltoder", "public/assets/saltoder.png", { frameWidth: 184, frameHeight: 182 });
    this.load.spritesheet("salto2izq", "public/assets/salto2izq.png", { frameWidth: 64, frameHeight: 82 });
    this.load.spritesheet("salto2der", "public/assets/salto2der.png", { frameWidth: 64, frameHeight: 82 });
    this.load.spritesheet("explosivos", "public/assets/explosivos.png", { frameWidth: 13, frameHeight: 66 });
    this.load.spritesheet("escudo", "public/assets/escudo.png", { frameWidth: 13, frameHeight: 66 });
    this.load.spritesheet("puntos", "public/assets/puntos.png", { frameWidth: 13, frameHeight: 66 });
    this.load.spritesheet("salud", "public/assets/salud.png", { frameWidth: 13, frameHeight: 66 });
  }

  create() {
  
  // ─── UI FIJA: CONTADOR (icono2 + texto) ─────────────────
  this.isGamePaused = false;

  const W = this.scale.width;
  const H = this.scale.height;

  // 1) Fondo del contador (icono2), esquina superior izquierda
  this.counterBg = this.add.image(10, 10, 'icono2')
    .setOrigin(0, 0)
    .setScale(2.5) // <-- Agranda el icono 
    .setScrollFactor(0)
    .setDepth(1000);

  // 2) Texto del contador (inicial “0”), ajusta offsets según tu arte
  this.counterText = this.add.text(
    this.counterBg.x + 120,
    this.counterBg.y + 8,
    '00000',
    { fontFamily: 'Minecraft', fontSize: '40px', color: '#ffffff' }
  )
  .setScrollFactor(0)
  .setDepth(1000);


  // ─── UI FIJA: BOTÓN DE PAUSA (iconopausa), esquina superior derecha ─────────────────
  this.pauseBtn = this.add.image(W - 10, 10, 'pausa')
    .setOrigin(1, 0)
    .setScale(1.5) // <-- Agranda el icono 
    .setScrollFactor(0)
    .setDepth(1000)
    .setInteractive({ useHandCursor: true })
    .on('pointerdown', () => this.togglePause());


  // ─── MENÚ DE PAUSA (inicia oculto) ─────────────────
  this.pauseMenu = this.add.container(0, 0)
    .setScrollFactor(0)
    .setDepth(1000)
    .setVisible(false);

  const cX = this.scale.width / 2;
  const cY = this.scale.height / 2;

// Centrado en la pantalla
// Usa cX y cY aquí, no los declares de nuevo

// Fondo del menú
const bg = this.add.image(cX, cY, 'pauseback').setOrigin(0.5);

// Botones con más separación vertical
const spacing = 130; // antes era 60

const btnContinue = this.add.image(cX, cY +70 - spacing, 'continuebotton')
  .setOrigin(0.5)
  .setInteractive({ useHandCursor: true })
  .on('pointerdown', () => this.togglePause());

const btnOptions = this.add.image(cX, cY +70 , 'optionbotton')
  .setOrigin(0.5)
  .setInteractive({ useHandCursor: true })
  .on('pointerdown', () => {
    // Aquí va tu lógica para opciones
  });

const btnExit = this.add.image(cX, cY +70 + spacing, 'exitbotton')
  .setOrigin(0.5)
  .setInteractive({ useHandCursor: true })
  .on('pointerdown', () => {
    this.scene.start('menu'); // Va a menu
  });

// Agregar todo al contenedor
this.pauseMenu.add([ bg, btnContinue, btnOptions, btnExit ]);

  this.configMenu = this.add.container(0, 0)
  .setScrollFactor(0)
  .setDepth(1001)     // por encima de pauseMenu
  .setVisible(false); // oculto al inicio

// Centro para configMenu (nombres distintos)
const cfgX = this.scale.width  / 2;
const cfgY = this.scale.height / 2;

// 1) Fondo “configback”
const cfgBg = this.add.image(cfgX, cfgY, 'configback')
  .setOrigin(0.5);

// 2) Botón Music
const btnMusic = this.add.image(cfgX - 130, cfgY - 120, 'musicbotton') // ← mueve a la izquierda
  .setOrigin(0.5)
  .setInteractive({ useHandCursor: true })
  .on('pointerdown', () => {
    // toggle música on/off
  });

// 3) Botón Sound
const btnSound = this.add.image(cfgX - 130, cfgY + 20, 'soundbotton') // ← mueve a la izquierda
  .setOrigin(0.5)
  .setInteractive({ useHandCursor: true })
  .on('pointerdown', () => {
    // toggle efectos on/off
  });

// 4) Botón Back
const btnBack = this.add.image(cfgX, cfgY + 200, 'backbotton')
  .setOrigin(0.5)
  .setInteractive({ useHandCursor: true })
  .on('pointerdown', () => {
    this.configMenu.setVisible(false);
    this.pauseMenu.setVisible(true);
  });

// 5) Añadir todos los elementos al container
this.configMenu.add([ cfgBg, btnMusic, btnSound, btnBack ]);

// —— haz que el botón Options abra configMenu ——
// suponiendo que 'btnOptions' ya existe:
btnOptions.on('pointerdown', () => {
  this.pauseMenu.setVisible(false);
  this.configMenu.setVisible(true);
});

  this.map = this.make.tilemap({ key: 'wallmap' });
  const tileset = this.map.addTilesetImage('texture', 'tileset');
  const fondo = this.map.createLayer('Wall', tileset, 0, 0);

  // --- TILEMAP INFINITO ---
  this.tilemapLayers = [];
  this.tilemapHeightPx = 24 * 32;

  // Centro de pantalla
  const centerX = this.cameras.main.width / 2;
  const centerY = this.cameras.main.height / 2;

  // Fondo y nubes
  this.add.image(centerX, centerY, "fondo").setScale(1).setScrollFactor(0); 
  this.nubes1 = this.add.image(centerX, centerY + 100, "nubes").setScale(1).setScrollFactor(0);
  this.nubes2 = this.add.image(centerX + this.nubes1.width, centerY + 100, "nubes").setScale(1).setScrollFactor(0);

  // Mapa base
  const map = this.make.tilemap({ key: "map" });
  const tiles = map.addTilesetImage("texture", "tileset");
  this.floorLayer = map.createLayer("Floor", tiles, 0, 0);
  this.wallLayer  = map.createLayer("Wall",  tiles, 0, 0);
  this.floorLayer.setCollisionByExclusion([-1]);
  this.wallLayer.setCollisionByExclusion([-1]);

  // Coords de spawn
  const objLayer = map.getObjectLayer("Point");
  const spawnObj = objLayer.objects.find(o => o.name === "Spawn");
  const spawnX = spawnObj ? spawnObj.x : this.scale.width / 2;
  const spawnY = spawnObj ? spawnObj.y : this.scale.height / 2;

  // Jugador
  this.player = this.physics.add.sprite(spawnX, spawnY, "player")
    .setGravityY(0).setBounce(0.2).setCollideWorldBounds(true).setScale(2.6)
    .setVisible(false);
  this.player.setOffset(5, 0);

  // Colisiones principales
  this.physics.add.collider(this.player, this.floorLayer);
  this.baseWallCollider = this.physics.add.collider(
    this.player,
    this.wallLayer,
    this.handleStick,
    null,
    this
  );

  // Capa infinita
  this.crearNuevaCapaTilemap(0);

  // Input
  this.cursors  = this.input.keyboard.createCursorKeys();
  this.keyR     = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
  this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  // Animaciones
  this.anims.create({ key: 'intro',    frames: this.anims.generateFrameNumbers('inicio',   { start: 0,  end: 26 }), frameRate: 8, repeat: 0 });
  this.anims.create({ key: 'preJump',  frames: this.anims.generateFrameNumbers('inicio',   { start: 27, end: 29 }), frameRate: 8, repeat: 0 });
  this.anims.create({ key: 'jumpLeft', frames: this.anims.generateFrameNumbers('saltoizq', { start: 0,  end: 3  }), frameRate: 8, repeat: 0 });
  this.anims.create({ key: 'jump',     frames: this.anims.generateFrameNumbers('saltoder',  { start: 0,  end: 3  }), frameRate: 8, repeat: 0 });
  this.anims.create({ key: 'jump2Left',  frames: this.anims.generateFrameNumbers('salto2izq', { start: 0, end: 1 }), frameRate: 8, repeat: -1 });
  this.anims.create({ key: 'jump2Right', frames: this.anims.generateFrameNumbers('salto2der', { start: 0, end: 1 }), frameRate: 8, repeat: -1 });
  this.anims.create({ key: "pegao", frames: [{ key: "player", frame: 0 }], frameRate: 9 });
  this.anims.create({ key: "caida", frames: this.anims.generateFrameNumbers("player", { start: 1, end: 8 }), frameRate: 2, repeat: 0 });

  // Logo/intro
  this.logo = this.add.sprite(spawnX, spawnY, 'inicio').setScale(2.6).setOrigin(0.5, 0.5);
  this.logo.play('intro');
  this.logo.once('animationcomplete-intro', () => this.introState = 1);

  // Cámara
  this.cameras.main.startFollow(this.player);
  this.cameras.main.setBounds(0, -100000, 720, 100000 + 1280);
  this.physics.world.setBounds(0, -100000, 720, 100000 + 1280);
}

  togglePause() {
  this.isGamePaused = !this.isGamePaused;
  if (this.isGamePaused) {
    this.physics.world.pause();
    this.pauseMenu.setVisible(true);
    this.anims.pauseAll(); // Pausa TODAS las animaciones
  } else {
    this.physics.world.resume();
    this.pauseMenu.setVisible(false);
    this.anims.resumeAll(); // Reanuda TODAS las animaciones
  }
}

  update(time, delta) {
  if (this.isGamePaused) return;

  const camTop = this.cameras.main.scrollY;
  const topLayer = this.tilemapLayers[this.tilemapLayers.length - 1];
  if (camTop < topLayer.offsetY + 32) {
    this.crearNuevaCapaTilemap(topLayer.offsetY + 3 - this.tilemapHeightPx);
  }

  const camBottom = this.cameras.main.scrollY + this.cameras.main.height;
  // --- limpieza de capas antiguas, collider tras destroy ---
  while (this.tilemapLayers.length > 1 && this.tilemapLayers[0].offsetY > camBottom) {
    const capa = this.tilemapLayers.shift();
    if (capa.layer)    capa.layer.destroy();
    if (capa.collider) this.physics.world.removeCollider(capa.collider);
  }

  // Igual para paredes infinitas
  while (this.wallTilemapLayers.length > 1 && this.wallTilemapLayers[0].offsetY > camBottom) {
    const capa = this.wallTilemapLayers.shift();
    if (capa.wallLayer) capa.wallLayer.destroy();
    if (capa.collider) this.physics.world.removeCollider(capa.collider);
  }

  // --- Pausa todo si el personaje sale de la cámara ---
  const cam = this.cameras.main;
  const playerBottom = this.player.y + this.player.displayHeight / 2;
  const playerTop = this.player.y - this.player.displayHeight / 2;

  if (
    playerBottom < cam.scrollY || // sale por arriba
    playerTop > cam.scrollY + cam.height // sale por abajo
  ) {
    this.physics.world.pause();
    this.anims.pauseAll();
    this.isGamePaused = true;
    return;
  }

  // --- Movimiento horizontal y bucle de las nubes (SIEMPRE) ---
  const nubesSpeed = 0.5; // Ajusta la velocidad a tu gusto
  if (this.nubes1 && this.nubes2) {
    this.nubes1.x -= nubesSpeed;
    this.nubes2.x -= nubesSpeed;

    // Si una nube sale completamente por la izquierda, la reposiciona a la derecha de la otra
    if (this.nubes1.x <= -this.nubes1.width / 2) {
      this.nubes1.x = this.nubes2.x + this.nubes2.width;
    }
    if (this.nubes2.x <= -this.nubes2.width / 2) {
      this.nubes2.x = this.nubes1.x + this.nubes1.width;
    }
  }

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
    

      
        this.crearNuevaCapaWallmap(0);
        
        if (finalFlipX) { 
            this.player.setVelocityX(-5); 
        } else { 
            this.player.setVelocityX(5);
        }

        if (this.direction === 1) {
          this.player.flipX = true; 
          this.direction = -1;
        } else {
          this.player.flipX = false; 
          this.direction = 1;
        }

        this.begingame = true;
    });
    }
  
  return;
}

    }

    // Estado “pegado”
    if (this.isStuck === true) {
      this.player.setVelocity(0,0);
      this.player.flipX = this.direction === 1 ? false : true;
      this.player.setOffset(0, 0);
      this.player.play('pegao', true);
      this.isPlayingFalling = false; // <-- Reinicia cada vez que está pegado
      this.handleStick(this.player);
      return;
    }

    // Estado “cayendo lento”
    if (this.isStuck === 'falling') {
      // Solo reproduce la animación si no está ya en "caida"
      if (!this.isPlayingFalling) {
        this.player.play('caida', true);
        this.isPlayingFalling = true;
      }
      // Movimiento lateral en caída lenta
      this.player.setVelocityX(this.cursors.left.isDown ? -160 : this.cursors.right.isDown ? 160 : 0);

      // Si se presiona espacio, interrumpe la animación y el estado
      if (this.begingame && Phaser.Input.Keyboard.JustDown(this.keySpace)) {
        this.cameras.main.startFollow(this.player); // ← Vuelve a seguir al personaje
        this.player.anims.stop(); // <-- Detiene la animación "caida"
        this.player.body.allowGravity = true;
        this.player.setVelocityX(500*this.direction);
        this.player.setVelocityY(-500);
        this.isStuck = false;
        this.isPlayingFalling = false; // <-- Permite reproducir "caida" la próxima vez
        this.stuckTimer.remove(false);
        if (this.direction === 1) {
          this.player.flipX = true; 
          this.direction = -1;
        } else {
          this.player.flipX = false; 
          this.direction = 1;
        }
      }
      return;
    }

    // Movimiento normal y salto

    if (Phaser.Input.Keyboard.JustDown(this.keyR)) {
      this.scene.restart();
    } 

  }

  handleStick(player) {
    if ((!this.isStuck && !player.body.touching.down) || this.begingame === true) {
      this.isStuck = true;
      player.setVelocity(0,0);
      player.body.allowGravity = false;
      this.isPlayingFalling = false;
      this.cameras.main.stopFollow(); // ← Detiene la cámara
      this.stuckTimer = this.time.delayedCall(1000, () => {
        if (this.isStuck) {
          player.body.allowGravity = true;
          player.setVelocityY(0);
          this.isStuck = 'falling';
          this.isPlayingFalling = false;
        }
      });
    }
  }

crearNuevaCapaTilemap(offsetY) {
  const map = this.make.tilemap({ key: 'wallmap' });
  const tileset = map.addTilesetImage('texture', 'tileset');
  const layer = map.createLayer('Wall', tileset, 0, offsetY);

  // ← aquí forzamos colisión en todo tile cuyo índice ≠ –1
  layer.setCollisionByExclusion([-1]); 

  layer.setDepth(1);
  const collider = this.physics.add.collider(this.player, layer, this.handleStick, null, this);
  this.tilemapLayers.push({ layer, offsetY, collider });
}


// PARED infinito
crearNuevaCapaWallmap(offsetY) {
  const map = this.make.tilemap({ key: 'wallmap' }); 
  const tileset = map.addTilesetImage('texture', 'tileset');
  const wallLayer = map.createLayer('Wall', tileset, 0, offsetY);

  wallLayer.setCollisionByExclusion([-1]);
  
  wallLayer.setDepth(1);
  const collider = this.physics.add.collider(this.player, wallLayer, this.handleStick, null, this);
  this.wallTilemapLayers.push({ wallLayer, offsetY, collider });
}
}