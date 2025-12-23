/**
 * Catch the Ball game: simple timer-based click game with high score storage.
 * Player clicks on a ball that moves to random positions. Score increases with each click.
 * Game features: 30-second timer, pause/resume, high score tracking.
 */

// Game state
let score = 0;
let timeLeft = 30;
let gameInterval = null;
let timerInterval = null;
let isPaused = false;

// ----- USER / HIGH SCORE -----
let current_User = JSON.parse(localStorage.getItem("current user"));
if (!current_User) {
    current_User = { name: "Guest", HighScoreBall: 0 };
}

// ----- UI INIT -----
document.getElementById("score").textContent = score;
document.getElementById("time").textContent = timeLeft;

document.body.insertAdjacentHTML(
    "beforeend",
    `<p>High Score: <span id="high-score">${current_User.HighScoreBall}</span></p>`
);

// ----- BUTTONS -----
document.getElementById("home-button").addEventListener("click", () => {
    window.location.href = "home.html";
});

document.getElementById("again-button").addEventListener("click", restartGame);
document.getElementById("pause-button").addEventListener("click", togglePause);

// ----- GAME CONTROL -----

/**
 * Starts the game: initializes ball movement interval and countdown timer.
 */
function startGame() {
    clearInterval(gameInterval);
    clearInterval(timerInterval);

    gameInterval = setInterval(moveBall, 1000);

    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById("time").textContent = timeLeft;

        if (timeLeft === 0) {
            endGame();
        }
    }, 1000);
}

/**
 * Ends the game, clears intervals, and updates high score if current score is higher.
 */
function endGame() {
    clearInterval(gameInterval);
    clearInterval(timerInterval);

    if (score > current_User.HighScoreBall) {
        current_User.HighScoreBall = score;
        localStorage.setItem("current user", JSON.stringify(current_User));
        document.getElementById("high-score").textContent = score;

        const users = JSON.parse(localStorage.getItem("users")) || [];
        const idx = users.findIndex(u => u.email === current_User.email);
        if (idx > -1) {
            users[idx].HighScoreBall = score;
            localStorage.setItem("users", JSON.stringify(users));
        }

        alert(`New High Score! Your final score is ${score}`);
    } else {
        alert(`Time's up! Your final score is ${score}`);
    }
}

/**
 * Resets game state (score and timer) and starts a new game.
 */
function restartGame() {
    score = 0;
    timeLeft = 30;
    document.getElementById("score").textContent = score;
    document.getElementById("time").textContent = timeLeft;
    startGame();
}

/**
 * Toggles game pause state. When paused, stops ball movement and timer.
 */
function togglePause() {
    const btn = document.getElementById("pause-button");

    if (!isPaused) {
        clearInterval(gameInterval);
        clearInterval(timerInterval);
        btn.textContent = "המשך";
        isPaused = true;
    } else {
        startGame();
        btn.textContent = "עצור";
        isPaused = false;
    }
}

// ----- BALL MOVEMENT -----

/**
 * Moves the ball to a random position within the game area.
 */
function moveBall() {
    const gameArea = document.getElementById("game-area");
    const ball = document.getElementById("ball");

    const maxX = gameArea.clientWidth - ball.clientWidth;
    const maxY = gameArea.clientHeight - ball.clientHeight;

    ball.style.left = Math.random() * maxX + "px";
    ball.style.top = Math.random() * maxY + "px";
}

// Ball click handler: increments score and provides visual feedback
document.getElementById("ball").addEventListener("click", () => {
    score++;
    document.getElementById("score").textContent = score;

    const ball = document.getElementById("ball");
    ball.style.backgroundColor = "green";
    setTimeout(() => ball.style.backgroundColor = "red", 200);
});

// Start game on page load
startGame();
