export default class Game extends Phaser.Scene {
  constructor() {
    super("game");
    this.introState = 0;
    this.wallTilemapLayers = [];
    this.wallMapHeightPx = 0;
    this.wallMapsCreados = 0;
  }

  init() {
    this.score = 0;
    this.direction = 0;
    this.begingame = false;
    this.isStuck = false;
    this.isPlayingFalling = false;
    this.stuckTimer = null;
    this.fallingScoreTimer = 0;
    this.isGameOver = false;
    this.hasScored = false;
  }

  preload() {
    // Assets de juego
    this.load.image("tileset", "public/assets/texture.png");
    this.load.tilemapTiledJSON("map", "public/assets/tilemap/slime.json");
    this.load.tilemapTiledJSON("wallmap", "public/assets/tilemap/slimewall.json");
    this.load.image ("fondo", "public/assets/bg_solid.png");
    this.load.image ("nubes", "public/assets/nubes.png");
    this.load.image("icono2", "public/assets/icono2.png");
    this.load.image("pausa", "public/assets/iconopausa.png");
    this.load.image("restartbotton", "public/assets/restartbotton.png");
    this.load.image("homebotton", "public/assets/homebotton.png");
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
    this.load.image("scores", "public/assets/scores.png");
    this.load.image("scoresselect", "public/assets/scoresselect.png");
    this.load.image("helpp", "public/assets/helpp.png");
    this.load.image("helpselect", "public/assets/helpselect.png");
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
    // --- FIX: Siempre reanuda el mundo y animaciones al crear la escena ---
    this.physics.world.resume();
    this.anims.resumeAll();
    this.isGamePaused = false;
    this.isGameOver = false;

    const W = this.scale.width;
    const H = this.scale.height;

    // --- Fondo y nubes primero (para que la UI quede arriba) ---
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;
    this.add.image(centerX, centerY, "fondo").setScale(1).setScrollFactor(0).setDepth(0); 
    this.nubes1 = this.add.image(centerX, centerY + 100, "nubes").setScale(1).setScrollFactor(0).setDepth(0);
    this.nubes2 = this.add.image(centerX + this.nubes1.width, centerY + 100, "nubes").setScale(1).setScrollFactor(0).setDepth(0);

    // --- UI FIJA: CONTADOR (icono2 + texto) ---
    this.counterBg = this.add.image(10, 10, 'icono2')
      .setOrigin(0, 0)
      .setScale(2.5)
      .setScrollFactor(0)
      .setDepth(1000);

    this.counterText = this.add.text(
      this.counterBg.x + 120,
      this.counterBg.y + 1,
      '00000',
      { fontFamily: ' Minecraft Standard', fontSize: '25px', color: '#ffffff' }
    )
    .setScrollFactor(0)
    .setDepth(1000);

    //  UI FIJA: BOTÓN DE PAUSA 
    this.pauseBtn = this.add.image(W - 10, 10, 'pausa')
      .setOrigin(1, 0)
      .setScale(1.5)
      .setScrollFactor(0)
      .setDepth(1100)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.togglePause());

    // MENÚ DE PAUSA (inicia oculto) 
    this.pauseMenu = this.add.container(0, 0)
      .setScrollFactor(0)
      .setDepth(2000)
      .setVisible(false);

