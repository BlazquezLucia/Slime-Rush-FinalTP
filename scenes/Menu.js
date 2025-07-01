export default class Menu extends Phaser.Scene {
  constructor() {
    super("menu");
  }

  preload () {
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
   }


  create() {
    const { width, height } = this.scale;

    const centroX = width / 2;
    const centroY = height / 2;
    const posYBase = height / 2 - 55;
    const espaciado = 110;
    const escalaBoton = 0.3;
    this.add.image(centroX, centroY, "fondomenu");

    const titulo = this.add.image(centroX, 340, "titleinicio");

    // Botón Jugar
    const btnJugar = this.add.image(centroX, 700, "play")
    .setInteractive();

    btnJugar.setInteractive(
      new Phaser.Geom.Rectangle(-btnJugar.displayWidth / 2, -btnJugar.displayHeight / 2, btnJugar.displayWidth, btnJugar.displayHeight),
      Phaser.Geom.Rectangle.Contains
    );
    btnJugar.input.cursor = "pointer";

    btnJugar.on("pointerover", () => {
      btnJugar.setTexture("playselect");
      btnJugar.setScale(1.2);
    });

    btnJugar.on("pointerout", () => {
      btnJugar.setTexture("play");
      btnJugar.setScale(1);
    });

    btnJugar.on("pointerdown", () => {
      this.scene.start("game");
    });

    // Botón Puntaje
    const btnScores = this.add.image(centroX, 820, "scores")
    .setInteractive();

    btnScores.setInteractive(
      new Phaser.Geom.Rectangle(-btnScores.displayWidth / 2, -btnScores.displayHeight / 2, btnScores.displayWidth, btnScores.displayHeight),
      Phaser.Geom.Rectangle.Contains
    );
    btnScores.input.cursor = "pointer";

    btnScores.on("pointerover", () => {
      btnScores.setTexture("scoresselect");
      btnScores.setScale(1.2);
    });

    btnScores.on("pointerout", () => {
      btnScores.setTexture("scores");
      btnScores.setScale(1);
    });

    btnScores.on("pointerdown", () => {
      this.scene.start("scores");
    });

    // Botón Configuración
    const btnSetting = this.add.image(centroX, 940, "setting")
    .setInteractive();

    btnSetting.setInteractive(
      new Phaser.Geom.Rectangle(-btnSetting.displayWidth / 2, -btnSetting.displayHeight / 2, btnSetting.displayWidth, btnSetting.displayHeight),
      Phaser.Geom.Rectangle.Contains
    );
    btnSetting.input.cursor = "pointer";

    btnSetting.on("pointerover", () => {
      btnSetting.setTexture("settingselect");
      btnSetting.setScale(1.2);
    });

    btnSetting.on("pointerout", () => {
      btnSetting.setTexture("setting");
      btnSetting.setScale(1);
    });

    btnSetting.on("pointerdown", () => {
      this.scene.start("setting");
    });

    // Botón Créditos
    const btnCredits = this.add.image(centroX, 1060, "credits")
    .setInteractive();

    btnCredits.setInteractive(
      new Phaser.Geom.Rectangle(-btnCredits.displayWidth / 2, -btnCredits.displayHeight / 2, btnCredits.displayWidth, btnCredits.displayHeight),
      Phaser.Geom.Rectangle.Contains
    );
    btnCredits.input.cursor = "pointer";

    btnCredits.on("pointerover", () => {
      btnCredits.setTexture("creditsselect");
      btnCredits.setScale(1.2);
    });

    btnCredits.on("pointerout", () => {
      btnCredits.setTexture("credits");
      btnCredits.setScale(1);
    });

    btnCredits.on("pointerdown", () => {
      this.scene.start("credits");
    });


  }



}