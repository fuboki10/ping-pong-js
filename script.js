// constants
const ballSpeedX = 8; // Speed of the ball in the X direction
const ballSpeedY = 5; // Speed of the ball in the Y direction
const paddleSpeed = 8; // Speed of the paddles
const paddleWidth = 15; // Width of the paddles
const paddleHeight = 100; // Height of the paddles
const MAX_FPS = 60; // Maximum frames per second
const FRAME_INTERVAL_MS = 1000 / MAX_FPS; // Frame interval in milliseconds

// Canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state
let gameRunning = false;
let gamePaused = false;
let lastTime = 0; // For tracking time in the game loop
// Animation frame ID
let animationId;

// Game objects
const game = {
    ball: {
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: 10,
        speedX: ballSpeedX,
        speedY: ballSpeedY,
        color: '#fff'
    },
    paddle1: {
        x: 20,
        y: canvas.height / 2 - 50,
        width: paddleWidth,
        height: paddleHeight,
        speed: paddleSpeed,
        color: '#fff'
    },
    paddle2: {
        x: canvas.width - 35,
        y: canvas.height / 2 - 50,
        width: paddleWidth,
        height: paddleHeight,
        speed: paddleSpeed,
        color: '#fff'
    },
    score: {
        player1: 0,
        player2: 0
    }
};

// Input handling
const keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    // Handle game status controls
    handleGameStatusControls();
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Button event listeners
document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('pauseBtn').addEventListener('click', pauseGame);
document.getElementById('resetBtn').addEventListener('click', resetGame);

// Game functions
function startGame() {
    if (!gameRunning) {
        gameRunning = true;
        animationId = requestAnimationFrame(gameLoop);
    }
}

function pauseGame() {
    console.log('Pausing game');
    if (!gameRunning) return;
    gamePaused = true;
}

function resumeGame() {
    console.log('Resuming game');
    if (!gameRunning) return;
    gamePaused = false;
}

function togglePause() {
    if (gamePaused) {
        resumeGame();
    } else {
        pauseGame();
    }
}

function resetGame() {
    if (gameRunning) {
        gameRunning = false;
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
    }

    // Reset ball position
    game.ball.x = canvas.width / 2;
    game.ball.y = canvas.height / 2;
    game.ball.speedX = ballSpeedX * (Math.random() > 0.5 ? 1 : -1);
    game.ball.speedY = ballSpeedY * (Math.random() > 0.5 ? 1 : -1);

    // Reset paddle positions
    game.paddle1.y = canvas.height / 2 - paddleHeight / 2;
    game.paddle2.y = canvas.height / 2 - paddleHeight / 2;

    // Reset scores
    game.score.player1 = 0;
    game.score.player2 = 0;
    updateScore();

    // Clear canvas and draw initial state
    drawGame();
}

function updatePaddles() {
    // Player 1 controls (W/S keys)
    if (keys['w'] || keys['W']) {
        game.paddle1.y -= game.paddle1.speed;
    }
    if (keys['s'] || keys['S']) {
        game.paddle1.y += game.paddle1.speed;
    }

    // Player 2 controls (Arrow keys)
    if (keys['ArrowUp']) {
        game.paddle2.y -= game.paddle2.speed;
    }
    if (keys['ArrowDown']) {
        game.paddle2.y += game.paddle2.speed;
    }

    // Keep paddles within canvas bounds
    game.paddle1.y = Math.max(0, Math.min(canvas.height - game.paddle1.height, game.paddle1.y));
    game.paddle2.y = Math.max(0, Math.min(canvas.height - game.paddle2.height, game.paddle2.y));
}