    // Fondo semitransparente para oscurecer el fondo
    const pauseOverlay = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.5)
      .setOrigin(0, 0)
      .setScrollFactor(0);

    // Fondo del menú
    const cX = this.scale.width / 2;
    const cY = this.scale.height / 2;
    const bg = this.add.image(cX, cY, 'pauseback').setOrigin(0.5);

    // Botones con más separación vertical
    const spacing = 130;

    const btnContinue = this.add.image(cX, cY +70 - spacing, 'continuebotton')
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.togglePause());

    const btnOptions = this.add.image(cX, cY +70 , 'optionbotton')
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.pauseMenu.setVisible(false);
        this.configMenu.setVisible(true);
      });

    const btnExit = this.add.image(cX, cY +70 + spacing, 'exitbotton')
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.isGamePaused = false;
        this.physics.world.resume();
        this.anims.resumeAll();
        this.scene.start('menu');
      });

    // Agregar todo al contenedor 
    this.pauseMenu.add([ pauseOverlay, bg, btnContinue, btnOptions, btnExit ]);

    //  MENÚ DE CONFIG 
    this.configMenu = this.add.container(0, 0)
      .setScrollFactor(0)
      .setDepth(2001)
      .setVisible(false);

    const cfgX = this.scale.width  / 2;
    const cfgY = this.scale.height / 2;

    const cfgBg = this.add.image(cfgX, cfgY, 'configback').setOrigin(0.5);

    const btnMusic = this.add.image(cfgX - 130, cfgY - 120, 'musicbotton')
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        // toggle música on/off
      });

    const btnSound = this.add.image(cfgX - 130, cfgY + 20, 'soundbotton')
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        // toggle efectos on/off
      });

    const btnBack = this.add.image(cfgX, cfgY + 200, 'backbotton')
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.configMenu.setVisible(false);
        this.pauseMenu.setVisible(true);
      });

    // Fondo semitransparente para oscurecer el fondo del menú de opciones
    const configOverlay = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.5)
      .setOrigin(0, 0)
      .setScrollFactor(0);

    this.configMenu.add([ configOverlay, cfgBg, btnMusic, btnSound, btnBack ]);


    // TILEMAP INFINITO
    this.tilemapLayers = [];
    this.tilemapHeightPx = 24 * 32;

    this.activePowerups = [];

    // Fondo y nubes
    this.add.image(centerX, centerY, "fondo").setScale(1).setScrollFactor(0); 
    this.nubes1 = this.add.image(centerX, centerY + 100, "nubes").setScale(1).setScrollFactor(0);
    this.nubes2 = this.add.image(centerX + this.nubes1.width, centerY + 100, "nubes").setScale(1).setScrollFactor(0);

    // Mapa base
    const map = this.make.tilemap({ key: "map" });
    const tiles = map.addTilesetImage("texture", "tileset");

    // Calcular offsetX para centrar el tilemap
    const offsetX = (this.scale.width - map.widthInPixels) / 2;

    this.floorLayer = map.createLayer("Floor", tiles, offsetX, 0);
    this.wallLayer  = map.createLayer("Wall",  tiles, offsetX, 0);
    this.floorLayer.setCollisionByExclusion([-1]);
    this.wallLayer.setCollisionByExclusion([-1]);

    // Coords de spawn (ajustar X con offsetX)
    const objLayer = map.getObjectLayer("Point");
    const spawnObj = objLayer.objects.find(o => o.name === "Spawn");
    const spawnX = spawnObj ? spawnObj.x + offsetX : this.scale.width / 2;
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

    // Capa infinita (después de los grupos)
    this.crearNuevaCapaTilemap(0);

    // Input
    this.cursors  = this.input.keyboard.createCursorKeys();
    this.keyR     = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Animaciones del jugador
    this.anims.create({ key: 'intro',    frames: this.anims.generateFrameNumbers('inicio',   { start: 0,  end: 26 }), frameRate: 8, repeat: 0 });
    this.anims.create({ key: 'preJump',  frames: this.anims.generateFrameNumbers('inicio',   { start: 27, end: 29 }), frameRate: 8, repeat: 0 });
    this.anims.create({ key: 'jumpLeft', frames: this.anims.generateFrameNumbers('saltoizq', { start: 0,  end: 3  }), frameRate: 8, repeat: 0 });
    this.anims.create({ key: 'jump',     frames: this.anims.generateFrameNumbers('saltoder',  { start: 0,  end: 3  }), frameRate: 8, repeat: 0 });
    this.anims.create({ key: 'jump2Left',  frames: this.anims.generateFrameNumbers('salto2izq', { start: 0, end: 1 }), frameRate: 8, repeat: -1 });
    this.anims.create({ key: 'jump2Right', frames: this.anims.generateFrameNumbers('salto2der', { start: 0, end: 1 }), frameRate: 8, repeat: -1 });
    this.anims.create({ key: "pegao", frames: [{ key: "player", frame: 0 }], frameRate: 9 });
    this.anims.create({ key: "caida", frames: this.anims.generateFrameNumbers("player", { start: 1, end: 8 }), frameRate: 2, repeat: 0 });

    // Animación para puntos
    this.anims.create({
      key: 'puntoAnim',
      frames: this.anims.generateFrameNumbers('puntos', { start: 0, end: 13 }), 
      frameRate: 8,
      repeat: -1
    });

    // Animación de explosivos
    this.anims.create({
      key: 'explosivosAnim',
      frames: this.anims.generateFrameNumbers('explosivos', { start: 0, end: 13 }),
      frameRate: 8,
      repeat: -1
    });

    // Animación de escudo
    this.anims.create({
      key: 'escudoAnim',
      frames: this.anims.generateFrameNumbers('escudo', { start: 0, end: 13 }),
      frameRate: 8,
      repeat: -1
    });

    // Animación de salud
    this.anims.create({
      key: 'saludAnim',
      frames: this.anims.generateFrameNumbers('salud', { start: 0, end: 13 }),
      frameRate: 8,
      repeat: -1
    });


    // Logo/intro
    this.logo = this.add.sprite(spawnX, spawnY, 'inicio').setScale(2.6).setOrigin(0.5, 0.5);
    this.logo.play('intro');
    this.logo.once('animationcomplete-intro', () => this.introState = 1);
      // Mostrar el "tap" una sola vez en la escena Intro
      const tapX = this.cameras.main.width / 2;
      const tapY = this.cameras.main.height / 2 + 300;

      this.tapPrompt = this.add.image(tapX, tapY, 'tap')
        .setScrollFactor(0)
        .setDepth(2500)
        .setAlpha(1);

      this.tweens.add({
        targets: this.tapPrompt,
        alpha: 0,
        yoyo: true,
        repeat: -1,
        duration: 500,
      });

