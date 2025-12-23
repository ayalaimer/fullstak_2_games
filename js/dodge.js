/**
 * Dodge the Blocks game: avoid falling blocks while tracking score and highscores.
 * Player moves left/right with arrow keys to dodge falling blocks.
 * Game features: difficulty levels, pause/resume, timer, high score tracking.
 */

// ----- DOM ELEMENTS -----
const gameArea = document.getElementById("game-area");
const player = document.getElementById("player");
const scoreSpan = document.getElementById("score");
const timeSpan = document.getElementById("time");
const highScoreSpan = document.getElementById("high-score");
const startBtn = document.getElementById("start-btn");
const pauseButton = document.getElementById("pause-button");
const difficultySelect = document.getElementById("difficulty");

// ----- GAME STATE -----
let score = 0;
let timeLeft = 30;
let isRunning = false;
let isPaused = false;

let blockInterval = null;
let timerInterval = null;
let fallIntervals = [];

let speed = 3;
let spawnRate = 1500;
const moveStep = 20;

// ----- USER + HIGH SCORE -----
let currentUser = JSON.parse(localStorage.getItem("current user")) || {
    name: "Guest",
    HighScoreDodge: 0
};

let highScore = currentUser.HighScoreDodge || 0;
highScoreSpan.textContent = highScore;
scoreSpan.textContent = score;
timeSpan.textContent = timeLeft;

// ----- HELPER FUNCTIONS -----

/**
 * Stops all game intervals (block spawning, timer, and falling blocks).
 */
function stopAllIntervals() {
    clearInterval(blockInterval);
    clearInterval(timerInterval);
    fallIntervals.forEach(clearInterval);
    fallIntervals = [];
}

/**
 * Starts the game countdown timer. Ends game when time reaches 0.
 */
function startTimer() {
    timerInterval = setInterval(() => {
        if (!isRunning || isPaused) return;

        timeLeft--;
        timeSpan.textContent = timeLeft;
        if (timeLeft === 0) endGame();
    }, 1000);
}

// ----- PLAYER MOVEMENT -----
// Handles arrow key input to move player left/right within game area bounds
document.addEventListener("keydown", e => {
    if (!isRunning || isPaused) return;

    const left = player.offsetLeft;
    const maxLeft = gameArea.clientWidth - player.offsetWidth;

    if (e.key === "ArrowLeft")
        player.style.left = Math.max(0, left - moveStep) + "px";

    if (e.key === "ArrowRight")
        player.style.left = Math.min(maxLeft, left + moveStep) + "px";
});

// ----- BUTTONS -----
startBtn.onclick = startGame;
pauseButton.onclick = togglePause;

// ----- GAME CONTROL -----

/**
 * Initializes and starts the game: resets state, applies difficulty, starts timers and block spawning.
 */
function startGame() {
    resetGame();
    applyDifficulty();

    isRunning = true;
    isPaused = false;
    pauseButton.textContent = "עצור";

    blockInterval = setInterval(createBlock, spawnRate);
    startTimer();
}

// ----- DIFFICULTY -----
const DIFFICULTY = {
    easy: { speed: 3, spawn: 1600 },
    medium: { speed: 5, spawn: 1100 },
    hard: { speed: 7, spawn: 800 }
};

/**
 * Applies difficulty settings (speed and spawn rate) based on selected difficulty level.
 */
function applyDifficulty() {
    const d = DIFFICULTY[difficultySelect.value];
    speed = d.speed;
    spawnRate = d.spawn;
}

// ----- BLOCK MANAGEMENT -----

/**
 * Creates a new falling block at a random horizontal position.
 * Block falls down and increments score if it reaches bottom without collision.
 */
function createBlock() {
    const block = document.createElement("div");
    block.className = "block";

    block.style.left =
        Math.random() * (gameArea.clientWidth - 40) + "px";
    block.style.top = "0px";

    gameArea.appendChild(block);

    const fall = setInterval(() => {
        if (!isRunning || isPaused) return;

        const top = block.offsetTop + speed;
        block.style.top = top + "px";

        if (checkCollision(block)) return endGame();

        if (top > gameArea.clientHeight) {
            clearInterval(fall);
            fallIntervals = fallIntervals.filter(i => i !== fall);
            block.remove();

            score++;
            scoreSpan.textContent = score;
        }
    }, 20);

    fallIntervals.push(fall);
}

// ----- COLLISION DETECTION -----

/**
 * Checks if a block collides with the player.
 * @param {HTMLElement} block - The block element to check collision with.
 * @returns {boolean} True if collision detected, false otherwise.
 */
function checkCollision(block) {
    const p = player.getBoundingClientRect();
    const b = block.getBoundingClientRect();

    return !(
        p.right < b.left ||
        p.left > b.right ||
        p.bottom < b.top ||
        p.top > b.bottom
    );
}

// ----- PAUSE / RESUME -----

/**
 * Toggles game pause state. When paused, stops timer and block movement.
 */
function togglePause() {
    if (!isRunning) return;

    isPaused = !isPaused;
    pauseButton.textContent = isPaused ? "המשך" : "עצור";

    if (!isPaused) startTimer();
    else clearInterval(timerInterval);
}

// ----- END GAME -----

/**
 * Ends the game, stops all intervals, and updates high score if current score is higher.
 */
function endGame() {
    if (!isRunning) return;

    isRunning = false;
    isPaused = false;
    pauseButton.textContent = "עצור";

    stopAllIntervals();

    if (score > highScore) {
        highScore = score;
        currentUser.HighScoreDodge = score;

        localStorage.setItem("current user", JSON.stringify(currentUser));
        highScoreSpan.textContent = score;

        const users = JSON.parse(localStorage.getItem("users")) || [];
        const idx = users.findIndex(u => u.email === currentUser.email);
        if (idx > -1) {
            users[idx].HighScoreDodge = score;
            localStorage.setItem("users", JSON.stringify(users));
        }

        alert(`New High Score! Score: ${score}`);
    } else {
        alert(`Game Over! Score: ${score}`);
    }
}

// ----- RESET -----

/**
 * Resets game state: clears score, timer, removes all blocks, and repositions player.
 */
function resetGame() {
    stopAllIntervals();

    score = 0;
    timeLeft = 30;
    scoreSpan.textContent = score;
    timeSpan.textContent = timeLeft;

    document.querySelectorAll(".block").forEach(b => b.remove());

    player.style.left =
        gameArea.clientWidth / 2 - player.offsetWidth / 2 + "px";
}

// ----- NAVIGATION -----

/**
 * Navigates back to the home page.
 */
function goHome() {
    window.location.href = "home.html";
}
