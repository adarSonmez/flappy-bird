const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

let frameCount = 0

// load source image
let source = new Image()
source.src = '../img/source.png'

// load audios
let audio = new Audio()
audio.src = '../audio/soundtrack.mp3'

// game states
const states = {
  currentState: 0,
  getReadyState: 0,
  gameState: 1,
  overState: 2,
}

let startButton = {
  x: 120,
  y: 263,
  w: 83,
  h: 29,
}

// design the game process
canvas.addEventListener('click', (e) => {
  switch (states.currentState) {
    case states.getReadyState:
      states.currentState = states.gameState
      audio.play().then((r) => nothing(r))
      break
    case states.gameState:
      bird.flap()
      break
    case states.overState:
      let rect = canvas.getBoundingClientRect()
      let clickX = e.clientX - rect.left
      let clickY = e.clientY - rect.top

      if (
        clickX >= startButton.x &&
        clickX <= startButton.x + startButton.w &&
        clickY >= startButton.y &&
        clickY <= startButton.y + startButton.h
      ) {
        bird.speedReset()
        pipes.reset()
        score.reset()
        states.currentState = states.getReadyState
      }
      break
  }
})

const bird = {
  animation: [
    { sX: 276, sY: 112 },
    { sX: 276, sY: 139 },
    { sX: 276, sY: 164 },
    { sX: 276, sY: 139 },
  ],
  w: 34,
  h: 26,
  dX: 50,
  dY: 150,
  frame: 0,
  speed: 0,
  gravity: 0.25,
  jump: 4.6,
  radius: 18,

  draw: function () {
    let bird = this.animation[this.frame]
    ctx.drawImage(
      source,
      bird.sX,
      bird.sY,
      this.w,
      this.h,
      this.dX - this.w / 2,
      this.dY - this.h / 2,
      this.w,
      this.h
    )
  },

  update: function () {
    if (states.currentState !== 2) {
      // if the game state is getReady, bird must flap slowly
      this.period = states.currentState === states.getReadyState ? 10 : 5
      // increment the frame by 1
      this.frame += frameCount % this.period === 0 ? 1 : 0
      // frame goes from 0 to 4, the again to 0
      this.frame = this.frame % this.animation.length
    }

    if (states.currentState === 0) {
      this.dY = 150
    } else {
      this.speed += this.gravity
      this.dY += this.speed

      // collision
      if (this.dY + this.h / 2 >= canvas.height - floorGround.h) {
        this.dY = canvas.height - floorGround.h - this.h / 2
        if (states.currentState === states.gameState) {
          states.currentState = states.overState
        }
      }
    }
  },

  flap: function () {
    if (states.currentState === 1) {
      canvas.addEventListener('click', () => {
        this.speed = -this.jump
      })

      document.addEventListener('keydown', (e) => {
        if (e.keyCode === 32) {
          this.speed = -this.jump
        }
      })
    }
  },

  speedReset: function () {
    this.speed = 0
  },
}

const floorGround = {
  sX: 276,
  sY: 0,
  w: 224,
  h: 112,
  dX: 0,
  dY: canvas.height - 112,
  vX: 2,
  draw: function () {
    ctx.drawImage(
      source,
      this.sX,
      this.sY,
      this.w,
      this.h,
      this.dX,
      this.dY,
      this.w,
      this.h
    )
    ctx.drawImage(
      source,
      this.sX,
      this.sY,
      this.w,
      this.h,
      this.dX + this.w,
      this.dY,
      this.w,
      this.h
    )
  },

  update: function () {
    if (states.currentState === states.gameState) {
      this.dX = (this.dX - this.vX) % (this.w / 2)
    }
  },
}

const background = {
  sX: 0,
  sY: 0,
  w: 275,
  h: 226,
  dX: 0,
  dY: canvas.height - 226,
  draw: function () {
    ctx.drawImage(
      source,
      this.sX,
      this.sY,
      this.w,
      this.h,
      this.dX,
      this.dY,
      this.w,
      this.h
    )
    ctx.drawImage(
      source,
      this.sX,
      this.sY,
      this.w,
      this.h,
      this.dX + this.w,
      this.dY,
      this.w,
      this.h
    )
  },
}