this.input.keyboard.once('keydown-SPACE', () => {
  if (this.tapPrompt) {
    this.tapPrompt.destroy();
    this.tapPrompt = null;
  }
});
  
    // Cámara
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setBounds(0, -100000, 720, 100000 + 1280);
    this.physics.world.setBounds(0, -100000, 720, 100000 + 1280);

    // Función para crear salud en una pared aleatoria
    this.spawnSaludExtra = () => {
      if (this.isGameOver) return; 

      // Solo permitir uno de salud a la vez
      if (this.activePowerups.some(obj => obj.texture.key === 'salud')) return;

      const left = Phaser.Math.Between(0, 1) === 0;
      const x = left ? 133 : this.scale.width - 133;
      const flipX = left; // Solo espeja si está en la izquierda
      const y = this.player.y - Phaser.Math.Between(200, 400);

      if (!this.isSpaceFree(x, y)) return;

      const saludExtra = this.physics.add.sprite(x, y, 'salud').setScale(2);
      saludExtra.flipX = flipX;
      saludExtra.body.allowGravity = false;
      saludExtra.play('saludAnim');
      this.activePowerups.push(saludExtra);

      this.physics.add.collider(saludExtra, this.wallLayer, (salud, muro) => {
        if (salud.x < this.scale.width / 2) {
          salud.x = muro.x + muro.width / 2 + salud.displayWidth / 2;
        } else {
          salud.x = muro.x - muro.width / 2 - salud.displayWidth / 2;
        }
        salud.setVelocity(0, 0);
        salud.body.allowGravity = false;
      });

      this.physics.add.overlap(this.player, saludExtra, (player, salud) => {
        this.score += 50;
        this.hasScored = true; 
        this.counterText.setText(this.score.toString().padStart(5, '0'));
        this.activePowerups = this.activePowerups.filter(obj => obj !== salud);
        salud.destroy();
      });
    };

    this.explosivoDelay = 2000;

    this.spawnExplosivoExtra = () => {
      if (this.isGameOver) return; 

      // Solo permitir uno de explosivo a la vez
      if (this.activePowerups.some(obj => obj.texture.key === 'explosivos')) return;

      const left = Phaser.Math.Between(0, 1) === 0;
      const x = left ? 133 : this.scale.width - 133;
      const flipX = left; // Solo espeja si está en la izquierda
      const y = this.player.y - Phaser.Math.Between(200, 400);

      if (!this.isSpaceFree(x, y)) return;
      const explosivoExtra = this.physics.add.sprite(x, y, 'explosivos').setScale(2);
      explosivoExtra.flipX = flipX;
      explosivoExtra.body.allowGravity = false;
      explosivoExtra.play('explosivosAnim');
      this.activePowerups.push(explosivoExtra);

      this.physics.add.collider(explosivoExtra, this.wallLayer, (explosivo, muro) => {
        if (explosivo.x < this.scale.width / 2) {
          explosivo.x = muro.x + muro.width / 2 + explosivo.displayWidth / 2;
        } else {
          explosivo.x = muro.x - muro.width / 2 - explosivo.displayWidth / 2;
        }
        explosivo.setVelocity(0, 0);
        explosivo.body.allowGravity = false;
      });

      this.physics.add.overlap(this.player, explosivoExtra, (player, explosivo) => {
        if (!this.hasShield) {
          this.score = Math.max(0, this.score - 20); // nunca baja de 0
          this.counterText.setText(this.score.toString().padStart(5, '0'));
        }
        this.activePowerups = this.activePowerups.filter(obj => obj !== explosivo);
        explosivo.destroy();
      });
    };

    this.spawnPuntosExtra = () => {
      if (this.isGameOver) return; 

      // Solo permitir uno de puntos a la vez
      if (this.activePowerups.some(obj => obj.texture.key === 'puntos')) return;

      const left = Phaser.Math.Between(0, 1) === 0;
      const x = left ? 133 : this.scale.width - 133;
      const flipX = left; // Solo espeja si está en la izquierda
      const y = this.player.y - Phaser.Math.Between(200, 400);

      if (!this.isSpaceFree(x, y)) return;
      const puntosExtra = this.physics.add.sprite(x, y, 'puntos').setScale(2);
      puntosExtra.flipX = flipX;
      puntosExtra.body.allowGravity = false;
      puntosExtra.play('puntoAnim');
      this.activePowerups.push(puntosExtra);

      this.physics.add.collider(puntosExtra, this.wallLayer, (punto, muro) => {
        if (punto.x < this.scale.width / 2) {
          punto.x = muro.x + muro.width / 2 + punto.displayWidth / 2;
        } else {
          punto.x = muro.x - muro.width / 2 - punto.displayWidth / 2;
        }
        punto.setVelocity(0, 0);
        punto.body.allowGravity = false;
      });

      this.physics.add.overlap(this.player, puntosExtra, (player, punto) => {
        this.score += 25;
        this.hasScored = true; // <-- AGREGA ESTO
        this.counterText.setText(this.score.toString().padStart(5, '0'));
        this.activePowerups = this.activePowerups.filter(obj => obj !== punto);
        punto.destroy();
      });
    };

    this.spawnEscudoExtra = () => {
      if (this.isGameOver) return; // <--- agrega esto

      // Solo permitir uno de escudo a la vez
      if (this.activePowerups.some(obj => obj.texture.key === 'escudo')) return;

      const left = Phaser.Math.Between(0, 1) === 0;
      const x = left ? 133 : this.scale.width - 133;
      const flipX = left; // Solo espeja si está en la izquierda
      const y = this.player.y - Phaser.Math.Between(200, 400);

      const escudoExtra = this.physics.add.sprite(x, y, 'escudo').setScale(2);
      escudoExtra.flipX = flipX;
      escudoExtra.body.allowGravity = false;
      escudoExtra.play('escudoAnim');
      this.activePowerups.push(escudoExtra);

      this.physics.add.collider(escudoExtra, this.wallLayer, (escudo, muro) => {
        if (escudo.x < this.scale.width / 2) {
          escudo.x = muro.x + muro.width / 2 + escudo.displayWidth / 2;
        } else {
          escudo.x = muro.x - muro.width / 2 - escudo.displayWidth / 2;
        }
        escudo.setVelocity(0, 0);
        escudo.body.allowGravity = false;
      });

      this.physics.add.overlap(this.player, escudoExtra, (player, escudo) => {
        this.hasShield = true;
        this.activePowerups = this.activePowerups.filter(obj => obj !== escudo);
        escudo.destroy();
        if (this.shieldTimer) this.shieldTimer.remove(false);
        this.shieldTimer = this.time.delayedCall(10000, () => {
          this.hasShield = false;
        });
      });
    };

    //  MENÚ DE GAME OVER (inicia oculto) 
    this.input.enabled = true;
    this.gameOverMenu = this.add.container(0, 0)
      .setScrollFactor(0)
      .setDepth(2000)
      .setVisible(false);

    // Fondo semitransparente
    const gameOverOverlay = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.5)
      .setOrigin(0, 0)
      .setScrollFactor(0);

    // Fondo del menú Game Over
    const goX = this.scale.width / 2;
    const goY = this.scale.height / 2;
    const gameOverBg = this.add.image(goX, goY, 'gameoverback').setOrigin(0.5);

    // Texto de score final 
    this.gameOverScoreText = this.add.text(
      goX, goY - 25,
      '', 
      { fontFamily: 'Minecraft Standard', fontSize: '48px', color: '#fff', align: 'center', stroke: '#000', strokeThickness: 6 }
    ).setOrigin(0.5);

    // Botón Restart
    const btnRestart = this.add.image(goX, goY + 85, 'restartbotton') 
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.isGamePaused = false;
        this.isGameOver = false;
        this.physics.world.resume();
        this.anims.resumeAll();
        this.scene.restart();
      });

    // Botón Home
    const btnHome = this.add.image(goX, goY + 230, 'homebotton')
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.isGamePaused = false;
        this.isGameOver = false;
        this.physics.world.resume();
        this.anims.resumeAll();
        this.scene.start('menu');
      });

    this.gameOverMenu.add([gameOverOverlay, gameOverBg, this.gameOverScoreText, btnRestart, btnHome]);
  }

  // Función para mostrar Game Over y pausar todo 
  showGameOver() {
    if (this.isGameOver) return;
    this.isGameOver = true;
    this.physics.world.pause();
    this.anims.pauseAll();
    this.isGamePaused = true;
    this.pauseMenu.setVisible(false);
    this.configMenu.setVisible(false);

    // Actualiza el texto del score final
    this.gameOverScoreText.setText(this.score.toString());

    this.gameOverMenu.setVisible(true);

    // Asegura que el input esté habilitado
    this.input.enabled = true;

    // Detener todos los eventos de spawn
    if (this.time.events) {
      this.time.events.forEach(e => e.paused = true);
    }
  }

  update(time, delta) {
    if (this.isGamePaused || this.isGameOver) return;

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

    // --- Pausa todo y muestra Game Over si el personaje sale de la cámara o el score llega a 0 ---
    const cam = this.cameras.main;
    const playerBottom = this.player.y + this.player.displayHeight / 2;
    const playerTop = this.player.y - this.player.displayHeight / 2;

    if (
      playerBottom < cam.scrollY || // sale por arriba
      playerTop > cam.scrollY + cam.height || // sale por abajo
      (this.hasScored && this.score <= 0) // score en cero solo si ya ganó puntos
    ) {
      this.showGameOver();
      return;
    }

    // --- Movimiento horizontal y bucle de las nubes (SIEMPRE) ---
    const nubesSpeed = 0.5;
    if (this.nubes1 && this.nubes2) {
      this.nubes1.x -= nubesSpeed;
      this.nubes2.x -= nubesSpeed;

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
          const direction = Phaser.Math.Between(0, 1) === 0 ? -1 : 1;
          this.direction = direction;

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
            

  // 1) Mostrar el sprite “tap” en pantalla fija (UI)
  const tapX = this.cameras.main.width / 2;
  const tapY = this.cameras.main.height / 2 + 300;  // ajusta posición
  this.tapPrompt = this.add.image(tapX, tapY, 'tap')
    .setScrollFactor(0)
    .setDepth(2500)
    .setAlpha(1);

  // 2) Hacerlo parpadear indefinidamente
  this.tweens.add({
    targets: this.tapPrompt,
    alpha: 0,
    yoyo: true,
    repeat: -1,
    duration: 500,
  });

  // 3) Al primer press de Espacio, quitar el prompt
  this.input.keyboard.once('keydown-SPACE', () => {
    if (this.tapPrompt) {
      this.tapPrompt.destroy();
      this.tapPrompt = null;
    }
  });



            // Eventos de powerups:

            // Salud: cada 5s, primero a los 5s
            this.time.addEvent({
              delay: 5000,
              callback: this.spawnSaludExtra,
              callbackScope: this,
              loop: true,
              startAt: 5000
            });

            // Puntos: cada 8s, primero a los 5s
            this.time.addEvent({
              delay: 8000,
              callback: this.spawnPuntosExtra,
              callbackScope: this,
              loop: true,
              startAt: 5000
            });

            // Explosivo: cada 7s, primero a los 20s
            this.explosivoEvent = this.time.addEvent({
              delay: this.explosivoDelay,
              callback: this.spawnExplosivoExtra,
              callbackScope: this,
              loop: true,
              startAt: 20000
            });

            // Escudo: cada 15s, primero a los 23s
            this.time.addEvent({
              delay: 15000,
              callback: this.spawnEscudoExtra,
              callbackScope: this,
              loop: true,
              startAt: 23000
            });
          });
        }
        return;
      }
    }

    // Estado “pegado"
    if (this.isStuck === true) {
      this.player.setVelocity(0,0);
      this.player.flipX = this.direction === 1 ? false : true;
      this.player.setOffset(0, 0);
      this.player.play('pegao', true);
      this.isPlayingFalling = false;
      this.handleStick(this.player);
      return;
    }

    // Estado “cayendo lento"
    if (this.isStuck === 'falling') {

    
      if (!this.isPlayingFalling) {
        this.player.play('caida', true);
        this.isPlayingFalling = true;
      }

      this.player.setVelocityX(this.cursors.left.isDown ? -160 : this.cursors.right.isDown ? 160 : 0);

      // Restar 5 puntos cada 500 ms mientras cae
      if (!this.fallingScoreTimer) this.fallingScoreTimer = 0;
      this.fallingScoreTimer += delta;
      if (this.fallingScoreTimer >= 500) {
        this.score = Math.max(0, this.score - 5);
        this.counterText.setText(this.score.toString().padStart(5, '0'));
        this.fallingScoreTimer = 0;
      }

      if (this.begingame && Phaser.Input.Keyboard.JustDown(this.keySpace)) {
        this.cameras.main.startFollow(this.player);
        this.player.anims.stop();
        this.player.body.allowGravity = true;
        this.player.setVelocityX(500*this.direction);
        this.player.setVelocityY(-500);
        this.isStuck = false;
        this.isPlayingFalling = false;
        this.stuckTimer.remove(false);
        this.fallingScoreTimer = 0; // <-- reinicia el timer al salir de caída
        if (this.direction === 1) {
          this.player.flipX = true; 
          this.direction = -1;
        } else {
          this.player.flipX = false; 
          this.direction = 1;
        }
      }
      return;
    } else {
      this.fallingScoreTimer = 0; // <-- reinicia el timer si no está cayendo
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
      this.cameras.main.stopFollow();
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
    // Centrar igual que el mapa base
    const offsetX = (this.scale.width - map.widthInPixels) / 2;
    const layer = map.createLayer('Wall', tileset, offsetX, offsetY);

    layer.setCollisionByExclusion([-1]); 
    layer.setDepth(1);
    const collider = this.physics.add.collider(this.player, layer, this.handleStick, null, this);
    this.tilemapLayers.push({ layer, offsetY, collider });
  }

  crearNuevaCapaWallmap(offsetY) {
    const map = this.make.tilemap({ key: 'wallmap' }); 
    const tileset = map.addTilesetImage('texture', 'tileset');
    // Centrar igual que el mapa base
    const offsetX = (this.scale.width - map.widthInPixels) / 2;
    const wallLayer = map.createLayer('Wall', tileset, offsetX, offsetY);
    
  }

  spawnEscudoExtra() {
    // Solo permitir uno de escudo a la vez
    if (this.activePowerups.some(obj => obj.texture.key === 'escudo')) return;

    const left = Phaser.Math.Between(0, 1) === 0;
    const x = left ? 133 : this.scale.width - 133;
    const flipX = left; // Solo espeja si está en la izquierda
    const y = this.player.y - Phaser.Math.Between(200, 400);

    const escudoExtra = this.physics.add.sprite(x, y, 'escudo').setScale(2);
    escudoExtra.flipX = flipX;
    escudoExtra.body.allowGravity = false;
    escudoExtra.play('escudoAnim');
    this.activePowerups.push(escudoExtra);

    this.physics.add.collider(escudoExtra, this.wallLayer, (escudo, muro) => {
      if (escudo.x < this.scale.width / 2) {
        escudo.x = muro.x + muro.width / 2 + escudo.displayWidth / 2;
      } else {
        escudo.x = muro.x - muro.width / 2 - escudo.displayWidth / 2;
      }
      escudo.setVelocity(0, 0);
      escudo.body.allowGravity = false;
    });

    this.physics.add.overlap(this.player, escudoExtra, (player, escudo) => {
      this.hasShield = true;
      this.activePowerups = this.activePowerups.filter(obj => obj !== escudo);
      escudo.destroy();
      if (this.shieldTimer) this.shieldTimer.remove(false);
      this.shieldTimer = this.time.delayedCall(10000, () => {
        this.hasShield = false;
      });
    });
  } 

  isSpaceFree(x, y) {
    // Simple: siempre devuelve true (no bloquea el spawn)
  
    return true;
  }

  togglePause() {
    // Permite pausar/despausar en cualquier momento del juego (excepto game over)
    if (this.isGameOver) return; // <-- evita pausar si ya terminó

    if (this.isGamePaused) {
        // Reanudar juego
        this.isGamePaused = false;
        this.physics.world.resume();
        this.anims.resumeAll();
        this.pauseMenu.setVisible(false);
        this.configMenu.setVisible(false);
    } else {
        // Pausar juego
        this.isGamePaused = true;
        this.physics.world.pause();
        this.anims.pauseAll();
        this.pauseMenu.setVisible(true);
        this.configMenu.setVisible(false);
    }
  }
}