function updateBall() {
    // Move ball
    game.ball.x += game.ball.speedX;
    game.ball.y += game.ball.speedY;

    // Ball collision with top/bottom walls
    if (game.ball.y - game.ball.radius <= 0 || game.ball.y + game.ball.radius >= canvas.height) {
        game.ball.speedY = -game.ball.speedY;
    }

    // Ball collision with paddles
    // Left paddle collision
    if (game.ball.x - game.ball.radius <= game.paddle1.x + game.paddle1.width &&
        game.ball.y >= game.paddle1.y &&
        game.ball.y <= game.paddle1.y + game.paddle1.height &&
        game.ball.speedX < 0) {
        game.ball.speedX = -game.ball.speedX;

        // Add some variation to ball direction based on where it hits the paddle
        const hitPos = (game.ball.y - game.paddle1.y) / game.paddle1.height;
        game.ball.speedY = (hitPos - 0.5) * 20;
    }

    // Right paddle collision
    if (game.ball.x + game.ball.radius >= game.paddle2.x &&
        game.ball.y >= game.paddle2.y &&
        game.ball.y <= game.paddle2.y + game.paddle2.height &&
        game.ball.speedX > 0) {
        game.ball.speedX = -game.ball.speedX;

        // Add some variation to ball direction
        const hitPos = (game.ball.y - game.paddle2.y) / game.paddle2.height;
        game.ball.speedY = (hitPos - 0.5) * 10;
    }

    // Ball goes off screen (scoring)
    if (game.ball.x < 0) {
        game.score.player2++;
        resetBall();
        updateScore();
    } else if (game.ball.x > canvas.width) {
        game.score.player1++;
        resetBall();
        updateScore();
    }
}

function resetBall() {
    game.ball.x = canvas.width / 2;
    game.ball.y = canvas.height / 2;
    game.ball.speedX = ballSpeedX * (Math.random() > 0.5 ? 1 : -1);
    game.ball.speedY = ballSpeedY * (Math.random() > 0.5 ? 1 : -1);
}

function updateScore() {
    document.getElementById('player1Score').textContent = game.score.player1;
    document.getElementById('player2Score').textContent = game.score.player2;
}

function drawGame() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw center line
    ctx.setLineDash([5, 15]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw paddles
    ctx.fillStyle = game.paddle1.color;
    ctx.fillRect(game.paddle1.x, game.paddle1.y, game.paddle1.width, game.paddle1.height);

    ctx.fillStyle = game.paddle2.color;
    ctx.fillRect(game.paddle2.x, game.paddle2.y, game.paddle2.width, game.paddle2.height);

    // Draw ball
    ctx.fillStyle = game.ball.color;
    ctx.beginPath();
    ctx.arc(game.ball.x, game.ball.y, game.ball.radius, 0, Math.PI * 2);
    ctx.fill();
}

function handleGameStatusControls() {
    // Pause game on Escape or 'p' key
    if (keys['Escape'] || keys['Esc'] || keys['p'] || keys['P']) {
        togglePause();
    }
    // Reset game on 'r' key
    if (keys['r'] || keys['R']) {
        resetGame();
    }

    // Start or pause the game
    if (keys['Enter'] || keys[' ']) {
        if (gameRunning) {
            resumeGame();
        } else {
            startGame();
        }
    }
}

function updateGame() {
    if (!gameRunning) return;

    updatePaddles();

    if (!gamePaused) {
        updateBall();
    }

    drawGame();
}

function gameLoop(timestamp) {
    // Control FPS
    const deltaTime = timestamp - lastTime;
    if (deltaTime < FRAME_INTERVAL_MS) {
        animationId = requestAnimationFrame(gameLoop);
        return;
    }

    // Update game state
    updateGame();

    // update the last time for FPS control
    lastTime = timestamp;

    animationId = requestAnimationFrame(gameLoop);
}

// Initialize game
function init() {
    updateScore();
    drawGame();

    // Show controls info
    console.log('Game Controls:');
    console.log('Player 1: W (up), S (down)');
    console.log('Player 2: Arrow Up, Arrow Down');
    console.log('Use the buttons to start, pause, or reset the game');
}

// Start the game when page loads
window.addEventListener('load', init);