const pipes = {
  position: [],
  w: 53,
  h: 400,
  gap: 95,
  vX: 2,
  maxYPos: -150,

  bottom: {
    sX: 503,
    sY: 0,
  },

  top: {
    sX: 553,
    sY: 0,
  },

  draw: function () {
    for (let i = 0; i < this.position.length; i++) {
      let p = this.position[i]

      let topYPos = p.y
      let botYPos = p.y + this.h + this.gap

      ctx.drawImage(
        source,
        this.top.sX,
        this.top.sY,
        this.w,
        this.h,
        p.x,
        topYPos,
        this.w,
        this.h
      )
      ctx.drawImage(
        source,
        this.bottom.sX,
        this.bottom.sY,
        this.w,
        this.h,
        p.x,
        botYPos,
        this.w,
        this.h
      )
    }
  },

  update: function () {
    if (states.currentState !== states.gameState) return
    if (frameCount % 100 === 0) {
      this.position.push({
        x: canvas.width,
        y: this.maxYPos * (Math.random() + 1),
      })
    }

    for (let i = 0; i < this.position.length; i++) {
      let p = this.position[i]

      p.x -= this.vX
      let bottomPipeY = p.y + this.h + this.gap

      // top pipe collision detection
      if (
        bird.dX + bird.radius > p.x &&
        bird.dX - bird.radius < p.x + this.w &&
        bird.dY + bird.radius > p.y &&
        bird.dY - bird.radius < p.y + this.h
      ) {
        states.currentState = 2
      }

      // bottom pipe collision detection
      if (
        bird.dX + bird.radius > p.x &&
        bird.dX - bird.radius < p.x + this.w &&
        bird.dY + bird.radius > bottomPipeY &&
        bird.dY - bird.radius < bottomPipeY + this.h
      ) {
        states.currentState = states.overState
      }

      if (p.x + this.w < 0) {
        this.position.shift()

        score.value += 1

        score.best = Math.max(score.value, score.best)
        localStorage.setItem('best', score.best)
      }
    }
  },

  reset: function () {
    this.position = []
  },
}

const score = {
  best: parseInt(localStorage.getItem('best')) || 0,
  value: 0,

  draw: function () {
    ctx.fillStyle = '#fff'
    ctx.strokeStyle = '#000'

    if (states.currentState === states.gameState) {
      ctx.lineWidth = 2
      ctx.font = '35px Teko'
      ctx.fillText(this.value, canvas.width / 2, 50)
      ctx.strokeText(this.value, canvas.width / 2, 50)
    } else if (states.currentState === states.overState) {
      ctx.font = '25px Teko'
      ctx.fillText(this.value, 225, 186)
      ctx.strokeText(this.value, 225, 186)
      ctx.fillText(this.best.toString(), 225, 228)
      ctx.strokeText(this.best.toString(), 225, 228)
    }
  },

  reset: function () {
    this.value = 0
  },
}

const getReady = {
  sX: 0,
  sY: 228,
  w: 173,
  h: 152,
  dX: canvas.width / 2 - 173 / 2,
  dY: 80,

  draw: function () {
    if (states.currentState === states.getReadyState) {
      ctx.drawImage(
        source,
        this.sX,
        this.sY,
        this.w,
        this.h,
        this.dX,
        this.dY,
        this.w,
        this.h
      )
    }
  },
}

const gameOver = {
  sX: 175,
  sY: 228,
  w: 225,
  h: 202,
  dX: canvas.width / 2 - 225 / 2,
  dY: 90,

  draw: function () {
    if (states.currentState === states.overState) {
      ctx.drawImage(
        source,
        this.sX,
        this.sY,
        this.w,
        this.h,
        this.dX,
        this.dY,
        this.w,
        this.h
      )
    }
  },
}

// draw function
function draw() {
  ctx.fillStyle = '#70c5ce'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  background.draw()
  bird.draw()
  pipes.draw()
  floorGround.draw()
  getReady.draw()
  gameOver.draw()
  score.draw()
}

//update function
function update() {
  draw()
  bird.update()
  bird.flap()
  floorGround.update()
  pipes.update()
}

// loop function
function loop() {
  update()
  frameCount++

  // call loop function 50 times per second (in average)
  requestAnimationFrame(loop)
}

loop()

function nothing(r) {
  //nothing
}
