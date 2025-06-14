// URL to explain PHASER scene: https://rexrainbow.github.io/phaser3-rex-notes/docs/site/scene/

export default class Game extends Phaser.Scene {
  constructor() {
    super("game");
  }

  init() {
    this.score = 0;
    this.isStuck = false;
    this.stuckTimer = null;
  }

  preload() {
    this.load.image("star", "public/assets/star.png");
    this.load.spritesheet("dude", "public/assets/dude.png", {
      frameWidth: 32,
      frameHeight: 48,
    });
  }

  create() {
    // Crea el jugador centrado arriba de la base
    this.player = this.physics.add.sprite(360, 1200, "dude");
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    // Rectángulos laterales como obstáculos físicos (dejan espacio central)
    this.sideRects = this.physics.add.staticGroup();

    // Rectángulo izquierdo (de x=0 a x=209)
    this.sideRects.create(105, 640, null)
      .setDisplaySize(210, 1280)
      .setOrigin(0.5)
      .refreshBody();
    this.add.rectangle(105, 640, 210, 1280, 0x7CFC7C); // Verde slime pastel
    this.leftRect = this.add.rectangle(105, 640, 210, 1280, 0x7CFC7C).setDepth(10);

    // Rectángulo derecho (de x=510 a x=719)
    this.sideRects.create(615, 640, null)
      .setDisplaySize(210, 1280)
      .setOrigin(0.5)
      .refreshBody();
    this.add.rectangle(615, 640, 210, 1280, 0x7CFC7C); // Verde slime pastel
    this.rightRect = this.add.rectangle(615, 640, 210, 1280, 0x7CFC7C).setDepth(10);

    // Colisión del jugador con los rectángulos
    this.physics.add.collider(this.player, this.sideRects, this.handleStick, null, this);

    // Plataforma base (40px de alto, centrada abajo)
    this.base = this.physics.add.staticSprite(360, 1260, null)
      .setDisplaySize(720, 40)
      .refreshBody();
    this.add.rectangle(360, 1260, 720, 40, 0x888888);

    // Colisión del jugador con la base
    this.physics.add.collider(this.player, this.base);

    // Animaciones para el sprite "dude"
    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "turn",
      frames: [{ key: "dude", frame: 4 }],
      frameRate: 20,
    });

    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "jump",
      frames: [{ key: "dude", frame: 5 }],
      frameRate: 10,
    });

    // Crea los cursores del teclado
    this.cursors = this.input.keyboard.createCursorKeys();

    // Tecla para reiniciar
    this.keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

    // Aquí puedes agregar animaciones si las necesitas

    this.cameras.main.startFollow(this.player);

    // Limites del mundo
    this.cameras.main.setBounds(0, -100000, 720, 100000 + 1280); // Mundo muy alto hacia arriba
    this.physics.world.setBounds(0, -100000, 720, 100000 + 1280);
  }

  update() {
    if (this.isStuck === true) {
      this.player.setVelocity(0, 0);

      // Permitir salto mientras está pegado
      if (this.cursors.up.isDown) {
        this.player.body.allowGravity = true;
        this.player.setVelocityY(-330); // Mismo impulso de salto
        this.isStuck = false;
        if (this.stuckTimer) this.stuckTimer.remove(false); // Cancela el timer si existe
      }
      return; // No permitir movimiento lateral mientras está pegado
    }

    // Permitir salto y movimiento lateral mientras cae lentamente
    if (this.isStuck === "falling") {
      // Permitir movimiento lateral
      if (this.cursors.left.isDown) {
        this.player.setVelocityX(-160);
        this.player.anims.play("left", true);
      } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(160);
        this.player.anims.play("right", true);
      } else {
        this.player.setVelocityX(0);
        this.player.anims.play("jump", true);
      }

      // Permitir salto
      if (this.cursors.up.isDown) {
        this.player.setVelocityY(-330);
        this.isStuck = false;
        if (this.stuckTimer) this.stuckTimer.remove(false);
      }
      return;
    }

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
      if (!this.player.body.touching.down) {
        this.player.anims.play("jump", true);
      } else {
        this.player.anims.play("left", true);
      }
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
      if (!this.player.body.touching.down) {
        this.player.anims.play("jump", true);
      } else {
        this.player.anims.play("right", true);
      }
    } else {
      this.player.setVelocityX(0);
      if (!this.player.body.touching.down) {
        this.player.anims.play("jump", true);
      } else {
        this.player.anims.play("turn");
      }
    }

    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-330);
    }

    if (Phaser.Input.Keyboard.JustDown(this.keyR)) {
      
      this.scene.restart();
    }

    // Mantener los rectángulos laterales infinitos
    const cam = this.cameras.main;
    const camCenterY = cam.scrollY + cam.height / 2;
    const rectHeight = cam.height * 1.2; // Un poco más alto que la cámara

    this.leftRect.y = camCenterY;
    this.leftRect.height = rectHeight;

    this.rightRect.y = camCenterY;
    this.rightRect.height = rectHeight;
  }

  handleStick(player, rect) {
    // Solo pegarse si está en el aire y no está ya pegado
    if (!this.isStuck && !player.body.touching.down) {
      this.isStuck = true;
      player.setVelocity(0, 0);
      player.body.allowGravity = false;

      // Después de .5 segundos, empieza a caer lentamente
      this.stuckTimer = this.time.delayedCall(500, () => {
        player.body.allowGravity = true;
        player.setVelocityY(50); // Caída lenta
        this.isStuck = "falling"; // Nuevo estado
      });
    }
  }
}
