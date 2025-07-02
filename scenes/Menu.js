export default class Menu extends Phaser.Scene {
  constructor() {
    super("menu");
  }

  preload () {
    this.load.image("fondomenu", "public/assets/fondomenu.png");
    this.load.image("titleinicio", "public/assets/titleinicio.png");
    this.load.image("play", "public/assets/play.png");
    this.load.image("playselect", "public/assets/playselect.png");
    this.load.image("scores", "public/assets/scores.png");
    this.load.image("scoresselect", "public/assets/scoresselect.png");
    this.load.image("helpp", "public/assets/helpp.png");
    this.load.image("helpselect", "public/assets/helpselect.png");
    this.load.image("bestscore", "public/assets/bestscore.png");
    this.load.image("scoretitulo", "public/assets/scoretitulo.png");
    this.load.image("backbotton", "public/assets/backbotton.png");
    this.load.image("helppanel", "public/assets/helppanel.png");
  }

  create() {
    const { width, height } = this.scale;
    const centroX = width / 2;
    const centroY = height / 2;

    this.add.image(centroX, centroY, "fondomenu");
    const titulo = this.add.image(centroX, 340, "titleinicio");

    // Botón Jugar
    const btnJugar = this.add.image(centroX, 700, "play").setInteractive();
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
    const btnScores = this.add.image(centroX, 820, "scores").setInteractive();
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

    // Elementos de bestscore (inicialmente ocultos)
    const bestScoreImg = this.add.image(centroX, height / 2, "bestscore").setVisible(false);

    // Texto para mostrar el valor del best score
    const bestScoreValue = localStorage.getItem("bestScore") || 0;
    const bestScoreText = this.add.text(centroX, height / 2 + 100, `Best Score: ${bestScoreValue}`, {
      font: "25px Minecraft Standard",
      color: "#nnnnn"
    }).setOrigin(0.5).setVisible(false);

    const backBtn = this.add.image(centroX, height - 350, "backbotton")
      .setInteractive()
      .setVisible(false)
      .setDepth(1);

    // Mostrar bestscore al apretar Scores
    btnScores.on("pointerdown", () => {
      btnJugar.setVisible(false);
      btnScores.setVisible(false);
      btnAyuda.setVisible(false);
      titulo.setVisible(false);
      bestScoreImg.setVisible(true);
      bestScoreText.setText(`Mejor Puntaje: ${localStorage.getItem("bestScore") || 0}`);
      bestScoreText.setVisible(true);
      backBtn.setVisible(true);
      helpPanel.setVisible(false);
    });

    // Botón Ayuda
    const btnAyuda = this.add.image(centroX, 940, "helpp").setInteractive();
    btnAyuda.setInteractive(
      new Phaser.Geom.Rectangle(-btnAyuda.displayWidth / 2, -btnAyuda.displayHeight / 2, btnAyuda.displayWidth, btnAyuda.displayHeight),
      Phaser.Geom.Rectangle.Contains
    );
    btnAyuda.input.cursor = "pointer";
    btnAyuda.on("pointerover", () => {
      btnAyuda.setTexture("helpselect");
      btnAyuda.setScale(1.2);
    });
    btnAyuda.on("pointerout", () => {
      btnAyuda.setTexture("helpp");
      btnAyuda.setScale(1);
    });

    // Elementos de ayuda (inicialmente ocultos)
    const helpPanel = this.add.image(centroX, height / 2, "helppanel").setVisible(false);

    // Mostrar ayuda al apretar Help
    btnAyuda.on("pointerdown", () => {
      btnJugar.setVisible(false);
      btnScores.setVisible(false);
      btnAyuda.setVisible(false);
      titulo.setVisible(false);
      bestScoreImg.setVisible(false); // Oculta bestscore si estaba abierto
      backBtn.setVisible(true);
      helpPanel.setVisible(true);
    });

    // Volver al menú principal al apretar back
    backBtn.on("pointerdown", () => {
      btnJugar.setVisible(true);
      btnScores.setVisible(true);
      btnAyuda.setVisible(true);
      titulo.setVisible(true);
      bestScoreImg.setVisible(false);
      bestScoreText.setVisible(false);
      helpPanel.setVisible(false);
      backBtn.setVisible(false);
    });
  }

  updateScore(currentScore) {
    const bestScore = localStorage.getItem("bestScore") || 0;
    if (currentScore > bestScore) {
      localStorage.setItem("bestScore", currentScore);
    }
  }
}