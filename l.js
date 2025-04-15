const canvas = document.getElementById('JogoCanvas');
const ctx = canvas.getContext('2d');

// ===== CLASSES BASE =====

class Entidade {
  constructor(x, y, largura, altura, cor) {
    this.x = x;
    this.y = y;
    this.largura = largura;
    this.altura = altura;
    this.cor = cor;
  }

  desenhar() {
    ctx.fillStyle = this.cor;
    ctx.fillRect(this.x, this.y, this.largura, this.altura);
  }

  colidiuCom(outro) {
    return (
      this.x < outro.x + outro.largura &&
      this.x + this.largura > outro.x &&
      this.y < outro.y + outro.altura &&
      this.y + this.altura > outro.y
    );
  }
}

class Jogador extends Entidade {
  constructor(x, y) {
    super(x, y, 40, 20, 'lime');
    this.vel = 5;
  }

  mover(direcao) {
    this.x += direcao * this.vel;
    this.x = Math.max(0, Math.min(canvas.width - this.largura, this.x));
  }

  atirar() {
    return new Tiro(this.x + this.largura / 2 - 2, this.y);
  }
}

class Tiro extends Entidade {
  constructor(x, y) {
    super(x, y, 4, 10, 'white');
    this.vel = 7;
  }

  atualizar() {
    this.y -= this.vel;
  }
}

class Inimigo extends Entidade {
  constructor(x, y) {
    super(x, y, 30, 20, 'red');
  }
}

class GrupoInimigos {
  constructor(linhas, colunas) {
    this.inimigos = [];
    this.direcao = 1;
    this.gravidade = 0.2;
    this.passo = 0;

    for (let l = 0; l < linhas; l++) {
      for (let c = 0; c < colunas; c++) {
        this.inimigos.push(new Inimigo(80 + c * 40, 40 + l * 30));
      }
    }
  }

  atualizar() {
    let inverter = false;
    for (let inimigo of this.inimigos) {
      inimigo.x += this.direcao;
      if (inimigo.x + inimigo.largura > canvas.width || inimigo.x < 0) {
        inverter = true;
      }
    }

    if (inverter) {
      this.direcao *= -1;
      for (let inimigo of this.inimigos) {
        inimigo.y += 10;
      }
    }

    this.passo++;
    if (this.passo % 60 === 0) {
      for (let inimigo of this.inimigos) {
        inimigo.y += this.gravidade * 20;
      }
    }
  }

  desenhar() {
    for (let inimigo of this.inimigos) {
      inimigo.desenhar();
    }
  }
}

// ===== OBJETOS PRINCIPAIS =====

const jogador = new Jogador(400, 350);
const tiros = [];
const grupoInimigos = new GrupoInimigos(3, 8);
let teclas = {};

// ===== CONTROLES =====

document.addEventListener('keydown', (e) => {
  teclas[e.key] = true;
});
document.addEventListener('keyup', (e) => {
  teclas[e.key] = false;
});

// ===== LOOP DO JOGO =====

function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Controles
  if (teclas['ArrowLeft']) jogador.mover(-1);
  if (teclas['ArrowRight']) jogador.mover(1);
  if (teclas[' '] && tiros.length < 5) {
    tiros.push(jogador.atirar());
  }

  // Atualizar tiros
  for (let i = tiros.length - 1; i >= 0; i--) {
    tiros[i].atualizar();
    tiros[i].desenhar();
    if (tiros[i].y < 0) tiros.splice(i, 1);
  }

  // Atualizar inimigos
  grupoInimigos.atualizar();
  grupoInimigos.desenhar();

  // Checar colisões
  for (let i = tiros.length - 1; i >= 0; i--) {
    for (let j = grupoInimigos.inimigos.length - 1; j >= 0; j--) {
      if (tiros[i].colidiuCom(grupoInimigos.inimigos[j])) {
        tiros.splice(i, 1);
        grupoInimigos.inimigos.splice(j, 1);
        break;
      }
    }
  }

  jogador.desenhar();
  requestAnimationFrame(loop);
}

loop();
